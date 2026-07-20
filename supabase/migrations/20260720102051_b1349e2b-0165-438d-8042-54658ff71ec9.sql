
CREATE TABLE public.crisis_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_id UUID NOT NULL REFERENCES public.crises(id) ON DELETE CASCADE,
  phase_key TEXT NOT NULL,
  label_pt TEXT NOT NULL,
  label_en TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📋',
  color TEXT NOT NULL DEFAULT 'border-secondary bg-secondary/10',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (crisis_id, phase_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crisis_phases TO authenticated;
GRANT ALL ON public.crisis_phases TO service_role;

ALTER TABLE public.crisis_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crisis phases"
  ON public.crisis_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert crisis phases"
  ON public.crisis_phases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update crisis phases"
  ON public.crisis_phases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete crisis phases"
  ON public.crisis_phases FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_crisis_phases_updated_at
  BEFORE UPDATE ON public.crisis_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default phases for every existing crisis
INSERT INTO public.crisis_phases (crisis_id, phase_key, label_pt, label_en, icon, color, sort_order)
SELECT c.id, v.phase_key, v.label_pt, v.label_en, v.icon, v.color, v.sort_order
FROM public.crises c
CROSS JOIN (VALUES
  ('alerta',        'ALERTA & CONTENÇÃO',       'ALERT & CONTAINMENT',   '🔔', 'border-alert bg-alert/10',        0),
  ('declaracao',    'DECLARAÇÃO DE CRISE',      'CRISIS DECLARATION',    '🚨', 'border-crisis bg-crisis/10',      1),
  ('ativacao',      'ATIVAÇÃO & RECUPERAÇÃO',   'ACTIVATION & RECOVERY', '⚡', 'border-primary bg-primary/10',    2),
  ('retorno-inicio','INÍCIO DE RETORNO',        'RETURN START',          '🔄', 'border-accent bg-accent/10',      3),
  ('retorno-fim',   'RETORNO E FIM DE CRISE',   'RETURN & END OF CRISIS','📋', 'border-secondary bg-secondary/10',4),
  ('fim',           'FIM DE CRISE',             'END OF CRISIS',         '✅', 'border-green-500 bg-green-500/10',5)
) AS v(phase_key, label_pt, label_en, icon, color, sort_order)
ON CONFLICT (crisis_id, phase_key) DO NOTHING;
