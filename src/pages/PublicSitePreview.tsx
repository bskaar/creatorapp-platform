import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SiteData {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  settings: any;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: any;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  page_type: string | null;
}

interface ProductData {
  id: string;
  title: string;
  description: string | null;
  price_amount: number;
  price_currency: string;
  thumbnail_url: string | null;
  product_type: string;
}

interface Block {
  id: string;
  type: string;
  content: any;
  styles?: any;
}

const NAV_SLUGS = ['creatorappu-landing-page', 'curriculum', 'pricing', 'about', 'free-creator-toolkit', 'contact'];
const NAV_LABELS: Record<string, string> = {
  'creatorappu-landing-page': 'Home',
  'curriculum': 'Curriculum',
  'pricing': 'Pricing',
  'about': 'About',
  'free-creator-toolkit': 'Free Toolkit',
  'contact': 'Contact',
};

export default function PublicSitePreview() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain') || '';
  const requestPath = searchParams.get('path') || '/';

  const [site, setSite] = useState<SiteData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadSiteData();
  }, [domain, requestPath]);

  async function loadSiteData() {
    setLoading(true);
    setError(null);

    try {
      const siteData = await findSite(domain);
      if (!siteData) {
        setError('Site not found');
        setLoading(false);
        return;
      }
      setSite(siteData);

      const [pagesResult, productsResult] = await Promise.all([
        supabase
          .from('pages')
          .select('id, title, slug, content, status, seo_title, seo_description, page_type')
          .eq('site_id', siteData.id)
          .eq('status', 'published')
          .order('created_at', { ascending: true }),
        supabase
          .from('products')
          .select('id, title, description, price_amount, price_currency, thumbnail_url, product_type')
          .eq('site_id', siteData.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
      ]);

      setPages((pagesResult.data as PageData[]) || []);
      setProducts((productsResult.data as ProductData[]) || []);
    } catch {
      setError('Failed to load site');
    } finally {
      setLoading(false);
    }
  }

  async function findSite(domainStr: string): Promise<SiteData | null> {
    const clean = domainStr.toLowerCase().replace(/^www\./, '');

    const { data: byCustom } = await supabase
      .from('sites')
      .select('id, name, slug, primary_color, settings')
      .eq('custom_domain', clean)
      .eq('domain_verification_status', 'verified')
      .eq('status', 'active')
      .maybeSingle();
    if (byCustom) return byCustom as SiteData;

    const { data: byWWW } = await supabase
      .from('sites')
      .select('id, name, slug, primary_color, settings')
      .eq('custom_domain', `www.${clean}`)
      .eq('domain_verification_status', 'verified')
      .eq('status', 'active')
      .maybeSingle();
    if (byWWW) return byWWW as SiteData;

    if (clean.endsWith('.creatorapp.us')) {
      const slug = clean.replace('.creatorapp.us', '');
      const { data: bySlug } = await supabase
        .from('sites')
        .select('id, name, slug, primary_color, settings')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();
      if (bySlug) return bySlug as SiteData;
    }

    const { data: directSlug } = await supabase
      .from('sites')
      .select('id, name, slug, primary_color, settings')
      .eq('slug', clean)
      .eq('status', 'active')
      .maybeSingle();
    if (directSlug) return directSlug as SiteData;

    return null;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Site Not Found</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>This domain is not configured or the site is inactive.</p>
        </div>
      </div>
    );
  }

  const primaryColor = site.primary_color || '#0ea5e9';
  const isHome = requestPath === '/' || requestPath === '';
  const homePage = pages.find(p => p.slug === 'creatorappu-landing-page') || pages[0];
  const currentPage = isHome ? homePage : pages.find(p => `/${p.slug}` === requestPath);
  const navPages = pages.filter(p => NAV_SLUGS.includes(p.slug));

  if (!currentPage) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div>
          <h1 style={{ fontSize: '6rem', marginBottom: '1rem', opacity: 0.3 }}>404</h1>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.7, marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
          <a href={`?domain=${domain}&path=/`} style={{ display: 'inline-block', padding: '1rem 2rem', background: primaryColor, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>Go Home</a>
        </div>
      </div>
    );
  }

  const blocks: Block[] = currentPage.content?.blocks || [];
  const seoTitle = currentPage.seo_title || currentPage.title || site.name;
  const seoDesc = currentPage.seo_description || site.settings?.description || '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; -webkit-font-smoothing: antialiased; }
        img { max-width: 100%; }
        a { color: inherit; }
      `}</style>
      <title>{seoTitle}</title>
      {seoDesc && <meta name="description" content={seoDesc} />}

      <SiteHeader
        siteName={site.name}
        primaryColor={primaryColor}
        navPages={navPages}
        domain={domain}
        requestPath={requestPath}
        isHome={isHome}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(!menuOpen)}
      />

      <main>
        {blocks.map((block, i) => (
          <BlockRenderer key={block.id || i} block={block} primaryColor={primaryColor} />
        ))}

        {products.length > 0 && (
          <section style={{ padding: '4rem 1.5rem' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', color: '#0f172a', marginBottom: '2.5rem' }}>Our Products</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter siteName={site.name} primaryColor={primaryColor} navPages={navPages} domain={domain} />
    </>
  );
}

function SiteHeader({ siteName, primaryColor, navPages, domain, requestPath, isHome, menuOpen, onToggleMenu }: {
  siteName: string; primaryColor: string; navPages: PageData[]; domain: string; requestPath: string; isHome: boolean; menuOpen: boolean; onToggleMenu: () => void;
}) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href={`?domain=${domain}&path=/`} style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Creator<span style={{ color: primaryColor }}>AppU</span>
        </a>
        <button
          onClick={onToggleMenu}
          aria-label="Toggle menu"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', flexDirection: 'column', gap: 5 }}
          className="hamburger-btn"
        >
          <span style={{ display: 'block', width: 24, height: 2, background: '#0f172a' }} />
          <span style={{ display: 'block', width: 24, height: 2, background: '#0f172a' }} />
          <span style={{ display: 'block', width: 24, height: 2, background: '#0f172a' }} />
        </button>
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navPages.map(p => {
            const href = `?domain=${domain}&path=${p.slug === 'creatorappu-landing-page' ? '/' : `/${p.slug}`}`;
            const isActive = (isHome && p.slug === 'creatorappu-landing-page') || `/${p.slug}` === requestPath;
            const label = NAV_LABELS[p.slug] || p.title;
            const isCta = p.slug === 'pricing';
            return (
              <a
                key={p.id}
                href={href}
                style={{
                  padding: isCta ? '0.5rem 1.25rem' : '0.5rem 0.85rem',
                  fontSize: '0.9rem',
                  fontWeight: isCta ? 600 : 500,
                  color: isCta ? '#fff' : isActive ? primaryColor : '#475569',
                  background: isCta ? primaryColor : isActive ? `${primaryColor}08` : 'transparent',
                  textDecoration: 'none',
                  borderRadius: 6,
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </a>
            );
          })}
        </nav>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
          .nav-links { display: none !important; position: absolute; top: 64px; left: 0; right: 0; background: #fff; flex-direction: column; padding: 1rem; border-bottom: 1px solid #e2e8f0; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
          .nav-links.open { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

function SiteFooter({ siteName, primaryColor, navPages, domain }: {
  siteName: string; primaryColor: string; navPages: PageData[]; domain: string;
}) {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const }}>
          {navPages.map(p => {
            const href = `?domain=${domain}&path=${p.slug === 'creatorappu-landing-page' ? '/' : `/${p.slug}`}`;
            const label = NAV_LABELS[p.slug] || p.title;
            return (
              <a key={p.id} href={href} style={{ fontSize: '0.9rem', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}>
                {label}
              </a>
            );
          })}
        </div>
        <p style={{ fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          Powered by <a href="https://creatorapp.us" style={{ color: '#94a3b8', textDecoration: 'none' }}>CreatorApp</a>
        </p>
      </div>
    </footer>
  );
}

function BlockRenderer({ block, primaryColor }: { block: Block; primaryColor: string }) {
  const c = block.content || {};
  const s = block.styles || {};

  switch (block.type) {
    case 'hero':
      return <HeroBlock content={c} styles={s} primaryColor={primaryColor} />;
    case 'text':
      return <TextBlock content={c} />;
    case 'image':
      return <ImageBlock content={c} />;
    case 'stats':
      return <StatsBlock content={c} styles={s} primaryColor={primaryColor} />;
    case 'features':
      return <FeaturesBlock content={c} primaryColor={primaryColor} />;
    case 'testimonial':
      return <TestimonialBlock content={c} />;
    case 'cta':
      return <CtaBlock content={c} styles={s} primaryColor={primaryColor} />;
    case 'form':
      return <FormBlock content={c} primaryColor={primaryColor} />;
    case 'pricing':
      return <PricingBlock content={c} primaryColor={primaryColor} />;
    case 'video':
      return <VideoBlock content={c} />;
    case 'gallery':
      return <GalleryBlock content={c} />;
    default:
      return null;
  }
}

function HeroBlock({ content: c, styles: s, primaryColor }: { content: any; styles: any; primaryColor: string }) {
  const overlay = s.overlay || 'rgba(10, 30, 60, 0.7)';
  const bgImage = c.backgroundImage
    ? { backgroundImage: `url(${c.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)` };
  const padding = s.padding || '100px 20px';

  return (
    <section style={{ ...bgImage, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: overlay }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', textAlign: (s.textAlign || 'center') as any, padding, color: '#fff' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>{c.headline || ''}</h1>
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', opacity: 0.92, lineHeight: 1.65, marginBottom: '2rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>{c.subheadline || ''}</p>
        {c.ctaText && (
          <a href={c.ctaUrl || '#'} style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#fff', color: primaryColor, borderRadius: 8, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            {c.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function TextBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.8, color: '#334155' }} dangerouslySetInnerHTML={{ __html: c.text || '' }} />
    </section>
  );
}

function ImageBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <img src={c.url || ''} alt={c.alt || 'Image'} style={{ width: '100%', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
        {c.caption && <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>{c.caption}</p>}
      </div>
    </section>
  );
}

function StatsBlock({ content: c, styles: s, primaryColor }: { content: any; styles: any; primaryColor: string }) {
  const bg = s.backgroundColor || primaryColor;
  const isLight = bg === '#f8fafc' || bg === '#ffffff';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subColor = isLight ? '#64748b' : 'rgba(255,255,255,0.8)';

  return (
    <section style={{ background: bg, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        {c.headline && <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem', color: textColor }}>{c.headline}</h2>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem' }}>
          {(c.stats || []).map((stat: any, i: number) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: textColor, marginBottom: '0.25rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.95rem', color: subColor }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesBlock({ content: c, primaryColor }: { content: any; primaryColor: string }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {c.headline && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{c.headline}</h2>
            {c.subheadline && <p style={{ fontSize: '1.15rem', color: '#64748b' }}>{c.subheadline}</p>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {(c.features || []).map((f: any, i: number) => (
            <div key={i} style={{ padding: '2rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem', color: primaryColor }}>{f.icon && f.icon.length <= 4 ? f.icon : '\u2605'}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.65 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '4rem 1.5rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
            {c.avatar && <img src={c.avatar} alt={c.author || ''} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: '1.1rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.75, marginBottom: '1.25rem' }}>"{c.quote || ''}"</p>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>{c.author || ''}</p>
              {c.role && <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{c.role}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBlock({ content: c, styles: s, primaryColor }: { content: any; styles: any; primaryColor: string }) {
  const bgColor = s.backgroundColor || '#0f172a';

  return (
    <section style={{ background: bgColor, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{c.headline || ''}</h2>
        {c.description && <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.7, marginBottom: '2rem' }}>{c.description}</p>}
        {c.buttonText && (
          <a href={c.buttonUrl || '#'} style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#fff', color: bgColor, borderRadius: 8, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            {c.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function FormBlock({ content: c, primaryColor }: { content: any; primaryColor: string }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {c.headline && <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', textAlign: 'center', marginBottom: '0.5rem' }}>{c.headline}</h2>}
        {c.description && <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2rem' }}>{c.description}</p>}
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        >
          {(c.fields || []).map((field: any, i: number) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.35rem' }}>
                {field.label}{field.required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  placeholder={field.label}
                  required={field.required}
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  placeholder={field.label}
                  required={field.required}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '1rem' }}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            style={{
              width: '100%', padding: '0.85rem',
              background: submitted ? '#22c55e' : primaryColor,
              color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {submitted ? (c.successMessage || 'Submitted!') : (c.submitButtonText || 'Submit')}
          </button>
        </form>
      </div>
    </section>
  );
}

function PricingBlock({ content: c, primaryColor }: { content: any; primaryColor: string }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {c.headline && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{c.headline}</h2>
            {c.subheadline && <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '0.5rem' }}>{c.subheadline}</p>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {(c.plans || []).map((plan: any, i: number) => (
            <div
              key={i}
              style={{
                background: '#fff', borderRadius: 16, padding: '2.5rem 2rem',
                boxShadow: `0 4px 20px rgba(0,0,0,${plan.highlighted ? 0.12 : 0.06})`,
                border: plan.highlighted ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                transform: plan.highlighted ? 'scale(1.03)' : 'none',
                position: 'relative',
              }}
            >
              {plan.highlighted && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: primaryColor, color: '#fff', padding: '0.25rem 1rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>{plan.name}</h3>
              <div style={{ margin: '1.25rem 0 1.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a' }}>{plan.price}</span>
                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>{plan.period || ''}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                {(plan.features || []).map((feature: string, fi: number) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.95rem', color: '#475569' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>{'\u2713'}</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#enroll"
                style={{
                  display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none',
                  background: plan.highlighted ? primaryColor : '#f1f5f9',
                  color: plan.highlighted ? '#fff' : '#0f172a',
                }}
              >
                {plan.buttonText || 'Get Started'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {(c.headline || c.title) && <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{c.headline || c.title}</h2>}
        {c.description && <p style={{ color: '#64748b', marginBottom: '2rem' }}>{c.description}</p>}
        {c.videoUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
            <iframe src={c.videoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        ) : c.thumbnailUrl ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
            <img src={c.thumbnailUrl} alt="Video thumbnail" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', marginLeft: 4 }}>{'\u25B6'}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function GalleryBlock({ content: c }: { content: any }) {
  return (
    <section style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {c.headline && <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', color: '#0f172a', marginBottom: '2rem' }}>{c.headline}</h2>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {(c.images || []).map((img: any, i: number) => (
            <img key={i} src={img.url} alt={img.alt || `Gallery image ${i + 1}`} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 10 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, primaryColor }: { product: ProductData; primaryColor: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
      {product.thumbnail_url ? (
        <img src={product.thumbnail_url} alt={product.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 200, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '2.5rem' }}>
          {'\uD83D\uDCE6'}
        </div>
      )}
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{product.title}</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>{product.description || ''}</p>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: primaryColor }}>${product.price_amount} {product.price_currency || 'USD'}</div>
      </div>
    </div>
  );
}
