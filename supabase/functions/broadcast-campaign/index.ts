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
    const { campaign_id, contact_ids } = await req.json();

    if (!campaign_id) {
      return new Response(
        JSON.stringify({ error: 'campaign_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'contact_ids array is required and must not be empty' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .maybeSingle();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, email, first_name, last_name, metadata')
      .eq('site_id', campaign.site_id)
      .in('id', contact_ids)
      .eq('status', 'active');

    if (contactsError) throw contactsError;

    console.log(`Broadcasting campaign ${campaign_id} to ${contacts?.length || 0} contacts`);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: 'Email service not configured',
          info: 'RESEND_API_KEY environment variable is required',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const contact of contacts || []) {
      try {
        const personalizedSubject = replaceVariables(campaign.subject, contact);

        let contentHtml = '';
        if (typeof campaign.content === 'string') {
          contentHtml = campaign.content;
        } else if (campaign.content && typeof campaign.content === 'object') {
          contentHtml = campaign.content.html || JSON.stringify(campaign.content);
        }

        const personalizedContent = replaceVariables(contentHtml, contact);

        const emailData = {
          from: campaign.from_email || 'noreply@resend.dev',
          to: [contact.email],
          subject: personalizedSubject,
          html: personalizedContent,
          tags: [
            { name: 'campaign_id', value: campaign_id },
            { name: 'site_id', value: campaign.site_id },
          ],
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
          console.error(`Failed to send to ${contact.email}:`, error);
          failedCount++;
          errors.push(`${contact.email}: ${JSON.stringify(error)}`);
          continue;
        }

        const result = await response.json();

        await supabase.from('email_logs').insert({
          site_id: campaign.site_id,
          campaign_id: campaign_id,
          recipient: contact.email,
          subject: personalizedSubject,
          status: 'sent',
          provider: 'resend',
          provider_message_id: result.id,
          metadata: {
            contact_id: contact.id,
          },
        });

        sentCount++;

        if (sentCount % 10 === 0) {
          console.log(`Sent ${sentCount} emails...`);
        }
      } catch (error: any) {
        console.error(`Error sending to ${contact.email}:`, error);
        failedCount++;
        errors.push(`${contact.email}: ${error.message}`);
      }
    }

    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_count: sentCount,
        recipients_count: contact_ids.length,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaign_id);

    console.log(`Campaign ${campaign_id} completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id,
        sentCount,
        failedCount,
        errors: errors.slice(0, 10),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Broadcast error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function replaceVariables(text: string, contact: any): string {
  if (!text) return '';

  return text
    .replace(/{first_name}/g, contact.first_name || '')
    .replace(/{last_name}/g, contact.last_name || '')
    .replace(/{email}/g, contact.email || '')
    .replace(/{full_name}/g, `${contact.first_name || ''} ${contact.last_name || ''}`.trim())
    .replace(/{company}/g, contact.metadata?.company || '');
}
