import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SiteProvider, useSite } from './contexts/SiteContext';
import Layout from './components/Layout';
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
import Commerce from './pages/Commerce';
import Webinars from './pages/Webinars';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

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

function AppRoutes() {
  return (
    <Routes>
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
      <Route path="/pricing" element={<Pricing />} />
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <SiteSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription-select"
        element={
          <ProtectedRoute>
            <SubscriptionSelect />
          </ProtectedRoute>
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
        path="/pages/:pageId"
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
      <Route path="/" element={<Navigate to="/pricing" replace />} />
      <Route path="*" element={<Navigate to="/pricing" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteProvider>
          <AppRoutes />
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
