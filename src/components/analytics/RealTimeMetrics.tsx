import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, DollarSign, Activity } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-card shadow-light p-6 border border-border hover:shadow-medium transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl shadow-light ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            change >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-dark mb-1">{value}</h3>
      <p className="text-sm text-text-secondary font-semibold">{title}</p>
    </div>
  );
}

export default function RealTimeMetrics() {
  const { currentSite } = useSite();
  const [metrics, setMetrics] = useState({
    activeVisitors: 0,
    todayPageViews: 0,
    todayConversions: 0,
    todayRevenue: 0,
    yesterdayPageViews: 0,
    yesterdayConversions: 0,
    yesterdayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentSite) {
      loadMetrics();
      const interval = setInterval(loadMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [currentSite?.id]);

  const loadMetrics = async () => {
    if (!currentSite) return;

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const activeThreshold = new Date(now.getTime() - 5 * 60 * 1000);

      const [
        activeSessions,
        todayViews,
        yesterdayViews,
        todayConv,
        yesterdayConv,
        todayRev,
        yesterdayRev,
      ] = await Promise.all([
        supabase
          .from('analytics_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', currentSite.id)
          .gte('last_activity_at', activeThreshold.toISOString()),

        supabase
          .from('analytics_page_views')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', currentSite.id)
          .gte('viewed_at', todayStart.toISOString()),

        supabase
          .from('analytics_page_views')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', currentSite.id)
          .gte('viewed_at', yesterdayStart.toISOString())
          .lt('viewed_at', todayStart.toISOString()),

        supabase
          .from('analytics_conversions')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', currentSite.id)
          .gte('converted_at', todayStart.toISOString()),

        supabase
          .from('analytics_conversions')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', currentSite.id)
          .gte('converted_at', yesterdayStart.toISOString())
          .lt('converted_at', todayStart.toISOString()),

        supabase
          .from('analytics_revenue_summary')
          .select('total_revenue')
          .eq('site_id', currentSite.id)
          .eq('date', todayStart.toISOString().split('T')[0])
          .maybeSingle(),

        supabase
          .from('analytics_revenue_summary')
          .select('total_revenue')
          .eq('site_id', currentSite.id)
          .eq('date', yesterdayStart.toISOString().split('T')[0])
          .maybeSingle(),
      ]);

      setMetrics({
        activeVisitors: activeSessions.count || 0,
        todayPageViews: todayViews.count || 0,
        todayConversions: todayConv.count || 0,
        todayRevenue: todayRev.data?.total_revenue || 0,
        yesterdayPageViews: yesterdayViews.count || 0,
        yesterdayConversions: yesterdayConv.count || 0,
        yesterdayRevenue: yesterdayRev.data?.total_revenue || 0,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-card shadow-light p-6 border border-border animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
            <div className="h-8 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Real-Time Overview</h2>
          <p className="text-sm text-text-secondary mt-1 font-medium">Live metrics updating every 30 seconds</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
          <Activity className="h-4 w-4 animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Visitors"
          value={metrics.activeVisitors}
          icon={<Users className="h-6 w-6 text-primary" />}
          color="bg-gradient-to-br from-primary/10 to-primary/5"
        />

        <MetricCard
          title="Page Views Today"
          value={metrics.todayPageViews.toLocaleString()}
          change={calculateChange(metrics.todayPageViews, metrics.yesterdayPageViews)}
          icon={<Eye className="h-6 w-6 text-accent" />}
          color="bg-gradient-to-br from-accent/10 to-accent/5"
        />

        <MetricCard
          title="Conversions Today"
          value={metrics.todayConversions}
          change={calculateChange(metrics.todayConversions, metrics.yesterdayConversions)}
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
          color="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
        />

        <MetricCard
          title="Revenue Today"
          value={`$${metrics.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={calculateChange(metrics.todayRevenue, metrics.yesterdayRevenue)}
          icon={<DollarSign className="h-6 w-6 text-amber-600" />}
          color="bg-gradient-to-br from-amber-500/10 to-amber-500/5"
        />
      </div>
    </div>
  );
}
