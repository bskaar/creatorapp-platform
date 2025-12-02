# Custom Domain System Guide

## Overview

CreatorApp now supports both default CreatorApp subdomains and custom domains for user sites. This guide explains how the system works and how users can configure their domains.

## Domain Types

### 1. Default CreatorApp Subdomain
- **Format**: `{slug}.creatorapp.us`
- **Example**: `mysite.creatorapp.us`
- **Setup**: Automatic when user creates a site
- **Availability**: Always active, no configuration needed
- **Use Case**: Quick start, testing, users without custom domains

### 2. Custom Domain
- **Format**: Any domain the user owns
- **Examples**: `www.mysite.com`, `mysite.com`, `courses.mybrand.com`
- **Setup**: User must configure DNS records
- **Availability**: After DNS verification
- **Use Case**: Professional branding, SEO, custom brand identity

## Database Schema

### Sites Table - New Fields

```sql
-- Domain verification status
domain_verification_status text DEFAULT 'not_verified'
  CHECK (domain_verification_status IN ('not_verified', 'pending', 'verified', 'failed'))

-- Verification token for DNS TXT record
domain_verification_token text

-- Timestamp when domain was verified
domain_verified_at timestamptz

-- DNS configuration and status
dns_records jsonb DEFAULT '{}'::jsonb

-- SSL certificate status
ssl_status text DEFAULT 'not_provisioned'
  CHECK (ssl_status IN ('not_provisioned', 'provisioning', 'active', 'failed'))
```

## How It Works

### User Flow

1. **Site Creation**
   - User creates site with a slug (e.g., "my-academy")
   - Site is immediately available at `my-academy.creatorapp.us`

2. **Custom Domain Setup** (Optional)
   - User goes to Settings → Domain
   - Enters their custom domain (e.g., "www.myacademy.com")
   - System generates a verification token
   - User gets DNS configuration instructions

3. **DNS Configuration**
   - User logs into their domain provider (GoDaddy, Namecheap, Cloudflare, etc.)
   - Adds two DNS records:
     - **CNAME**: Points domain to `{slug}.creatorapp.us`
     - **TXT**: `_creatorapp-verification` with verification token
   - Waits 5-60 minutes for DNS propagation

4. **Domain Verification**
   - User clicks "Verify Domain" button
   - System checks DNS records via Google DNS API
   - If both records are correct, domain is marked as verified
   - Site is now accessible via custom domain

### DNS Records Required

#### CNAME Record
```
Type: CNAME
Name: www (or @)
Value: {slug}.creatorapp.us
TTL: 3600
```

#### TXT Record (Verification)
```
Type: TXT
Name: _creatorapp-verification
Value: crtr_verify_abc123def456...
TTL: 3600
```

## Edge Functions

### 1. verify-domain
**Purpose**: Verifies DNS configuration for custom domains

**Endpoint**: `{SUPABASE_URL}/functions/v1/verify-domain`

**Method**: POST

**Request**:
```json
{
  "site_id": "uuid",
  "domain": "www.mysite.com"
}
```

**Process**:
1. Queries Google DNS API for TXT record
2. Queries Google DNS API for CNAME record
3. Validates both records match expected values
4. Updates database with verification status

**Response** (Success):
```json
{
  "verified": true,
  "message": "Domain verified successfully!"
}
```

**Response** (Failure):
```json
{
  "verified": false,
  "message": "Domain verification failed: TXT record not found or incorrect",
  "details": {
    "txt_verified": false,
    "cname_verified": true,
    "errors": ["TXT record not found or incorrect"]
  }
}
```

### 2. public-site-router
**Purpose**: Serves public sites on both subdomains and custom domains

**Endpoint**: `{SUPABASE_URL}/functions/v1/public-site-router`

**Method**: GET

**Query Parameters**:
- `domain`: The domain being accessed (e.g., "mysite.com")
- `path`: The page path (e.g., "/about")

**Process**:
1. Extracts domain from request
2. Looks up site by:
   - Custom domain (if verified)
   - CreatorApp subdomain (from slug)
3. Fetches site pages and products
4. Generates HTML response with site content
5. Returns rendered HTML

**Features**:
- Automatic routing based on domain
- 404 pages for missing content
- SEO-optimized HTML output
- Responsive design
- Product listings
- Custom branding (colors, name)

## UI Components

### DomainSettings Component
Located: `src/components/settings/DomainSettings.tsx`

**Features**:
- Display current default subdomain
- Custom domain input and validation
- DNS configuration instructions
- Copy-to-clipboard for DNS records
- Verification status badges
- Domain verification button
- Domain removal option

