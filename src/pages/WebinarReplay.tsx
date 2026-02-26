import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, AlertCircle, Loader2, Lock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WebinarData {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  replay_url: string | null;
  replay_enabled: boolean;
  replay_delay_hours: number;
  replay_expires_at: string | null;
  status: string;
  sites: {
    name: string;
    logo_url: string | null;
    primary_color: string;
  };
}

export default function WebinarReplay() {
  const { webinarId } = useParams();
  const [loading, setLoading] = useState(true);
  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    if (webinarId) {
      fetchWebinar();
    }
  }, [webinarId]);

  const fetchWebinar = async () => {
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select(`
          id,
          title,
          description,
          scheduled_at,
          duration_minutes,
          replay_url,
          replay_enabled,
          replay_delay_hours,
          replay_expires_at,
          status,
          sites (
            name,
            logo_url,
            primary_color
          )
        `)
        .eq('id', webinarId)
        .maybeSingle();

      if (error || !data) {
        setError('Webinar not found');
        return;
      }

      setWebinar(data as WebinarData);
    } catch (err) {
      setError('Unable to load webinar details');
    } finally {
      setLoading(false);
    }
  };

  const verifyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webinar) return;

    setVerifying(true);
    setAccessError(null);

    try {
      const { data: attendance } = await supabase
        .from('webinar_attendance')
        .select('id')
        .eq('webinar_id', webinar.id)
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (!attendance) {
        setAccessError('Email not found. Please register for the webinar first.');
        return;
      }

      await supabase
        .from('webinar_attendance')
        .update({
          replay_viewed: true,
          replay_viewed_at: new Date().toISOString(),
        })
        .eq('id', attendance.id);

      setVerified(true);
    } catch (err) {
      setAccessError('Unable to verify access. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
          <p className="mt-2 text-gray-400">Loading replay...</p>
        </div>
      </div>
    );
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Replay Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'This replay is not available.'}</p>
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

  const primaryColor = webinar.sites?.primary_color || '#3B82F6';

  if (!webinar.replay_enabled) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
          <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Replay Not Available</h1>
          <p className="text-gray-400">The replay for this webinar is not available.</p>
        </div>
      </div>
    );
  }

  const webinarEndTime = new Date(webinar.scheduled_at);
  webinarEndTime.setMinutes(webinarEndTime.getMinutes() + webinar.duration_minutes);
  const replayAvailableAt = new Date(webinarEndTime);
  replayAvailableAt.setHours(replayAvailableAt.getHours() + webinar.replay_delay_hours);
  const isReplayAvailable = new Date() >= replayAvailableAt;

  if (!isReplayAvailable) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Replay Coming Soon</h1>
          <p className="text-gray-400 mb-4">
            The replay for "{webinar.title}" will be available on:
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-white">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {replayAvailableAt.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          <Link
            to={`/webinar/${webinar.id}/register`}
            className="inline-block px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Register for Updates
          </Link>
        </div>
      </div>
    );
  }

  if (webinar.replay_expires_at && new Date() > new Date(webinar.replay_expires_at)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Replay Expired</h1>
          <p className="text-gray-400">
            The replay for this webinar is no longer available.
          </p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8">
          {webinar.sites?.logo_url && (
            <div className="text-center mb-6">
              <img
                src={webinar.sites.logo_url}
                alt={webinar.sites.name}
                className="h-10 mx-auto"
              />
            </div>
          )}
          <div className="text-center mb-6">
            <Play className="w-12 h-12 mx-auto mb-4" style={{ color: primaryColor }} />
            <h1 className="text-2xl font-bold text-white mb-2">{webinar.title}</h1>
            <p className="text-gray-400">Enter your email to access the replay</p>
          </div>

          <form onSubmit={verifyAccess} className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': primaryColor } as any}
                placeholder="Enter your registered email"
              />
            </div>

            {accessError && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-sm text-red-300">{accessError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 px-4 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Watch Replay
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have access?{' '}
            <Link
              to={`/webinar/${webinar.id}/register`}
              className="hover:underline"
              style={{ color: primaryColor }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {webinar.sites?.logo_url && (
          <div className="mb-6">
            <img
              src={webinar.sites.logo_url}
              alt={webinar.sites.name}
              className="h-8"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-white mb-2">{webinar.title}</h1>
        {webinar.description && (
          <p className="text-gray-400 mb-6">{webinar.description}</p>
        )}

        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
          {webinar.replay_url ? (
            webinar.replay_url.includes('youtube.com') || webinar.replay_url.includes('youtu.be') ? (
              <iframe
                src={webinar.replay_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : webinar.replay_url.includes('vimeo.com') ? (
              <iframe
                src={webinar.replay_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={webinar.replay_url}
                controls
                className="w-full h-full"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Replay video not available</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{webinar.duration_minutes} minutes</span>
          </div>
          {webinar.replay_expires_at && (
            <div className="flex items-center gap-1 text-amber-500">
              <AlertCircle className="w-4 h-4" />
              <span>
                Expires {new Date(webinar.replay_expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
