import { useState, useEffect } from 'react';
import { useSite } from '../../contexts/SiteContext';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';
import { Check, Zap, AlertCircle, Loader2, CreditCard } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  limits: any;
  sort_order: number;
}

export default function SubscriptionSettings() {
  const { currentSite, refreshSites } = useSite();
  const { subscribeToPlan, upgradePlan, downgradePlan, cancelSubscription, loading: actionLoading } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName: string) => {
    try {
      await subscribeToPlan(planName);
      await refreshSites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    }
  };

  const handleUpgrade = async (planName: string) => {
    try {
      await upgradePlan(planName);
      await refreshSites();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade');
    }
  };

  const handleDowngrade = async (planName: string) => {
    try {
      await downgradePlan(planName);
      await refreshSites();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to downgrade');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
      await refreshSites();
      setShowCancelConfirm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    }
  };

  const currentPlanName = currentSite?.platform_subscription_plan_id
    ? plans.find((p) => p.id === currentSite.platform_subscription_plan_id)?.name
    : 'starter';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription & Billing</h2>
        <p className="text-gray-600">Manage your CreatorApp subscription and billing details</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {currentSite && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Current Plan</h3>
              <p className="text-gray-600 text-sm">
                {plans.find((p) => p.name === currentPlanName)?.display_name || 'Starter'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${plans.find((p) => p.name === currentPlanName)?.price_monthly || 0}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </p>
              {currentSite.platform_subscription_status && (
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    currentSite.platform_subscription_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {currentSite.platform_subscription_status}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlanName;
          const canUpgrade = plan.sort_order > (plans.find((p) => p.name === currentPlanName)?.sort_order || 0);
          const canDowngrade = plan.sort_order < (plans.find((p) => p.name === currentPlanName)?.sort_order || 0);

          return (
            <div
              key={plan.id}
              className={`border rounded-xl p-6 ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-gray-200 bg-white hover:border-blue-300 transition'
              }`}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.display_name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price_monthly}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-gray-600 ml-2">/mo</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    {plan.limits.max_products
                      ? `${plan.limits.max_products} products`
                      : 'Unlimited products'}
                  </span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    {plan.limits.max_funnels
                      ? `${plan.limits.max_funnels} funnels`
                      : 'Unlimited funnels'}
                  </span>
                </li>
                <li className="flex items-start text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    {plan.limits.max_contacts
                      ? `${plan.limits.max_contacts.toLocaleString()} contacts`
                      : 'Unlimited contacts'}
                  </span>
                </li>
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg cursor-not-allowed opacity-50"
                >
                  Current Plan
                </button>
              ) : canUpgrade ? (
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={actionLoading}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade
                    </>
                  )}
                </button>
              ) : canDowngrade ? (
                <button
                  onClick={() => handleDowngrade(plan.name)}
                  disabled={actionLoading}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Downgrade'}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={actionLoading}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Select Plan'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {currentSite?.platform_stripe_subscription_id && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Subscription</h3>
          <div className="space-y-4">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg font-medium transition"
            >
              Cancel Subscription
            </button>

            {showCancelConfirm && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 font-medium mb-3">
                  Are you sure you want to cancel your subscription?
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  You'll lose access to premium features at the end of your billing period.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
