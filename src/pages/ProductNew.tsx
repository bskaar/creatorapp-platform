import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, Upload, X, Package, FileText } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import AITextGenerator from '../components/AITextGenerator';

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
    access_duration_days: '',
    images: [] as string[],
  });

  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setError('');
    setLoading(true);

    try {
      const productSettings = {
        images: formData.images,
      };

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert({
          site_id: currentSite.id,
          title: formData.title,
          description: formData.description || null,
          product_type: formData.product_type,
          price_amount: parseFloat(formData.price_amount),
          price_currency: formData.price_currency,
          billing_type: formData.billing_type as 'one_time' | 'recurring',
          billing_interval: formData.billing_interval || null,
          thumbnail_url: formData.images[0] || null,
          access_duration_days: formData.access_duration_days ? parseInt(formData.access_duration_days) : null,
          status: 'draft',
          settings: productSettings,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/commerce/products/${product.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentSite) return;

    setUploadingImage(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentSite.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAIGenerate = (generatedText: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: generatedText
    }));
    setShowAIGenerator(false);
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-8">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Premium Online Course"
              />
              <button
                type="button"
                onClick={() => setShowAIGenerator(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                title="Generate with AI"
              >
                ✨ AI
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your product, what customers will get, and why they should buy it..."
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Product Images
          </label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center transition">
              {uploadingImage ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">First image will be used as the main product image</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details
          </h2>

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
              <option value="digital">Digital Product</option>
              <option value="coaching">Coaching Session</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {formData.product_type === 'course' && 'Create a course with video lessons and content'}
              {formData.product_type === 'membership' && 'Recurring access to content and community'}
              {formData.product_type === 'digital' && 'Downloadable files like PDFs, templates, or guides'}
              {formData.product_type === 'coaching' && 'One-on-one or group coaching sessions'}
            </p>
          </div>

          {formData.product_type === 'membership' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Type
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                Recurring Subscription (memberships are always recurring)
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>

          {(formData.billing_type === 'recurring' || formData.product_type === 'membership') && (
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
                <option value="quarterly">Quarterly (every 3 months)</option>
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
              {formData.billing_type === 'recurring' && formData.billing_interval && (
                <p className="text-sm text-gray-500 mt-1">
                  ${formData.price_amount} per {formData.billing_interval === 'monthly' ? 'month' : formData.billing_interval === 'yearly' ? 'year' : 'quarter'}
                </p>
              )}
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
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {formData.product_type === 'course' && formData.billing_type === 'one_time' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label htmlFor="access_duration_days" className="block text-sm font-medium text-gray-700 mb-2">
              Access Duration (Optional)
            </label>
            <input
              type="number"
              id="access_duration_days"
              name="access_duration_days"
              min="1"
              value={formData.access_duration_days}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 365 for 1 year access"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty for lifetime access. Set a number for limited-time access (useful for cohort-based courses).
            </p>
          </div>
        )}

        {showAIGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">AI Product Description Generator</h2>
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <AITextGenerator
                  context={`Product: ${formData.title}\nType: ${formData.product_type}`}
                  onGenerated={(text) => handleAIGenerate(text, 'description')}
                  placeholder="Generate compelling product description..."
                />
              </div>
            </div>
          </div>
        )}

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
