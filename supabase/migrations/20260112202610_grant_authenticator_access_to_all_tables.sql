/*
  # Grant authenticator role access to all tables

  ## Problem
  The authenticator role lacks permissions on all public schema tables.
  This causes "Database error querying schema" during authentication.

  ## Root Cause
  When migrations create tables, they grant permissions to anon, authenticated, 
  and service_role, but NOT to the authenticator role. The authenticator role 
  is what Supabase uses internally to manage all connections.

  ## Solution
  Grant ALL privileges to authenticator role on all tables in public schema.
  This is standard Supabase configuration.

  ## Changes
  1. Grant ALL on all existing tables to authenticator
  2. Grant ALL on all existing sequences to authenticator
  3. Set default privileges for future tables
*/

-- Grant access to all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;

-- Grant access to all existing sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticator;
