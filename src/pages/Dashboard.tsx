import { useEffect, useState } from 'react';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { DollarSign, Users, Mail, TrendingUp, FolderOpen, GitBranch, Video, ShoppingCart } from 'lucide-react';

interface Stats {
  revenue: number;
  contacts: number;
  products: number;
  emailsSent: number;
  activeFunnels: number;
  upcomingWebinars: number;
}

export default function Dashboard() {
  const { currentSite } = useSite();
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    contacts: 0,
    products: 0,
    emailsSent: 0,
    activeFunnels: 0,
    upcomingWebinars: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSite) return;

    const loadStats = async () => {
      const [ordersResult, contactsResult, productsResult, funnelsResult, webinarsResult] = await Promise.all([
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
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

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
      color: 'bg-green-500',
    },
    {
      name: 'Active Contacts',
      value: stats.contacts.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Published Products',
      value: stats.products.toLocaleString(),
      icon: FolderOpen,
      color: 'bg-orange-500',
    },
    {
      name: 'Emails Sent (This Month)',
      value: stats.emailsSent.toLocaleString(),
      icon: Mail,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Funnels',
      value: stats.activeFunnels.toLocaleString(),
      icon: GitBranch,
      color: 'bg-teal-500',
    },
    {
      name: 'Upcoming Webinars',
      value: stats.upcomingWebinars.toLocaleString(),
      icon: Video,
      color: 'bg-red-500',
    },
  ];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to {currentSite.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
            {currentSite.tier} Plan
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
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
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/content/new"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <FolderOpen className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Create New Product</span>
            </a>
            <a
              href="/funnels/new"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <GitBranch className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Build a Funnel</span>
            </a>
            <a
              href="/email/new"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Send Email Campaign</span>
            </a>
            <a
              href="/webinars/new"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <Video className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Schedule Webinar</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Plan Usage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Contacts</span>
                <span className="text-sm text-gray-900">{stats.contacts} / {currentSite.tier === 'launch' ? '10,000' : currentSite.tier === 'growth' ? '50,000' : '250,000'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((stats.contacts / (currentSite.tier === 'launch' ? 10000 : currentSite.tier === 'growth' ? 50000 : 250000)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Products</span>
                <span className="text-sm text-gray-900">{stats.products} / {currentSite.tier === 'launch' ? '3' : 'Unlimited'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{
                    width: currentSite.tier === 'launch' ? `${Math.min((stats.products / 3) * 100, 100)}%` : '100%'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Emails This Month</span>
                <span className="text-sm text-gray-900">{stats.emailsSent.toLocaleString()} / 50,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.emailsSent / 50000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
