/*
# Fix infinite recursion in profiles RLS policies

## Problem
The profiles table RLS policies check `is_admin` by running a subquery
against the profiles table itself:
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
This causes infinite recursion because evaluating the policy triggers
evaluating the policy again, forever.

## Fix
1. Create a `SECURITY DEFINER` function `is_current_user_admin()` that
   reads the profiles table with the service-role bypass (SECURITY DEFINER
   runs as the function owner, which bypasses RLS). This breaks the
   recursion because the function does not go through RLS.
2. Drop and recreate all four profiles policies to use `is_current_user_admin()`
   instead of the recursive subquery.

## Security
- The function is `SECURITY DEFINER` owned by the postgres user, so it
  bypasses RLS to read the is_admin flag. It only returns a boolean and
  takes no arguments, so it cannot be abused.
- Policies remain scoped: a user can read/update/delete their own row,
  OR any row if they are an admin. Inserts are self-only.
*/

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Drop recursive policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- Recreate using the non-recursive helper function
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_current_user_admin());

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_current_user_admin())
  WITH CHECK (auth.uid() = id OR public.is_current_user_admin());

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id OR public.is_current_user_admin());
