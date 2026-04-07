
CREATE TABLE public.pessoas_criticas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid DEFAULT auth.uid(),
  nome text NOT NULL,
  email text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  departamento text NOT NULL DEFAULT '',
  funcao text NOT NULL DEFAULT '',
  prioridade integer NOT NULL DEFAULT 0,
  codigo_postal text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pessoas_criticas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view pessoas_criticas" ON public.pessoas_criticas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert pessoas_criticas" ON public.pessoas_criticas FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update pessoas_criticas" ON public.pessoas_criticas FOR UPDATE TO authenticated USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete pessoas_criticas" ON public.pessoas_criticas FOR DELETE TO authenticated USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

CREATE TRIGGER update_pessoas_criticas_updated_at BEFORE UPDATE ON public.pessoas_criticas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
