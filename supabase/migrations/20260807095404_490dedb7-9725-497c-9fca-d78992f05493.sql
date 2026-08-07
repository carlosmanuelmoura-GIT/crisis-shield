ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS contract_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS service_type text;

INSERT INTO public.supplier_catalog (name, owner_id)
SELECT DISTINCT s.name, s.owner_id
FROM public.suppliers s
WHERE s.catalog_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.supplier_catalog c WHERE c.name = s.name);

UPDATE public.suppliers s
SET catalog_id = c.id
FROM public.supplier_catalog c
WHERE s.catalog_id IS NULL AND c.name = s.name;

UPDATE public.suppliers SET contract_name = name WHERE contract_name = '';