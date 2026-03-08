import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { callAI, type AIResponse } from "../_shared/ai-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { mood, industry } = await req.json();

    const systemPrompt = `You are a professional color palette designer. Generate a cohesive color palette with exactly 5 colors in hex format. Return ONLY a JSON object with this structure:
{
  "primary": "#hexcolor",
  "secondary": "#hexcolor",
  "accent": "#hexcolor",
  "neutral": "#hexcolor",
  "background": "#hexcolor",
  "description": "brief description of the palette"
}

Ensure colors are accessible, work well together, and fit the requested mood/industry. Colors must meet WCAG AA contrast standards for text on backgrounds.`;

    const userPrompt = `Generate a color palette for ${industry || 'general business'} with a ${mood || 'professional'} mood.`;

    const aiResponse: AIResponse = await callAI(
      systemPrompt,
      [{ role: "user", content: userPrompt }],
      'color_palette',
      'starter',
      { maxTokens: 500, temperature: 0.9 }
    );

    let palette;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        palette = JSON.parse(jsonMatch[0]);
      } else {
        palette = JSON.parse(aiResponse.content);
      }
    } catch (e) {
      throw new Error("Failed to parse color palette from AI response");
    }

    return new Response(
      JSON.stringify({
        palette,
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
