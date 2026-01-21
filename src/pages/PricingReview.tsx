import React from 'react';
import { Check, X, Zap, Crown, Rocket } from 'lucide-react';

const PricingReview = () => {
  const tiers = [
    {
      name: 'Free',
      icon: Zap,
      iconColor: 'text-gray-400',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out the platform',
      features: [
        { name: '1 site', included: true },
        { name: '5 pages per site', included: true },
        { name: 'Basic templates', included: true },
        { name: '100 MB storage', included: true },
        { name: 'Community support', included: true },
        { name: 'Custom domain', included: false },
        { name: 'Remove branding', included: false },
        { name: 'AI features', included: false },
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Creator',
      icon: Crown,
      iconColor: 'text-blue-500',
      price: '$29',
      period: 'per month',
      description: 'For creators building their business',
      features: [
        { name: '3 sites', included: true },
        { name: 'Unlimited pages', included: true },
        { name: 'All templates + themed templates', included: true },
        { name: '10 GB storage', included: true },
        { name: 'Custom domain (3 domains)', included: true },
        { name: 'Remove branding', included: true },
        { name: 'Basic AI features', included: true },
        { name: 'Email support', included: true },
        { name: 'Commerce (5% + Stripe fees)', included: true },
        { name: 'Up to 1,000 contacts', included: true },
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Pro',
      icon: Rocket,
      iconColor: 'text-purple-500',
      price: '$79',
      period: 'per month',
      description: 'For professionals scaling their business',
      features: [
        { name: 'Unlimited sites', included: true },
        { name: 'Unlimited pages', included: true },
        { name: 'All templates + custom blocks', included: true },
        { name: '100 GB storage', included: true },
        { name: 'Unlimited custom domains', included: true },
        { name: 'White label (remove all branding)', included: true },
        { name: 'Advanced AI features', included: true },
        { name: 'Priority support', included: true },
        { name: 'Commerce (3% + Stripe fees)', included: true },
        { name: 'Unlimited contacts', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Marketing automation', included: true },
        { name: 'Team collaboration (5 members)', included: true },
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Pricing Tiers Review
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your creator journey
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl ${
                  tier.popular ? 'ring-4 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-8 h-8 ${tier.iconColor}`} />
                    <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-gray-500">/ {tier.period}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">{tier.description}</p>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      tier.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {tier.cta}
                  </button>

                  {/* Features */}
                  <div className="mt-8 space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature.name} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Notes */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Differences</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sites & Storage</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Free:</strong> 1 site, 5 pages, 100 MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Creator:</strong> 3 sites, unlimited pages, 10 GB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> Unlimited sites & pages, 100 GB</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Commerce Fees</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Free:</strong> No commerce features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Creator:</strong> 5% platform fee + Stripe fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> 3% platform fee + Stripe fees</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Free:</strong> No AI features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Creator:</strong> Basic AI (text generation, color palettes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> Advanced AI (themes, automations, insights)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Support & Collaboration</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Free:</strong> Community support only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Creator:</strong> Email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> Priority support + team collaboration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade at any time?
              </h3>
              <p className="text-gray-700">
                Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your current billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my sites if I downgrade from Pro to Creator?
              </h3>
              <p className="text-gray-700">
                If you have more than 3 sites, you'll need to choose which 3 to keep active. The others will be archived and can be reactivated if you upgrade again.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are there any setup fees or hidden costs?
              </h3>
              <p className="text-gray-700">
                No setup fees. The only additional costs are Stripe payment processing fees (standard Stripe rates apply) and the platform fee for commerce transactions (5% for Creator, 3% for Pro).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer annual billing?
              </h3>
              <p className="text-gray-700">
                Annual billing with a 20% discount is coming soon! Sign up to be notified when it launches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingReview;
