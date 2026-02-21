import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Brain, TrendingUp, DollarSign, Zap, ChevronDown, ChevronUp, BarChart3, Clock } from 'lucide-react';

interface SiteUsageSummary {
  site_id: string;
  site_name: string;
  site_slug: string;
  total_requests: number;
  total_tokens: number;
  total_cost_cents: number;
  chat_requests: number;
  gameplan_requests: number;
  text_gen_requests: number;
  sonnet_requests: number;
  haiku_requests: number;
  last_used: string;
}

interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost_cents: number;
}

interface PlatformAIStats {
  total_requests: number;
  total_tokens: number;
  total_cost_cents: number;
  active_sites: number;
  requests_today: number;
  cost_today_cents: number;
}

const MODEL_COSTS: Record<string, number> = {
  sonnet: 0.003,
  haiku: 0.00025,
};

function formatCost(cents: number): string {
  if (cents < 100) return `${cents}¢`;
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
}

type SortKey = 'total_requests' | 'total_tokens' | 'total_cost_cents' | 'last_used';

export default function AIUsage() {
  const [stats, setStats] = useState<PlatformAIStats | null>(null);
  const [siteUsage, setSiteUsage] = useState<SiteUsageSummary[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [sortKey, setSortKey] = useState<SortKey>('total_cost_cents');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const [siteBreakdown, setSiteBreakdown] = useState<Record<string, DailyUsage[]>>({});

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    setLoading(true);

    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usageResult, sitesResult] = await Promise.all([
      supabase
        .from('ai_usage_tracking')
        .select('site_id, request_type, model_used, tokens_used, cost_cents, created_at')
        .gte('created_at', sinceISO)
        .order('created_at', { ascending: false }),
      supabase
        .from('sites')
        .select('id, name, slug'),
    ]);

    const rows = usageResult.data || [];
    const sites = sitesResult.data || [];
    const siteMap: Record<string, { name: string; slug: string }> = {};
    sites.forEach(s => { siteMap[s.id] = { name: s.name, slug: s.slug }; });

    const totalRequests = rows.length;
    const totalTokens = rows.reduce((s, r) => s + (r.tokens_used || 0), 0);
    const totalCost = rows.reduce((s, r) => s + (r.cost_cents || 0), 0);
    const activeSiteIds = new Set(rows.map(r => r.site_id)).size;
    const todayRows = rows.filter(r => r.created_at >= today.toISOString());
    const requestsToday = todayRows.length;
    const costToday = todayRows.reduce((s, r) => s + (r.cost_cents || 0), 0);

    setStats({
      total_requests: totalRequests,
      total_tokens: totalTokens,
      total_cost_cents: totalCost,
      active_sites: activeSiteIds,
      requests_today: requestsToday,
      cost_today_cents: costToday,
    });

    const byDay: Record<string, DailyUsage> = {};
    rows.forEach(r => {
      const day = r.created_at.substring(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, requests: 0, tokens: 0, cost_cents: 0 };
      byDay[day].requests++;
      byDay[day].tokens += r.tokens_used || 0;
      byDay[day].cost_cents += r.cost_cents || 0;
    });
    setDailyUsage(Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)));

    const bySite: Record<string, SiteUsageSummary> = {};
    rows.forEach(r => {
      if (!bySite[r.site_id]) {
        bySite[r.site_id] = {
          site_id: r.site_id,
          site_name: siteMap[r.site_id]?.name || 'Unknown Site',
          site_slug: siteMap[r.site_id]?.slug || '',
          total_requests: 0,
          total_tokens: 0,
          total_cost_cents: 0,
          chat_requests: 0,
          gameplan_requests: 0,
          text_gen_requests: 0,
          sonnet_requests: 0,
          haiku_requests: 0,
          last_used: r.created_at,
        };
      }
      const s = bySite[r.site_id];
      s.total_requests++;
      s.total_tokens += r.tokens_used || 0;
      s.total_cost_cents += r.cost_cents || 0;
      if (r.request_type === 'chat') s.chat_requests++;
      else if (r.request_type === 'gameplan') s.gameplan_requests++;
      else s.text_gen_requests++;
      if (r.model_used === 'sonnet') s.sonnet_requests++;
      else s.haiku_requests++;
      if (r.created_at > s.last_used) s.last_used = r.created_at;
    });
    setSiteUsage(Object.values(bySite));

    setLoading(false);
  }

  async function loadSiteBreakdown(siteId: string) {
    if (siteBreakdown[siteId]) return;

    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await supabase
      .from('ai_usage_tracking')
      .select('created_at, tokens_used, cost_cents, request_type, model_used')
      .eq('site_id', siteId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    const byDay: Record<string, DailyUsage> = {};
    (data || []).forEach(r => {
      const day = r.created_at.substring(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, requests: 0, tokens: 0, cost_cents: 0 };
      byDay[day].requests++;
      byDay[day].tokens += r.tokens_used || 0;
      byDay[day].cost_cents += r.cost_cents || 0;
    });

    setSiteBreakdown(prev => ({
      ...prev,
      [siteId]: Object.values(byDay).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14),
    }));
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function toggleExpand(siteId: string) {
    if (expandedSite === siteId) {
      setExpandedSite(null);
    } else {
      setExpandedSite(siteId);
      loadSiteBreakdown(siteId);
    }
  }

  const sortedSites = [...siteUsage].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const maxDailyRequests = Math.max(...dailyUsage.map(d => d.requests), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Usage & Costs</h1>
          <p className="mt-1 text-sm text-gray-500">Token consumption and cost tracking across all sites</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                dateRange === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Requests', value: stats?.total_requests.toLocaleString() ?? '0', icon: <Zap className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
          { label: 'Total Tokens', value: formatTokens(stats?.total_tokens ?? 0), icon: <Brain className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
          { label: 'Total Cost', value: formatCost(stats?.total_cost_cents ?? 0), icon: <DollarSign className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
          { label: 'Active Sites', value: stats?.active_sites ?? 0, icon: <BarChart3 className="w-5 h-5" />, color: 'bg-sky-100 text-sky-600' },
          { label: "Today's Requests", value: stats?.requests_today ?? 0, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-teal-100 text-teal-600' },
          { label: "Today's Cost", value: formatCost(stats?.cost_today_cents ?? 0), icon: <Clock className="w-5 h-5" />, color: 'bg-rose-100 text-rose-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {dailyUsage.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Daily Request Volume</h2>
          <div className="flex items-end gap-1 h-32">
            {dailyUsage.map(day => {
              const pct = (day.requests / maxDailyRequests) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {day.date}<br />{day.requests} req · {formatCost(day.cost_cents)}
                  </div>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{dailyUsage[0]?.date}</span>
            <span>{dailyUsage[dailyUsage.length - 1]?.date}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Usage by Site</h2>
          <span className="text-sm text-gray-500">{siteUsage.length} sites with activity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Site</th>
                {([
                  ['total_requests', 'Requests'],
                  ['total_tokens', 'Tokens'],
                  ['total_cost_cents', 'Cost'],
                  ['last_used', 'Last Active'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort(key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {sortKey === key ? (
                        sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : null}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedSites.map(site => (
                <>
                  <tr
                    key={site.site_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(site.site_id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{site.site_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">/{site.site_slug}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-medium text-gray-900">{site.total_requests.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {site.chat_requests}c · {site.gameplan_requests}g · {site.text_gen_requests}t
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-medium text-gray-900">{formatTokens(site.total_tokens)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {site.sonnet_requests} sonnet · {site.haiku_requests} haiku
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className={`font-semibold ${site.total_cost_cents > 1000 ? 'text-red-600' : site.total_cost_cents > 200 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {formatCost(site.total_cost_cents)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {site.total_requests > 0
                          ? `${formatCost(Math.round(site.total_cost_cents / site.total_requests))}/req avg`
                          : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-500">
                      {new Date(site.last_used).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {expandedSite === site.site_id
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>
                  {expandedSite === site.site_id && (
                    <tr key={`${site.site_id}-detail`} className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Daily breakdown (recent)</div>
                        {siteBreakdown[site.site_id] ? (
                          <div className="overflow-x-auto">
                            <table className="text-sm w-full max-w-lg">
                              <thead>
                                <tr className="text-gray-500">
                                  <th className="text-left pb-1 font-medium">Date</th>
                                  <th className="text-right pb-1 font-medium">Requests</th>
                                  <th className="text-right pb-1 font-medium">Tokens</th>
                                  <th className="text-right pb-1 font-medium">Cost</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {siteBreakdown[site.site_id].map(day => (
                                  <tr key={day.date}>
                                    <td className="py-1 text-gray-700">{day.date}</td>
                                    <td className="py-1 text-right text-gray-700">{day.requests}</td>
                                    <td className="py-1 text-right text-gray-700">{formatTokens(day.tokens)}</td>
                                    <td className="py-1 text-right text-gray-700">{formatCost(day.cost_cents)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">Loading...</div>
                        )}
                        <div className="mt-3 flex gap-6 text-sm">
                          <div>
                            <span className="text-gray-500">Chat: </span>
                            <span className="font-medium">{site.chat_requests}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Gameplan: </span>
                            <span className="font-medium">{site.gameplan_requests}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Text Gen: </span>
                            <span className="font-medium">{site.text_gen_requests}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sonnet: </span>
                            <span className="font-medium">{site.sonnet_requests}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Haiku: </span>
                            <span className="font-medium">{site.haiku_requests}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {sortedSites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No AI usage recorded in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Model Cost Reference</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-700 mb-1">Claude Sonnet</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Used for: AI Coach Chat, Gameplan generation</div>
              <div>Approx rate: ~$0.003 / 1K tokens</div>
              <div className="font-medium text-amber-600">Higher quality, higher cost</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-700 mb-1">Claude Haiku</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Used for: Text generation (headlines, CTAs, etc.)</div>
              <div>Approx rate: ~$0.00025 / 1K tokens</div>
              <div className="font-medium text-green-600">Fast, cost-efficient</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
