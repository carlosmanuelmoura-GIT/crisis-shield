
-- DR Types reference table
CREATE TABLE public.dr_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  rto numeric NOT NULL DEFAULT 0,
  rpo numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dr_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view dr_types" ON public.dr_types FOR SELECT USING (true);
CREATE POLICY "Privileged can insert dr_types" ON public.dr_types FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can update dr_types" ON public.dr_types FOR UPDATE USING (is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete dr_types" ON public.dr_types FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

CREATE TRIGGER update_dr_types_updated_at BEFORE UPDATE ON public.dr_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed DR types with default RTO/RPO values
INSERT INTO public.dr_types (code, label, rto, rpo, sort_order) VALUES
  ('DR0+', 'DR0+ (Zero Downtime)', 0, 0, 0),
  ('DR0', 'DR0 (Near Zero)', 0.25, 0.25, 1),
  ('DR1', 'DR1', 1, 1, 2),
  ('DR2', 'DR2', 4, 4, 3),
  ('DR3', 'DR3', 24, 24, 4),
  ('DR4', 'DR4', 72, 72, 5);

-- CMDB Platforms table
CREATE TABLE public.cmdb_platforms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  dr_type_id uuid REFERENCES public.dr_types(id),
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cmdb_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view cmdb_platforms" ON public.cmdb_platforms FOR SELECT USING (true);
CREATE POLICY "Privileged can insert cmdb_platforms" ON public.cmdb_platforms FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update cmdb_platforms" ON public.cmdb_platforms FOR UPDATE USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete cmdb_platforms" ON public.cmdb_platforms FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

CREATE TRIGGER update_cmdb_platforms_updated_at BEFORE UPDATE ON public.cmdb_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Junction table: BIA Process <-> CMDB Platform
CREATE TABLE public.bia_process_platforms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bia_process_id uuid NOT NULL REFERENCES public.bia_processes(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES public.cmdb_platforms(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bia_process_id, platform_id)
);

ALTER TABLE public.bia_process_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bia_process_platforms" ON public.bia_process_platforms FOR SELECT USING (true);
CREATE POLICY "Privileged can insert bia_process_platforms" ON public.bia_process_platforms FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete bia_process_platforms" ON public.bia_process_platforms FOR DELETE USING (is_privileged(auth.uid()));
