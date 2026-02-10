# Trial Reminder System

## Overview

This system automatically sends email reminders to users 5 days before their 14-day free trial expires, as promised in the Terms of Service.

## Components

### 1. Email Template (`src/services/emailService.ts`)

New method: `sendTrialExpiring(userEmail, userName, siteName, daysRemaining)`

The email includes:
- Clear warning about trial expiration
- Explanation of what happens if they don't cancel
- Options to subscribe or cancel
- List of benefits included with paid plans
- Professional styling with call-to-action buttons

### 2. Database Tracking (`trial_reminder_sent_at`)

Added to the `sites` table:
- Tracks when the reminder email was sent
- Prevents duplicate emails
- NULL value indicates no reminder sent yet

### 3. Edge Function (`send-trial-reminders`)

Automated function that:
- Queries for sites with trials expiring in exactly 5 days
- Filters for trials that haven't received a reminder yet
- Sends personalized emails to site owners
- Updates the database to mark reminder as sent
- Returns detailed results of emails sent/failed

## How It Works

1. **Query**: Function finds all sites where:
   - `platform_subscription_status = 'trialing'`
   - `platform_trial_ends_at` is 5 days from now
   - `trial_reminder_sent_at IS NULL` (no reminder sent yet)

2. **Send Email**: For each site:
   - Fetches owner's user data
   - Sends personalized email via Resend
   - Calculates exact days remaining

3. **Update Database**: After successful send:
   - Sets `trial_reminder_sent_at` to current timestamp
   - Prevents duplicate sends

## Scheduling the Function

To automate this function to run daily, you have two options:

### Option 1: External Cron Service (Recommended)

Use a service like Cron-job.org, EasyCron, or GitHub Actions to call the function daily:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-trial-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Recommended Schedule**: Run once daily at 9:00 AM UTC

### Option 2: pg_cron (Supabase Pro Plan) - RECOMMENDED

If you have Supabase Pro or higher, you can use pg_cron for reliable scheduling:

**Steps:**

1. **Enable pg_cron Extension:**
   - Go to Supabase Dashboard → Database → Extensions
   - Search for "pg_cron"
   - When prompted for schema, enter: `pg_catalog`
   - Click "Enable extension"

2. **Run the Setup Script:**
   - Go to Supabase Dashboard → SQL Editor
   - Open the file `SETUP_CRON_JOB.sql` from your project
   - Replace `YOUR_PROJECT_ID` with your actual project reference ID
     - Example: If your URL is `https://abcdefgh.supabase.co`, use `abcdefgh`
   - Click "Run" to execute the script

3. **Verify the Job:**
   ```sql
   -- Check if job was created
   SELECT * FROM cron.job WHERE jobname = 'send-trial-reminders-daily';

   -- View run history (after first execution)
   SELECT * FROM cron.job_run_details
   WHERE jobname = 'send-trial-reminders-daily'
   ORDER BY start_time DESC LIMIT 10;
   ```

The job will now run automatically every day at 9:00 AM UTC.

## Testing the Function

You can test the function manually by calling it directly:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-trial-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Response example:
```json
{
  "success": true,
  "message": "Trial reminder emails processed",
  "processed": 3,
  "emailsSent": 3,
  "emailsFailed": 0,
  "details": {
    "sent": [
      {
        "siteId": "uuid",
        "siteName": "My Site",
        "email": "user@example.com",
        "daysRemaining": 5
      }
    ],
    "failed": []
  }
}
```

## Email Timing

- **Day 1**: User signs up and starts 14-day trial
- **Day 9**: Automated reminder email sent (5 days before expiration)
- **Day 14**: Trial expires, subscription converts to paid (if not canceled)

## Requirements

- **RESEND_API_KEY**: Must be configured in Supabase edge function secrets
- **Email Domain**: Verified sender domain in Resend (notifications@creatorapp.us)
- **Database**: `trial_reminder_sent_at` column exists on sites table

## Monitoring

To check if reminders are being sent:

```sql
-- View sites that need reminders soon
SELECT
  id,
  name,
  owner_id,
  platform_trial_ends_at,
  trial_reminder_sent_at,
  (platform_trial_ends_at - NOW()) as time_until_expiration
FROM sites
WHERE platform_subscription_status = 'trialing'
  AND platform_trial_ends_at > NOW()
ORDER BY platform_trial_ends_at ASC;

-- View sites that received reminders
SELECT
  id,
  name,
  trial_reminder_sent_at,
  platform_trial_ends_at
FROM sites
WHERE trial_reminder_sent_at IS NOT NULL
ORDER BY trial_reminder_sent_at DESC;
```

## Legal Compliance

This system fulfills the promise made in the Terms of Service:

> "To avoid being charged, you must cancel your subscription before the end of the 14-day trial period. You will receive email notifications reminding you when your trial is about to end."

The 5-day advance notice provides users with adequate time to:
- Review their trial experience
- Make an informed decision about subscribing
- Cancel if they don't wish to continue
- Contact support with any questions
