import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { DollarSign, Users, Mail, FolderOpen, GitBranch, Video, Zap, ArrowRight, HelpCircle, MessageCircle, AlertTriangle } from 'lucide-react';
import OnboardingWizard from '../components/OnboardingWizard';
import GettingStartedChecklist from '../components/GettingStartedChecklist';
import OnboardingTour, { dashboardTourSteps } from '../components/OnboardingTour';
import AICoFounderCard from '../components/AICoFounderCard';
import GameplanManager from '../components/GameplanManager';
import LaunchSuccessBanner from '../components/LaunchSuccessBanner';
import SiteStatusIndicator from '../components/SiteStatusIndicator';
import ContextualRecommendations from '../components/ContextualRecommendations';

interface Stats {
  revenue: number;
  contacts: number;
  products: number;
  emailsSent: number;
  activeFunnels: number;
  upcomingWebinars: number;
}

interface PlanLimits {
  max_products: number | null;
  max_contacts: number | null;
  max_funnels: number | null;
  max_emails_per_month: number | null;
}

interface OnboardingData {
  template_id?: string;
  template_name?: string;
  business_description?: string;
  industry?: string;
  completed_at?: string;
}

type UserStage = 'new' | 'launched' | 'growing' | 'established';
type FunnelType = 'course' | 'webinar' | 'lead_magnet' | 'general';

