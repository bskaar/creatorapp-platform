import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  callAI,
  mapPlanNameToTier,
  type SubscriptionTier,
  type AIResponse
} from "../_shared/ai-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  templateId: string;
  businessDescription: string;
  industry: string;
  siteName: string;
  siteId?: string;
  tone?: string;
  targetAudience?: string;
  painPoints?: string[];
  desiredOutcomes?: string[];
  uniqueValue?: string;
  regenerateSection?: string;
  preservePlaceholders?: boolean;
}

type ToneType = 'professional' | 'friendly' | 'authoritative' | 'conversational' | 'luxury' | 'energetic' | 'warm' | 'educational';

const toneDescriptions: Record<ToneType, string> = {
  professional: "Use formal, polished language that conveys expertise and credibility. Maintain a businesslike demeanor while being clear and direct.",
  friendly: "Use warm, approachable language that feels like advice from a trusted friend. Be conversational but not too casual.",
  authoritative: "Use confident, expert language that establishes you as a thought leader. Back claims with specifics and speak with certainty.",
  conversational: "Use casual, relatable language as if speaking to a friend. Include contractions and natural speech patterns.",
  luxury: "Use sophisticated, refined language that conveys exclusivity and premium quality. Emphasize craftsmanship and attention to detail.",
  energetic: "Use dynamic, exciting language that creates momentum and enthusiasm. Include action words and create a sense of urgency.",
  warm: "Use empathetic, caring language that creates emotional connection. Show understanding and support.",
  educational: "Use clear, instructive language that teaches and guides. Break down complex topics into digestible pieces."
};

