
-- Crisis status enum
CREATE TYPE public.crisis_status AS ENUM ('registada', 'em_alerta', 'crise_em_curso', 'retorno', 'fim');

-- Main crises table
CREATE TABLE public.crises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  crisis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status public.crisis_status NOT NULL DEFAULT 'registada',
  crisis_type TEXT NOT NULL DEFAULT 'real',
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cloned_from_id UUID REFERENCES public.crises(id) ON DELETE SET NULL
);

-- Crisis cabinet members
CREATE TABLE public.crisis_cabinet_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_id UUID NOT NULL REFERENCES public.crises(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crisis phase actions (replaces localStorage)
CREATE TABLE public.crisis_phase_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_id UUID NOT NULL REFERENCES public.crises(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  text TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.crises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_cabinet_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_phase_actions ENABLE ROW LEVEL SECURITY;

-- Crises policies
CREATE POLICY "Authenticated can view crises" ON public.crises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert crises" ON public.crises FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update crises" ON public.crises FOR UPDATE TO authenticated USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete crises" ON public.crises FOR DELETE TO authenticated USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

-- Cabinet members policies
CREATE POLICY "Authenticated can view cabinet members" ON public.crisis_cabinet_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert cabinet members" ON public.crisis_cabinet_members FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can update cabinet members" ON public.crisis_cabinet_members FOR UPDATE TO authenticated USING (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete cabinet members" ON public.crisis_cabinet_members FOR DELETE TO authenticated USING (is_privileged(auth.uid()));

-- Phase actions policies
CREATE POLICY "Authenticated can view phase actions" ON public.crisis_phase_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert phase actions" ON public.crisis_phase_actions FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can update phase actions" ON public.crisis_phase_actions FOR UPDATE TO authenticated USING (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete phase actions" ON public.crisis_phase_actions FOR DELETE TO authenticated USING (is_privileged(auth.uid()));

-- Updated_at triggers
CREATE TRIGGER update_crises_updated_at BEFORE UPDATE ON public.crises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crisis_phase_actions_updated_at BEFORE UPDATE ON public.crisis_phase_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
