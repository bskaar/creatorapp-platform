import { useState, useEffect } from 'react';
import { Globe, ExternalLink, Smartphone, Monitor, MapPin } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface TrafficSource {
  source: string;
  visitors: number;
  pageViews: number;
  bounceRate: number;
}

interface TopPage {
  url: string;
  title: string;
  views: number;
  avgDuration: number;
}

interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
}

export default function TrafficAnalytics() {
  const { currentSite } = useSite();
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [devices, setDevices] = useState<DeviceStats>({ desktop: 0, mobile: 0, tablet: 0 });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (currentSite) {
      loadTrafficData();
    }
  }, [currentSite?.id, dateRange]);

  const loadTrafficData = async () => {
    if (!currentSite) return;

    try {
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(now.getDate() - days);

      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .eq('site_id', currentSite.id)
        .gte('started_at', startDate.toISOString());

      if (sessionsError) throw sessionsError;

      const { data: pageViews, error: viewsError } = await supabase
        .from('analytics_page_views')
        .select('*')
        .eq('site_id', currentSite.id)
        .gte('viewed_at', startDate.toISOString());

      if (viewsError) throw viewsError;

      const sourceMap = new Map<string, { visitors: Set<string>, views: number, bounces: number }>();

      (sessions || []).forEach(session => {
        const source = session.utm_source || session.referrer || 'Direct';
        if (!sourceMap.has(source)) {
          sourceMap.set(source, { visitors: new Set(), views: 0, bounces: 0 });
        }
        const stats = sourceMap.get(source)!;
        stats.visitors.add(session.visitor_id);
        if (session.page_views_count === 1) {
          stats.bounces++;
        }
      });

      (pageViews || []).forEach(view => {
        const session = sessions?.find(s => s.id === view.session_id);
        const source = session?.utm_source || session?.referrer || 'Direct';
        if (sourceMap.has(source)) {
          sourceMap.get(source)!.views++;
        }
      });

      const trafficSources = Array.from(sourceMap.entries()).map(([source, stats]) => ({
        source,
        visitors: stats.visitors.size,
        pageViews: stats.views,
        bounceRate: stats.visitors.size > 0 ? (stats.bounces / stats.visitors.size) * 100 : 0,
      })).sort((a, b) => b.visitors - a.visitors).slice(0, 10);

      const pageMap = new Map<string, { title: string, views: number, totalDuration: number }>();

      (pageViews || []).forEach(view => {
        const key = view.page_url;
        if (!pageMap.has(key)) {
          pageMap.set(key, { title: view.page_title || view.page_url, views: 0, totalDuration: 0 });
        }
        const stats = pageMap.get(key)!;
        stats.views++;
        stats.totalDuration += view.time_on_page || 0;
      });

      const pages = Array.from(pageMap.entries()).map(([url, stats]) => ({
        url,
        title: stats.title,
        views: stats.views,
        avgDuration: stats.views > 0 ? stats.totalDuration / stats.views : 0,
      })).sort((a, b) => b.views - a.views).slice(0, 10);

      const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
      (sessions || []).forEach(session => {
        const device = session.device_type?.toLowerCase() || 'desktop';
        if (device in deviceCounts) {
          deviceCounts[device as keyof DeviceStats]++;
        } else {
          deviceCounts.desktop++;
        }
      });

      setSources(trafficSources);
      setTopPages(pages);
      setDevices(deviceCounts);
    } catch (error) {
      console.error('Error loading traffic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-card shadow-light border border-border p-6 border border-border">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalDevices = devices.desktop + devices.mobile + devices.tablet;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Traffic Analytics</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-light border border-border p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Traffic Sources</h3>
          </div>

          {sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map((source, index) => {
                const maxVisitors = Math.max(...sources.map(s => s.visitors));
                const widthPercent = (source.visitors / maxVisitors) * 100;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-dark">{source.source}</span>
                      <span className="text-text-secondary">{source.visitors} visitors</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{source.pageViews} page views</span>
                      <span>{source.bounceRate.toFixed(1)}% bounce rate</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No traffic data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-card shadow-light border border-border p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-dark">Top Pages</h3>
          </div>

          {topPages.length > 0 ? (
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark truncate">{page.title}</p>
                    <p className="text-xs text-gray-500 truncate">{page.url}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-dark">{page.views}</p>
                    <p className="text-xs text-gray-500">{formatDuration(page.avgDuration)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No page data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-card shadow-light border border-border p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-dark">Device Breakdown</h3>
          </div>

          {totalDevices > 0 ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-gray-700">Desktop</span>
                  </div>
                  <span className="text-sm font-medium text-dark">
                    {devices.desktop} ({((devices.desktop / totalDevices) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(devices.desktop / totalDevices) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-gray-700">Mobile</span>
                  </div>
                  <span className="text-sm font-medium text-dark">
                    {devices.mobile} ({((devices.mobile / totalDevices) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(devices.mobile / totalDevices) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-gray-700">Tablet</span>
                  </div>
                  <span className="text-sm font-medium text-dark">
                    {devices.tablet} ({((devices.tablet / totalDevices) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(devices.tablet / totalDevices) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No device data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
