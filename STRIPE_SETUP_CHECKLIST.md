# Stripe Setup Checklist for CreatorApp

Use this checklist to ensure you've completed all necessary Stripe configuration.

## ✅ Part 1: Stripe Account Setup

- [ ] Create or log into Stripe account at https://dashboard.stripe.com
- [ ] Switch to **Test Mode** (toggle in top right)
- [ ] Note your account is in test mode

## ✅ Part 2: Create Subscription Products

Go to: https://dashboard.stripe.com/products

- [ ] Create **Growth Plan** product
  - Price: $99.00/month
  - Copy Product ID (prod_xxx)
  - Copy Price ID (price_xxx)

- [ ] Create **Pro Plan** product
  - Price: $199.00/month
  - Copy Product ID (prod_xxx)
  - Copy Price ID (price_xxx)

## ✅ Part 3: Update Database with Stripe IDs

In Supabase SQL Editor (https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/sql/new):

```sql
-- Update with YOUR actual IDs from Step 2
UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE name = 'growth';

UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE name = 'pro';
```

- [ ] Growth plan `stripe_price_id` updated
- [ ] Pro plan `stripe_price_id` updated
- [ ] Verify with: `SELECT name, stripe_price_id FROM subscription_plans;`

## ✅ Part 4: Add Stripe Secret Key to Supabase

1. Get your key: https://dashboard.stripe.com/apikeys
2. Add to Supabase: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions

- [ ] Copy Secret Key (sk_test_xxx)
- [ ] Add to Supabase Secrets:
  - Name: `STRIPE_SECRET_KEY`
  - Value: `sk_test_51ABC...`

## ✅ Part 5: Configure Webhook

Go to: https://dashboard.stripe.com/webhooks

- [ ] Click **Add endpoint**
- [ ] Endpoint URL: `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook`
- [ ] Select these events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `account.updated`
- [ ] Click **Add endpoint**
- [ ] Copy webhook signing secret (whsec_xxx)
- [ ] Add to Supabase Secrets:
  - Name: `STRIPE_WEBHOOK_SECRET`
  - Value: `whsec_xxx`

## ✅ Part 6: Enable Stripe Connect

Go to: https://dashboard.stripe.com/connect/accounts/overview

- [ ] Click **Get started**
- [ ] Choose **Platform or marketplace**
- [ ] Complete onboarding questionnaire
- [ ] Enable **Express** account type

## ✅ Part 7: Configure Connect Settings

Go to: https://dashboard.stripe.com/settings/connect

- [ ] Upload brand logo (optional)
- [ ] Set brand color (optional)
- [ ] Enable **OAuth for Express**
- [ ] Add Redirect URL: `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-connect-oauth`
- [ ] Save settings
- [ ] Copy Connect Client ID (ca_xxx)
- [ ] Add to Supabase Secrets:
  - Name: `STRIPE_CONNECT_CLIENT_ID`
  - Value: `ca_xxx`

## ✅ Part 8: Verify Supabase Secrets

Check all secrets are set: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions

You should have:
- [ ] `STRIPE_SECRET_KEY` = `sk_test_51...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- [ ] `STRIPE_CONNECT_CLIENT_ID` = `ca_...`

## ✅ Part 9: Test Everything

### Test Platform Subscription:
- [ ] Go to `/pricing` in your app
- [ ] Click "Start Free Trial" on Growth plan
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify in Stripe Dashboard → Subscriptions
- [ ] Verify in app Settings → Subscription tab

### Test Stripe Connect:
- [ ] Go to Settings → Payment
- [ ] Click "Connect with Stripe"
- [ ] Complete Express onboarding
- [ ] Verify connection in Stripe Dashboard → Connect

### Test Customer Payment:
- [ ] Create a test product
- [ ] Try to purchase it
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Verify payment in Stripe Dashboard

## 🎉 Setup Complete!

Once all items are checked, your Stripe integration is fully configured and ready for testing.

---

## 🚀 Going Live (Later)

When ready to accept real payments:

- [ ] Complete Stripe business verification
- [ ] Switch to Live Mode in Stripe
- [ ] Create live products (repeat Part 2)
- [ ] Get live API keys (repeat Part 4)
- [ ] Create live webhook (repeat Part 5)
- [ ] Update all Supabase secrets with live values
- [ ] Test with real card before announcing

---

## Quick Links

- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Project: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt
- API Keys: https://dashboard.stripe.com/apikeys
- Webhooks: https://dashboard.stripe.com/webhooks
- Connect: https://dashboard.stripe.com/connect/accounts/overview

---

## Test Card Numbers

For testing different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 9995` | Declined card |
| `4000 0000 0000 0002` | Declined - expired card |

Use any future expiry date, any CVC, any ZIP code.
