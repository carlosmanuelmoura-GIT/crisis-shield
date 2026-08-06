ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS dr_type_id uuid REFERENCES public.dr_types(id),
  ADD COLUMN IF NOT EXISTS supplier_rto_compliant boolean;

UPDATE public.suppliers s
SET supplier_rto_compliant = NOT (s.rto_supplier_hours > s.rto_process_hours)
WHERE s.rto_supplier_hours IS NOT NULL AND s.rto_process_hours IS NOT NULL;

UPDATE public.suppliers s
SET dr_type_id = d.id
FROM public.dr_types d
WHERE s.dr_type_id IS NULL AND s.rto_process_hours IS NOT NULL AND d.rto = s.rto_process_hours;