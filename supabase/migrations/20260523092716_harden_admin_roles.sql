-- Block all client-side INSERTs on user_roles. Admin assignment must be done
-- via service role / database migration only. This eliminates any chance of
-- self-escalation if user_roles is empty or has_role bootstrap is bypassed.
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "No client INSERT on user_roles"
  ON public.user_roles
  FOR INSERT
  TO public
  WITH CHECK (false);

-- Lock down setup_first_admin: revoke EXECUTE from anon/authenticated/public.
-- Bootstrapping the first admin should be performed via service role.
REVOKE EXECUTE ON FUNCTION public.setup_first_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.setup_first_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.setup_first_admin() FROM authenticated;
