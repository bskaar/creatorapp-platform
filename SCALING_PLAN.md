# CreatorApp Scaling Plan

## Vercel Wildcard Domain Setup

Vercel does not accept `*.creatorapp.site` typed with an asterisk in the UI. Correct process:

1. Go to your Vercel project → **Settings** → **Domains**
2. Type `creatorapp.site` (root domain, no asterisk) and click Add
3. Vercel will show DNS records to configure — typically an `A` record or `CNAME`
4. Once `creatorapp.site` is verified, add `*.creatorapp.site` — Vercel accepts the wildcard only after the root is verified
5. In your DNS provider (GoDaddy, Cloudflare, etc.), add a wildcard record: `* → cname.vercel-dns.com`

The `vercel.json` routing rules for `*.creatorapp.site` subdomains are already correctly configured.

---

## Growth Stages

### Current → ~500 Users (No Changes Needed)

Architecture is solid. Supabase, Edge Functions, and Vercel handle this comfortably. Monitor Supabase connection count in the dashboard.

---

### 500 → 2,000 Users

| Area | Action |
|---|---|
| **Public site caching** | Verify Vercel Edge Cache is honoring the 5-min cache headers already set in the router — check response headers for `x-vercel-cache: HIT` |
| **Supabase connections** | Switch to the pooled connection string (`?pgbouncer=true`) if not already done |
| **AI costs** | Review per-plan limits in `useAIUsage` against actual Anthropic bill monthly |
| **Email volume** | Upgrade Resend plan before hitting the free tier sending cap (~3k emails/day) |
| **Wildcard SSL** | Vercel handles wildcard SSL automatically once the wildcard domain is added — no per-user cert management needed |

---

### 2,000 → 10,000 Users

| Area | Action |
|---|---|
| **Database reads** | Add a Redis/Upstash cache layer in front of frequently-read site data (site config, pages) in the Edge Function |
| **Public site router** | Consider migrating from Edge Function to Vercel Edge Middleware for better caching primitives and lower latency |
| **Storage / CDN** | Put a CDN (Cloudflare R2 or similar) in front of Supabase Storage for product images to reduce bandwidth costs |
| **Supabase plan** | Upgrade to Supabase Pro → Team plan as DB size and connections grow |
| **Background jobs** | Move `process-workflows` and `send-trial-reminders` to `pg_cron` (already supported by Supabase) for reliable scheduling |

---

### 10,000+ Users

| Area | Action |
|---|---|
| **Multi-region** | Deploy Edge Functions to multiple regions (Supabase supports regional deployments) |
| **Read replicas** | Use Supabase Enterprise read replicas — route public site reads to replicas to reduce primary DB load |
| **Custom domain automation** | Integrate Vercel's domain API to programmatically add custom domains server-side, removing the manual DNS setup requirement per user |
| **Observability** | Add structured logging to Edge Functions (Axiom or Datadog). Current `errorTracking.ts` is a foundation but needs a real data sink at scale |

---

## Immediate Priority

Add the wildcard domain in Vercel as described at the top of this document. Everything else is reactive — address each stage as you approach it rather than over-engineering early.

---

*Generated: February 2026*
