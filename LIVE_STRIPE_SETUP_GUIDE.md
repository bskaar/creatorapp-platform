# Live Stripe Account Setup Guide

This guide walks through creating a NEW Stripe account for live/production mode.

## Why a New Account?

- Your current Stripe Connect account is stuck in test mode
- Live mode requires a fully verified business account
- Platform accounts need proper business verification
- Separate accounts keep test and production isolated

---

## Step-by-Step Setup Process

### Step 1: Create New Stripe Account

1. **Go to** https://dashboard.stripe.com/register
2. **Sign up** with your business email
3. **Choose account type:**
   - If you have a business: Select "Company"
   - If you're a sole proprietor: Select "Individual"

### Step 2: Complete Business Information

Navigate to: **Settings** → **Business details**

#### For Companies:
- Legal business name
- Business type (LLC, Corporation, etc.)
- Tax ID (EIN)
- Business address
- Website: `https://creatorapp.us`
- Business description: "SaaS platform for content creators to build websites, sell products, and manage customers"
- Product description: "Website builder and e-commerce platform"

#### For Individuals:
- Legal name
- SSN (US) or tax ID
- Date of birth
- Personal address
- Website: `https://creatorapp.us`

### Step 3: Add Bank Account

1. Go to **Settings** → **Bank accounts and scheduling**
2. Click **Add bank account**
3. Enter your bank account details for payouts
4. Verify with micro-deposits (2-3 days)

### Step 4: Enable Live Mode Checklist

Stripe will provide a checklist. Complete:
- ✅ Business details
- ✅ Bank account
- ✅ Identity verification (may require documents)
- ✅ Review and accept terms

**Verification Time:** 1-3 business days (sometimes instant)

---

## Step 5: Create Live Products

**IMPORTANT:** Only do this AFTER your account is activated and you can toggle to live mode.

Once activated:

1. **Toggle to Live Mode** (top-right corner, switch off "Test mode")
2. Navigate to **Products** → **Add Product**

### Product 1: Growth Plan
- **Name:** CreatorApp Growth
- **Description:** Best for growing creators - Unlimited products, 5 funnels, 10K contacts
- **Pricing:**
  - Click **Add pricing**
  - Model: `Recurring`
  - Price: `$99.00 USD`
  - Billing period: `Monthly`
- **Save** and copy the **Price ID** (starts with `price_live_...`)

### Product 2: Pro Plan
- **Name:** CreatorApp Pro
- **Description:** For scaling businesses - Unlimited products & funnels, 50K contacts, 10 team members
- **Pricing:**
  - Model: `Recurring`
  - Price: `$199.00 USD`
  - Billing period: `Monthly`
- **Save** and copy the **Price ID** (starts with `price_live_...`)

---

## Step 6: Get Live API Keys

1. **Go to:** https://dashboard.stripe.com/apikeys
2. **Ensure** you're in **Live Mode** (toggle should be OFF/gray)
3. **Copy:**
   - **Publishable key:** `pk_live_...` (for frontend)
   - **Secret key:** `sk_live_...` (click "Reveal" then copy)

---

## Step 7: Configure Live Webhooks

### Webhook Configuration (After Publishing to CreatorApp.us)

**WAIT until site is published to configure these!**

1. Go to: https://dashboard.stripe.com/webhooks (in Live Mode)
2. Click **Add endpoint**
3. Endpoint URL:
   ```
   https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook
   ```
   OR (if using custom domain):
   ```
   https://api.creatorapp.us/functions/v1/stripe-webhook
   ```

4. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `account.updated`

5. Click **Add endpoint**
6. Copy **Signing Secret** (`whsec_...`)

---

## Step 8: Enable Stripe Connect for Live Mode

### 8.1 Enable Connect

1. Go to: https://dashboard.stripe.com/connect/accounts/overview
2. Ensure you're in **Live Mode**
3. Click **Get started** (if not already done)
4. Choose: **Platform or marketplace**
5. Complete questionnaire:
   - Business type: SaaS Platform
   - Will you charge on behalf of users? **Yes**
   - Account type: **Express** (recommended)

### 8.2 Configure Connect Settings

1. Go to: https://dashboard.stripe.com/settings/connect
2. **Branding** (optional):
   - Upload CreatorApp logo
   - Brand color: `#2563eb` or your brand color

