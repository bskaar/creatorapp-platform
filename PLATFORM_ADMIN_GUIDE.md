# CreatorApp.US Platform Admin Portal

## Overview

The Platform Admin Portal is a separate administrative interface for managing the entire CreatorApp.US platform. This is distinct from the regular Site Dashboard that customers use to manage their individual sites.

## Two Separate Interfaces

### 1. Site Dashboard (For Customers)
- **URL**: Regular dashboard routes (`/dashboard`, `/commerce`, etc.)
- **Purpose**: Site owners manage their own sites
- **Access**: Any authenticated user with a site
- **Features**:
  - Manage products, pages, and content
  - View orders and customers
  - Configure site settings
  - Manage team members

### 2. Platform Admin Portal (For Platform Owner)
- **URL**: `/platform-admin/*`
- **Purpose**: You manage the entire CreatorApp.US platform
- **Access**: Only platform administrators
- **Features**:
  - View all sites on the platform
  - Monitor platform-wide metrics
  - View all users
  - Track admin activity
  - Manage platform administrators

## Database Structure

### New Tables

#### `platform_admins`
Tracks who has access to the platform admin portal.
- `id`: UUID primary key
- `user_id`: References auth.users
- `role`: Either 'super_admin' or 'admin'
- `permissions`: JSONB object with granular permissions
- `created_at`: Timestamp
- `created_by`: UUID of admin who granted access

#### `platform_metrics`
Stores aggregated platform statistics over time.
- `metric_date`: Date for metrics
- `total_sites`: Total sites on platform
- `active_sites`: Sites active in last 30 days
- `total_users`: Total users across all sites
- `total_revenue`: Total revenue
- `new_signups`: New sites created
- And more...

#### `platform_audit_log`
Tracks all platform admin actions for accountability.
- `admin_id`: Which admin performed the action
- `action`: What action was performed
- `resource_type`: What was affected (site, user, etc.)
- `resource_id`: ID of affected resource
- `changes`: JSONB of what changed
- `created_at`: Timestamp

### Views

#### `platform_stats_summary`
A materialized view with real-time platform statistics:
- Total sites and active sites
- Total users
- Revenue metrics
- Growth metrics
- Content statistics

## Access Control

### Roles

1. **Super Admin**
   - Full access to all features
   - Can manage other administrators
   - Can modify platform settings

2. **Admin**
   - Configurable permissions
   - Can view sites, users, analytics
   - Limited management capabilities

### Permissions

- `view_sites`: View all sites on platform
- `manage_sites`: Modify site configurations
- `view_users`: View all users
- `manage_users`: Modify user accounts
- `view_analytics`: View platform metrics
- `manage_billing`: Handle platform billing
- `manage_platform_settings`: Configure platform settings

## Setup Instructions

### 1. Create Your First Platform Admin

You need to manually add yourself as a platform admin in the database:

```sql
-- First, get your user_id from auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert yourself as a super admin
INSERT INTO platform_admins (user_id, role, permissions)
VALUES (
  'YOUR-USER-ID-HERE',
  'super_admin',
  '{"view_sites": true, "manage_sites": true, "view_users": true, "manage_users": true, "view_analytics": true, "manage_billing": true, "manage_platform_settings": true}'::jsonb
);
```

### 2. Access the Platform Admin Portal

1. Log in to CreatorApp.US with your admin account
2. Navigate to `http://localhost:5173/platform-admin`
3. You should see the Platform Admin Dashboard

### 3. Add Additional Administrators

Once you're logged in as a super admin:
1. Go to **Platform Admin > Settings**
2. Enter the email of the user you want to add
3. Select their role (Admin or Super Admin)
4. Click "Add Administrator"

## Features

### Dashboard (`/platform-admin`)
- Real-time platform metrics
- Total sites, active sites, users
- Revenue statistics
- Growth trends
- Platform health indicators

### Sites Management (`/platform-admin/sites`)
- View all sites on the platform
- Filter by active/inactive status
- Search by name, subdomain, or custom domain
- View site statistics (members, products, orders, revenue)
- See when sites were created and last active

### Users Management (`/platform-admin/users`)
- View all users across the platform
- Search by email
- See user registration dates
- View last sign-in dates
- Identify platform admins
- See how many sites each user owns

### Activity Log (`/platform-admin/audit-log`)
- Track all platform admin actions
- Filter by resource type (sites, users, settings)
- View who performed each action
- See what changed
- Audit trail for accountability

### Settings (`/platform-admin/settings`)
- Add new platform administrators
- Remove existing administrators
- Manage admin roles and permissions
- (Super Admin only)

## Security

### Row Level Security (RLS)
All platform admin tables are protected with RLS policies:
- Only platform admins can view admin-related data
- Only super admins can modify admin settings
- Audit log is append-only (no updates or deletes)

### Authentication
- Users must be authenticated to access admin portal
- System checks `platform_admins` table for authorization
- Permissions are checked on every route
- Failed access attempts are denied with clear messages

## Development Environment

The platform is configured to work with:
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: Supabase (configured via `.env`)
- **Database**: PostgreSQL via Supabase

## Maintenance

### Refreshing Platform Stats

The platform statistics are stored in a materialized view. To refresh:

```sql
SELECT refresh_platform_stats();
```

Or use the "Refresh Stats" button in the admin dashboard.

### Monitoring

Key metrics to monitor:
- Active site percentage (should be > 70%)
- New signups trend
- Revenue growth
- User engagement

## Troubleshooting

### "Access Denied" Error
- Ensure you're added to the `platform_admins` table
- Check your user_id matches in the database
- Verify RLS policies are enabled

### Stats Not Loading
- Run `SELECT refresh_platform_stats();` in the database
- Check for database connection errors
- Verify the materialized view exists

### Can't Add New Admins
- Only super admins can add administrators
- User must already have an account on the platform
- Check the email is correct

## Best Practices

1. **Limit Super Admins**: Only give super admin to trusted team members
2. **Use Permissions**: Grant admins only the permissions they need
3. **Monitor Activity**: Regularly review the audit log
4. **Regular Stats Refresh**: Set up a cron job to refresh stats daily
5. **Secure Access**: Never share admin credentials

## Future Enhancements

Potential features to add:
- Site impersonation (view site as owner)
- Bulk actions on sites
- Email notifications to site owners
- Platform-wide announcements
- Advanced analytics and reports
- Export capabilities
- API rate limiting dashboard
