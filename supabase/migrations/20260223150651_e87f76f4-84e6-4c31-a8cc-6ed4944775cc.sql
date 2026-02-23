
CREATE TABLE public.decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view decision_log" ON public.decision_log FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert decision_log" ON public.decision_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owner or privileged can update decision_log" ON public.decision_log FOR UPDATE USING (auth.uid() = owner_id OR is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can delete decision_log" ON public.decision_log FOR DELETE USING (auth.uid() = owner_id OR is_privileged(auth.uid()));

CREATE TRIGGER update_decision_log_updated_at BEFORE UPDATE ON public.decision_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
