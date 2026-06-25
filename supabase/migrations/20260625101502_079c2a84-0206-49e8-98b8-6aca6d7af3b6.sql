
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_privileged(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Authenticated can view contacts" ON public.contacts;
CREATE POLICY "Privileged or owner can view contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (public.is_privileged(auth.uid()) OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Authenticated can view pessoas_criticas" ON public.pessoas_criticas;
CREATE POLICY "Privileged or owner can view pessoas_criticas" ON public.pessoas_criticas
  FOR SELECT TO authenticated
  USING (public.is_privileged(auth.uid()) OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Authenticated can view meeting_rooms" ON public.meeting_rooms;
DROP POLICY IF EXISTS "Owner or privileged can delete meeting_rooms" ON public.meeting_rooms;
DROP POLICY IF EXISTS "Owner or privileged can update meeting_rooms" ON public.meeting_rooms;
DROP POLICY IF EXISTS "Privileged can insert meeting_rooms" ON public.meeting_rooms;

CREATE POLICY "Authenticated can view meeting_rooms" ON public.meeting_rooms
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert meeting_rooms" ON public.meeting_rooms
  FOR INSERT TO authenticated WITH CHECK (public.is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update meeting_rooms" ON public.meeting_rooms
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can delete meeting_rooms" ON public.meeting_rooms
  FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.is_privileged(auth.uid()));

DROP POLICY IF EXISTS "Especialistas can manage roles" ON public.user_roles;
CREATE POLICY "Steering can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'steering_gcn'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'steering_gcn'::app_role));

DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Privileged can delete documents" ON storage.objects;

CREATE POLICY "Authenticated can view documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Privileged can upload documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.is_privileged(auth.uid()));

CREATE POLICY "Privileged can update documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.is_privileged(auth.uid()))
  WITH CHECK (bucket_id = 'documents' AND public.is_privileged(auth.uid()));

CREATE POLICY "Privileged can delete documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.is_privileged(auth.uid()));
