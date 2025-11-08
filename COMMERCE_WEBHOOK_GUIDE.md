# Commerce Webhooks - Complete Setup Guide

## 🎯 The Two Payment Systems

Your platform has **TWO SEPARATE** payment flows:

### 1. Platform Subscriptions (Already Working ✅)
**Who pays:** Creators pay YOU
**For what:** Platform plans (Starter, Pro, Business)
**Stripe account:** Your main Stripe account
**Webhook:** `stripe-webhook` (already deployed)
**Database:** Updates `sites` table

### 2. Commerce Payments (This Guide ❌)
**Who pays:** Customers pay CREATORS
**For what:** Courses, memberships, digital products
**Stripe account:** Creator's Stripe Connect account
**Webhook:** `commerce-webhook` (needs setup)
**Database:** Updates `orders` and `product_access` tables

---

## 🔑 The Key Difference: Application Webhooks

### Why You Need Application Webhooks

When a customer buys Creator A's course:
1. Payment processed through **Creator A's Stripe Connect account**
2. Webhook event fires in **Creator A's account** (not yours!)
3. You need to receive this event to update your database

**Regular webhooks** = Only events from your account
**Application webhooks** = Events from ALL connected accounts → forwarded to YOUR endpoint

This is Stripe Connect's way of letting your platform know about transactions in creator accounts.

---

## 📋 6-Step Setup Process

### Step 1: Deploy the Commerce Webhook Function

The edge function is created at:
```
supabase/functions/commerce-webhook/index.ts
```

Get your Supabase project URL. It will be:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/commerce-webhook
```

### Step 2: Configure Stripe Dashboard

1. **Log into your Stripe Dashboard** (the platform account)
2. Navigate to: **Developers → Webhooks**
3. Click **"Add endpoint"**

**CRITICAL:** Don't miss this step!
4. Click the dropdown that says **"Account events"**
5. Select **"Connected account events"** (this is the key!)

6. Enter your webhook URL:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/commerce-webhook
```

7. Select these events:
```
☑ checkout.session.completed
☑ payment_intent.succeeded
☑ payment_intent.payment_failed
☑ charge.refunded
☑ customer.subscription.created
☑ customer.subscription.updated
☑ customer.subscription.deleted
```

8. Click **"Add endpoint"**

### Step 3: Get Webhook Signing Secret

1. After creating the endpoint, click on it
2. Under "Signing secret", click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)

### Step 4: Add Secret to Supabase

1. Go to Supabase Dashboard
2. **Settings → Edge Functions → Secrets**
3. Add new secret:
```
Name: STRIPE_COMMERCE_WEBHOOK_SECRET
Value: whsec_xxxxxxxxxxxxx (paste from Step 3)
```

### Step 5: Apply Database Migration

The migration is already created:
```
supabase/migrations/20251108000001_create_product_access_table.sql
```

This creates the `product_access` table that tracks who has access to what products.

Apply it through Supabase dashboard or use MCP tool.

### Step 6: Test It!

**Test with Stripe Dashboard:**
1. Go to your webhook in Stripe
2. Click **"Send test webhook"**
3. Select `checkout.session.completed`
4. Click **"Send test event"**
5. Check Supabase logs

**Test with real purchase:**
1. Create a test product (set to Active)
2. Visit product page
3. Buy with test card: `4242 4242 4242 4242`
4. Check database:
```sql
SELECT payment_status FROM orders WHERE id = 'xxx';
-- Should be 'paid', not 'pending'

SELECT * FROM product_access WHERE order_id = 'xxx';
-- Should have a record
```

---

## 🔄 How It Works

### Complete Payment Flow

```
1. Customer visits: /site/{SITE_ID}/product/{PRODUCT_ID}
   ↓
2. Clicks "Buy Now"
   ↓
3. Frontend calls edge function: create-commerce-checkout
   ↓
4. Edge function:
   - Creates order in database (status = 'pending')
   - Creates Stripe checkout session
   - Returns checkout URL
   ↓
5. Customer redirected to Stripe
   ↓
6. Customer enters card details and completes payment
   ↓
7. Stripe charges Creator's Connect account
   ↓
8. Stripe fires webhook: checkout.session.completed
   ↓
9. Webhook arrives at: commerce-webhook function
   ↓
10. Webhook function:
    - Verifies signature (security)
    - Finds order by session_id
    - Updates order: payment_status = 'paid'
    - Creates product_access record
    - Logs email notification
   ↓
11. Customer redirected to: /site/{SITE_ID}/success
   ↓
12. Customer has access to product!
```

### For Subscriptions (Memberships)

Same flow, plus:
```
- Stripe fires: customer.subscription.created
- Webhook creates product_access with no expiry
- Every month: subscription renews automatically
- If cancelled: customer.subscription.deleted
- Webhook revokes access
```

---

