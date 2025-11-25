import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  Loader2,
  X,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  status: string;
  subscribers_count: number;
  completion_count: number;
  created_at: string;
}

export default function Automations() {
  const { currentSite } = useSite();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'manual',
  });

  useEffect(() => {
    if (currentSite) {
      loadWorkflows();
    }
  }, [currentSite]);

  const loadWorkflows = async () => {
    if (!currentSite) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setWorkflows(data || []);
    } catch (err: any) {
      console.error('Error loading workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setSaving(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('automation_workflows')
        .insert({
          site_id: currentSite.id,
          name: formData.name,
          description: formData.description,
          trigger_type: formData.trigger_type,
          status: 'draft',
          workflow_data: { nodes: [], edges: [] },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setShowNewModal(false);
      setFormData({ name: '', description: '', trigger_type: 'manual' });
      loadWorkflows();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error: updateError } = await supabase
        .from('automation_workflows')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;
      loadWorkflows();
    } catch (err: any) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this automation? This action cannot be undone.')) return;

    try {
      const { error: deleteError } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      loadWorkflows();
    } catch (err: any) {
      console.error('Error deleting workflow:', err);
    }
  };

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      manual: 'Manual',
      tag_added: 'Tag Added',
      form_submitted: 'Form Submitted',
      product_purchased: 'Product Purchased',
      page_visited: 'Page Visited',
      link_clicked: 'Link Clicked',
      date_based: 'Date Based',
      segment_entered: 'Segment Entered',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-dark">Marketing Automation</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Create automated workflows to nurture and engage your audience
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
        >
          <Plus className="h-5 w-5" />
          <span>New Automation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-semibold">Total Automations</p>
              <p className="text-2xl font-bold text-dark">{workflows.length}</p>
            </div>
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-semibold">Active</p>
              <p className="text-2xl font-bold text-emerald-600">
                {workflows.filter((w) => w.status === 'active').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-semibold">Total Subscribers</p>
              <p className="text-2xl font-bold text-primary">
                {workflows.reduce((sum, w) => sum + w.subscribers_count, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-semibold">Completions</p>
              <p className="text-2xl font-bold text-dark">
                {workflows.reduce((sum, w) => sum + w.completion_count, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-white rounded-card shadow-light p-12 border border-border text-center">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Automations Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first automation workflow to engage your audience automatically
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
          >
            Create First Automation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-dark">{workflow.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  )}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>Trigger: {getTriggerLabel(workflow.trigger_type)}</span>
                    <span>
                      <Users className="h-4 w-4 inline mr-1" />
                      {workflow.subscribers_count} subscribers
                    </span>
                    <span>
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      {workflow.completion_count} completed
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(workflow.id, workflow.status)}
                    className={`p-2 rounded-lg transition ${
                      workflow.status === 'active'
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-emerald-600 hover:bg-green-50'
                    }`}
                    title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                  >
                    {workflow.status === 'active' ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                  <Link
                    to={`/automations/${workflow.id}`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark">Create New Automation</h2>
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

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Welcome Automation"
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
                  placeholder="What does this automation do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Type *
                </label>
                <select
                  required
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="manual">Manual</option>
                  <option value="tag_added">Tag Added</option>
                  <option value="form_submitted">Form Submitted</option>
                  <option value="product_purchased">Product Purchased</option>
                  <option value="page_visited">Page Visited</option>
                  <option value="link_clicked">Link Clicked</option>
                  <option value="segment_entered">Segment Entered</option>
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
