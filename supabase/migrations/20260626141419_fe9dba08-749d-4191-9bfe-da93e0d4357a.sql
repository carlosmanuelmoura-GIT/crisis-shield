ALTER TABLE public.procedures ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT id, row_number() OVER (PARTITION BY phase ORDER BY created_at) AS rn
  FROM public.procedures
)
UPDATE public.procedures p SET sort_order = o.rn * 10 FROM ordered o WHERE o.id = p.id;