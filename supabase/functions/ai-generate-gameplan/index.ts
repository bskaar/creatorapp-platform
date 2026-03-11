import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  callAI,
  mapPlanNameToTier,
  type SubscriptionTier,
  type AIResponse
} from "../_shared/ai-config.ts";
import { assembleContext } from "../_shared/context-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SOFT_LIMIT_OVERAGE = 0.1;

const GAMEPLAN_SYSTEM_PROMPT = `You are an AI Co-Founder specialized in creating actionable business gameplans for creators and digital entrepreneurs using the CreatorApp platform.

**Your Scope:**
You ONLY generate gameplans for topics related to:
- Online courses and digital product launches
- Sales funnels and landing page strategies
- Email marketing and audience building
- Creator business growth and monetization
- Content strategy and community building
- Using CreatorApp platform features

If the requested goal is unrelated to a creator business, return a JSON gameplan with a single task politely redirecting the user to focus on their creator business goals.

**Ethics:**
- Never generate plans involving spam, deceptive marketing, fake reviews, or illegal activities
- All tactics must be ethical and compliant with standard marketing regulations
- Do not reference or access other users' data or businesses

When given a business idea or goal, create a structured action plan with 5-15 specific tasks. Each task should be:
- Concrete and actionable (not vague)
- Ordered logically (dependencies considered)
- Categorized by phase (Foundation, Growth, or Optimization)
- Assigned a priority (high, medium, or low)
- Given a realistic time estimate

Return ONLY a valid JSON object with this structure:
{
  "title": "Short descriptive title for the gameplan",
  "description": "2-3 sentence overview of what this plan will achieve",
  "tasks": [
    {
      "description": "Specific, actionable task description",
      "phase": "Foundation" | "Growth" | "Optimization",
      "priority": "high" | "medium" | "low",
      "estimatedTime": "e.g., 2 hours, 1 day, 1 week",
      "order": 1
    }
  ]
}

**Phase Definitions:**
- Foundation: Setting up core infrastructure, initial setup, research
- Growth: Building audience, creating content, launching products
- Optimization: Improving conversions, scaling systems, automation

**Priority Guidelines:**
- High: Critical path items, must be done first
- Medium: Important but not blocking other tasks
- Low: Nice to have, can be done later

**Time Estimates:**
- Be realistic based on typical creator workloads
- Consider that most creators work part-time on their business
- Range from "30 minutes" to "2 weeks" per task

Make tasks specific enough that the user knows exactly what to do. For example:
- Good: "Create a lead magnet PDF with 5 actionable tips for your audience"
- Bad: "Build your email list"`;

interface UsageCheckResult {
  allowed: boolean;
  isWarning: boolean;
  isBlocked: boolean;
  sessionsUsed: number;
  maxSessions: number | null;
  softMaxSessions: number | null;
  isUnlimited: boolean;
  message: string;
  planName: string;
}

