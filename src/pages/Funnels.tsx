import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { GitBranch, Plus, CreditCard as Edit, Trash2, X, Copy, Target, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import FunnelTemplatePicker from '../components/FunnelTemplatePicker';
import type { Database } from '../lib/database.types';

type Funnel = Database['public']['Tables']['funnels']['Row'];

const goalTypeIcons: Record<string, React.ReactNode> = {
  lead_generation: <Users className="h-5 w-5" />,
  product_sale: <ShoppingCart className="h-5 w-5" />,
  webinar_registration: <Target className="h-5 w-5" />,
  membership_signup: <TrendingUp className="h-5 w-5" />,
};

const goalTypeLabels: Record<string, string> = {
  lead_generation: 'Lead Generation',
  product_sale: 'Product Sale',
  webinar_registration: 'Webinar Registration',
  membership_signup: 'Membership Signup',
};

export default function Funnels() {
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [funnelPageCounts, setFunnelPageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalType: 'lead_generation' as const,
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
        .select('id, funnel_id')
        .eq('site_id', currentSite.id)
        .not('funnel_id', 'is', null),
    ]);

    if (funnelsResult.data) {
      setFunnels(funnelsResult.data);
    }

    if (pagesResult.data) {
      const counts: Record<string, number> = {};
      pagesResult.data.forEach((page) => {
        if (page.funnel_id) {
          counts[page.funnel_id] = (counts[page.funnel_id] || 0) + 1;
        }
      });
      setFunnelPageCounts(counts);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setError('');
    setSaving(true);

    try {
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
      });
      loadData();
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
          const { data: originalPages } = await supabase
            .from('pages')
            .select('*')
            .eq('funnel_id', id)
            .order('created_at', { ascending: true });

          if (originalPages && originalPages.length > 0) {
            const newPages = originalPages.map((page) => ({
              site_id: currentSite.id,
              funnel_id: newFunnel.id,
              title: page.title,
              slug: `${page.slug}-${Date.now()}`,
              page_type: page.page_type,
              content: page.content,
              status: 'draft',
              seo_title: page.seo_title,
              seo_description: page.seo_description,
            }));

            await supabase.from('pages').insert(newPages);
          }

          navigate(`/funnels/${newFunnel.id}`);
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
    if (!confirm('Delete this funnel and all its pages? This action cannot be undone.')) return;

    await supabase.from('pages').delete().eq('funnel_id', id);
    await supabase.from('funnels').delete().eq('id', id);
    loadData();
  };

  const handleTemplateSelect = async (template: any) => {
    if (!currentSite || !template) {
      setShowTemplatePicker(false);
      return;
    }

    setSaving(true);
    setError('');
    setShowTemplatePicker(false);

    try {
      const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          site_id: currentSite.id,
          name: template.name,
          description: template.description,
          goal_type: template.goalType || 'lead_generation',
          status: 'draft',
        })
        .select()
        .single();

      if (funnelError) throw funnelError;

      if (funnelData && template.pages) {
        const pages = template.pages.map((page: any, index: number) => ({
          site_id: currentSite.id,
          funnel_id: funnelData.id,
          title: page.title,
          slug: `${page.slug}-${Date.now()}-${index}`,
          page_type: page.pageType || 'landing',
          content: { blocks: page.blocks || [], theme: page.theme },
          status: 'draft',
        }));

        await supabase.from('pages').insert(pages);
      }

      if (funnelData) {
        navigate(`/funnels/${funnelData.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
          <h1 className="text-4xl font-bold text-dark">Sales Funnels</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Build conversion-focused funnels to turn visitors into customers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="flex items-center space-x-2 px-4 py-2 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
          >
            <GitBranch className="h-5 w-5" />
            <span>Use Template</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>New Funnel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { type: 'lead_generation', label: 'Lead Generation', desc: 'Capture emails & grow your list' },
          { type: 'product_sale', label: 'Product Sale', desc: 'Sell products & services' },
          { type: 'webinar_registration', label: 'Webinar Registration', desc: 'Fill your webinar seats' },
          { type: 'membership_signup', label: 'Membership Signup', desc: 'Grow your membership base' },
        ].map((goal) => {
          const count = funnels.filter((f) => f.goal_type === goal.type).length;
          return (
            <div
              key={goal.type}
              className="bg-white rounded-xl p-5 border border-border hover:shadow-light transition-all"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-primary">
                  {goalTypeIcons[goal.type]}
                </div>
                <div>
                  <div className="text-2xl font-bold text-dark">{count}</div>
                  <div className="text-xs text-text-secondary">{goal.label}</div>
                </div>
              </div>
              <p className="text-xs text-text-secondary">{goal.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-card shadow-light border border-border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-dark">Your Funnels</h2>
          <p className="text-text-secondary mt-2 text-lg">Multi-step customer journey flows</p>
        </div>

        {funnels.length === 0 ? (
          <div className="p-12 text-center">
            <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Funnels Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Funnels are multi-step conversion paths that guide visitors toward a specific action
              like signing up, purchasing, or registering.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setShowTemplatePicker(true)}
                className="px-6 py-3 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
              >
                Start from Template
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                Build from Scratch
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {funnels.map((funnel) => (
              <div
                key={funnel.id}
                className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-primary">
                        {goalTypeIcons[funnel.goal_type || 'lead_generation']}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{funnel.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              funnel.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : funnel.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {funnel.status}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {funnelPageCounts[funnel.id] || 0} pages
                          </span>
                        </div>
                      </div>
                    </div>
                    {funnel.description && (
                      <p className="text-text-secondary ml-13 pl-0.5">{funnel.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2 ml-13 pl-0.5">
                      <span className="flex items-center space-x-1">
                        <Target className="h-3.5 w-3.5" />
                        <span>{goalTypeLabels[funnel.goal_type || 'lead_generation']}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/funnels/${funnel.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDuplicate(funnel.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Duplicate funnel"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(funnel.id)}
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
              <h2 className="text-2xl font-bold text-dark">Create New Funnel</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="What is this funnel for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(goalTypeLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, goalType: value as typeof formData.goalType })
                      }
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition ${
                        formData.goalType === value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-primary">{goalTypeIcons[value]}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
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
                  {saving ? 'Creating...' : 'Create Funnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplatePicker && (
        <FunnelTemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}
