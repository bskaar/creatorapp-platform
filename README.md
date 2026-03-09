# CreatorApp - AI-Native Creator Platform

A comprehensive, Kajabi-style CMS platform for content creators with integrated commerce, email marketing, funnels, webinars, and AI-powered features.

## AI-Native Platform

**CreatorApp is AI-native—your AI Co-Founder isn't an add-on, it's built into every step of building and launching your creator business.**

CreatorApp was designed from the ground up with AI collaboration at its core. From your initial business gameplan to page content, email sequences, and strategic coaching—AI works alongside you as a true co-founder, not just a tool.

### What This Means for You

- **AI as a collaborator** - Works alongside you as a strategic partner
- **Context-aware assistance** - AI understands your business, goals, and audience
- **End-to-end support** - Help at every stage from planning to launch to optimization
- **No blank page** - Non-technical creators never start from zero

## Features

### Core Platform
- **Multi-tenant Architecture** - Each creator gets their own isolated workspace
- **Role-Based Access Control** - Owner, Admin, Marketer, Support, Creator, and Member roles
- **Four-Tier Subscription Model** - Starter (Free), Growth ($47/mo), Pro ($97/mo), and Enterprise plans
- **14-Day Free Trial** - All paid plans include a trial period
- **Invitation Code System** - Control platform access during beta

### Content Management
- **Content Library** - Create and manage courses, memberships, and digital products
- **Lesson Management** - Organize content with videos, audio, text, PDFs, and quizzes
- **Progress Tracking** - Monitor member progress through lessons
- **Secure Media Delivery** - Time-limited signed URLs for content protection

### Visual Page Builder
- **Drag-and-Drop Editor** - Build pages visually with 15+ block types
- **Page Templates** - 7 template categories with 20+ starter templates
- **Page Versioning** - Full version history with restore capability
- **Custom Blocks Library** - Save and reuse custom block designs
- **Global Sections** - Reusable sections across all pages
- **Device Preview** - Desktop, tablet, and mobile preview modes
- **Keyboard Shortcuts** - Power user productivity features

### Funnels & Pages
- **Funnel Builder** - Create multi-step customer journeys
- **Landing Pages** - High-converting sales pages, opt-in pages, checkouts
- **A/B Testing** - Test page variants (Growth tier and above)
- **Form Builder** - Custom forms with submission tracking

### Email Marketing
- **Broadcast Campaigns** - One-time email sends to segments
- **Automated Sequences** - Drip campaigns with trigger-based automation
- **Email Templates** - Reusable templates with drag-and-drop editor
- **Advanced Analytics** - Open rates, click rates, and conversion tracking
- **Trial Reminder System** - Automated reminders for trial expiration

### Commerce
- **Stripe Integration** - Secure payment processing
- **Stripe Connect** - Enable creators to accept payments with automatic payouts
- **Product Management** - Digital products, courses, memberships
- **Product Variants** - Size, color, and custom variant options
- **Order Management** - Track all purchases and fulfillment
- **Subscription Management** - Recurring billing with automatic access
- **Checkout Flow** - Streamlined purchase experience with success pages

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
- **Real-Time Metrics** - Live dashboard updates
- **Traffic Analytics** - Page views, visitors, and sources

### AI Features (Anthropic Claude Integration)
- **AI Co-Founder / Coach** - Strategic business guidance and chat assistance
- **AI Text Generation** - Headlines, descriptions, CTAs, and email copy
- **AI Page Generator** - Generate complete page layouts from descriptions
- **AI Color Palette** - Mood-based color scheme generation
- **AI Visual Theme Generator** - Complete theme creation with fonts and colors
- **AI Gameplan Generator** - Business strategy and action plan creation
- **AI Image Search** - Pexels integration for stock photos

### Domain Management
- **Custom Domains** - Connect your own domain to your site
- **DNS Verification** - Automated domain verification system
- **Vercel Integration** - Domain management through Vercel
- **Favicon Support** - Custom favicon upload and management

### Platform Administration
- **Platform Admin Dashboard** - Manage all sites and users
- **User Management** - View and manage platform users
- **AI Usage Tracking** - Monitor AI feature consumption
- **Audit Logging** - Track administrative actions
- **Database Backups** - Automated backup system
- **System Settings** - Platform-wide configuration

### Security
- **Row Level Security** - Database-level multi-tenant isolation
- **Rate Limiting** - API and feature usage protection
- **Error Monitoring** - Comprehensive error tracking system
- **Webhook Reliability** - Retry logic and delivery tracking
- **Session Management** - Secure JWT-based authentication

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Payments**: Stripe (Checkout, Connect, Webhooks)
- **Email**: Resend
- **AI**: Anthropic Claude API
- **Image Search**: Pexels API

