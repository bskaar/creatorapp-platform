import RealTimeMetrics from '../components/analytics/RealTimeMetrics';
import FunnelVisualization from '../components/analytics/FunnelVisualization';
import RevenueCharts from '../components/analytics/RevenueCharts';
import TrafficAnalytics from '../components/analytics/TrafficAnalytics';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance, conversions, and revenue</p>
        </div>
      </div>

      <RealTimeMetrics />

      <div className="grid grid-cols-1 gap-6">
        <FunnelVisualization />
        <RevenueCharts />
      </div>

      <TrafficAnalytics />
    </div>
  );
}
