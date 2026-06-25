import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBBIAProcess {
  id: string;
  name_pt: string;
  name_en: string;
  rto: number;
  rpo: number;
  criticality: string;
  dependencies: string[];
  business_process_id: string | null;
  dr_type_id: string | null;
  department_id: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useBIAProcesses() {
  return useQuery({
    queryKey: ["bia_processes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bia_processes")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as DBBIAProcess[];
    },
  });
}

export function useCreateBIAProcess() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      name_pt: string; name_en: string; rto: number; rpo: number;
      criticality: string;
      business_process_id?: string | null; dr_type_id?: string | null;
    }) => {
      const { error } = await supabase.from("bia_processes").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bia_processes"] }),
  });
}

export function useUpdateBIAProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string; name_pt: string; name_en: string; rto: number; rpo: number;
      criticality: string;
      business_process_id?: string | null; dr_type_id?: string | null;
    }) => {
      const { error } = await supabase.from("bia_processes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bia_processes"] }),
  });
}

export function useDeleteBIAProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bia_processes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bia_processes"] }),
  });
}
