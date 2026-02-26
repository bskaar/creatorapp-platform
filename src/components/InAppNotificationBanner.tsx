import { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  severity: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
}

export default function InAppNotificationBanner() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel('in_app_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('dismissed_at', null)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setNotifications(data);
    }
  };

  const dismissNotification = async (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));

    await supabase
      .from('in_app_notifications')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', id);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  const getButtonStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const visibleNotifications = notifications.filter((n) => !dismissedIds.has(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 ${getStyles(notification.severity)}`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${getIconStyles(notification.severity)}`}>
              {getIcon(notification.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm mt-1 opacity-90">{notification.message}</p>
              {notification.action_url && (
                <Link
                  to={notification.action_url}
                  className={`inline-block mt-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getButtonStyles(notification.severity)}`}
                >
                  {notification.action_label || 'Take Action'}
                </Link>
              )}
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
