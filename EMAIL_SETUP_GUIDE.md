# Email Setup Guide for CreatorApp.us

## Overview

CreatorApp uses **Resend** as the email service provider. This guide will walk you through setting up email for your domain (creatorapp.us) so you can send emails from support@creatorapp.us and bruce@creatorapp.us.

## Why Resend?

Resend is an excellent choice for CreatorApp because:

- **Simple API**: Easy to integrate and use
- **Developer-Friendly**: Built for modern applications
- **High Deliverability**: Excellent email delivery rates
- **Custom Domains**: Full support for custom domain emails
- **Affordable**: Competitive pricing with generous free tier
- **React Support**: Native support for React email templates

## Alternative Email Providers

While we use Resend, here are other viable options:

### 1. SendGrid
- **Pros**: Mature platform, extensive features, good documentation
- **Cons**: More complex setup, can be expensive at scale
- **Best For**: Large-scale email campaigns

### 2. Mailgun
- **Pros**: Powerful API, good for transactional emails
- **Cons**: Pricing can be complex
- **Best For**: High-volume transactional emails

### 3. Amazon SES
- **Pros**: Very cost-effective, reliable
- **Cons**: Requires AWS knowledge, more setup work
- **Best For**: Cost-conscious teams with AWS expertise

### 4. Postmark
- **Pros**: Excellent deliverability, simple pricing
- **Cons**: Higher cost per email
- **Best For**: Transactional emails with high deliverability requirements

**Recommendation**: Stick with Resend for the best developer experience and reliability.

---

## Step-by-Step Setup with Resend

### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click "Sign Up" and create your account
3. Verify your email address

### Step 2: Add Your Domain

1. In the Resend dashboard, navigate to **Domains**
2. Click **Add Domain**
3. Enter `creatorapp.us`
4. Click **Add Domain**

### Step 3: Configure DNS Records

Resend will provide you with DNS records that need to be added to your domain registrar (GoDaddy, Namecheap, etc.).

You'll need to add the following types of records:

#### A. SPF Record (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### B. DKIM Records (CNAME)
Resend will provide 3 CNAME records. They'll look like:
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600

Type: CNAME
Name: resend2._domainkey
Value: resend2._domainkey.resend.com
TTL: 3600

Type: CNAME
Name: resend3._domainkey
Value: resend3._domainkey.resend.com
TTL: 3600
```

#### C. DMARC Record (TXT)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:bruce@creatorapp.us
TTL: 3600
```

### Step 4: Verify Domain in Resend

1. After adding all DNS records (wait 15-60 minutes for propagation)
2. In Resend dashboard, go to your domain
3. Click **Verify DNS Records**
4. Once verified, you'll see a green checkmark

### Step 5: Get Your API Key