## Database Schema

The platform uses a comprehensive PostgreSQL schema with:

- **Sites** - Multi-tenant workspaces with subscription tracking
- **Profiles** - Extended user information
- **Site Members** - Team member roles and permissions
- **Subscription Plans** - Platform pricing tiers with trial support
- **Products & Lessons** - Content library structure
- **Product Variants** - SKU and inventory management
- **Product Access** - Content access provisioning
- **Contacts & Tags** - CRM database
- **Funnels & Pages** - Marketing funnel infrastructure
- **Page Templates** - Pre-built page designs
- **Page Versions** - Version history system
- **Custom Blocks** - Saved block library
- **Global Sections** - Reusable page sections
- **Email Campaigns & Sequences** - Email marketing system
- **Orders** - Commerce tracking with fulfillment
- **Webinars & Registrations** - Event management
- **Analytics Events** - Comprehensive event tracking
- **Marketing Pages** - Public marketing content
- **Custom Domains** - Domain management
- **Invitation Codes** - Beta access control
- **AI Co-Founder Sessions** - AI chat history
- **Trial Reminders** - Trial notification tracking
- **Platform Admins** - Administrative access
- **Rate Limits** - Usage tracking
- **Error Logs** - Error monitoring

All tables have Row Level Security (RLS) enabled for multi-tenant isolation.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- Anthropic API key (for AI features)
- Resend account (for emails)
- Pexels API key (for image search)

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Edge function secrets (configured in Supabase):
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ANTHROPIC_API_KEY` - Claude API key
- `RESEND_API_KEY` - Resend email API key
- `PEXELS_API_KEY` - Pexels image search key

### Installation

```bash
npm install
npm run dev
```

### Database Setup

The database schema is managed through Supabase migrations. Over 50 migration files handle:

1. Core tables (sites, profiles, site_members)
2. Content management (products, lessons, pages)
3. Commerce (orders, product_access, variants)
4. Email marketing (campaigns, sequences, logs)
5. Analytics and tracking
6. AI features and usage
7. Platform administration
8. Security and rate limiting

### First Steps

1. Sign up for an account at `/signup`
2. Enter an invitation code (if required during beta)
3. Create your first site during onboarding
4. Complete the getting started checklist
5. Build your first page with the visual editor
6. Configure Stripe Connect for payments
7. Create products and start selling

## Subscription Plans

### Starter (Free)
- 1 site
- 3 products
- 1,000 contacts
- Basic page builder
- Community support

### Growth ($47/month or $470/year)
- 3 sites
- Unlimited products
- 10,000 contacts
- AI features included
- A/B testing
- Priority support
- 14-day free trial

### Pro ($97/month or $970/year)
- 10 sites
- Unlimited products
- 50,000 contacts
- All Growth features
- Advanced automations
- Custom domain
- API access
- 14-day free trial

### Enterprise (Custom)
- Unlimited sites
- Unlimited products
- Unlimited contacts
- All Pro features
- White-label options
- Dedicated support
- Custom integrations

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
- Comprehensive RLS policies
- Function-level security with search_path controls

### Edge Functions
25+ Supabase Edge Functions handle:
- Payment processing (Stripe checkout, webhooks)
- AI features (text generation, coaching, themes)
- Email delivery (campaigns, transactional)
- Domain verification
- Image search
- Database backups
- Subscription management

## Roadmap

Future enhancements planned:

- [ ] Advanced page builder with more block types
- [ ] SMS marketing integration
- [ ] Affiliate program management
- [ ] Community forums
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced reporting dashboards
- [ ] Third-party integrations marketplace (Zapier, etc.)
- [ ] White-label options
- [ ] Public API documentation
- [ ] Canva integration for design assets

See `PROJECT_ROADMAP.md` for detailed sprint plans and timeline.

## Documentation

Additional documentation available:

- `PROJECT_ROADMAP.md` - Detailed development roadmap
- `AI_COFOUNDER_GUIDE.md` - AI coaching feature documentation
- `STRIPE_SETUP_GUIDE.md` - Payment integration setup
- `DOMAIN_SYSTEM_GUIDE.md` - Custom domain configuration
- `PLATFORM_ADMIN_GUIDE.md` - Administration documentation
- `COMMERCE_WEBHOOK_GUIDE.md` - Webhook configuration
- `EMAIL_SETUP_GUIDE.md` - Email service setup

## Support

For questions and support:
- Documentation: See `/docs` route in the application
- Email: support@creatorappu.com

## License

Proprietary - All rights reserved
