import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Plus, Edit, Trash2, GripVertical, Play, FileText, Volume2, FileDown, HelpCircle, Loader2 } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'lessons'>('details');

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
    status: 'draft',
  });

  useEffect(() => {
    if (id) {
      loadProduct();
      loadLessons();
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
      price_amount: data.price_amount.toString(),
      price_currency: data.price_currency,
      billing_type: data.billing_type,
      billing_interval: data.billing_interval || '',
      thumbnail_url: data.thumbnail_url || '',
      access_duration_days: data.access_duration_days?.toString() || '',
      status: data.status,
    });
    setLoading(false);
  };

  const loadLessons = async () => {
    if (!id) return;

    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('product_id', id)
      .order('order_index', { ascending: true });

    if (data) {
      setLessons(data);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: formData.title,
        description: formData.description || null,
        product_type: formData.product_type as 'course' | 'membership' | 'digital_product' | 'coaching',
        price_amount: parseFloat(formData.price_amount),
        price_currency: formData.price_currency,
        billing_type: formData.billing_type as 'one_time' | 'recurring',
        billing_interval: formData.billing_interval || null,
        thumbnail_url: formData.thumbnail_url || null,
        access_duration_days: formData.access_duration_days ? parseInt(formData.access_duration_days) : null,
        status: formData.status as 'draft' | 'published' | 'archived',
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

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (!error) {
      setLessons(lessons.filter(l => l.id !== lessonId));
    }
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      video: Play,
      audio: Volume2,
      text: FileText,
      pdf: FileDown,
      quiz: HelpCircle,
    };
    return icons[type as keyof typeof icons] || FileText;
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
          onClick={() => navigate('/content')}
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
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`pb-4 px-1 border-b-2 font-medium transition ${
              activeTab === 'lessons'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Lessons ({lessons.length})
          </button>
        </nav>
      </div>

      {activeTab === 'details' ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
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
                <option value="published">Published</option>
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
                <option value="one_time">One-Time</option>
                <option value="recurring">Recurring</option>
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
                />
              </div>
            </div>

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
            />
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
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Manage lessons and course content</p>
            <Link
              to={`/content/${id}/lessons/new`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Add Lesson</span>
            </Link>
          </div>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Lessons Yet</h3>
              <p className="text-gray-600 mb-6">Add your first lesson to start building your course</p>
              <Link
                to={`/content/${id}/lessons/new`}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create First Lesson
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {lessons.map((lesson, index) => {
                const Icon = getContentTypeIcon(lesson.content_type);
                return (
                  <div key={lesson.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center space-x-4">
                      <div className="cursor-move text-gray-400">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="capitalize">{lesson.content_type}</span>
                          {lesson.media_duration_seconds && (
                            <span>{Math.floor(lesson.media_duration_seconds / 60)} min</span>
                          )}
                          {lesson.is_preview && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              Preview
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/content/${id}/lessons/${lesson.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
