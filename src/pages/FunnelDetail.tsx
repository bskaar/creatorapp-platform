import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Eye, BarChart3, Settings, LayoutGrid, List, GitBranch, Palette, X, Check } from 'lucide-react';
import { FunnelView } from '../components/funnel';
import AIColorPalette from '../components/AIColorPalette';
import type { Database, BrandTheme } from '../lib/database.types';

type Funnel = Database['public']['Tables']['funnels']['Row'] & {
  use_site_branding?: boolean;
  custom_theme?: BrandTheme | null;
};
type Page = Database['public']['Tables']['pages']['Row'];

export default function FunnelDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentSite, brandTheme } = useSite();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    page_type: 'landing',
    slug: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'flow' | 'list'>('grid');
  const [useSiteBranding, setUseSiteBranding] = useState(true);

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
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
    ]);

    if (funnelResult.data) {
      setFunnel(funnelResult.data);
      setUseSiteBranding(funnelResult.data.use_site_branding ?? true);
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

  const handleDuplicatePage = async (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page || !currentSite) return;

    const newSlug = `${page.slug}-copy-${Date.now().toString(36)}`;

    await supabase.from('pages').insert({
      site_id: currentSite.id,
      funnel_id: id,
      title: `${page.title} (Copy)`,
      slug: newSlug,
      page_type: page.page_type,
      content: page.content,
      status: 'draft',
    });

    loadFunnelAndPages();
  };

  const handleReorderPages = async (reorderedPages: Page[]) => {
    setPages(reorderedPages);

    const updates = reorderedPages.map((page, index) => ({
      id: page.id,
      sort_order: index,
    }));

    for (const update of updates) {
      await supabase.from('pages').update({ sort_order: update.sort_order }).eq('id', update.id);
    }
  };

  const toggleSiteBranding = async (useIt: boolean) => {
    if (!funnel) return;
    setUseSiteBranding(useIt);

    await supabase
      .from('funnels')
      .update({ use_site_branding: useIt })
      .eq('id', funnel.id);

    setFunnel({ ...funnel, use_site_branding: useIt });
  };

  const saveFunnelCustomTheme = async (newTheme: BrandTheme) => {
    if (!funnel) return;

    await supabase
      .from('funnels')
      .update({
        custom_theme: newTheme,
        use_site_branding: false,
      })
      .eq('id', funnel.id);

    setFunnel({ ...funnel, custom_theme: newTheme, use_site_branding: false });
    setUseSiteBranding(false);
    setShowThemeModal(false);
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

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900">Funnel Theme</h3>
              <p className="text-sm text-gray-500">
                {useSiteBranding
                  ? 'Using site branding for consistent look'
                  : 'Using custom theme for this funnel'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useSiteBranding}
                onChange={(e) => toggleSiteBranding(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Use site branding</span>
            </label>
            {!useSiteBranding && (
              <button
                onClick={() => setShowThemeModal(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Edit Custom Theme
              </button>
            )}
          </div>
        </div>
        {useSiteBranding && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="flex -space-x-1">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: brandTheme.primaryColor }}
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: brandTheme.secondaryColor }}
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: brandTheme.accentColor }}
              />
            </div>
            <span className="text-sm text-gray-500">Current site colors</span>
          </div>
        )}
        {!useSiteBranding && funnel?.custom_theme && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="flex -space-x-1">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: funnel.custom_theme.primaryColor }}
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: funnel.custom_theme.secondaryColor }}
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: funnel.custom_theme.accentColor }}
              />
            </div>
            <span className="text-sm text-gray-500">Custom funnel colors</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Funnel Flow</h2>
            <p className="text-sm text-gray-600 mt-1">Build your customer journey step by step</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`p-2 rounded-md transition ${
                viewMode === 'flow'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Flow View"
            >
              <GitBranch className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <FunnelView
            funnelId={id!}
            pages={pages}
            onDeletePage={handleDeletePage}
            onDuplicatePage={handleDuplicatePage}
            onReorderPages={handleReorderPages}
            onAddPage={() => setShowNewPageModal(true)}
            forceView={viewMode}
          />
        </div>
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

      {showThemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Custom Funnel Theme</h2>
              <button
                onClick={() => setShowThemeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-sm">
                  Setting a custom theme will apply only to pages within this funnel.
                  This is useful for campaign-specific branding or promotions.
                </p>
              </div>
              <AIColorPalette
                onApplyTheme={(newTheme) => {
                  saveFunnelCustomTheme({
                    primaryColor: newTheme.primary,
                    secondaryColor: newTheme.secondary,
                    accentColor: newTheme.accent,
                    neutralColor: newTheme.neutral,
                    backgroundColor: newTheme.background,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
