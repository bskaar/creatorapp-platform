import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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

    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('display_name')
      .eq('id', siteOwnership.platform_subscription_plan_id)
      .maybeSingle();

    const planName = planData?.display_name || 'Launch';
    let maxRequestsPerDay = 50;
    if (planName === 'Pro') maxRequestsPerDay = 500;
    else if (planName === 'Scale') maxRequestsPerDay = 999999;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: usageToday } = await supabase
      .from('ai_usage_tracking')
      .select('id', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if ((usageToday || 0) >= maxRequestsPerDay) {
      return new Response(JSON.stringify({
        error: `Daily AI request limit reached (${maxRequestsPerDay} requests on ${planName} plan). Upgrade your plan for more requests.`,
        limitReached: true,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const { data: siteData } = await supabase
      .from('sites')
      .select('name, industry, onboarding_data')
      .eq('id', siteId)
      .single();

    let contextInfo = '';
    if (siteData) {
      contextInfo = `\n\nBusiness Context:
- Business: ${siteData.name || 'Creator business'}
- Industry: ${siteData.industry || 'General'}`;

      if (siteData.onboarding_data) {
        const onboarding = siteData.onboarding_data as any;
        if (onboarding.targetAudience) {
          contextInfo += `\n- Target Audience: ${onboarding.targetAudience}`;
        }
      }
    }

    const userPrompt = `Create a detailed gameplan for this goal:\n\n${goal}${contextInfo}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 3000,
        temperature: 0.7,
        system: GAMEPLAN_SYSTEM_PROMPT,
        messages: [
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    const generatedText = data.content[0]?.text?.trim() || "";

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

    const tasksToInsert = gameplanData.tasks.map((task: any) => ({
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
        model_used: 'sonnet',
        tokens_used: data.usage?.total_tokens || 0,
        cost_cents: Math.ceil((data.usage?.total_tokens || 0) * 0.003),
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
