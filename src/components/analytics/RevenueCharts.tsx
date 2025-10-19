import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Users as UsersIcon } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

interface RevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  revenueChange: number;
}

export default function RevenueCharts() {
  const { currentSite } = useSite();
  const [data, setData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState<RevenueSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    newCustomers: 0,
    returningCustomers: 0,
    revenueChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (currentSite) {
      loadRevenueData();
    }
  }, [currentSite?.id, dateRange]);

  const loadRevenueData = async () => {
    if (!currentSite) return;

    try {
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(now.getDate() - days);

      const prevStartDate = new Date();
      prevStartDate.setDate(startDate.getDate() - days);

      const { data: revenueData, error } = await supabase
        .from('analytics_revenue_summary')
        .select('*')
        .eq('site_id', currentSite.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const { data: prevRevenueData } = await supabase
        .from('analytics_revenue_summary')
        .select('total_revenue')
        .eq('site_id', currentSite.id)
        .gte('date', prevStartDate.toISOString().split('T')[0])
        .lt('date', startDate.toISOString().split('T')[0]);

      const chartData = (revenueData || []).map(item => ({
        date: item.date,
        revenue: item.total_revenue || 0,
        orders: item.order_count || 0,
        aov: item.average_order_value || 0,
      }));

      const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const newCustomerCount = (revenueData || []).reduce((sum, item) => sum + (item.new_customers || 0), 0);
      const returningCustomerCount = (revenueData || []).reduce((sum, item) => sum + (item.returning_customers || 0), 0);

      const prevRevenue = (prevRevenueData || []).reduce((sum, item) => sum + (item.total_revenue || 0), 0);
      const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      setData(chartData);
      setSummary({
        totalRevenue,
        totalOrders,
        averageOrderValue: avgOrderValue,
        newCustomers: newCustomerCount,
        returningCustomers: returningCustomerCount,
        revenueChange,
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className={`text-xs font-medium ${
              summary.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.revenueChange >= 0 ? '+' : ''}{summary.revenueChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600">Average Order Value</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.newCustomers} / {summary.returningCustomers}
          </p>
          <p className="text-sm text-gray-600">New / Returning</p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          <div className="h-64 flex items-end justify-between gap-2">
            {data.map((item, index) => {
              const heightPercent = (item.revenue / maxRevenue) * 100;
              const date = new Date(item.date);
              const label = dateRange === '7d'
                ? date.toLocaleDateString('en-US', { weekday: 'short' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-300 group-hover:from-green-600 group-hover:to-green-500 cursor-pointer"
                      style={{ height: `${Math.max(heightPercent, 2)}%`, minHeight: '8px' }}
                      title={`${label}: $${item.revenue.toFixed(2)}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 -rotate-45 origin-top-left whitespace-nowrap mt-4">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Revenue</th>
                    <th className="pb-2 text-right">Orders</th>
                    <th className="pb-2 text-right">AOV</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(-10).reverse().map((item, index) => (
                    <tr key={index} className="text-sm border-b border-gray-100 last:border-0">
                      <td className="py-2 text-gray-900">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        ${item.revenue.toFixed(2)}
                      </td>
                      <td className="py-2 text-right text-gray-600">{item.orders}</td>
                      <td className="py-2 text-right text-gray-600">
                        ${item.aov.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          No revenue data available for this period
        </div>
      )}
    </div>
  );
}
