import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Copy, Check, Trash2, Edit2, Calendar, Users, Key } from 'lucide-react';

interface InvitationCode {
  id: string;
  code: string;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  notes: string;
}

interface InvitationCodeUse {
  id: string;
  user_id: string;
  used_at: string;
  users: {
    email: string;
    full_name: string;
  };
}

export default function InvitationCodes() {
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<InvitationCode | null>(null);
  const [codeUses, setCodeUses] = useState<InvitationCodeUse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCodeModal, setShowNewCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [newCode, setNewCode] = useState({
    code: '',
    max_uses: '',
    expires_at: '',
    notes: ''
  });

  useEffect(() => {
    loadCodes();
  }, []);

  useEffect(() => {
    if (selectedCode) {
      loadCodeUses(selectedCode.id);
    }
  }, [selectedCode]);

  async function loadCodes() {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error: any) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCodeUses(codeId: string) {
    try {
      const { data, error } = await supabase
        .from('invitation_code_uses')
        .select(`
          *,
          users:user_id (
            email,
            full_name
          )
        `)
        .eq('code_id', codeId)
        .order('used_at', { ascending: false });

      if (error) throw error;
      setCodeUses(data || []);
    } catch (error: any) {
      console.error('Error loading code uses:', error);
    }
  }

  async function createCode() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const codeData: any = {
        code: newCode.code.toUpperCase(),
        notes: newCode.notes,
        created_by: user?.id
      };

      if (newCode.max_uses) {
        codeData.max_uses = parseInt(newCode.max_uses);
      }

      if (newCode.expires_at) {
        codeData.expires_at = new Date(newCode.expires_at).toISOString();
      }

      const { error } = await supabase
        .from('invitation_codes')
        .insert([codeData]);

      if (error) throw error;

      setShowNewCodeModal(false);
      setNewCode({ code: '', max_uses: '', expires_at: '', notes: '' });
      loadCodes();
    } catch (error: any) {
      alert('Error creating code: ' + error.message);
    }
  }

  async function toggleCodeStatus(code: InvitationCode) {
    try {
      const { error } = await supabase
        .from('invitation_codes')
        .update({ is_active: !code.is_active })
        .eq('id', code.id);

      if (error) throw error;
      loadCodes();
    } catch (error: any) {
      alert('Error updating code: ' + error.message);
    }
  }

  async function deleteCode(codeId: string) {
    if (!confirm('Are you sure you want to delete this invitation code?')) return;

    try {
      const { error } = await supabase
        .from('invitation_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;
      loadCodes();
      if (selectedCode?.id === codeId) {
        setSelectedCode(null);
      }
    } catch (error: any) {
      alert('Error deleting code: ' + error.message);
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function getStatusBadge(code: InvitationCode) {
    if (!code.is_active) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Inactive</span>;
    }
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Expired</span>;
    }
    if (code.max_uses && code.uses_count >= code.max_uses) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">Full</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">Active</span>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitation Codes</h1>
          <p className="text-gray-600 mt-1">Manage access codes for new user signups</p>
        </div>
        <button
          onClick={() => setShowNewCodeModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          New Code
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Codes</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {codes.map(code => (
              <div
                key={code.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                  selectedCode?.id === code.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedCode(code)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold text-gray-900">{code.code}</code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(code.code);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      {copiedCode === code.code ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {getStatusBadge(code)}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {code.uses_count}/{code.max_uses || '∞'}
                  </div>
                  {code.expires_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(code.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {code.notes && (
                  <p className="text-sm text-gray-500">{code.notes}</p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCodeStatus(code);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded transition ${
                      code.is_active
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {code.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCode(code.id);
                    }}
                    className="px-3 py-1 text-xs font-semibold rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {codes.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No invitation codes yet</p>
                <p className="text-sm mt-1">Create one to get started</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Code Usage</h2>
          </div>
          {selectedCode ? (
            <div>
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xl font-bold text-gray-900">{selectedCode.code}</code>
                  {getStatusBadge(selectedCode)}
                </div>
                <div className="text-sm text-gray-600">
                  <p>Uses: {selectedCode.uses_count} / {selectedCode.max_uses || 'Unlimited'}</p>
                  {selectedCode.expires_at && (
                    <p>Expires: {new Date(selectedCode.expires_at).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {codeUses.map(use => (
                  <div key={use.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {use.users?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">{use.users?.email}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(use.used_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {codeUses.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No uses yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Select a code to view usage details</p>
            </div>
          )}
        </div>
      </div>

      {showNewCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Invitation Code</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  placeholder="BETA2025"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Uses
                </label>
                <input
                  type="number"
                  value={newCode.max_uses}
                  onChange={(e) => setNewCode({ ...newCode, max_uses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expires At
                </label>
                <input
                  type="datetime-local"
                  value={newCode.expires_at}
                  onChange={(e) => setNewCode({ ...newCode, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newCode.notes}
                  onChange={(e) => setNewCode({ ...newCode, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Internal notes about this code..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewCodeModal(false);
                  setNewCode({ code: '', max_uses: '', expires_at: '', notes: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={createCode}
                disabled={!newCode.code}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
