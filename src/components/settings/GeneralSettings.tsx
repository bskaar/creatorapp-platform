import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Save, Palette, Image, X, ArrowLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AIColorPalette from '../AIColorPalette';

interface GeneralSettingsProps {
  onSave?: () => void;
}

export default function GeneralSettings({ onSave }: GeneralSettingsProps) {
  const { currentSite, refreshSites, brandTheme, updateBrandTheme } = useSite();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showAIPalette, setShowAIPalette] = useState(false);
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    neutral_color: '#1F2937',
    background_color: '#FFFFFF',
    description: '',
    keywords: '',
    timezone: 'America/New_York',
    favicon_url: '',
    logo_url: '',
  });

  useEffect(() => {
    if (currentSite) {
      setFormData({
        name: currentSite.name || '',
        slug: currentSite.slug || '',
        primary_color: brandTheme.primaryColor || '#3B82F6',
        secondary_color: brandTheme.secondaryColor || '#10B981',
        accent_color: brandTheme.accentColor || '#F59E0B',
        neutral_color: brandTheme.neutralColor || '#1F2937',
        background_color: brandTheme.backgroundColor || '#FFFFFF',
        description: (currentSite.settings as any)?.description || '',
        keywords: (currentSite.settings as any)?.keywords || '',
        timezone: (currentSite.settings as any)?.timezone || 'America/New_York',
        favicon_url: (currentSite as any).favicon_url || '',
        logo_url: (currentSite as any).logo_url || '',
      });
    }
  }, [currentSite, brandTheme]);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSite || !user) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, SVG, or WebP file');
      return;
    }

    if (file.size > 2097152) {
      alert('Logo must be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}/${currentSite.id}-logo-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      setSaved(false);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
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

      const newBrandTheme = {
        primaryColor: formData.primary_color,
        secondaryColor: formData.secondary_color,
        accentColor: formData.accent_color,
        neutralColor: formData.neutral_color,
        backgroundColor: formData.background_color,
        textColor: brandTheme.textColor,
        headingFont: brandTheme.headingFont,
        bodyFont: brandTheme.bodyFont,
        borderRadius: brandTheme.borderRadius,
      };

      const { error } = await supabase
        .from('sites')
        .update({
          name: formData.name,
          slug: formData.slug,
          primary_color: formData.primary_color,
          brand_theme: newBrandTheme,
          favicon_url: formData.favicon_url || null,
          logo_url: formData.logo_url || null,
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

        <div className="border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-text-primary">Brand Colors</h4>
              <p className="text-xs text-text-secondary">These colors apply to all site pages</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAIPalette(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition"
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: formData.primary_color }}
                title="Primary"
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: formData.secondary_color }}
                title="Secondary"
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: formData.accent_color }}
                title="Accent"
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: formData.neutral_color }}
                title="Neutral"
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: formData.background_color }}
                title="Background"
              />
            </div>
            <span className="text-sm text-text-secondary">Current palette</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="h-10 w-14 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                placeholder="#3B82F6"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">Used for buttons, links, and CTAs</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedColors(!showAdvancedColors)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAdvancedColors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAdvancedColors ? 'Hide' : 'Show'} additional colors
          </button>

          {showAdvancedColors && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Secondary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="flex-1 px-2 py-1 border border-border rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="flex-1 px-2 py-1 border border-border rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Neutral</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.neutral_color}
                    onChange={(e) => handleChange('neutral_color', e.target.value)}
                    className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.neutral_color}
                    onChange={(e) => handleChange('neutral_color', e.target.value)}
                    className="flex-1 px-2 py-1 border border-border rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.background_color}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    className="flex-1 px-2 py-1 border border-border rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {showAIPalette && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Generate Brand Colors with AI</h3>
                <button
                  onClick={() => setShowAIPalette(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                <AIColorPalette
                  onApplyTheme={(palette) => {
                    setFormData(prev => ({
                      ...prev,
                      primary_color: palette.primary,
                      secondary_color: palette.secondary,
                      accent_color: palette.accent,
                      neutral_color: palette.neutral,
                      background_color: palette.background,
                    }));
                    setShowAIPalette(false);
                    setSaved(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Site Logo
          </label>
          <div className="flex items-center gap-4">
            {formData.logo_url ? (
              <div className="relative">
                <img
                  src={formData.logo_url}
                  alt="Site Logo"
                  className="h-16 max-w-[200px] rounded border border-border object-contain bg-white p-2"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="h-16 w-32 rounded border-2 border-dashed border-border flex items-center justify-center bg-gray-50">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <input
                ref={logoInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {uploadingLogo ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </>
                )}
              </button>
              <p className="text-xs text-text-secondary mt-2">Displayed in your site header. PNG, SVG, or WebP recommended. Max 2MB.</p>
            </div>
          </div>
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

        <div className="pt-4 border-t border-border flex items-center gap-4">
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
          {saved && (
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
