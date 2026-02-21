import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CREATOR_ECONOMY_KNOWLEDGE = `You are an AI Co-Founder and Marketing Coach specialized in the creator economy and digital business. Your expertise includes:

**Core Frameworks & Strategies:**
- Russell Brunson's frameworks: Value Ladder, Attractive Character, Hook-Story-Offer
- Dream100 Strategy for audience building
- Perfect Webinar formula for selling
- Product Launch formulas and sequences
- Funnel optimization and conversion psychology

**Course & Product Creation:**
- Validating product ideas with minimum viable offers
- Creating compelling course outlines and curriculum
- Pricing strategies (tripwire, core offer, high-ticket)
- Packaging knowledge into scalable digital products

**Email Marketing:**
- Welcome sequences that build trust
- Nurture campaigns for relationship building
- Sales sequences using soap opera sequences
- Segmentation strategies based on behavior

**Lead Generation & Traffic:**
- Organic content strategies (value-first approach)
- Paid advertising fundamentals (retargeting, LTV focus)
- Community building tactics
- Partnership and collaboration strategies

**Funnel Strategy:**
- Lead magnet funnel design
- Webinar funnel optimization
- Product launch funnel sequences
- Tripwire to upsell sequences

**Your Communication Style:**
- Always provide named frameworks when applicable
- Structure responses with clear headings and numbered lists
- Include specific tactics with timeframes
- Explain WHY strategies work (educational approach)
- End with actionable "Next Steps"
- Use bold text for emphasis on key concepts

**Response Format:**
When users ask for help, provide detailed, educational responses that:
1. Name the framework or strategy you're using
2. Break down the approach into specific steps
3. Include time estimates or frequency recommendations
4. Explain the psychology or reason behind the tactic
5. Provide concrete examples when relevant
6. End with immediate action steps`;

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

    const { message, conversationId, siteId } = await req.json();

    if (!message || !siteId) {
      throw new Error("Missing required fields");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: siteOwnership } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!siteOwnership) {
      return new Response(JSON.stringify({ error: "Forbidden: site not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("Anthropic API key not configured");
    }

    let currentConversationId = conversationId;
    let conversationHistory: Array<{ role: string; content: string }> = [];

    if (!currentConversationId) {
      const firstWords = message.split(' ').slice(0, 6).join(' ');
      const title = firstWords.length > 50 ? firstWords.substring(0, 50) + '...' : firstWords;

      const { data: newConversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          site_id: siteId,
          user_id: user.id,
          title: title,
          status: 'active',
        })
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = newConversation.id;
    } else {
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('id', currentConversationId)
        .eq('user_id', user.id)
        .eq('site_id', siteId)
        .maybeSingle();

      if (!conversation) {
        return new Response(JSON.stringify({ error: "Forbidden: conversation not found or access denied" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: messages } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (messages) {
        conversationHistory = messages;
      }
    }

    const { data: siteData } = await supabase
      .from('sites')
      .select('name, industry, onboarding_data')
      .eq('id', siteId)
      .single();

    let contextInfo = '';
    if (siteData) {
      contextInfo = `\n\nUser's Business Context:
- Business Name: ${siteData.name || 'Not set'}
- Industry: ${siteData.industry || 'General'}`;

      if (siteData.onboarding_data) {
        const onboarding = siteData.onboarding_data as any;
        if (onboarding.targetAudience) {
          contextInfo += `\n- Target Audience: ${onboarding.targetAudience}`;
        }
        if (onboarding.businessGoals) {
          contextInfo += `\n- Business Goals: ${onboarding.businessGoals}`;
        }
      }
    }

    await supabase
      .from('ai_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message,
      });

    const claudeMessages = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    claudeMessages.push({
      role: 'user',
      content: message,
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        temperature: 0.7,
        system: CREATOR_ECONOMY_KNOWLEDGE + contextInfo,
        messages: claudeMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || "";

    const { data: savedMessage } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: assistantMessage,
        metadata: {
          model: 'claude-sonnet-4-5-20250929',
          tokens: data.usage?.output_tokens || 0,
        },
      })
      .select()
      .single();

    await supabase
      .from('ai_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', currentConversationId);

    await supabase
      .from('ai_usage_tracking')
      .insert({
        site_id: siteId,
        user_id: user.id,
        request_type: 'chat',
        model_used: 'sonnet',
        tokens_used: data.usage?.total_tokens || 0,
        cost_cents: Math.ceil((data.usage?.total_tokens || 0) * 0.003),
      });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationId: currentConversationId,
        messageId: savedMessage?.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("AI Coach Chat error:", error);
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
