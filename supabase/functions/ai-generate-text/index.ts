import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { prompt, type, context } = await req.json();

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompts: Record<string, string> = {
      headline: "You are a professional copywriter specializing in compelling headlines. Generate short, punchy headlines that grab attention and communicate value. Return only the headline text, no quotes or extra formatting.",
      subheadline: "You are a professional copywriter. Generate a concise subheadline that supports the main headline and adds context. Return only the subheadline text, no quotes.",
      cta: "You are a marketing expert. Generate compelling call-to-action button text (2-4 words max) that drives conversions. Return only the CTA text, no quotes.",
      feature: "You are a product marketing specialist. Generate clear, benefit-focused feature descriptions (1-2 sentences). Return only the description text.",
      paragraph: "You are a professional content writer. Generate engaging, clear body copy that connects with readers. Return only the paragraph text.",
      testimonial: "You are writing authentic customer testimonials. Generate realistic, specific testimonials that highlight real benefits. Return only the testimonial text.",
      improve: "You are an expert editor. Improve the given text to be more clear, engaging, and professional while keeping the same general meaning. Return only the improved text.",
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.improve;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context ? `Context: ${context}\n\n${prompt}` : prompt },
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ text: generatedText }),
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