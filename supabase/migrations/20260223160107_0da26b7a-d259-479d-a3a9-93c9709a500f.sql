
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid(),
  name text NOT NULL,
  role_pt text NOT NULL DEFAULT '',
  role_en text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete contacts" ON public.contacts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'especialista_gcn'));

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
