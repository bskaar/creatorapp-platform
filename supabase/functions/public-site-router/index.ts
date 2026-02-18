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

interface Block {
  id: string;
  type: string;
  content: any;
  styles?: any;
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

  if (siteByCustomDomain) return siteByCustomDomain;

  const { data: siteByCustomDomainWWW } = await supabase
    .from('sites')
    .select('id, name, slug, primary_color, settings')
    .eq('custom_domain', `www.${cleanDomain}`)
    .eq('domain_verification_status', 'verified')
    .eq('status', 'active')
    .maybeSingle();

  if (siteByCustomDomainWWW) return siteByCustomDomainWWW;

  if (domain.endsWith('.creatorapp.site')) {
    const slug = domain.replace('.creatorapp.site', '');
    const { data: siteBySlug } = await supabase
      .from('sites')
      .select('id, name, slug, primary_color, settings')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (siteBySlug) return siteBySlug;
  }

  return null;
}

async function getSitePages(supabase: any, siteId: string) {
  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, slug, content, status, seo_title, seo_description, page_type')
    .eq('site_id', siteId)
    .eq('status', 'published')
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

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBlock(block: Block, primaryColor: string): string {
  const c = block.content || {};
  const s = block.styles || {};

  switch (block.type) {
    case 'hero': {
      const overlay = s.overlay || 'rgba(10, 30, 60, 0.7)';
      const bgImage = c.backgroundImage
        ? `background-image:url(${escapeHtml(c.backgroundImage)});background-size:cover;background-position:center;`
        : `background:linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%);`;
      const padding = s.padding || '100px 20px';
      return `
        <section style="${bgImage}position:relative;">
          <div style="position:absolute;inset:0;background:${overlay};"></div>
          <div style="position:relative;z-index:1;max-width:900px;margin:0 auto;text-align:${s.textAlign || 'center'};padding:${padding};color:#fff;">
            <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.15;margin-bottom:1.25rem;">${escapeHtml(c.headline || '')}</h1>
            <p style="font-size:clamp(1rem,2.5vw,1.35rem);opacity:0.92;line-height:1.65;margin-bottom:2rem;max-width:700px;margin-left:auto;margin-right:auto;">${escapeHtml(c.subheadline || '')}</p>
            ${c.ctaText ? `<a href="${escapeHtml(c.ctaUrl || '#')}" style="display:inline-block;padding:1rem 2.5rem;background:#fff;color:${primaryColor};border-radius:8px;font-weight:700;font-size:1.1rem;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 14px rgba(0,0,0,0.15);">${escapeHtml(c.ctaText)}</a>` : ''}
          </div>
        </section>`;
    }

    case 'text': {
      const rawText = c.text || '';
      return `
        <section style="padding:3rem 1.5rem;">
          <div style="max-width:900px;margin:0 auto;font-size:1.05rem;line-height:1.8;color:#334155;">
            ${rawText}
          </div>
        </section>`;
    }

    case 'image': {
      return `
        <section style="padding:2rem 1.5rem;">
          <div style="max-width:1000px;margin:0 auto;text-align:center;">
            <img src="${escapeHtml(c.url || '')}" alt="${escapeHtml(c.alt || 'Image')}" style="width:100%;max-width:100%;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.1);" />
            ${c.caption ? `<p style="margin-top:0.75rem;font-size:0.9rem;color:#64748b;">${escapeHtml(c.caption)}</p>` : ''}
          </div>
        </section>`;
    }

    case 'stats': {
      const bg = s.backgroundColor || primaryColor;
      const textColor = bg === '#f8fafc' || bg === '#ffffff' ? '#0f172a' : '#ffffff';
      const subColor = bg === '#f8fafc' || bg === '#ffffff' ? '#64748b' : 'rgba(255,255,255,0.8)';
      return `
        <section style="background:${bg};padding:4rem 1.5rem;">
          <div style="max-width:1100px;margin:0 auto;text-align:center;">
            ${c.headline ? `<h2 style="font-size:2rem;font-weight:700;margin-bottom:2.5rem;color:${textColor};">${escapeHtml(c.headline)}</h2>` : ''}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:2rem;">
              ${(c.stats || []).map((stat: any) => `
                <div>
                  <div style="font-size:clamp(2rem,4vw,3rem);font-weight:800;color:${textColor};margin-bottom:0.25rem;">${escapeHtml(stat.value)}</div>
                  <div style="font-size:0.95rem;color:${subColor};">${escapeHtml(stat.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>`;
    }

    case 'features': {
      return `
        <section style="padding:4rem 1.5rem;">
          <div style="max-width:1100px;margin:0 auto;">
            ${c.headline ? `
              <div style="text-align:center;margin-bottom:3rem;">
                <h2 style="font-size:2rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem;">${escapeHtml(c.headline)}</h2>
                ${c.subheadline ? `<p style="font-size:1.15rem;color:#64748b;">${escapeHtml(c.subheadline)}</p>` : ''}
              </div>` : ''}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
              ${(c.features || []).map((f: any) => `
                <div style="padding:2rem;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;transition:transform 0.2s,box-shadow 0.2s;">
                  <div style="width:48px;height:48px;border-radius:10px;background:${primaryColor}15;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;">
                    <span style="font-size:1.5rem;color:${primaryColor};">${f.icon && f.icon.length <= 4 ? f.icon : '&#9733;'}</span>
                  </div>
                  <h3 style="font-size:1.15rem;font-weight:600;color:#0f172a;margin-bottom:0.5rem;">${escapeHtml(f.title)}</h3>
                  <p style="font-size:0.95rem;color:#64748b;line-height:1.65;">${escapeHtml(f.description)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>`;
    }

    case 'testimonial': {
      return `
        <section style="padding:4rem 1.5rem;background:#f8fafc;">
          <div style="max-width:800px;margin:0 auto;">
            <div style="background:#fff;border-radius:16px;padding:2.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
              <div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;">
                ${c.avatar ? `<img src="${escapeHtml(c.avatar)}" alt="${escapeHtml(c.author || '')}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0;" />` : ''}
                <div style="flex:1;min-width:200px;">
                  <p style="font-size:1.1rem;color:#334155;font-style:italic;line-height:1.75;margin-bottom:1.25rem;">"${escapeHtml(c.quote || '')}"</p>
                  <p style="font-weight:600;color:#0f172a;">${escapeHtml(c.author || '')}</p>
                  ${c.role ? `<p style="font-size:0.9rem;color:#64748b;">${escapeHtml(c.role)}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
        </section>`;
    }

    case 'cta': {
      const bgColor = s.backgroundColor || '#0f172a';
      return `
        <section style="background:${bgColor};padding:4rem 1.5rem;">
          <div style="max-width:700px;margin:0 auto;text-align:center;color:#fff;">
            <h2 style="font-size:2rem;font-weight:700;margin-bottom:1rem;">${escapeHtml(c.headline || '')}</h2>
            ${c.description ? `<p style="font-size:1.1rem;opacity:0.9;line-height:1.7;margin-bottom:2rem;">${escapeHtml(c.description)}</p>` : ''}
            ${c.buttonText ? `<a href="${escapeHtml(c.buttonUrl || '#')}" style="display:inline-block;padding:1rem 2.5rem;background:#fff;color:${bgColor};border-radius:8px;font-weight:700;font-size:1.1rem;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.15);">${escapeHtml(c.buttonText)}</a>` : ''}
          </div>
        </section>`;
    }

    case 'form': {
      return `
        <section style="padding:4rem 1.5rem;">
          <div style="max-width:520px;margin:0 auto;">
            ${c.headline ? `<h2 style="font-size:1.75rem;font-weight:700;color:#0f172a;text-align:center;margin-bottom:0.5rem;">${escapeHtml(c.headline)}</h2>` : ''}
            ${c.description ? `<p style="color:#64748b;text-align:center;margin-bottom:2rem;">${escapeHtml(c.description)}</p>` : ''}
            <form style="display:flex;flex-direction:column;gap:1rem;" onsubmit="event.preventDefault();this.querySelector('.form-btn').textContent='${escapeHtml(c.successMessage || 'Submitted!')}';this.querySelector('.form-btn').style.background='#22c55e';">
              ${(c.fields || []).map((field: any) => `
                <div>
                  <label style="display:block;font-size:0.875rem;font-weight:500;color:#374151;margin-bottom:0.35rem;">${escapeHtml(field.label)}${field.required ? ' <span style="color:#ef4444;">*</span>' : ''}</label>
                  ${field.type === 'textarea'
                    ? `<textarea name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.label)}" ${field.required ? 'required' : ''} rows="4" style="width:100%;padding:0.75rem 1rem;border:1px solid #d1d5db;border-radius:8px;font-size:1rem;font-family:inherit;resize:vertical;"></textarea>`
                    : `<input type="${escapeHtml(field.type || 'text')}" name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.label)}" ${field.required ? 'required' : ''} style="width:100%;padding:0.75rem 1rem;border:1px solid #d1d5db;border-radius:8px;font-size:1rem;" />`
                  }
                </div>
              `).join('')}
              <button type="submit" class="form-btn" style="width:100%;padding:0.85rem;background:${primaryColor};color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s;">${escapeHtml(c.submitButtonText || 'Submit')}</button>
            </form>
          </div>
        </section>`;
    }

    case 'pricing': {
      return `
        <section style="padding:4rem 1.5rem;">
          <div style="max-width:1100px;margin:0 auto;">
            ${c.headline ? `
              <div style="text-align:center;margin-bottom:3rem;">
                <h2 style="font-size:2rem;font-weight:700;color:#0f172a;">${escapeHtml(c.headline)}</h2>
                ${c.subheadline ? `<p style="font-size:1.1rem;color:#64748b;margin-top:0.5rem;">${escapeHtml(c.subheadline)}</p>` : ''}
              </div>` : ''}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;align-items:start;">
              ${(c.plans || []).map((plan: any) => `
                <div style="background:#fff;border-radius:16px;padding:2.5rem 2rem;box-shadow:0 4px 20px rgba(0,0,0,${plan.highlighted ? '0.12' : '0.06'});border:${plan.highlighted ? `2px solid ${primaryColor}` : '1px solid #e2e8f0'};${plan.highlighted ? 'transform:scale(1.03);' : ''}position:relative;">
                  ${plan.highlighted ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${primaryColor};color:#fff;padding:0.25rem 1rem;border-radius:20px;font-size:0.8rem;font-weight:600;">Most Popular</div>` : ''}
                  <h3 style="font-size:1.35rem;font-weight:700;color:#0f172a;">${escapeHtml(plan.name)}</h3>
                  <div style="margin:1.25rem 0 1.5rem;">
                    <span style="font-size:2.75rem;font-weight:800;color:#0f172a;">${escapeHtml(plan.price)}</span>
                    <span style="color:#64748b;font-size:0.95rem;">${escapeHtml(plan.period || '')}</span>
                  </div>
                  <ul style="list-style:none;padding:0;margin:0 0 2rem;">
                    ${(plan.features || []).map((feature: string) => `
                      <li style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.4rem 0;font-size:0.95rem;color:#475569;">
                        <span style="color:#22c55e;font-weight:700;flex-shrink:0;">&#10003;</span>
                        <span>${escapeHtml(feature)}</span>
                      </li>
                    `).join('')}
                  </ul>
                  <a href="#enroll" style="display:block;text-align:center;padding:0.85rem;border-radius:8px;font-weight:600;text-decoration:none;transition:all 0.2s;${plan.highlighted ? `background:${primaryColor};color:#fff;` : 'background:#f1f5f9;color:#0f172a;'}">${escapeHtml(plan.buttonText || 'Get Started')}</a>
                </div>
              `).join('')}
            </div>
          </div>
        </section>`;
    }

    case 'video': {
      return `
        <section style="padding:4rem 1.5rem;">
          <div style="max-width:900px;margin:0 auto;text-align:center;">
            ${c.headline || c.title ? `<h2 style="font-size:1.75rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem;">${escapeHtml(c.headline || c.title)}</h2>` : ''}
            ${c.description ? `<p style="color:#64748b;margin-bottom:2rem;">${escapeHtml(c.description)}</p>` : ''}
            ${c.videoUrl
              ? `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.1);"><iframe src="${escapeHtml(c.videoUrl)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe></div>`
              : c.thumbnailUrl
                ? `<div style="position:relative;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);"><img src="${escapeHtml(c.thumbnailUrl)}" alt="Video thumbnail" style="width:100%;display:block;" /><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);"><div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;"><span style="font-size:2rem;margin-left:4px;">&#9654;</span></div></div></div>`
                : ''
            }
          </div>
        </section>`;
    }

    case 'gallery': {
      return `
        <section style="padding:4rem 1.5rem;">
          <div style="max-width:1100px;margin:0 auto;">
            ${c.headline ? `<h2 style="font-size:2rem;font-weight:700;text-align:center;color:#0f172a;margin-bottom:2rem;">${escapeHtml(c.headline)}</h2>` : ''}
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;">
              ${(c.images || []).map((img: any, idx: number) => `
                <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || `Gallery image ${idx + 1}`)}" style="width:100%;height:240px;object-fit:cover;border-radius:10px;transition:transform 0.2s;" />
              `).join('')}
            </div>
          </div>
        </section>`;
    }

    default:
      return '';
  }
}

function generateSiteHTML(site: SiteData, pages: any[], products: any[], requestPath: string): string {
  const primaryColor = site.primary_color || '#0ea5e9';
  const isHome = requestPath === '/' || requestPath === '';
  const homePage = pages.find(p => p.slug === 'creatorappu-landing-page') || pages[0];
  const currentPage = isHome ? homePage : pages.find(p => `/${p.slug}` === requestPath);

  if (!currentPage) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | ${escapeHtml(site.name)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff;}
    .c{text-align:center;padding:2rem;}
    h1{font-size:6rem;margin-bottom:1rem;opacity:0.3;}
    h2{font-size:2rem;margin-bottom:1rem;}
    p{font-size:1.1rem;opacity:0.7;margin-bottom:2rem;}
    a{display:inline-block;padding:1rem 2rem;background:${primaryColor};color:#fff;text-decoration:none;border-radius:8px;font-weight:600;}
  </style>
</head>
<body><div class="c"><h1>404</h1><h2>Page Not Found</h2><p>The page you are looking for does not exist.</p><a href="/">Go Home</a></div></body>
</html>`;
  }

  const blocks: Block[] = currentPage.content?.blocks || [];
  const renderedBlocks = blocks.map(b => renderBlock(b, primaryColor)).join('\n');
  const seoTitle = currentPage.seo_title || currentPage.title || site.name;
  const seoDesc = currentPage.seo_description || site.settings?.description || '';

  const navPages = pages.filter(p =>
    ['creatorappu-landing-page', 'curriculum', 'pricing', 'about', 'free-creator-toolkit', 'contact'].includes(p.slug)
  );

  const navLabels: Record<string, string> = {
    'creatorappu-landing-page': 'Home',
    'curriculum': 'Curriculum',
    'pricing': 'Pricing',
    'about': 'About',
    'free-creator-toolkit': 'Free Toolkit',
    'contact': 'Contact',
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seoTitle)}</title>
  <meta name="description" content="${escapeHtml(seoDesc)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.6;color:#334155;-webkit-font-smoothing:antialiased;}
    img{max-width:100%;}
    a{color:inherit;}

    .site-header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;padding:0 1.5rem;}
    .header-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:64px;}
    .site-logo{font-size:1.35rem;font-weight:800;color:#0f172a;text-decoration:none;letter-spacing:-0.02em;}
    .site-logo span{color:${primaryColor};}

    .nav-links{display:flex;gap:0.25rem;align-items:center;}
    .nav-links a{padding:0.5rem 0.85rem;font-size:0.9rem;font-weight:500;color:#475569;text-decoration:none;border-radius:6px;transition:all 0.15s;}
    .nav-links a:hover,.nav-links a.active{color:${primaryColor};background:${primaryColor}08;}
    .nav-cta{padding:0.5rem 1.25rem!important;background:${primaryColor}!important;color:#fff!important;border-radius:6px!important;font-weight:600!important;}
    .nav-cta:hover{opacity:0.9!important;}

    .hamburger{display:none;background:none;border:none;cursor:pointer;padding:0.5rem;}
    .hamburger span{display:block;width:24px;height:2px;background:#0f172a;margin:5px 0;transition:0.3s;}

    .site-footer{background:#0f172a;color:#94a3b8;padding:3rem 1.5rem;text-align:center;}
    .site-footer a{color:#cbd5e1;text-decoration:none;}
    .footer-inner{max-width:1200px;margin:0 auto;}
    .footer-links{display:flex;justify-content:center;gap:2rem;margin-bottom:1.5rem;flex-wrap:wrap;}
    .footer-links a{font-size:0.9rem;transition:color 0.15s;}
    .footer-links a:hover{color:#fff;}

    @media(max-width:768px){
      .nav-links{display:none;position:absolute;top:64px;left:0;right:0;background:#fff;flex-direction:column;padding:1rem;border-bottom:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(0,0,0,0.08);}
      .nav-links.open{display:flex;}
      .hamburger{display:block;}
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="site-logo">Creator<span>AppU</span></a>
      <button class="hamburger" onclick="document.querySelector('.nav-links').classList.toggle('open')" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav-links">
        ${navPages.map(p => {
          const href = p.slug === 'creatorappu-landing-page' ? '/' : `/${p.slug}`;
          const isActive = (isHome && p.slug === 'creatorappu-landing-page') || `/${p.slug}` === requestPath;
          const label = navLabels[p.slug] || p.title;
          const isCta = p.slug === 'pricing';
          return `<a href="${href}" class="${isActive ? 'active' : ''} ${isCta ? 'nav-cta' : ''}">${escapeHtml(label)}</a>`;
        }).join('')}
      </nav>
    </div>
  </header>

  <main>
    ${renderedBlocks}

    ${products.length > 0 ? `
      <section style="padding:4rem 1.5rem;">
        <div style="max-width:1100px;margin:0 auto;">
          <h2 style="font-size:2rem;font-weight:700;text-align:center;color:#0f172a;margin-bottom:2.5rem;">Our Products</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2rem;">
            ${products.map(product => `
              <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;transition:transform 0.2s;">
                ${product.thumbnail_url ? `<img src="${escapeHtml(product.thumbnail_url)}" alt="${escapeHtml(product.title)}" style="width:100%;height:200px;object-fit:cover;" />` : '<div style="width:100%;height:200px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:2.5rem;">&#128230;</div>'}
                <div style="padding:1.5rem;">
                  <h3 style="font-size:1.15rem;font-weight:600;color:#0f172a;margin-bottom:0.5rem;">${escapeHtml(product.title)}</h3>
                  <p style="color:#64748b;font-size:0.9rem;margin-bottom:1rem;line-height:1.5;">${escapeHtml(product.description || '')}</p>
                  <div style="font-size:1.5rem;font-weight:700;color:${primaryColor};">$${product.price_amount} ${escapeHtml(product.price_currency || 'USD')}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    ` : ''}
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-links">
        ${navPages.map(p => {
          const href = p.slug === 'creatorappu-landing-page' ? '/' : `/${p.slug}`;
          const label = navLabels[p.slug] || p.title;
          return `<a href="${href}">${escapeHtml(label)}</a>`;
        }).join('')}
      </div>
      <p style="font-size:0.9rem;">&copy; ${new Date().getFullYear()} ${escapeHtml(site.name)}. All rights reserved.</p>
      <p style="margin-top:0.5rem;font-size:0.8rem;color:#64748b;">Powered by <a href="https://creatorapp.us" style="color:#94a3b8;">CreatorApp</a></p>
    </div>
  </footer>
</body>
</html>`;
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
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Site Not Found</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:system-ui,sans-serif;background:#0f172a;min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff;text-align:center;padding:2rem;}h1{font-size:3rem;margin-bottom:1rem;}p{font-size:1.2rem;opacity:0.7;}</style></head><body><div><h1>Site Not Found</h1><p>This domain is not configured or the site is inactive.</p></div></body></html>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const [pages, products] = await Promise.all([
      getSitePages(supabase, site.id),
      getSiteProducts(supabase, site.id),
    ]);

    const html = generateSiteHTML(site, pages, products, requestPath);

    const responseHeaders = new Headers();
    responseHeaders.set('content-type', 'text/html; charset=utf-8');
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set('cache-control', 'no-transform, public, max-age=300');
    responseHeaders.set('x-content-type-options', 'nosniff');

    return new Response(html, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Public site router error:', error);
    return new Response(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Error</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:system-ui,sans-serif;background:#f8fafc;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;}.e{background:#fff;padding:3rem;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);text-align:center;max-width:500px;}h1{color:#dc2626;margin-bottom:1rem;}p{color:#64748b;}</style></head><body><div class="e"><h1>Something Went Wrong</h1><p>We encountered an error loading this site. Please try again later.</p></div></body></html>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
