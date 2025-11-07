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
    product_type: 'digital',
    price_amount: '0',
    price_currency: 'USD',
    billing_type: 'one_time',
    billing_interval: '',
    thumbnail_url: '',
    access_duration_days: '',
    sku: '',
    track_inventory: true,
    stock_quantity: '0',
    low_stock_threshold: '5',
    allow_backorder: false,
    weight: '',
    weight_unit: 'lb',
    requires_shipping: false,
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
        requires_shipping: formData.requires_shipping,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weight_unit: formData.weight_unit,
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
          thumbnail_url: formData.images[0] || formData.thumbnail_url || null,
          access_duration_days: formData.access_duration_days ? parseInt(formData.access_duration_days) : null,
          status: 'draft',
          settings: productSettings,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (formData.track_inventory) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            sku: formData.sku || `${product.id.substring(0, 8).toUpperCase()}`,
            name: 'Default',
            price: parseFloat(formData.price_amount),
            stock_quantity: parseInt(formData.stock_quantity),
            low_stock_threshold: parseInt(formData.low_stock_threshold),
            track_inventory: formData.track_inventory,
            allow_backorder: formData.allow_backorder,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            weight_unit: formData.weight_unit,
            requires_shipping: formData.requires_shipping,
            is_active: true,
            image_url: formData.images[0] || null,
          });

        if (variantError) throw variantError;
      }

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
                <option value="digital">Digital Product</option>
                <option value="physical">Physical Product</option>
                <option value="course">Course</option>
                <option value="membership">Membership</option>
                <option value="coaching">Coaching</option>
              </select>
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Auto-generated if empty"
              />
            </div>
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

        {formData.product_type === 'physical' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Shipping Settings</h3>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requires_shipping"
                name="requires_shipping"
                checked={formData.requires_shipping}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requires_shipping" className="ml-2 text-sm text-gray-700">
                This product requires shipping
              </label>
            </div>

            {formData.requires_shipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="weight_unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    id="weight_unit"
                    name="weight_unit"
                    value={formData.weight_unit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="lb">Pounds (lb)</option>
                    <option value="oz">Ounces (oz)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">Inventory Management</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="track_inventory"
              name="track_inventory"
              checked={formData.track_inventory}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="track_inventory" className="ml-2 text-sm text-gray-700">
              Track inventory for this product
            </label>
          </div>

          {formData.track_inventory && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  required
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  id="low_stock_threshold"
                  name="low_stock_threshold"
                  min="0"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    id="allow_backorder"
                    name="allow_backorder"
                    checked={formData.allow_backorder}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allow_backorder" className="ml-2 text-sm text-gray-700">
                    Allow backorder
                  </label>
                </div>
              </div>
            </div>
          )}
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

        {(formData.product_type === 'course' || formData.product_type === 'membership' || formData.product_type === 'digital') && (
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