## 📊 Database Tables

### Orders Table
```sql
-- Tracks every purchase
payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
external_order_id: Stripe session ID (cs_...)
```

### Product Access Table (New)
```sql
-- Tracks who can access what
order_id: Links to purchase
product_id: What they bought
customer_email: Who can access
is_active: Currently has access?
access_expires_at: NULL = lifetime, or date
access_revoked_at: When revoked (refunds)
```

---

## 🛡️ Security

### Webhook Signature Verification

Every webhook is verified:
```typescript
const event = stripe.webhooks.constructEventAsync(
  body,
  signature,
  STRIPE_COMMERCE_WEBHOOK_SECRET
);
```

If signature doesn't match → Rejected (prevents fake webhooks)

### Row Level Security

**Orders:**
- Only site members can see their site's orders
- No public access

**Product Access:**
- Site members see their site's access records
- Customers see their own access (for future customer portal)

---

## 🚨 Troubleshooting

### Orders Stuck in "Pending"

**Problem:** Webhook not receiving events

**Check:**
1. Is webhook URL correct?
2. Did you select "Connected account events"?
3. Is webhook secret correct in Supabase?
4. Check Stripe webhook logs for delivery failures

### "Signature Verification Failed"

**Problem:** Wrong webhook secret

**Fix:**
1. Get secret from Stripe webhook page
2. Update `STRIPE_COMMERCE_WEBHOOK_SECRET` in Supabase
3. Redeploy function if needed

### "No Orders Found"

**Problem:** Order not created before checkout

**Check:**
1. Does `create-commerce-checkout` function create order?
2. Does order have correct `external_order_id`?
3. Check Supabase logs for function errors

---

## 📧 Email Notifications

Currently, the webhook **logs** email notifications:

```typescript
console.log(`Would send email to ${order.billing_email}`);
console.log(`Product: ${product?.title}`);
```

### To Send Real Emails:

You can use your existing `send-email` edge function or integrate services like:
- Resend (recommended)
- SendGrid
- Postmark
- AWS SES

Example with Resend:
```typescript
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'orders@yourplatform.com',
    to: order.billing_email,
    subject: `Order Confirmation - ${product.title}`,
    html: emailHTML,
  }),
});
```

---

## ✅ Webhook Events Handled

| Event | What It Means | Action Taken |
|-------|--------------|--------------|
| `checkout.session.completed` | Payment successful | Mark order as paid, grant access |
| `payment_intent.succeeded` | Payment processed | Update order status |
| `payment_intent.payment_failed` | Payment declined | Mark order as failed |
| `charge.refunded` | Money returned | Revoke access, mark refunded |
| `customer.subscription.created` | New subscription | Grant ongoing access |
| `customer.subscription.updated` | Subscription changed | Update access status |
| `customer.subscription.deleted` | Subscription cancelled | Revoke access |

---

## 🧪 Test Cards

Use these Stripe test cards:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline (generic) |
| 4000 0000 0000 9995 | Decline (insufficient funds) |

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

---

## 📈 Monitoring

### Check Webhook Deliveries

**In Stripe:**
- Developers → Webhooks → Your endpoint
- See all attempts, successes, failures
- Retry failed deliveries

**In Supabase:**
- Edge Functions → commerce-webhook → Logs
- See function execution details
- Debug any errors

### Useful Queries

```sql
-- Orders by status
SELECT payment_status, COUNT(*), SUM(amount)
FROM orders
GROUP BY payment_status;

-- Active customers per product
SELECT p.title, COUNT(*)
FROM product_access pa
JOIN products p ON p.id = pa.product_id
WHERE pa.is_active = true
GROUP BY p.id, p.title;

-- Failed payments (need follow-up)
SELECT billing_email, amount, created_at
FROM orders
WHERE payment_status = 'failed'
ORDER BY created_at DESC;
```

---

## 🎯 Quick Summary

### What You Have Now:
✅ Two payment systems (platform & commerce)
✅ Platform webhooks working
✅ Commerce webhook function created
✅ Database migration ready

### What You Need To Do:
1. ☐ Deploy commerce-webhook function
2. ☐ Configure Stripe application webhook (Connected account events)
3. ☐ Add webhook secret to Supabase
4. ☐ Apply product_access migration
5. ☐ Test with a purchase
6. ☐ Verify order goes from pending → paid

### Time Required:
**10-15 minutes** if following this guide step-by-step

---

## 💡 Why This Matters

**Without webhooks:**
- Orders stuck in "pending" forever
- No access granted to customers
- Manual fulfillment required
- Refunds don't revoke access
- Subscriptions don't auto-renew

**With webhooks:**
- Instant access after payment
- Automated fulfillment
- Refunds handled automatically
- Subscriptions just work
- Professional customer experience

---

You're one webhook configuration away from a fully automated commerce platform!
