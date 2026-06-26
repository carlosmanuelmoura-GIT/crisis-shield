ALTER TABLE public.procedures ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'gestao';
-- backfill: existing Gestão de Crise procedures default to 'gestao' (already set by default)
