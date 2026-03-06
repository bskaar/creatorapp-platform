import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserAvatarProps {
  avatarUrl?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onAvatarChange?: (url: string | null) => void;
  userId?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

export default function UserAvatar({
  avatarUrl,
  email,
  size = 'md',
  editable = false,
  onAvatarChange,
  userId,
  className = '',
}: UserAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = email?.charAt(0).toUpperCase() || '?';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTimestamp })
        .eq('id', userId);

      if (updateError) throw updateError;

      onAvatarChange?.(urlWithTimestamp);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!userId) return;

    setUploading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      onAvatarChange?.(null);
    } catch (err: any) {
      console.error('Error removing avatar:', err);
      setError(err.message || 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl overflow-hidden flex items-center justify-center font-bold shadow-lg ${
          avatarUrl
            ? 'bg-gray-200'
            : 'bg-gradient-to-br from-primary to-accent text-white'
        }`}
      >
        {uploading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin text-white`} />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt={email || 'User avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          initial
        )}
      </div>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              title="Upload avatar"
            >
              <Camera className="h-3 w-3 text-gray-600" />
            </button>
            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors border border-gray-200"
                title="Remove avatar"
              >
                <X className="h-3 w-3 text-red-500" />
              </button>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
