import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: activeEnrollments, error: enrollmentError } = await supabase
      .from('workflow_enrollments')
      .select(`
        *,
        automation_workflows (
          id,
          name,
          workflow_data,
          site_id
        ),
        contacts (
          id,
          email,
          first_name,
          last_name,
          metadata
        )
      `)
      .eq('status', 'active');

    if (enrollmentError) throw enrollmentError;

    console.log(`Found ${activeEnrollments?.length || 0} active enrollments to process`);

    for (const enrollment of activeEnrollments || []) {
      try {
        await processEnrollment(supabase, enrollment);
      } catch (err) {
        console.error(`Error processing enrollment ${enrollment.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: activeEnrollments?.length || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Workflow processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processEnrollment(supabase: any, enrollment: any) {
  const workflow = enrollment.automation_workflows;
  const contact = enrollment.contacts;
  const steps = workflow.workflow_data?.steps || [];

  if (enrollment.current_step >= steps.length) {
    await supabase
      .from('workflow_enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);

    console.log(`Enrollment ${enrollment.id} completed`);
    return;
  }

  const currentStep = steps[enrollment.current_step];

  const { data: lastExecution } = await supabase
    .from('workflow_step_executions')
    .select('*')
    .eq('enrollment_id', enrollment.id)
    .eq('step_index', enrollment.current_step)
    .maybeSingle();

  if (lastExecution) {
    if (lastExecution.status === 'executed') {
      if (currentStep.type === 'wait') {
        const waitTime = calculateWaitTime(currentStep);
        const executedAt = new Date(lastExecution.executed_at);
        const now = new Date();

        if (now.getTime() - executedAt.getTime() >= waitTime) {
          await supabase
            .from('workflow_enrollments')
            .update({ current_step: enrollment.current_step + 1 })
            .eq('id', enrollment.id);

          console.log(`Enrollment ${enrollment.id} moved to step ${enrollment.current_step + 1}`);
        }
      } else {
        await supabase
          .from('workflow_enrollments')
          .update({ current_step: enrollment.current_step + 1 })
          .eq('id', enrollment.id);
      }
    }
    return;
  }

  await executeStep(supabase, enrollment, currentStep, contact, workflow);
}

async function executeStep(supabase: any, enrollment: any, step: any, contact: any, workflow: any) {
  console.log(`Executing step ${enrollment.current_step} (${step.type}) for enrollment ${enrollment.id}`);

  try {
    let executionData: any = {};

    switch (step.type) {
      case 'send_email':
        executionData = await executeSendEmail(supabase, step, contact, workflow);
        break;

      case 'wait':
        executionData = { wait_until: new Date(Date.now() + calculateWaitTime(step)).toISOString() };
        break;

      case 'add_tag':
        executionData = await executeAddTag(supabase, step, contact);
        break;

      case 'remove_tag':
        executionData = await executeRemoveTag(supabase, step, contact);
        break;

      case 'conditional':
        executionData = await executeConditional(supabase, step, contact, enrollment);
        break;

      case 'webhook':
        executionData = await executeWebhook(step, contact);
        break;

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }

    await supabase
      .from('workflow_step_executions')
      .insert({
        enrollment_id: enrollment.id,
        workflow_id: workflow.id,
        step_index: enrollment.current_step,
        step_type: step.type,
        status: 'executed',
        executed_at: new Date().toISOString(),
        execution_data: executionData,
      });

    console.log(`Step ${enrollment.current_step} executed successfully`);
  } catch (error: any) {
    console.error(`Step execution failed:`, error);

    await supabase
      .from('workflow_step_executions')
      .insert({
        enrollment_id: enrollment.id,
        workflow_id: workflow.id,
        step_index: enrollment.current_step,
        step_type: step.type,
        status: 'failed',
        executed_at: new Date().toISOString(),
        error_message: error.message,
      });

    await supabase
      .from('workflow_enrollments')
      .update({
        status: 'failed',
        stopped_at: new Date().toISOString(),
        stop_reason: error.message,
      })
      .eq('id', enrollment.id);
  }
}

async function executeSendEmail(supabase: any, step: any, contact: any, workflow: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const subject = replaceVariables(step.config?.subject || '', contact);
  const content = replaceVariables(step.config?.content || '', contact);

  const emailData = {
    from: step.config?.from || 'noreply@resend.dev',
    to: [contact.email],
    subject,
    html: content,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Email sending failed: ${JSON.stringify(error)}`);
  }

  const result = await response.json();

  await supabase.from('email_logs').insert({
    site_id: workflow.site_id,
    recipient: contact.email,
    subject,
    status: 'sent',
    provider: 'resend',
    provider_message_id: result.id,
    metadata: {
      workflow_id: workflow.id,
      contact_id: contact.id,
    },
  });

  return { email_id: result.id, sent_at: new Date().toISOString() };
}

