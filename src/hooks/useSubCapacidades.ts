import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBSubCapacidade {
  id: string;
  recurso_id: string;
  name_pt: string;
  name_en: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubCapacidades() {
  return useQuery({
    queryKey: ["sub_capacidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_capacidades" as any)
        .select("*")
        .order("name_pt");
      if (error) throw error;
      return data as unknown as DBSubCapacidade[];
    },
  });
}

export function useCreateSubCapacidade() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { recurso_id: string; name_pt: string; name_en?: string }) => {
      const { error } = await supabase.from("sub_capacidades" as any).insert({ ...data, owner_id: user?.id } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sub_capacidades"] }),
  });
}

export function useUpdateSubCapacidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name_pt: string; name_en?: string; recurso_id?: string }) => {
      const { error } = await supabase.from("sub_capacidades" as any).update(data as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sub_capacidades"] }),
  });
}

export function useDeleteSubCapacidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sub_capacidades" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sub_capacidades"] }),
  });
}
