import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { callAnthropic } from "../_shared/ai-config.ts";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
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

    const { prompt, type, context } = await req.json();

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
    const userContent = context ? `Context: ${context}\n\n${prompt}` : prompt;

    const aiResponse = await callAnthropic(
      systemPrompt,
      [{ role: "user", content: userContent }],
      'text_generation',
      { maxTokens: 300, temperature: 0.8 }
    );

    return new Response(
      JSON.stringify({ text: aiResponse.content }),
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
