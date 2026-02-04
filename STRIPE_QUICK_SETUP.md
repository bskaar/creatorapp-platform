# Quick Setup: Create Stripe Products

## 🎯 Your Action Items

You need to create **3 products** in Stripe. Here's the exact information to use:

---

## 📦 Product 1: Starter

### Create Product
1. Go to: https://dashboard.stripe.com/products
2. Click **"Add product"**
3. Fill in:
   - **Name**: `Starter`
   - **Description**: `For first-time creators getting started`

### Add Pricing
4. In the Pricing section:
   - **Price**: `49.00` USD
   - **Billing period**: `Monthly`
   - **Recurring**: Yes
   - **Free trial**: `14 days`

5. Click **"Save product"**
6. **COPY** both IDs that appear:
   - Product ID: `prod_XXXXX`
   - Price ID: `price_XXXXX`

---

## 📦 Product 2: Growth (MOST POPULAR)

### Create Product
1. Click **"Add product"** again
2. Fill in:
   - **Name**: `Growth`
   - **Description**: `Best for serious creators scaling their business`

### Add Pricing
3. In the Pricing section:
   - **Price**: `99.00` USD
   - **Billing period**: `Monthly`
   - **Recurring**: Yes
   - **Free trial**: `14 days`

4. Click **"Save product"**
5. **COPY** both IDs:
   - Product ID: `prod_YYYYY`
   - Price ID: `price_YYYYY`

---

## 📦 Product 3: Pro

### Create Product
1. Click **"Add product"** again
2. Fill in:
   - **Name**: `Pro`
   - **Description**: `For scaling businesses and teams`

### Add Pricing
3. In the Pricing section:
   - **Price**: `199.00` USD
   - **Billing period**: `Monthly`
   - **Recurring**: Yes
   - **Free trial**: `14 days`

4. Click **"Save product"**
5. **COPY** both IDs:
   - Product ID: `prod_ZZZZZ`
   - Price ID: `price_ZZZZZ`

---

## ✅ After Creating All 3 Products

### Step 1: Add Keys to .env File

Add these lines to your `.env` file:

```env
# Platform Stripe Keys (from your Stripe Dashboard)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# Stripe Price IDs (from the products you just created)
STRIPE_STARTER_PRICE_ID=price_XXXXX
STRIPE_GROWTH_PRICE_ID=price_YYYYY
STRIPE_PRO_PRICE_ID=price_ZZZZZ
```

### Step 2: Update Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Update Starter plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_XXXXX',  -- Paste your Starter product ID here
  stripe_price_id = 'price_XXXXX',   -- Paste your Starter price ID here
  updated_at = now()
WHERE name = 'starter';

-- Update Growth plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_YYYYY',  -- Paste your Growth product ID here
  stripe_price_id = 'price_YYYYY',   -- Paste your Growth price ID here
  updated_at = now()
WHERE name = 'growth';

-- Update Pro plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_ZZZZZ',  -- Paste your Pro product ID here
  stripe_price_id = 'price_ZZZZZ',   -- Paste your Pro price ID here
  updated_at = now()
WHERE name = 'pro';
```

---

## 🎯 Summary

**What you're creating:**
- ✅ Starter: $49/month (14-day trial)
- ✅ Growth: $99/month (14-day trial) - MOST POPULAR
- ✅ Pro: $199/month (14-day trial)

**What you need to copy:**
- 6 IDs total (Product ID + Price ID for each of the 3 plans)
- Your Stripe Publishable Key
- Your Stripe Secret Key

**Time needed:**
- ~5-10 minutes to create all 3 products

---

## 🆘 Need Help?

Common issues:
- **Can't find Product ID**: It's on the product detail page after saving, starts with `prod_`
- **Can't find Price ID**: Right below Product ID, starts with `price_`
- **Free trial not showing**: Make sure you're in the "Pricing" section when creating the product

Once done, let me know and I'll help you test the subscription flow!
