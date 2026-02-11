import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ThemeRequest {
  industry?: string;
  mood?: string;
  brandName?: string;
  targetAudience?: string;
}

interface VisualTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  neutralColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  borderRadius: string;
  spacing: string;
  style: string;
  gradient: string;
  description: string;
  typography: {
    headingSizes: {
      h1: string;
      h2: string;
      h3: string;
    };
    bodySize: string;
    lineHeight: string;
  };
  shadows: {
    light: string;
    medium: string;
    large: string;
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
    const { industry, mood, brandName, targetAudience }: ThemeRequest = await req.json();

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const systemPrompt = `You are an expert brand designer and UI/UX specialist. Generate a complete, production-ready visual theme based on the provided information. The theme must include:

1. Color Palette: 6 hex colors (primary, secondary, accent, neutral, background, text)
2. Typography: Font families for headings and body, with specific sizes
3. Visual Style: Border radius, spacing system, shadows
4. Style Identity: A descriptive name for the theme style (modern, minimal, bold, etc.)

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Theme Name (e.g., Modern Tech, Warm Coaching)",
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "accentColor": "#hex",
  "neutralColor": "#hex",
  "backgroundColor": "#hex",
  "textColor": "#hex",
  "fontFamily": "Google Font Name, fallback",
  "headingFont": "Google Font Name, fallback",
  "borderRadius": "0px or 4px or 8px or 12px or 16px or 24px",
  "spacing": "compact or comfortable or spacious or generous",
  "style": "modern or minimal or creative or warm or corporate or energetic or luxury or eco",
  "gradient": "linear-gradient(135deg, color1 0%, color2 100%)",
  "description": "Brief description of the theme aesthetic",
  "typography": {
    "headingSizes": {
      "h1": "3rem or 2.5rem or 2rem",
      "h2": "2rem or 1.75rem or 1.5rem",
      "h3": "1.5rem or 1.25rem or 1.125rem"
    },
    "bodySize": "1rem or 1.125rem",
    "lineHeight": "1.5 or 1.6 or 1.7"
  },
  "shadows": {
    "light": "box-shadow value",
    "medium": "box-shadow value",
    "large": "box-shadow value"
  }
}

Ensure:
- Colors have good contrast and accessibility (WCAG AA minimum)
- Font combinations are harmonious
- The theme feels cohesive and professional
- Gradient uses primary and secondary colors
- Style matches the requested industry and mood`;

    const industryText = industry || 'general business';
    const moodText = mood || 'professional';
    const brandText = brandName ? ` for "${brandName}"` : '';
    const audienceText = targetAudience ? ` targeting ${targetAudience}` : '';

    const userPrompt = `Generate a complete visual theme for ${industryText}${brandText} with a ${moodText} mood${audienceText}.

Make it distinctive, memorable, and appropriate for the industry. The theme should communicate the right emotions and values through color, typography, and visual style.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1500,
        temperature: 0.9,
        system: systemPrompt,
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

    let theme: VisualTheme;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        theme = JSON.parse(jsonMatch[0]);
      } else {
        theme = JSON.parse(generatedText);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", generatedText);
      throw new Error("Failed to parse visual theme from AI response");
    }

    return new Response(
      JSON.stringify({
        theme,
        success: true
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Visual theme generation error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
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
