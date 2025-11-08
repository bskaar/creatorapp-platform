import { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface EmailConfig {
  from_name: string;
  from_email: string;
  reply_to_email: string;
  provider: 'resend' | 'sendgrid' | 'smtp';
  api_key: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  double_optin: boolean;
  footer_text: string;
  signature: string;
}

export default function EmailSettings() {
  const { currentSite, refreshSites } = useSite();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<EmailConfig>({
    from_name: '',
    from_email: '',
    reply_to_email: '',
    provider: 'resend',
    api_key: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    double_optin: false,
    footer_text: '',
    signature: '',
  });

  useEffect(() => {
    if (currentSite) {
      const emailConfig = (currentSite.settings as any)?.email_config || {};
      setFormData({
        from_name: emailConfig.from_name || '',
        from_email: emailConfig.from_email || '',
        reply_to_email: emailConfig.reply_to_email || '',
        provider: emailConfig.provider || 'resend',
        api_key: emailConfig.api_key || '',
        smtp_host: emailConfig.smtp_host || '',
        smtp_port: emailConfig.smtp_port || 587,
        smtp_username: emailConfig.smtp_username || '',
        smtp_password: emailConfig.smtp_password || '',
        double_optin: emailConfig.double_optin || false,
        footer_text: emailConfig.footer_text || '',
        signature: emailConfig.signature || '',
      });
      setShowAdvanced(emailConfig.provider === 'smtp');
    }
  }, [currentSite]);

  const handleChange = (field: keyof EmailConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!currentSite) return;

    setLoading(true);
    try {
      const settings = {
        ...(currentSite.settings as any || {}),
        email_config: formData,
      };

      const { error } = await supabase
        .from('sites')
        .update({
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSite.id);

      if (error) throw error;

      await refreshSites();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving email settings:', error);
      alert('Failed to save email settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
        <p className="text-sm text-gray-600">Configure how emails are sent from your site</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-900 mb-1">Email Provider Required</h4>
          <p className="text-sm text-yellow-700">
            You need an account with Resend, SendGrid, or your own SMTP server to send emails.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Name
            </label>
            <input
              type="text"
              value={formData.from_name}
              onChange={(e) => handleChange('from_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Email
            </label>
            <input
              type="email"
              value={formData.from_email}
              onChange={(e) => handleChange('from_email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hello@yourdomain.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reply-To Email
          </label>
          <input
            type="email"
            value={formData.reply_to_email}
            onChange={(e) => handleChange('reply_to_email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="support@yourdomain.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Service Provider
          </label>
          <select
            value={formData.provider}
            onChange={(e) => {
              handleChange('provider', e.target.value);
              setShowAdvanced(e.target.value === 'smtp');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="resend">Resend (Recommended)</option>
            <option value="sendgrid">SendGrid</option>
            <option value="smtp">Custom SMTP</option>
          </select>
        </div>

        {formData.provider !== 'smtp' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) => handleChange('api_key', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="re_xxxxxxxxxxxxx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              {formData.provider === 'resend' && (
                <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Resend Dashboard
                </a>
              )}
              {formData.provider === 'sendgrid' && (
                <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  SendGrid Dashboard
                </a>
              )}
            </p>
          </div>
        )}

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">SMTP Settings</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.smtp_port}
                  onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="587"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Username
              </label>
              <input
                type="text"
                value={formData.smtp_username}
                onChange={(e) => handleChange('smtp_username', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Password
              </label>
              <input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => handleChange('smtp_password', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="double-optin"
            checked={formData.double_optin}
            onChange={(e) => handleChange('double_optin', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="double-optin" className="text-sm text-gray-700">
            Require double opt-in for new subscribers
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Footer
          </label>
          <textarea
            value={formData.footer_text}
            onChange={(e) => handleChange('footer_text', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Company Name | Address | Unsubscribe"
          />
          <p className="text-xs text-gray-500 mt-1">Appears at the bottom of all emails</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Signature
          </label>
          <textarea
            value={formData.signature}
            onChange={(e) => handleChange('signature', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Best regards,&#10;Your Name&#10;Company Name"
          />
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
