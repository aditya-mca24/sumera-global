/*
# Fix: Allow admins to delete customer profiles

## Problem
The `profiles` DELETE policy only allowed users to delete their own row.
Admins had no way to remove a customer from the admin panel. Additionally,
deleting a `profiles` row does NOT remove the corresponding `auth.users` entry,
so the customer's login credentials (email + password) remained active even
after their profile was deleted.

## Changes
1. **profiles DELETE policy** — admins can now delete any profile row.
   Non-admins can still only delete their own.

## Notes
- The edge function `delete-user` handles the full removal: it calls
  `auth.admin.deleteUserById()` with the service role, which deletes the
  `auth.users` row. The foreign key `profiles.id REFERENCES auth.users(id)
  ON DELETE CASCADE` then automatically removes the matching profile row.
- Admins cannot delete their own account (enforced in the edge function).
*/

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
