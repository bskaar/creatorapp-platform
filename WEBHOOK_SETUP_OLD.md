# Detailed Webhook Setup Guide for CreatorApp

Webhooks are how Stripe notifies your application when events happen (like a subscription is created, a payment succeeds, or a subscription is canceled). This is **critical** for keeping your database in sync with Stripe.

---

## Why Webhooks Are Important

Without webhooks:
- Subscriptions won't activate in your database after checkout
- Subscription status won't update when payments fail
- You won't know when users cancel their subscriptions
- Stripe Connect account status won't sync

With webhooks:
- ✅ Automatic subscription activation
- ✅ Real-time payment status updates
- ✅ Automatic cancellation handling
- ✅ Failed payment notifications

---

## Understanding the Webhook Flow

```
User completes checkout in Stripe
         ↓
Stripe creates subscription
         ↓
Stripe sends webhook event to your endpoint
         ↓
Your edge function receives the event
         ↓
Edge function updates your database
         ↓
User sees active subscription in app
```

---

## Step-by-Step Webhook Configuration

### Step 1: Navigate to Webhooks Page

1. Log into Stripe: https://dashboard.stripe.com
2. Ensure you're in **Test mode** (toggle in top-right corner should show "Test mode")
3. Click **Developers** in the left sidebar
4. Click **Webhooks** in the submenu

**Direct link**: https://dashboard.stripe.com/test/webhooks

### Step 2: Add Your Webhook Endpoint

You should see a page titled "Webhooks" with a button "Add endpoint"

1. Click **+ Add endpoint** button (top right)

2. You'll see a form with the following fields:

   **Endpoint URL**:
   ```
   https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook
   ```

   ⚠️ **Important**:
   - Must be HTTPS (Stripe requires it)
   - Must be publicly accessible
   - This is your Supabase Edge Function URL
   - Copy it EXACTLY as shown above

   **Description** (optional):
   ```
   CreatorApp Platform Subscriptions
   ```

3. Click **Select events** button

### Step 3: Select Events to Listen For

A modal will appear with ALL Stripe events. You need to select specific ones:

#### Platform Subscription Events (Required)

Search for and check these boxes:

**Checkout Events:**
- ✅ `checkout.session.completed` - When user completes checkout
  - Triggers: Subscription activation, one-time payments

**Customer Subscription Events:**
- ✅ `customer.subscription.created` - New subscription created
- ✅ `customer.subscription.updated` - Subscription changed (upgrade/downgrade)
- ✅ `customer.subscription.deleted` - Subscription canceled

**Invoice Events:**
- ✅ `invoice.payment_succeeded` - Payment successful
- ✅ `invoice.payment_failed` - Payment failed (card declined, etc.)

#### Stripe Connect Events (Required)

**Account Events:**
- ✅ `account.updated` - Connect account status changes
  - Triggers: Onboarding completed, verification status, payouts enabled

### Step 4: Configure Event Delivery

Back on the main form:

**API version**:
- Leave as default (latest version)
- Shows something like `2024-10-28` or similar

**Events to send**:
- Should now show "7 events" (or the number you selected)

**Filter events** (optional):
- Leave unchecked unless you know what you're doing

### Step 5: Create the Endpoint

1. Click **Add endpoint** button at bottom
2. Stripe will create the endpoint and show you the details page

### Step 6: Get Your Webhook Signing Secret

This is **critical** - the signing secret proves the webhook is from Stripe and not an attacker.

On the webhook details page you'll see:

**Signing secret**:
```
whsec_••••••••••••••••••••••••••••••••
```

1. Click **Reveal** or **Click to reveal**
2. Copy the full secret (starts with `whsec_`)
3. It should look like: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

### Step 7: Add Signing Secret to Supabase

Now you need to add this secret to your Supabase project:

1. Go to: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions

2. Scroll down to **Secrets** section

3. Click **Add new secret**

4. Fill in:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste your webhook signing secret (e.g., `whsec_abc123...`)

5. Click **Create secret** or **Add secret**

6. ⚠️ **Important**: The secret is now stored securely and will be available to your edge functions

---

## Testing Your Webhook

### Method 1: Using Stripe CLI (Recommended for Development)