const industryContexts: Record<string, string> = {
  coaching: "Focus on transformation, personal growth, and achieving potential. Emphasize the relationship between coach and client.",
  consulting: "Highlight strategic value, ROI, and measurable outcomes. Speak to business challenges and solutions.",
  fitness: "Emphasize results, health transformation, and sustainable lifestyle changes. Use motivating, action-oriented language.",
  business: "Focus on growth, revenue, efficiency, and competitive advantage. Use metrics and success stories.",
  creative: "Celebrate artistic vision, unique expression, and creative freedom. Use vivid, imaginative language.",
  technology: "Highlight innovation, efficiency, and cutting-edge solutions. Balance technical credibility with accessibility.",
  education: "Focus on learning outcomes, skill development, and knowledge acquisition. Use clear, instructive language.",
  ecommerce: "Emphasize product quality, customer experience, and value. Create desire and urgency appropriately.",
  agency: "Showcase expertise, results, and partnership approach. Emphasize strategic value and ROI.",
  membership: "Focus on community, belonging, and ongoing value. Highlight connection and shared goals.",
  health: "Emphasize wellbeing, transformation, and sustainable results. Use empowering, supportive language.",
  general: "Use clear, benefit-focused language that adapts to the specific business context."
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const startTime = Date.now();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      templateId,
      businessDescription,
      industry,
      siteName,
      siteId,
      tone = "professional",
      targetAudience,
      painPoints,
      desiredOutcomes,
      uniqueValue,
      regenerateSection,
      preservePlaceholders = false
    }: GenerateRequest = await req.json();

    if (!templateId || !businessDescription) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let tier: SubscriptionTier = 'starter';
    let userId: string | null = null;

    if (siteId) {
      const { data: siteData } = await supabase
        .from('sites')
        .select('user_id, platform_subscription_plan_id, subscription_plans(display_name)')
        .eq('id', siteId)
        .maybeSingle();

      if (siteData) {
        userId = siteData.user_id;
        if (siteData.subscription_plans) {
          const planData = siteData.subscription_plans as { display_name: string };
          tier = mapPlanNameToTier(planData.display_name);
        }
      }
    }

    const { data: template, error: templateError } = await supabase
      .from("funnel_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({
          pages: template.pages_config,
          emailSequences: template.email_sequences_config,
          generated: false,
          message: "AI generation not available - using template defaults"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const industryLabels: Record<string, string> = {
      fitness: "Fitness & Health",
      business: "Business & Marketing",
      creative: "Creative & Arts",
      technology: "Technology",
      education: "Education",
      coaching: "Coaching & Personal Development",
      consulting: "Consulting & Professional Services",
      ecommerce: "E-commerce & Retail",
      agency: "Digital Agency & Marketing Services",
      membership: "Membership & Community",
      health: "Health & Wellness",
      general: "General"
    };

    const toneInstruction = toneDescriptions[tone as ToneType] || toneDescriptions.professional;
    const industryContext = industryContexts[industry] || industryContexts.general;
    const templateContext = template.ai_prompt_context || "";
    const placeholderMap = template.placeholder_map || {};

    let audienceSection = "";
    if (targetAudience || painPoints?.length || desiredOutcomes?.length || uniqueValue) {
      audienceSection = `
TARGET AUDIENCE DETAILS:
${targetAudience ? `- Target Audience: ${targetAudience}` : ""}
${painPoints?.length ? `- Pain Points They Experience:\n  ${painPoints.map(p => `* ${p}`).join("\n  ")}` : ""}
${desiredOutcomes?.length ? `- Outcomes They Desire:\n  ${desiredOutcomes.map(o => `* ${o}`).join("\n  ")}` : ""}
${uniqueValue ? `- Unique Value Proposition: ${uniqueValue}` : ""}
`;
    }

    let sectionInstruction = "";
    if (regenerateSection) {
      sectionInstruction = `
IMPORTANT: Only regenerate content for the section/block with type "${regenerateSection}". Keep all other content exactly as provided.
`;
    }

    let placeholderInstruction = "";
    if (preservePlaceholders) {
      placeholderInstruction = `
PLACEHOLDER MODE: Keep all placeholder text (text in [brackets]) intact. Only add suggested content as comments or alternative text that the user can choose to use.
`;
    } else {
      placeholderInstruction = `
PLACEHOLDER REPLACEMENT: Replace all placeholder text with specific, relevant content. Here are the placeholders used in this template and what they represent:
${Object.entries(placeholderMap).map(([key, desc]) => `- ${key}: ${desc}`).join("\n")}
`;
    }

    const prompt = `You are an expert copywriter helping a creator build their online business. Generate personalized marketing copy for their funnel.

BUSINESS INFORMATION:
- Business Name: ${siteName}
- Industry: ${industryLabels[industry] || industry}
- Description: ${businessDescription}
- Funnel Type: ${template.name}
${audienceSection}

TONE & STYLE:
${toneInstruction}

INDUSTRY CONTEXT:
${industryContext}

${templateContext ? `TEMPLATE-SPECIFIC GUIDANCE:\n${templateContext}\n` : ""}

${placeholderInstruction}
${sectionInstruction}

CONTENT GUIDELINES:
1. Write copy that speaks directly to the target audience's pain points and desires
2. Use specific, concrete language rather than generic marketing speak
3. Include social proof elements where appropriate (results, testimonials structure)
4. Create compelling calls-to-action that drive the desired action
5. Maintain consistency in voice and messaging throughout
6. Adapt industry-specific terminology appropriately
7. Balance emotional appeal with practical benefits

Current template pages:
${JSON.stringify(template.pages_config, null, 2)}

Return ONLY a valid JSON object with this exact structure:
{
  "pages": [
    {
      "type": "page_type",
      "name": "Page Name",
      "slug": "page-slug",
      "description": "Page description",
      "blocks": [...]
    }
  ]
}

Replace all placeholder text with specific, relevant content based on the business description. Keep the block structure intact but update the content fields with personalized copy.`;

    let aiResult: AIResponse;
    try {
      aiResult = await callAI(
        "",
        [{ role: "user", content: prompt }],
        'funnel_content',
        tier,
        { maxTokens: 8000 }
      );
    } catch (err) {
      console.error("AI API error:", err);
      return new Response(
        JSON.stringify({
          pages: template.pages_config,
          emailSequences: template.email_sequences_config,
          generated: false,
          message: "AI generation failed - using template defaults"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const latencyMs = Date.now() - startTime;

    const content = aiResult.content;

    if (!content) {
      return new Response(
        JSON.stringify({
          pages: template.pages_config,
          emailSequences: template.email_sequences_config,
          generated: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let generatedPages;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        generatedPages = parsed.pages || template.pages_config;
      } else {
        generatedPages = template.pages_config;
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      generatedPages = template.pages_config;
    }

    if (siteId && userId) {
      await supabase
        .from('ai_usage_tracking')
        .insert({
          site_id: siteId,
          user_id: userId,
          request_type: 'funnel_content',
          model_used: aiResult.model,
          model_version: aiResult.model,
          tokens_used: aiResult.usage.total_tokens,
          input_tokens: aiResult.usage.input_tokens,
          output_tokens: aiResult.usage.output_tokens,
          cost_cents: aiResult.estimatedCostCents,
          provider: aiResult.provider,
          task_type: 'funnel_content',
          tier_at_request: tier,
          latency_ms: latencyMs,
        });
    }

    return new Response(
      JSON.stringify({
        pages: generatedPages,
        emailSequences: template.email_sequences_config,
        generated: true,
        tone: tone,
        industry: industry,
        model: aiResult.model,
        provider: aiResult.provider,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-funnel-content:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
