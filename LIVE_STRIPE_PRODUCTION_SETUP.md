# Live Stripe Production Setup Guide

## Overview
This guide walks through setting up Stripe in production with:
- Stripe business account with live API keys
- Stripe Connect platform configuration (Express accounts)
- 14-day free trials on all subscription tiers
- Beta user discount codes (100% off)
- Live payment processing

⚠️ **IMPORTANT**: Test mode and Live mode are completely separate environments. You cannot convert test data to live. You must set up everything fresh in Live mode.

## Quick Checklist

Before you start, you'll need to complete these steps in order:

- [ ] Create/Access Stripe account
- [ ] Complete business activation (identity, bank account)
- [ ] Set business name and statement descriptor
- [ ] Switch to LIVE mode
- [ ] Enable Stripe Connect (Platform with Express accounts)
- [ ] Configure platform branding
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

## IDs You'll Collect (Keep in a Text File)

As you go through this guide, you'll collect these IDs. Keep them organized:

```
# API Keys (Step 3)
Publishable Key: pk_live_...
Secret Key: sk_live_...

# Creator Plan (Step 4)
Product ID: prod_...
Monthly Price ID: price_...
Annual Price ID: price_...

# Professional Plan (Step 4)
Product ID: prod_...
Monthly Price ID: price_...
Annual Price ID: price_...

# Enterprise Plan (Step 4)
Product ID: prod_...
Monthly Price ID: price_...
Annual Price ID: price_...

# Webhook (Step 6)
Signing Secret: whsec_...
```

## Understanding the Architecture

CreatorApp uses Stripe Connect to enable a two-sided marketplace:

### 1. Platform Account (Your Stripe Account)
   - **Purpose**: Collects platform subscription fees from site owners
   - **Products**: Creator Plan ($29), Professional Plan ($99), Enterprise Plan ($299)
   - **Payment Flow**: Site owners pay YOU for platform access
   - **This Guide**: Sets up THIS account

### 2. Connected Accounts (Express Type)
   - **Purpose**: Site owners' individual Stripe accounts
   - **Products**: Their own digital products, courses, memberships
   - **Payment Flow**: Their customers pay THEM directly
   - **Setup**: Automated via OAuth flow in the app (already built)
   - **Why Express**: Balances control with simplicity - Stripe handles onboarding, compliance, and identity verification while you maintain charge flexibility

### Connect Account Types (For Reference)
- **Standard**: Lowest effort, connected accounts manage everything (not used)
- **Express**: ← **CreatorApp uses this** - Balanced control, Stripe handles compliance
- **Custom**: Highest effort, full white-label control (too complex for our needs)

## Step 1: Create and Activate Stripe Business Account

### Option A: Brand New Stripe Account (Recommended)

1. **Create a New Stripe Account**
   - Go to https://dashboard.stripe.com/register
   - Use your business email address
   - Complete the registration process
   - This account will be your LIVE production platform account

2. **Activate Your Account**
   - Stripe will guide you through activation
   - **Provide business information**:
     - Legal business name or DBA
     - Business type (Individual, Company, Non-profit)
     - Business address
     - Tax ID (EIN or SSN)
   - **Add bank account** for receiving payouts
   - **Complete identity verification** (photo ID, selfie)
   - Wait for approval (usually instant to 1-2 business days)

