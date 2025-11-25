import { Check, Zap, TrendingUp, Building2, ArrowRight, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

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
      cta: "Start Growth Plan",
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
                  className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary font-semibold rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition"
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

      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-extrabold text-dark mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-2xl text-text-secondary mb-10 font-medium">
            No hidden fees. Unlimited products. Pay only as you grow your audience.
          </p>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold shadow-light">
            <Check className="w-5 h-5" />
            <span>Start free with the Starter plan, upgrade anytime</span>
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
                  className={`relative flex flex-col bg-white rounded-card shadow-light transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                    tier.highlight
                      ? "border-2 border-primary ring-4 ring-primary/10"
                      : "border border-border"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-6 py-2 rounded-full shadow-button-hover">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="p-8 flex-grow">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-light ${
                        tier.highlight
                          ? "bg-gradient-to-br from-primary to-accent"
                          : "bg-gradient-to-br from-slate-600 to-slate-700"
                      }`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-dark mb-3">
                      {tier.name}
                    </h3>
                    <p className="text-text-secondary text-sm mb-6 min-h-[40px] font-medium">
                      {tier.description}
                    </p>

                    <div className="mb-8">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-extrabold text-dark">
                          {tier.price}
                        </span>
                        {tier.price !== "Custom" && tier.price !== "$0" && (
                          <span className="text-text-secondary ml-2 font-semibold">/mo</span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-2 font-medium">{tier.billingNote}</p>
                    </div>

                    <ul className="space-y-3.5 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-text-primary font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 pt-0">
                    <Link
                      to={tier.ctaLink}
                      className={`w-full py-4 px-4 rounded-button font-bold text-center transition-all duration-300 flex items-center justify-center group ${
                        tier.highlight
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-button-hover hover:shadow-xl hover:-translate-y-0.5"
                          : "bg-dark text-white hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:-translate-y-0.5"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ/Trust Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-dark mb-6">
            Questions? We've Got Answers
          </h2>
          <p className="text-text-secondary mb-12 text-lg font-medium">
            Join thousands of creators building their digital empire with CreatorApp.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-left">
            <div className="flex-1 min-w-[280px] max-w-[400px] bg-white rounded-card shadow-light p-6 border border-border">
              <h3 className="font-bold text-dark mb-3 text-lg">
                Can I change plans later?
              </h3>
              <p className="text-text-secondary text-sm font-medium">
                Absolutely! Upgrade or downgrade anytime. Changes take effect immediately.
              </p>
            </div>
            <div className="flex-1 min-w-[280px] max-w-[400px] bg-white rounded-card shadow-light p-6 border border-border">
              <h3 className="font-bold text-dark mb-3 text-lg">
                What payment methods do you accept?
              </h3>
              <p className="text-text-secondary text-sm font-medium">
                We accept all major credit cards through Stripe for secure processing.
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
