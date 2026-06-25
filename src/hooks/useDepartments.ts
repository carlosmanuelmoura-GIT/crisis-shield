import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Department {
  id: string;
  name: string;
  code: string | null;
  has_cc: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentInput {
  name: string;
  code?: string | null;
  has_cc?: boolean;
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments" as any)
        .select("*")
        .order("code", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as unknown as Department[];
    },
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: string | DepartmentInput) => {
      const payload =
        typeof input === "string"
          ? { name: input, owner_id: user?.id }
          : { ...input, owner_id: user?.id };
      const { error } = await (supabase.from("departments" as any) as any).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: { id: string } & DepartmentInput) => {
      const { error } = await (supabase.from("departments" as any) as any).update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("departments" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}
