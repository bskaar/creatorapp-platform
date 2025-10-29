import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Zap, TrendingUp, Building2, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useSite } from '../contexts/SiteContext';

export default function SubscriptionSelect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscribeToPlan, loading, error } = useSubscription();
  const { currentSite, loading: siteLoading, refreshSites } = useSite();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [preSelectedPlan, setPreSelectedPlan] = useState<string>('');
  const autoSubscribeAttempted = useRef(false);
  const refreshAttempted = useRef(false);

  useEffect(() => {
    const plan = searchParams.get('plan');
    console.log('Plan from URL:', plan);
    if (plan) {
      setPreSelectedPlan(plan);
    }
  }, [searchParams]);

  useEffect(() => {
    if (preSelectedPlan && !currentSite && !siteLoading && !refreshAttempted.current) {
      console.log('Site not loaded, attempting refresh...');
      refreshAttempted.current = true;
      setTimeout(() => refreshSites(), 500);
    }
  }, [preSelectedPlan, currentSite, siteLoading, refreshSites]);

  useEffect(() => {
    const autoSubscribe = async () => {
      console.log('Auto-subscribe check:', {
        preSelectedPlan,
        currentSite: !!currentSite,
        autoSubscribeAttempted: autoSubscribeAttempted.current,
        siteLoading
      });

      if (preSelectedPlan && currentSite && !autoSubscribeAttempted.current && !siteLoading) {
        autoSubscribeAttempted.current = true;
        setSelectedPlan(preSelectedPlan);
        console.log('Auto-subscribing to plan:', preSelectedPlan);
        try {
          const result = await subscribeToPlan(preSelectedPlan);
          if (!result?.url) {
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Auto-subscribe failed:', err);
          setTimeout(() => {
            navigate('/pricing');
          }, 3000);
        }
      }
    };
    autoSubscribe();
  }, [preSelectedPlan, currentSite, siteLoading, subscribeToPlan]);

  if (siteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (preSelectedPlan && !currentSite && !siteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Setting up your site...</p>
        </div>
      </div>
    );
  }

  if (loading && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Setting up your subscription...</p>
          <p className="text-sm text-gray-500 mt-2">You'll be redirected to complete payment</p>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      icon: Zap,
      description: 'Perfect for solo creators',
      features: [
        '1 product, 1 funnel',
        'Up to 2,500 contacts',
        '5,000 emails/month',
        'AI Page Builder (basic)',
        'Stripe & PayPal integration',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 99,
      icon: TrendingUp,
      popular: true,
      description: 'Best for growing creators',
      features: [
        'Unlimited products, 5 funnels',
        'Up to 10,000 contacts',
        '50,000 emails/month',
        'AI Copywriter',
        'Affiliate program',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 199,
      icon: Building2,
      description: 'For scaling businesses',
      features: [
        'Unlimited products & funnels',
        'Up to 50,000 contacts',
        '250,000 emails/month',
        'AI Analytics',
        '10 team members',
      ],
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      await subscribeToPlan(planId);
    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Start your 14-day free trial. No credit card required.
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            <span>14-day free trial • Cancel anytime</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Payment Setup Required</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  {error.includes('Stripe is not configured') && (
                    <div className="mt-3">
                      <a
                        href="https://bolt.new/setup/stripe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Setup Stripe Now
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl ${
                  plan.popular || preSelectedPlan === plan.id ? 'border-2 border-blue-500 ring-4 ring-blue-50' : 'border border-slate-200'
                }`}
              >
                {(plan.popular || preSelectedPlan === plan.id) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      {preSelectedPlan === plan.id ? 'SELECTED' : 'MOST POPULAR'}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">/mo</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">after trial ends</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Starting Trial...
                      </>
                    ) : (
                      'Start Free Trial'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900 font-medium underline"
          >
            Skip for now, explore the dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
