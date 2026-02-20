import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SiteProvider, useSite } from './contexts/SiteContext';
import { PlatformAdminProvider } from './contexts/PlatformAdminContext';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import PlatformAdminLayout from './components/PlatformAdminLayout';
import PlatformAdminGuard from './components/PlatformAdminGuard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import SiteSetup from './pages/SiteSetup';
import SubscriptionSelect from './pages/SubscriptionSelect';
import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import ProductNew from './pages/ProductNew';
import ProductDetail from './pages/ProductDetail';
import LessonNew from './pages/LessonNew';
import Funnels from './pages/Funnels';
import FunnelDetail from './pages/FunnelDetail';
import PageEditor from './pages/PageEditor';
import Email from './pages/Email';
import CampaignEditor from './pages/CampaignEditor';
import SequenceEditor from './pages/SequenceEditor';
import Automations from './pages/Automations';
import Commerce from './pages/Commerce';
import Webinars from './pages/Webinars';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import ProductPublic from './pages/ProductPublic';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import MarketingPage from './pages/MarketingPage';
import MarketingPagesAdmin from './pages/MarketingPagesAdmin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import PlatformAdminDashboard from './pages/PlatformAdmin/Dashboard';
import PlatformAdminSites from './pages/PlatformAdmin/Sites';
import PlatformAdminUsers from './pages/PlatformAdmin/Users';
import PlatformAdminAuditLog from './pages/PlatformAdmin/AuditLog';
import PlatformAdminSettings from './pages/PlatformAdmin/Settings';
import PlatformAdminInvitationCodes from './pages/PlatformAdmin/InvitationCodes';
import PricingReview from './pages/PricingReview';
import About from './pages/About';
import Documentation from './pages/Documentation';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import PublicSitePreview from './pages/PublicSitePreview';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { needsSetup, loading: siteLoading } = useSite();

  if (authLoading || siteLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (needsSetup) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function LandingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const MAIN_APP_DOMAINS = [
  'creatorapp.site',
  'www.creatorapp.site',
  'creatorapp.us',
  'www.creatorapp.us',
  'creatorappu.com',
  'www.creatorappu.com',
  'creatorapp.vercel.app',
  'localhost',
  '127.0.0.1',
];

function isCreatorSiteSubdomain(): string | null {
  const hostname = window.location.hostname;
  if (hostname.endsWith('.creatorapp.site') && !MAIN_APP_DOMAINS.includes(hostname)) {
    return hostname.replace('.creatorapp.site', '');
  }
  return null;
}

function useCustomDomainCheck(): { isCustomDomain: boolean; loading: boolean } {
  const [state, setState] = useState({ isCustomDomain: false, loading: true });

  useEffect(() => {
    async function checkCustomDomain() {
      const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '');

      if (MAIN_APP_DOMAINS.some(d => d.replace(/^www\./, '') === hostname)) {
        setState({ isCustomDomain: false, loading: false });
        return;
      }

      if (hostname.endsWith('.creatorapp.site')) {
        setState({ isCustomDomain: false, loading: false });
        return;
      }

      const { data } = await supabase
        .from('sites')
        .select('id')
        .eq('custom_domain', hostname)
        .eq('domain_verification_status', 'verified')
        .eq('status', 'active')
        .maybeSingle();

      setState({ isCustomDomain: !!data, loading: false });
    }

    checkCustomDomain();
  }, []);

  return state;
}

function CustomDomainSiteWrapper() {
  return <PublicSitePreview />;
}

function SubdomainSiteWrapper() {
  return <PublicSitePreview />;
}

