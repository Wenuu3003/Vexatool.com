-- Harden SECURITY DEFINER functions: revoke EXECUTE from PUBLIC/anon/authenticated.
-- Trigger functions still fire (triggers run as table owner, not via EXECUTE grants).
-- service_role retains EXECUTE via its default privileges.

REVOKE EXECUTE ON FUNCTION public.setup_first_admin()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_set_updated_at()     FROM PUBLIC, anon, authenticated;
