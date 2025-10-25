# User Management Guide

## Quick Delete Test Users

### Method 1: Using SQL (Recommended - Fastest)

You can delete users directly using SQL commands. The CASCADE delete will automatically remove all related data (profiles, sites, products, etc.).

```sql
-- View all users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Delete a specific user by email
DELETE FROM auth.users WHERE email = 'test@example.com';

-- Delete all test users (be careful with this!)
DELETE FROM auth.users WHERE email LIKE 'test%@example.com';

-- Delete the current user
DELETE FROM auth.users WHERE email = 'bskaar@comcast.net';
```

### Method 2: Using the HTML Tool

1. Open `delete-test-users.html` in your browser
2. When prompted, enter:
   - Supabase URL: `https://amwlcjpbzuwmjajlnayn.supabase.co`
   - Anon Key: (the long key from .env file)
3. You'll see a list of all users with delete buttons

Note: The admin.deleteUser() method requires service role key which we can't use from the browser, so we'll use SQL instead.

### Method 3: Create Test Users via Signup Page

Simply go to `/signup` and create new accounts:
- Use test emails like: `test1@example.com`, `test2@example.com`
- Password: `testpass123` (or any password 8+ chars)
- Site names: `Test Site 1`, `Test Site 2`, etc.

## Deleting Your Current Test User

To delete the user `bskaar@comcast.net`:

```sql
DELETE FROM auth.users WHERE email = 'bskaar@comcast.net';
```

This will CASCADE delete:
- ✅ User profile
- ✅ All sites owned by the user
- ✅ All site_members records
- ✅ All products, lessons, contacts
- ✅ All funnels, pages, emails
- ✅ All orders and analytics

## Creating Multiple Test Accounts

### Quick Test Data Generator

Use these SQL commands to quickly create test users:

```sql
-- Note: You'll need to use the auth.sign_up function or the signup page
-- SQL INSERT directly into auth.users is not recommended

-- Instead, use the signup page at /signup with these test accounts:

Test User 1:
- Email: test1@example.com
- Password: testpass123
- Name: Test User 1
- Site: Test Site 1

Test User 2:
- Email: test2@example.com
- Password: testpass123
- Name: Test User 2
- Site: Test Site 2

Test User 3:
- Email: test3@example.com
- Password: testpass123
- Name: Test User 3
- Site: Test Site 3
```

## Checking Database Status

```sql
-- Count total users
SELECT COUNT(*) as total_users FROM auth.users;

-- View users with their sites
SELECT
  u.email,
  u.created_at,
  COUNT(DISTINCT s.id) as sites_count,
  COUNT(DISTINCT p.id) as products_count
FROM auth.users u
LEFT JOIN sites s ON s.owner_id = u.id
LEFT JOIN products p ON p.site_id = s.id
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC;

-- View all sites
SELECT s.name, s.slug, u.email as owner_email, s.tier, s.created_at
FROM sites s
JOIN auth.users u ON u.id = s.owner_id
ORDER BY s.created_at DESC;
```

## Clean Slate - Delete Everything

⚠️ **WARNING: This will delete ALL users and data!**

```sql
-- Delete all users (this cascades to all related data)
DELETE FROM auth.users;

-- Verify everything is deleted
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM sites;
SELECT COUNT(*) FROM products;
```