3. **Configure Business Settings**
   - Go to **Settings** → **Business settings** → **Public business information**
   - Set **Public business name**: `CreatorApp` (or your preferred name)
   - Set **Statement descriptor**: `CREATORAPP` (appears on customers' card statements)
   - Set **Shortened statement descriptor**: `CREATORAPP` (for mobile banking apps)
   - Add **Customer support email** and **phone number**
   - Save changes

### Option B: Use Existing Stripe Account

1. **Log into Existing Stripe Account**
   - Go to https://dashboard.stripe.com
   - Use your existing account credentials

2. **Verify Business Information**
   - Go to **Settings** → **Business settings**
   - Ensure all required information is complete
   - Verify bank account is connected
   - Update **Statement descriptor** to `CREATORAPP` if needed

3. **Important: Separate Test from Live**
   - Do NOT try to migrate test mode data to live mode
   - We'll create fresh products and settings in LIVE mode
   - Test and Live are completely independent environments

## Step 2: Enable Stripe Connect (Live Mode)

1. **Switch to Live Mode**
   - In Stripe Dashboard, look for the mode toggle in the top right
   - Toggle to **"LIVE"** mode (should show a solid indicator)
   - ⚠️ CRITICAL: Ensure it says "LIVE" not "TEST"
   - All subsequent steps MUST be done in Live mode

2. **Enable Connect Platform**
   - Go to **Settings** → **Connect** (or search "Connect" in the dashboard)
   - If you see **"Get started with Connect"**, click it
   - Choose **"Platform or marketplace"** (NOT "SaaS platform" - we handle subscriptions ourselves)
   - Select your use case: **"Marketplace"** or **"SaaS Platforms"** (either works)

3. **Configure Platform Profile**
   - Fill in the platform onboarding form:
     - **Platform name**: `CreatorApp` (or your business name)
     - **Platform URL**: `https://www.creatorapp.us` (your production domain)
     - **Support email**: Your customer support email
     - **Business description**: Brief description of your platform
   - Click **Save** or **Enable Connect**

4. **Configure Connect Branding** (Important for OAuth flow)
   - Under **Branding** section:
     - Upload your **platform logo** (appears when site owners connect)
     - Set **brand color** (optional, matches your app design)
   - Under **Customer experience**:
     - Review OAuth redirect settings (already configured in app)
   - Save all changes

5. **Verify Connect is Enabled**
   - You should now see **"Connect"** in the left navigation
   - The Connect dashboard shows "0 connected accounts" (normal for new setup)
   - Note: Site owners will connect their Express accounts via the app's OAuth flow

## Step 3: Get Live API Keys

1. **Navigate to API Keys**
   - Ensure you're still in **LIVE** mode (check toggle)
   - Go to **Developers** → **API keys** (in left sidebar)
   - You'll see two types of keys on this page

2. **Understand Key Types**
   - **Publishable key** (`pk_live_...`): Used in client-side code (safe to expose)
   - **Secret key** (`sk_live_...`): Used in server-side code (NEVER expose)

3. **Copy Your Platform Keys**
   - **Publishable key**:
     - Visible by default, starts with `pk_live_`
     - Copy this entire string
     - Save as `VITE_STRIPE_PUBLISHABLE_KEY` (for Vercel)

   - **Secret key**:
     - Click **"Reveal live key token"** or similar button
     - Copy the full key starting with `sk_live_`
     - Save as `STRIPE_SECRET_KEY` (for Supabase)
     - ⚠️ Store securely - this key has full access to your account

4. **Important: Platform Keys vs Connected Account Keys**
   - ✅ Use these platform keys from **YOUR** main Stripe dashboard
   - ❌ Do NOT use keys from a "Connected Express Account" dashboard
   - ❌ Do NOT use restricted API keys (unless you know what you're doing)
   - These keys allow your platform to charge subscription fees to site owners

## Step 4: Create Products in Stripe (Live Mode)

⚠️ **REMINDER**: Ensure you're still in LIVE mode (check top right toggle)

These are the platform subscription products that site owners will purchase to access CreatorApp. Each product will have two pricing options (monthly and annual).

### Product 1: Creator Plan

1. **Create the Product**
   - In Stripe Dashboard (LIVE mode), go to **Product catalog** or **Products** in left sidebar
   - Click **+ Add product** or **Create product**

2. **Fill in Product Details**
   - **Name**: `Creator Plan`
   - **Description**: `Perfect for getting started with your creator business`
   - **Image**: (Optional) Upload a product image

3. **Add Monthly Price**
   - Under **Pricing** or **Add pricing**:
   - **Pricing model**: `Standard pricing` (default)
   - **Price**: `29.00`
   - **Currency**: `USD`
   - **Billing period**: `Monthly` or `Recurring`
   - **Trial period**: Check **"Include free trial"** and set to **14 days**

4. **Save and Add Annual Price**
   - Click **Save product** or **Add pricing**
   - Click **Add another price** on the product page
   - **Price**: `290.00` (equivalent to ~$24.17/month)
   - **Billing period**: `Yearly` or `Every 12 months`
   - **Trial period**: **14 days**
   - Save the price

5. **Copy Important IDs**
   - On the product page, copy the **Product ID** (starts with `prod_`)
   - Copy the **Price ID** for monthly price (starts with `price_`)
   - Copy the **Price ID** for annual price (starts with `price_`)
   - Keep these in a text file for later use

### Product 2: Professional Plan

1. **Create Product**
   - Click **+ Add product**
   - **Name**: `Professional Plan`
   - **Description**: `Advanced features for growing creators`

2. **Add Monthly Price**
   - **Price**: `99.00`
   - **Currency**: `USD`
   - **Billing period**: `Monthly`
   - **Trial period**: **14 days**
   - Save

3. **Add Annual Price**
   - Click **Add another price**
   - **Price**: `990.00` (equivalent to $82.50/month)
   - **Billing period**: `Yearly`
   - **Trial period**: **14 days**
   - Save

4. **Copy IDs**
   - Copy Product ID (`prod_...`)
   - Copy both Price IDs (`price_...` for monthly and yearly)

### Product 3: Enterprise Plan

1. **Create Product**
   - Click **+ Add product**
   - **Name**: `Enterprise Plan`
   - **Description**: `Complete solution for established creator businesses`

2. **Add Monthly Price**
   - **Price**: `299.00`
   - **Currency**: `USD`
   - **Billing period**: `Monthly`
   - **Trial period**: **14 days**
   - Save

3. **Add Annual Price**
   - Click **Add another price**
   - **Price**: `2990.00` (equivalent to ~$249.17/month)
   - **Billing period**: `Yearly`
   - **Trial period**: **14 days**
   - Save

4. **Copy IDs**
   - Copy Product ID (`prod_...`)
   - Copy both Price IDs (`price_...` for monthly and yearly)

**Summary**: You should now have 3 products with 6 total price IDs (2 per product)

## Step 5: Create Beta User Discount Codes

### Create the BETA100 Coupon (100% Off Forever)

1. **Navigate to Coupons**
   - Go to **Product catalog** → **Coupons** (or search "Coupons" in dashboard)
   - Click **+ Create coupon** or **New**

2. **Configure Coupon Settings**
   - **Coupon name**: `Beta Access - 100% Off` (internal name for your reference)
   - **Coupon ID**: `BETA100` (this is what customers type at checkout)
   - **Type**: Select `Percentage discount`
   - **Percent off**: `100` (full discount)
   - **Duration**: Select `Forever` ⭐ (discount applies for the lifetime of the subscription)
   - **Applies to**: `All products` or select specific products
   - **Redeem by**: Leave blank (no expiration) or set a date
   - **Maximum redemptions**: `100` (limits to first 100 beta users)
   - **First time transaction**: (Optional) Check if you want to limit to new customers

3. **Create the Coupon**
   - Review all settings
   - Click **Create coupon**
   - ✅ The code `BETA100` is now active and can be used at checkout

### Optional: Create Additional Beta Codes

You can create multiple codes for different user groups:

| Code | Discount | Duration | Use Case |
|------|----------|----------|----------|
| `BETA100` | 100% off | Forever | First 100 beta users |
| `EARLYACCESS` | 100% off | Forever | Early access program |
| `FOUNDER` | 100% off | 12 months | Founding members (reverts to full price after 1 year) |
| `BETA50` | 50% off | Forever | Extended beta testing group |
| `LAUNCH20` | 20% off | Forever | Launch week promotion |

**To create additional codes**: Repeat the steps above with different values

## Step 6: Set Up Live Webhook

Webhooks notify your application when events happen in Stripe (like successful payments or subscription changes).

1. **Navigate to Webhooks**
   - Ensure you're in **LIVE** mode
   - Go to **Developers** → **Webhooks** (in left sidebar)
   - Click **+ Add endpoint** or **Add an endpoint**

2. **Enter Endpoint URL**
   - **Endpoint URL**:
   ```
   https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```
   - Replace `YOUR_SUPABASE_PROJECT` with your actual Supabase project reference ID
   - Example: `https://abcdefghijklmnop.supabase.co/functions/v1/stripe-webhook`

3. **Select Events to Listen To**
   - Click **Select events** or **+ Select events**
   - Search for and select these events:
     - `customer.subscription.created` - New subscription created
     - `customer.subscription.updated` - Subscription changed (plan, status, etc.)
     - `customer.subscription.deleted` - Subscription cancelled
     - `invoice.paid` - Payment succeeded
     - `invoice.payment_failed` - Payment failed
     - `checkout.session.completed` - Checkout completed successfully
   - Click **Add events**

4. **Optional Settings**
   - **Description**: `Platform subscription webhook` (for your reference)
   - **API version**: Use latest (or leave default)
   - **Events**: Verify all 6 events are selected

5. **Create Endpoint**
   - Click **Add endpoint** or **Save**
   - The endpoint is now active

6. **Copy the Signing Secret**
   - On the endpoint details page, find **Signing secret**
   - Click **Reveal** or **Click to reveal**
   - Copy the secret (starts with `whsec_`)
   - Save this securely - you'll need it for Supabase configuration
   - ⚠️ Keep this secret secure - it verifies webhook authenticity

## Step 7: Update Environment Variables

### In Vercel (Frontend Environment):

1. **Access Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your `creatorapp-platform` project (or whatever your project is named)

2. **Navigate to Environment Variables**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add/Update Frontend Variables**
   - Find `VITE_STRIPE_PUBLISHABLE_KEY` (or create new if doesn't exist)
   - Click **Edit** or **Add**
   - **Value**: Paste your `pk_live_...` key from Step 3
   - **Environment**: Select `Production` (and optionally `Preview` if you want)
   - Click **Save**

4. **Verify Variable**
   - Should show: `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_••••••••••••`
   - The key is partially hidden for security

### In Supabase (Edge Functions Secrets):

1. **Access Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project from the list

2. **Navigate to Edge Functions Secrets**
   - Click **Project Settings** (bottom left, gear icon)
   - Scroll down and click **Edge Functions**
   - Click on the **Secrets** or **Environment Variables** section

3. **Add/Update Backend Secrets**

   **Secret 1: Stripe Secret Key**
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Paste your `sk_live_...` key from Step 3
   - Click **Add** or **Update**

   **Secret 2: Webhook Signing Secret**
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste your `whsec_...` secret from Step 6
   - Click **Add** or **Update**

4. **Verify Secrets Are Set**
   - You should see both secrets listed
   - Values will be hidden for security
   - All edge functions now have access to these secrets

⚠️ **Important**: After updating Vercel variables, you MUST redeploy (see Step 9). Supabase edge function secrets are available immediately.

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

## What's New in Stripe (2025 Updates)

### Recent Changes You Should Know About

1. **Improved Dashboard UI**
   - Product catalog is now more prominent
   - Webhook management has better event filtering
   - Connect settings are more streamlined

2. **Express Accounts Still Recommended**
   - Express accounts remain the best balance for platforms
   - Stripe handles compliance and identity verification automatically
   - Connected accounts get access to Express Dashboard (lighter version)

3. **API Version Compatibility**
   - Current setup works with all recent Stripe API versions
   - Webhooks automatically use your account's default API version
   - No breaking changes for Connect Express accounts

4. **Enhanced Security**
   - Stripe now has better fraud detection built-in
   - 3D Secure (SCA) is automatically handled for European cards
   - No changes needed to your integration

### Features Already Built Into CreatorApp

✅ **Stripe Connect OAuth flow** - Site owners connect via Express accounts
✅ **Platform subscriptions** - Three-tier pricing with trials
✅ **Webhook handling** - Automatic subscription status updates
✅ **Invoice management** - Automated billing and retries
✅ **Customer portal** - Users can manage their own subscriptions
✅ **Promo code support** - Beta codes and discounts work automatically

## Support

If you get stuck:
- Check the Troubleshooting section above
- Verify all keys are LIVE mode keys (not test)
- Ensure webhook endpoint is accessible
- Check Supabase Edge Function logs for errors
- Review Stripe Dashboard → Developers → Logs
- Consult Stripe documentation: https://docs.stripe.com
- Test webhook endpoint manually: https://dashboard.stripe.com/test/webhooks
