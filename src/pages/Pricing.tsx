import { useEffect, useState } from 'react';
import { Check, Rocket, TrendingUp, Crown, Building2, ArrowRight, Loader2, Zap, Users, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import StructuredData, { faqSchema } from '../components/StructuredData';
import { supabase } from '../lib/supabase';

interface PlanData {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: string;
  price_yearly: string | null;
  stripe_price_id: string | null;
  stripe_price_id_yearly: string | null;
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
  growth: Zap,
  pro: Crown,
  enterprise: Building2,
};

const PLAN_TAGLINES: Record<string, string> = {
  starter: 'Perfect for getting started',
  growth: 'Scale your business faster',
  pro: 'Maximum power & flexibility',
  enterprise: 'For large organizations',
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'Up to 3 products',
    'Up to 3 funnels',
    '2,500 contacts',
    'AI content & page generation',
    'Stripe integration',
    'Analytics dashboard',
    'Custom domain support',
    'Email support',
  ],
  growth: [
    'Up to 50 products',
    'Up to 10 funnels',
    '10,000 contacts',
    'AI content & page generation',
    'Unlimited workflow automations',
    'Advanced analytics',
    '3 team members',
    'Priority support',
  ],
  pro: [
    'Unlimited products',
    'Unlimited funnels',
    '50,000 contacts',
    'AI content & page generation',
    'Unlimited workflow automations',
    'Advanced analytics',
    '10 team members',
    'Dedicated support',
  ],
  enterprise: [
    'Everything in Pro',
    'Unlimited contacts',
    'Unlimited team members',
    'Dedicated success manager',
    'SLA guarantee',
    'Custom onboarding & training',
  ],
};

const PLAN_COLORS: Record<string, { bg: string; icon: string; border: string; button: string; check: string }> = {
  starter: {
    bg: 'from-teal-500 to-emerald-600',
    icon: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    border: 'border-teal-200 hover:border-teal-400',
    button: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-teal-500/25',
    check: 'text-teal-500',
  },
  growth: {
    bg: 'from-blue-500 to-cyan-500',
    icon: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    border: 'border-blue-500 ring-4 ring-blue-500/10',
    button: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25',
    check: 'text-blue-500',
  },
  pro: {
    bg: 'from-amber-500 to-orange-600',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-600',
    border: 'border-amber-200 hover:border-amber-400',
    button: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/25',
    check: 'text-amber-500',
  },
  enterprise: {
    bg: 'from-slate-700 to-slate-900',
    icon: 'bg-gradient-to-br from-slate-700 to-slate-900',
    border: 'border-slate-300 hover:border-slate-400',
    button: 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:shadow-lg hover:shadow-slate-500/25',
    check: 'text-slate-600',
  },
};

