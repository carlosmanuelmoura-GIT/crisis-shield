import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBBusinessProcess {
  id: string;
  tipo_funcao: string;
  funcao: string;
  macro_processo: string;
  processo: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useBusinessProcesses() {
  return useQuery({
    queryKey: ["business_processes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_processes")
        .select("*")
        .order("tipo_funcao");
      if (error) throw error;
      return data as DBBusinessProcess[];
    },
  });
}

export function useCreateBusinessProcess() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { tipo_funcao: string; funcao: string; macro_processo: string; processo: string }) => {
      const { error } = await supabase.from("business_processes").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business_processes"] }),
  });
}

export function useUpdateBusinessProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; tipo_funcao: string; funcao: string; macro_processo: string; processo: string }) => {
      const { error } = await supabase.from("business_processes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business_processes"] }),
  });
}

export function useDeleteBusinessProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("business_processes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business_processes"] }),
  });
}
