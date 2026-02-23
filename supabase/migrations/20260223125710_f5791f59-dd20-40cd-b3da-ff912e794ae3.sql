
-- 1. RBAC enum and roles table
CREATE TYPE public.app_role AS ENUM ('steering_gcn', 'tecnico_departamento', 'especialista_gcn');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Security definer helpers
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_privileged(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('steering_gcn', 'especialista_gcn')
  )
$$;

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. user_roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Especialistas can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'especialista_gcn'));

-- 5. Action cards table
CREATE TABLE public.action_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'medium',
  icon TEXT NOT NULL DEFAULT 'flame',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.action_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view action cards" ON public.action_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can insert action cards" ON public.action_cards FOR INSERT TO authenticated WITH CHECK (public.is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update" ON public.action_cards FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete" ON public.action_cards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'especialista_gcn'));

-- 6. Checklist items table
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_card_id UUID REFERENCES public.action_cards(id) ON DELETE CASCADE NOT NULL,
  text_pt TEXT NOT NULL,
  text_en TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view checklist items" ON public.checklist_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Privileged can manage checklist items" ON public.checklist_items FOR INSERT TO authenticated WITH CHECK (public.is_privileged(auth.uid()));
CREATE POLICY "Privileged can update checklist items" ON public.checklist_items FOR UPDATE TO authenticated USING (public.is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete checklist items" ON public.checklist_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'especialista_gcn'));

-- 7. Per-user checklist state
CREATE TABLE public.checklist_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checklist_item_id UUID REFERENCES public.checklist_items(id) ON DELETE CASCADE NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checklist_item_id)
);
ALTER TABLE public.checklist_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist state" ON public.checklist_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own checklist state" ON public.checklist_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist state" ON public.checklist_state FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 8. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_cards_updated_at BEFORE UPDATE ON public.action_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklist_state_updated_at BEFORE UPDATE ON public.checklist_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
