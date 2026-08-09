ALTER TABLE public.crises
  ADD COLUMN IF NOT EXISTS strategic_pause boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS strategic_pause_by text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS strategic_pause_at timestamp with time zone;