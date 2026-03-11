
-- PCN departmental documents table
CREATE TABLE public.pcn_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_code text NOT NULL,
  attribute_key text NOT NULL,
  file_name text NOT NULL DEFAULT '',
  file_path text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pcn_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view pcn_documents" ON public.pcn_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Privileged can insert pcn_documents" ON public.pcn_documents
  FOR INSERT TO authenticated WITH CHECK (is_privileged(auth.uid()));

CREATE POLICY "Privileged can delete pcn_documents" ON public.pcn_documents
  FOR DELETE TO authenticated USING (is_privileged(auth.uid()));

CREATE POLICY "Privileged can update pcn_documents" ON public.pcn_documents
  FOR UPDATE TO authenticated USING (is_privileged(auth.uid()));
