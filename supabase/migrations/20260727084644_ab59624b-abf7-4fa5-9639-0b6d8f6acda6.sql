
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own or privileged"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR private.is_privileged(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can view documents" ON storage.objects;
CREATE POLICY "Owner or privileged can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (owner = auth.uid() OR private.is_privileged(auth.uid()))
  );
