# GoDaddy Setup Guide for CreatorApp.us

Complete step-by-step guide to publish CreatorApp on your GoDaddy domain.

## Overview

We'll configure:
- **Main App**: `creatorapp.us` and `www.creatorapp.us` → Your React app
- **User Sites**: `*.creatorapp.us` (e.g., `mystore.creatorapp.us`) → Edge functions

## Prerequisites

- [x] GoDaddy account with creatorapp.us domain
- [x] Supabase project running
- [x] Application built and ready to deploy

---

## Recommended Setup: Vercel + GoDaddy

**Why Vercel?**
- Free tier with great performance
- Automatic SSL certificates
- Easy integration with GoDaddy
- Perfect for React/Vite apps
- Built-in analytics

### Step 1: Deploy to Vercel

#### 1.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub/GitLab/Email

#### 1.2 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

#### 1.3 Deploy Your App

**Option A: Via CLI (Quickest)**
```bash
# From your project directory
cd /tmp/cc-agent/58775445/project

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? creatorapp
# - In which directory is your code located? ./
# - Want to modify settings? N

# Deploy to production
vercel --prod
```

**Option B: Via GitHub (Recommended for ongoing updates)**
1. Push code to GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://yhofzxqopjvrfufouqzt.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
6. Click "Deploy"

#### 1.4 Note Your Vercel Domain
After deployment, you'll get a URL like:
```
https://creatorapp.vercel.app
```
**Keep this URL handy** - we'll need it for GoDaddy.

---

### Step 2: Configure GoDaddy DNS

