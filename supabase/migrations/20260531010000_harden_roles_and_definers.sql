-- Block all client-side writes on user_roles. Only service_role/SQL may write.
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "No client INSERT on user_roles"
  ON public.user_roles FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "No client UPDATE on user_roles"
  ON public.user_roles FOR UPDATE TO authenticated, anon
  USING (false);

CREATE POLICY "No client DELETE on user_roles"
  ON public.user_roles FOR DELETE TO authenticated, anon
  USING (false);

-- Lock down SECURITY DEFINER functions: revoke from anon/public, allow only authenticated.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.setup_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.setup_first_admin() TO authenticated;
