import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  callAI,
  mapPlanNameToTier,
  type SubscriptionTier,
} from "../_shared/ai-config.ts";

interface ProcessDocumentRequest {
  site_id: string;
  document_type: "branding" | "business_plan" | "html_reference";
  content: string;
  name?: string;
}

interface BrandingExtraction {
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    additional?: string[];
  };
  typography: {
    headingFont?: string;
    bodyFont?: string;
    fontWeights?: string[];
  };
  toneOfVoice: string[];
  brandValues: string[];
  keyPhrases: string[];
  visualStyle: string[];
}

interface BusinessPlanExtraction {
  businessName?: string;
  businessType?: string;
  missionStatement?: string;
  visionStatement?: string;
  targetAudience: {
    description: string;
    demographics?: string[];
    painPoints?: string[];
  };
  valuePropositions: string[];
  differentiators: string[];
  shortTermGoals: string[];
  longTermGoals: string[];
  competitivePositioning?: string;
}

interface HtmlReferenceExtraction {
  colorPalette: string[];
  fontStack: string[];
  fontSizes?: string[];
  spacingPatterns?: string[];
  layoutStyle?: string;
  visualElements?: string[];
}

type ExtractionResult = BrandingExtraction | BusinessPlanExtraction | HtmlReferenceExtraction;

const EXTRACTION_PROMPTS: Record<string, string> = {
  branding: `You are an expert brand analyst. Extract key branding elements from the provided document.

Analyze the content and extract:
1. Colors - Any mentioned brand colors (primary, secondary, accent, background, text colors). Include hex codes if available.
2. Typography - Font families for headings and body, font weights used
3. Tone of Voice - Descriptors like professional, casual, friendly, authoritative, playful, etc.
4. Brand Values - Core values the brand represents
5. Key Phrases - Important taglines, slogans, or recurring phrases
6. Visual Style - Keywords describing the visual aesthetic (modern, minimalist, bold, elegant, etc.)

Return ONLY valid JSON in this exact format:
{
  "colors": {
    "primary": "#hexcode or color name",
    "secondary": "#hexcode or color name",
    "accent": "#hexcode or color name",
    "background": "#hexcode or color name",
    "text": "#hexcode or color name",
    "additional": ["other colors"]
  },
  "typography": {
    "headingFont": "font name",
    "bodyFont": "font name",
    "fontWeights": ["400", "600", "700"]
  },
  "toneOfVoice": ["professional", "friendly"],
  "brandValues": ["innovation", "quality"],
  "keyPhrases": ["tagline here"],
  "visualStyle": ["modern", "clean"]
}

If information is not found, use null for optional fields or empty arrays for lists.`,

  business_plan: `You are an expert business analyst. Extract key business information from the provided document.

Analyze the content and extract:
1. Business Name and Type - The company name and what kind of business it is
2. Mission Statement - The company's purpose and mission
3. Vision Statement - Long-term aspirational goals
4. Target Audience - Who they serve, demographics, pain points
5. Value Propositions - What unique value they offer
6. Differentiators - What sets them apart from competitors
7. Goals - Both short-term and long-term objectives
8. Competitive Positioning - How they position against competitors

Return ONLY valid JSON in this exact format:
{
  "businessName": "Company Name",
  "businessType": "SaaS / E-commerce / Coaching / etc.",
  "missionStatement": "Our mission is...",
  "visionStatement": "We envision...",
  "targetAudience": {
    "description": "Main audience description",
    "demographics": ["age groups", "professions"],
    "painPoints": ["problem 1", "problem 2"]
  },
  "valuePropositions": ["value 1", "value 2"],
  "differentiators": ["unique aspect 1", "unique aspect 2"],
  "shortTermGoals": ["goal 1", "goal 2"],
  "longTermGoals": ["goal 1", "goal 2"],
  "competitivePositioning": "How they compete"
}

If information is not found, use null for optional fields or empty arrays for lists.`,

  html_reference: `You are an expert web designer and developer. Analyze the provided HTML/CSS content and extract design patterns.

Extract:
1. Color Palette - All colors used (hex codes, RGB, or named colors)
2. Font Stack - Font families used for headings and body
3. Font Sizes - Common font sizes used
4. Spacing Patterns - Common margin/padding values
5. Layout Style - Overall layout approach (centered, full-width, grid-based, etc.)
6. Visual Elements - Notable design elements (rounded corners, shadows, gradients, etc.)

Return ONLY valid JSON in this exact format:
{
  "colorPalette": ["#hexcode1", "#hexcode2", "rgb values"],
  "fontStack": ["font-family-1", "font-family-2"],
  "fontSizes": ["16px", "24px", "32px"],
  "spacingPatterns": ["8px", "16px", "24px", "32px"],
  "layoutStyle": "centered with max-width container",
  "visualElements": ["rounded corners", "subtle shadows"]
}

Focus on extracting actual values from the code, not assumptions.`,
};

async function getSiteTier(supabase: ReturnType<typeof createClient>, siteId: string): Promise<SubscriptionTier> {
  const { data: site } = await supabase
    .from("sites")
    .select("subscription_plan")
    .eq("id", siteId)
    .maybeSingle();

  return mapPlanNameToTier(site?.subscription_plan);
}

