import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  Video,
  Plus,
  Calendar,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  Play,
  Copy,
  ExternalLink,
  X,
} from 'lucide-react';
import type { Database } from '../lib/database.types';

type Webinar = Database['public']['Tables']['webinars']['Row'];

export default function Webinars() {
  const { currentSite } = useSite();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    webinar_type: 'live' as 'live' | 'automated' | 'hybrid',
    scheduled_at: '',
    duration_minutes: 60,
    timezone: 'UTC',
    stream_url: '',
    max_attendees: null as number | null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentSite) return;
    loadWebinars();
  }, [currentSite, activeTab]);

  const loadWebinars = async () => {
    if (!currentSite) return;

    let query = supabase
      .from('webinars')
      .select('*')
      .eq('site_id', currentSite.id)
      .order('scheduled_at', { ascending: false });

    if (activeTab === 'upcoming') {
      query = query.gte('scheduled_at', new Date().toISOString()).eq('status', 'scheduled');
    } else if (activeTab === 'past') {
      query = query.or('status.eq.completed,status.eq.cancelled');
    }

    const { data } = await query;

    if (data) {
      setWebinars(data);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setError('');
    setSaving(true);

    try {
      const { error: insertError } = await supabase.from('webinars').insert({
        site_id: currentSite.id,
        title: formData.title,
        description: formData.description,
        webinar_type: formData.webinar_type,
        scheduled_at: formData.scheduled_at,
        duration_minutes: formData.duration_minutes,
        timezone: formData.timezone,
        stream_url: formData.stream_url,
        max_attendees: formData.max_attendees,
        status: 'scheduled',
      });

      if (insertError) throw insertError;

      setShowNewModal(false);
      setFormData({
        title: '',
        description: '',
        webinar_type: 'live',
        scheduled_at: '',
        duration_minutes: 60,
        timezone: 'UTC',
        stream_url: '',
        max_attendees: null,
      });
      loadWebinars();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webinar? This action cannot be undone.')) return;

    await supabase.from('webinars').delete().eq('id', id);
    loadWebinars();
  };

  const copyRegistrationLink = (webinarId: string) => {
    const link = `${window.location.origin}/register/${webinarId}`;
    navigator.clipboard.writeText(link);
    alert('Registration link copied to clipboard!');
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
          <h1 className="text-4xl font-bold text-dark">Webinars</h1>
          <p className="text-text-secondary mt-2 text-lg">Schedule live and automated webinar events</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
        >
          <Plus className="h-5 w-5" />
          <span>New Webinar</span>
        </button>
      </div>

      <div className="bg-white rounded-card shadow-light border border-border">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'upcoming'
                  ? 'border-primary text-primary bg-gradient-to-b from-primary/5 to-transparent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-gradient-to-b hover:from-primary/5 hover:to-transparent'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'past'
                  ? 'border-primary text-primary bg-gradient-to-b from-primary/5 to-transparent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-gradient-to-b hover:from-primary/5 hover:to-transparent'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'all'
                  ? 'border-primary text-primary bg-gradient-to-b from-primary/5 to-transparent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-gradient-to-b hover:from-primary/5 hover:to-transparent'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {webinars.length === 0 ? (
          <div className="p-12 text-center">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Webinars</h2>
            <p className="text-gray-600 mb-6">Create your first webinar to engage with your audience live</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
            >
              Schedule Your First Webinar
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {webinars.map((webinar) => (
              <div key={webinar.id} className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-dark">{webinar.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          webinar.status === 'live'
                            ? 'bg-red-100 text-red-700'
                            : webinar.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : webinar.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {webinar.status}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          webinar.webinar_type === 'live'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {webinar.webinar_type}
                      </span>
                    </div>

                    {webinar.description && (
                      <p className="text-sm text-gray-600 mb-3">{webinar.description}</p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(webinar.scheduled_at).toLocaleDateString()} at{' '}
                        {new Date(webinar.scheduled_at).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {webinar.duration_minutes} minutes
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {webinar.registration_count || 0} registered
                        {webinar.max_attendees && ` / ${webinar.max_attendees} max`}
                      </span>
                      {webinar.status === 'completed' && (
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {webinar.attendance_count || 0} attended
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyRegistrationLink(webinar.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Copy registration link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/webinars/${webinar.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {webinar.replay_available && (
                      <button className="p-2 text-emerald-600 hover:bg-green-50 rounded-lg transition">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(webinar.id)}
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
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">Create New Webinar</h2>
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
                  Webinar Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Introduction to Product Marketing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What will attendees learn?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    required
                    value={formData.webinar_type}
                    onChange={(e) =>
                      setFormData({ ...formData, webinar_type: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="live">Live</option>
                    <option value="automated">Automated</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="15"
                    step="5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream URL {formData.webinar_type === 'live' && '*'}
                </label>
                <input
                  type="url"
                  required={formData.webinar_type === 'live'}
                  value={formData.stream_url}
                  onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://youtube.com/live/..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  YouTube, Vimeo, or custom streaming URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Attendees (Optional)
                </label>
                <input
                  type="number"
                  value={formData.max_attendees || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_attendees: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Leave blank for unlimited"
                  min="1"
                />
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
                  {saving ? 'Creating...' : 'Create Webinar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
