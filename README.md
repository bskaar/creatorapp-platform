# Creator CMS - Production-Grade Content Management System

A comprehensive, Kajabi-style CMS platform for content creators with integrated commerce, email marketing, funnels, webinars, and AI-powered features.

## Features

### Core Platform
- **Multi-tenant Architecture** - Each creator gets their own isolated workspace
- **Role-Based Access Control** - Owner, Admin, Marketer, Support, Creator, and Member roles
- **Three-Tier Pricing** - Launch, Growth, and Scale plans with usage tracking

### Content Management
- **Content Library** - Create and manage courses, memberships, and digital products
- **Lesson Management** - Organize content with videos, audio, text, PDFs, and quizzes
- **Progress Tracking** - Monitor member progress through lessons
- **Secure Media Delivery** - Time-limited signed URLs for content protection

### Funnels & Pages
- **Funnel Builder** - Create multi-step customer journeys
- **Page Builder** - Drag-and-drop landing pages, sales pages, checkouts
- **A/B Testing** - Test page variants (Growth tier and above)
- **Form Builder** - Custom forms with submission tracking

### Email Marketing
- **Broadcast Campaigns** - One-time email sends to segments
- **Automated Sequences** - Drip campaigns with trigger-based automation
- **Email Templates** - Reusable templates with drag-and-drop editor
- **Advanced Analytics** - Open rates, click rates, and conversion tracking

### Commerce
- **Multi-Payment Support** - PayPal, Shopify, and Stripe integrations
- **Order Management** - Track all purchases and refunds
- **Subscription Management** - Recurring billing with dunning logic
- **Access Control** - Automatic product access provisioning

### Webinars
- **Live & Automated Webinars** - Schedule and host webinar events
- **Registration Pages** - Custom registration with email confirmations
- **Attendance Tracking** - Monitor engagement and watch duration
- **Replay Management** - Time-limited replay access

### CRM & Contacts
- **Contact Database** - Centralized customer and lead management
- **Tag System** - Organize contacts with custom tags
- **Activity Timeline** - Unified view of all contact interactions
- **Segmentation** - Advanced filtering and list building
- **RFM Analysis** - Recency, Frequency, Monetary scoring

### Analytics
- **Event Tracking** - Comprehensive analytics for all user interactions
- **Funnel Analytics** - Step-by-step conversion tracking
- **Revenue Reporting** - Sales, subscriptions, and MRR tracking
- **Contact Analytics** - Engagement and behavior analysis

### AI Features (OpenAI Integration)
- **Copy Generation** - AI-powered headlines, subject lines, and CTAs
- **Content Recommendations** - Personalized product suggestions
- **Analytics Insights** - Automated performance explanations
- **Smart Tagging** - Automatic content organization

### Security (Cloudflare Integration)
- **WAF Protection** - Web Application Firewall for DDoS mitigation
- **Bot Protection** - Turnstile verification on all public forms
- **CDN Delivery** - Global content delivery for performance
- **Edge Workers** - Signed URL generation at the edge
- **SSL/TLS** - Automatic HTTPS for all domains

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Payments**: PayPal SDK + Shopify Storefront API
- **Email**: Resend (recommended) or SendGrid
- **AI**: OpenAI API
- **Security**: Cloudflare (WAF + Turnstile + Workers)

## Database Schema

The platform uses a comprehensive PostgreSQL schema with:

- **Sites** - Multi-tenant workspaces
- **Profiles** - Extended user information
- **Site Members** - Team member roles and permissions
- **Products & Lessons** - Content library structure
- **Contacts & Tags** - CRM database
- **Funnels & Pages** - Marketing funnel infrastructure
- **Email Campaigns & Sequences** - Email marketing system
- **Orders & Subscriptions** - Commerce tracking
- **Webinars & Registrations** - Event management
- **Analytics Events** - Comprehensive event tracking

All tables have Row Level Security (RLS) enabled for multi-tenant isolation.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- (Optional) PayPal, Shopify, OpenAI, Cloudflare accounts for full functionality

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
npm run dev
```

### Database Setup

The database migrations are already configured in Supabase. Ensure you've run:

1. `01_initial_schema_core_tables.sql`
2. `02_funnels_pages_email_schema.sql`
3. `03_commerce_webinars_analytics_schema.sql`

### First Steps

1. Sign up for an account at `/signup`
2. Create your first site during signup
3. Explore the dashboard and create your first product
4. Build a funnel and start collecting contacts
5. Configure payment integrations in Commerce settings

## Tier Limits

### Launch Plan
- 1 site
- 3 products
- 10,000 contacts
- 50,000 emails/month
- Basic features

### Growth Plan
- 2 sites
- Unlimited products
- 50,000 contacts
- 100,000 emails/month
- A/B testing
- Advanced automations
- Webinars
- Shopify sync

### Scale Plan
- 5 sites
- Unlimited products
- 250,000 contacts
- 500,000 emails/month
- All Growth features
- Multi-site management
- SSO
- Dedicated IP
- Priority support
- API rate boosts

## Architecture Highlights

### Multi-Tenancy
Every table includes a `site_id` foreign key with RLS policies ensuring users can only access data from their authorized sites.

### Role-Based Permissions
- **Owner**: Full access to everything
- **Admin**: Manage all content and settings except billing
- **Marketer**: Manage funnels, pages, emails, and campaigns
- **Support**: View data and manage contacts/orders
- **Creator**: Create and manage content library
- **Member**: View purchased content only

### Security Best Practices
- All sensitive data encrypted at rest
- JWT-based authentication
- Time-limited signed URLs for media
- CSRF protection
- Rate limiting on all endpoints
- Turnstile bot protection on public forms

## Roadmap

Future enhancements planned:

- [ ] Advanced page builder with more block types
- [ ] SMS marketing integration
- [ ] Affiliate program management
- [ ] Community forums
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced reporting dashboards
- [ ] Third-party integrations marketplace
- [ ] White-label options
- [ ] API documentation and public API

## Support

For questions and support:
- Documentation: [Coming Soon]
- Email: support@example.com
- Discord: [Coming Soon]

## License

Proprietary - All rights reserved