async function checkAIUsageLimits(
  supabase: ReturnType<typeof createClient>,
  siteId: string,
  planId: string | null
): Promise<UsageCheckResult> {
  const { data: planData } = await supabase
    .from('subscription_plans')
    .select('display_name, limits')
    .eq('id', planId)
    .maybeSingle();

  let maxSessions: number | null = 200;
  let planName = 'Starter';

  if (planData) {
    planName = planData.display_name;
    const limits = planData.limits as Record<string, unknown>;
    if (limits && 'max_ai_sessions_per_month' in limits) {
      maxSessions = limits.max_ai_sessions_per_month as number | null;
    }
  }

  const isUnlimited = maxSessions === null;

  if (isUnlimited) {
    return {
      allowed: true,
      isWarning: false,
      isBlocked: false,
      sessionsUsed: 0,
      maxSessions: null,
      softMaxSessions: null,
      isUnlimited: true,
      message: '',
      planName,
    };
  }

  const { data: usageData } = await supabase.rpc('get_ai_usage_in_current_cycle', { site_uuid: siteId });
  const sessionsUsed = usageData ?? 0;

  const softMaxSessions = Math.ceil(maxSessions * (1 + SOFT_LIMIT_OVERAGE));
  const isOverBase = sessionsUsed >= maxSessions;
  const isOverSoftLimit = sessionsUsed >= softMaxSessions;

  if (isOverSoftLimit) {
    return {
      allowed: false,
      isWarning: false,
      isBlocked: true,
      sessionsUsed,
      maxSessions,
      softMaxSessions,
      isUnlimited: false,
      message: `You've exceeded your monthly AI session limit (${softMaxSessions} sessions). Upgrade your plan to continue using AI features.`,
      planName,
    };
  }

  if (isOverBase) {
    return {
      allowed: true,
      isWarning: true,
      isBlocked: false,
      sessionsUsed,
      maxSessions,
      softMaxSessions,
      isUnlimited: false,
      message: `You've used ${sessionsUsed} of ${maxSessions} AI sessions this month. You have ${softMaxSessions - sessionsUsed} sessions remaining before AI features are paused.`,
      planName,
    };
  }

  return {
    allowed: true,
    isWarning: false,
    isBlocked: false,
    sessionsUsed,
    maxSessions,
    softMaxSessions,
    isUnlimited: false,
    message: '',
    planName,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const startTime = Date.now();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { goal, siteId, conversationId } = await req.json();

    if (!goal || !siteId) {
      throw new Error("Missing required fields");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: siteOwnership } = await supabase
      .from('sites')
      .select('id, platform_subscription_plan_id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!siteOwnership) {
      return new Response(JSON.stringify({ error: "Forbidden: site not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const usageCheck = await checkAIUsageLimits(supabase, siteId, siteOwnership.platform_subscription_plan_id);

    if (!usageCheck.allowed) {
      return new Response(JSON.stringify({
        error: usageCheck.message,
        limitReached: true,
        usageBlocked: true,
        sessionsUsed: usageCheck.sessionsUsed,
        maxSessions: usageCheck.maxSessions,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tier: SubscriptionTier = mapPlanNameToTier(usageCheck.planName);

    const assembledContext = await assembleContext(supabase, siteId, user.id, tier);
    const contextInfo = assembledContext.systemContext;

    const userPrompt = `Create a detailed gameplan for this goal:\n\n${goal}${contextInfo}`;

    const aiResponse: AIResponse = await callAI(
      GAMEPLAN_SYSTEM_PROMPT,
      [{ role: "user", content: userPrompt }],
      'gameplan',
      tier,
      { maxTokens: 3000 }
    );

    const latencyMs = Date.now() - startTime;

    const generatedText = aiResponse.content.trim();

    let gameplanData;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gameplanData = JSON.parse(jsonMatch[0]);
      } else {
        gameplanData = JSON.parse(generatedText);
      }
    } catch (e) {
      console.error("Failed to parse gameplan:", generatedText);
      throw new Error("Failed to parse gameplan from AI response");
    }

    const { data: gameplan, error: gameplanError } = await supabase
      .from('ai_gameplans')
      .insert({
        site_id: siteId,
        user_id: user.id,
        conversation_id: conversationId || null,
        title: gameplanData.title,
        description: gameplanData.description,
        status: 'active',
        progress_percentage: 0,
      })
      .select()
      .single();

    if (gameplanError) throw gameplanError;

    const tasksToInsert = gameplanData.tasks.map((task: Record<string, unknown>) => ({
      gameplan_id: gameplan.id,
      description: task.description,
      phase: task.phase,
      priority: task.priority,
      estimated_time: task.estimatedTime,
      order_index: task.order,
      status: 'pending',
    }));

    const { error: tasksError } = await supabase
      .from('ai_task_items')
      .insert(tasksToInsert);

    if (tasksError) throw tasksError;

    await supabase
      .from('ai_usage_tracking')
      .insert({
        site_id: siteId,
        user_id: user.id,
        request_type: 'gameplan',
        model_used: aiResponse.model,
        model_version: aiResponse.model,
        tokens_used: aiResponse.usage.total_tokens,
        input_tokens: aiResponse.usage.input_tokens,
        output_tokens: aiResponse.usage.output_tokens,
        cost_cents: aiResponse.estimatedCostCents,
        provider: aiResponse.provider,
        task_type: 'gameplan',
        tier_at_request: tier,
        latency_ms: latencyMs,
      });

    return new Response(
      JSON.stringify({
        gameplan: {
          id: gameplan.id,
          title: gameplan.title,
          description: gameplan.description,
          taskCount: tasksToInsert.length,
        },
        success: true,
        usageWarning: usageCheck.isWarning,
        usageMessage: usageCheck.isWarning ? usageCheck.message : null,
        sessionsUsed: usageCheck.sessionsUsed + 1,
        maxSessions: usageCheck.maxSessions,
        model: aiResponse.model,
        provider: aiResponse.provider,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Gameplan generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
