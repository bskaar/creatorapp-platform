import { useEffect, useState } from 'react';
import { Check, Rocket, Award, ArrowRight, LogOut, Loader2, Zap, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import StructuredData, { faqSchema } from '../components/StructuredData';
import { supabase } from '../lib/supabase';

const SITE_ID = 'b5b5e734-dea4-4c59-976c-537a9c599b24';

const PRODUCTS = [
  {
    id: '42e198d0-0bfb-4554-9bef-41d586110322',
    title: 'CreatorApp Starter Course',
    price: 297,
    description: 'Launch your first online course with AI-powered tools.',
    icon: Rocket,
    badge: null,
    features: [
      'AI-powered course builder',
      'Sales funnel templates',
      'Email marketing automation',
      'Stripe payment integration',
      'Lifetime access',
      'Community support',
    ],
  },
  {
    id: '8e08c554-6066-4138-b176-f98692b065cf',
    title: 'CreatorApp Pro Accelerator',
    price: 997,
    description: 'The complete creator business system to scale your revenue.',
    icon: Award,
    badge: 'BEST VALUE',
    features: [
      'Everything in Starter',
      'AI co-founder features',
      'Advanced analytics & LTV modeling',
      'Unlimited funnels',
      'Dedicated success coach',
      'White-label capabilities',
      'Priority support & onboarding',
    ],
  },
];

export default function Pricing() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Pricing - CreatorApp | Affordable Plans for Course Creators';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Simple, transparent pricing for online course creators. Plans starting at $297 one-time. No subscriptions, AI-powered tools included.');
    }
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'course platform pricing, creator platform cost, affordable course hosting, online course pricing, membership site pricing, AI course creator pricing, course builder plans, creator business tools cost';
    document.head.appendChild(metaKeywords);

    return () => {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) keywords.remove();
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/pricing');
  };

  const handleCheckout = async (productId: string) => {
    setLoadingProductId(productId);
    setCheckoutError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const successUrl = `${window.location.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/pricing`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-commerce-checkout`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            siteId: SITE_ID,
            items: [{ productId, quantity: 1 }],
            customerEmail: user?.email || '',
            customerName: '',
            successUrl,
            cancelUrl,
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
      setLoadingProductId(null);
    }
  };

  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: PRODUCTS.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        description: product.description,
        offers: {
          '@type': 'Offer',
          price: product.price,
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

      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/login" className="flex items-center">
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
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            <span>One-time purchase — no recurring fees</span>
          </div>
          <h1 className="text-5xl font-extrabold text-dark mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-text-secondary font-medium mb-4">
            Pick the package that fits your stage. Both include lifetime access and all future updates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-2.5 rounded-full text-sm font-semibold">
              <Check className="w-4 h-4" />
              <span>Secure Stripe checkout</span>
            </div>
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-800 px-5 py-2.5 rounded-full text-sm font-semibold">
              <Check className="w-4 h-4" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {checkoutError && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium">
              {checkoutError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRODUCTS.map((product) => {
              const Icon = product.icon;
              const isLoading = loadingProductId === product.id;
              const isHighlighted = !!product.badge;

              return (
                <div
                  key={product.id}
                  className={`relative flex flex-col bg-white rounded-2xl transition-all duration-300 hover:-translate-y-2 ${
                    isHighlighted
                      ? 'border-2 border-primary shadow-xl ring-4 ring-primary/10'
                      : 'border border-border shadow-light hover:shadow-xl'
                  }`}
                >
                  {product.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-5 py-2 rounded-full shadow-button-hover">
                        <Star className="w-3.5 h-3.5" />
                        <span>{product.badge}</span>
                      </span>
                    </div>
                  )}

                  <div className="p-8 flex-grow">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      isHighlighted
                        ? 'bg-gradient-to-br from-primary to-accent'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800'
                    }`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-dark mb-2">
                      {product.title}
                    </h3>
                    <p className="text-text-secondary font-medium mb-6">
                      {product.description}
                    </p>

                    <div className="mb-8">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-5xl font-extrabold text-dark">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-text-secondary font-semibold">USD</span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">One-time payment, lifetime access</p>
                    </div>

                    <ul className="space-y-3">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-text-primary font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 pt-0">
                    <button
                      onClick={() => handleCheckout(product.id)}
                      disabled={loadingProductId !== null}
                      className={`w-full py-4 px-6 rounded-button font-bold text-center transition-all duration-300 flex items-center justify-center group disabled:opacity-60 disabled:cursor-not-allowed ${
                        isHighlighted
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-button-hover hover:shadow-xl hover:-translate-y-0.5'
                          : 'bg-dark text-white hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:-translate-y-0.5'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Redirecting to checkout...
                        </>
                      ) : (
                        <>
                          Get Instant Access
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-text-secondary text-center mt-3">
                      Secure checkout powered by Stripe
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-dark mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
            <div className="bg-white rounded-card shadow-light p-6 border border-border">
              <h3 className="font-bold text-dark mb-3 text-lg">
                Is this a one-time payment?
              </h3>
              <p className="text-text-secondary text-sm font-medium">
                Yes. Both packages are one-time purchases with lifetime access. No subscriptions, no recurring charges.
              </p>
            </div>
            <div className="bg-white rounded-card shadow-light p-6 border border-border">
              <h3 className="font-bold text-dark mb-3 text-lg">
                What's your refund policy?
              </h3>
              <p className="text-text-secondary text-sm font-medium">
                We offer a full 30-day money-back guarantee. If you're not satisfied, contact support for a complete refund.
              </p>
            </div>
            <div className="bg-white rounded-card shadow-light p-6 border border-border">
              <h3 className="font-bold text-dark mb-3 text-lg">
                What payment methods are accepted?
              </h3>
              <p className="text-text-secondary text-sm font-medium">
                All major credit and debit cards are accepted through Stripe's secure checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-white">
        <div className="max-w-7xl mx-auto text-center text-text-secondary text-sm font-medium">
          <p>&copy; 2024 CreatorApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
