
DROP POLICY IF EXISTS procedure_steps_auth_insert ON public.procedure_steps;
DROP POLICY IF EXISTS procedure_steps_auth_update ON public.procedure_steps;
DROP POLICY IF EXISTS procedure_steps_auth_delete ON public.procedure_steps;

CREATE POLICY procedure_steps_auth_insert ON public.procedure_steps
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY procedure_steps_auth_update ON public.procedure_steps
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY procedure_steps_auth_delete ON public.procedure_steps
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);
