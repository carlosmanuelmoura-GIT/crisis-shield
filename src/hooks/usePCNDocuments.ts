import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PCNDocument {
  id: string;
  dept_code: string;
  attribute_key: string;
  file_name: string;
  file_path: string;
  url: string;
  owner_id: string | null;
  created_at: string;
}

const TABLE = "pcn_documents" as any;

export const usePCNDocuments = () =>
  useQuery<PCNDocument[]>({
    queryKey: ["pcn_documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select("*").order("created_at") as any;
      if (error) throw error;
      return (data ?? []) as PCNDocument[];
    },
  });

export const useCreatePCNDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { dept_code: string; attribute_key: string; file_name: string; file_path: string; url: string }) => {
      const { error } = await supabase.from(TABLE).insert(params as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pcn_documents"] }),
  });
};

export const useDeletePCNDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pcn_documents"] }),
  });
};