export default function Pricing() {
  const { user } = useAuth();
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

  const handleSubscribe = async (plan: PlanData, yearly: boolean = false) => {
    if (plan.name === 'enterprise') {
      window.location.href = 'mailto:sales@creatorapp.us?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    const priceId = yearly ? plan.stripe_price_id_yearly : plan.stripe_price_id;

    if (!priceId) {
      if (yearly && !plan.stripe_price_id_yearly) {
        setCheckoutError('Annual billing is not yet available for this plan. Please contact support or select monthly billing.');
      } else {
        setCheckoutError('This plan is not available for purchase yet.');
      }
      return;
    }

    setLoadingPlanId(plan.id);
    setCheckoutError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate('/signup?plan=' + plan.name + (yearly ? '&billing=yearly' : ''));
        return;
      }

      const { data: sites } = await supabase
        .from('sites')
        .select('id')
        .eq('owner_id', session.user.id)
        .limit(1);

      if (!sites || sites.length === 0) {
        navigate('/signup?plan=' + plan.name + (yearly ? '&billing=yearly' : ''));
        return;
      }

      const siteId = sites[0].id;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-platform-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'create',
            planName: plan.name,
            siteId,
            billingCycle: yearly ? 'yearly' : 'monthly',
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

      <PublicHeader />

      <section className="pt-28 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-200">
            <Zap className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Choose Your <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Growth Plan</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium mb-10 max-w-2xl mx-auto">
            Start with a 14-day free trial. No commitment. Cancel anytime.
          </p>

          <div className="inline-flex items-center bg-white p-1.5 rounded-2xl shadow-lg border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 text-base font-semibold rounded-xl transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 text-base font-semibold rounded-xl transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                billingCycle === 'yearly'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                Save 15%+
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="pb-28 px-6">
        <div className="max-w-7xl mx-auto">
          {checkoutError && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium max-w-2xl mx-auto text-center">
              {checkoutError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.name] || Rocket;
              const features = PLAN_FEATURES[plan.name] || [];
              const tagline = PLAN_TAGLINES[plan.name] || '';
              const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.starter;
              const isLoading = loadingPlanId === plan.id;
              const isPopular = plan.name === 'growth';
              const isEnterprise = plan.name === 'enterprise';
              const monthlyPrice = parseFloat(plan.price_monthly);
              const yearlyTotal = plan.price_yearly ? parseFloat(plan.price_yearly) : monthlyPrice * 12;
              const yearlyMonthlyEquivalent = Math.round((yearlyTotal / 12) * 100) / 100;
              const annualSavingsPercent = Math.round((1 - yearlyTotal / (monthlyPrice * 12)) * 100);
              const displayPrice = billingCycle === 'yearly'
                ? yearlyMonthlyEquivalent
                : monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col bg-white rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                    isPopular
                      ? `border-2 ${colors.border} shadow-xl`
                      : `border-2 ${colors.border} shadow-lg`
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="p-8 flex-grow">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${colors.icon} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                      {plan.display_name}
                    </h3>
                    <p className="text-base font-medium text-gray-500 mb-6">
                      {tagline}
                    </p>

                    <div className="mb-8">
                      {isEnterprise ? (
                        <div className="flex items-baseline">
                          <span className="text-4xl md:text-5xl font-extrabold text-gray-900">Custom</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-semibold text-gray-500">$</span>
                            <span className={`text-5xl md:text-6xl font-extrabold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
                              {displayPrice}
                            </span>
                            <span className="text-lg text-gray-500 font-medium">/mo</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <p className="text-sm text-gray-500 mt-2">
                              ${yearlyTotal}/year <span className="text-emerald-600 font-semibold">(Save {annualSavingsPercent}%)</span>
                            </p>
                          )}
                          {plan.trial_days > 0 && (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold mt-3 border border-emerald-200">
                              <Shield className="w-4 h-4" />
                              {plan.trial_days}-day free trial
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${colors.icon}`}>
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-base text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 pt-0">
                    <button
                      onClick={() => handleSubscribe(plan, billingCycle === 'yearly')}
                      disabled={loadingPlanId !== null}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-center transition-all duration-300 flex items-center justify-center group disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 ${colors.button}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isEnterprise ? (
                        <>
                          Contact Sales
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        <>
                          Start Free Trial
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-emerald-900 mb-2">We Don't Tax Your Success</h3>
              <p className="text-emerald-700">
                $0 platform transaction fees. You pay a simple monthly subscription - we never take a percentage of your sales.
                Only standard Stripe processing fees (2.9% + $0.30) apply, and those go directly to Stripe, not us.
              </p>
            </div>
            <div className="inline-flex items-center gap-8 flex-wrap justify-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">SSL Included</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Daily Backups</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">99.9% Uptime SLA</span>
              </div>
            </div>
            <p className="text-gray-500 mt-6">
              Need help choosing the right plan?{' '}
              <Link to="/pages/contact" className="text-blue-600 font-semibold hover:underline">
                Talk to our team
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">Everything you need to know about our plans</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                a: 'No long-term contracts. Monthly plans can be cancelled anytime. Yearly plans save you over 15% and can be cancelled with prorated refunds.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data is retained for 30 days after cancellation, giving you time to export or reactivate. After 30 days, data is permanently deleted.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'With a 14-day free trial, you can fully explore the platform before committing. If you\'re not satisfied after subscribing, contact support within 7 days for a prorated refund.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
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
            <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-900">Privacy</Link>
            <Link to="/terms-of-service" className="text-gray-500 hover:text-gray-900">Terms</Link>
            <Link to="/pages/contact" className="text-gray-500 hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
