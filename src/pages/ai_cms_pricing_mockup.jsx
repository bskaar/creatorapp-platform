import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$0 / $29",
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
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Growth",
      price: "$99/mo",
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
      highlight: true
    },
    {
      name: "Pro",
      price: "$199/mo",
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
      highlight: false
    },
    {
      name: "Enterprise",
      price: "Custom",
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
      highlight: false
    }
  ];

  return (
    <div className="bg-gray-50 py-16 px-6 lg:px-20">
      <h1 className="text-4xl font-bold text-center mb-6">AI-CMS Pricing Plans</h1>
      <p className="text-center text-gray-600 mb-12">
        No hidden fees. Unlimited products. Pay only as you grow your audience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`flex flex-col justify-between shadow-lg rounded-2xl p-4 transition transform hover:scale-105 ${
              tier.highlight ? "border-4 border-blue-500" : "border"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {tier.name}
              </CardTitle>
              <p className="text-center text-gray-500">{tier.description}</p>
              <p className="text-center text-3xl font-extrabold mt-4">
                {tier.price}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full py-3 text-lg font-semibold rounded-xl ${
                  tier.highlight ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-gray-900"
                }`}
              >
                {tier.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
