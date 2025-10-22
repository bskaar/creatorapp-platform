# Stripe Configuration Guide for CreatorApp

This guide will walk you through setting up Stripe to work with CreatorApp's dual payment system:
1. **Platform Subscriptions** - Site owners paying for CreatorApp plans
2. **Stripe Connect** - Site owners receiving payments from their customers

---

## Part 1: Platform Subscription Setup (Your Stripe Account)

### Step 1: Create a Stripe Account (if you don't have one)

1. Go to https://dashboard.stripe.com/register
2. Create your account with email and password
3. Complete business information
4. Note: You can use **Test Mode** for development (recommended to start)

### Step 2: Create Subscription Products

Navigate to: **Products** → **Add Product** (or https://dashboard.stripe.com/products/create)

Create these 4 products:

#### Product 1: Starter Plan
- **Name**: `CreatorApp Starter`
- **Description**: `For solo creators and side hustlers - 1 product, 1 funnel, 2,500 contacts`
- **Pricing**:
  - Skip pricing (this is free tier, no Stripe product needed)
  - Or set to $0.00 if you want to track it
- **Save** this product

#### Product 2: Growth Plan
- **Name**: `CreatorApp Growth`
- **Description**: `Best for growing creators - Unlimited products, 5 funnels, 10K contacts`
- **Pricing**:
  - Click **Add pricing**
  - Model: `Recurring`
  - Price: `$99.00`
  - Billing period: `Monthly`
  - Currency: `USD`
- **Save** this product
- **COPY the Price ID** (looks like `price_xxxxxxxxxxxxx`)

#### Product 3: Pro Plan
- **Name**: `CreatorApp Pro`
- **Description**: `For scaling businesses - Unlimited products & funnels, 50K contacts, 10 team members`
- **Pricing**:
  - Click **Add pricing**
  - Model: `Recurring`
  - Price: `$199.00`
  - Billing period: `Monthly`
  - Currency: `USD`
- **Save** this product
- **COPY the Price ID** (looks like `price_xxxxxxxxxxxxx`)

#### Product 4: Enterprise Plan
- **Name**: `CreatorApp Enterprise`
- **Description**: `Custom pricing for agencies and high-volume enterprises`
- **Pricing**:
  - Skip pricing (handled via custom quotes)
  - Or set to $0.00 as placeholder
- **Save** this product

### Step 3: Update Database with Stripe Price IDs

After creating the products, you need to update your database with the Price IDs.

Run this SQL in your Supabase SQL Editor:

```sql
-- Update Growth plan with your Stripe Price ID
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_xxxxxxxxxxxxx',  -- Replace with your Product ID
  stripe_price_id = 'price_xxxxxxxxxxxxx'    -- Replace with your Price ID (from Step 2)
WHERE name = 'growth';

-- Update Pro plan with your Stripe Price ID
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_xxxxxxxxxxxxx',  -- Replace with your Product ID
  stripe_price_id = 'price_xxxxxxxxxxxxx'    -- Replace with your Price ID (from Step 2)
WHERE name = 'pro';
```

**To find your Product and Price IDs:**
1. Go to https://dashboard.stripe.com/products
2. Click on the product
3. Product ID is at the top (starts with `prod_`)
4. Price ID is in the Pricing section (starts with `price_`)

### Step 4: Get Your Stripe API Keys

1. Go to: https://dashboard.stripe.com/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`) - Click "Reveal test key"

3. **IMPORTANT**: Start with **Test Mode** keys (toggle at top right)

4. Copy the **Secret Key** (`sk_test_...`)

### Step 5: Add Stripe Secret Key to Supabase

Your Stripe Secret Key needs to be added as an environment variable in Supabase:

1. Go to your Supabase Project: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt
2. Click **Settings** (bottom left)
3. Click **Edge Functions** under Configuration
4. Scroll to **Secrets**
5. Add a new secret:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your secret key from Step 4 (e.g., `sk_test_51ABC...`)
6. Click **Create secret**

**Note**: The other environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, etc.) are already configured automatically.

---

## Part 2: Stripe Webhook Configuration

Webhooks allow Stripe to notify your app when subscription events happen (payment succeeded, subscription canceled, etc.)

### Step 6: Add Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook
   ```
4. Under **Events to send**, click **Select events**
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `account.updated` (for Stripe Connect)
6. Click **Add endpoint**

### Step 7: Add Webhook Signing Secret

After creating the webhook endpoint:

1. Click on your newly created webhook endpoint
2. Under **Signing secret**, click **Reveal**
3. Copy the signing secret (starts with `whsec_`)
4. Add it to Supabase:
   - Go to **Settings** → **Edge Functions** → **Secrets**
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: Your webhook signing secret
   - Click **Create secret**

---

## Part 3: Stripe Connect Setup (For Creator Payments)

Stripe Connect allows your users (site owners) to receive payments directly.

### Step 8: Enable Stripe Connect

1. Go to: https://dashboard.stripe.com/connect/accounts/overview
2. Click **Get started** (if first time)
3. Choose **Platform or marketplace**
4. Complete the Connect onboarding questionnaire
5. Enable **Express** account type (recommended for ease of use)

### Step 9: Configure Connect Settings

1. Go to: https://dashboard.stripe.com/settings/connect
2. Under **Connect settings**:
   - **Branding**: Upload your CreatorApp logo
   - **Brand color**: Choose your brand color (e.g., `#2563eb` for blue)
