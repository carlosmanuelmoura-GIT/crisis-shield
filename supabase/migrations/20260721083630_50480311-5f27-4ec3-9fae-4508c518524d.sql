DROP POLICY IF EXISTS "Authenticated can insert crisis phases" ON public.crisis_phases;
DROP POLICY IF EXISTS "Authenticated can update crisis phases" ON public.crisis_phases;
DROP POLICY IF EXISTS "Authenticated can delete crisis phases" ON public.crisis_phases;
DROP POLICY IF EXISTS "Authenticated can view crisis phases" ON public.crisis_phases;

CREATE POLICY "Authenticated users can view crisis phases"
ON public.crisis_phases
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create crisis phases"
ON public.crisis_phases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update crisis phases"
ON public.crisis_phases
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete crisis phases"
ON public.crisis_phases
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);