# Quick Start: Deploy CreatorApp to GoDaddy NOW

Follow these steps in order. Total time: 30 minutes (excluding DNS propagation).

## Phase 1: Deploy to Vercel (10 minutes)

### Step 1: Sign up for Vercel
1. Go to https://vercel.com/signup
2. Sign up with email or GitHub
3. Verify your email

### Step 2: Deploy via CLI

Open terminal in project directory:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
# (Opens browser, confirm login)

# Deploy to Vercel
vercel

# Answer prompts:
# Set up and deploy? Y
# Which scope? (select your account)
# Link to existing project? N
# Project name? creatorapp
# Which directory? ./ (press Enter)
# Want to override settings? N

# Wait for deployment...

# Deploy to production
vercel --prod
```

### Step 3: Add Environment Variables

```bash
# Add Supabase URL
vercel env add VITE_SUPABASE_URL production

# Paste: https://yhofzxqopjvrfufouqzt.supabase.co

# Add Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production

# Paste your anon key from .env file
```

### Step 4: Redeploy with Environment Variables

```bash
vercel --prod
```

**Save your Vercel URL**: Something like `creatorapp.vercel.app`

---

## Phase 2: Configure GoDaddy DNS (5 minutes)

### Step 1: Login to GoDaddy
1. Go to https://godaddy.com
2. Login
3. Click "My Products"
4. Find `creatorapp.us` → Click "DNS"

### Step 2: Get Vercel DNS Info

In another browser tab:
1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Click your `creatorapp` project
3. Go to "Settings" → "Domains"
4. Click "Add"
5. Type: `creatorapp.us`
6. Vercel will show you DNS records

**Typical records (but use what Vercel shows):**
```
A Record:
  Name: @
  Value: 76.76.21.21

CNAME Record:
  Name: www
  Value: cname.vercel-dns.com
```

### Step 3: Add DNS Records in GoDaddy

**Add A Record:**
1. In GoDaddy DNS, click "Add New Record"
2. Type: `A`
3. Name: `@`
4. Value: `76.76.21.21` (or IP from Vercel)
5. TTL: 600 seconds
6. Click "Save"

**Add CNAME for www:**
1. Click "Add New Record"
2. Type: `CNAME`
3. Name: `www`
4. Value: `cname.vercel-dns.com` (or CNAME from Vercel)
5. TTL: 1 Hour
6. Click "Save"

**Add Wildcard for User Sites:**
1. Click "Add New Record"
2. Type: `CNAME`
3. Name: `*`
4. Value: `yhofzxqopjvrfufouqzt.supabase.co`
5. TTL: 1 Hour
6. Click "Save"

### Step 4: Remove Conflicts

**Important**: Delete these if they exist:
- Old A records for @
- Domain forwarding
- CNAME records that conflict

To remove forwarding:
1. GoDaddy → "My Products"
2. Find domain forwarding on creatorapp.us
3. Click "Manage" → "Delete"

---

## Phase 3: Verify in Vercel (5 minutes)

### Step 1: Add Domains in Vercel
1. Vercel Dashboard → Your Project
2. Settings → Domains
3. Add both:
   - `creatorapp.us`
   - `www.creatorapp.us`
4. Click "Add"

### Step 2: Wait for Verification
- Vercel checks DNS (usually 1-5 minutes)
- SSL certificate auto-generates
- Status should change to ✅ Valid

**If it fails:**
- Wait longer (DNS takes time)
- Double-check records match exactly
- Check [dnschecker.org](https://dnschecker.org) for `creatorapp.us`

---

## Phase 4: Make Yourself Admin (2 minutes)

### Step 1: Test Signup
1. Go to `https://creatorapp.us` (or Vercel URL if DNS not ready)
2. Click "Sign Up"
3. Use invitation code: `ADMIN2025`
4. Complete signup
5. Create your first site

### Step 2: Grant Admin Access

Go to Supabase:
1. https://supabase.com/dashboard
2. Your project → SQL Editor
3. Run this query (replace with YOUR email):

```sql
INSERT INTO platform_admins (user_id, role, permissions)
SELECT
  id,
  'super_admin',
  jsonb_build_object(
    'view_sites', true,
    'manage_sites', true,
    'view_users', true,
    'manage_users', true,
    'manage_billing', true,
    'view_analytics', true,
    'manage_platform_settings', true
  )
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO NOTHING;
```

### Step 3: Access Platform Admin
1. Go to `https://creatorapp.us/platform-admin`
2. You should see the admin dashboard
3. Go to "Invitation Codes"
4. Create more codes for users

---

## Phase 5: Test User Sites (5 minutes)

### Step 1: Create Test Site
1. In your account, create a site
2. Use slug: `demo`
3. Create and publish a page

### Step 2: Visit Subdomain
1. Go to: `https://demo.creatorapp.us`
2. Should show your published page

**Note**: Subdomains currently show Supabase URLs. To fix this, see GODADDY_SETUP_GUIDE.md for Cloudflare Worker setup.

---

## You're Live! 🎉

Your platform is now accessible at:
- **Main App**: https://creatorapp.us
- **Admin Panel**: https://creatorapp.us/platform-admin
- **User Sites**: https://{slug}.creatorapp.us

### Immediate Next Steps

1. **Create invitation codes** for beta users
2. **Test the complete flow**:
   - Give someone an invitation code
   - Have them sign up
   - Create a site
   - Publish content
3. **Set up monitoring** (optional):
   - Vercel Analytics (already included)
   - Supabase Dashboard monitoring

### Future Improvements

When you're ready to improve user subdomain routing:
1. Follow GODADDY_SETUP_GUIDE.md "Full Cloudflare Setup"
2. Change nameservers to Cloudflare
3. Set up Cloudflare Worker
4. User sites will look more professional

---

## Troubleshooting

**"DNS not found"**
- Wait 5-60 minutes for DNS propagation
- Check https://dnschecker.org for your domain
- Make sure you saved DNS records in GoDaddy

**"Site can't be reached"**
- Verify Vercel deployment succeeded
- Check domain is added in Vercel
- Ensure DNS records are correct

**"Invalid invitation code"**
- Codes are case-sensitive (use ADMIN2025 in caps)
- Check database has the codes (see migration)
- Try BETA100 or LAUNCH as alternatives

**Can't access /platform-admin**
- Make sure you ran the SQL query
- Use the exact email you signed up with
- Log out and log back in

---

## Status Check

After following this guide, you should have:

- ✅ App deployed to Vercel
- ✅ creatorapp.us pointing to Vercel
- ✅ SSL certificate active
- ✅ Platform admin access
- ✅ Invitation codes system working
- ✅ User sites functional (on subdomains)

**Total time**: ~30 minutes + DNS propagation (0-24 hours, usually under 1 hour)

---

## Need Help?

- Vercel not deploying? Check build logs in Vercel dashboard
- DNS not working? Use https://dnschecker.org to check propagation
- Can't become admin? Verify the SQL query email matches your signup email
- Edge functions failing? Check Supabase function logs

You're all set! Start inviting beta users! 🚀
