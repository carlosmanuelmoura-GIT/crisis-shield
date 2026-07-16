
ALTER TABLE public.buildings
  ADD COLUMN IF NOT EXISTS autonomia_horas_contingencia numeric,
  ADD COLUMN IF NOT EXISTS depositos text,
  ADD COLUMN IF NOT EXISTS combustivel_litros numeric,
  ADD COLUMN IF NOT EXISTS num_geradores integer,
  ADD COLUMN IF NOT EXISTS num_ups integer,
  ADD COLUMN IF NOT EXISTS observacoes text;

CREATE UNIQUE INDEX IF NOT EXISTS buildings_name_unique ON public.buildings (name);
