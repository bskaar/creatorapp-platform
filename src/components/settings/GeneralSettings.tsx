import { useState, useEffect } from 'react';
import { Upload, Save, Palette } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface GeneralSettingsProps {
  onSave?: () => void;
}

export default function GeneralSettings({ onSave }: GeneralSettingsProps) {
  const { currentSite, refreshSites } = useSite();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#3B82F6',
    description: '',
    keywords: '',
    timezone: 'America/New_York',
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
      });
    }
  }, [currentSite]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <p className="text-sm text-gray-600">Manage your site's basic information and branding</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Awesome Site"
          />
          <p className="text-xs text-gray-500 mt-1">This is your site's display name</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Slug
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="my-site"
            />
            <span className="ml-2 text-sm text-gray-500">.creatorapp.us</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">URL-safe identifier for your site</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="#3B82F6"
            />
            <Palette className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and accents</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Default timezone for scheduling and reports</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="A brief description of your site for SEO"
          />
          <p className="text-xs text-gray-500 mt-1">Displayed in search engine results</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keywords
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => handleChange('keywords', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="online courses, education, coaching"
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated keywords for SEO</p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
