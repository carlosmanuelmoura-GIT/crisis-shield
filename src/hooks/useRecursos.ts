import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBRecurso {
  id: string;
  name_pt: string;
  name_en: string;
  description_pt: string;
  description_en: string;
  icon: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useRecursos() {
  return useQuery({
    queryKey: ["recursos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("recursos").select("*").order("name_pt");
      if (error) throw error;
      return data as DBRecurso[];
    },
  });
}

export function useCreateRecurso() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { name_pt: string; name_en?: string; description_pt?: string; description_en?: string; icon?: string }) => {
      const { error } = await supabase.from("recursos").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recursos"] }),
  });
}

export function useUpdateRecurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name_pt: string; name_en?: string; description_pt?: string; description_en?: string; icon?: string }) => {
      const { error } = await supabase.from("recursos").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recursos"] }),
  });
}

export function useDeleteRecurso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recursos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recursos"] }),
  });
}
