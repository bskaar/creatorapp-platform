import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, TrendingDown, Globe, Users, DollarSign, ShoppingCart } from 'lucide-react';

interface PlatformStats {
  total_sites: number;
  active_sites_30d: number;
  total_users: number;
  new_sites_7d: number;
  new_sites_30d: number;
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_pages: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, changeLabel, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {change > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+{change}%</span>
                </>
              ) : change < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-600 font-medium">{change}%</span>
                </>
              ) : (
                <span className="text-gray-500 font-medium">No change</span>
              )}
              {changeLabel && <span className="text-gray-500 ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function PlatformAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from('platform_stats_summary').select('*').single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    try {
      await supabase.rpc('refresh_platform_stats');
      await fetchStats();
    } catch (error) {
      console.error('Error refreshing stats:', error);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load platform statistics</p>
      </div>
    );
  }

  const activityRate = stats.total_sites > 0
    ? Math.round((stats.active_sites_30d / stats.total_sites) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your platform's performance and growth</p>
        </div>
        <button
          onClick={refreshStats}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sites"
          value={stats.total_sites}
          change={stats.new_sites_7d > 0 ? Math.round((stats.new_sites_7d / stats.total_sites) * 100) : 0}
          changeLabel="this week"
          icon={<Globe className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <MetricCard
          title="Active Sites"
          value={stats.active_sites_30d}
          change={activityRate - 100}
          changeLabel={`${activityRate}% active`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <MetricCard
          title="Total Users"
          value={stats.total_users}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${stats.total_revenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
          color="bg-yellow-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Growth</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Last 7 Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new_sites_7d}</p>
              <p className="text-xs text-gray-500">new sites</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">Last 30 Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new_sites_30d}</p>
              <p className="text-xs text-gray-500">new sites</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Commerce</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">Products Listed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Content</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_pages}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">Avg per Site</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_sites > 0 ? Math.round(stats.total_pages / stats.total_sites) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">Platform Health</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {activityRate >= 70 && (
                  <>Your platform is healthy with {activityRate}% of sites active in the last 30 days.</>
                )}
                {activityRate >= 40 && activityRate < 70 && (
                  <>Your platform has moderate activity with {activityRate}% of sites active in the last 30 days.</>
                )}
                {activityRate < 40 && (
                  <>Consider engaging inactive sites. Only {activityRate}% of sites are active in the last 30 days.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
