import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

export default function StripeConnectOnboarding() {
  const { currentSite, refreshSites } = useSite();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = currentSite?.stripe_connect_account_id;
  const onboardingComplete = currentSite?.stripe_connect_onboarding_complete;
  const chargesEnabled = currentSite?.stripe_connect_charges_enabled;
  const payoutsEnabled = currentSite?.stripe_connect_payouts_enabled;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_success') === 'true') {
      handleRefreshStatus();
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('stripe_refresh') === 'true') {
      setError('Onboarding incomplete. Please complete all required information.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnectStripe = async () => {
    if (!currentSite) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-oauth?action=create`;
      console.log('Calling:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: currentSite.id,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorMessage = 'Failed to start Stripe Connect';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;

          if (errorMessage.startsWith('STRIPE_ERROR:')) {
            const parts = errorMessage.split(':');
            const code = parts[1] || '';
            const msg = parts.slice(2).join(':');
            if (code.includes('invalid_request_error') || msg.includes('signed up for Connect') || msg.includes('Connect')) {
              errorMessage = `Stripe Connect error: ${msg}. Please verify Connect is enabled at Stripe Dashboard → Settings → Connect.`;
            } else {
              errorMessage = `Stripe error (${code}): ${msg}`;
            }
          } else if (errorMessage.includes('invalid_request_error') || errorMessage.includes('signed up for Connect')) {
            errorMessage = 'Stripe Connect is not enabled for this API key. Please enable Stripe Connect in your Stripe Dashboard or use a Connect-enabled account.';
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success, redirecting to:', data.onboardingUrl);
      window.location.href = data.onboardingUrl;
    } catch (err: any) {
      console.error('Stripe Connect error:', err);
      setError(err.message || 'Failed to connect to Stripe. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!currentSite) return;

    setRefreshing(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-oauth?action=refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            siteId: currentSite.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to refresh status');
      }

      await refreshSites();
    } catch (err: any) {
      console.error('Refresh error:', err);
      setError(err.message || 'Failed to refresh status');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-dark mb-2">Stripe Connect</h3>
        <p className="text-sm text-text-secondary font-medium">
          Connect your Stripe account to receive payments directly. You keep 100% of your revenue minus Stripe's standard transaction fees.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isConnected ? (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2 text-sm">Platform Requirements</h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>The platform must have a Stripe account with Connect enabled</li>
              <li>The STRIPE_SECRET_KEY must be from a Connect-enabled account</li>
              <li>Enable Connect at: <a href="https://dashboard.stripe.com/settings/connect" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → Settings → Connect</a></li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-2">Connect Your Stripe Account</h4>
            <p className="text-sm text-blue-700 mb-4">
              You'll be redirected to Stripe to securely connect your account. This allows you to receive payments directly from customers.
            </p>
            <button
              onClick={handleConnectStripe}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Connect with Stripe
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Connection Status</h4>
              <button
                onClick={handleRefreshStatus}
                disabled={refreshing}
                className="text-sm text-primary hover:text-blue-700 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {onboardingComplete ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">
                  Account Onboarding {onboardingComplete ? 'Complete' : 'Incomplete'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {chargesEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">
                  Charges {chargesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {payoutsEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">
                  Payouts {payoutsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {!onboardingComplete && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-text-secondary font-medium mb-3">
                  Complete your Stripe onboarding to start accepting payments.
                </p>
                <button
                  onClick={handleConnectStripe}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Complete Onboarding
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {chargesEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Ready to Accept Payments</h4>
                  <p className="text-sm text-green-700">
                    Your Stripe account is fully configured. You can now sell products and receive payments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
