import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../UserAvatar';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string | null;
}

export default function ProfileSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleAvatarChange = (url: string | null) => {
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-dark mb-4">Profile Settings</h3>
        <p className="text-sm text-text-secondary font-medium">
          Manage your personal profile and avatar
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">
            Profile Photo
          </label>
          <div className="flex items-center gap-6">
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              email={user?.email}
              size="xl"
              editable={true}
              onAvatarChange={handleAvatarChange}
              userId={user?.id}
            />
            <div>
              <p className="text-sm text-gray-700 font-medium">
                {profile?.avatar_url ? 'Click the camera icon to change your photo' : 'Add a profile photo'}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                JPG, PNG, GIF, or WebP. Max 5MB. This will be used across your sites and community.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2 border border-border rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-text-secondary mt-1">
            Your email address cannot be changed
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Your full name"
          />
          <p className="text-xs text-text-secondary mt-1">
            This will be displayed on your profile and in community interactions
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            placeholder="Tell us a bit about yourself..."
          />
          <p className="text-xs text-text-secondary mt-1">
            A short bio that will be visible to others in your community
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-button hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
