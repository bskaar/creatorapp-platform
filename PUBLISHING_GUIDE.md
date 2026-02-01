# Publishing Guide: CreatorApp.us Domain Setup

This guide will help you publish the CreatorApp platform to the CreatorApp.us domain.

## Overview

The CreatorApp platform supports:
- **Main App**: `creatorapp.us` - Platform dashboard and admin interface
- **User Sites**: `{slug}.creatorapp.us` - Individual user sites (e.g., `mystore.creatorapp.us`)
- **Custom Domains**: User-owned domains that point to their sites

## Current System Architecture

### Backend (Supabase)
- **Project URL**: `https://yhofzxqopjvrfufouqzt.supabase.co`
- **Database**: PostgreSQL with all tables and RLS policies
- **Edge Functions**:
  - `/functions/v1/public-site-router` - Serves user sites
  - `/functions/v1/stripe-webhook` - Handles Stripe payments
  - `/functions/v1/stripe-connect-oauth` - Stripe Connect OAuth
  - And many more...

### Frontend (React + Vite)
- **Built with**: React 18, TypeScript, Tailwind CSS
- **Router**: React Router for SPA navigation
- **Current Location**: `/tmp/cc-agent/58775445/project`

---

## Deployment Steps

### Step 1: Build the Application

```bash
cd /tmp/cc-agent/58775445/project
npm run build
```

This creates a production build in the `dist/` folder.

### Step 2: Choose Hosting Platform

You have several options for hosting:

#### Option A: Vercel (Recommended)

**Pros**: Easy deployment, automatic SSL, great for SPAs

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Domain**:
   - Go to Vercel dashboard
   - Add custom domain: `creatorapp.us`
   - Follow DNS configuration instructions

4. **Set Environment Variables**:
   In Vercel dashboard, add:
   ```
   VITE_SUPABASE_URL=https://yhofzxqopjvrfufouqzt.supabase.co
   VITE_SUPABASE_ANON_KEY=(your anon key)
   ```

#### Option B: Netlify

**Pros**: Similar to Vercel, great analytics

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Configure Domain** in Netlify dashboard

#### Option C: Cloudflare Pages

**Pros**: Global CDN, DDoS protection

1. Connect GitHub repo to Cloudflare Pages
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add custom domain

#### Option D: Traditional Web Host (cPanel, etc.)

1. Build locally: `npm run build`
2. Upload `dist/` contents to web root
3. Configure `.htaccess` for SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## Step 3: DNS Configuration

### For Main App (creatorapp.us)

In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**If using Vercel/Netlify/Cloudflare:**
Follow their specific DNS instructions (usually CNAME or A records)

**Example for Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For User Subdomains (*.creatorapp.us)

**Wildcard DNS Record:**
```
Type: A
Name: *
Value: (Your hosting IP or edge function URL)
```

OR if using Cloudflare/edge hosting:
```
Type: CNAME
Name: *
Value: yhofzxqopjvrfufouqzt.supabase.co
```

---

## Step 4: Configure Routing for User Sites

User sites need to route through the `public-site-router` edge function.

### Option 1: Cloudflare Workers (Recommended)

Create a Cloudflare Worker to route subdomain requests:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname

  // Main app domains - serve from hosting
  if (hostname === 'creatorapp.us' || hostname === 'www.creatorapp.us') {
    return fetch(request)
  }

  // User subdomains - route to edge function
  if (hostname.endsWith('.creatorapp.us')) {
    const edgeFunctionUrl = `https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/public-site-router?domain=${hostname}&path=${url.pathname}`
    return fetch(edgeFunctionUrl)
  }

  return fetch(request)
}
```

### Option 2: Nginx Reverse Proxy

If using traditional hosting with Nginx:

```nginx
server {
    server_name *.creatorapp.us;

    location / {
        proxy_pass https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/public-site-router?domain=$host&path=$request_uri;
        proxy_set_header Host $host;
    }
}