#### 2.1 Login to GoDaddy
1. Go to [godaddy.com](https://www.godaddy.com)
2. Login to your account
3. Click "My Products"
4. Find "creatorapp.us" and click "DNS"

#### 2.2 Get Vercel DNS Information

In Vercel Dashboard:
1. Go to your project settings
2. Click "Domains"
3. Click "Add Domain"
4. Enter `creatorapp.us`
5. Vercel will show you DNS records to configure

**Typical Vercel DNS Records:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 2.3 Configure DNS in GoDaddy

**For Main Domain (creatorapp.us):**

1. In GoDaddy DNS Management, click "Add New Record"
2. Add A Record:
   - **Type**: A
   - **Name**: @ (this means root domain)
   - **Value**: 76.76.21.21 (or the IP Vercel provides)
   - **TTL**: 600 seconds (default)
3. Click "Save"

4. Add CNAME for www:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: cname.vercel-dns.com
   - **TTL**: 1 Hour
5. Click "Save"

**For User Subdomains (*.creatorapp.us):**

This is where user sites will be hosted. We'll point this to Cloudflare Workers (next section).

For now, add this record:
- **Type**: CNAME
- **Name**: * (wildcard)
- **Value**: yhofzxqopjvrfufouqzt.supabase.co
- **TTL**: 1 Hour

**Your DNS should look like this:**
```
Type    Name    Value                                    TTL
----    ----    -----                                    ---
A       @       76.76.21.21                              600
CNAME   www     cname.vercel-dns.com                     1 Hour
CNAME   *       yhofzxqopjvrfufouqzt.supabase.co        1 Hour
```

#### 2.4 Remove Conflicting Records

**Important**: Delete these if they exist:
- Any existing A record for @ (if it points elsewhere)
- Any CNAME for @ (can't have both A and CNAME)
- Domain forwarding (we're using DNS instead)

To check for domain forwarding:
1. In GoDaddy, go to "My Products"
2. Click "All Products and Services"
3. Look for "Forwarding" on creatorapp.us
4. If exists, click "Manage" → "Delete" forwarding

---

### Step 3: Configure Custom Domain in Vercel

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add domains:
   - `creatorapp.us`
   - `www.creatorapp.us`
4. Vercel will verify DNS configuration
5. Wait for SSL certificate (automatic, takes 1-5 minutes)

**Verification Status:**
- ✅ Valid Configuration - You're good!
- ⏳ Pending Verification - Wait a few minutes
- ❌ Invalid Configuration - Double-check DNS records

---

### Step 4: Set Up User Subdomain Routing

User sites need special routing. We'll use Cloudflare Workers (Free tier).

#### 4.1 Add Domain to Cloudflare

**Why Cloudflare?**
- Free tier includes Workers
- Can route subdomains to edge functions
- Keeps your main domain on Vercel
- Provides DDoS protection

**Steps:**

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Click "Add a Site"
3. Enter: `creatorapp.us`
4. Select "Free" plan
5. Cloudflare will scan your DNS

**IMPORTANT**: We're using Cloudflare ONLY for subdomain routing, not the main domain.

#### 4.2 Partial Cloudflare Setup

Instead of changing nameservers (which would break your Vercel setup), we'll use:

**Option A: Cloudflare for SaaS** (Advanced, requires paid plan)
- Allows you to route subdomains without changing nameservers
- $20/month minimum

**Option B: Subdomain Delegation** (Free alternative)

In GoDaddy DNS:
1. Change the wildcard CNAME:
   ```
   Type: NS
   Name: _subdomains
   Value: (delegate to Cloudflare)
   ```

**Actually, let's use the simpler approach:**

#### 4.3 Simpler Approach: Direct Edge Function Routing

Keep your current DNS setup with:
```
CNAME   *   yhofzxqopjvrfufouqzt.supabase.co
```

This routes ALL subdomains directly to your Supabase edge functions.

**Limitation**: User sites will show Supabase URLs in browser.

**To fix this**, we need a proxy. Here are your options:

---

## Alternative: Full Cloudflare Setup (Recommended)

This is the cleanest solution for both main app and user sites.

### Step 1: Change Nameservers to Cloudflare

#### 1.1 Add Site to Cloudflare
1. Go to [cloudflare.com](https://cloudflare.com)
2. Add `creatorapp.us`
3. Choose Free plan
4. Cloudflare will show you nameservers like:
   ```
   ada.ns.cloudflare.com
   liam.ns.cloudflare.com
   ```

#### 1.2 Update GoDaddy Nameservers
1. In GoDaddy, go to "My Products"
2. Find "creatorapp.us" → click "DNS"
3. Scroll to "Nameservers" section
4. Click "Change"
5. Select "Custom"
6. Remove GoDaddy nameservers
7. Add Cloudflare nameservers:
   - `ada.ns.cloudflare.com`
   - `liam.ns.cloudflare.com`
8. Click "Save"

**Wait 24-48 hours** for nameserver propagation (usually faster, 1-4 hours)

### Step 2: Configure DNS in Cloudflare

Once nameservers are active:

#### 2.1 Add DNS Records for Main App

In Cloudflare DNS:
```
Type    Name    Target                      Proxy
----    ----    ------                      -----
A       @       76.76.21.21                 ✅ Proxied
CNAME   www     cname.vercel-dns.com        ✅ Proxied
```

**Important**: Enable "Proxied" (orange cloud) for these records.

#### 2.2 Configure SSL in Cloudflare
1. Go to SSL/TLS → Overview
2. Set mode to "Full (strict)"
3. Enable "Always Use HTTPS"

### Step 3: Create Cloudflare Worker for Subdomain Routing

#### 3.1 Create Worker
1. In Cloudflare dashboard, go to "Workers & Pages"
2. Click "Create application"
3. Select "Create Worker"
4. Name it: `creatorapp-router`
5. Click "Deploy"

#### 3.2 Edit Worker Code

Click "Edit Code" and replace with:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname

  // Main app - pass through to Vercel
  if (hostname === 'creatorapp.us' || hostname === 'www.creatorapp.us') {
    return fetch(request)
  }

  // User subdomains - route to edge function
  if (hostname.endsWith('.creatorapp.us')) {
    const slug = hostname.replace('.creatorapp.us', '')

    // Build edge function URL
    const edgeFunctionUrl = new URL('https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/public-site-router')
    edgeFunctionUrl.searchParams.set('domain', hostname)
    edgeFunctionUrl.searchParams.set('path', url.pathname)

    // Fetch from edge function
    const response = await fetch(edgeFunctionUrl.toString())

    // Return response with proper headers
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('X-Served-By', 'CreatorApp-Router')

    return newResponse
  }

  // Fallback
  return new Response('Not Found', { status: 404 })
}
```

#### 3.3 Save and Deploy Worker
Click "Save and Deploy"

### Step 4: Add Worker Route

1. In Cloudflare dashboard, go to "Websites"
2. Click on `creatorapp.us`
3. Go to "Workers Routes"
4. Click "Add route"
5. Configure:
   - **Route**: `*.creatorapp.us/*`
   - **Worker**: `creatorapp-router`
6. Click "Save"

---

## Testing Your Setup

### Test Main App
1. Open browser
2. Go to `https://creatorapp.us`
3. Should load your React app
4. Try signing up with code `ADMIN2025`

### Test User Subdomains
1. Create a test site in your app
2. Use slug: `test`
3. Publish a page
4. Visit: `https://test.creatorapp.us`
5. Should load the user site

### Check SSL
Both should show 🔒 (secure) in browser.

---

## Troubleshooting

### "Site not found" or "DNS_PROBE_FAILED"
- **Cause**: DNS not propagated yet
- **Solution**: Wait 1-24 hours, check [dnschecker.org](https://dnschecker.org)

### "Too many redirects"
- **Cause**: SSL mode mismatch
- **Solution**: In Cloudflare SSL/TLS, set to "Full (strict)"

### Main app works but subdomains don't
- **Cause**: Worker route not configured
- **Solution**: Check Workers Routes in Cloudflare

### Vercel says "Domain not verified"
- **Cause**: DNS records incorrect
- **Solution**: Match exactly what Vercel shows in domain settings

---

## Quick Start Checklist

**Choose Your Approach:**

### Option 1: Vercel + Direct Supabase (Simplest, 30 mins)
- [ ] Deploy to Vercel
- [ ] Add DNS records in GoDaddy (A, CNAME www, CNAME *)
- [ ] Add custom domain in Vercel
- [ ] Test main app
- [ ] Note: User subdomains will show Supabase URLs

### Option 2: Full Cloudflare (Best, 2-48 hours)
- [ ] Add site to Cloudflare
- [ ] Change GoDaddy nameservers to Cloudflare
- [ ] Wait for propagation
- [ ] Configure DNS in Cloudflare
- [ ] Create Cloudflare Worker
- [ ] Add Worker route
- [ ] Test everything

**I recommend Option 2** for the best user experience.

---

## Next Steps After Setup

1. **Make yourself admin**:
   ```sql
   INSERT INTO platform_admins (user_id, role, permissions)
   SELECT id, 'super_admin',
     '{"view_sites":true,"manage_sites":true,"view_users":true,"manage_users":true,"manage_billing":true,"view_analytics":true,"manage_platform_settings":true}'::jsonb
   FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. **Create invitation codes** at `/platform-admin/invitation-codes`

3. **Test complete user flow**:
   - Signup with code
   - Create site
   - Publish page
   - Visit subdomain

4. **Configure Stripe Live Mode** (when ready)
   - See LIVE_STRIPE_SETUP_GUIDE.md

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| GoDaddy Domain | Yearly | ~$20/year |
| Vercel | Free/Pro | $0 or $20/month |
| Cloudflare | Free | $0 |
| Supabase | Free/Pro | $0 or $25/month |

**Total**: $20-$65/month depending on usage

---

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Cloudflare Docs**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **GoDaddy DNS Help**: [godaddy.com/help/dns-management](https://www.godaddy.com/help/manage-dns-680)
- **DNS Checker**: [dnschecker.org](https://dnschecker.org)

---

## You're Ready!

Start with **Option 2 (Full Cloudflare)** for the best results. The nameserver change is the slowest part, but once done, everything else is quick.

Let me know which option you want to pursue and I can provide more detailed steps!