async function executeAddTag(supabase: any, step: any, contact: any) {
  const tagName = step.config?.tag_name;

  if (!tagName) {
    throw new Error('Tag name not specified');
  }

  const currentTags = contact.metadata?.tags || [];
  if (!currentTags.includes(tagName)) {
    currentTags.push(tagName);

    await supabase
      .from('contacts')
      .update({
        metadata: {
          ...contact.metadata,
          tags: currentTags,
        },
      })
      .eq('id', contact.id);
  }

  return { tag_added: tagName };
}

async function executeRemoveTag(supabase: any, step: any, contact: any) {
  const tagName = step.config?.tag_name;

  if (!tagName) {
    throw new Error('Tag name not specified');
  }

  const currentTags = contact.metadata?.tags || [];
  const filteredTags = currentTags.filter((tag: string) => tag !== tagName);

  await supabase
    .from('contacts')
    .update({
      metadata: {
        ...contact.metadata,
        tags: filteredTags,
      },
    })
    .eq('id', contact.id);

  return { tag_removed: tagName };
}

async function executeConditional(supabase: any, step: any, contact: any, enrollment: any) {
  const condition = step.config?.condition;
  const conditionMet = evaluateCondition(condition, contact);

  if (conditionMet && step.config?.yes_branch) {
    await supabase
      .from('workflow_enrollments')
      .update({ current_step: step.config.yes_branch })
      .eq('id', enrollment.id);
  } else if (!conditionMet && step.config?.no_branch) {
    await supabase
      .from('workflow_enrollments')
      .update({ current_step: step.config.no_branch })
      .eq('id', enrollment.id);
  }

  return { condition_met: conditionMet };
}

async function executeWebhook(step: any, contact: any) {
  const webhookUrl = step.config?.webhook_url;

  if (!webhookUrl) {
    throw new Error('Webhook URL not specified');
  }

  const payload = {
    contact: {
      id: contact.id,
      email: contact.email,
      first_name: contact.first_name,
      last_name: contact.last_name,
    },
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return {
    webhook_called: true,
    status_code: response.status,
  };
}

function calculateWaitTime(step: any): number {
  const days = step.config?.wait_days || step.wait_days || 0;
  const hours = step.config?.wait_hours || step.wait_hours || 0;

  return (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
}

function replaceVariables(text: string, contact: any): string {
  return text
    .replace(/{first_name}/g, contact.first_name || '')
    .replace(/{last_name}/g, contact.last_name || '')
    .replace(/{email}/g, contact.email || '')
    .replace(/{full_name}/g, `${contact.first_name || ''} ${contact.last_name || ''}`.trim());
}

function evaluateCondition(condition: any, contact: any): boolean {
  if (!condition) return true;

  const field = condition.field;
  const operator = condition.operator;
  const value = condition.value;

  const contactValue = getNestedValue(contact, field);

  switch (operator) {
    case 'equals':
      return contactValue === value;
    case 'not_equals':
      return contactValue !== value;
    case 'contains':
      return String(contactValue).includes(value);
    case 'not_contains':
      return !String(contactValue).includes(value);
    case 'greater_than':
      return Number(contactValue) > Number(value);
    case 'less_than':
      return Number(contactValue) < Number(value);
    case 'has_tag':
      return (contact.metadata?.tags || []).includes(value);
    case 'not_has_tag':
      return !(contact.metadata?.tags || []).includes(value);
    default:
      return true;
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