async function checkFeatureAccess(tier: SubscriptionTier): Promise<{ allowed: boolean; reason?: string }> {
  if (tier === "starter") {
    return {
      allowed: false,
      reason: "Brand Kit is available for Growth, Pro, and Enterprise plans. Upgrade to access this feature.",
    };
  }
  return { allowed: true };
}

async function getNextVersion(
  supabase: ReturnType<typeof createClient>,
  siteId: string,
  documentType: string
): Promise<number> {
  const { data } = await supabase.rpc("get_next_context_document_version", {
    p_site_id: siteId,
    p_document_type: documentType,
  });
  return data || 1;
}

async function checkUsageLimits(
  supabase: ReturnType<typeof createClient>,
  siteId: string,
  tier: SubscriptionTier
): Promise<{ allowed: boolean; reason?: string }> {
  const limits: Record<SubscriptionTier, { maxDocuments: number; monthlyExtractions: number }> = {
    enterprise: { maxDocuments: 25, monthlyExtractions: 999 },
    pro: { maxDocuments: 10, monthlyExtractions: 5 },
    growth: { maxDocuments: 3, monthlyExtractions: 2 },
    starter: { maxDocuments: 0, monthlyExtractions: 0 },
  };

  const tierLimits = limits[tier];

  const { count: totalDocs } = await supabase
    .from("site_context_documents")
    .select("*", { count: "exact", head: true })
    .eq("site_id", siteId)
    .is("archived_at", null);

  if ((totalDocs || 0) >= tierLimits.maxDocuments) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${tierLimits.maxDocuments} documents for your plan.`,
    };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: monthlyExtractions } = await supabase
    .from("site_context_documents")
    .select("*", { count: "exact", head: true })
    .eq("site_id", siteId)
    .gte("created_at", startOfMonth.toISOString());

  if ((monthlyExtractions || 0) >= tierLimits.monthlyExtractions) {
    return {
      allowed: false,
      reason: `You've used all ${tierLimits.monthlyExtractions} document extractions for this month.`,
    };
  }

  return { allowed: true };
}

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
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const {
      data: { user },
    } = await userSupabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: ProcessDocumentRequest = await req.json();
    const { site_id, document_type, content, name } = body;

    if (!site_id || !document_type || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: site_id, document_type, content" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["branding", "business_plan", "html_reference"].includes(document_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid document_type. Must be: branding, business_plan, or html_reference" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: siteAccess } = await userSupabase
      .from("sites")
      .select("id")
      .eq("id", site_id)
      .maybeSingle();

    if (!siteAccess) {
      return new Response(
        JSON.stringify({ error: "Site not found or access denied" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tier = await getSiteTier(supabase, site_id);

    const featureAccess = await checkFeatureAccess(tier);
    if (!featureAccess.allowed) {
      return new Response(
        JSON.stringify({ error: featureAccess.reason, code: "FEATURE_LOCKED" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const usageLimits = await checkUsageLimits(supabase, site_id, tier);
    if (!usageLimits.allowed) {
      return new Response(
        JSON.stringify({ error: usageLimits.reason, code: "USAGE_LIMIT" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const version = await getNextVersion(supabase, site_id, document_type);
    const contentPreview = content.substring(0, 500);
    const documentName = name || `${document_type.replace("_", " ")} v${version}`;

    const { data: docRecord, error: insertError } = await supabase
      .from("site_context_documents")
      .insert({
        site_id,
        document_type,
        name: documentName,
        raw_content_preview: contentPreview,
        version,
        status: "processing",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create document record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = EXTRACTION_PROMPTS[document_type];
    const truncatedContent = content.substring(0, 15000);

    let extractedContext: ExtractionResult;
    let modelUsed: string;

    try {
      const aiResponse = await callAI(
        systemPrompt,
        [{ role: "user", content: truncatedContent }],
        "document_extraction",
        tier,
        { temperature: 0.3, maxTokens: 2000 }
      );

      modelUsed = aiResponse.model;

      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      extractedContext = JSON.parse(jsonMatch[0]);

      await supabase
        .from("ai_usage")
        .insert({
          site_id,
          user_id: user.id,
          feature: "document_extraction",
          model_used: modelUsed.includes("sonnet") ? "sonnet" : modelUsed.includes("opus") ? "opus" : "haiku",
          input_tokens: aiResponse.usage.input_tokens,
          output_tokens: aiResponse.usage.output_tokens,
          estimated_cost_cents: aiResponse.estimatedCostCents,
        });

    } catch (aiError) {
      console.error("AI extraction error:", aiError);

      await supabase
        .from("site_context_documents")
        .update({
          status: "failed",
          error_message: aiError instanceof Error ? aiError.message : "Extraction failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", docRecord.id);

      return new Response(
        JSON.stringify({
          error: "Failed to extract context from document",
          document_id: docRecord.id,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: updatedDoc, error: updateError } = await supabase
      .from("site_context_documents")
      .update({
        extracted_context: extractedContext,
        extraction_model: modelUsed,
        status: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", docRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save extracted context" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: {
          id: updatedDoc.id,
          name: updatedDoc.name,
          document_type: updatedDoc.document_type,
          version: updatedDoc.version,
          status: updatedDoc.status,
          extracted_context: updatedDoc.extracted_context,
          extraction_model: updatedDoc.extraction_model,
          created_at: updatedDoc.created_at,
        },
        model_used: modelUsed,
        tier,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Process context document error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
