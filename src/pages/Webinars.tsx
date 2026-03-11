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
  HelpCircle,
  Youtube,
  Link as LinkIcon,
  Mail,
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
    replay_enabled: true,
    replay_delay_hours: 0,
    replay_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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
        replay_enabled: formData.replay_enabled,
        replay_delay_hours: formData.replay_delay_hours,
        replay_url: formData.replay_url || null,
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
        replay_enabled: true,
        replay_delay_hours: 0,
        replay_url: '',
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
    const link = `${window.location.origin}/webinar/${webinarId}/register`;
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHowItWorks(true)}
            className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-200 text-gray-700 font-medium rounded-button hover:bg-gray-50 transition"
          >
            <HelpCircle className="h-4 w-4" />
            <span>How It Works</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
          >
            <Plus className="h-5 w-5" />
            <span>New Webinar</span>
          </button>
        </div>
      </div>

      {webinars.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Welcome to Webinars</h3>
              <p className="text-gray-600 text-sm mb-4">
                CreatorApp handles registration and replay management while you host your live stream on your preferred platform (YouTube Live, Zoom, Vimeo, etc.).
              </p>
              <button
                onClick={() => setShowHowItWorks(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
              >
                Learn how webinars work
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showHowItWorks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-dark">How Webinars Work</h2>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  CreatorApp is a <strong>registration and replay management system</strong> that integrates with external streaming platforms. You host your live stream on YouTube, Zoom, or Vimeo while CreatorApp handles signups and replays.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">The Webinar Flow</h3>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Your Webinar</h4>
                    <p className="text-gray-600 text-sm">Set your title, date/time, and add your streaming URL (YouTube Live, Zoom, etc.)</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Share the Registration Link</h4>
                    <p className="text-gray-600 text-sm">Copy your registration link and share it in emails, landing pages, or social media</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email Your Registrants</h4>
                    <p className="text-gray-600 text-sm">Before the event, send an email to registrants with the streaming link and joining instructions</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Host Your Live Stream</h4>
                    <p className="text-gray-600 text-sm">Go live on your chosen platform. Attendees join using the link you emailed them.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Offer Replay Access</h4>
                    <p className="text-gray-600 text-sm">After the event, registrants can access the replay through CreatorApp</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Supported Streaming Platforms</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">YouTube Live</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Video className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Zoom</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-cyan-600" />
                    <span className="text-sm font-medium">Any URL</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary mt-0.5" />
                    <span>Registrants are automatically added to your Contacts list</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <span>Set a capacity limit for exclusive or limited-seat events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Play className="h-4 w-4 text-primary mt-0.5" />
                    <span>Configure replay availability with optional delay periods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-primary mt-0.5" />
                    <span>Use Email to send reminders and stream links to registrants</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-button hover:bg-gray-50 font-semibold text-gray-700 transition"
                >
                  Close
                </button>
                <Link
                  to="/help"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button text-center hover:shadow-button-hover transition"
                  onClick={() => setShowHowItWorks(false)}
                >
                  View Full Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Replay Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.replay_enabled}
                      onChange={(e) => setFormData({ ...formData, replay_enabled: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Enable replay after webinar ends</span>
                  </label>

                  {formData.replay_enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Replay Delay (hours)
                        </label>
                        <input
                          type="number"
                          value={formData.replay_delay_hours}
                          onChange={(e) => setFormData({ ...formData, replay_delay_hours: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0"
                          placeholder="0 = immediate"
                        />
                        <p className="mt-1 text-xs text-gray-500">0 means replay is available immediately after the webinar ends</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Replay URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={formData.replay_url}
                          onChange={(e) => setFormData({ ...formData, replay_url: e.target.value })}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <p className="mt-1 text-xs text-gray-500">Can be added later after recording the webinar</p>
                      </div>
                    </>
                  )}
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
