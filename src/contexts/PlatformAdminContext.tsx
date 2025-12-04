import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface PlatformAdmin {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin';
  permissions: {
    view_sites: boolean;
    manage_sites: boolean;
    view_users: boolean;
    manage_users: boolean;
    view_analytics: boolean;
    manage_billing: boolean;
    manage_platform_settings: boolean;
  };
}

interface PlatformAdminContextType {
  isAdmin: boolean;
  adminData: PlatformAdmin | null;
  loading: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: keyof PlatformAdmin['permissions']) => boolean;
  refreshAdminStatus: () => Promise<void>;
}

const PlatformAdminContext = createContext<PlatformAdminContextType | undefined>(undefined);

export function PlatformAdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<PlatformAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminData(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsAdmin(true);
        setAdminData(data as PlatformAdmin);
      } else {
        setIsAdmin(false);
        setAdminData(null);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const isSuperAdmin = adminData?.role === 'super_admin';

  const hasPermission = (permission: keyof PlatformAdmin['permissions']): boolean => {
    if (!adminData) return false;
    if (isSuperAdmin) return true;
    return adminData.permissions[permission] || false;
  };

  const refreshAdminStatus = async () => {
    await checkAdminStatus();
  };

  return (
    <PlatformAdminContext.Provider
      value={{
        isAdmin,
        adminData,
        loading,
        isSuperAdmin,
        hasPermission,
        refreshAdminStatus,
      }}
    >
      {children}
    </PlatformAdminContext.Provider>
  );
}

export function usePlatformAdmin() {
  const context = useContext(PlatformAdminContext);
  if (context === undefined) {
    throw new Error('usePlatformAdmin must be used within a PlatformAdminProvider');
  }
  return context;
}
