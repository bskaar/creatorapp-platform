import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  background: string;
  description: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      throw new Error("No image data provided");
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const systemPrompt = `You are an expert color analyst and brand designer. Analyze the provided image and extract a cohesive 5-color palette that represents the brand identity, logo colors, or key visual elements.

Return ONLY a valid JSON object with this exact structure:
{
  "primary": "#hexcolor",
  "secondary": "#hexcolor",
  "accent": "#hexcolor",
  "neutral": "#hexcolor",
  "background": "#hexcolor",
  "description": "brief description of the extracted colors and their relationship"
}

Guidelines:
- Primary: The dominant or most important brand color from the image
- Secondary: A complementary color that supports the primary
- Accent: A color for calls-to-action or highlights
- Neutral: A gray/muted tone for text and UI elements
- Background: A light or dark base color for backgrounds

Extract actual colors from the image. If the image has limited colors, derive complementary colors that would work well with the extracted ones.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType || "image/png",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "Analyze this image and extract a brand color palette. Focus on the dominant colors, logo colors, and key visual elements. Return the palette as JSON.",
              },
            ],
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || "";

    let palette: ColorPalette;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        palette = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      throw new Error("Failed to parse color palette from AI response");
    }

    const requiredFields = ['primary', 'secondary', 'accent', 'neutral', 'background'];
    for (const field of requiredFields) {
      if (!palette[field as keyof ColorPalette]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return new Response(
      JSON.stringify({
        palette,
        source: "image_analysis",
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
