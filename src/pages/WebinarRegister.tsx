import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle, Loader2, AlertCircle, Video } from 'lucide-react';

interface WebinarData {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  max_attendees: number | null;
  type: string;
  status: string;
  replay_enabled: boolean;
  spots_remaining: number | null;
  is_full: boolean;
  sites: {
    name: string;
    logo_url: string | null;
    primary_color: string;
  };
}

export default function WebinarRegister() {
  const { webinarId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });

  useEffect(() => {
    if (webinarId) {
      fetchWebinar();
    }
  }, [webinarId]);

  const fetchWebinar = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webinar-register?id=${webinarId}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Webinar not found');
        return;
      }

      setWebinar(data.webinar);
    } catch (err) {
      setError('Unable to load webinar details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webinar) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webinar-register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webinarId: webinar.id,
            email: formData.email,
            name: formData.name || undefined,
            source: 'direct',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      if (data.alreadyRegistered) {
        setAlreadyRegistered(true);
      }
      setSuccess(true);
    } catch (err) {
      setError('Unable to complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string, timezone: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const addToCalendar = () => {
    if (!webinar) return;

    const startDate = new Date(webinar.scheduled_at);
    const endDate = new Date(startDate.getTime() + webinar.duration_minutes * 60000);

    const formatForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(webinar.title)}&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}&details=${encodeURIComponent(webinar.description || '')}`;

    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading webinar details...</p>
        </div>
      </div>
    );
  }

  if (error && !webinar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Webinar Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!webinar) return null;

  const primaryColor = webinar.sites?.primary_color || '#3B82F6';

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {alreadyRegistered ? "You're Already Registered!" : "You're Registered!"}
          </h1>
          <p className="text-gray-600 mb-4">
            {alreadyRegistered
              ? `You've already registered for "${webinar.title}".`
              : `You're all set for "${webinar.title}".`}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(webinar.scheduled_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{formatTime(webinar.scheduled_at, webinar.timezone)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            We'll send you a reminder email before the webinar starts.
          </p>
          <button
            onClick={addToCalendar}
            className="w-full py-3 px-4 border-2 rounded-lg font-medium transition-colors"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Add to Google Calendar
          </button>
        </div>
      </div>
    );
  }

  const isPast = new Date(webinar.scheduled_at) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {webinar.sites?.logo_url && (
          <div className="text-center mb-8">
            <img
              src={webinar.sites.logo_url}
              alt={webinar.sites.name}
              className="h-12 mx-auto"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8" style={{ backgroundColor: `${primaryColor}10` }}>
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5" style={{ color: primaryColor }} />
              <span
                className="text-sm font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                {webinar.type === 'live' ? 'Live Webinar' : webinar.type === 'automated' ? 'On-Demand' : 'Webinar'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{webinar.title}</h1>
            {webinar.description && (
              <p className="text-gray-600">{webinar.description}</p>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(webinar.scheduled_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(webinar.scheduled_at, webinar.timezone)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Spots</p>
                  <p className="font-medium text-gray-900">
                    {webinar.spots_remaining !== null
                      ? `${webinar.spots_remaining} remaining`
                      : 'Unlimited'}
                  </p>
                </div>
              </div>
            </div>

            {isPast && webinar.status === 'completed' ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">This webinar has ended.</p>
                {webinar.replay_enabled && (
                  <Link
                    to={`/webinar/${webinar.id}/replay`}
                    className="inline-block px-6 py-3 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Watch Replay
                  </Link>
                )}
              </div>
            ) : webinar.is_full ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <p className="text-gray-600">This webinar is currently full.</p>
              </div>
            ) : webinar.status === 'cancelled' ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">This webinar has been cancelled.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    placeholder="John Doe"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register for Free'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By registering, you agree to receive email reminders about this webinar.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Hosted by {webinar.sites?.name || 'CreatorApp'}
        </p>
      </div>
    </div>
  );
}