server {
    server_name creatorapp.us www.creatorapp.us;
    root /var/www/creatorapp/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Step 5: SSL Certificates

### Automatic SSL (Recommended)
- **Vercel/Netlify/Cloudflare**: Automatic SSL included
- **Let's Encrypt** (for traditional hosting):
  ```bash
  certbot --nginx -d creatorapp.us -d *.creatorapp.us
  ```

### Wildcard Certificate
For `*.creatorapp.us`, you'll need DNS validation with Let's Encrypt.

---

## Step 6: Update Webhook URLs

After deploying, update Stripe webhook URLs in your Stripe Dashboard:

**Test Mode:**
```
https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-webhook
```

**Live Mode (when ready):**
```
https://api.creatorapp.us/functions/v1/stripe-webhook
```

Or keep using Supabase edge function URLs directly.

---

## Step 7: Update OAuth Redirect URLs

### Stripe Connect OAuth

In Stripe Dashboard → Settings → Connect:
```
https://yhofzxqopjvrfufouqzt.supabase.co/functions/v1/stripe-connect-oauth
```

---

## Step 8: Test Everything

### Test Main App
1. Visit `https://creatorapp.us`
2. Sign up with invitation code: `ADMIN2025`
3. Create a site
4. Test dashboard functionality

### Test User Sites
1. Create a test site with slug `test`
2. Publish a page
3. Visit `https://test.creatorapp.us`
4. Verify site loads correctly

### Test Custom Domains
1. Go to Settings → Domain
2. Add a test custom domain
3. Configure DNS
4. Verify domain

---

## Invitation Code System

The platform now requires invitation codes for signup. As a platform admin:

### Initial Codes Created
- **ADMIN2025** - Single use, for your admin account
- **BETA100** - 100 uses, for beta testers
- **LAUNCH** - Unlimited uses, for public launch

### Managing Codes
1. Login as platform admin
2. Go to Platform Admin → Invitation Codes
3. Create/edit/deactivate codes as needed

### Making Your Account Platform Admin

**IMPORTANT**: After creating your first account, you need to make yourself a platform admin:

```sql
-- Run this in Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual email

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

Then access platform admin at: `https://creatorapp.us/platform-admin`

---

## Environment Variables

### Production Environment Variables

Make sure these are set in your hosting platform:

```env
VITE_SUPABASE_URL=https://yhofzxqopjvrfufouqzt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Edge Function Secrets

These are already configured in Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_CLIENT_ID`

---

## Performance Optimization

### CDN Configuration
- Enable Brotli compression
- Set cache headers for static assets
- Use HTTP/2

### Caching Strategy
```
HTML files: no-cache
JS/CSS files: cache for 1 year (with hash in filename)
Images: cache for 1 month
API calls: no-cache
```

---

## Monitoring

### Set Up Monitoring
1. **Uptime Monitoring**: UptimeRobot or Pingdom
2. **Error Tracking**: Sentry (already partially integrated)
3. **Analytics**: Google Analytics or Plausible

### Key Metrics to Track
- Main app uptime
- User site load times
- Edge function response times
- Database query performance
- Stripe webhook success rate

---

## Troubleshooting

### "Site Not Found" on Subdomain
- Check DNS propagation (use `dig test.creatorapp.us`)
- Verify wildcard DNS is configured
- Check public-site-router edge function logs

### Signup Not Working
- Verify invitation code is valid and active
- Check Supabase auth logs
- Ensure email confirmation is disabled in Supabase

### Stripe Webhooks Failing
- Verify webhook secret matches
- Check Supabase edge function logs
- Test webhook endpoint manually

---

## Production Checklist

Before going live:

- [ ] Build completes without errors
- [ ] All environment variables set
- [ ] DNS configured (main domain + wildcard)
- [ ] SSL certificates active
- [ ] Invitation codes created
- [ ] Platform admin account created
- [ ] Test signup flow
- [ ] Test creating a site
- [ ] Test publishing pages
- [ ] Test subdomain routing
- [ ] Test custom domain setup
- [ ] Stripe test mode working
- [ ] Monitoring tools configured
- [ ] Backup strategy in place

---

## Next Steps After Publishing

1. **Switch to Stripe Live Mode**
   - Follow LIVE_STRIPE_SETUP_GUIDE.md
   - Update product price IDs
   - Configure live webhooks

2. **Marketing & Launch**
   - Share invitation codes with early users
   - Monitor for issues
   - Collect feedback

3. **Scale Preparation**
   - Monitor database performance
   - Set up database backups
   - Plan for CDN if traffic grows

---

## Support

For issues or questions:
- Check Supabase logs
- Review error monitoring
- Check this guide's troubleshooting section
- Review Supabase and Vercel/Netlify docs

---

**You're Ready to Publish!**

Start with Step 1 (Build) and work through each step. The platform is designed to be production-ready and includes invitation code gating to control early access.
