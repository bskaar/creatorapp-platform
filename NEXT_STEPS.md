# ✅ Verified Configuration & Next Steps

## Current Status

### ✅ Supabase Secrets Configured

You've successfully added these secrets to Supabase:

1. **STRIPE_SECRET_KEY** - Your Stripe API secret key ✅
2. **STRIPE_WEBHOOK_SECRET** - Webhook signing secret ✅
3. **RESEND_API_KEY** - Email service API key ✅

All edge functions now have access to these secrets and can communicate with Stripe and send emails.

### ⚠️ Remaining Configuration

**Stripe Products & Price IDs** - Not yet configured in database

Your database currently shows:
- starter: No Stripe IDs (correct - free plan)
- growth: Missing stripe_price_id ❌
- pro: Missing stripe_price_id ❌
- enterprise: No Stripe IDs (correct - custom pricing)

---

## 🎯 Next Steps

### Step 1: Create Stripe Products (5 minutes)

You need to create subscription products in Stripe Dashboard.

1. Go to: https://dashboard.stripe.com/test/products

2. Click **+ Add product**

3. Create **Growth Plan**:
   - Name: `CreatorApp Growth`
   - Description: `Unlimited products, 5 funnels, 10K contacts`
   - Click **Add pricing**:
     - Type: `Recurring`
     - Price: `$99.00`
     - Billing period: `Monthly`
     - Currency: `USD`
   - Click **Save product**

4. **IMPORTANT**: Copy the Price ID
   - After saving, you'll see a Price ID like: `price_1234567890abcdefg`
   - Click to copy it
   - Save it for Step 2

5. Create **Pro Plan**:
   - Name: `CreatorApp Pro`
   - Description: `Unlimited products & funnels, 50K contacts, 10 team members`
   - Click **Add pricing**:
     - Type: `Recurring`
     - Price: `$199.00`
     - Billing period: `Monthly`
     - Currency: `USD`
   - Click **Save product**

6. **IMPORTANT**: Copy the Price ID
   - Copy the Price ID for Pro plan
   - Save it for Step 2

### Step 2: Update Database with Stripe Price IDs (2 minutes)

Once you have both Price IDs, run this SQL in Supabase SQL Editor:

**Supabase SQL Editor**: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/sql/new

```sql
-- Replace 'price_xxxxx' with your ACTUAL Price IDs from Step 1

-- Update Growth plan
UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx'  -- Your Growth Price ID
WHERE name = 'growth';

-- Update Pro plan
UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx'  -- Your Pro Price ID
WHERE name = 'pro';

-- Verify the update
SELECT name, stripe_price_id FROM subscription_plans;
```

**You should see**:
- starter: null (correct)
- growth: price_1234... ✅
- pro: price_5678... ✅
- enterprise: null (correct)

### Step 3: Configure Stripe Connect (10 minutes)

This allows your users (site owners) to accept payments from their customers.

1. Go to: https://dashboard.stripe.com/test/connect/accounts/overview

2. If first time, click **Get started**

3. Choose **Platform or marketplace**

4. Complete the questionnaire:
   - Platform type: SaaS platform
   - Account type: Express (recommended)

5. Go to Connect Settings: https://dashboard.stripe.com/test/settings/connect

6. Under **OAuth settings**:
   - Enable **OAuth for Express**
   - Add redirect URI: `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-connect-oauth`
   - Save changes

7. **Copy your Connect Client ID**:
   - It looks like: `ca_xxxxxxxxxxxxx`
   - You'll need to add this as a Supabase secret

8. Add Connect Client ID to Supabase:
   - Go to: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions
   - Under **Secrets**, click **Add new secret**
   - Name: `STRIPE_CONNECT_CLIENT_ID`
   - Value: Your Client ID (e.g., `ca_xxxxxxxxxxxxx`)
   - Click **Create secret**

---

## 🧪 Testing Your Setup

Once you've completed Steps 1-3, test everything:

### Test 1: Platform Subscription Flow

1. **Start your dev server** (if not running)

2. **Go to pricing page**: http://localhost:5173/pricing

3. **Click "Start Free Trial"** on Growth plan ($99/mo)

4. **Stripe Checkout opens**:
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Your name
   - Email: Your email

5. **Complete checkout**

6. **Verify subscription activated**:
   - You should be redirected back to app
   - Go to Settings → Subscription tab
   - Should show "Growth" plan as active
   - Check database:
     ```sql
     SELECT
       custom_domain,
       platform_subscription_plan,
       platform_subscription_status,
       platform_stripe_subscription_id
     FROM sites
     LIMIT 5;
     ```

7. **Check Stripe Dashboard**:
   - Go to: https://dashboard.stripe.com/test/subscriptions
   - You should see your new subscription
   - Status: "Active" or "Trialing"

### Test 2: Webhook Delivery

1. **Go to Stripe webhooks**: https://dashboard.stripe.com/test/webhooks

2. **Click on your webhook endpoint**

3. **Check Event History** section:
   - Should show recent events (from your test checkout)
   - Look for: `checkout.session.completed`, `customer.subscription.created`
   - Status should be ✅ (successful delivery)

