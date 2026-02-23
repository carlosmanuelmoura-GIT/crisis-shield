
-- Recursos que se perdem
CREATE TABLE public.recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_pt TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  description_pt TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view recursos" ON public.recursos FOR SELECT USING (true);
CREATE POLICY "Privileged can insert recursos" ON public.recursos FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update recursos" ON public.recursos FOR UPDATE USING (auth.uid() = owner_id OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete recursos" ON public.recursos FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));
CREATE TRIGGER update_recursos_updated_at BEFORE UPDATE ON public.recursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cenários (dynamic, replacing static)
CREATE TABLE public.cenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roman TEXT NOT NULL DEFAULT '',
  name_pt TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  description_pt TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'border-muted',
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view cenarios" ON public.cenarios FOR SELECT USING (true);
CREATE POLICY "Privileged can insert cenarios" ON public.cenarios FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update cenarios" ON public.cenarios FOR UPDATE USING (auth.uid() = owner_id OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete cenarios" ON public.cenarios FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));
CREATE TRIGGER update_cenarios_updated_at BEFORE UPDATE ON public.cenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Relação cenário <-> recurso
CREATE TABLE public.cenario_recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cenario_id UUID NOT NULL REFERENCES public.cenarios(id) ON DELETE CASCADE,
  recurso_id UUID NOT NULL REFERENCES public.recursos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cenario_id, recurso_id)
);

ALTER TABLE public.cenario_recursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view cenario_recursos" ON public.cenario_recursos FOR SELECT USING (true);
CREATE POLICY "Privileged can insert cenario_recursos" ON public.cenario_recursos FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Privileged can delete cenario_recursos" ON public.cenario_recursos FOR DELETE USING (is_privileged(auth.uid()));

-- Adicionar recurso_id aos action_cards
ALTER TABLE public.action_cards ADD COLUMN recurso_id UUID REFERENCES public.recursos(id);
