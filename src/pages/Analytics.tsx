import RealTimeMetrics from '../components/analytics/RealTimeMetrics';
import FunnelVisualization from '../components/analytics/FunnelVisualization';
import RevenueCharts from '../components/analytics/RevenueCharts';
import TrafficAnalytics from '../components/analytics/TrafficAnalytics';

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-dark">Analytics</h1>
          <p className="text-text-secondary mt-2 text-lg">Track performance, conversions, and revenue</p>
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
