ALTER TABLE public.action_cards
  ADD COLUMN IF NOT EXISTS strategic_pause boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS golden_rule text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS activation_authority text NOT NULL DEFAULT '';