
DROP POLICY IF EXISTS "Authenticated can view document_files" ON public.document_files;
CREATE POLICY "Privileged or owner can view document_files"
  ON public.document_files FOR SELECT
  TO authenticated
  USING (private.is_privileged(auth.uid()) OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Authenticated can view pcn_documents" ON public.pcn_documents;
CREATE POLICY "Privileged or owner can view pcn_documents"
  ON public.pcn_documents FOR SELECT
  TO authenticated
  USING (private.is_privileged(auth.uid()) OR auth.uid() = owner_id);
