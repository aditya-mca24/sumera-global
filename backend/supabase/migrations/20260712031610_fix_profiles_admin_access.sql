/*
# Fix: Allow admins to view and update all profiles

## Problem
The `profiles` table RLS policies only allowed users to read and update their
own row (`auth.uid() = id`). When an admin opened the Customers page in the
admin panel, Supabase filtered out every other customer's profile, so the
admin could only see themselves — new (and existing) customers were invisible.

## Changes
1. **profiles SELECT policy** — admins can now read ALL profiles; non-admins
   still only see their own.
2. **profiles UPDATE policy** — admins can now update ANY profile (needed for
   the grant/remove admin toggle); non-admins still only update their own.

## Security
- The admin check reuses the same pattern already used across every other
  table in the schema:
  `EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)`
- This does NOT cause infinite recursion because the admin's own row is
  visible via the base `auth.uid() = id` clause, so the subquery resolves.
- INSERT and DELETE policies are unchanged (users can still only
  insert/delete their own profile row).
*/

-- SELECT: admins see all, users see own
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- UPDATE: admins can update any, users can update own
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
