ALTER TABLE public.buildings ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'na';

UPDATE public.buildings SET tier = CASE
  WHEN COALESCE(num_geradores, 0) <= 0 THEN 'tier4'
  WHEN autonomia_horas_contingencia IS NULL THEN 'na'
  WHEN autonomia_horas_contingencia >= 48 THEN 'tier1'
  WHEN autonomia_horas_contingencia >= 12 THEN 'tier2'
  ELSE 'tier3'
END;