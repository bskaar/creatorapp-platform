# Live Stripe Production Setup Guide

## Overview
This guide walks through setting up Stripe in production with:
- New Stripe Connect account (replacing test mode account)
- 14-day free trials on all subscription tiers
- Beta user discount codes (100% off)
- Live payment processing

⚠️ **IMPORTANT**: You cannot convert a test mode Stripe Connect account to live mode. You must create a new Connect account.

## Quick Checklist

Before you start, you'll need to complete these steps in order:

- [ ] Create/Access Stripe account
- [ ] Switch to LIVE mode
- [ ] Enable Stripe Connect (Platform)
- [ ] Copy Live Publishable Key
- [ ] Copy Live Secret Key
- [ ] Create 3 products with 14-day trials
- [ ] Copy all Product IDs and Price IDs
- [ ] Create BETA100 coupon (100% off forever)
- [ ] Create webhook endpoint
- [ ] Copy Webhook Signing Secret
- [ ] Update Vercel environment variables
- [ ] Update Supabase secrets
- [ ] Update database with product IDs
- [ ] Redeploy application
- [ ] Test checkout flow

## Understanding the Setup

This platform uses Stripe Connect with two types of accounts:

1. **Platform Account** (Your account)
   - Manages platform subscriptions (Creator/Professional/Enterprise plans)
   - Collects platform fees
   - This is YOUR Stripe account