If you want to test webhooks locally during development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
   ```bash
   # Mac
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   # Download from GitHub releases
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local environment:
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```

4. Run a test:
   ```bash
   stripe trigger customer.subscription.created
   ```

### Method 2: Send Test Event from Dashboard

1. Go to your webhook endpoint in Stripe Dashboard
2. Click the **Send test webhook** button (top right)
3. Select an event (e.g., `customer.subscription.created`)
4. Click **Send test webhook**

You should see:
- ✅ Green checkmark = Success
- ❌ Red X = Failed (check your logs)

### Method 3: Real Test with Checkout

1. Go to your app's `/pricing` page
2. Click "Start Free Trial" on Growth plan
3. Use test card: `4242 4242 4242 4242`
4. Complete the checkout
5. Watch for the webhook to trigger

---

## Verifying Webhook Delivery

### In Stripe Dashboard:

1. Go to your webhook endpoint page
2. Scroll to **Event history** section
3. You'll see all webhook attempts
4. Each row shows:
   - Event type (e.g., `checkout.session.completed`)
   - Status (✅ Success or ❌ Failed)
   - Timestamp
   - Response code (200 = success)

Click on any event to see:
- Request body (the JSON Stripe sent)
- Response (what your function returned)
- Any error messages

### In Supabase Logs:

1. Go to: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/logs/edge-functions
2. Filter by function: `stripe-webhook`
3. Look for log entries
4. Check for errors or console.log messages

---

## Common Webhook Issues and Solutions

### Issue 1: Webhook Returns 401 Unauthorized

**Problem**: Stripe can't authenticate the webhook

**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` is set in Supabase
- Make sure you copied the ENTIRE secret including `whsec_` prefix
- Secret must match exactly (no extra spaces)

**How to check**:
```sql
-- Run in Supabase SQL Editor (won't show actual value for security)
SELECT EXISTS (
  SELECT 1 FROM vault.secrets
  WHERE name = 'STRIPE_WEBHOOK_SECRET'
);
```

### Issue 2: Webhook Returns 500 Error

**Problem**: Your function crashed

**Solutions**:
- Check Supabase Edge Function logs
- Look for JavaScript errors
- Verify database table structure matches function expectations

**How to debug**:
1. Go to Supabase Logs
2. Find the error message
3. Common causes:
   - Missing database columns
   - Invalid data format
   - Database permission issues

### Issue 3: Webhook Times Out

**Problem**: Function takes too long (>25 seconds)

**Solutions**:
- Check for slow database queries
- Ensure function isn't doing complex processing
- Break into smaller operations

### Issue 4: Database Not Updating

**Problem**: Webhook succeeds but database unchanged

**Possible causes**:
1. **Wrong site_id in metadata**:
   - Webhook can't find the site to update
   - Check: Does the subscription have metadata.site_id?

2. **RLS policies blocking update**:
   - Function uses service role key, should bypass RLS
   - Verify: `SUPABASE_SERVICE_ROLE_KEY` is set

3. **Wrong event type**:
   - Function only handles specific events
   - Check: Is the event type in your function's code?

**How to debug**:
```javascript
// Your function logs these messages:
console.log(`Platform subscription activated for site: ${siteId}`);
console.log(`Subscription status updated for site: ${siteId}`);
console.log(`Subscription canceled for site: ${siteId}`);
```

Look for these in Supabase logs.

---

## Webhook Event Reference

Here's what each event does in your application:

### `checkout.session.completed`
**Triggers when**: User completes Stripe Checkout
**Your function does**:
- If mode = 'subscription': Sets `platform_stripe_subscription_id` on sites table
- If mode = 'payment': Marks order as 'completed' in orders table

### `customer.subscription.created`
**Triggers when**: New subscription created (also fires after checkout)
**Your function does**:
- Updates subscription status to 'active' or 'trialing'
- Sets billing period end date
- Sets trial end date if applicable

### `customer.subscription.updated`
**Triggers when**: Subscription changes (upgrade, downgrade, renewal)
**Your function does**:
- Updates subscription status (active, past_due, etc.)
- Updates billing period dates
- Updates trial information

### `customer.subscription.deleted`
**Triggers when**: Subscription canceled or expired
**Your function does**:
- Sets subscription status to 'canceled'
- User retains access until period ends

### `invoice.payment_succeeded`
**Triggers when**: Subscription payment processes successfully
**Your function does**:
- Currently: No specific action (could add payment history tracking)
- Future: Could log successful payments

### `invoice.payment_failed`
**Triggers when**: Subscription payment fails (card declined, expired, etc.)
**Your function does**:
- Sets subscription status to 'past_due'
- User should see warning to update payment method

### `account.updated`
**Triggers when**: Stripe Connect account status changes
**Your function does**:
- Updates Connect account status fields
- Sets charges_enabled, payouts_enabled flags
- Reflects onboarding completion

---

## Webhook Payload Examples

### Example 1: Subscription Created

When a user completes checkout, Stripe sends:

```json
{
  "id": "evt_1234567890",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "status": "trialing",
      "trial_end": 1735689600,
      "current_period_end": 1738368000,
      "metadata": {
        "site_id": "550e8400-e29b-41d4-a716-446655440000",
        "plan_name": "growth"
      }
    }
  }
}
```

Your function extracts `site_id` and updates the database.

### Example 2: Payment Failed

When a subscription renewal fails:

```json
{
  "id": "evt_9876543210",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "subscription": "sub_1234567890",
      "customer": "cus_1234567890",
      "amount_due": 9900,
      "attempt_count": 1
    }
  }
}
```

Your function finds the site with that subscription_id and marks it past_due.

---

## Security Best Practices

### 1. Always Verify Webhook Signatures

Your function already does this by using the webhook secret. Never skip this step!

### 2. Use Idempotency

Stripe may send the same webhook multiple times. Your function should handle this gracefully:

```javascript
// Example: Update with WHERE clause to avoid duplicate processing
await supabase
  .from('sites')
  .update({ platform_subscription_status: 'active' })
  .eq('id', siteId)
  .eq('platform_subscription_status', 'trialing'); // Only update if still trialing
