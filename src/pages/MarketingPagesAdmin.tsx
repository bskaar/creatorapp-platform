import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, Eye, EyeOff, Plus, Edit, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MarketingPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function MarketingPagesAdmin() {
  const { user } = useAuth();
  const [pages, setPages] = useState<MarketingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<MarketingPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNewPageForm, setShowNewPageForm] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPage || !user) return;

    setSaving(true);
    try {
      const updateData = {
        title: editingPage.title,
        slug: editingPage.slug,
        content: editingPage.content,
        meta_description: editingPage.meta_description,
        published: editingPage.published,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };

      if (editingPage.id) {
        const { error } = await supabase
          .from('marketing_pages')
          .update(updateData)
          .eq('id', editingPage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('marketing_pages')
          .insert({
            ...updateData,
            created_by: user.id,
          });

        if (error) throw error;
      }

      await loadPages();
      setEditingPage(null);
      setShowNewPageForm(false);
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('marketing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page. Please try again.');
    }
  };

  const handleNewPage = () => {
    setEditingPage({
      id: '',
      slug: '',
      title: '',
      content: '',
      meta_description: '',
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setShowNewPageForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (editingPage || showNewPageForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-dark">
            {editingPage?.id ? 'Edit Marketing Page' : 'New Marketing Page'}
          </h1>
          <button
            onClick={() => {
              setEditingPage(null);
              setShowNewPageForm(false);
            }}
            className="text-text-secondary hover:text-text-primary font-semibold transition"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-card shadow-light border border-border p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={editingPage?.title || ''}
              onChange={(e) => setEditingPage(editingPage ? { ...editingPage, title: e.target.value } : null)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
              placeholder="About Us"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary font-medium">/pages/</span>
              <input
                type="text"
                value={editingPage?.slug || ''}
                onChange={(e) => setEditingPage(editingPage ? { ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') } : null)}
                className="flex-1 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                placeholder="about-us"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">URL-safe identifier (lowercase, hyphens only)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Meta Description (SEO)
            </label>
            <textarea
              value={editingPage?.meta_description || ''}
              onChange={(e) => setEditingPage(editingPage ? { ...editingPage, meta_description: e.target.value } : null)}
              rows={2}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium resize-none"
              placeholder="A brief description for search engines"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Content (HTML)
            </label>
            <textarea
              value={editingPage?.content || ''}
              onChange={(e) => setEditingPage(editingPage ? { ...editingPage, content: e.target.value } : null)}
              rows={15}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono text-sm resize-none"
              placeholder="<h1>Page Title</h1><p>Your content here...</p>"
            />
            <p className="text-xs text-text-secondary mt-1">
              Use HTML for formatting. Supports headings (h1-h6), paragraphs (p), lists (ul, ol), bold (strong), italics (em), and links (a).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={editingPage?.published || false}
              onChange={(e) => setEditingPage(editingPage ? { ...editingPage, published: e.target.checked } : null)}
              className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="published" className="text-sm font-semibold text-text-primary">
              Published (visible to public)
            </label>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving || !editingPage?.title || !editingPage?.slug}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Page
                </>
              )}
            </button>

            {editingPage?.slug && (
              <Link
                to={`/pages/${editingPage.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-6 py-3 border-2 border-border text-text-primary font-semibold rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-dark">Marketing Pages</h1>
          <p className="text-text-secondary mt-2 text-lg">Manage footer pages visible on the landing page</p>
        </div>
        <button
          onClick={handleNewPage}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          New Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-white rounded-card shadow-light border border-border p-6 hover:shadow-medium transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-dark mb-1">{page.title}</h3>
                <p className="text-sm text-text-secondary font-medium">/pages/{page.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                {page.published ? (
                  <Eye className="h-5 w-5 text-emerald-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-text-secondary" />
                )}
              </div>
            </div>

            {page.meta_description && (
              <p className="text-sm text-text-secondary mb-4 line-clamp-2 font-medium">
                {page.meta_description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={() => setEditingPage(page)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-semibold rounded-xl hover:from-primary/20 hover:to-accent/20 transition-all"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <Link
                to={`/pages/${page.slug}`}
                target="_blank"
                className="px-4 py-2 border-2 border-border text-text-primary font-semibold rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleDelete(page.id)}
                className="px-4 py-2 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="bg-white rounded-card shadow-light border border-border p-12 text-center">
          <h2 className="text-2xl font-bold text-dark mb-2">No Pages Yet</h2>
          <p className="text-text-secondary mb-6 text-lg">Create your first marketing page to get started</p>
          <button
            onClick={handleNewPage}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Create Page
          </button>
        </div>
      )}
    </div>
  );
}
