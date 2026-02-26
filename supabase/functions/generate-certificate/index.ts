import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CertificateRequest {
  productId: string;
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { productId }: CertificateRequest = await req.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: "Product ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: access } = await supabase
      .from("product_access")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!access) {
      return new Response(
        JSON.stringify({ error: "No access to this product" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: product } = await supabase
      .from("products")
      .select(`
        id,
        title,
        site_id,
        sites (
          name,
          logo_url,
          primary_color
        )
      `)
      .eq("id", productId)
      .maybeSingle();

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [lessonsResult, completionsResult] = await Promise.all([
      supabase
        .from("lessons")
        .select("id")
        .eq("product_id", productId),
      supabase
        .from("lesson_completions")
        .select("id, completed_at")
        .eq("product_id", productId)
        .eq("user_id", user.id),
    ]);

    const totalLessons = lessonsResult.data?.length || 0;
    const completedLessons = completionsResult.data?.length || 0;

    if (totalLessons === 0 || completedLessons < totalLessons) {
      return new Response(
        JSON.stringify({
          error: "Course not completed",
          progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          completedLessons,
          totalLessons,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const studentName = profile?.display_name || user.email?.split("@")[0] || "Student";
    const completionDates = completionsResult.data?.map(c => new Date(c.completed_at)) || [];
    const latestCompletion = completionDates.length > 0
      ? new Date(Math.max(...completionDates.map(d => d.getTime())))
      : new Date();

    const { data: existingCert } = await supabase
      .from("certificates")
      .select("id, certificate_number, issued_at")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    let certificateData;

    if (existingCert) {
      certificateData = existingCert;
    } else {
      const certNumber = `CERT-${product.site_id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      const { data: newCert, error: certError } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          product_id: productId,
          site_id: product.site_id,
          certificate_number: certNumber,
          student_name: studentName,
          course_title: product.title,
          issued_at: latestCompletion.toISOString(),
        })
        .select("id, certificate_number, issued_at")
        .single();

      if (certError) {
        console.error("Certificate creation error:", certError);
        return new Response(
          JSON.stringify({ error: "Failed to create certificate" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      certificateData = newCert;
    }

    const site = product.sites as { name: string; logo_url: string | null; primary_color: string };
    const primaryColor = site?.primary_color || "#3B82F6";

    const certificateHtml = generateCertificateHtml({
      studentName,
      courseTitle: product.title,
      siteName: site?.name || "CreatorApp",
      logoUrl: site?.logo_url,
      primaryColor,
      certificateNumber: certificateData.certificate_number,
      issuedAt: new Date(certificateData.issued_at),
    });

    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificateData.id,
          certificateNumber: certificateData.certificate_number,
          studentName,
          courseTitle: product.title,
          siteName: site?.name,
          logoUrl: site?.logo_url,
          primaryColor,
          issuedAt: certificateData.issued_at,
          html: certificateHtml,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Certificate generation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateCertificateHtml(data: {
  studentName: string;
  courseTitle: string;
  siteName: string;
  logoUrl: string | null;
  primaryColor: string;
  certificateNumber: string;
  issuedAt: Date;
}): string {
  const formattedDate = data.issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Open Sans', sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .certificate {
      width: 900px;
      height: 650px;
      background: white;
      position: relative;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }

    .border-outer {
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 3px solid ${data.primaryColor};
    }

    .border-inner {
      position: absolute;
      top: 25px;
      left: 25px;
      right: 25px;
      bottom: 25px;
      border: 1px solid ${data.primaryColor}40;
    }

    .corner {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 3px solid ${data.primaryColor};
    }

    .corner-tl { top: 30px; left: 30px; border-right: none; border-bottom: none; }
    .corner-tr { top: 30px; right: 30px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 30px; left: 30px; border-right: none; border-top: none; }
    .corner-br { bottom: 30px; right: 30px; border-left: none; border-top: none; }

    .content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;
    }

    .logo {
      max-height: 50px;
      max-width: 200px;
      margin-bottom: 20px;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: ${data.primaryColor};
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 30px;
    }

    .presented-to {
      font-size: 14px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }

    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 700;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${data.primaryColor}40;
    }

    .completion-text {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      max-width: 500px;
      margin-bottom: 25px;
    }

    .course-name {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 600;
      color: ${data.primaryColor};
      margin-bottom: 30px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 600px;
      margin-top: auto;
    }

    .footer-item {
      text-align: center;
    }

    .footer-line {
      width: 150px;
      border-top: 1px solid #ccc;
      margin-bottom: 8px;
    }

    .footer-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .footer-value {
      font-size: 13px;
      color: #333;
      font-weight: 600;
      margin-top: 4px;
    }

    .cert-number {
      position: absolute;
      bottom: 40px;
      right: 60px;
      font-size: 10px;
      color: #aaa;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="content">
      ${data.logoUrl ? `<img src="${data.logoUrl}" alt="${data.siteName}" class="logo" crossorigin="anonymous">` : ''}

      <h1 class="title">Certificate</h1>
      <p class="subtitle">of Completion</p>

      <p class="presented-to">This is to certify that</p>
      <h2 class="student-name">${escapeHtml(data.studentName)}</h2>

      <p class="completion-text">
        has successfully completed all requirements for
      </p>

      <h3 class="course-name">${escapeHtml(data.courseTitle)}</h3>

      <div class="footer">
        <div class="footer-item">
          <div class="footer-line"></div>
          <p class="footer-label">Date Issued</p>
          <p class="footer-value">${formattedDate}</p>
        </div>
        <div class="footer-item">
          <div class="footer-line"></div>
          <p class="footer-label">Issued By</p>
          <p class="footer-value">${escapeHtml(data.siteName)}</p>
        </div>
      </div>
    </div>

    <p class="cert-number">${data.certificateNumber}</p>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
