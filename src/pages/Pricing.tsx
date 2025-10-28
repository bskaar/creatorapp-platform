import { Check, Zap, TrendingUp, Building2, ArrowRight, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/pricing');
  };

  const tiers = [
    {
      name: "Starter",
      price: "$0",
      billingNote: "Free forever, then $29/mo",
      description: "For solo creators and side hustlers",
      features: [
        "1 product, 1 funnel",
        "Up to 2,500 contacts",
        "5,000 emails/month",
        "AI Page Builder (basic)",
        "Stripe & PayPal integration",
        "1 course/membership",
        "Email support"
      ],
      cta: "Get Started Free",
      ctaLink: "/signup",
      highlight: false,
      icon: Zap,
      popular: false
    },
    {
      name: "Growth",
      price: "$99",
      billingNote: "per month",
      description: "Best for growing creators with multiple offers",
      features: [
        "Unlimited products, up to 5 funnels",
        "Up to 10,000 contacts",
        "50,000 emails/month",
        "AI Copywriter for pages & emails",
        "Affiliate/referral program",
        "Unlimited courses/memberships",
        "Stripe & PayPal integration",
        "Priority email & chat support"
      ],
      cta: "Start Free Trial",
      ctaLink: "/signup?plan=growth",
      highlight: true,
      icon: TrendingUp,
      popular: true
    },
    {
      name: "Pro",
      price: "$199",
      billingNote: "per month",
      description: "For scaling businesses and teams",
      features: [
        "Unlimited products & funnels",
        "Up to 50,000 contacts",
        "250,000 emails/month",
        "AI Analytics: churn prediction, upsell recs",
        "White-label membership sites",
        "10 team members",
        "Stripe & PayPal integration",
        "Account manager support"
      ],
      cta: "Upgrade to Pro",
      ctaLink: "/signup?plan=pro",
      highlight: false,
      icon: Building2,
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      billingNote: "contact sales",
      description: "For agencies and high-volume enterprises",
      features: [
        "100k+ contacts (custom)",
        "Unlimited products, funnels, and domains",
        "Unlimited emails",
        "Custom AI pipelines, predictive modeling",
        "Enterprise portals",
        "Unlimited team members",
        "Multi-gateway payments & invoicing",
        "Dedicated CSM & SLA support"
      ],
      cta: "Contact Sales",
      ctaLink: "/signup?plan=enterprise",
      highlight: false,
      icon: Building2,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/login" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CreatorApp</span>
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            No hidden fees. Unlimited products. Pay only as you grow your audience.
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            <span>14-day free trial on all paid plans</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`relative flex flex-col bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    tier.highlight
                      ? "border-2 border-blue-500 ring-4 ring-blue-50"
                      : "border border-slate-200"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tier.highlight
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-slate-600 to-slate-700"
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                      {tier.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {tier.price}
                        </span>
                        {tier.price !== "Custom" && tier.price !== "$0" && (
                          <span className="text-gray-600 ml-2">/mo</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{tier.billingNote}</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      to={tier.ctaLink}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center group ${
                        tier.highlight
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ/Trust Section */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions? We've Got Answers
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of creators building their digital empire with CreatorApp.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-left">
            <div className="flex-1 min-w-[280px] max-w-[400px]">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! Upgrade or downgrade anytime. Changes take effect immediately.
              </p>
            </div>
            <div className="flex-1 min-w-[280px] max-w-[400px]">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards through Stripe for secure processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2024 CreatorApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
