import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Calendar, User, FileText } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function PlatformAdminAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('platform_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('resource_type', filter);
      }

      const { data: logsData, error } = await query;

      if (error) throw error;

      const logsWithEmails = await Promise.all(
        (logsData || []).map(async (log) => {
          const { data: userData } = await supabase.auth.admin.getUserById(log.admin_id);
          return {
            ...log,
            admin_email: userData?.user?.email || 'Unknown',
          };
        })
      );

      setLogs(logsWithEmails);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600 bg-green-100';
    if (action.includes('update')) return 'text-blue-600 bg-blue-100';
    if (action.includes('delete')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-600 mt-1">Track all platform admin actions and changes</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('site')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'site'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Sites
        </button>
        <button
          onClick={() => setFilter('user')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setFilter('settings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'settings'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Settings
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No activity logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-600">on {log.resource_type}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {log.admin_email}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    {log.resource_id && (
                      <div className="text-xs text-gray-500 mb-2">
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Resource ID: {log.resource_id}
                        </span>
                      </div>
                    )}

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                          View changes
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.ip_address && (
                      <div className="text-xs text-gray-400 mt-2">IP: {log.ip_address}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
