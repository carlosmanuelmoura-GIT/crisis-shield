CREATE TABLE public.supplier_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_catalog TO authenticated;
GRANT ALL ON public.supplier_catalog TO service_role;
ALTER TABLE public.supplier_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read supplier_catalog" ON public.supplier_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert supplier_catalog" ON public.supplier_catalog FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth update supplier_catalog" ON public.supplier_catalog FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth delete supplier_catalog" ON public.supplier_catalog FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER update_supplier_catalog_updated_at BEFORE UPDATE ON public.supplier_catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid REFERENCES public.supplier_catalog(id) ON DELETE SET NULL,
  name text NOT NULL,
  subcontractors text NOT NULL DEFAULT '',
  critical_area text NOT NULL DEFAULT '',
  rto_supplier_hours numeric,
  rto_process_hours numeric,
  essentiality text NOT NULL DEFAULT 'medium',
  alternatives text NOT NULL DEFAULT 'limited',
  substitution_time text NOT NULL DEFAULT 'medium',
  exit_strategy text NOT NULL DEFAULT 'nao_existente',
  last_gcn_test date,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.supplier_functions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  funcao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, funcao)
);
GRANT SELECT, INSERT, DELETE ON public.supplier_functions TO authenticated;
GRANT ALL ON public.supplier_functions TO service_role;
ALTER TABLE public.supplier_functions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read supplier_functions" ON public.supplier_functions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert supplier_functions" ON public.supplier_functions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth delete supplier_functions" ON public.supplier_functions FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TABLE public.supplier_macro_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  macro_processo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, macro_processo)
);
GRANT SELECT, INSERT, DELETE ON public.supplier_macro_processes TO authenticated;
GRANT ALL ON public.supplier_macro_processes TO service_role;
ALTER TABLE public.supplier_macro_processes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read supplier_macro" ON public.supplier_macro_processes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert supplier_macro" ON public.supplier_macro_processes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth delete supplier_macro" ON public.supplier_macro_processes FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);