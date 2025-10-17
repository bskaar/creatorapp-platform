import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  Mail,
  Plus,
  Send,
  Clock,
  CheckCircle,
  Play,
  Pause,
  MoreVertical,
  Edit,
  Trash2,
  BarChart3,
  Filter,
  Search,
  X,
} from 'lucide-react';
import type { Database } from '../lib/database.types';

type Campaign = Database['public']['Tables']['email_campaigns']['Row'];
type Sequence = Database['public']['Tables']['email_sequences']['Row'];
type Template = Database['public']['Tables']['email_templates']['Row'];

export default function Email() {
  const { currentSite } = useSite();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'sequences' | 'templates'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState({
    broadcasts: 0,
    sequences: 0,
    templates: 0,
    totalSent: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [modalType, setModalType] = useState<'campaign' | 'sequence' | 'template'>('campaign');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    triggerType: 'manual',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentSite) return;
    loadData();
  }, [currentSite, activeTab]);

  const loadData = async () => {
    if (!currentSite) return;

    const [campaignsResult, sequencesResult, templatesResult] = await Promise.all([
      supabase
        .from('email_campaigns')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('email_sequences')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('email_templates')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false }),
    ]);

    if (campaignsResult.data) {
      setCampaigns(campaignsResult.data);
      const totalSent = campaignsResult.data.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const totalOpened = campaignsResult.data.reduce((sum, c) => sum + (c.opened_count || 0), 0);
      const totalClicked = campaignsResult.data.reduce((sum, c) => sum + (c.clicked_count || 0), 0);
      const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      setStats((prev) => ({
        ...prev,
        broadcasts: campaignsResult.data.length,
        totalSent,
        avgOpenRate,
        avgClickRate,
      }));
    }

    if (sequencesResult.data) {
      setSequences(sequencesResult.data);
      setStats((prev) => ({
        ...prev,
        sequences: sequencesResult.data.length,
      }));
    }

    if (templatesResult.data) {
      setTemplates(templatesResult.data);
      setStats((prev) => ({
        ...prev,
        templates: templatesResult.data.length,
      }));
    }

    setLoading(false);
  };

  const handleCreateNew = (type: 'campaign' | 'sequence' | 'template') => {
    setModalType(type);
    setFormData({
      name: '',
      subject: '',
      description: '',
      triggerType: 'manual',
    });
    setError('');
    setShowNewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setError('');
    setSaving(true);

    try {
      if (modalType === 'campaign') {
        const { error: insertError } = await supabase.from('email_campaigns').insert({
          site_id: currentSite.id,
          name: formData.name,
          subject: formData.subject,
          content: { blocks: [] },
          campaign_type: 'broadcast',
          status: 'draft',
        });

        if (insertError) throw insertError;
      } else if (modalType === 'sequence') {
        const { error: insertError } = await supabase.from('email_sequences').insert({
          site_id: currentSite.id,
          name: formData.name,
          description: formData.description,
          trigger_type: formData.triggerType,
          status: 'draft',
        });

        if (insertError) throw insertError;
      } else {
        const { error: insertError } = await supabase.from('email_templates').insert({
          site_id: currentSite.id,
          name: formData.name,
          subject: formData.subject,
          content: { blocks: [] },
          template_type: 'broadcast',
        });

        if (insertError) throw insertError;
      }

      setShowNewModal(false);
      setFormData({ name: '', subject: '', description: '', triggerType: 'manual' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'campaign' | 'sequence' | 'template') => {
    if (!confirm(`Delete this ${type}? This action cannot be undone.`)) return;

    const table =
      type === 'campaign'
        ? 'email_campaigns'
        : type === 'sequence'
        ? 'email_sequences'
        : 'email_templates';

    await supabase.from(table).delete().eq('id', id);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-600 mt-1">
            Create campaigns, sequences, and automate your email marketing
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleCreateNew('campaign')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sent</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSent.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Open Rate</h3>
          <p className="text-3xl font-bold text-green-600">{stats.avgOpenRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Click Rate</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.avgClickRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Sequences</h3>
          <p className="text-3xl font-bold text-gray-900">
            {sequences.filter((s) => s.status === 'active').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'campaigns'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Campaigns ({stats.broadcasts})
            </button>
            <button
              onClick={() => setActiveTab('sequences')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'sequences'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sequences ({stats.sequences})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'templates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates ({stats.templates})
            </button>
          </div>
        </div>

        {activeTab === 'campaigns' && (
          <>
            {campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Campaigns Yet</h2>
                <p className="text-gray-600 mb-6">
                  Create your first email campaign to reach your contacts
                </p>
                <button
                  onClick={() => handleCreateNew('campaign')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create First Campaign
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              campaign.status === 'sent'
                                ? 'bg-green-100 text-green-700'
                                : campaign.status === 'sending'
                                ? 'bg-blue-100 text-blue-700'
                                : campaign.status === 'scheduled'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                          <span>
                            <Send className="h-4 w-4 inline mr-1" />
                            {campaign.sent_count || 0} sent
                          </span>
                          <span>
                            <Mail className="h-4 w-4 inline mr-1" />
                            {campaign.opened_count || 0} opened
                          </span>
                          <span>
                            <BarChart3 className="h-4 w-4 inline mr-1" />
                            {campaign.clicked_count || 0} clicked
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/email/campaigns/${campaign.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(campaign.id, 'campaign')}
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
          </>
        )}

        {activeTab === 'sequences' && (
          <>
            {sequences.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Sequences Yet</h2>
                <p className="text-gray-600 mb-6">
                  Create automated email sequences to nurture your contacts
                </p>
                <button
                  onClick={() => handleCreateNew('sequence')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create First Sequence
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {sequences.map((sequence) => (
                  <div key={sequence.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{sequence.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              sequence.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : sequence.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {sequence.status}
                          </span>
                        </div>
                        {sequence.description && (
                          <p className="text-sm text-gray-600 mb-2">{sequence.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="capitalize">
                            Trigger: {sequence.trigger_type.replace('_', ' ')}
                          </span>
                          <span>{sequence.subscribers_count || 0} subscribers</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/email/sequences/${sequence.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(sequence.id, 'sequence')}
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
          </>
        )}

        {activeTab === 'templates' && (
          <>
            {templates.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Templates Yet</h2>
                <p className="text-gray-600 mb-6">
                  Create reusable email templates to speed up your workflow
                </p>
                <button
                  onClick={() => handleCreateNew('template')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create First Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Mail className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      {template.subject && (
                        <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                          Use Template
                        </button>
                        <button
                          onClick={() => handleDelete(template.id, 'template')}
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
          </>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New {modalType === 'campaign' ? 'Campaign' : modalType === 'sequence' ? 'Sequence' : 'Template'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`My ${modalType}`}
                />
              </div>

              {modalType !== 'sequence' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required={modalType !== 'sequence'}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email subject line"
                  />
                </div>
              )}

              {modalType === 'sequence' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="What is this sequence for?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger Type *
                    </label>
                    <select
                      required
                      value={formData.triggerType}
                      onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="manual">Manual</option>
                      <option value="tag_added">Tag Added</option>
                      <option value="product_purchased">Product Purchased</option>
                      <option value="page_visited">Page Visited</option>
                      <option value="funnel_entered">Funnel Entered</option>
                      <option value="webinar_registered">Webinar Registered</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