export default function Dashboard() {
  const { currentSite, loading: siteLoading } = useSite();
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    contacts: 0,
    products: 0,
    emailsSent: 0,
    activeFunnels: 0,
    upcomingWebinars: 0,
  });
  const [loading, setLoading] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Launch');
  const [planLimits, setPlanLimits] = useState<PlanLimits>({
    max_products: 3,
    max_contacts: 10000,
    max_funnels: 3,
    max_emails_per_month: 50000,
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showLaunchBanner, setShowLaunchBanner] = useState(false);
  const [hasStripe, setHasStripe] = useState(false);
  const [hasEmailSequence, setHasEmailSequence] = useState(false);

  const onboardingData = currentSite?.onboarding_data as OnboardingData | null;

  const userStage: UserStage = useMemo(() => {
    if (!currentSite?.onboarding_completed) return 'new';
    if (currentSite.status !== 'active') return 'new';
    if (stats.revenue > 1000) return 'established';
    if (stats.contacts > 50 || stats.revenue > 0) return 'growing';
    return 'launched';
  }, [currentSite, stats]);

  const funnelType: FunnelType = useMemo(() => {
    const templateName = onboardingData?.template_name?.toLowerCase() || '';
    if (templateName.includes('course') || templateName.includes('sales')) return 'course';
    if (templateName.includes('webinar')) return 'webinar';
    if (templateName.includes('lead') || templateName.includes('opt')) return 'lead_magnet';
    return 'general';
  }, [onboardingData]);

  const welcomeMessage = useMemo(() => {
    switch (userStage) {
      case 'new':
        return "Let's get your first funnel live";
      case 'launched':
        return "Your site is live - here's what to do next";
      case 'growing':
        return "Your business is growing - keep the momentum";
      case 'established':
        return "Great progress! Here's your business at a glance";
      default:
        return "Welcome back";
    }
  }, [userStage]);

  useEffect(() => {
    if (!currentSite) return;

    if (!currentSite.onboarding_completed) {
      setShowOnboarding(true);
    } else if (currentSite.show_tour) {
      const hasSeenTour = localStorage.getItem(`tour-completed-${currentSite.id}`);
      if (!hasSeenTour) {
        setTimeout(() => setShowTour(true), 1000);
      }
    }

    const launchBannerDismissed = localStorage.getItem(`launch-banner-dismissed-${currentSite.id}`);
    const launchBannerShownAt = localStorage.getItem(`launch-banner-shown-${currentSite.id}`);

    if (currentSite.status === 'active' && currentSite.onboarding_completed) {
      if (!launchBannerDismissed) {
        if (!launchBannerShownAt) {
          localStorage.setItem(`launch-banner-shown-${currentSite.id}`, new Date().toISOString());
          setShowLaunchBanner(true);
        } else {
          const shownDate = new Date(launchBannerShownAt);
          const daysSinceShown = (Date.now() - shownDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceShown < 7) {
            setShowLaunchBanner(true);
          }
        }
      }
    }

    loadStats();
  }, [currentSite]);

  const loadStats = async () => {
    if (!currentSite) return;

    const [ordersResult, contactsResult, productsResult, funnelsResult, webinarsResult, planResult, sequencesResult] = await Promise.all([
      supabase
        .from('orders')
        .select('amount')
        .eq('site_id', currentSite.id)
        .eq('payment_status', 'completed'),
      supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', currentSite.id)
        .eq('status', 'active'),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', currentSite.id)
        .eq('status', 'published'),
      supabase
        .from('funnels')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', currentSite.id)
        .eq('status', 'active'),
      supabase
        .from('webinars')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', currentSite.id)
        .in('status', ['scheduled', 'live']),
      supabase
        .from('subscription_plans')
        .select('display_name, limits')
        .eq('id', currentSite.platform_subscription_plan_id)
        .maybeSingle(),
      supabase
        .from('email_sequences')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', currentSite.id)
        .eq('status', 'active'),
    ]);

    const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

    if (planResult.data?.display_name) {
      setSubscriptionPlan(planResult.data.display_name);
    }

    if (planResult.data?.limits) {
      setPlanLimits({
        max_products: planResult.data.limits.max_products ?? null,
        max_contacts: planResult.data.limits.max_contacts ?? null,
        max_funnels: planResult.data.limits.max_funnels ?? null,
        max_emails_per_month: planResult.data.limits.max_emails_per_month ?? null,
      });
    }

    setHasStripe(!!currentSite.stripe_account_id);
    setHasEmailSequence((sequencesResult.count || 0) > 0);

    setStats({
      revenue: totalRevenue,
      contacts: contactsResult.count || 0,
      products: productsResult.count || 0,
      emailsSent: currentSite.emails_sent_month,
      activeFunnels: funnelsResult.count || 0,
      upcomingWebinars: webinarsResult.count || 0,
    });

    setLoading(false);
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    setShowTour(true);
  };

  const handleTourComplete = async () => {
    setShowTour(false);
    if (currentSite) {
      localStorage.setItem(`tour-completed-${currentSite.id}`, 'true');
      await supabase
        .from('sites')
        .update({ show_tour: false })
        .eq('id', currentSite.id);
    }
  };

  const handleTourSkip = () => {
    setShowTour(false);
    if (currentSite) {
      localStorage.setItem(`tour-completed-${currentSite.id}`, 'true');
    }
  };

  const handleDismissLaunchBanner = () => {
    setShowLaunchBanner(false);
    if (currentSite) {
      localStorage.setItem(`launch-banner-dismissed-${currentSite.id}`, 'true');
    }
  };

  const showStats = userStage !== 'new';
  const hasNonZeroStats = stats.revenue > 0 || stats.contacts > 0 || stats.products > 0;

  const visibleStatCards = useMemo(() => {
    const allCards = [
      {
        name: 'Total Revenue',
        value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        gradient: 'from-emerald-500 to-green-600',
        show: stats.revenue > 0 || userStage === 'established',
      },
      {
        name: 'Active Contacts',
        value: stats.contacts.toLocaleString(),
        icon: Users,
        gradient: 'from-primary to-primary-dark',
        show: stats.contacts > 0 || userStage !== 'new',
      },
      {
        name: 'Published Products',
        value: stats.products.toLocaleString(),
        icon: FolderOpen,
        gradient: 'from-orange-500 to-red-500',
        show: stats.products > 0 || userStage !== 'new',
      },
      {
        name: 'Emails Sent (This Month)',
        value: stats.emailsSent.toLocaleString(),
        icon: Mail,
        gradient: 'from-primary to-accent',
        show: stats.emailsSent > 0 || userStage === 'established',
      },
      {
        name: 'Active Funnels',
        value: stats.activeFunnels.toLocaleString(),
        icon: GitBranch,
        gradient: 'from-teal-500 to-cyan-600',
        show: stats.activeFunnels > 0 || userStage !== 'new',
      },
      {
        name: 'Upcoming Webinars',
        value: stats.upcomingWebinars.toLocaleString(),
        icon: Video,
        gradient: 'from-accent to-pink-600',
        show: stats.upcomingWebinars > 0 || funnelType === 'webinar',
      },
    ];

    return allCards.filter(card => card.show);
  }, [stats, userStage, funnelType]);

  const showPlanUsage = useMemo(() => {
    const contactsPercent = planLimits.max_contacts ? (stats.contacts / planLimits.max_contacts) * 100 : 0;
    const productsPercent = planLimits.max_products ? (stats.products / planLimits.max_products) * 100 : 0;
    const emailsPercent = planLimits.max_emails_per_month ? (stats.emailsSent / planLimits.max_emails_per_month) * 100 : 0;

    return contactsPercent > 50 || productsPercent > 50 || emailsPercent > 50 || userStage === 'established';
  }, [stats, planLimits, userStage]);

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'from-red-500 to-red-600';
    if (percent >= 75) return 'from-amber-500 to-orange-500';
    return 'from-primary to-primary-dark';
  };

  if (siteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your site...</p>
        </div>
      </div>
    );
  }

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Site Selected</h2>
          <p className="text-gray-600">Please create a site to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      )}

      {showTour && (
        <OnboardingTour
          steps={dashboardTourSteps}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
            <p className="text-text-secondary mt-1">{welcomeMessage}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-button text-sm font-semibold border border-primary/20">
              {subscriptionPlan} Plan
            </span>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <Zap className="w-4 h-4" />
              <span>Upgrade</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <SiteStatusIndicator
          isPublished={currentSite.status === 'active'}
          subdomain={currentSite.slug || currentSite.name.toLowerCase().replace(/\s+/g, '-')}
          customDomain={currentSite.domain_verification_status === 'verified' ? currentSite.custom_domain : null}
          lastUpdated={currentSite.updated_at}
        />

        {showLaunchBanner && currentSite.status === 'active' && (
          <LaunchSuccessBanner
            siteName={currentSite.name}
            subdomain={currentSite.slug || currentSite.name.toLowerCase().replace(/\s+/g, '-')}
            customDomain={currentSite.domain_verification_status === 'verified' ? currentSite.custom_domain : null}
            templateName={onboardingData?.template_name}
            onDismiss={handleDismissLaunchBanner}
          />
        )}

        {userStage === 'new' && <GettingStartedChecklist />}

        {showStats && !loading && visibleStatCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleStatCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary mb-1">{stat.name}</p>
                      <p className="text-2xl font-bold text-dark">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-7 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {userStage !== 'new' && <GettingStartedChecklist />}

        {userStage !== 'new' && (
          <ContextualRecommendations
            userStage={userStage}
            funnelType={funnelType}
            hasProducts={stats.products > 0}
            hasContacts={stats.contacts > 0}
            hasStripe={hasStripe}
            hasEmailSequence={hasEmailSequence}
          />
        )}

        {(userStage === 'growing' || userStage === 'established') && (
          <AICoFounderCard />
        )}

        <GameplanManager />

        {showPlanUsage && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-dark mb-5">Plan Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planLimits.max_contacts && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">Contacts</span>
                    <span className="text-sm font-bold text-dark">
                      {stats.contacts.toLocaleString()} / {planLimits.max_contacts.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${getUsageColor((stats.contacts / planLimits.max_contacts) * 100)} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min((stats.contacts / planLimits.max_contacts) * 100, 100)}%` }}
                    />
                  </div>
                  {(stats.contacts / planLimits.max_contacts) >= 0.9 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Approaching limit
                    </p>
                  )}
                </div>
              )}

              {planLimits.max_products && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">Products</span>
                    <span className="text-sm font-bold text-dark">
                      {stats.products} / {planLimits.max_products}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${getUsageColor((stats.products / planLimits.max_products) * 100)} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min((stats.products / planLimits.max_products) * 100, 100)}%` }}
                    />
                  </div>
                  {(stats.products / planLimits.max_products) >= 0.9 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Approaching limit
                    </p>
                  )}
                </div>
              )}

              {planLimits.max_emails_per_month && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">Emails This Month</span>
                    <span className="text-sm font-bold text-dark">
                      {stats.emailsSent.toLocaleString()} / {planLimits.max_emails_per_month.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${getUsageColor((stats.emailsSent / planLimits.max_emails_per_month) * 100)} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min((stats.emailsSent / planLimits.max_emails_per_month) * 100, 100)}%` }}
                    />
                  </div>
                  {(stats.emailsSent / planLimits.max_emails_per_month) >= 0.9 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Approaching limit
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-dark mb-1">Need Help?</h2>
              <p className="text-text-secondary text-sm mb-4">
                Our support team is here to help you succeed.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@creatorapp.us"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg hover:shadow-sm transition-all border border-gray-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Support
                </a>
                <Link
                  to="/pages/documentation"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
                >
                  View Documentation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
