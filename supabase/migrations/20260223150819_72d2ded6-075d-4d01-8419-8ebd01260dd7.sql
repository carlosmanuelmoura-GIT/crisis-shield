
CREATE TABLE public.meeting_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meeting_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view meeting_rooms" ON public.meeting_rooms FOR SELECT USING (true);
CREATE POLICY "Privileged can insert meeting_rooms" ON public.meeting_rooms FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update meeting_rooms" ON public.meeting_rooms FOR UPDATE USING (auth.uid() = owner_id OR is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can delete meeting_rooms" ON public.meeting_rooms FOR DELETE USING (auth.uid() = owner_id OR is_privileged(auth.uid()));

CREATE TRIGGER update_meeting_rooms_updated_at BEFORE UPDATE ON public.meeting_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
