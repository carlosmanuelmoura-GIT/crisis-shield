
-- 1. Private schema for security definer helpers
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, app_role) SET SCHEMA private;
ALTER FUNCTION public.is_privileged(uuid) SET SCHEMA private;

-- Ensure execute is granted in the new schema
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_privileged(uuid) TO authenticated, service_role;

-- 2. Tighten SELECT policies: switch from public role to authenticated role
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'procedures','bia_processes','decision_log','recursos','cenarios',
    'cenario_recursos','dr_types','cmdb_platforms','bia_process_platforms',
    'buildings','tests','test_buildings','test_platforms',
    'test_business_processes','sub_capacidades'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated can view %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Authenticated can view %1$s" ON public.%1$I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)',
      t
    );
  END LOOP;
END$$;

-- 3. pessoas_criticas: restrict SELECT to privileged users only; stop defaulting owner_id
DROP POLICY IF EXISTS "Privileged or owner can view pessoas_criticas" ON public.pessoas_criticas;
CREATE POLICY "Privileged can view pessoas_criticas"
  ON public.pessoas_criticas
  FOR SELECT
  TO authenticated
  USING (private.is_privileged(auth.uid()));

ALTER TABLE public.pessoas_criticas ALTER COLUMN owner_id DROP DEFAULT;
