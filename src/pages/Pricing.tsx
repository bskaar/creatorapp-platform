import { useEffect, useState } from 'react';
import { Check, Rocket, TrendingUp, Crown, Building2, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import StructuredData, { faqSchema } from '../components/StructuredData';
import { supabase } from '../lib/supabase';

interface PlanData {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: string;
  stripe_price_id: string | null;
  limits: {
    max_products: number | null;
    max_funnels: number | null;
    max_contacts: number;
    max_emails_per_month: number;
    max_team_members: number;
    features: string[];
    ai_features: string[];
  };
  trial_days: number;
}

const PLAN_ICONS: Record<string, typeof Rocket> = {
  starter: Rocket,
  growth: TrendingUp,
  pro: Crown,
  enterprise: Building2,
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'Up to 3 products',
    'Up to 3 funnels',
    '2,500 contacts',
    '10,000 emails/month',
    'AI site & funnel generation',
    'Stripe integration',
    'Basic analytics',
    'Email support',
  ],
  growth: [
    'Up to 50 products',
    'Up to 10 funnels',
    '10,000 contacts',
    '50,000 emails/month',
    'AI optimization & predictive modeling',
    'Advanced analytics',
    'Workflow automation',
    '3 team members',
    'Priority support',
    'API access',
  ],
  pro: [
    'Unlimited products',
    'Unlimited funnels',
    '50,000 contacts',
    '250,000 emails/month',
    'Full AI suite with LTV prediction',
    'White-label capabilities',
    '10 team members',
    'Dedicated support',
    'Custom integrations',
  ],
  enterprise: [
    'Everything in Pro',
    'Unlimited contacts & emails',
    'Unlimited team members',
    'Custom AI solutions',
    'Dedicated success manager',
    'SLA support',
    'Custom onboarding & training',
    'Enterprise SSO',
  ],
};

export default function Pricing() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    document.title = 'Pricing - CreatorApp | Plans for Every Stage';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Choose the perfect CreatorApp plan for your creator business. Start with a 14-day free trial. Plans from $49/month.');
    }

    loadPlans();
  }, []);

  async function loadPlans() {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (data) {
      setPlans(data);
    }
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/pricing');
  };

  const handleSubscribe = async (plan: PlanData) => {
    if (plan.name === 'enterprise') {
      window.location.href = 'mailto:sales@creatorapp.us?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    if (!plan.stripe_price_id) {
      setCheckoutError('This plan is not available for purchase yet.');
      return;
    }

    setLoadingPlanId(plan.id);
    setCheckoutError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate('/signup?plan=' + plan.name);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            priceId: plan.stripe_price_id,
            successUrl: `${window.location.origin}/dashboard?subscription=success`,
            cancelUrl: `${window.location.origin}/pricing`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setCheckoutError(message);
      setLoadingPlanId(null);
    }
  };

  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: plans.map((plan, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: plan.display_name,
        description: plan.description,
        offers: {
          '@type': 'Offer',
          price: plan.price_monthly,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <StructuredData data={pricingSchema} id="pricing-schema" />
      <StructuredData data={faqSchema} id="faq-schema" />

      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-text-secondary hover:text-text-primary font-semibold transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary font-semibold rounded-xl hover:bg-slate-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-text-primary font-semibold transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Plans for Every Stage
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-8">
            Start with a 14-day free trial. Cancel anytime before your trial ends.
          </p>

          <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {checkoutError && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium max-w-2xl mx-auto text-center">
              {checkoutError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.name] || Rocket;
              const features = PLAN_FEATURES[plan.name] || [];
              const isLoading = loadingPlanId === plan.id;
              const isPopular = plan.name === 'growth';
              const isEnterprise = plan.name === 'enterprise';
              const monthlyPrice = parseFloat(plan.price_monthly);
              const displayPrice = billingCycle === 'yearly'
                ? Math.round(monthlyPrice * 0.8)
                : monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col bg-white rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                    isPopular
                      ? 'border-2 border-blue-500 shadow-xl ring-4 ring-blue-500/10'
                      : 'border border-gray-200 shadow-sm hover:shadow-lg'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-grow">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      isPopular
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        : isEnterprise
                        ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isPopular || isEnterprise ? 'text-white' : 'text-gray-700'
                      }`} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {plan.display_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      {isEnterprise ? (
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold text-gray-900">Custom</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900">
                              ${displayPrice}
                            </span>
                            <span className="text-gray-500 ml-1">/month</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Billed annually (${displayPrice * 12}/year)
                            </p>
                          )}
                          {plan.trial_days > 0 && (
                            <p className="text-sm text-emerald-600 font-medium mt-2">
                              {plan.trial_days}-day free trial
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className={`w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5 ${
                            isPopular ? 'text-blue-500' : 'text-emerald-500'
                          }`} />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlanId !== null}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center group disabled:opacity-60 disabled:cursor-not-allowed ${
                        isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                          : isEnterprise
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isEnterprise ? (
                        'Contact Sales'
                      ) : (
                        <>
                          Start Free Trial
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              All plans include SSL, daily backups, and 99.9% uptime SLA.
              Need help choosing?{' '}
              <Link to="/contact" className="text-blue-600 font-semibold hover:underline">
                Talk to our team
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: 'How does the free trial work?',
                a: 'Start with full access to all features for 14 days. A credit card is required to start, but you won\'t be charged until your trial ends. Cancel anytime before the trial ends to avoid charges.',
              },
              {
                q: 'Can I change plans later?',
                a: 'Yes, upgrade or downgrade anytime. Changes take effect at your next billing cycle. When upgrading, you get immediate access to new features.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit and debit cards through Stripe. Enterprise customers can also pay via invoice.',
              },
              {
                q: 'Is there a contract or commitment?',
                a: 'No long-term contracts. Monthly plans can be cancelled anytime. Yearly plans offer 20% savings and can be cancelled with prorated refunds.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data is retained for 30 days after cancellation, giving you time to export or reactivate. After 30 days, data is permanently deleted.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee on all plans. If you\'re not satisfied, contact support for a full refund.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CreatorApp. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-900">Privacy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-900">Terms</Link>
            <Link to="/contact" className="text-gray-500 hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
