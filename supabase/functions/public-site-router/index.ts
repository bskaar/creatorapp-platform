import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SiteData {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  settings: any;
}

async function getSiteByDomain(supabase: any, domain: string): Promise<SiteData | null> {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');

  const { data: siteByCustomDomain } = await supabase
    .from('sites')
    .select('id, name, slug, primary_color, settings')
    .eq('custom_domain', cleanDomain)
    .eq('domain_verification_status', 'verified')
    .eq('status', 'active')
    .maybeSingle();

  if (siteByCustomDomain) {
    return siteByCustomDomain;
  }

  const { data: siteByCustomDomainWWW } = await supabase
    .from('sites')
    .select('id, name, slug, primary_color, settings')
    .eq('custom_domain', `www.${cleanDomain}`)
    .eq('domain_verification_status', 'verified')
    .eq('status', 'active')
    .maybeSingle();

  if (siteByCustomDomainWWW) {
    return siteByCustomDomainWWW;
  }

  if (domain.endsWith('.creatorapp.us')) {
    const slug = domain.replace('.creatorapp.us', '');

    const { data: siteBySlug } = await supabase
      .from('sites')
      .select('id, name, slug, primary_color, settings')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (siteBySlug) {
      return siteBySlug;
    }
  }

  return null;
}

async function getSitePages(supabase: any, siteId: string) {
  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, slug, content, status, is_homepage, meta_title, meta_description')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('is_homepage', { ascending: false })
    .order('created_at', { ascending: true });

  return pages || [];
}

async function getSiteProducts(supabase: any, siteId: string) {
  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, price_amount, price_currency, thumbnail_url, product_type')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return products || [];
}

function generateSiteHTML(site: SiteData, pages: any[], products: any[], requestPath: string): string {
  const currentPage = pages.find(p => requestPath === '/' ? p.is_homepage : requestPath === `/${p.slug}`);

  if (!currentPage) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | ${site.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; color: white; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 6rem; margin-bottom: 1rem; }
    h2 { font-size: 2rem; margin-bottom: 1rem; opacity: 0.9; }
    p { font-size: 1.1rem; opacity: 0.8; margin-bottom: 2rem; }
    a { display: inline-block; padding: 1rem 2rem; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s; }
    a:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go Home</a>
  </div>
</body>
</html>
    `.trim();
  }

  const pageContent = currentPage.content || '<p>Welcome to our site!</p>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentPage.meta_title || currentPage.title || site.name}</title>
  <meta name="description" content="${currentPage.meta_description || site.settings?.description || ''}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    header { background: ${site.primary_color || '#3B82F6'}; color: white; padding: 1.5rem 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    header h1 { font-size: 1.75rem; }
    nav { max-width: 1200px; margin: 0 auto; display: flex; gap: 2rem; padding: 1rem 2rem; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    nav a { color: #555; text-decoration: none; font-weight: 500; transition: color 0.2s; }
    nav a:hover { color: ${site.primary_color || '#3B82F6'}; }
    main { max-width: 1200px; margin: 2rem auto; padding: 2rem; }
    .content { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
    .product { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: transform 0.2s; }
    .product:hover { transform: translateY(-4px); }
    .product img { width: 100%; height: 200px; object-fit: cover; background: #f0f0f0; }
    .product-info { padding: 1.5rem; }
    .product-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    .product-description { color: #666; font-size: 0.95rem; margin-bottom: 1rem; }
    .product-price { font-size: 1.5rem; font-weight: 700; color: ${site.primary_color || '#3B82F6'}; }
    footer { text-align: center; padding: 2rem; color: #666; margin-top: 4rem; border-top: 1px solid #e5e5e5; }
  </style>
</head>
<body>
  <header>
    <h1>${site.name}</h1>
  </header>

  <nav>
    ${pages.map(page => `<a href="${page.is_homepage ? '/' : `/${page.slug}`}">${page.title}</a>`).join('')}
  </nav>

  <main>
    <div class="content">
      ${pageContent}
    </div>

    ${products.length > 0 ? `
      <h2 style="margin: 3rem 0 1rem; font-size: 2rem;">Our Products</h2>
      <div class="products">
        ${products.map(product => `
          <div class="product">
            ${product.thumbnail_url ? `<img src="${product.thumbnail_url}" alt="${product.title}">` : '<div style="width:100%;height:200px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:3rem;">📦</div>'}
            <div class="product-info">
              <div class="product-title">${product.title}</div>
              <div class="product-description">${product.description || ''}</div>
              <div class="product-price">$${product.price_amount} ${product.price_currency || 'USD'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${site.name}. All rights reserved.</p>
    <p style="margin-top: 0.5rem; font-size: 0.875rem;">Powered by CreatorApp</p>
  </footer>
</body>
</html>
  `.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') || url.hostname;
    const requestPath = url.searchParams.get('path') || url.pathname;

    const site = await getSiteByDomain(supabase, domain);

    if (!site) {
      return new Response(
        `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Not Found</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; color: white; text-align: center; padding: 2rem; }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    p { font-size: 1.2rem; opacity: 0.9; }
  </style>
</head>
<body>
  <div>
    <h1>Site Not Found</h1>
    <p>This domain is not configured or the site is inactive.</p>
  </div>
</body>
</html>
        `.trim(),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html',
          },
        }
      );
    }

    const [pages, products] = await Promise.all([
      getSitePages(supabase, site.id),
      getSiteProducts(supabase, site.id),
    ]);

    const html = generateSiteHTML(site, pages, products, requestPath);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Public site router error:', error);
    return new Response(
      `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .error { background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
    h1 { color: #e53e3e; margin-bottom: 1rem; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="error">
    <h1>Something Went Wrong</h1>
    <p>We encountered an error loading this site. Please try again later.</p>
  </div>
</body>
</html>
      `.trim(),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
      }
    );
  }
});