function AppRoutes() {
  const subdomainSlug = isCreatorSiteSubdomain();
  const { isCustomDomain, loading: customDomainLoading } = useCustomDomainCheck();

  if (customDomainLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (subdomainSlug) {
    return (
      <Routes>
        <Route path="*" element={<SubdomainSiteWrapper />} />
      </Routes>
    );
  }

  if (isCustomDomain) {
    return (
      <Routes>
        <Route path="*" element={<CustomDomainSiteWrapper />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingRoute>
            <Landing />
          </LandingRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <LandingRoute>
            <Pricing />
          </LandingRoute>
        }
      />
      <Route
        path="/setup"
        element={
          <AuthenticatedRoute>
            <SiteSetup />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/subscription-select"
        element={
          <AuthenticatedRoute>
            <SubscriptionSelect />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <Layout>
              <Content />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/new"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductNew />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/:productId/lessons/new"
        element={
          <ProtectedRoute>
            <Layout>
              <LessonNew />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/funnels"
        element={
          <ProtectedRoute>
            <Layout>
              <Funnels />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/funnels/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <FunnelDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/funnels/:funnelId/pages/:pageId"
        element={
          <ProtectedRoute>
            <PageEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pages/editor/:pageId"
        element={
          <ProtectedRoute>
            <PageEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/email"
        element={
          <ProtectedRoute>
            <Layout>
              <Email />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/email/campaigns/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CampaignEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/email/sequences/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <SequenceEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/automations"
        element={
          <ProtectedRoute>
            <Layout>
              <Automations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commerce"
        element={
          <ProtectedRoute>
            <Layout>
              <Commerce />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commerce/products/new"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductNew />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commerce/products/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <Orders />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/webinars"
        element={
          <ProtectedRoute>
            <Layout>
              <Webinars />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Layout>
              <Contacts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ContactDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketing-pages"
        element={
          <ProtectedRoute>
            <Layout>
              <MarketingPagesAdmin />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/pages/about" element={<About />} />
      <Route path="/pages/documentation" element={<Documentation />} />
      <Route path="/pages/blog" element={<Blog />} />
      <Route path="/pages/contact" element={<Contact />} />
      <Route path="/pages/:slug" element={<MarketingPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/pricing-review" element={<PricingReview />} />
      <Route path="/site-preview" element={<PublicSitePreview />} />
      <Route path="/s/:slug" element={<PublicSitePreview />} />
      <Route path="/s/:slug/*" element={<PublicSitePreview />} />
      <Route path="/site/:siteId/product/:productId" element={<ProductPublic />} />
      <Route path="/site/:siteId/checkout" element={<Checkout />} />
      <Route path="/site/:siteId/success" element={<CheckoutSuccess />} />

      <Route
        path="/platform-admin"
        element={
          <PlatformAdminGuard>
            <PlatformAdminLayout>
              <PlatformAdminDashboard />
            </PlatformAdminLayout>
          </PlatformAdminGuard>
        }
      />
      <Route
        path="/platform-admin/sites"
        element={
          <PlatformAdminGuard requiredPermission="view_sites">
            <PlatformAdminLayout>
              <PlatformAdminSites />
            </PlatformAdminLayout>
          </PlatformAdminGuard>
        }
      />
      <Route
        path="/platform-admin/users"
        element={
          <PlatformAdminGuard requiredPermission="view_users">
            <PlatformAdminLayout>
              <PlatformAdminUsers />
            </PlatformAdminLayout>
          </PlatformAdminGuard>
        }
      />
      <Route
        path="/platform-admin/audit-log"
        element={
          <PlatformAdminGuard requiredPermission="view_analytics">
            <PlatformAdminLayout>
              <PlatformAdminAuditLog />
            </PlatformAdminLayout>
          </PlatformAdminGuard>
        }
      />
      <Route
        path="/platform-admin/settings"
        element={
          <PlatformAdminGuard requiredPermission="manage_platform_settings">
            <PlatformAdminLayout>
              <PlatformAdminSettings />
            </PlatformAdminLayout>
          </PlatformAdminGuard>
        }
      />
      <Route
        path="/platform-admin/invitation-codes"
        element={
          <PlatformAdminGuard requiredPermission="manage_platform_settings">
            <PlatformAdminLayout>
              <PlatformAdminInvitationCodes />
            </PlatformAdminLayout>
          </PlatformAdminGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <PlatformAdminProvider>
            <SiteProvider>
              <AppRoutes />
              <CookieConsent />
            </SiteProvider>
          </PlatformAdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
