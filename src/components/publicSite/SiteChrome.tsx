import type { PageData } from './types';

interface NavItem {
  slug: string;
  label: string;
  isHome: boolean;
  isCta: boolean;
}

const HIDDEN_SLUGS = ['thank-you', 'enrollment-confirmed', 'confirmation', 'success'];

const LABEL_MAP: Record<string, string> = {
  'pricing': 'Pricing',
  'about': 'About',
  'contact': 'Contact',
  'curriculum': 'Curriculum',
  'free-creator-toolkit': 'Free Toolkit',
};

function getNavItems(pages: PageData[]): NavItem[] {
  if (pages.length === 0) return [];

  const homePage = pages[0];
  const navPages = pages.filter(p =>
    p.id !== homePage.id &&
    !HIDDEN_SLUGS.some(h => p.slug.includes(h))
  );

  const items: NavItem[] = [
    { slug: homePage.slug, label: 'Home', isHome: true, isCta: false },
  ];

  navPages.slice(0, 6).forEach(p => {
    const mapped = Object.entries(LABEL_MAP).find(([key]) => p.slug.includes(key));
    items.push({
      slug: p.slug,
      label: mapped ? mapped[1] : p.title.replace(/^CreatorApp\s*[-–]\s*/, ''),
      isHome: false,
      isCta: p.slug.includes('pricing'),
    });
  });

  return items;
}

interface SiteHeaderProps {
  siteName: string;
  logoUrl?: string | null;
  primaryColor: string;
  pages: PageData[];
  siteSlug: string;
  currentPageSlug: string;
  isHome: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  buildPageUrl: (slug: string, isHome: boolean) => string;
  onNavigate: (url: string) => void;
}

export function SiteHeader({ siteName, logoUrl, primaryColor, pages, currentPageSlug, isHome, menuOpen, onToggleMenu, buildPageUrl, onNavigate }: SiteHeaderProps) {
  const navItems = getNavItems(pages);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a
          href={buildPageUrl('', true)}
          onClick={(e) => { e.preventDefault(); onNavigate(buildPageUrl('', true)); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{siteName}</span>
          )}
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
          {navItems.map(item => {
            const url = buildPageUrl(item.slug, item.isHome);
            const isActive = item.isHome ? isHome : item.slug === currentPageSlug;
            let color: string;
            let background: string;
            if (item.isCta) {
              color = '#fff';
              background = primaryColor;
            } else if (isActive) {
              color = primaryColor;
              background = 'transparent';
            } else {
              color = '#475569';
              background = 'transparent';
            }
            return (
              <a
                key={item.slug}
                href={url}
                onClick={(e) => { e.preventDefault(); onNavigate(url); }}
                style={{
                  padding: item.isCta ? '0.5rem 1.25rem' : '0.5rem 0.85rem',
                  fontSize: '0.9rem',
                  fontWeight: item.isCta || isActive ? 600 : 500,
                  color,
                  background,
                  textDecoration: 'none',
                  borderRadius: 6,
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
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

interface SiteFooterProps {
  siteName: string;
  primaryColor: string;
  pages: PageData[];
  siteSlug: string;
  buildPageUrl: (slug: string, isHome: boolean) => string;
  onNavigate: (url: string) => void;
}

export function SiteFooter({ siteName, pages, buildPageUrl, onNavigate }: SiteFooterProps) {
  const navItems = getNavItems(pages);

  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' as const }}>
          {navItems.map(item => {
            const url = buildPageUrl(item.slug, item.isHome);
            return (
              <a
                key={item.slug}
                href={url}
                onClick={(e) => { e.preventDefault(); onNavigate(url); }}
                style={{ fontSize: '0.9rem', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.15s' }}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <p style={{ fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          Powered by <span style={{ color: '#94a3b8' }}>CreatorApp</span>
        </p>
      </div>
    </footer>
  );
}
