import { ShoppingCart } from 'lucide-react';

export default function Commerce() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commerce</h1>
          <p className="text-gray-600 mt-1">Manage orders, subscriptions, and payment integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue (All Time)</h3>
          <p className="text-3xl font-bold text-gray-900">$0.00</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">MRR</h3>
          <p className="text-3xl font-bold text-gray-900">$0.00</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Integrations</h2>
        <p className="text-gray-600 mb-6">Connect PayPal or Shopify to start accepting payments</p>
        <div className="flex items-center justify-center space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Connect PayPal
          </button>
          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition">
            Connect Shopify
          </button>
        </div>
      </div>
    </div>
  );
}
