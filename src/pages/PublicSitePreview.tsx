import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SiteHeader, SiteFooter } from '../components/publicSite/SiteChrome';
import { BlockRenderer } from '../components/publicSite/BlockRenderer';
import { ProductCard } from '../components/publicSite/ProductCard';
import type { SiteData, PageData, ProductData, Block } from '../components/publicSite/types';

function getSubdomainSlug(): string {
  const hostname = window.location.hostname;
  if (hostname.endsWith('.creatorapp.site') && hostname !== 'creatorapp.site' && hostname !== 'www.creatorapp.site') {
    return hostname.replace('.creatorapp.site', '');
  }
  return '';
}

export default function PublicSitePreview() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subdomainSlug = getSubdomainSlug();
  const siteSlug = params.slug || subdomainSlug;
  const pageSlug = params['*'] || '';
  const legacyDomain = searchParams.get('domain') || '';
  const legacyPath = searchParams.get('path') || '';

  const [site, setSite] = useState<SiteData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isSubdomainMode = !!subdomainSlug;
  const isLegacyMode = !siteSlug && !!legacyDomain;

  useEffect(() => {
    loadSiteData();
  }, [siteSlug, pageSlug, legacyDomain, legacyPath]);

  async function loadSiteData() {
    setLoading(true);
    setError(null);

    try {
      let siteData: SiteData | null = null;

      if (siteSlug) {
        siteData = await findSiteBySlug(siteSlug);
      } else if (legacyDomain) {
        siteData = await findSiteByDomain(legacyDomain);
      } else {
        setError('No site specified');
        setLoading(false);
        return;
      }

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

  async function findSiteBySlug(slug: string): Promise<SiteData | null> {
    const { data } = await supabase
      .from('sites')
      .select('id, name, slug, primary_color, settings, logo_url')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();
    return data as SiteData | null;
  }

  async function findSiteByDomain(domainStr: string): Promise<SiteData | null> {
    const clean = domainStr.toLowerCase().replace(/^www\./, '');

    const { data: byCustom } = await supabase
      .from('sites')
      .select('id, name, slug, primary_color, settings, logo_url')
      .eq('custom_domain', clean)
      .eq('domain_verification_status', 'verified')
      .eq('status', 'active')
      .maybeSingle();
    if (byCustom) return byCustom as SiteData;

    if (clean.endsWith('.creatorapp.site')) {
      const slug = clean.replace('.creatorapp.site', '');
      return findSiteBySlug(slug);
    }

    return findSiteBySlug(clean);
  }

  function buildPageUrl(targetPageSlug: string, isHome: boolean): string {
    if (isLegacyMode) {
      return `/site-preview?domain=${legacyDomain}&path=${isHome ? '/' : `/${targetPageSlug}`}`;
    }
    if (isSubdomainMode) {
      const homeSlug = pages[0]?.slug || 'home';
      return isHome ? `/${homeSlug}` : `/${targetPageSlug}`;
    }
    const homeSlug = pages[0]?.slug || 'home';
    return isHome ? `/s/${site?.slug}/${homeSlug}` : `/s/${site?.slug}/${targetPageSlug}`;
  }

  function handleNavigate(url: string) {
    navigate(url);
    setMenuOpen(false);
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
          <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>This site is not configured or is currently inactive.</p>
        </div>
      </div>
    );
  }

  const primaryColor = site.primary_color || '#0ea5e9';
  const homePage = pages.find(p => p.page_type === 'landing') || pages[0];

  if (!isLegacyMode && !pageSlug && homePage && site) {
    const homeTarget = isSubdomainMode ? `/${homePage.slug}` : `/s/${site.slug}/${homePage.slug}`;
    navigate(homeTarget, { replace: true });
    return null;
  }

  const requestPath = isLegacyMode
    ? legacyPath
    : isSubdomainMode
      ? window.location.pathname
      : (pageSlug ? `/${pageSlug}` : '/');
  const isHome = requestPath === '/' || requestPath === '' || (homePage && pageSlug === homePage.slug);

  const currentPage = isHome ? homePage : pages.find(p => `/${p.slug}` === requestPath || p.slug === pageSlug);

  if (!currentPage) {
    const homeUrl = buildPageUrl('', true);
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div>
          <h1 style={{ fontSize: '6rem', marginBottom: '1rem', opacity: 0.3 }}>404</h1>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.7, marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
          <button onClick={() => handleNavigate(homeUrl)} style={{ display: 'inline-block', padding: '1rem 2rem', background: primaryColor, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Go Home</button>
        </div>
      </div>
    );
  }

  const blocks: Block[] = currentPage.content?.blocks || [];
  const seoTitle = currentPage.seo_title || currentPage.title || site.name;
  const seoDesc = currentPage.seo_description || site.settings?.description || '';

  document.title = seoTitle;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; -webkit-font-smoothing: antialiased; }
        img { max-width: 100%; }
        a { color: inherit; }
      `}</style>
      {seoDesc && <meta name="description" content={seoDesc} />}

      <SiteHeader
        siteName={site.name}
        logoUrl={site.logo_url}
        primaryColor={primaryColor}
        pages={pages}
        siteSlug={site.slug}
        currentPageSlug={isHome ? '' : (currentPage?.slug || '')}
        isHome={isHome}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(!menuOpen)}
        buildPageUrl={buildPageUrl}
        onNavigate={handleNavigate}
      />

      <main>
        {blocks.map((block, i) => (
          <BlockRenderer
            key={block.id || i}
            block={block}
            primaryColor={primaryColor}
            onNavigate={handleNavigate}
            buildPageUrl={buildPageUrl}
          />
        ))}

        {products.length > 0 && (
          <section style={{ padding: '4rem 1.5rem' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', color: '#0f172a', marginBottom: '2.5rem' }}>Our Products</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} primaryColor={primaryColor} siteId={site.id} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter
        siteName={site.name}
        primaryColor={primaryColor}
        pages={pages}
        siteSlug={site.slug}
        buildPageUrl={buildPageUrl}
        onNavigate={handleNavigate}
      />
    </>
  );
}
