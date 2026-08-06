/*
# Auto-admin: first registered user becomes admin

## Problem
There was no way to grant the first admin from inside the app — the admin
panel requires `is_admin = true`, but only an admin can toggle that flag.
The previous guidance was to run SQL manually, which is not practical.

## Change
The `handle_new_user()` trigger (runs on every signup) now checks whether
any admin already exists in `profiles`. If none exists, the new user is
created with `is_admin = true`. Every subsequent signup gets the normal
`is_admin = false` default.

## Security
- Only the VERY FIRST user gets admin. Once an admin exists, no new signup
  can ever auto-elevate, no matter how many admins there are.
- Existing admins can still grant/remove admin on anyone from the Customers
  page (Shield toggle).
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE is_admin = true) INTO admin_exists;
  INSERT INTO public.profiles (id, full_name, avatar_url, is_admin)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOT admin_exists
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
