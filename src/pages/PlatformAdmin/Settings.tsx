import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import { ShieldCheck, UserPlus, Trash2, Mail, Save } from 'lucide-react';

interface PlatformAdmin {
  id: string;
  user_id: string;
  email?: string;
  role: 'super_admin' | 'admin';
  permissions: any;
  created_at: string;
}

export default function PlatformAdminSettings() {
  const { isSuperAdmin } = usePlatformAdmin();
  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdmins = async () => {
    try {
      const { data: adminsData, error } = await supabase
        .from('platform_admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const adminsWithEmails = await Promise.all(
        (adminsData || []).map(async (admin) => {
          const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
          return {
            ...admin,
            email: userData?.user?.email || 'Unknown',
          };
        })
      );

      setAdmins(adminsWithEmails);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData?.users.find((u) => u.email === newAdminEmail);

      if (!user) {
        setError('User not found with this email');
        setAdding(false);
        return;
      }

      const { error: insertError } = await supabase.from('platform_admins').insert({
        user_id: user.id,
        role: newAdminRole,
      });

      if (insertError) throw insertError;

      await supabase.rpc('log_platform_action', {
        p_action: 'add_platform_admin',
        p_resource_type: 'admin',
        p_resource_id: user.id,
        p_changes: { email: newAdminEmail, role: newAdminRole },
      });

      setSuccess(`Successfully added ${newAdminEmail} as ${newAdminRole}`);
      setNewAdminEmail('');
      setNewAdminRole('admin');
      await fetchAdmins();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      setError(error.message || 'Failed to add admin');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (admin: PlatformAdmin) => {
    if (!confirm(`Are you sure you want to remove ${admin.email} from platform admins?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('platform_admins').delete().eq('id', admin.id);

      if (error) throw error;

      await supabase.rpc('log_platform_action', {
        p_action: 'remove_platform_admin',
        p_resource_type: 'admin',
        p_resource_id: admin.user_id,
        p_changes: { email: admin.email, role: admin.role },
      });

      setSuccess(`Successfully removed ${admin.email} from platform admins`);
      await fetchAdmins();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      setError(error.message || 'Failed to remove admin');
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
          Only super admins can manage platform settings and other administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-1">Manage platform administrators and configuration</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <UserPlus className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Add Platform Administrator</h2>
        </div>

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The user must already have an account on the platform
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'super_admin')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Super admins have full access to all platform features and settings
            </p>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {adding ? 'Adding...' : 'Add Administrator'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <ShieldCheck className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Current Administrators</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {admins.map((admin) => (
            <div key={admin.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {admin.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{admin.email}</p>
                  <p className="text-xs text-gray-500">
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'} • Added{' '}
                    {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveAdmin(admin)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove admin"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
