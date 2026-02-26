import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { templateId, businessDescription, industry, siteName }: GenerateRequest = await req.json();

    if (!templateId || !businessDescription) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      general: "General"
    };

    const prompt = `You are helping a creator build their online business. Generate personalized marketing copy for their funnel.

Business: ${siteName}
Industry: ${industryLabels[industry] || industry}
Description: ${businessDescription}
Funnel Type: ${template.name}

For each page in the funnel, replace the placeholder text with compelling, personalized copy that:
1. Speaks directly to the target audience
2. Highlights specific benefits relevant to their industry
3. Uses persuasive language that drives action
4. Maintains a professional but approachable tone

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

Replace all placeholder text like [Product Name], [Your Name], [audience], [result], etc. with specific, relevant content based on the business description. Keep the block structure intact but update the content fields.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
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

    const aiResponse = await response.json();
    const content = aiResponse.content[0]?.text;

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

    return new Response(
      JSON.stringify({
        pages: generatedPages,
        emailSequences: template.email_sequences_config,
        generated: true,
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
