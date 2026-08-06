/*
# Add role column to profiles for two-level admin system

## Problem
The profiles table only has a boolean `is_admin` flag. We need a three-tier
role system: `user`, `admin`, `super_admin`.

## Changes
1. Add `role` column (text, default 'user') to profiles.
2. Backfill: existing users with `is_admin = true` become `super_admin`.
3. Add trigger to keep `is_admin` in sync with `role` automatically.
4. Add trigger to prevent a super_admin from demoting themselves (safety).
5. Update helper functions for both admin tiers.
6. Update RLS policies: super_admin can manage all profiles, admin can
   read all profiles, users can manage only their own.

## Security
- `is_current_user_admin()` returns true for both `admin` and `super_admin`.
- `is_current_user_super_admin()` returns true only for `super_admin`.
- Only super_admin can UPDATE another user's role.
- A super_admin cannot demote themselves (trigger-enforced).
- All helper functions are SECURITY DEFINER to avoid RLS recursion.
*/

-- Step 1: Add role column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Step 2: Backfill existing admins as super_admin
UPDATE public.profiles
  SET role = 'super_admin'
  WHERE is_admin = true AND role = 'user';

-- Step 3: Keep is_admin in sync with role via trigger
CREATE OR REPLACE FUNCTION public.sync_is_admin_from_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IN ('admin', 'super_admin') THEN
    NEW.is_admin := true;
  ELSE
    NEW.is_admin := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_is_admin ON public.profiles;
CREATE TRIGGER profiles_sync_is_admin
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_is_admin_from_role();

-- Sync existing rows once
UPDATE public.profiles SET is_admin = (role IN ('admin', 'super_admin'))
  WHERE is_admin <> (role IN ('admin', 'super_admin'));

-- Step 4: Prevent self-demotion from super_admin (safety: avoid lockout)
CREATE OR REPLACE FUNCTION public.prevent_super_admin_self_demotion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.role = 'super_admin'
     AND NEW.role <> 'super_admin'
     AND OLD.id = auth.uid()
  THEN
    RAISE EXCEPTION 'Super admins cannot demote themselves. Ask another super admin to demote you.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_self_demotion ON public.profiles;
CREATE TRIGGER profiles_prevent_self_demotion
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_super_admin_self_demotion();

-- Step 5: Update helper functions
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'super_admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Step 6: Update RLS policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- Admins (both tiers) can read all profiles; users can read their own
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_current_user_admin());

-- Users can insert their own profile row
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile; super_admin can update any profile
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_current_user_super_admin())
  WITH CHECK (auth.uid() = id OR public.is_current_user_super_admin());

-- Users can delete their own profile; super_admin can delete any
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id OR public.is_current_user_super_admin());
