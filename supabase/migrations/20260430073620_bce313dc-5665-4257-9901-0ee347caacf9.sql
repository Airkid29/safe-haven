-- Drop the SECURITY DEFINER view (the function get_admin_stats covers the same need with role check)
DROP VIEW IF EXISTS public.admin_stats;

-- Re-define get_admin_stats without depending on the view
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(month date, harassment_type harassment_type, status report_status, total int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT date_trunc('month', created_at)::date AS month,
         harassment_type, status, count(*)::int AS total
  FROM public.reports
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY 1,2,3
$$;

-- Lock down execute privileges on sensitive SECURITY DEFINER functions.
-- handle_new_user is only called by trigger; nobody should call it directly.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- get_admin_stats: only authenticated users can attempt; the function itself enforces admin role.
REVOKE ALL ON FUNCTION public.get_admin_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- has_role: required by RLS policies which run as the querying user, so keep grants.
-- (No changes needed; warning is acceptable because policies use it.)