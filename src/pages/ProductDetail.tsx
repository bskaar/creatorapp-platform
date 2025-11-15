import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Package, Upload, X, Loader2 } from 'lucide-react';
import ProductVariants from '../components/ProductVariants';
import AITextGenerator from '../components/AITextGenerator';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'variants' | 'images' | 'files'>('details');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [downloadableFiles, setDownloadableFiles] = useState<Array<{name: string; url: string}>>([]);

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
    status: 'draft',
    sku: '',
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Product not found');
      setLoading(false);
      return;
    }

    setProduct(data);
    setFormData({
      title: data.title,
      description: data.description || '',
      product_type: data.product_type,
      price_amount: data.price_amount?.toString() || '0',
      price_currency: data.price_currency || 'USD',
      billing_type: data.billing_type || 'one_time',
      billing_interval: data.billing_interval || '',
      thumbnail_url: data.thumbnail_url || '',
      access_duration_days: data.access_duration_days?.toString() || '',
      status: data.status || 'draft',
      sku: data.settings?.sku || '',
    });
    setImages(data.settings?.images || []);
    setDownloadableFiles(data.settings?.downloadable_files || []);
    setLoading(false);
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');

    const productSettings = {
      ...product?.settings,
      images: images,
      downloadable_files: downloadableFiles,
      sku: formData.sku,
    };

    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: formData.title,
        description: formData.description || null,
        product_type: formData.product_type,
        price_amount: parseFloat(formData.price_amount),
        price_currency: formData.price_currency,
        billing_type: formData.billing_type as 'one_time' | 'recurring',
        billing_interval: formData.billing_interval || null,
        thumbnail_url: images[0] || formData.thumbnail_url || null,
        access_duration_days: formData.access_duration_days ? parseInt(formData.access_duration_days) : null,
        status: formData.status as 'draft' | 'published' | 'archived',
        settings: productSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await loadProduct();
    }

    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !product) return;

    setUploadingImage(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.site_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAIGenerate = (generatedText: string) => {
    setFormData(prev => ({ ...prev, description: generatedText }));
    setShowAIGenerator(false);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !product) return;

    setUploadingFile(true);
    const uploadedFiles: Array<{name: string; url: string}> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.site_id}/files/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedFiles.push({
          name: file.name,
          url: publicUrl
        });
      }

      setDownloadableFiles(prev => [...prev, ...uploadedFiles]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = (index: number) => {
    setDownloadableFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <Link to="/content" className="text-blue-600 hover:text-blue-700">
          Back to Content Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/commerce')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-gray-600 mt-1">
            <span className="capitalize">{product.product_type.replace('_', ' ')}</span>
            {' • '}
            <span className="capitalize">{product.status}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-1 border-b-2 font-medium transition ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-4 px-1 border-b-2 font-medium transition ${
              activeTab === 'images'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Images
          </button>
          {(product?.product_type === 'digital' || product?.product_type === 'course') && (
            <button
              onClick={() => setActiveTab('files')}
              className={`pb-4 px-1 border-b-2 font-medium transition ${
                activeTab === 'files'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Files
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'details' ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <option value="one_time">One-Time</option>
                <option value="recurring">Recurring</option>
              </select>
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
          </div>

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
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
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
                placeholder="Leave empty for lifetime"
              />
            </div>
          )}

          {showAIGenerator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">AI Description Generator</h2>
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
                    onGenerated={handleAIGenerate}
                    placeholder="Generate compelling product description..."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/commerce')}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : activeTab === 'images' ? (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload high-quality images of your product. The first image will be used as the main product image.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                  <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs py-1 px-2 text-center">
                      Main Image
                    </div>
                  )}
                </div>
              ))}

              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center transition bg-gray-50 hover:bg-gray-100">
                {uploadingImage ? (
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 text-center px-2">Upload Image</span>
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

            {images.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-4 border-t">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Images</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Downloadable Files</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload files that customers will receive after purchase. Supports PDFs, videos, audio files, and more.
            </p>

            <div className="space-y-3">
              {downloadableFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                  <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 truncate">{file.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg cursor-pointer transition bg-gray-50 hover:bg-gray-100">
                {uploadingFile ? (
                  <>
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload Files</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={uploadingFile}
                />
              </label>
            </div>

            {downloadableFiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No files uploaded yet</p>
                <p className="text-xs">Customers will receive these files after purchase</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-4 border-t">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Files</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