4. **If you see ❌ (failed)**:
   - Click on the failed event
   - Check the error message
   - Common issues:
     - Wrong webhook secret
     - Missing site_id in metadata
     - Database permissions

5. **Check Supabase Logs**:
   - Go to: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/logs/edge-functions
   - Filter by: `stripe-webhook`
   - Look for log messages like:
     - "Platform subscription activated for site: ..."
     - "Subscription status updated for site: ..."

### Test 3: Stripe Connect Onboarding

1. **Go to Settings → Payment** in your app

2. **Click "Connect with Stripe"**

3. **Stripe Connect onboarding opens**:
   - Fill in business details
   - Use test data (it's Test Mode)
   - Complete the form

4. **Verify connection**:
   - Should redirect back to Settings
   - Payment tab should show "Connected" status
   - Check database:
     ```sql
     SELECT
       custom_domain,
       stripe_connect_account_id,
       stripe_connect_status
     FROM sites
     WHERE stripe_connect_account_id IS NOT NULL;
     ```

5. **Check Stripe Dashboard**:
   - Go to: https://dashboard.stripe.com/test/connect/accounts/overview
   - Should see your connected account

### Test 4: Customer Payment Flow (Optional - requires product setup)

1. **Create a test product** in Commerce section

2. **Try to purchase it** (as a customer)

3. **Use test card** to complete checkout

4. **Verify order** created in database

---

## 🎯 Quick Checklist

Use this to track your progress:

**Configuration:**
- [x] STRIPE_SECRET_KEY added to Supabase
- [x] STRIPE_WEBHOOK_SECRET added to Supabase
- [x] RESEND_API_KEY added to Supabase
- [ ] Growth plan created in Stripe ($99/mo)
- [ ] Pro plan created in Stripe ($199/mo)
- [ ] Growth price_id updated in database
- [ ] Pro price_id updated in database
- [ ] Stripe Connect enabled
- [ ] Connect OAuth configured
- [ ] STRIPE_CONNECT_CLIENT_ID added to Supabase

**Testing:**
- [ ] Test subscription checkout completed
- [ ] Subscription shows active in app
- [ ] Subscription visible in Stripe Dashboard
- [ ] Webhooks delivering successfully (✅ in Stripe)
- [ ] Connect onboarding completed
- [ ] Connected account visible in Stripe

---

## 🚨 Troubleshooting

### Issue: Checkout button doesn't work

**Check:**
1. Is `stripe_price_id` set in database for that plan?
   ```sql
   SELECT name, stripe_price_id FROM subscription_plans WHERE name = 'growth';
   ```
2. Is the Price ID valid in Stripe Dashboard?
3. Check browser console for errors

### Issue: Subscription doesn't activate after checkout

**Check:**
1. Did webhook deliver successfully? (Check Stripe webhook logs)
2. Is `STRIPE_WEBHOOK_SECRET` correct in Supabase?
3. Check Supabase Edge Function logs for errors
4. Verify site_id is in checkout session metadata

### Issue: "Connect with Stripe" button doesn't work

**Check:**
1. Is `STRIPE_CONNECT_CLIENT_ID` set in Supabase?
2. Is redirect URI correct in Stripe Connect settings?
3. Check browser console for errors

### Issue: Webhook shows "Missing webhook signature or secret"

**Solution:**
- This is actually correct behavior when testing manually
- Webhooks MUST come from Stripe (with valid signature)
- Use "Send test webhook" button in Stripe Dashboard instead

---

## 📚 Additional Resources

- **STRIPE_SETUP_GUIDE.md** - Complete setup guide
- **STRIPE_SETUP_CHECKLIST.md** - Quick checklist format
- **WEBHOOK_SETUP_DETAILED.md** - Detailed webhook configuration

---

## 🎉 What's Working Now

With the secrets you've added, these features are now functional:

✅ **Platform Subscriptions**:
- Users can subscribe to Growth/Pro plans (once Price IDs are added)
- Webhook automatically activates subscriptions
- Payment status syncs in real-time

✅ **Email Sending**:
- Your app can send transactional emails via Resend
- Order confirmations, welcome emails, etc.

✅ **Stripe Connect** (once configured):
- Site owners can connect their Stripe accounts
- They receive payments directly from customers
- Platform tracks order status

---

## 🚀 After Testing: Going Live

Once everything works in Test Mode:

1. **Complete Stripe business verification**
2. **Switch to Live Mode** in Stripe
3. **Create live products** (repeat Step 1 with Live Mode)
4. **Get live API keys** and update Supabase secrets
5. **Create live webhook** endpoint
6. **Update Connect settings** for Live Mode
7. **Test with real card** before announcing

---

## Need Help?

If you run into issues:

1. **Check this file** for troubleshooting tips
2. **Review Supabase logs**: Edge Function logs show detailed errors
3. **Review Stripe logs**: Webhook delivery logs show what went wrong
4. **Verify secrets**: Make sure all secrets are set correctly

**Key URLs:**
- Supabase Project: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt
- Stripe Dashboard: https://dashboard.stripe.com/test
- Supabase Logs: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/logs/edge-functions
