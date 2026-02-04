# Live Stripe Production Setup Guide

## Overview
This guide walks through setting up Stripe in production with:
- 14-day free trials on all subscription tiers
- Beta user discount codes (100% off)
- Live payment processing

## Step 1: Get Live Stripe Keys

1. Go to https://dashboard.stripe.com
2. **Toggle to "Live mode"** (top right - ensure the toggle says "LIVE" not "TEST")
3. Go to **Developers** → **API keys**
4. Copy your **Live Publishable key** (starts with `pk_live_`)
5. Copy your **Live Secret key** (starts with `sk_live_`)
6. Copy your **Live Webhook signing secret** (we'll get this in Step 4)

⚠️ **CRITICAL**: Make sure you're in LIVE mode, not test mode!

## Step 2: Create Products in Stripe

### Product 1: Creator Plan

1. Go to **Products** → Click **Add Product**
2. Fill in:
   - **Name**: `Creator Plan`
   - **Description**: `Perfect for getting started with your creator business`

3. Under **Pricing**:
   - **Pricing model**: `Standard pricing`
   - **Price**: `$29`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`

4. Click **Add pricing** to add annual option:
   - **Price**: `$290`
   - **Billing period**: `Yearly`
   - **Currency**: `USD`

5. ⭐ **Add Free Trial**:
   - Scroll to **Free trial**
   - Enable **"Offer customers a free trial"**
   - Set to **14 days**

6. Click **Save product**
7. Copy the **Product ID** (starts with `prod_`)
8. Copy the **Price IDs** for monthly (starts with `price_`) and yearly

### Product 2: Professional Plan

1. Click **Add Product**
2. Fill in:
   - **Name**: `Professional Plan`
   - **Description**: `Advanced features for growing creators`

3. Under **Pricing**:
   - **Price**: `$99`
   - **Billing period**: `Monthly`
   - Add annual: `$990` yearly

4. **Add Free Trial**: 14 days

5. Save and copy Product ID and Price IDs

### Product 3: Enterprise Plan

1. Click **Add Product**
2. Fill in:
   - **Name**: `Enterprise Plan`
   - **Description**: `Complete solution for established creator businesses`

3. Under **Pricing**:
   - **Price**: `$299`
   - **Billing period**: `Monthly`
   - Add annual: `$2990` yearly

4. **Add Free Trial**: 14 days

5. Save and copy Product ID and Price IDs

## Step 3: Create Beta User Discount Codes

### Option A: 100% Off Forever (Recommended for Beta)

1. Go to **Products** → **Coupons**
2. Click **Create coupon**
3. Fill in:
   - **Name**: `BETA100`
   - **ID**: `BETA100` (customer-facing code)
   - **Type**: `Percentage`
   - **Percent off**: `100`
   - **Duration**: `Forever` ⭐ (this makes it free forever)
   - **Redeem by**: Leave blank (or set expiration date)
   - **Max redemptions**: Set limit (e.g., 100 for first 100 beta users)

4. Click **Create coupon**

### Option B: Multiple Beta Codes

Create additional codes for different beta user groups:

**EARLYACCESS** - 100% off forever
**FOUNDER** - 100% off for 1 year, then full price
**BETA50** - 50% off forever

## Step 4: Set Up Live Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `YOUR_SUPABASE_PROJECT` with your actual Supabase project reference

4. Click **Select events** and choose:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `checkout.session.completed`

5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 5: Update Environment Variables

### In Vercel (Production):

1. Go to https://vercel.com/dashboard
2. Select your `creatorapp-platform` project
3. Go to **Settings** → **Environment Variables**
4. Update/Add these variables:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
```

### In Supabase (Edge Functions):

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Project Settings** → **Edge Functions** → **Secrets**
4. Add/Update:

```
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

## Step 6: Update Database Subscription Plans

Run this SQL in Supabase SQL Editor to update with your live Stripe IDs:

```sql
-- Update Creator Plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_YOUR_CREATOR_PRODUCT_ID',
  stripe_price_monthly = 'price_YOUR_CREATOR_MONTHLY_PRICE_ID',
  stripe_price_yearly = 'price_YOUR_CREATOR_YEARLY_PRICE_ID'
WHERE name = 'Creator';

-- Update Professional Plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_YOUR_PROFESSIONAL_PRODUCT_ID',
  stripe_price_monthly = 'price_YOUR_PROFESSIONAL_MONTHLY_PRICE_ID',
  stripe_price_yearly = 'price_YOUR_PROFESSIONAL_YEARLY_PRICE_ID'
WHERE name = 'Professional';

-- Update Enterprise Plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_YOUR_ENTERPRISE_PRODUCT_ID',
  stripe_price_monthly = 'price_YOUR_ENTERPRISE_MONTHLY_PRICE_ID',
  stripe_price_yearly = 'price_YOUR_ENTERPRISE_YEARLY_PRICE_ID'
WHERE name = 'Enterprise';
```

## Step 7: Redeploy Application

After updating environment variables in Vercel:

1. Go to **Deployments**
2. Click the **︙** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Step 8: Test the Setup

### Test Free Trial:

1. Go to www.creatorapp.us
2. Sign up for a new account
3. Select a plan
4. Go through checkout
5. Enter test card: `4242 4242 4242 4242` (any future date, any CVC)
6. Verify subscription is created with trial period

### Test Beta Code:

1. During checkout, click **"Add promotion code"**
2. Enter `BETA100`
3. Verify it shows **$0.00 due today** and **$0.00 recurring**
4. Complete checkout
5. Check Stripe dashboard - should show subscription with 100% off coupon

## Important Notes

### Free Trial Behavior:
- Users won't be charged for 14 days
- They get full access immediately
- Stripe will attempt to charge after 14 days
- If payment fails, subscription becomes past_due

### Beta Code Behavior (100% off forever):
- No trial period needed (already free)
- User pays $0 forever
- Still creates a "subscription" in Stripe
- Easy to track beta users

### Cancellation:
- Users can cancel anytime during trial (no charge)
- Beta users can be upgraded by removing coupon in Stripe dashboard

## Monitoring

### Check Stripe Dashboard:
- **Home** - Overview of revenue and activity
- **Payments** - All payment attempts
- **Subscriptions** - Active subscriptions and trials
- **Customers** - Customer list with coupons applied

### Check Application Database:
```sql
-- View all subscriptions
SELECT
  u.email,
  s.site_id,
  sp.name as plan_name,
  s.status,
  s.trial_end,
  s.current_period_end
FROM subscriptions s
JOIN sites si ON s.site_id = si.id
JOIN auth.users u ON si.owner_id = u.id
JOIN subscription_plans sp ON s.plan_id = sp.id
ORDER BY s.created_at DESC;
```

## Troubleshooting

### Trial Not Working:
- Check product has trial period configured in Stripe
- Verify price IDs are correct in database
- Check subscription in Stripe dashboard shows trial_end date

### Beta Code Not Working:
- Verify coupon is created and active in Stripe
- Check coupon ID matches what user is entering
- Ensure max redemptions not reached
- Verify "Duration: Forever" is set

### Webhook Issues:
- Check webhook endpoint is live and responding
- Verify signing secret is correct in Supabase
- Check webhook logs in Stripe dashboard
- View Edge Function logs in Supabase

## Security Checklist

✅ Live mode enabled in Stripe
✅ Live keys added to production environment
✅ Webhook endpoint secured with signing secret
✅ Test mode keys removed from production
✅ Environment variables not exposed in client code
✅ Database RLS policies active

## Next Steps

1. ✅ Complete Stripe setup
2. Generate beta invitation codes
3. Send invites to beta users
4. Monitor first signups
5. Collect feedback
6. Iterate on features
