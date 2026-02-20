import { useState, useEffect, useRef } from 'react';
import { Upload, Save, Palette, Image, X } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface GeneralSettingsProps {
  onSave?: () => void;
}

export default function GeneralSettings({ onSave }: GeneralSettingsProps) {
  const { currentSite, refreshSites } = useSite();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#3B82F6',
    description: '',
    keywords: '',
    timezone: 'America/New_York',
    favicon_url: '',
  });

  useEffect(() => {
    if (currentSite) {
      setFormData({
        name: currentSite.name || '',
        slug: currentSite.slug || '',
        primary_color: currentSite.primary_color || '#3B82F6',
        description: (currentSite.settings as any)?.description || '',
        keywords: (currentSite.settings as any)?.keywords || '',
        timezone: (currentSite.settings as any)?.timezone || 'America/New_York',
        favicon_url: (currentSite as any).favicon_url || '',
      });
    }
  }, [currentSite]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSite || !user) return;

    const validTypes = ['image/png', 'image/x-icon', 'image/ico', 'image/vnd.microsoft.icon', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, ICO, JPG, or SVG file');
      return;
    }

    if (file.size > 512000) {
      alert('Favicon must be less than 500KB');
      return;
    }

    setUploadingFavicon(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}/${currentSite.id}-favicon-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, favicon_url: publicUrl }));
      setSaved(false);
    } catch (error) {
      console.error('Error uploading favicon:', error);
      alert('Failed to upload favicon. Please try again.');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleRemoveFavicon = () => {
    setFormData(prev => ({ ...prev, favicon_url: '' }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!currentSite) return;

    setLoading(true);
    try {
      const settings = {
        ...(currentSite.settings as any || {}),
        description: formData.description,
        keywords: formData.keywords,
        timezone: formData.timezone,
      };

      const { error } = await supabase
        .from('sites')
        .update({
          name: formData.name,
          slug: formData.slug,
          primary_color: formData.primary_color,
          favicon_url: formData.favicon_url || null,
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSite.id);

      if (error) throw error;

      await refreshSites();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSave?.();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const timezones = [
    { value: 'Pacific/Midway', label: 'Midway Island (GMT-11:00)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (GMT-10:00)' },
    { value: 'America/Anchorage', label: 'Alaska (GMT-09:00)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time - US & Canada (GMT-08:00)' },
    { value: 'America/Denver', label: 'Mountain Time - US & Canada (GMT-07:00)' },
    { value: 'America/Chicago', label: 'Central Time - US & Canada (GMT-06:00)' },
    { value: 'America/New_York', label: 'Eastern Time - US & Canada (GMT-05:00)' },
    { value: 'America/Caracas', label: 'Caracas (GMT-04:00)' },
    { value: 'America/Halifax', label: 'Atlantic Time - Canada (GMT-04:00)' },
    { value: 'America/Sao_Paulo', label: 'Brasilia (GMT-03:00)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-03:00)' },
    { value: 'Atlantic/Azores', label: 'Azores (GMT-01:00)' },
    { value: 'Europe/London', label: 'London (GMT+00:00)' },
    { value: 'Europe/Dublin', label: 'Dublin (GMT+00:00)' },
    { value: 'Africa/Lagos', label: 'Lagos (GMT+01:00)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+01:00)' },
    { value: 'Europe/Berlin', label: 'Berlin (GMT+01:00)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+01:00)' },
    { value: 'Europe/Rome', label: 'Rome (GMT+01:00)' },
    { value: 'Europe/Athens', label: 'Athens (GMT+02:00)' },
    { value: 'Africa/Cairo', label: 'Cairo (GMT+02:00)' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (GMT+02:00)' },
    { value: 'Europe/Helsinki', label: 'Helsinki (GMT+02:00)' },
    { value: 'Europe/Istanbul', label: 'Istanbul (GMT+03:00)' },
    { value: 'Asia/Riyadh', label: 'Riyadh (GMT+03:00)' },
    { value: 'Europe/Moscow', label: 'Moscow (GMT+03:00)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+04:00)' },
    { value: 'Asia/Karachi', label: 'Karachi (GMT+05:00)' },
    { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi (GMT+05:30)' },
    { value: 'Asia/Dhaka', label: 'Dhaka (GMT+06:00)' },
    { value: 'Asia/Bangkok', label: 'Bangkok (GMT+07:00)' },
    { value: 'Asia/Singapore', label: 'Singapore (GMT+08:00)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+08:00)' },
    { value: 'Asia/Shanghai', label: 'Beijing (GMT+08:00)' },
    { value: 'Australia/Perth', label: 'Perth (GMT+08:00)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+09:00)' },
    { value: 'Asia/Seoul', label: 'Seoul (GMT+09:00)' },
    { value: 'Australia/Adelaide', label: 'Adelaide (GMT+09:30)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+10:00)' },
    { value: 'Australia/Brisbane', label: 'Brisbane (GMT+10:00)' },
    { value: 'Pacific/Guam', label: 'Guam (GMT+10:00)' },
    { value: 'Pacific/Auckland', label: 'Auckland (GMT+12:00)' },
    { value: 'Pacific/Fiji', label: 'Fiji (GMT+12:00)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-dark mb-4">General Settings</h3>
        <p className="text-sm text-text-secondary font-medium">Manage your site's basic information and branding</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Site Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="My Awesome Site"
          />
          <p className="text-xs text-text-secondary mt-1">This is your site's display name</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Site Slug
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="my-site"
            />
            <span className="ml-2 text-sm text-gray-500">.creatorapp.site</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">URL-safe identifier for your site</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Primary Brand Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={formData.primary_color}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.primary_color}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              className="flex-1 px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder="#3B82F6"
            />
            <Palette className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-xs text-text-secondary mt-1">Used for buttons, links, and accents</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Favicon
          </label>
          <div className="flex items-center gap-4">
            {formData.favicon_url ? (
              <div className="relative">
                <img
                  src={formData.favicon_url}
                  alt="Favicon"
                  className="w-12 h-12 rounded border border-border object-contain bg-white"
                />
                <button
                  onClick={handleRemoveFavicon}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-12 h-12 rounded border-2 border-dashed border-border flex items-center justify-center bg-gray-50">
                <Image className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div>
              <input
                ref={faviconInputRef}
                type="file"
                accept=".png,.ico,.jpg,.jpeg,.svg"
                onChange={handleFaviconUpload}
                className="hidden"
              />
              <button
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingFavicon}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {uploadingFavicon ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Favicon
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-1">32x32 or 64x64 PNG, ICO, or SVG recommended. Max 500KB.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-secondary mt-1">Default timezone for scheduling and reports</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Site Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="A brief description of your site for SEO"
          />
          <p className="text-xs text-text-secondary mt-1">Displayed in search engine results</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Keywords
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => handleChange('keywords', e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="online courses, education, coaching"
          />
          <p className="text-xs text-text-secondary mt-1">Comma-separated keywords for SEO</p>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
