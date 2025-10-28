import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';

interface SiteGuardProps {
  children: ReactNode;
  loadingMessage?: string;
}

export default function SiteGuard({ children, loadingMessage = 'Loading your site...' }: SiteGuardProps) {
  const { currentSite, loading, needsSetup } = useSite();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (needsSetup || !currentSite) {
    return <Navigate to="/site-setup" replace />;
  }

  return <>{children}</>;
}
