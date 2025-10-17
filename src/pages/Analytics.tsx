import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance, conversions, and revenue</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600 mb-6">Comprehensive analytics and reporting coming soon</p>
      </div>
    </div>
  );
}
