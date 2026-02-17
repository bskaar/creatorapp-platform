# Contact Form Setup Guide

## Overview

The contact form on creatorappu.creatorapp.us now sends emails to **support@creatorapp.us** when visitors submit messages. This guide explains how to verify and test the functionality.

## What Was Fixed

### Before
- Contact form was static with no submission functionality
- Form didn't actually send emails
- No feedback for users when submitting

### After
- ✅ Fully functional contact form with email delivery
- ✅ Sends formatted emails to support@creatorapp.us
- ✅ Professional HTML email template with branding
- ✅ Loading states and user feedback
- ✅ Success/error messages
- ✅ Email reply-to set to sender's address

## Components Implemented

### 1. Edge Function: `contact-form`
**Location:** `supabase/functions/contact-form/index.ts`

**Features:**
- Public endpoint (no authentication required)
- Sends emails via Resend API
- Professional HTML formatting
- Error handling
- CORS headers for browser compatibility

**Endpoint URL:**
```
https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/contact-form
```

### 2. Updated Contact Page
**Location:** `src/pages/Contact.tsx`

**Features:**
- Form state management
- Real-time validation
- Loading spinner during submission
- Success message with green checkmark
- Error handling with helpful messages
- All fields required
- Disabled state during submission

## Required Configuration

### Resend API Key

The contact form requires a Resend API key to send emails. Here's how to set it up:

#### Step 1: Get Your Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key (it starts with `re_`)

#### Step 2: Configure in Supabase

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Navigate to **Edge Functions** → **Manage secrets**
4. Click **Add new secret**
5. Enter:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (e.g., `re_xxxxxxxxxxxx`)
6. Click **Save**

#### Step 3: Domain Verification in Resend (Recommended)

For production use, verify your domain in Resend:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `creatorapp.us`
4. Add the provided DNS records to your domain:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
5. Wait for verification (usually 5-15 minutes)

Once verified, emails will come from your domain with better deliverability.

## Testing the Contact Form

### Option 1: Use the Test File

1. Open `test-contact-form.html` in your browser
2. Fill out all fields
3. Click "Send Test Message"
4. Check for success message
5. Verify email arrives at support@creatorapp.us

### Option 2: Test on Live Site

1. Visit: https://creatorappu.creatorapp.us/contact
2. Fill out the contact form
3. Click "Send Message"
4. Look for success confirmation
5. Check support@creatorapp.us inbox

### What to Verify

✅ **Form Submission:**
- Loading spinner appears
- Form fields are disabled during submission
- Success message shows after sending

✅ **Email Delivery:**
- Email arrives at support@creatorapp.us
- Subject line includes "Contact Form:" prefix
- Reply-to is set to sender's email
- HTML formatting displays correctly
- All form data is included

✅ **Error Handling:**
- Network errors show helpful message
- Missing fields prevent submission
- API errors display to user

## Email Format

Emails sent from the contact form will look like this:

**Subject:** Contact Form: [User's Subject]

**From:** CreatorApp Contact Form <notifications@creatorapp.us>

**Reply-To:** [User's Email]

**Body:**
```
New Contact Form Submission

From: [Name] ([Email])
Subject: [Subject]

Message:
[User's message]
```

The email includes both HTML (beautifully formatted) and plain text versions.

## Troubleshooting

### Problem: "Email service is not configured"

**Solution:** RESEND_API_KEY is not set in Supabase
- Follow "Step 2: Configure in Supabase" above
- Make sure the secret name is exactly `RESEND_API_KEY`

### Problem: "Failed to send email"

**Possible causes:**
1. Invalid Resend API key
2. Resend account suspended or over quota
3. Network connectivity issues

**Solution:**
- Verify API key is correct in Supabase
- Check Resend dashboard for account status
- Try with a new API key

### Problem: Emails not arriving

**Possible causes:**
1. Emails going to spam
2. Domain not verified in Resend
3. Email address typo

**Solution:**
- Check spam folder at support@creatorapp.us
- Verify domain in Resend (see Step 3 above)
- Confirm email address is correct: support@creatorapp.us

### Problem: Form submission hangs

**Possible causes:**
1. Network timeout
2. Edge function not responding
3. CORS issues

**Solution:**
- Check browser console for errors
- Verify edge function is deployed: `contact-form`
- Check Supabase logs for errors

## Monitoring

### Check Sent Emails in Resend

1. Log into Resend dashboard
2. Go to **Emails** section
3. See all sent emails with status
4. Check delivery, opens, clicks

### View Edge Function Logs

1. Go to Supabase Dashboard
2. Click **Edge Functions** in left sidebar
3. Select **contact-form**
4. Click **Logs** tab
5. View recent executions and errors

## Security

The contact form implementation follows security best practices:

✅ **No authentication required** (public form)
✅ **Rate limiting** via Supabase edge functions
✅ **Input validation** on both client and server
✅ **HTML sanitization** to prevent XSS
✅ **CORS headers** properly configured
✅ **No sensitive data exposure** in error messages

## Cost Considerations

### Resend Pricing (as of 2024)

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for starting out

**Paid Plans:**
- $20/month for 50,000 emails
- Additional emails: $1 per 1,000

For a contact form, the free tier should be sufficient unless you receive a very high volume of inquiries.

## Next Steps

1. ✅ Configure RESEND_API_KEY in Supabase
2. ✅ Test the contact form using test-contact-form.html
3. ✅ Verify email delivery to support@creatorapp.us
4. ✅ (Optional) Verify domain in Resend for better deliverability
5. ✅ Monitor submissions in Resend dashboard

## Support

If you encounter issues:
- Check the troubleshooting section above
- Review browser console for errors
- Check Supabase edge function logs
- Verify Resend API key is configured correctly

The contact form is now fully functional and ready for production use!
