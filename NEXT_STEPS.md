# ✅ Verified Configuration & Next Steps

## Current Status

### ✅ Supabase Secrets Configured

You've successfully added these secrets to Supabase:

1. **STRIPE_SECRET_KEY** - Your Stripe API secret key ✅
2. **STRIPE_WEBHOOK_SECRET** - Webhook signing secret ✅
3. **RESEND_API_KEY** - Email service API key ✅

All edge functions now have access to these secrets and can communicate with Stripe and send emails.

### ✅ Stripe Products & Price IDs Configured

Your database now has:
- starter: No Stripe IDs (correct - free plan)
- growth: price_1SLpASB0OqX0uAjWLdOxur3P ✅
- pro: price_1SLpDWB0OqX0uAjWYRYSSH8p ✅
- enterprise: No Stripe IDs (correct - custom pricing)

---

## 🎯 Next Steps

### Step 1: Configure Stripe Connect (10 minutes)

Stripe Connect allows your users (site owners) to accept payments from their customers directly. This integration uses **Express accounts** which provide a balance between ease of integration and platform control.

**Learn more about Stripe Connect**:
- Overview and use cases: https://docs.stripe.com/connect
- Account types: https://docs.stripe.com/connect/accounts
- How Connect works: https://docs.stripe.com/connect/how-connect-works
- Testing guide: https://docs.stripe.com/connect/testing

#### Enable Connect in Your Stripe Account

1. **Go to Connect Overview**: https://dashboard.stripe.com/test/connect/accounts/overview

2. **If this is your first time**, click **Get started**

3. **Choose your platform type**: Select **Platform or marketplace**

4. **Complete the setup questionnaire**:
   - What type of platform: **SaaS platform**
   - How users accept payments: **Through your platform**

#### Configure OAuth Settings

5. **Go to Connect Settings**: https://dashboard.stripe.com/test/settings/connect

6. **Configure OAuth for Express accounts**:
   - Find the **OAuth settings** section
   - Enable **OAuth for Express accounts**
   - Under **Redirects**, click **Add redirect URI**
   - Add: `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-connect-oauth`
   - Click **Save changes**

7. **Copy your Connect Client ID**:
   - Still on the Connect Settings page
   - Find your **Client ID** (starts with `ca_`)
   - Click to copy it
   - Example: `ca_xxxxxxxxxxxxx`

#### Add Client ID to Supabase

8. **Configure the secret in Supabase**:
   - Go to: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions
   - Scroll to **Secrets** section
   - Click **Add new secret**
   - Name: `STRIPE_CONNECT_CLIENT_ID`
   - Value: Paste your Client ID (e.g., `ca_xxxxxxxxxxxxx`)
   - Click **Create secret**

**Important**: This Client ID allows your edge function to initiate the OAuth flow that connects your users' Stripe accounts to your platform.

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

This tests that your users can connect their Stripe accounts to start accepting payments.

**Testing documentation**: https://docs.stripe.com/connect/testing

1. **Go to Settings → Payment** in your app

2. **Click "Connect with Stripe"**

3. **Stripe Connect onboarding opens**:
   - You'll see the Stripe-hosted onboarding flow
   - Fill in business details using test data
   - For phone verification, use SMS code: `000-000`
   - Complete all required fields

4. **Use test data for identity verification**:
   - Test SSN: `000-00-0000`
   - Test date of birth: `01/01/1901`
   - Test address: Any valid US address format
   - See full testing guide: https://docs.stripe.com/connect/testing

5. **Verify connection**:
   - After completion, you should redirect back to Settings
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

6. **Check Stripe Dashboard**:
   - Go to: https://dashboard.stripe.com/test/connect/accounts/overview
   - You should see your test connected account
   - Click on it to view details and verification status

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
- [x] Growth plan created in Stripe ($99/mo)
- [x] Pro plan created in Stripe ($199/mo)
- [x] Growth price_id updated in database
- [x] Pro price_id updated in database
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

**Project Documentation:**
- **STRIPE_SETUP_GUIDE.md** - Complete setup guide
- **STRIPE_SETUP_CHECKLIST.md** - Quick checklist format
- **WEBHOOK_SETUP_DETAILED.md** - Detailed webhook configuration

**Official Stripe Connect Documentation:**
- Overview and use cases: https://docs.stripe.com/connect
- Account types explained: https://docs.stripe.com/connect/accounts
- How Connect works: https://docs.stripe.com/connect/how-connect-works
- Testing your integration: https://docs.stripe.com/connect/testing

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
