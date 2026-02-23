import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DRType {
  id: string;
  code: string;
  label: string;
  rto: number;
  rpo: number;
  sort_order: number;
}

export interface CMDBPlatform {
  id: string;
  name: string;
  dr_type_id: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BIAProcessPlatform {
  id: string;
  bia_process_id: string;
  platform_id: string;
  created_at: string;
}

// DR Types
export function useDRTypes() {
  return useQuery({
    queryKey: ["dr_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dr_types")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as DRType[];
    },
  });
}

export function useUpdateDRType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rto, rpo }: { id: string; rto: number; rpo: number }) => {
      const { error } = await supabase.from("dr_types").update({ rto, rpo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dr_types"] }),
  });
}

// CMDB Platforms
export function useCMDBPlatforms() {
  return useQuery({
    queryKey: ["cmdb_platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cmdb_platforms")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CMDBPlatform[];
    },
  });
}

export function useCreateCMDBPlatform() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { name: string; dr_type_id: string | null }) => {
      const { error } = await supabase.from("cmdb_platforms").insert({ ...data, owner_id: user?.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cmdb_platforms"] }),
  });
}

export function useUpdateCMDBPlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; dr_type_id: string | null }) => {
      const { error } = await supabase.from("cmdb_platforms").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cmdb_platforms"] }),
  });
}

export function useDeleteCMDBPlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cmdb_platforms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cmdb_platforms"] }),
  });
}

// BIA Process <-> Platform links
export function useBIAProcessPlatforms() {
  return useQuery({
    queryKey: ["bia_process_platforms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bia_process_platforms").select("*");
      if (error) throw error;
      return data as BIAProcessPlatform[];
    },
  });
}

export function useLinkBIAProcessPlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bia_process_id: string; platform_id: string }) => {
      const { error } = await supabase.from("bia_process_platforms").insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bia_process_platforms"] }),
  });
}

export function useUnlinkBIAProcessPlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bia_process_platforms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bia_process_platforms"] }),
  });
}
