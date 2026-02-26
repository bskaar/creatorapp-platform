import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  X,
  ExternalLink,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface ErrorLog {
  id: string;
  error_type: string;
  severity: string;
  message: string;
  stack_trace: string | null;
  user_id: string | null;
  site_id: string | null;
  url: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface ErrorStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
  todayCount: number;
}

export default function ErrorMonitoring() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [filters, setFilters] = useState({
    severity: '',
    type: '',
    resolved: 'unresolved',
    search: '',
  });
  const [resolving, setResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchErrors();
    fetchStats();
  }, [filters]);

  const fetchErrors = async () => {
    setLoading(true);
    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.type) {
      query = query.eq('error_type', filters.type);
    }
    if (filters.resolved === 'resolved') {
      query = query.eq('resolved', true);
    } else if (filters.resolved === 'unresolved') {
      query = query.eq('resolved', false);
    }
    if (filters.search) {
      query = query.ilike('message', `%${filters.search}%`);
    }

    const { data } = await query;
    setErrors(data || []);
    setLoading(false);
  };

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: allErrors } = await supabase
      .from('error_logs')
      .select('severity, resolved, created_at');

    if (allErrors) {
      const stats: ErrorStats = {
        total: allErrors.length,
        critical: allErrors.filter((e) => e.severity === 'critical').length,
        high: allErrors.filter((e) => e.severity === 'high').length,
        medium: allErrors.filter((e) => e.severity === 'medium').length,
        low: allErrors.filter((e) => e.severity === 'low').length,
        resolved: allErrors.filter((e) => e.resolved).length,
        todayCount: allErrors.filter((e) => new Date(e.created_at) >= today).length,
      };
      setStats(stats);
    }
  };

  const markResolved = async () => {
    if (!selectedError) return;

    setResolving(true);
    const { error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes || null,
      })
      .eq('id', selectedError.id);

    if (!error) {
      setSelectedError(null);
      setResolutionNotes('');
      fetchErrors();
      fetchStats();
    }
    setResolving(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return styles[severity] || styles.low;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Monitoring</h1>
          <p className="text-gray-600">Track and resolve application errors</p>
        </div>
        <button
          onClick={() => {
            fetchErrors();
            fetchStats();
          }}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Total Errors</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-2xl font-bold text-blue-600">{stats.todayCount}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Critical</p>
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">High</p>
            <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Medium</p>
            <p className="text-2xl font-bold text-amber-600">{stats.medium}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Low</p>
            <p className="text-2xl font-bold text-blue-600">{stats.low}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search error messages..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="javascript">JavaScript</option>
              <option value="api">API</option>
              <option value="auth">Auth</option>
              <option value="payment">Payment</option>
              <option value="network">Network</option>
              <option value="validation">Validation</option>
            </select>
            <select
              value={filters.resolved}
              onChange={(e) => setFilters({ ...filters, resolved: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading errors...</p>
          </div>
        ) : errors.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No errors found matching your filters</p>
          </div>
        ) : (
          <div className="divide-y">
            {errors.map((error) => (
              <div
                key={error.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                  error.resolved ? 'opacity-60' : ''
                }`}
                onClick={() => setSelectedError(error)}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadge(error.severity)}`}>
                        {error.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {error.error_type}
                      </span>
                      {error.resolved && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{error.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(error.created_at)}
                      </span>
                      {error.url && (
                        <span className="truncate max-w-[200px]">{error.url}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                {getSeverityIcon(selectedError.severity)}
                <div>
                  <h2 className="font-semibold text-gray-900">Error Details</h2>
                  <p className="text-sm text-gray-500">{formatDate(selectedError.created_at)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Message</label>
                  <p className="mt-1 text-gray-900">{selectedError.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Severity</label>
                    <p className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityBadge(selectedError.severity)}`}>
                        {selectedError.severity}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                    <p className="mt-1 text-gray-900">{selectedError.error_type}</p>
                  </div>
                </div>

                {selectedError.url && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">URL</label>
                    <p className="mt-1 text-gray-900 break-all">{selectedError.url}</p>
                  </div>
                )}

                {selectedError.stack_trace && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Stack Trace</label>
                    <pre className="mt-1 p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
                      {selectedError.stack_trace}
                    </pre>
                  </div>
                )}

                {selectedError.user_agent && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">User Agent</label>
                    <p className="mt-1 text-gray-600 text-sm">{selectedError.user_agent}</p>
                  </div>
                )}

                {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Metadata</label>
                    <pre className="mt-1 p-3 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedError.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedError.resolved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Resolved
                    </div>
                    {selectedError.resolution_notes && (
                      <p className="mt-2 text-sm text-green-700">{selectedError.resolution_notes}</p>
                    )}
                    <p className="mt-1 text-xs text-green-600">
                      {new Date(selectedError.resolved_at!).toLocaleString()}
                    </p>
                  </div>
                )}

                {!selectedError.resolved && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Notes (Optional)
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe how the issue was resolved..."
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setSelectedError(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {!selectedError.resolved && (
                <button
                  onClick={markResolved}
                  disabled={resolving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {resolving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mark as Resolved
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
