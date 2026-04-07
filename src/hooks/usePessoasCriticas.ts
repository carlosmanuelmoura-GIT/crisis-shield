import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PessoaCritica {
  id: string;
  owner_id: string | null;
  nome: string;
  email: string;
  telefone: string;
  departamento: string;
  funcao: string;
  prioridade: number;
  codigo_postal: string;
  created_at: string;
  updated_at: string;
}

type PessoaCriticaInsert = Omit<PessoaCritica, "id" | "owner_id" | "created_at" | "updated_at">;
type PessoaCriticaUpdate = Partial<PessoaCriticaInsert> & { id: string };

const TABLE = "pessoas_criticas" as any;

export const usePessoasCriticas = () =>
  useQuery<PessoaCritica[]>({
    queryKey: ["pessoas_criticas"],
    queryFn: async () => {
      const { data, error } = await supabase.from(TABLE).select("*").order("prioridade").order("nome") as any;
      if (error) throw error;
      return (data ?? []) as PessoaCritica[];
    },
  });

export const useInsertPessoaCritica = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: PessoaCriticaInsert) => {
      const { error } = await supabase.from(TABLE).insert(c);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas_criticas"] }),
  });
};

export const useUpdatePessoaCritica = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: PessoaCriticaUpdate) => {
      const { error } = await supabase.from(TABLE).update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas_criticas"] }),
  });
};

export const useDeletePessoaCritica = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pessoas_criticas"] }),
  });
};