1. In Resend dashboard, navigate to **API Keys**
2. Click **Create API Key**
3. Name it: `CreatorApp Production`
4. Select **Full Access** or **Sending Access**
5. Copy the API key (you'll only see it once!)

### Step 6: Add API Key to Supabase

Since CreatorApp uses Supabase Edge Functions for sending emails, you need to add the API key to Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key from Step 5
4. Click **Save**

### Step 7: Test Email Sending

You can test the email setup using the test file included in the project:

```bash
# Open test-email-sending.html in your browser
# Fill in the form and send a test email
```

Or use curl to test the edge function:

```bash
curl -X POST \
  'https://YOUR_SUPABASE_URL/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "from": "support@creatorapp.us",
    "subject": "Test Email from CreatorApp",
    "html": "<h1>Hello!</h1><p>This is a test email.</p>"
  }'
```

---

## Email Addresses Setup

Your application now has two configured email addresses:

### 1. support@creatorapp.us
- **Purpose**: Customer support and general inquiries
- **Visible on**: Landing page footer, Dashboard help section, Terms of Service, Privacy Policy
- **Environment Variable**: `VITE_SUPPORT_EMAIL`

### 2. bruce@creatorapp.us
- **Purpose**: Administrative and billing communications
- **Environment Variable**: `VITE_ADMIN_EMAIL`

These are configured in your `.env` file:

```env
VITE_SUPPORT_EMAIL=support@creatorapp.us
VITE_ADMIN_EMAIL=bruce@creatorapp.us
```

---

## How Emails Are Sent in CreatorApp

CreatorApp uses a Supabase Edge Function (`send-email`) to send all emails. Here's how it works:

### 1. Edge Function Location
```
supabase/functions/send-email/index.ts
```

### 2. How to Send an Email from the App

```typescript
import { supabase } from '../lib/supabase';

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: 'customer@example.com',
      from: 'support@creatorapp.us',
      subject: 'Welcome to CreatorApp!',
      html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
      replyTo: 'support@creatorapp.us',
    }),
  }
);

const result = await response.json();
```

### 3. Email Features

- **Authentication**: All requests must be authenticated
- **Logging**: All sent emails are logged to the `email_logs` table
- **Rate Limiting**: Respects platform subscription limits
- **Templates**: Supports HTML emails
- **Attachments**: Not currently supported (can be added if needed)

---

## Best Practices

### 1. Email Deliverability

- Always use your verified domain (`@creatorapp.us`)
- Set proper `from` and `replyTo` addresses
- Include an unsubscribe link in marketing emails
- Monitor your domain reputation in Resend dashboard

### 2. Email Content

- Use clear, concise subject lines
- Include both HTML and plain text versions
- Test emails across different clients
- Keep email size under 102KB for best deliverability

### 3. Compliance

- Include physical mailing address in footer
- Honor unsubscribe requests immediately
- Don't buy email lists
- Follow CAN-SPAM Act and GDPR requirements

### 4. Monitoring

- Check Resend dashboard regularly for bounce rates
- Monitor email logs in Supabase
- Track delivery and open rates
- Set up alerts for failed sends

---

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set in Supabase secrets
2. **Verify Domain**: Ensure domain is verified in Resend dashboard
3. **Check DNS**: DNS records can take up to 48 hours to propagate
4. **Review Logs**: Check Supabase Edge Function logs for errors

### Emails Going to Spam

1. **Warm Up Domain**: Start with low volume and gradually increase
2. **Check SPF/DKIM**: Ensure all DNS records are properly configured
3. **Monitor Reputation**: Use Resend's deliverability tools
4. **Avoid Spam Triggers**: Don't use all caps, excessive punctuation, or spam keywords

### DNS Verification Failed

1. **Wait for Propagation**: DNS changes take 15-60 minutes (sometimes 24-48 hours)
2. **Check Records**: Use [DNS Checker](https://dnschecker.org) to verify records
3. **Correct Format**: Ensure no extra spaces or characters in DNS records
4. **Contact Registrar**: Some registrars have specific requirements

---

## Cost Estimates

### Resend Pricing (as of 2026)

- **Free Tier**: 3,000 emails/month
- **Pro**: $20/month for 50,000 emails
- **Business**: $100/month for 500,000 emails
- **Overage**: $1 per 1,000 additional emails

### Recommended Plan for CreatorApp

Start with the **Free Tier** for beta testing, then upgrade to **Pro** when you have:
- More than 100 active sites
- Consistent email volume over 3,000/month
- Need for advanced features (analytics, webhooks)

---

## Support

If you need help with email setup:

- **Resend Support**: [https://resend.com/support](https://resend.com/support)
- **Resend Docs**: [https://resend.com/docs](https://resend.com/docs)
- **CreatorApp Support**: support@creatorapp.us

---

## Summary

You now have:

1. ✅ Resend configured as your email provider
2. ✅ support@creatorapp.us visible across the platform
3. ✅ bruce@creatorapp.us configured for admin communications
4. ✅ DNS records guide for domain verification
5. ✅ Edge function ready to send emails
6. ✅ Environment variables properly set

**Next Steps:**

1. Add DNS records to your domain registrar
2. Verify domain in Resend dashboard
3. Add RESEND_API_KEY to Supabase secrets
4. Send a test email to verify setup
5. Monitor email delivery in Resend dashboard
