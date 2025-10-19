import { useState, useEffect } from 'react';
import { UserPlus, Mail, Trash2, Shield, Check } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  invited_at: string;
  accepted_at: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const roleDescriptions = {
  owner: 'Full access to everything including billing',
  admin: 'Manage all content and settings except billing',
  marketer: 'Manage funnels, pages, emails, and campaigns',
  support: 'View data and manage contacts/orders',
  creator: 'Create and manage content library',
  member: 'View purchased content only',
};

export default function TeamSettings() {
  const { currentSite } = useSite();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('creator');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, [currentSite?.id]);

  const loadTeamMembers = async () => {
    if (!currentSite) return;

    try {
      const { data, error } = await supabase
        .from('site_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!currentSite || !inviteEmail.trim()) return;

    setInviting(true);
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.trim())
        .maybeSingle();

      if (!existingUser) {
        alert('User not found. They must sign up first.');
        return;
      }

      const { data: existingMember } = await supabase
        .from('site_members')
        .select('id')
        .eq('site_id', currentSite.id)
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingMember) {
        alert('This user is already a team member.');
        return;
      }

      const { data: currentUser } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('site_members')
        .insert({
          site_id: currentSite.id,
          user_id: existingUser.id,
          role: inviteRole,
          invited_by: currentUser.user?.id,
          invited_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        });

      if (error) throw error;

      setInviteEmail('');
      setInviteRole('creator');
      await loadTeamMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to invite member. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('site_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await loadTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('site_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      await loadTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team & Permissions</h3>
        <p className="text-sm text-gray-600">Manage your team members and their access levels</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Invite Team Member</h4>
            <p className="text-sm text-blue-700 mb-4">Add collaborators to help manage your site</p>

            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="marketer">Marketer</option>
                <option value="support">Support</option>
                <option value="creator">Creator</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Team Members ({members.length})</h4>

        {members.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No team members yet. Invite someone to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {(member.profiles?.full_name || member.profiles?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">{member.profiles?.email}</p>
                    </div>
                    {member.accepted_at && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {!member.accepted_at && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-13">
                    {roleDescriptions[member.role as keyof typeof roleDescriptions]}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {member.role !== 'owner' && (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="admin">Admin</option>
                        <option value="marketer">Marketer</option>
                        <option value="support">Support</option>
                        <option value="creator">Creator</option>
                        <option value="member">Member</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {member.role === 'owner' && (
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                      Owner
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Role Permissions</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(roleDescriptions).map(([role, description]) => (
            <div key={role} className="flex items-start gap-2">
              <span className="font-medium text-gray-700 capitalize w-20">{role}:</span>
              <span className="text-gray-600">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
