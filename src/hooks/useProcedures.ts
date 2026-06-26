import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ProcedurePhase = "preparacao" | "gestao" | "fim";

export interface DBProcedure {
  id: string;
  title_pt: string;
  title_en: string;
  category_pt: string;
  category_en: string;
  content_pt: string;
  content_en: string;
  phase: ProcedurePhase;
  sort_order: number;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

type ProcInput = {
  title_pt: string; title_en: string;
  category_pt: string; category_en: string;
  content_pt: string; content_en: string;
  phase?: ProcedurePhase;
  sort_order?: number;
};

export function useProcedures() {
  return useQuery({
    queryKey: ["procedures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .order("phase")
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data as DBProcedure[];
    },
  });
}

export function useCreateProcedure() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: ProcInput) => {
      const { error } = await supabase.from("procedures").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["procedures"] }),
  });
}

export function useUpdateProcedure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ProcInput>) => {
      const { error } = await supabase.from("procedures").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["procedures"] }),
  });
}

export function useDeleteProcedure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("procedures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["procedures"] }),
  });
}
