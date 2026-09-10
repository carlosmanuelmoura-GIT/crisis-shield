ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS autonomia_atual_horas numeric,
  ADD COLUMN IF NOT EXISTS autonomia_atual_medida_em timestamptz;