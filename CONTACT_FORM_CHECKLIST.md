# Contact Form Setup Checklist

Quick checklist to get your contact form working.

## Pre-Flight Checklist

### 1. Resend API Key Configuration

- [ ] Go to https://resend.com and create an account
- [ ] Generate a new API key from dashboard
- [ ] Copy the API key (starts with `re_`)
- [ ] Go to Supabase Dashboard → Settings → Edge Functions
- [ ] Add secret: `RESEND_API_KEY` with your key
- [ ] Click Save

### 2. Edge Function Deployment

- [ ] Verify `contact-form` function is deployed
- [ ] Check status is "ACTIVE"
- [ ] Test endpoint is accessible

### 3. Testing

- [ ] Open `test-contact-form.html` in browser
- [ ] Fill out all fields
- [ ] Click "Send Test Message"
- [ ] See success message
- [ ] Check email at support@creatorapp.us

## Expected Behavior

### When Form is Submitted:
1. Button shows "Sending..." with spinner
2. Form fields become disabled
3. After ~2-3 seconds, success message appears
4. Form resets to empty state
5. Email arrives at support@creatorapp.us

### Email Should Include:
- Subject: "Contact Form: [your subject]"
- From: CreatorApp Contact Form
- Reply-To: Your test email
- Body: Your message with professional formatting

## Quick Test Commands

### Check if edge function is deployed:
Visit Supabase Dashboard → Edge Functions → Look for "contact-form"

### Test via curl (optional):
```bash
curl -X POST \
  https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Your message has been sent successfully!",
  "messageId": "..."
}
```

## Common Issues

### Issue: "Email service is not configured"
**Fix:** RESEND_API_KEY not set in Supabase secrets

### Issue: No email received
**Fix:** Check spam folder, verify support@creatorapp.us is correct

### Issue: Form doesn't submit
**Fix:** Check browser console for errors, verify all fields are filled

## Ready for Production?

Before going live, make sure:
- [x] Contact form edge function deployed
- [x] Contact page updated with form logic
- [ ] RESEND_API_KEY configured in Supabase
- [ ] Test submission successful
- [ ] Email received at support@creatorapp.us
- [ ] (Optional) Domain verified in Resend

## Current Status

**Edge Function:** ✅ Deployed
**Contact Page:** ✅ Updated
**API Key:** ⏳ Needs configuration
**Testing:** ⏳ Ready to test

## Next Action Required

**→ Configure RESEND_API_KEY in Supabase to enable email sending**

1. Go to: https://dashboard.supabase.com/project/yhofzxqopjvrfufouqzt/settings/functions
2. Click "Manage secrets"
3. Add: `RESEND_API_KEY` with value from Resend
4. Test using test-contact-form.html

Once configured, the contact form will be fully functional!
