import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ProductNew() {
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_type: 'course',
    price_amount: '0',
    price_currency: 'USD',
    billing_type: 'one_time',
    billing_interval: '',
    thumbnail_url: '',
    access_duration_days: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setError('');
    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          site_id: currentSite.id,
          title: formData.title,
          description: formData.description || null,
          product_type: formData.product_type as 'course' | 'membership' | 'digital_product' | 'coaching',
          price_amount: parseFloat(formData.price_amount),
          price_currency: formData.price_currency,
          billing_type: formData.billing_type as 'one_time' | 'recurring',
          billing_interval: formData.billing_interval || null,
          thumbnail_url: formData.thumbnail_url || null,
          access_duration_days: formData.access_duration_days ? parseInt(formData.access_duration_days) : null,
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase
        .from('sites')
        .update({ products_count: currentSite.products_count + 1 })
        .eq('id', currentSite.id);

      navigate(`/content/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/content')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="text-gray-600 mt-1">Add a new course, membership, or digital product</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Product Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Complete Web Development Course"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what students will learn and why they should buy this product..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 mb-2">
              Product Type *
            </label>
            <select
              id="product_type"
              name="product_type"
              required
              value={formData.product_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="course">Course</option>
              <option value="membership">Membership</option>
              <option value="digital_product">Digital Product</option>
              <option value="coaching">Coaching</option>
            </select>
          </div>

          <div>
            <label htmlFor="billing_type" className="block text-sm font-medium text-gray-700 mb-2">
              Billing Type *
            </label>
            <select
              id="billing_type"
              name="billing_type"
              required
              value={formData.billing_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="one_time">One-Time Payment</option>
              <option value="recurring">Recurring Subscription</option>
            </select>
          </div>
        </div>

        {formData.billing_type === 'recurring' && (
          <div>
            <label htmlFor="billing_interval" className="block text-sm font-medium text-gray-700 mb-2">
              Billing Interval *
            </label>
            <select
              id="billing_interval"
              name="billing_interval"
              required
              value={formData.billing_interval}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select interval</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price_amount" className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="price_amount"
                name="price_amount"
                required
                min="0"
                step="0.01"
                value={formData.price_amount}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="price_currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="price_currency"
              name="price_currency"
              value={formData.price_currency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="access_duration_days" className="block text-sm font-medium text-gray-700 mb-2">
              Access Duration (Days)
            </label>
            <input
              type="number"
              id="access_duration_days"
              name="access_duration_days"
              min="1"
              value={formData.access_duration_days}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty for lifetime access"
            />
            <p className="text-sm text-gray-500 mt-1">Leave empty for lifetime access</p>
          </div>

          <div>
            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              id="thumbnail_url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/content')}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Product</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
