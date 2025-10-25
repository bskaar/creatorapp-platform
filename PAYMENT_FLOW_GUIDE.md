# Payment Flow Testing Guide

## Current Status

### ✅ What's Fixed
1. **Infinite recursion errors** - All RLS policy circular dependencies resolved
2. **Subscription plans table** - Created with starter, growth, and pro plans
3. **User signup flow** - Works from pricing page through account creation
4. **Error handling** - Better error messages when Stripe isn't configured

### ⚠️ What Needs Setup: Stripe Integration

The blank screen issue is now fixed. The app will show a proper error message saying **"Stripe is not configured"** instead of a blank screen.

## Testing the Flow Now

### Step 1: Create a Test User
1. Go to `/pricing`
2. Click "Start Free Trial" on Growth plan
3. Fill out the signup form:
   - Email: `test1@example.com`
   - Password: `testpass123`
   - Full Name: `Test User`
   - Site Name: `Test Site`
4. Click "Create Account"

### Step 2: See Subscription Selection Page
After signup, you'll be redirected to `/subscription-select` with:
- Growth plan pre-selected and highlighted with "SELECTED" badge
- "Start Free Trial" buttons for all plans
- **ERROR MESSAGE about Stripe not being configured** (if Stripe isn't set up yet)

### Step 3: Configure Stripe (Required for Payment Flow)

The error message will show: **"Stripe is not configured. Please set up Stripe first"** with a link to setup instructions.

To enable the Stripe payment flow, you need to:

#### Quick Stripe Setup Steps:
1. **Create Stripe account** at https://dashboard.stripe.com/register (use Test Mode)
2. **Get your Secret Key** from https://dashboard.stripe.com/apikeys
3. **Create subscription products** in Stripe Dashboard:
   - Growth Plan: $99/month recurring → Copy the **Price ID**
   - Pro Plan: $199/month recurring → Copy the **Price ID**
4. **Add to Supabase Edge Function secrets** (via Supabase Dashboard):
   - `STRIPE_SECRET_KEY` = your secret key
5. **Update subscription plans** with Stripe Price IDs:

```sql
UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx',
    stripe_product_id = 'prod_xxxxxxxxxxxxx'
WHERE name = 'growth';

UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx',
    stripe_product_id = 'prod_xxxxxxxxxxxxx'
WHERE name = 'pro';
```

## Once Stripe is Configured

The complete flow will work like this:

1. **Pricing Page** (`/pricing`) → Click "Start Free Trial" for Growth
2. **Signup** (`/signup?plan=growth`) → Create account and site
3. **Subscription Select** (`/subscription-select?plan=growth`) → Plan pre-selected
4. **Click "Start Free Trial"** → Calls Edge Function
5. **Stripe Checkout** → Redirects to Stripe hosted checkout page
6. **Enter payment details** → 14-day free trial (no charge today)
7. **Success redirect** → Back to `/dashboard?subscription=success`

## Alternative: Skip Payment Setup

Users can click **"Skip for now, explore the dashboard"** at the bottom of the subscription page to:
- Bypass payment setup
- Go directly to dashboard
- Use the app without a paid subscription (limited features)

## Useful SQL Commands

```sql
-- View all users
SELECT email, created_at FROM auth.users ORDER BY created_at DESC;

-- View all sites with subscription info
SELECT
  s.name as site_name,
  u.email as owner_email,
  s.tier,
  sp.display_name as plan,
  s.platform_subscription_status as status
FROM sites s
JOIN auth.users u ON u.id = s.owner_id
LEFT JOIN subscription_plans sp ON sp.id = s.platform_subscription_plan_id;

-- View subscription plans
SELECT name, display_name, price_monthly, stripe_price_id, is_active
FROM subscription_plans
WHERE is_active = true
ORDER BY price_monthly;

-- Delete test user (cascades to sites, etc.)
DELETE FROM auth.users WHERE email = 'test1@example.com';
```

## Summary

**What works now:**
- ✅ Pricing page with plan selection
- ✅ Signup with plan parameter tracking
- ✅ Subscription selection page with pre-selected plan
- ✅ Error handling and user feedback
- ✅ All database tables and policies

**What requires setup:**
- ⚠️ Stripe account and API keys
- ⚠️ Stripe products and price IDs
- ⚠️ Supabase secrets configuration

**After Stripe setup:**
- The "Start Free Trial" button will redirect to Stripe Checkout
- Users can enter payment details for 14-day trial
- After payment, they return to the dashboard

See **STRIPE_SETUP_GUIDE.md** for detailed Stripe configuration instructions.
