import { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle2, ArrowUpRight, Info } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

interface EmailConfig {
  from_name: string;
  from_email: string;
  reply_to_email: string;
  provider: 'shared' | 'resend' | 'sendgrid' | 'smtp';
  api_key: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  double_optin: boolean;
  footer_text: string;
  signature: string;
  use_custom_domain: boolean;
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
    provider: 'shared',
    api_key: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    double_optin: false,
    footer_text: '',
    signature: '',
    use_custom_domain: false,
  });

  const getSharedFromEmail = () => {
    if (!currentSite) return 'notifications@mail.creatorapp.us';
    const subdomain = currentSite.subdomain || currentSite.name.toLowerCase().replace(/\s+/g, '-');
    return `${subdomain}@mail.creatorapp.us`;
  };

  useEffect(() => {
    if (currentSite) {
      const emailConfig = (currentSite.settings as any)?.email_config || {};
      const hasCustomProvider = emailConfig.provider && emailConfig.provider !== 'shared' && emailConfig.api_key;

      setFormData({
        from_name: emailConfig.from_name || currentSite.name || '',
        from_email: emailConfig.from_email || '',
        reply_to_email: emailConfig.reply_to_email || '',
        provider: emailConfig.provider || 'shared',
        api_key: emailConfig.api_key || '',
        smtp_host: emailConfig.smtp_host || '',
        smtp_port: emailConfig.smtp_port || 587,
        smtp_username: emailConfig.smtp_username || '',
        smtp_password: emailConfig.smtp_password || '',
        double_optin: emailConfig.double_optin || false,
        footer_text: emailConfig.footer_text || '',
        signature: emailConfig.signature || '',
        use_custom_domain: hasCustomProvider,
      });
      setShowAdvanced(emailConfig.provider === 'smtp');
    }
  }, [currentSite]);

  const handleChange = (field: keyof EmailConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleToggleCustomDomain = (useCustom: boolean) => {
    setFormData(prev => ({
      ...prev,
      use_custom_domain: useCustom,
      provider: useCustom ? 'resend' : 'shared',
    }));
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
        <h3 className="text-xl font-bold text-dark mb-4">Email Configuration</h3>
        <p className="text-sm text-text-secondary font-medium">Configure how emails are sent from your site</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-emerald-900 mb-1">Email is ready to use</h4>
            <p className="text-sm text-emerald-700">
              Your emails will be sent from our shared domain: <span className="font-mono font-medium">{getSharedFromEmail()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Sending Domain</h4>
              <p className="text-sm text-gray-500">Choose how your emails are sent</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => handleToggleCustomDomain(false)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              !formData.use_custom_domain
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Shared Domain</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Send from <span className="font-mono">{getSharedFromEmail()}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Works immediately, no setup required. Great for getting started.
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                !formData.use_custom_domain ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {!formData.use_custom_domain && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </button>

          <button
            onClick={() => handleToggleCustomDomain(true)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              formData.use_custom_domain
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Custom Domain</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Send from your own domain (e.g., hello@yourdomain.com)
                </p>
                <p className="text-xs text-gray-500">
                  Better deliverability and brand consistency. Requires DNS setup.
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                formData.use_custom_domain ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {formData.use_custom_domain && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {formData.use_custom_domain && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Setup Required</h4>
              <p className="text-sm text-blue-700 mb-2">
                To send from your own domain, you will need to configure DNS records and connect an email provider like Resend.
              </p>
              <a
                href="https://resend.com/domains"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View DNS Setup Guide
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">
              From Name
            </label>
            <input
              type="text"
              value={formData.from_name}
              onChange={(e) => handleChange('from_name', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">
              Reply-To Email
            </label>
            <input
              type="email"
              value={formData.reply_to_email}
              onChange={(e) => handleChange('reply_to_email', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="support@yourdomain.com"
            />
            <p className="text-xs text-gray-500 mt-1">Where replies will go</p>
          </div>
        </div>

        {formData.use_custom_domain && (
          <>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">
                From Email
              </label>
              <input
                type="email"
                value={formData.from_email}
                onChange={(e) => handleChange('from_email', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="hello@yourdomain.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1">
                Email Service Provider
              </label>
              <select
                value={formData.provider}
                onChange={(e) => {
                  handleChange('provider', e.target.value);
                  setShowAdvanced(e.target.value === 'smtp');
                }}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="resend">Resend (Recommended)</option>
                <option value="sendgrid">SendGrid</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>

            {formData.provider !== 'smtp' && formData.provider !== 'shared' && (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => handleChange('api_key', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  placeholder="re_xxxxxxxxxxxxx"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Get your API key from{' '}
                  {formData.provider === 'resend' && (
                    <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Resend Dashboard
                    </a>
                  )}
                  {formData.provider === 'sendgrid' && (
                    <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
                    <label className="block text-sm font-semibold text-text-primary mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={formData.smtp_host}
                      onChange={(e) => handleChange('smtp_host', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={formData.smtp_port}
                      onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={formData.smtp_username}
                    onChange={(e) => handleChange('smtp_username', e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    value={formData.smtp_password}
                    onChange={(e) => handleChange('smtp_password', e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="double-optin"
            checked={formData.double_optin}
            onChange={(e) => handleChange('double_optin', e.target.checked)}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="double-optin" className="text-sm text-gray-700">
            Require double opt-in for new subscribers
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Email Footer
          </label>
          <textarea
            value={formData.footer_text}
            onChange={(e) => handleChange('footer_text', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Company Name | Address | Unsubscribe"
          />
          <p className="text-xs text-text-secondary mt-1">Appears at the bottom of all emails</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Email Signature
          </label>
          <textarea
            value={formData.signature}
            onChange={(e) => handleChange('signature', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Best regards,&#10;Your Name&#10;Company Name"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
