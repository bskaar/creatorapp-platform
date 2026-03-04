import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { FileText, Plus, Home, Eye, CreditCard as Edit, Trash2, ExternalLink, X, Copy, Globe, LayoutGrid as Layout } from 'lucide-react';
import TemplatePicker from '../components/TemplatePicker';
import type { Database } from '../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

export default function SitePages() {
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [homepage, setHomepage] = useState<Page | null>(null);
  const [sitePages, setSitePages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templatePickerMode, setTemplatePickerMode] = useState<'homepage' | 'page'>('page');
  const [formData, setFormData] = useState({
    pageTitle: '',
    pageSlug: '',
    pageType: 'custom' as const,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentSite) return;
    loadData();
  }, [currentSite]);

  const loadData = async () => {
    if (!currentSite) return;

    const { data: pagesResult } = await supabase
      .from('pages')
      .select('*')
      .eq('site_id', currentSite.id)
      .is('funnel_id', null)
      .order('created_at', { ascending: false });

    if (pagesResult) {
      const homepageData = pagesResult.find((p) => p.slug === 'home' || p.slug === '');
      const pages = pagesResult.filter((p) => p.slug !== 'home' && p.slug !== '');
      setHomepage(homepageData || null);
      setSitePages(pages);
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
      setShowNewModal(false);
      setTemplatePickerMode('page');
      setShowTemplatePicker(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!currentSite) return;

    setSaving(true);
    try {
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

      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page? This action cannot be undone.')) return;
    await supabase.from('pages').delete().eq('id', id);
    loadData();
  };

  const getPageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      landing: 'Landing Page',
      sales: 'Sales Page',
      checkout: 'Checkout',
      thank_you: 'Thank You',
      webinar_registration: 'Webinar Registration',
      custom: 'Custom Page',
    };
    return labels[type] || type;
  };

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case 'landing':
        return <Layout className="h-4 w-4" />;
      case 'custom':
        return <FileText className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
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
          <h1 className="text-4xl font-bold text-dark">Site Pages</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Build your website pages - homepage, about, contact, and more
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          <span>New Page</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-primary/5 via-white to-accent/5 rounded-xl shadow-sm p-8 border-2 border-primary/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl shadow-light flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark">Homepage</h2>
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
                  {homepage.status === 'published' && currentSite?.custom_domain && currentSite?.domain_verification_status === 'verified' && (
                    <a
                      href={`https://${currentSite.custom_domain}`}
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
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Homepage</span>
                  </button>
                  {homepage.status === 'published' && (
                    <button
                      onClick={() => window.open(`/s/${currentSite?.slug}/home`, '_blank')}
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
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
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
          <h2 className="text-xl font-bold text-dark">Website Pages</h2>
          <p className="text-text-secondary mt-2 text-lg">
            About, Contact, Terms, Privacy, and other site pages
          </p>
        </div>

        {sitePages.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Site Pages Yet</h3>
            <p className="text-gray-600 mb-6">
              Create pages for your website like About, Contact, Terms of Service, and more
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              Create Your First Page
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {sitePages.map((page) => (
              <div
                key={page.id}
                className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                        {getPageTypeIcon(page.page_type || 'custom')}
                      </div>
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
                    <div className="flex items-center space-x-4 text-sm text-gray-500 ml-11">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        /{page.slug}
                      </span>
                      <span>{getPageTypeLabel(page.page_type || 'custom')}</span>
                      {page.views_count !== null && page.views_count > 0 && (
                        <span>{page.views_count} views</span>
                      )}
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
                      onClick={() => handleDuplicate(page.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Duplicate page"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
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

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark">Create New Page</h2>
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
                  placeholder="About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug *</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/</span>
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
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="about-us"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Type *</label>
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
                  <option value="custom">Custom Page</option>
                  <option value="landing">Landing Page</option>
                </select>
              </div>

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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Continue'}
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
