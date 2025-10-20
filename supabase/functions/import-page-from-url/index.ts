import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ImportRequest {
  url: string;
}

interface Block {
  id: string;
  type: string;
  content: Record<string, any>;
  styles: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url }: ImportRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PageImporter/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    const blocks = parseHtmlToBlocks(html, url);

    return new Response(
      JSON.stringify({
        success: true,
        blocks,
        sourceUrl: url,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error importing page:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to import page",
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

function parseHtmlToBlocks(html: string, baseUrl: string): Block[] {
  const blocks: Block[] = [];

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const h1Text = h1Match ? stripHtmlTags(h1Match[1]) : "";

  const firstPMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
  const firstP = firstPMatch ? stripHtmlTags(firstPMatch[1]) : "";

  const heroImageMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  const heroImage = heroImageMatch ? resolveUrl(heroImageMatch[1], baseUrl) : "";

  if (h1Text || firstP || heroImage) {
    blocks.push({
      id: generateId(),
      type: "hero",
      content: {
        headline: h1Text || title,
        subheadline: firstP,
        ctaText: "Learn More",
        ctaUrl: "#",
        backgroundImage: heroImage,
      },
      styles: {
        backgroundColor: "#1e293b",
        textColor: "#ffffff",
        padding: "large",
        alignment: "center",
      },
    });
  }

  const h2Matches = Array.from(html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi));
  const paragraphs = Array.from(html.matchAll(/<p[^>]*>([^<]+)<\/p>/gi));

  let textContent = "";
  for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
    textContent += stripHtmlTags(paragraphs[i][1]) + "\n\n";
  }

  if (textContent.trim()) {
    blocks.push({
      id: generateId(),
      type: "text",
      content: {
        text: textContent.trim(),
      },
      styles: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        padding: "medium",
        alignment: "left",
      },
    });
  }

  const images = Array.from(html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi));

  if (images.length > 1) {
    for (let i = 1; i < Math.min(4, images.length); i++) {
      const imgSrc = resolveUrl(images[i][1], baseUrl);
      const imgAlt = images[i][2] || "";

      if (imgSrc && !imgSrc.includes("icon") && !imgSrc.includes("logo")) {
        blocks.push({
          id: generateId(),
          type: "image",
          content: {
            url: imgSrc,
            alt: imgAlt,
            caption: "",
          },
          styles: {
            backgroundColor: "#ffffff",
            padding: "medium",
            alignment: "center",
          },
        });
      }
    }
  }

  const featureSection = extractFeatures(html);
  if (featureSection.length > 0) {
    blocks.push({
      id: generateId(),
      type: "features",
      content: {
        headline: "Features",
        features: featureSection,
      },
      styles: {
        backgroundColor: "#f8fafc",
        textColor: "#000000",
        padding: "large",
        alignment: "center",
      },
    });
  }

  const links = Array.from(html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi));
  const ctaLinks = links.filter(link => {
    const text = stripHtmlTags(link[2]).toLowerCase();
    return text.includes("start") || text.includes("try") || text.includes("get") ||
           text.includes("buy") || text.includes("sign up") || text.includes("learn more");
  });

  if (ctaLinks.length > 0) {
    blocks.push({
      id: generateId(),
      type: "cta",
      content: {
        headline: "Ready to Get Started?",
        description: "Join thousands of satisfied customers today.",
        buttonText: stripHtmlTags(ctaLinks[0][2]),
        buttonUrl: resolveUrl(ctaLinks[0][1], baseUrl),
      },
      styles: {
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
        padding: "large",
        alignment: "center",
      },
    });
  }

  return blocks;
}

function extractFeatures(html: string): Array<{ title: string; description: string }> {
  const features: Array<{ title: string; description: string }> = [];

  const listItems = Array.from(html.matchAll(/<li[^>]*>([^<]+)<\/li>/gi));

  for (let i = 0; i < Math.min(3, listItems.length); i++) {
    const text = stripHtmlTags(listItems[i][1]);
    if (text.length > 10 && text.length < 200) {
      features.push({
        title: text.substring(0, 50),
        description: text,
      });
    }
  }

  const h3Matches = Array.from(html.matchAll(/<h3[^>]*>([^<]+)<\/h3>\s*<p[^>]*>([^<]+)<\/p>/gi));

  for (let i = 0; i < Math.min(3, h3Matches.length); i++) {
    features.push({
      title: stripHtmlTags(h3Matches[i][1]),
      description: stripHtmlTags(h3Matches[i][2]),
    });
  }

  return features.slice(0, 6);
}

function stripHtmlTags(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function resolveUrl(url: string, baseUrl: string): string {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    const base = new URL(baseUrl);

    if (url.startsWith("//")) {
      return `${base.protocol}${url}`;
    }

    if (url.startsWith("/")) {
      return `${base.protocol}//${base.host}${url}`;
    }

    return `${base.protocol}//${base.host}/${url}`;
  } catch {
    return url;
  }
}

function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
