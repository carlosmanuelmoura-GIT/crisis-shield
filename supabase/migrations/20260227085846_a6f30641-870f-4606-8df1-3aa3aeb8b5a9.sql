
-- Buildings table
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view buildings" ON public.buildings FOR SELECT USING (true);
CREATE POLICY "Privileged can insert buildings" ON public.buildings FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update buildings" ON public.buildings FOR UPDATE USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete buildings" ON public.buildings FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

-- Tests table
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  test_date DATE NOT NULL,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view tests" ON public.tests FOR SELECT USING (true);
CREATE POLICY "Privileged can insert tests" ON public.tests FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update tests" ON public.tests FOR UPDATE USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete tests" ON public.tests FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

-- Test <-> Buildings (many-to-many)
CREATE TABLE public.test_buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.test_buildings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view test_buildings" ON public.test_buildings FOR SELECT USING (true);
CREATE POLICY "Privileged can insert test_buildings" ON public.test_buildings FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete test_buildings" ON public.test_buildings FOR DELETE USING (is_privileged(auth.uid()));

-- Test <-> Platforms (many-to-many)
CREATE TABLE public.test_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.cmdb_platforms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.test_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view test_platforms" ON public.test_platforms FOR SELECT USING (true);
CREATE POLICY "Privileged can insert test_platforms" ON public.test_platforms FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete test_platforms" ON public.test_platforms FOR DELETE USING (is_privileged(auth.uid()));

-- Test <-> Business Processes (many-to-many)
CREATE TABLE public.test_business_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  business_process_id UUID NOT NULL REFERENCES public.business_processes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.test_business_processes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view test_business_processes" ON public.test_business_processes FOR SELECT USING (true);
CREATE POLICY "Privileged can insert test_business_processes" ON public.test_business_processes FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete test_business_processes" ON public.test_business_processes FOR DELETE USING (is_privileged(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
