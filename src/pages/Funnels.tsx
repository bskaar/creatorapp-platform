import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  GitBranch,
  Plus,
  Home,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  ExternalLink,
  X,
  Copy,
} from 'lucide-react';
import TemplatePicker from '../components/TemplatePicker';
import type { Database } from '../lib/database.types';

type Funnel = Database['public']['Tables']['funnels']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

export default function Funnels() {
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [homepage, setHomepage] = useState<Page | null>(null);
  const [standalonePages, setStandalonePages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templatePickerMode, setTemplatePickerMode] = useState<'homepage' | 'page'>('page');
  const [modalType, setModalType] = useState<'funnel' | 'page'>('funnel');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalType: 'lead_generation' as const,
    pageTitle: '',
    pageSlug: '',
    pageType: 'landing' as const,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentSite) return;
    loadData();
  }, [currentSite]);

  const loadData = async () => {
    if (!currentSite) return;

    const [funnelsResult, pagesResult] = await Promise.all([
      supabase
        .from('funnels')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('pages')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false }),
    ]);

    if (funnelsResult.data) {
      setFunnels(funnelsResult.data);
    }

    if (pagesResult.data) {
      const homepageData = pagesResult.data.find((p) => p.slug === 'home' || p.slug === '');
      const standalone = pagesResult.data.filter(
        (p) => !p.funnel_id && p.slug !== 'home' && p.slug !== ''
      );

      setHomepage(homepageData || null);
      setStandalonePages(standalone);
    }

    setLoading(false);
  };

  const handleCreateHomepage = async () => {
    setTemplatePickerMode('homepage');
    setShowTemplatePicker(true);
  };

  const handleTemplateSelect = async (template: any) => {
    if (!currentSite) return;

    setSaving(true);
    setError('');
    setShowTemplatePicker(false);

    try {
      const isHomepage = templatePickerMode === 'homepage';
      const pageData: any = {
        site_id: currentSite.id,
        title: isHomepage ? 'Home' : formData.pageTitle,
        slug: isHomepage ? 'home' : formData.pageSlug,
        page_type: isHomepage ? 'landing' : formData.pageType,
        status: 'draft',
      };

      if (template) {
        pageData.content = { blocks: template.blocks, theme: template.theme };
      } else {
        pageData.content = { blocks: [] };
      }

      const { data, error: insertError } = await supabase
        .from('pages')
        .insert(pageData)
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        navigate(`/pages/editor/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setError('');
    setSaving(true);

    try {
      if (modalType === 'funnel') {
        const { data: funnelData, error: funnelError } = await supabase
          .from('funnels')
          .insert({
            site_id: currentSite.id,
            name: formData.name,
            description: formData.description,
            goal_type: formData.goalType,
            status: 'draft',
          })
          .select()
          .single();

        if (funnelError) throw funnelError;

        if (funnelData) {
          navigate(`/funnels/${funnelData.id}`);
        }

        setShowNewModal(false);
        setFormData({
          name: '',
          description: '',
          goalType: 'lead_generation',
          pageTitle: '',
          pageSlug: '',
          pageType: 'landing',
        });
        loadData();
      } else {
        setShowNewModal(false);
        setTemplatePickerMode('page');
        setShowTemplatePicker(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (id: string, type: 'funnel' | 'page') => {
    if (!currentSite) return;

    setSaving(true);
    try {
      if (type === 'page') {
        const { data: originalPage } = await supabase
          .from('pages')
          .select('*')
          .eq('id', id)
          .single();

        if (originalPage) {
          const { data: newPage } = await supabase
            .from('pages')
            .insert({
              site_id: currentSite.id,
              funnel_id: originalPage.funnel_id,
              title: `${originalPage.title} (Copy)`,
              slug: `${originalPage.slug}-copy-${Date.now()}`,
              page_type: originalPage.page_type,
              content: originalPage.content,
              status: 'draft',
              seo_title: originalPage.seo_title,
              seo_description: originalPage.seo_description,
            })
            .select()
            .single();

          if (newPage) {
            navigate(`/pages/editor/${newPage.id}`);
          }
        }
      } else {
        const { data: originalFunnel } = await supabase
          .from('funnels')
          .select('*')
          .eq('id', id)
          .single();

        if (originalFunnel) {
          const { data: newFunnel } = await supabase
            .from('funnels')
            .insert({
              site_id: currentSite.id,
              name: `${originalFunnel.name} (Copy)`,
              description: originalFunnel.description,
              goal_type: originalFunnel.goal_type,
              status: 'draft',
            })
            .select()
            .single();

          if (newFunnel) {
            navigate(`/funnels/${newFunnel.id}`);
          }
        }
      }

      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'funnel' | 'page') => {
    if (!confirm(`Delete this ${type}? This action cannot be undone.`)) return;

    const table = type === 'funnel' ? 'funnels' : 'pages';
    await supabase.from(table).delete().eq('id', id);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-dark">Funnels & Pages</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Build your site homepage, sales funnels, and landing pages
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setModalType('page');
              setShowNewModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
          >
            <Plus className="h-5 w-5" />
            <span>New Page</span>
          </button>
          <button
            onClick={() => {
              setModalType('funnel');
              setShowNewModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
          >
            <Plus className="h-5 w-5" />
            <span>New Funnel</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/5 via-white to-accent/5 rounded-xl shadow-sm p-8 border-2 border-primary/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl shadow-light flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark">Site Homepage</h2>
                <p className="text-text-secondary font-semibold">Your main brand landing page</p>
              </div>
            </div>

            {homepage ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      homepage.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {homepage.status}
                  </span>
                  {homepage.status === 'published' && (
                    <a
                      href={`https://${currentSite?.custom_domain || currentSite?.subdomain}.${
                        currentSite?.custom_domain ? '' : 'yourdomain.com'
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>View Live</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/pages/editor/${homepage.id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Homepage</span>
                  </button>
                  {homepage.status === 'published' && (
                    <button
                      onClick={() => navigate(`/pages/editor/${homepage.id}`)}
                      className="flex items-center space-x-2 px-4 py-2 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-gray-600 mb-4">
                  Create your homepage to establish your brand presence and welcome visitors
                </p>
                <button
                  onClick={handleCreateHomepage}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                  <span>{saving ? 'Creating...' : 'Create Homepage'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-light border border-border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-dark">Sales Funnels</h2>
          <p className="text-text-secondary mt-2 text-lg">Multi-step customer journey flows</p>
        </div>

        {funnels.length === 0 ? (
          <div className="p-12 text-center">
            <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Funnels Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first funnel to start converting visitors into customers
            </p>
            <button
              onClick={() => {
                setModalType('funnel');
                setShowNewModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
            >
              Build Your First Funnel
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {funnels.map((funnel) => (
              <div key={funnel.id} className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{funnel.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          funnel.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : funnel.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {funnel.status}
                      </span>
                    </div>
                    {funnel.description && (
                      <p className="text-text-secondary mb-2 font-semibold">{funnel.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="capitalize">Goal: {funnel.goal_type?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/funnels/${funnel.id}`}
                      className="flex items-center space-x-2 px-4 py-2 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDuplicate(funnel.id, 'funnel')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Duplicate funnel"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(funnel.id, 'funnel')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {standalonePages.length > 0 && (
        <div className="bg-white rounded-card shadow-light border border-border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-dark">Standalone Pages</h2>
            <p className="text-text-secondary mt-2 text-lg">Individual landing pages not part of a funnel</p>
          </div>

          <div className="divide-y">
            {standalonePages.map((page) => (
              <div key={page.id} className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{page.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>/{page.slug}</span>
                      <span className="capitalize">{page.page_type}</span>
                      {page.views_count && <span>{page.views_count} views</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/pages/editor/${page.id}`}
                      className="flex items-center space-x-2 px-4 py-2 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDuplicate(page.id, 'page')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Duplicate page"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id, 'page')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark">
                Create New {modalType === 'funnel' ? 'Funnel' : 'Page'}
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'funnel' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funnel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="My Sales Funnel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      placeholder="What is this funnel for?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Type *
                    </label>
                    <select
                      required
                      value={formData.goalType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goalType: e.target.value as typeof formData.goalType,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="lead_generation">Lead Generation</option>
                      <option value="product_sale">Product Sale</option>
                      <option value="webinar_registration">Webinar Registration</option>
                      <option value="membership_signup">Membership Signup</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pageTitle}
                      onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="My Landing Page"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pageSlug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pageSlug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="my-landing-page"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Type *
                    </label>
                    <select
                      required
                      value={formData.pageType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pageType: e.target.value as typeof formData.pageType,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="landing">Landing Page</option>
                      <option value="sales">Sales Page</option>
                      <option value="checkout">Checkout Page</option>
                      <option value="thank_you">Thank You Page</option>
                      <option value="webinar_registration">Webinar Registration</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}