2. **Connected Accounts** (Site owners' accounts)
   - Individual creator accounts that connect via OAuth
   - Handle their own product sales
   - Automated via the Connect flow in the app

This guide sets up #1 - YOUR platform account for collecting subscription fees.

## Step 1: Create New Stripe Platform Account (Live Mode)

### Option A: Brand New Stripe Account (Cleanest Approach)

1. **Create a New Stripe Account**
   - Go to https://dashboard.stripe.com/register
   - Use a NEW email address (not the one with test account)
   - Complete the registration process
   - This account will be your LIVE production account

2. **Activate Your Account**
   - Go through Stripe's verification process
   - Provide business information
   - Add bank account for payouts
   - Complete identity verification
   - Wait for approval (usually instant, can take up to 1-2 business days)

### Option B: Use Existing Stripe Account (Start Fresh)

1. **Log into Existing Stripe Account**
   - Go to https://dashboard.stripe.com
   - Use your existing account credentials

2. **Important: Ignore the Old Connect Setup**
   - Do NOT try to modify the existing test Connect account
   - We'll create fresh products and settings in LIVE mode

## Step 2: Enable Stripe Connect (Live Mode)

1. **Switch to Live Mode**
   - In Stripe Dashboard, toggle to **"LIVE"** mode (top right)
   - ⚠️ CRITICAL: Ensure toggle says "LIVE" not "TEST"

2. **Enable Connect Platform**
   - Go to **Settings** → **Connect**
   - Click **Get started with Connect**
   - Choose **Platform or marketplace**
   - Fill in:
     - **Platform name**: `CreatorApp Platform`
     - **Platform URL**: `https://www.creatorapp.us`
     - **Support email**: Your support email
   - Click **Enable Connect**

3. **Configure Connect Settings**
   - Under **Branding**, upload your logo
   - Under **Customer experience**, configure as needed
   - Save changes

## Step 3: Get Live API Keys

1. **Get Platform API Keys**
   - Still in LIVE mode
   - Go to **Developers** → **API keys**
   - You should see:
     - **Publishable key** (starts with `pk_live_`)
     - **Secret key** (starts with `sk_live_`)

2. **Copy These Keys**
   - Copy the **Publishable key** - save this as `VITE_STRIPE_PUBLISHABLE_KEY`
   - Click **Reveal test key** on Secret key, then copy - save as `STRIPE_SECRET_KEY`

⚠️ **CRITICAL**: These are your PLATFORM keys, not Connect Express account keys!

## Step 4: Create Products in Stripe (Live Mode)

⚠️ **REMINDER**: Ensure you're still in LIVE mode (check top right toggle)

These are the platform subscription products that users will purchase to access the CreatorApp platform.

### Product 1: Creator Plan

1. In Stripe Dashboard (LIVE mode), go to **Products** → Click **Add Product**
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

## Step 5: Create Beta User Discount Codes

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

## Step 6: Set Up Live Webhook

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

## Step 7: Update Environment Variables

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

## Step 8: Update Database Subscription Plans

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

## Step 9: Redeploy Application

After updating environment variables in Vercel:

1. Go to **Deployments**
2. Click the **︙** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Step 10: Test the Setup

### Test Free Trial (Use Real Card in Live Mode):

1. Go to www.creatorapp.us
2. Sign up for a new account
3. Select a plan
4. Go through checkout
5. **Use a REAL credit card** (you're in live mode now!)
   - The card will be charged $0 during trial
   - After 14 days, it will be charged the subscription amount
6. Verify subscription is created with trial period
7. **Cancel immediately after testing** to avoid charges

⚠️ **IMPORTANT**: You're in LIVE mode - test cards won't work!

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

### Cannot Enable Live Mode:
- If you're stuck in test mode with existing Connect setup
- You MUST create products in LIVE mode separately
- Test mode and Live mode are completely separate environments
- Products created in test mode won't appear in live mode

### Wrong Keys Being Used:
- Verify you copied keys while in LIVE mode
- Keys starting with `pk_test_` or `sk_test_` are TEST keys
- Keys starting with `pk_live_` or `sk_live_` are LIVE keys
- Double-check environment variables in Vercel and Supabase

### Connect vs Platform Confusion:
- You need your PLATFORM account keys (from API Keys page)
- NOT keys from a Connected Express account
- If you see "Express Dashboard" you're in the wrong place
- Use the main Stripe Dashboard → Developers → API Keys

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

✅ Live mode enabled in Stripe (toggle shows "LIVE")
✅ Stripe Connect enabled for platform
✅ Live Publishable Key added to Vercel (`pk_live_...`)
✅ Live Secret Key added to Supabase (`sk_live_...`)
✅ Live Webhook Secret added to Supabase (`whsec_...`)
✅ All test keys removed from production environment
✅ Webhook endpoint secured with signing secret
✅ Environment variables not exposed in client code
✅ Database RLS policies active
✅ Products created in LIVE mode (not test mode)
✅ All product IDs and price IDs updated in database

## Key Differences from Test Setup

| Aspect | Test Mode (Old) | Live Mode (New) |
|--------|----------------|-----------------|
| Keys | `pk_test_...` `sk_test_...` | `pk_live_...` `sk_live_...` |
| Products | Test products | New live products |
| Payments | Fake card numbers work | Real cards only |
| Money | No real charges | Real charges processed |
| Webhook | Test webhook secret | Live webhook secret |
| Connect Account | Cannot convert to live | Fresh live setup required |

## Summary of Changes

What you're replacing:
- Old test mode Stripe keys
- Test mode products
- Test webhook endpoint

What you're creating new:
- Live mode Stripe platform account
- Three live products (Creator, Professional, Enterprise)
- Each product with 14-day free trial
- BETA100 coupon (100% off forever)
- Live webhook endpoint
- All new live API keys

## Next Steps

1. ✅ Complete Stripe live setup (follow this guide)
2. ✅ Test checkout with real card (then cancel)
3. Generate beta invitation codes for the platform
4. Send invites to beta users with BETA100 code
5. Monitor first real signups
6. Collect feedback
7. Iterate on features

## Support

If you get stuck:
- Check the Troubleshooting section above
- Verify all keys are LIVE mode keys (not test)
- Ensure webhook endpoint is accessible
- Check Supabase Edge Function logs for errors
- Review Stripe Dashboard → Developers → Logs
