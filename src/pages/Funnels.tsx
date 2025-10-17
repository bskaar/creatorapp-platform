import { GitBranch, Plus } from 'lucide-react';

export default function Funnels() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funnels & Pages</h1>
          <p className="text-gray-600 mt-1">Build high-converting sales funnels and landing pages</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-5 w-5" />
          <span>New Funnel</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Funnels Yet</h2>
        <p className="text-gray-600 mb-6">Create your first funnel to start converting visitors into customers</p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Build Your First Funnel
        </button>
      </div>
    </div>
  );
}
