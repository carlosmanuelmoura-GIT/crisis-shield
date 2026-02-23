
-- Add title and crisis_started_at to decision_log for grouping by crisis
ALTER TABLE public.decision_log
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS crisis_started_at timestamptz;
