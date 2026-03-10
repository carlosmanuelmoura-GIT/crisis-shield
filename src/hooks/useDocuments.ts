import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentCategory {
  id: string;
  name_pt: string;
  name_en: string;
  sort_order: number;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentFile {
  id: string;
  category_id: string;
  file_name: string;
  file_path: string;
  url: string;
  owner_id: string | null;
  created_at: string;
}

export const useDocumentCategories = () =>
  useQuery({
    queryKey: ["document_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_categories" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as DocumentCategory[];
    },
  });

export const useCreateDocumentCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name_pt: string; name_en: string }) => {
      const { error } = await supabase.from("document_categories" as any).insert(params as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["document_categories"] }),
  });
};

export const useUpdateDocumentCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; name_pt: string; name_en: string }) => {
      const { id, ...rest } = params;
      const { error } = await supabase.from("document_categories" as any).update(rest as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["document_categories"] }),
  });
};

export const useDeleteDocumentCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("document_categories" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["document_categories"] }),
  });
};

export const useDocumentFiles = () =>
  useQuery({
    queryKey: ["document_files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_files" as any)
        .select("*")
        .order("created_at");
      if (error) throw error;
      return (data || []) as unknown as DocumentFile[];
    },
  });

export const useCreateDocumentFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { category_id: string; file_name: string; file_path: string; url: string }) => {
      const { error } = await supabase.from("document_files" as any).insert(params as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["document_files"] }),
  });
};

export const useUpdateDocumentFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; url: string }) => {
      const { id, ...rest } = params;
      const { error } = await supabase.from("document_files" as any).update(rest as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["document_files"] }),
  });
};

export const useDeleteDocumentFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("document_files" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["document_files"] }),
  });
};
