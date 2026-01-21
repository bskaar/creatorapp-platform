import React from 'react';
import { Check, X, Rocket, TrendingUp, Award, Building } from 'lucide-react';

const PricingReview = () => {
  const tiers = [
    {
      name: 'Starter',
      icon: Rocket,
      iconColor: 'text-blue-500',
      price: '$49',
      period: 'per month',
      description: 'First-time creators',
      features: [
        { name: '3 products', included: true },
        { name: '3 funnels', included: true },
        { name: '1 admin user', included: true },
        { name: 'Up to 2,500 contacts', included: true },
        { name: '3 workflows (basic automations)', included: true },
        { name: 'AI site + funnel + email generator (basic)', included: true },
        { name: 'Resend email integration', included: true },
        { name: 'CreatorApp branding', included: true },
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Growth',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      price: '$99',
      period: 'per month',
      description: 'Serious creators',
      features: [
        { name: '50 products', included: true },
        { name: '10 funnels', included: true },
        { name: '3 admin users', included: true },
        { name: 'Up to 10,000 contacts', included: true },
        { name: 'Unlimited workflows (advanced logic)', included: true },
        { name: 'AI optimization + segmentation + funnel suggestions', included: true },
        { name: 'Resend + 1 custom ESP', included: true },
        { name: 'CreatorApp branding', included: true },
        { name: 'Priority email support', included: true },
      ],
      cta: 'Start Growth Plan',
      popular: true,
    },
    {
      name: 'Pro',
      icon: Award,
      iconColor: 'text-amber-500',
      price: '$199',
      period: 'per month',
      description: 'Scaling businesses',
      features: [
        { name: 'Unlimited products', included: true },
        { name: 'Unlimited funnels', included: true },
        { name: '10 admin users', included: true },
        { name: 'Up to 50,000 contacts', included: true },
        { name: 'Unlimited workflows (advanced + APIs)', included: true },
        { name: 'Predictive AI, LTV modeling, advanced analytics', included: true },
        { name: 'Resend + unlimited ESPs', included: true },
        { name: 'White-label (remove all branding)', included: true },
        { name: 'Dedicated account manager', included: true },
      ],
      cta: 'Upgrade to Pro',
      popular: false,
    },
    {
      name: 'Enterprise',
      icon: Building,
      iconColor: 'text-slate-600',
      price: 'Custom',
      period: 'contact sales',
      description: 'Agencies & platforms',
      features: [
        { name: 'Unlimited products', included: true },
        { name: 'Unlimited funnels', included: true },
        { name: 'Custom admin users', included: true },
        { name: '100k+ contacts (custom)', included: true },
        { name: 'Unlimited + custom workflows', included: true },
        { name: 'Custom AI pipelines + governance', included: true },
        { name: 'Custom email integration', included: true },
        { name: 'Fully white-labeled', included: true },
        { name: 'Dedicated CSM & SLA support', included: true },
      ],
      cta: 'Contact Sales',
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Products & Funnels</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Starter:</strong> 3 products, 3 funnels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Growth:</strong> 50 products, 10 funnels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> Unlimited products & funnels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Enterprise:</strong> Unlimited products & funnels</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contacts & Automations</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Starter:</strong> 2,500 contacts, 3 basic workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Growth:</strong> 10,000 contacts, unlimited workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> 50,000 contacts, unlimited workflows + APIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Enterprise:</strong> 100k+ contacts, custom workflows</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Starter:</strong> Basic AI generator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Growth:</strong> AI optimization + segmentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> Predictive AI + LTV modeling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Enterprise:</strong> Custom AI pipelines</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Team & Branding</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Starter:</strong> 1 admin, CreatorApp branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Growth:</strong> 3 admins, CreatorApp branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Pro:</strong> 10 admins, white-label</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span><strong>Enterprise:</strong> Custom admins, fully white-labeled</span>
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
                What happens if I exceed my plan limits?
              </h3>
              <p className="text-gray-700">
                If you reach your product, funnel, or contact limits, you'll be prompted to upgrade. We'll never interrupt your service - you'll have time to choose a plan that fits your growth.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are there any setup fees or hidden costs?
              </h3>
              <p className="text-gray-700">
                No setup fees. All features are included in your plan. The only additional costs are Stripe payment processing fees (standard Stripe rates apply).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I bring my own email service provider (ESP)?
              </h3>
              <p className="text-gray-700">
                Growth tier includes Resend + 1 custom ESP. Pro tier includes unlimited ESP integrations. Enterprise tier gets custom email integration support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingReview;
