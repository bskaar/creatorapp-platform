import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Edit, Trash2, Eye, BarChart3, Settings } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Funnel = Database['public']['Tables']['funnels']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

export default function FunnelDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    page_type: 'landing',
    slug: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentSite || !id) return;
    loadFunnelAndPages();
  }, [currentSite, id]);

  const loadFunnelAndPages = async () => {
    if (!currentSite || !id) return;

    const [funnelResult, pagesResult] = await Promise.all([
      supabase.from('funnels').select('*').eq('id', id).eq('site_id', currentSite.id).maybeSingle(),
      supabase
        .from('pages')
        .select('*')
        .eq('funnel_id', id)
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: true}),
    ]);

    if (funnelResult.data) {
      setFunnel(funnelResult.data);
    } else {
      navigate('/funnels');
      return;
    }

    if (pagesResult.data) {
      setPages(pagesResult.data);
    }

    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite || !id) return;

    setError('');
    setSaving(true);

    try {
      const slug = formData.slug || generateSlug(formData.title);

      const { data: existingSlug } = await supabase
        .from('pages')
        .select('id')
        .eq('site_id', currentSite.id)
        .eq('slug', slug)
        .maybeSingle();

      if (existingSlug) {
        setError('A page with this URL already exists. Please choose a different title or URL.');
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase.from('pages').insert({
        site_id: currentSite.id,
        funnel_id: id,
        title: formData.title,
        slug,
        page_type: formData.page_type,
        content: {},
        status: 'draft',
      });

      if (insertError) throw insertError;

      setShowNewPageModal(false);
      setFormData({ title: '', page_type: 'landing', slug: '' });
      loadFunnelAndPages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;

    await supabase.from('pages').delete().eq('id', pageId);
    loadFunnelAndPages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!funnel) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/funnels')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{funnel.name}</h1>
          {funnel.description && <p className="text-gray-600 mt-1">{funnel.description}</p>}
        </div>
        <button
          onClick={() => setShowNewPageModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add Page</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Eye className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Total Views</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{funnel.views_count || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{funnel.conversion_rate?.toFixed(1) || 0}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Pages</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pages.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Pages in Funnel</h2>
          <p className="text-sm text-gray-600 mt-1">Build your customer journey step by step</p>
        </div>

        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pages Yet</h3>
            <p className="text-gray-600 mb-6">Add your first page to start building this funnel</p>
            <button
              onClick={() => setShowNewPageModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add First Page
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {pages.map((page, index) => (
              <div key={page.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{page.title}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-500">/{page.slug}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {page.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {page.page_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{page.views_count || 0} views</p>
                      <p className="text-sm text-gray-500">
                        {page.conversions_count || 0} conversions
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/funnels/${id}/pages/${page.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Page</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Landing Page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Type *</label>
                <select
                  required
                  value={formData.page_type}
                  onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="landing">Landing Page</option>
                  <option value="sales">Sales Page</option>
                  <option value="checkout">Checkout</option>
                  <option value="upsell">Upsell</option>
                  <option value="thank_you">Thank You</option>
                  <option value="webinar">Webinar Registration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug (optional)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={generateSlug(formData.title) || 'auto-generated'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to auto-generate from title
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPageModal(false);
                    setFormData({ title: '', page_type: 'landing', slug: '' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
