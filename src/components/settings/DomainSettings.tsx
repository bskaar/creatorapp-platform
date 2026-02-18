import { useState, useEffect } from 'react';
import { Globe, Check, X, AlertCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

export default function DomainSettings() {
  const { currentSite, refreshSites } = useSite();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [domainStatus, setDomainStatus] = useState<'not_verified' | 'pending' | 'verified' | 'failed'>('not_verified');
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentSite) {
      setCustomDomain(currentSite.custom_domain || '');
      setDomainStatus(currentSite.domain_verification_status || 'not_verified');
      setVerificationToken(currentSite.domain_verification_token || '');
      setShowInstructions(!!currentSite.custom_domain && currentSite.domain_verification_status !== 'verified');
    }
  }, [currentSite]);

  const generateVerificationToken = async () => {
    if (!currentSite) return;

    try {
      const { data, error } = await supabase
        .rpc('generate_domain_verification_token');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating token:', error);
      return null;
    }
  };

  const handleSaveDomain = async () => {
    if (!currentSite || !customDomain) return;

    setLoading(true);
    try {
      const domain = customDomain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

      const token = await generateVerificationToken();
      if (!token) throw new Error('Failed to generate verification token');

      const { error } = await supabase
        .from('sites')
        .update({
          custom_domain: domain,
          domain_verification_token: token,
          domain_verification_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSite.id);

      if (error) throw error;

      await refreshSites();
      setVerificationToken(token);
      setDomainStatus('pending');
      setShowInstructions(true);
    } catch (error) {
      console.error('Error saving domain:', error);
      alert('Failed to save domain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!currentSite) return;

    setVerifying(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-domain`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            site_id: currentSite.id,
            domain: customDomain,
          }),
        }
      );

      const result = await response.json();

      if (result.verified) {
        setDomainStatus('verified');
        await refreshSites();
        alert('Domain verified successfully!');
      } else {
        setDomainStatus('failed');
        alert(result.message || 'Domain verification failed. Please check your DNS records and try again.');
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      alert('Failed to verify domain. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!currentSite) return;
    if (!confirm('Are you sure you want to remove this custom domain?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          custom_domain: null,
          domain_verification_token: null,
          domain_verification_status: 'not_verified',
          domain_verified_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSite.id);

      if (error) throw error;

      await refreshSites();
      setCustomDomain('');
      setDomainStatus('not_verified');
      setShowInstructions(false);
    } catch (error) {
      console.error('Error removing domain:', error);
      alert('Failed to remove domain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (domainStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <Check className="h-3.5 w-3.5" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            Pending Verification
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <X className="h-3.5 w-3.5" />
            Verification Failed
          </span>
        );
      default:
        return null;
    }
  };

  const defaultDomain = currentSite?.slug ? `${currentSite.slug}.creatorapp.site` : '';
  const previewUrl = currentSite?.slug ? `/s/${currentSite.slug}` : '';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-dark mb-4">Domain Settings</h3>
        <p className="text-sm text-text-secondary font-medium">Configure your site's URL and custom domain</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-light">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-dark mb-2">Default Site URL</h4>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold transition-colors"
                >
                  {defaultDomain}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-sm text-text-secondary mt-2 font-medium">
                This is your default CreatorApp subdomain. It's always active and can't be changed.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-dark">Custom Domain</h4>
            {currentSite?.custom_domain && getStatusBadge()}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Domain Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  disabled={domainStatus === 'verified'}
                  className="flex-1 px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="www.yourdomain.com or yourdomain.com"
                />
                {domainStatus === 'verified' ? (
                  <button
                    onClick={handleRemoveDomain}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-red-300 text-red-700 font-semibold rounded-button hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleSaveDomain}
                    disabled={loading || !customDomain || customDomain === currentSite?.custom_domain}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? 'Saving...' : 'Save Domain'}
                  </button>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-2 font-medium">
                Enter your custom domain (e.g., www.mysite.com or mysite.com)
              </p>
            </div>

            {showInstructions && domainStatus !== 'verified' && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                <h5 className="font-bold text-dark mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  DNS Configuration Required
                </h5>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-text-primary font-semibold mb-3">
                      Add these DNS records to your domain provider:
                    </p>

                    {!customDomain.startsWith('www.') && (
                      <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 mb-3">
                        <p className="text-sm font-semibold text-orange-800 mb-1">⚠️ Root Domain Detected</p>
                        <p className="text-xs text-orange-700">
                          Most DNS providers (including GoDaddy) don't allow CNAME records for root domains.
                          <strong> We recommend using "www.{customDomain}"</strong> instead. If you want to use the root domain,
                          set up forwarding from {customDomain} → www.{customDomain} in your DNS provider.
                        </p>
                      </div>
                    )}

                    <div className="bg-white rounded-lg border border-yellow-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-yellow-100 border-b border-yellow-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold text-dark">Type</th>
                            <th className="px-4 py-3 text-left font-bold text-dark">Name</th>
                            <th className="px-4 py-3 text-left font-bold text-dark">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-yellow-100">
                          <tr>
                            <td className="px-4 py-3 font-mono font-semibold">CNAME</td>
                            <td className="px-4 py-3 font-mono font-semibold">
                              {customDomain.startsWith('www.') ? 'www' : '@'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-1.5 bg-gray-50 rounded font-mono text-xs font-semibold">
                                  {defaultDomain}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(defaultDomain)}
                                  className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono font-semibold">TXT</td>
                            <td className="px-4 py-3 font-mono font-semibold">_creatorapp-verification</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-1.5 bg-gray-50 rounded font-mono text-xs font-semibold break-all">
                                  {verificationToken}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(verificationToken)}
                                  className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {copied && (
                      <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        Copied to clipboard!
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-dark">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary font-medium">
                      <li>Log in to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.)</li>
                      <li>Navigate to your DNS settings or DNS management page</li>
                      {!customDomain.startsWith('www.') && (
                        <li className="text-orange-700 font-semibold">
                          <strong>For root domains:</strong> If your provider doesn't allow CNAME for "@",
                          change your domain to "www.{customDomain}" or use domain forwarding
                        </li>
                      )}
                      {customDomain.startsWith('www.') && (
                        <li>
                          <strong>Delete any existing CNAME</strong> record for "www" that points elsewhere
                        </li>
                      )}
                      <li>Add both DNS records shown above</li>
                      <li>Wait 5-10 minutes for DNS propagation (can take up to 48 hours)</li>
                      <li>Click "Verify Domain" below to check if your domain is configured correctly</li>
                    </ol>
                  </div>

                  <div className="pt-4 border-t border-yellow-200">
                    <button
                      onClick={handleVerifyDomain}
                      disabled={verifying}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {verifying ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Verify Domain
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {domainStatus === 'verified' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-light">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-dark mb-2">Domain Verified</h5>
                    <p className="text-sm text-text-secondary font-medium mb-3">
                      Your custom domain is successfully configured and verified. Your site is now accessible at:
                    </p>
                    <a
                      href={`https://${customDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold transition-colors"
                    >
                      {customDomain}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h5 className="font-bold text-dark mb-3">Need Help?</h5>
          <div className="space-y-3 text-sm text-text-secondary font-medium">
            <div>
              <p className="font-semibold text-dark mb-2">GoDaddy Specific Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Log into GoDaddy and go to your Domain Portfolio</li>
                <li>Click on your domain → <strong>DNS</strong> or <strong>Manage DNS</strong></li>
                <li><strong>Delete the existing CNAME</strong> record where Name="www" and Value="creatorappu.com"</li>
                <li>Click <strong>Add New Record</strong></li>
                <li>Select <strong>CNAME</strong> from the Type dropdown</li>
                <li>Enter <strong>www</strong> in the Name field</li>
                <li>Enter your CreatorApp subdomain (shown above) in the Value field</li>
                <li>Click <strong>Add New Record</strong> again for the TXT record</li>
                <li>Select <strong>TXT</strong> from Type, enter <strong>_creatorapp-verification</strong> as Name</li>
                <li>Paste the verification token (shown above) in the Value field</li>
                <li>Save both records and wait 5-10 minutes</li>
              </ol>
            </div>

            <div className="pt-3 border-t border-gray-300">
              <p className="font-semibold text-dark mb-2">Other domain providers:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Namecheap:</strong> Domain List → Manage → Advanced DNS</li>
                <li><strong>Cloudflare:</strong> Select Domain → DNS</li>
                <li><strong>Google Domains:</strong> My Domains → DNS</li>
              </ul>
            </div>

            <p className="mt-4 pt-3 border-t border-gray-300">
              <strong>Note:</strong> DNS changes can take anywhere from a few minutes to 48 hours to propagate globally.
              Most changes are visible within 10-15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
