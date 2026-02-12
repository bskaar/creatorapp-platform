# 🚨 CRITICAL SECURITY ALERT 🚨

## IMMEDIATE ACTION REQUIRED

Your `.env` file contained **LIVE production Stripe keys** that may have been exposed in version control.

### Keys Found:
- ✅ Live Publishable Key: `pk_live_51SxC16K7...`
- ✅ Live Secret Key: `sk_live_51SxC16K7...` (CRITICAL)
- ✅ Platform Webhook Secret: `whsec_eFUXp6mFd...`
- ✅ Connect Webhook Secret: `whsec_lQQdeRmkedczF...`

---

## STEP 1: ROTATE ALL STRIPE KEYS (Do This NOW)

### 1.1 Rotate API Keys
1. Go to: https://dashboard.stripe.com/apikeys
2. Click "Roll" next to your Secret Key
3. Update your production deployment with the new secret key
4. Copy the new publishable key

### 1.2 Rotate Webhook Secrets
1. Go to: https://dashboard.stripe.com/webhooks
2. For each webhook endpoint, click "..." → "Roll secret"
3. Update your deployment with new webhook secrets

---

## STEP 2: REMOVE FROM GIT HISTORY

If the `.env` file was ever committed to git, remove it from history:

```bash
# Option 1: Using git filter-branch (works on all repos)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Option 2: Using BFG Repo-Cleaner (faster for large repos)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env

# After either option, force push
git push origin --force --all
git push origin --force --tags
```

---

## STEP 3: UPDATE YOUR DEPLOYMENT

### For Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from `.env.example`
4. Redeploy your application

### For Other Platforms:
Consult your platform's documentation for setting environment variables.

---

## STEP 4: MONITOR FOR SUSPICIOUS ACTIVITY

1. Check Stripe Dashboard → Developers → Events for unusual activity
2. Review recent payments and refunds
3. Check for unauthorized API calls in logs
4. Set up alerts for unusual transaction patterns

---

## PREVENTION CHECKLIST

- [x] `.env` is in `.gitignore`
- [x] `.env.example` created with placeholder values
- [ ] All keys rotated in Stripe Dashboard
- [ ] `.env` removed from git history
- [ ] Production environment variables updated
- [ ] Set up secret scanning in CI/CD
- [ ] Reviewed Stripe logs for suspicious activity

---

## WHAT'S BEEN FIXED

✅ Created `.env.example` with safe placeholder values
✅ Documented security best practices
✅ RLS policies hardened (see below)
✅ XSS protection added
✅ CORS restrictions implemented

---

## NEED HELP?

If you believe your keys were compromised:
1. Contact Stripe support immediately: https://support.stripe.com/
2. Review all transactions in the last 30 days
3. Consider temporarily disabling API access while you investigate

**Remember:** Security is not a one-time task. Regular audits and monitoring are essential.