```

### 3. Return 200 Quickly

Respond to Stripe within 5 seconds. Do heavy processing asynchronously:

```javascript
// Good: Return 200 immediately
return new Response(JSON.stringify({ received: true }), { status: 200 });

// Bad: Don't do heavy processing before returning
```

### 4. Log Everything

Your function logs events. Check logs regularly:

```javascript
console.log(`Subscription status updated for site: ${siteId}`);
```

---

## Webhook Testing Checklist

Use this to verify your webhook is working:

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Endpoint URL is correct: `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook`
- [ ] 7 events selected (checkout, subscription, invoice, account)
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Supabase
- [ ] Sent test webhook from Stripe Dashboard
- [ ] Test webhook shows ✅ Success in Stripe
- [ ] Completed real checkout with test card
- [ ] Subscription activated in database
- [ ] Verified in Supabase: `sites.platform_subscription_status = 'active'`
- [ ] Checked Supabase logs for success messages

---

## Going Live: Webhook Configuration

When you switch to Live Mode, you'll need to:

1. **Create a new webhook endpoint** (Live Mode has separate webhooks)
   - Same URL: `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook`
   - Same events selected
   - Different signing secret

2. **Update Supabase secret** with new Live Mode signing secret
   - Replace `STRIPE_WEBHOOK_SECRET` value
   - Don't delete Test Mode webhook (you'll want both)

3. **Test with real card** before going fully live

---

## Quick Reference

**Webhook URL**:
```
https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook
```

**Required Events**:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- account.updated

**Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks

**Supabase Secrets**: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/settings/functions

**Edge Function Logs**: https://supabase.com/dashboard/project/yhofzxqopjvrfufouqzt/logs/edge-functions

---

## Need Help?

**If webhook fails**:
1. Check Stripe webhook logs for error details
2. Check Supabase Edge Function logs
3. Verify signing secret is correct
4. Test with "Send test webhook" button

**If database doesn't update**:
1. Verify site_id is in webhook metadata
2. Check RLS policies aren't blocking
3. Look for errors in Supabase logs
4. Verify table columns exist

**Common error messages**:
- "Missing webhook signature" → No signing secret set
- "Webhook signature verification failed" → Wrong secret
- "Site not found" → site_id not in metadata
- Timeout → Function taking too long

Your webhook is the glue that keeps Stripe and your database in sync. Take time to set it up correctly!