**Status Badges**:
- 🟢 **Verified**: Domain is active and working
- 🟡 **Pending**: DNS records configured, awaiting verification
- 🔴 **Failed**: Verification failed, DNS records need correction
- ⚪ **Not Verified**: No custom domain configured

## Settings Integration

The Domain tab has been added to Settings page:
- Settings → Domain
- Icon: Globe
- Position: Second tab (after General, before Subscription)

## Public Site Access

### Subdomain Access
```
https://{slug}.creatorapp.us
https://{slug}.creatorapp.us/about
https://{slug}.creatorapp.us/products
```

### Custom Domain Access (After Verification)
```
https://www.mysite.com
https://www.mysite.com/about
https://www.mysite.com/products
```

## Implementation Notes

### DNS Verification
- Uses Google's public DNS resolver API (`https://dns.google/resolve`)
- Checks both TXT and CNAME records
- No external API keys required
- Fast and reliable
- Works globally

### Security
- Only site owners can configure domains
- Verification token prevents hijacking
- RLS policies enforce access control
- Service role key used in edge functions

### Limitations & Future Enhancements

**Current Limitations**:
1. No automatic SSL certificate provisioning
2. No automatic subdomain creation (requires DNS provider integration)
3. No www → non-www redirect (or vice versa)
4. No domain transfer between sites
5. No multiple domains per site

**Future Enhancements**:
1. Automatic SSL via Let's Encrypt or Cloudflare
2. Cloudflare integration for automatic DNS
3. Domain health monitoring and alerts
4. A/B testing across domains
5. CDN integration for faster loading
6. Custom nameservers option
7. Domain analytics and traffic stats

## Testing

### Test Default Subdomain
1. Create a site with slug "test-site"
2. Visit edge function URL:
   ```
   {SUPABASE_URL}/functions/v1/public-site-router?domain=test-site.creatorapp.us&path=/
   ```

### Test Custom Domain
1. Configure DNS records for your domain
2. Verify domain in Settings
3. Visit edge function URL:
   ```
   {SUPABASE_URL}/functions/v1/public-site-router?domain=yourdomain.com&path=/
   ```

## Common Issues & Solutions

### "Domain verification failed"
- **Cause**: DNS records not configured correctly
- **Solution**: Double-check TXT and CNAME records, wait longer for DNS propagation

### "TXT record not found"
- **Cause**: TXT record missing or wrong subdomain
- **Solution**: Ensure TXT record name is exactly `_creatorapp-verification`

### "CNAME record not found"
- **Cause**: CNAME record missing or pointing to wrong target
- **Solution**: Verify CNAME points to `{slug}.creatorapp.us`

### "DNS changes not taking effect"
- **Cause**: DNS propagation delay
- **Solution**: Wait 5-60 minutes, some providers take up to 48 hours

## Production Deployment Considerations

For production deployment, you'll need:

1. **Wildcard DNS Setup**
   - Configure `*.creatorapp.us` to point to your edge function
   - Set up wildcard SSL certificate

2. **CDN Configuration**
   - Use Cloudflare or similar CDN
   - Cache static assets
   - Enable HTTP/2 and Brotli compression

3. **SSL Certificates**
   - Automatic SSL for subdomains (via Cloudflare or Let's Encrypt)
   - SSL verification for custom domains

4. **Domain Routing**
   - Web server or reverse proxy to route requests to edge function
   - Handle both subdomain and custom domain traffic

5. **Monitoring**
   - Track domain verification status
   - Monitor edge function performance
   - Alert on SSL certificate expiration

## Support for Users

### Domain Provider Resources

**GoDaddy**:
- DNS Settings: Domain → Manage → DNS
- [Help Guide](https://www.godaddy.com/help/manage-dns-680)

**Namecheap**:
- DNS Settings: Domain List → Manage → Advanced DNS
- [Help Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/)

**Cloudflare**:
- DNS Settings: Select Domain → DNS
- [Help Guide](https://support.cloudflare.com/hc/en-us/articles/360019093151)

**Google Domains**:
- DNS Settings: My Domains → DNS
- [Help Guide](https://support.google.com/domains/answer/3290350)

## Summary

The custom domain system provides users with:
- **Flexibility**: Use default subdomain or custom domain
- **Professional Branding**: Custom domains for better SEO and trust
- **Easy Setup**: Clear instructions and automated verification
- **Reliability**: DNS verification ensures proper configuration
- **Security**: Token-based verification prevents domain hijacking

Users can start immediately with their CreatorApp subdomain and add a custom domain later when they're ready to scale their brand.
