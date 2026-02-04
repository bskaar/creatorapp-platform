# Stripe Products Setup Guide

## Overview
This guide walks you through creating the three subscription products in your Stripe account to match your CreatorApp pricing structure.

## Prerequisites
- ✅ Stripe account created for CreatorApp
- ✅ Publishable and Secret keys available
- ✅ Database updated with new pricing structure

## Products to Create

### 1. Starter Plan - $49/month
**Product Details:**
- **Name**: `Starter`
- **Description**: `For first-time creators getting started`
- **Pricing**:
  - Price: `$49.00 USD`
  - Billing period: `Monthly`
  - Billing type: `Recurring`
- **Features** (add in description or metadata):
  - 3 products
  - 3 funnels
  - 1 admin user
  - Up to 2,500 contacts
  - 3 workflows (basic automations)
  - AI site + funnel + email generation
  - 14-day free trial

### 2. Growth Plan - $99/month (MOST POPULAR)
**Product Details:**
- **Name**: `Growth`
- **Description**: `Best for serious creators scaling their business`
- **Pricing**:
  - Price: `$99.00 USD`
  - Billing period: `Monthly`
  - Billing type: `Recurring`
- **Features**:
  - 50 products
  - 10 funnels
  - 3 admin users
  - Up to 10,000 contacts
  - Unlimited workflows (advanced logic)
  - AI optimization + predictive modeling
  - 14-day free trial

### 3. Pro Plan - $199/month
**Product Details:**
- **Name**: `Pro`
- **Description**: `For scaling businesses and teams`
- **Pricing**:
  - Price: `$199.00 USD`
  - Billing period: `Monthly`
  - Billing type: `Recurring`
- **Features**:
  - Unlimited products
  - Unlimited funnels
  - 10 admin users
  - Up to 50,000 contacts
  - Unlimited workflows (advanced + AI logic)
  - Predictive AI LTV modeling
  - 14-day free trial

## Step-by-Step Instructions

### For Each Product (Starter, Growth, Pro):

#### Step 1: Create the Product
1. Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
2. Click **"Add product"**
3. Enter the product name (e.g., "Starter")
4. Enter the description
5. **Important**: Do NOT click "Save product" yet

#### Step 2: Set Up Pricing
1. In the "Pricing" section:
   - **Pricing model**: Standard pricing
   - **Price**: Enter the amount (e.g., 49.00)
   - **Billing period**: Monthly
   - **Currency**: USD

2. **Free trial settings**:
   - Look for "Free trial" or "Trial period" option
   - Set trial length to **14 days**
   - This allows customers to try before they're charged

#### Step 3: Save and Copy IDs
1. Click **"Save product"**
2. You'll see two important IDs on the product page:
   - **Product ID** (starts with `prod_...`)
   - **Price ID** (starts with `price_...`)
3. **COPY BOTH IDs** - you'll need them for the next step

#### Step 4: Repeat for All Plans
- Create the Growth plan ($99/month)
- Create the Pro plan ($199/month)
- Note: Don't create Enterprise - it's custom pricing handled separately

## After Creating All Products

### Update Your Environment Variables

Add your new Stripe keys to `.env`:

```env
# Platform Stripe Keys (CreatorApp account)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...your_publishable_key...
STRIPE_SECRET_KEY=sk_live_...your_secret_key...

# Stripe Product IDs (copy from Stripe dashboard)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

### Update Database with Stripe IDs

Once you have all the Product and Price IDs, run this SQL in Supabase:

```sql
-- Update Starter plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_XXXXX',  -- Your Starter product ID
  stripe_price_id = 'price_XXXXX',   -- Your Starter price ID
  updated_at = now()
WHERE name = 'starter';

-- Update Growth plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_YYYYY',  -- Your Growth product ID
  stripe_price_id = 'price_YYYYY',   -- Your Growth price ID
  updated_at = now()
WHERE name = 'growth';

-- Update Pro plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_ZZZZZ',  -- Your Pro product ID
  stripe_price_id = 'price_ZZZZZ',   -- Your Pro price ID
  updated_at = now()
WHERE name = 'pro';
```

## Important Notes

### Free Trial Setup
- The 14-day free trial is configured at the product level in Stripe
- When users subscribe, they won't be charged for 14 days
- Make sure to enable trial periods in your Stripe settings

### Testing in Test Mode
Before going live:
1. Switch Stripe dashboard to **Test mode**
2. Create test versions of all products
3. Use test keys (pk_test_... and sk_test_...)
4. Test the entire subscription flow
5. Only switch to live mode when ready

### Webhook Configuration
After products are created, you'll need to set up webhooks:
1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`

## Pricing Summary

| Plan | Price | Trial | Products | Funnels | Contacts | Team |
|------|-------|-------|----------|---------|----------|------|
| **Starter** | $49/mo | 14 days | 3 | 3 | 2,500 | 1 |
| **Growth** | $99/mo | 14 days | 50 | 10 | 10,000 | 3 |
| **Pro** | $199/mo | 14 days | Unlimited | Unlimited | 50,000 | 10 |
| **Enterprise** | Custom | Custom | Unlimited | Unlimited | Unlimited | Unlimited |

## Next Steps

After completing this setup:
1. ✅ Test subscription flow in test mode
2. ✅ Configure webhook endpoint
3. ✅ Test payment with test card (4242 4242 4242 4242)
4. ✅ Verify trial period works correctly
5. ✅ Switch to live mode when ready
6. ✅ Update production environment variables

## Support

If you encounter issues:
- Check Stripe logs in dashboard
- Verify all IDs are copied correctly
- Ensure webhook is receiving events
- Check Supabase edge function logs
