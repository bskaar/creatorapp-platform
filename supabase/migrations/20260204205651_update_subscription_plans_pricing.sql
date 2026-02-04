/*
  # Update Subscription Plans to Match Production Pricing

  ## Overview
  Updates subscription plans to match the Starter/Growth/Pro pricing structure
  at $49/$99/$199 per month with updated feature limits.

  ## Changes
  1. **Starter Plan** - Updated to $49/month
     - 3 products
     - 3 funnels
     - 1 admin user
     - Up to 2,500 contacts
     - 3 workflows (basic automations)
     - AI site + funnel + email generation
     - 14-day free trial

  2. **Growth Plan** - Kept at $99/month (MOST POPULAR)
     - 50 products
     - 10 funnels
     - 3 admin users
     - Up to 10,000 contacts
     - Unlimited workflows (advanced logic)
     - AI optimization + predictive modeling
     - 14-day free trial

  3. **Pro Plan** - Kept at $199/month
     - Unlimited products
     - Unlimited funnels
     - 10 admin users
     - Up to 50,000 contacts
     - Unlimited workflows (advanced + AI logic)
     - Predictive AI LTV modeling
     - 14-day free trial

  4. **Enterprise Plan** - Custom pricing (not changed)
     - All limits unlimited
     - Custom features and support

  ## Important Notes
  - This aligns the database with the production marketing page pricing
  - All plans include a 14-day free trial
  - Enterprise remains custom pricing (handled separately)
  - Stripe product/price IDs will be added after products are created in Stripe
*/

-- Update Starter plan pricing and limits
UPDATE subscription_plans
SET
  price_monthly = 49.00,
  description = 'First-time creators',
  limits = jsonb_build_object(
    'max_products', 3,
    'max_funnels', 3,
    'max_contacts', 2500,
    'max_emails_per_month', 10000,
    'max_team_members', 1,
    'max_workflows', 3,
    'trial_days', 14,
    'ai_features', json_build_array('site_generation', 'funnel_generation', 'email_generation'),
    'features', json_build_array('stripe_integration', 'basic_analytics', 'email_support')
  ),
  updated_at = now()
WHERE name = 'starter';

-- Update Growth plan limits (keep price at $99)
UPDATE subscription_plans
SET
  description = 'Serious creators',
  limits = jsonb_build_object(
    'max_products', 50,
    'max_funnels', 10,
    'max_contacts', 10000,
    'max_emails_per_month', 50000,
    'max_team_members', 3,
    'max_workflows', null,
    'trial_days', 14,
    'ai_features', json_build_array('site_generation', 'funnel_generation', 'email_generation', 'ai_optimization', 'predictive_modeling'),
    'features', json_build_array('stripe_integration', 'advanced_analytics', 'workflow_automation', 'priority_support', 'api_access')
  ),
  updated_at = now()
WHERE name = 'growth';

-- Update Pro plan limits (keep price at $199)
UPDATE subscription_plans
SET
  description = 'Scaling businesses',
  limits = jsonb_build_object(
    'max_products', null,
    'max_funnels', null,
    'max_contacts', 50000,
    'max_emails_per_month', 250000,
    'max_team_members', 10,
    'max_workflows', null,
    'trial_days', 14,
    'ai_features', json_build_array('site_generation', 'funnel_generation', 'email_generation', 'ai_optimization', 'predictive_modeling', 'ltv_prediction'),
    'features', json_build_array('stripe_integration', 'advanced_analytics', 'workflow_automation', 'white_label', 'dedicated_support', 'api_access', 'custom_integrations')
  ),
  updated_at = now()
WHERE name = 'pro';

-- Update Enterprise plan (custom pricing, unlimited everything)
UPDATE subscription_plans
SET
  description = 'Custom enterprise solutions',
  price_monthly = 0,
  limits = jsonb_build_object(
    'max_products', null,
    'max_funnels', null,
    'max_contacts', null,
    'max_emails_per_month', null,
    'max_team_members', null,
    'max_workflows', null,
    'trial_days', 14,
    'ai_features', json_build_array('site_generation', 'funnel_generation', 'email_generation', 'ai_optimization', 'predictive_modeling', 'ltv_prediction', 'custom_ai'),
    'features', json_build_array('everything_included', 'dedicated_csm', 'sla_support', 'custom_domain', 'onboarding_support', 'training')
  ),
  updated_at = now()
WHERE name = 'enterprise';