import { useState, useEffect } from 'react';
import { Globe, Check, X, AlertCircle, ExternalLink, Copy, RefreshCw, Server } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

export default function DomainSettings() {
  const { currentSite, refreshSites } = useSite();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [addingToVercel, setAddingToVercel] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [domainStatus, setDomainStatus] = useState<'not_verified' | 'pending' | 'verified' | 'failed'>('not_verified');
  const [vercelStatus, setVercelStatus] = useState<{ added: boolean; verified: boolean }>({ added: false, verified: false });
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentSite) {
      setCustomDomain(currentSite.custom_domain || '');
      setDomainStatus(currentSite.domain_verification_status || 'not_verified');
      setVerificationToken(currentSite.domain_verification_token || '');
      setShowInstructions(!!currentSite.custom_domain && currentSite.domain_verification_status !== 'verified');
      setVercelStatus({
        added: currentSite.vercel_domain_added || false,
        verified: currentSite.vercel_domain_verified || false,
      });
    }
  }, [currentSite]);

  const generateVerificationToken = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    return `crtr_verify_${hex}`;
  };

  const handleSaveDomain = async () => {
    if (!currentSite || !customDomain) return;

    setLoading(true);
    try {
      const domain = customDomain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

      const token = generateVerificationToken();

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

        await addDomainsToVercel();

        await refreshSites();
        alert('Domain verified and added to hosting successfully!');
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

  const addDomainsToVercel = async () => {
    if (!currentSite || !customDomain) return;

    try {
      const isRootDomain = !customDomain.startsWith('www.');
      const rootDomain = customDomain.replace(/^www\./, '');
      const wwwDomain = `www.${rootDomain}`;

      const addDomain = async (domain: string) => {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-vercel-domain`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'add',
              domain: domain,
              site_id: currentSite.id,
            }),
          }
        );
        return response.json();
      };

      if (isRootDomain) {
        await Promise.all([
          addDomain(rootDomain),
          addDomain(wwwDomain),
        ]);
      } else {
        await addDomain(wwwDomain);
      }

      setVercelStatus({ added: true, verified: false });
    } catch (error) {
      console.error('Error adding domains to Vercel:', error);
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

  const handleAddToVercel = async () => {
    if (!currentSite || !customDomain) return;

    setAddingToVercel(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-vercel-domain`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'add',
            domain: customDomain,
            site_id: currentSite.id,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setVercelStatus({ added: true, verified: result.verified || false });
        await refreshSites();
        alert('Domain added to hosting successfully! It may take a few minutes for SSL to be provisioned.');
      } else {
        alert(result.message || 'Failed to add domain to hosting. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to Vercel:', error);
      alert('Failed to add domain to hosting. Please try again.');
    } finally {
      setAddingToVercel(false);
    }
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
                  placeholder="www.yourdomain.com (recommended)"
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
                We recommend using www.yourdomain.com format for best compatibility with all domain registrars.
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
                          {!customDomain.startsWith('www.') ? (
                            <>
                              <tr>
                                <td className="px-4 py-3 font-mono font-semibold text-blue-600">A</td>
                                <td className="px-4 py-3 font-mono font-semibold">@</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-1.5 bg-gray-50 rounded font-mono text-xs font-semibold">
                                      76.76.21.21
                                    </code>
                                    <button
                                      onClick={() => copyToClipboard('76.76.21.21')}
                                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                      title="Copy to clipboard"
                                    >
                                      <Copy className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 font-mono font-semibold text-green-600">CNAME</td>
                                <td className="px-4 py-3 font-mono font-semibold">www</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-1.5 bg-gray-50 rounded font-mono text-xs font-semibold">
                                      cname.vercel-dns.com
                                    </code>
                                    <button
                                      onClick={() => copyToClipboard('cname.vercel-dns.com')}
                                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                      title="Copy to clipboard"
                                    >
                                      <Copy className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <td className="px-4 py-3 font-mono font-semibold text-green-600">CNAME</td>
                              <td className="px-4 py-3 font-mono font-semibold">www</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 px-3 py-1.5 bg-gray-50 rounded font-mono text-xs font-semibold">
                                    cname.vercel-dns.com
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard('cname.vercel-dns.com')}
                                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                  >
                                    <Copy className="h-4 w-4 text-gray-600" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="px-4 py-3 font-mono font-semibold text-purple-600">TXT</td>
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

                    {!customDomain.startsWith('www.') && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <p className="text-sm font-semibold text-red-800 mb-1">Root Domain May Have Limitations</p>
                        <p className="text-xs text-red-700 mb-2">
                          Many domain registrars (like GoDaddy) have locked A records that cannot be deleted, which may prevent
                          root domain ({customDomain}) from working correctly with our hosting.
                        </p>
                        <p className="text-xs text-red-700 font-semibold">
                          Recommended: Use www.{customDomain} instead, then set up domain forwarding from {customDomain} to www.{customDomain} in your registrar.
                        </p>
                      </div>
                    )}

                    {customDomain.startsWith('www.') && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm font-semibold text-green-800 mb-1">Good Choice!</p>
                        <p className="text-xs text-green-700">
                          Using www subdomain works reliably with all domain registrars. After setup, configure your registrar
                          to redirect {customDomain.replace('www.', '')} to {customDomain} so both addresses work.
                        </p>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                      <p className="text-sm font-semibold text-amber-800 mb-1">Important: Check Vercel Dashboard</p>
                      <p className="text-xs text-amber-700">
                        Vercel may show different IP addresses in their dashboard. If you see "Invalid Configuration",
                        click "Learn more" in Vercel to see the exact DNS values they require and use those instead.
                      </p>
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
                      {customDomain.startsWith('www.') ? (
                        <>
                          <li>Add a <strong>CNAME record</strong> for "www" pointing to cname.vercel-dns.com</li>
                          <li>Add the <strong>TXT record</strong> for verification as shown above</li>
                          <li><strong>Optional but recommended:</strong> Set up domain forwarding from {customDomain.replace('www.', '')} to {customDomain} in your registrar's forwarding settings</li>
                        </>
                      ) : (
                        <>
                          <li>Delete any existing A, AAAA, or CNAME records for "@" and "www" that point elsewhere (if possible)</li>
                          <li>Add all DNS records shown above</li>
                          <li>If you cannot delete existing A records, consider using www.{customDomain} instead</li>
                        </>
                      )}
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
                      Your custom domain DNS is successfully configured and verified. Your site is now accessible at:
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

                    <div className="mt-4 pt-4 border-t border-green-200">
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-semibold text-dark">Hosting Status:</span>
                        {vercelStatus.added ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <Check className="h-3.5 w-3.5" />
                            {vercelStatus.verified ? 'Active' : 'Provisioning SSL...'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Pending Setup
                          </span>
                        )}
                      </div>

                      {!vercelStatus.added && (
                        <div className="mt-3">
                          <p className="text-sm text-text-secondary mb-2">
                            Your domain needs to be added to hosting for it to work. Click below to complete setup:
                          </p>
                          <button
                            onClick={handleAddToVercel}
                            disabled={addingToVercel}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                          >
                            {addingToVercel ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Adding to Hosting...
                              </>
                            ) : (
                              <>
                                <Server className="h-4 w-4" />
                                Add to Hosting
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
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
                <li>Click on your domain, then <strong>DNS</strong> or <strong>Manage DNS</strong></li>
                <li><strong>Delete any existing A, AAAA, or CNAME records</strong> for @ and www</li>
                <li>Click <strong>Add New Record</strong></li>
                <li>For root domains: Select <strong>A</strong>, Name: <strong>@</strong>, Value: <strong>76.76.21.21</strong></li>
                <li>Add another record: <strong>CNAME</strong>, Name: <strong>www</strong>, Value: <strong>cname.vercel-dns.com</strong></li>
                <li>Add the TXT record: Name: <strong>_creatorapp-verification</strong>, Value: (your token)</li>
                <li>Save all records and wait 5-10 minutes</li>
              </ol>
            </div>

            <div className="pt-3 border-t border-gray-300">
              <p className="font-semibold text-dark mb-2">Quick Reference - DNS Values:</p>
              <div className="bg-white rounded-lg p-3 border border-gray-200 font-mono text-xs space-y-1">
                <p><strong>A Record (root):</strong> 76.76.21.21</p>
                <p><strong>CNAME (www):</strong> cname.vercel-dns.com</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-300">
              <p className="font-semibold text-dark mb-2">Other domain providers:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Namecheap:</strong> Domain List, Manage, Advanced DNS</li>
                <li><strong>Cloudflare:</strong> Select Domain, DNS</li>
                <li><strong>Google Domains:</strong> My Domains, DNS</li>
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
