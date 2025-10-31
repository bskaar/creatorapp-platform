import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/database.types';

type Site = Database['public']['Tables']['sites']['Row'];
type SiteMember = Database['public']['Tables']['site_members']['Row'];

interface SiteWithPlan extends Site {
  subscription_plan_name?: string;
}

interface SiteContextType {
  currentSite: SiteWithPlan | null;
  sites: SiteWithPlan[];
  userRole: SiteMember['role'] | null;
  loading: boolean;
  needsSetup: boolean;
  switchSite: (siteId: string) => void;
  refreshSites: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentSite, setCurrentSite] = useState<SiteWithPlan | null>(null);
  const [sites, setSites] = useState<SiteWithPlan[]>([]);
  const [userRole, setUserRole] = useState<SiteMember['role'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const loadSites = async () => {
    if (!user) {
      setSites([]);
      setCurrentSite(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    const { data: ownedSites } = await supabase
      .from('sites')
      .select('*')
      .eq('owner_id', user.id);

    const { data: memberships } = await supabase
      .from('site_members')
      .select('site_id')
      .eq('user_id', user.id);

    let memberSites: Site[] = [];
    if (memberships && memberships.length > 0) {
      const siteIds = memberships.map(m => m.site_id);
      const { data } = await supabase
        .from('sites')
        .select('*')
        .in('id', siteIds);
      memberSites = data || [];
    }

    const allSitesRaw = [
      ...(ownedSites || []),
      ...memberSites
    ].filter((site, index, self) =>
      index === self.findIndex((s) => s.id === site.id)
    ) as Site[];

    const allSites: SiteWithPlan[] = await Promise.all(
      allSitesRaw.map(async (site) => {
        if (site.platform_subscription_plan_id) {
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('display_name')
            .eq('id', site.platform_subscription_plan_id)
            .maybeSingle();
          return { ...site, subscription_plan_name: plan?.display_name || 'Launch' };
        }
        return { ...site, subscription_plan_name: 'Launch' };
      })
    );

    setSites(allSites);

    if (allSites.length === 0) {
      setNeedsSetup(true);
      setLoading(false);
      return;
    }

    setNeedsSetup(false);

    const savedSiteId = localStorage.getItem('currentSiteId');
    const siteToSet = savedSiteId
      ? allSites.find(s => s.id === savedSiteId) || allSites[0]
      : allSites[0];

    if (siteToSet) {
      setCurrentSite(siteToSet);
      localStorage.setItem('currentSiteId', siteToSet.id);

      if (siteToSet.owner_id === user.id) {
        setUserRole('owner');
      } else {
        const { data: membership } = await supabase
          .from('site_members')
          .select('role')
          .eq('site_id', siteToSet.id)
          .eq('user_id', user.id)
          .maybeSingle();
        setUserRole(membership?.role || null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSites();
  }, [user]);

  const switchSite = async (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (site && user) {
      setCurrentSite(site);
      localStorage.setItem('currentSiteId', siteId);

      if (site.owner_id === user.id) {
        setUserRole('owner');
      } else {
        const { data: membership } = await supabase
          .from('site_members')
          .select('role')
          .eq('site_id', siteId)
          .eq('user_id', user.id)
          .maybeSingle();
        setUserRole(membership?.role || null);
      }
    }
  };

  const refreshSites = async () => {
    setLoading(true);
    await loadSites();
  };

  const value = {
    currentSite,
    sites,
    userRole,
    loading,
    needsSetup,
    switchSite,
    refreshSites,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
