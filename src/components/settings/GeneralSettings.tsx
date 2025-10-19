import { useState, useEffect } from 'react';
import { Upload, Save, Palette } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface GeneralSettingsProps {
  onSave?: () => void;
}

export default function GeneralSettings({ onSave }: GeneralSettingsProps) {
  const { currentSite, refreshSite } = useSite();
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

      await refreshSite();
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
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
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
            <span className="ml-2 text-sm text-gray-500">.creatorapp.com</span>
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
              <option key={tz} value={tz}>
                {tz.replace(/_/g, ' ')}
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
