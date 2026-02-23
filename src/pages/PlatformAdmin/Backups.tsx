import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import {
  Database,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  HardDrive,
  Table,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';

interface BackupMetadata {
  id: string;
  created_at: string;
  backup_type: 'full' | 'critical';
  tables_count: number;
  total_rows: number;
  size_bytes: number;
  status: 'completed' | 'failed';
  error?: string;
}

interface ScheduleInfo {
  recommended_schedule: string;
  critical_tables: string[];
  all_tables: string[];
  notes: string[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export default function PlatformAdminBackups() {
  const { isSuperAdmin } = usePlatformAdmin();
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [backupType, setBackupType] = useState<'full' | 'critical'>('critical');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchBackups = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/database-backup`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'list' }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch backups');
      }

      const data = await response.json();
      setBackups(data);
    } catch (err) {
      console.error('Error fetching backups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleInfo = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/database-backup`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'schedule_info' }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setScheduleInfo(data);
      }
    } catch (err) {
      console.error('Error fetching schedule info:', err);
    }
  };

  useEffect(() => {
    fetchBackups();
    fetchScheduleInfo();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/database-backup`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'create', backup_type: backupType }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create backup');
      }

      const result = await response.json();
      setSuccess(
        `Backup created successfully! ${result.tables_count} tables, ${result.total_rows.toLocaleString()} rows, ${formatBytes(result.size_bytes)}`
      );
      await fetchBackups();
    } catch (err) {
      console.error('Error creating backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backupId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/database-backup`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'download', backup_id: backupId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get download URL');
      }

      const { download_url } = await response.json();
      window.open(download_url, '_blank');
    } catch (err) {
      console.error('Error downloading backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to download backup');
    }
  };

  const handleDelete = async (backup: BackupMetadata) => {
    if (!confirm(`Are you sure you want to delete this backup from ${formatDate(backup.created_at)}?`)) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/database-backup`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'delete', backup_id: backup.id }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete backup');
      }

      setSuccess('Backup deleted successfully');
      await fetchBackups();
    } catch (err) {
      console.error('Error deleting backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete backup');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Super Admin Access Required</h2>
        <p className="text-gray-600">
          Only super admins can manage database backups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Backups</h1>
          <p className="text-gray-600 mt-1">Create and manage database exports for disaster recovery</p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {showInfo && scheduleInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Backup Information</h3>
          <div className="space-y-3 text-sm text-blue-800">
            {scheduleInfo.notes.map((note, i) => (
              <p key={i} className="flex items-start">
                <span className="mr-2">-</span>
                {note}
              </p>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Critical tables ({scheduleInfo.critical_tables.length}):</strong>{' '}
              {scheduleInfo.critical_tables.slice(0, 5).join(', ')}
              {scheduleInfo.critical_tables.length > 5 && ` +${scheduleInfo.critical_tables.length - 5} more`}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Full backup tables:</strong> {scheduleInfo.all_tables.length} tables
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Database className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Create New Backup</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Type
            </label>
            <select
              value={backupType}
              onChange={(e) => setBackupType(e.target.value as 'full' | 'critical')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="critical">Critical Tables Only (Faster)</option>
              <option value="full">Full Database Export</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {backupType === 'critical'
                ? 'Includes sites, users, pages, products, orders, and other essential data'
                : 'Includes all tables including analytics and logs (may take longer)'}
            </p>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Create Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center">
            <HardDrive className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Available Backups</h2>
          </div>
          <button
            onClick={fetchBackups}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {backups.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No backups found. Create your first backup above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <div key={backup.id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          backup.backup_type === 'full'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {backup.backup_type === 'full' ? 'Full' : 'Critical'}
                      </span>
                      {backup.status === 'completed' ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                          Failed
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(backup.created_at)}
                      </span>
                      <span className="flex items-center">
                        <Table className="w-4 h-4 mr-1" />
                        {backup.tables_count} tables
                      </span>
                      <span className="flex items-center">
                        <Database className="w-4 h-4 mr-1" />
                        {backup.total_rows.toLocaleString()} rows
                      </span>
                      <span className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-1" />
                        {formatBytes(backup.size_bytes)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(backup.id)}
                      className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(backup)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete backup"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-800">Backup Recommendations</h4>
            <ul className="mt-2 text-sm text-amber-700 space-y-1">
              <li>- Create a critical backup daily and a full backup weekly</li>
              <li>- Download backups to external storage for true disaster recovery</li>
              <li>- Keep at least 7 days of backups available</li>
              <li>- Test restoring from backup periodically to ensure data integrity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
