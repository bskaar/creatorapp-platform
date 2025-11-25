import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { DollarSign, Users, Mail, TrendingUp, FolderOpen, GitBranch, Video, ShoppingCart, Home, Zap, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    if (!currentSite) return;

    const loadStats = async () => {
      const [ordersResult, contactsResult, productsResult, funnelsResult, webinarsResult, planResult] = await Promise.all([
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

    loadStats();
  }, [currentSite]);

  const statCards = [
    {
      name: 'Total Revenue',
      value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      name: 'Active Contacts',
      value: stats.contacts.toLocaleString(),
      icon: Users,
      gradient: 'from-primary to-primary-dark',
    },
    {
      name: 'Published Products',
      value: stats.products.toLocaleString(),
      icon: FolderOpen,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      name: 'Emails Sent (This Month)',
      value: stats.emailsSent.toLocaleString(),
      icon: Mail,
      gradient: 'from-primary to-accent',
    },
    {
      name: 'Active Funnels',
      value: stats.activeFunnels.toLocaleString(),
      icon: GitBranch,
      gradient: 'from-teal-500 to-cyan-600',
    },
    {
      name: 'Upcoming Webinars',
      value: stats.upcomingWebinars.toLocaleString(),
      icon: Video,
      gradient: 'from-accent to-pink-600',
    },
  ];

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-dark">Dashboard</h1>
          <p className="text-text-secondary mt-2 text-lg">Welcome back to {currentSite.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-button text-sm font-semibold border border-primary/20">
            {subscriptionPlan} Plan
          </span>
          <Link
            to="/settings"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade Plan</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-card shadow-light p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-card shadow-light p-6 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-secondary mb-2">{stat.name}</p>
                    <p className="text-3xl font-bold text-dark">{stat.value}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-xl shadow-light`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-light p-8 border border-border">
          <h2 className="text-xl font-bold text-dark mb-6">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/funnels"
              className="flex items-center space-x-3 p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Edit Site Homepage</span>
            </a>
            <a
              href="/content/new"
              className="flex items-center space-x-3 p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Create New Product</span>
            </a>
            <a
              href="/funnels"
              className="flex items-center space-x-3 p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Build a Funnel</span>
            </a>
            <a
              href="/email"
              className="flex items-center space-x-3 p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Send Email Campaign</span>
            </a>
            <a
              href="/webinars"
              className="flex items-center space-x-3 p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Schedule Webinar</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-light p-8 border border-border">
          <h2 className="text-xl font-bold text-dark mb-6">Plan Usage</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-secondary">Contacts</span>
                <span className="text-sm font-bold text-dark">
                  {stats.contacts.toLocaleString()} / {planLimits.max_contacts ? planLimits.max_contacts.toLocaleString() : 'Unlimited'}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500"
                  style={{
                    width: planLimits.max_contacts
                      ? `${Math.min((stats.contacts / planLimits.max_contacts) * 100, 100)}%`
                      : '5%'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-secondary">Products</span>
                <span className="text-sm font-bold text-dark">
                  {stats.products} / {planLimits.max_products ?? 'Unlimited'}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: planLimits.max_products
                      ? `${Math.min((stats.products / planLimits.max_products) * 100, 100)}%`
                      : '5%'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-secondary">Emails This Month</span>
                <span className="text-sm font-bold text-dark">
                  {stats.emailsSent.toLocaleString()} / {planLimits.max_emails_per_month ? planLimits.max_emails_per_month.toLocaleString() : 'Unlimited'}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                  style={{
                    width: planLimits.max_emails_per_month
                      ? `${Math.min((stats.emailsSent / planLimits.max_emails_per_month) * 100, 100)}%`
                      : '5%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