3. **OAuth Settings:**
   - Enable **OAuth for Express**
   - **Redirect URI:**
     ```
     https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-connect-oauth
     ```
     OR (if custom domain):
     ```
     https://api.creatorapp.us/functions/v1/stripe-connect-oauth
     ```

4. **Save** settings
5. Copy **Client ID** (starts with `ca_...`)

---

## Step 9: Update Supabase Environment Variables

**CRITICAL:** Use a separate set of secrets for production!

Go to: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions

### Option A: Override Test Secrets (Not Recommended)
Replace existing secrets with live values - affects development

### Option B: Use Separate Secrets (Recommended)
Create new secrets with `_LIVE` suffix:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `STRIPE_SECRET_KEY_LIVE` | `sk_live_51...` | Step 6 |
| `STRIPE_WEBHOOK_SECRET_LIVE` | `whsec_...` | Step 7 |
| `STRIPE_CONNECT_CLIENT_ID_LIVE` | `ca_...` | Step 8 |

Then update Edge Functions to check environment and use appropriate key.

---

## Step 10: Update Database with Live Price IDs

After creating live products, update the database:

```sql
-- Update Growth plan with LIVE Stripe Price ID
UPDATE subscription_plans
SET stripe_price_id = 'price_live_xxxxxxxxxxxxx'  -- Your LIVE price ID from Step 5
WHERE name = 'growth';

-- Update Pro plan with LIVE Stripe Price ID
UPDATE subscription_plans
SET stripe_price_id = 'price_live_xxxxxxxxxxxxx'  -- Your LIVE price ID from Step 5
WHERE name = 'pro';
```

---

## Step 11: Testing Live Mode

### Test Platform Subscription (Real Card Required!)

**WARNING:** This will charge a real card!

1. Go to your published site: `https://creatorapp.us/pricing`
2. Click **Start Free Trial** on Growth plan
3. Use a **real credit card** (test cards won't work)
4. Complete checkout
5. Verify in Stripe Dashboard → Customers & Subscriptions

### Test Stripe Connect

1. Go to Settings → Payment
2. Click **Connect with Stripe**
3. Complete Express onboarding with real business info
4. Verify in Stripe Dashboard → Connect → Accounts

---

## Important Notes

### Test vs Live Mode

| Aspect | Test Mode | Live Mode |
|--------|-----------|-----------|
| API Keys | `sk_test_...` | `sk_live_...` |
| Products | Separate test products | Separate live products |
| Webhooks | Separate test webhooks | Separate live webhooks |
| Payments | Fake test cards | Real credit cards |
| Verification | Not required | Business verification required |

### Security Best Practices

1. **NEVER** commit live API keys to git
2. **NEVER** expose secret keys in frontend code
3. **ALWAYS** use environment variables
4. **TEST** thoroughly in test mode first
5. **VERIFY** all webhooks are working before going live

### Common Issues

**"Account not activated"**
- Complete business verification
- Wait for Stripe approval (1-3 days)
- Check email for verification requests

**"Invalid API key"**
- Verify you're using live key (`sk_live_...`)
- Check key is correctly set in Supabase secrets
- Ensure no extra spaces when copying

**"Webhook signature verification failed"**
- Verify webhook secret matches
- Check endpoint URL is correct
- Ensure webhook is in live mode

---

## Quick Reference

### Stripe Dashboard URLs (Live Mode)
- API Keys: https://dashboard.stripe.com/apikeys
- Products: https://dashboard.stripe.com/products
- Webhooks: https://dashboard.stripe.com/webhooks
- Connect: https://dashboard.stripe.com/connect
- Settings: https://dashboard.stripe.com/settings/account

### Supabase URLs
- Project Dashboard: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt
- Edge Functions: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions
- SQL Editor: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/sql

---

## Next Steps

After completing this guide:

1. ✅ Verify account is fully activated
2. ✅ Test a small live transaction ($1)
3. ✅ Monitor Stripe Dashboard for any issues
4. ✅ Set up fraud prevention (Radar)
5. ✅ Configure email receipts
6. ✅ Review payout schedule

---

## Need Help?

If you encounter issues:
- Check Stripe Dashboard → Logs
- Check Supabase Edge Function logs
- Verify all secrets are set correctly
- Ensure you're in Live Mode throughout
- Contact Stripe Support if account verification is delayed
