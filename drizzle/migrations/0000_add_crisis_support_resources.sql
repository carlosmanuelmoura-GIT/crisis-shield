ALTER TABLE public.crises
  ADD COLUMN support_file_name text NOT NULL DEFAULT '',
  ADD COLUMN support_file_path text NOT NULL DEFAULT '',
  ADD COLUMN support_agent_url text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.update_crisis_support(
  p_crisis_id uuid,
  p_support_file_name text,
  p_support_file_path text,
  p_support_agent_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.crises
  SET support_file_name = COALESCE(p_support_file_name, ''),
      support_file_path = COALESCE(p_support_file_path, ''),
      support_agent_url = COALESCE(p_support_agent_url, '')
  WHERE id = p_crisis_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Crisis not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_crisis_support(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_crisis_support(uuid, text, text, text) TO authenticated, service_role;

CREATE POLICY "Authenticated can view crisis support files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'crisis-support');

CREATE POLICY "Authenticated can upload crisis support files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'crisis-support');

CREATE POLICY "Authenticated can update crisis support files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'crisis-support')
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'crisis-support');

CREATE POLICY "Authenticated can delete crisis support files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'crisis-support');