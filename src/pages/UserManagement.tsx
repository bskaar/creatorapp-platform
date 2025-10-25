import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, UserPlus, Loader2, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserWithData extends User {
  sites_count: number;
  products_count: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    siteName: '',
  });

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: authUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');

      if (usersError) throw usersError;

      const usersWithData: UserWithData[] = [];

      for (const user of authUsers || []) {
        const { data: userData } = await supabase.auth.admin.getUserById(user.id);

        const { count: sitesCount } = await supabase
          .from('sites')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('site_id', user.id);

        if (userData?.user) {
          usersWithData.push({
            id: user.id,
            email: userData.user.email || '',
            created_at: user.created_at,
            sites_count: sitesCount || 0,
            products_count: productsCount || 0,
          });
        }
      }

      setUsers(usersWithData);
    } catch (err: any) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This will delete all their sites, products, and data.`)) {
      return;
    }

    setDeleting(userId);
    setError('');
    setSuccess('');

    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) throw deleteError;

      setSuccess(`User ${email} deleted successfully`);
      await loadUsers();
    } catch (err: any) {
      setError('Failed to delete user: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateTestUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No user returned from signup');

      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: newUser.fullName || null,
      });

      if (newUser.siteName) {
        const slug = newUser.siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const { data: siteData, error: siteError } = await supabase
          .from('sites')
          .insert({
            name: newUser.siteName,
            slug: slug,
            owner_id: data.user.id,
            tier: 'launch',
          })
          .select()
          .single();

        if (siteError) throw siteError;

        await supabase.from('site_members').insert({
          site_id: siteData.id,
          user_id: data.user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        });
      }

      setSuccess(`Test user ${newUser.email} created successfully!`);
      setNewUser({ email: '', password: '', fullName: '', siteName: '' });
      await loadUsers();
    } catch (err: any) {
      setError('Failed to create user: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const generateTestEmail = () => {
    const timestamp = Date.now();
    setNewUser({
      ...newUser,
      email: `test${timestamp}@example.com`,
      password: 'testpass123',
      fullName: `Test User ${timestamp}`,
      siteName: `Test Site ${timestamp}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage test users and accounts</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Create Test User Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Create Test User
          </h2>

          <form onSubmit={handleCreateTestUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="test@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="testpass123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Test User"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={newUser.siteName}
                  onChange={(e) => setNewUser({ ...newUser, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Test Site"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={generateTestEmail}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Generate Test Data
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Create Test User</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">All Users</h2>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin h-12 w-12 text-gray-400 mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No users found. Create a test user above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sites
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.sites_count} sites
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={deleting === user.id}
                          className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          {deleting === user.id ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