3. Under **Integration**:
   - Enable **OAuth for Express**
4. Configure **OAuth settings**:
   - **Redirect URL**: `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-connect-oauth`
5. Save changes

### Step 10: Get Connect Client ID

1. Still in Connect settings
2. Scroll to **OAuth settings**
3. Copy your **Client ID** (starts with `ca_`)
4. Add it to Supabase:
   - Go to **Settings** → **Edge Functions** → **Secrets**
   - Name: `STRIPE_CONNECT_CLIENT_ID`
   - Value: Your Connect client ID
   - Click **Create secret**

---

## Part 4: Testing Your Setup

### Step 11: Test Platform Subscription

1. Start your development server
2. Navigate to `/pricing`
3. Click **Start Free Trial** on Growth plan
4. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. Complete checkout
6. Verify subscription appears in:
   - Stripe Dashboard → Subscriptions
   - CreatorApp Settings → Subscription tab
   - Database `sites` table (platform_subscription_status = 'trialing' or 'active')

### Step 12: Test Stripe Connect Flow

1. In CreatorApp, go to **Settings** → **Payment**
2. Click **Connect with Stripe**
3. Complete the Express onboarding flow
4. Verify connection appears in:
   - Stripe Dashboard → Connect → Accounts
   - Database `sites` table (stripe_connect_account_id populated)

### Step 13: Test Customer Checkout (Connect Payment)

1. Create a test product in CreatorApp
2. Navigate to the product page
3. Click "Buy Now" or trigger checkout
4. Use test card `4242 4242 4242 4242`
5. Complete checkout
6. Verify order in:
   - Stripe Dashboard → Payments (should show in Connected Account)
   - Database `orders` table (payment_status = 'completed')

---

## Part 5: Going Live (When Ready)

### Step 14: Switch to Live Mode

**In Stripe Dashboard:**

1. Toggle from **Test Mode** to **Live Mode** (top right)
2. Repeat Steps 2-3 to create live products
3. Get your **Live API Keys** from https://dashboard.stripe.com/apikeys
4. Update Supabase secret `STRIPE_SECRET_KEY` with live key (`sk_live_...`)
5. Create new webhook endpoint for live mode (Step 6-7)
6. Update webhook secret in Supabase
7. Get live Connect Client ID and update Supabase secret

**Business Verification:**
- Stripe will require business verification for live mode
- Prepare: Business details, bank account, tax ID
- Complete verification at https://dashboard.stripe.com/settings/public

---

## Summary of Required Stripe Secrets in Supabase

After completing all steps, you should have these secrets configured in Supabase:

| Secret Name | Example Value | Where to Find |
|------------|---------------|---------------|
| `STRIPE_SECRET_KEY` | `sk_test_51ABC...` | Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xyz...` | Dashboard → Webhooks → [Your endpoint] |
| `STRIPE_CONNECT_CLIENT_ID` | `ca_ABC...` | Dashboard → Connect → Settings |

---

## Troubleshooting

### Subscription checkout fails
- Verify `stripe_price_id` is set in database for the plan
- Check Supabase Edge Function logs for errors
- Verify `STRIPE_SECRET_KEY` is set correctly

### Webhook not triggering
- Verify webhook URL is correct
- Check webhook signing secret is set
- View webhook delivery attempts in Stripe Dashboard

### Connect flow not working
- Verify `STRIPE_CONNECT_CLIENT_ID` is set
- Check redirect URL matches exactly in Connect settings
- Ensure Connect is enabled in your Stripe account

### Test Mode vs Live Mode
- Always test in Test Mode first
- Test and Live mode have separate products, keys, and webhooks
- You'll need to configure both environments separately

---

## Quick Reference: Stripe Dashboard URLs

- **API Keys**: https://dashboard.stripe.com/apikeys
- **Products**: https://dashboard.stripe.com/products
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Connect**: https://dashboard.stripe.com/connect
- **Connect Settings**: https://dashboard.stripe.com/settings/connect

---

## Need Help?

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check Stripe webhook delivery logs
3. Verify all secrets are set correctly in Supabase
4. Ensure you're using Test Mode for development

Your current Supabase project:
- **URL**: https://yhofzxqopjvrfufouqzt.supabase.co
- **Project**: yhofzxqopjvrfufouqzt
