import { useState, useEffect } from 'react';
import { ArrowRight, TrendingDown } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface FunnelStep {
  step_name: string;
  step_order: number;
  visitors: number;
  conversions: number;
  conversion_rate: number;
  drop_off_rate: number;
}

interface FunnelData {
  id: string;
  name: string;
  steps: FunnelStep[];
}

export default function FunnelVisualization() {
  const { currentSite } = useSite();
  const [funnels, setFunnels] = useState<FunnelData[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (currentSite) {
      loadFunnels();
    }
  }, [currentSite?.id, dateRange]);

  const loadFunnels = async () => {
    if (!currentSite) return;

    try {
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));

      const { data: funnelsList, error: funnelsError } = await supabase
        .from('funnels')
        .select('id, name, steps')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false });

      if (funnelsError) throw funnelsError;

      const funnelsWithStats = await Promise.all(
        (funnelsList || []).map(async (funnel) => {
          const steps = (funnel.steps as any[]) || [];

          const stepsWithMetrics = await Promise.all(
            steps.map(async (step: any, index: number) => {
              const { count: visitors } = await supabase
                .from('analytics_page_views')
                .select('*', { count: 'exact', head: true })
                .eq('site_id', currentSite.id)
                .eq('page_url', step.url || '')
                .gte('viewed_at', startDate.toISOString());

              const nextStep = steps[index + 1];
              let conversions = 0;

              if (nextStep) {
                const { count } = await supabase
                  .from('analytics_page_views')
                  .select('*', { count: 'exact', head: true })
                  .eq('site_id', currentSite.id)
                  .eq('page_url', nextStep.url || '')
                  .gte('viewed_at', startDate.toISOString());

                conversions = count || 0;
              }

              const visitorCount = visitors || 0;
              const conversionRate = visitorCount > 0 ? (conversions / visitorCount) * 100 : 0;
              const dropOffRate = 100 - conversionRate;

              return {
                step_name: step.name || `Step ${index + 1}`,
                step_order: index,
                visitors: visitorCount,
                conversions,
                conversion_rate: conversionRate,
                drop_off_rate: dropOffRate,
              };
            })
          );

          return {
            id: funnel.id,
            name: funnel.name,
            steps: stepsWithMetrics,
          };
        })
      );

      setFunnels(funnelsWithStats);
      if (funnelsWithStats.length > 0 && !selectedFunnel) {
        setSelectedFunnel(funnelsWithStats[0].id);
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentFunnel = funnels.find(f => f.id === selectedFunnel);

  if (loading) {
    return (
      <div className="bg-white rounded-card shadow-light border border-border p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-light border border-border p-12 border border-border text-center">
        <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-dark mb-2">No Funnels Yet</h3>
        <p className="text-text-secondary">Create a funnel to start tracking conversions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card shadow-light border border-border p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-dark">Funnel Analytics</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedFunnel || ''}
            onChange={(e) => setSelectedFunnel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {funnels.map((funnel) => (
              <option key={funnel.id} value={funnel.id}>
                {funnel.name}
              </option>
            ))}
          </select>
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
      </div>

      {currentFunnel && currentFunnel.steps.length > 0 ? (
        <div className="space-y-4">
          {currentFunnel.steps.map((step, index) => {
            const maxVisitors = Math.max(...currentFunnel.steps.map(s => s.visitors));
            const widthPercent = maxVisitors > 0 ? (step.visitors / maxVisitors) * 100 : 100;

            return (
              <div key={index} className="relative">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {step.step_order + 1}. {step.step_name}
                        </span>
                        {index < currentFunnel.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {step.visitors.toLocaleString()} visitors
                      </div>
                    </div>

                    <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between px-4 transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="text-sm font-medium text-white">
                          {step.conversion_rate.toFixed(1)}% converted
                        </span>
                        {step.drop_off_rate > 0 && (
                          <span className="text-xs text-blue-100">
                            {step.drop_off_rate.toFixed(1)}% dropped
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {index < currentFunnel.steps.length - 1 && step.conversions > 0 && (
                  <div className="mt-2 ml-4 text-xs text-gray-500">
                    {step.conversions.toLocaleString()} continued to next step
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t border-border grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-dark">
                {currentFunnel.steps[0]?.visitors.toLocaleString() || 0}
              </p>
              <p className="text-sm text-text-secondary">Started</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dark">
                {currentFunnel.steps[currentFunnel.steps.length - 1]?.conversions.toLocaleString() || 0}
              </p>
              <p className="text-sm text-text-secondary">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {currentFunnel.steps[0]?.visitors > 0
                  ? ((currentFunnel.steps[currentFunnel.steps.length - 1]?.conversions || 0) / currentFunnel.steps[0].visitors * 100).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-sm text-text-secondary">Overall Conversion</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-text-secondary">
          No funnel steps configured
        </div>
      )}
    </div>
  );
}
