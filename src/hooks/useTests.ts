import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBTest {
  id: string;
  name: string;
  test_date: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useTests() {
  return useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tests").select("*").order("test_date", { ascending: false });
      if (error) throw error;
      return data as DBTest[];
    },
  });
}

export function useCreateTest() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { name: string; test_date: string; building_ids: string[]; platform_ids: string[]; bp_ids: string[] }) => {
      const { data: test, error } = await supabase.from("tests").insert({ name: data.name, test_date: data.test_date, owner_id: user?.id }).select("id").single();
      if (error) throw error;
      const testId = test.id;
      if (data.building_ids.length > 0) {
        const { error: e1 } = await supabase.from("test_buildings").insert(data.building_ids.map(b => ({ test_id: testId, building_id: b })));
        if (e1) throw e1;
      }
      if (data.platform_ids.length > 0) {
        const { error: e2 } = await supabase.from("test_platforms").insert(data.platform_ids.map(p => ({ test_id: testId, platform_id: p })));
        if (e2) throw e2;
      }
      if (data.bp_ids.length > 0) {
        const { error: e3 } = await supabase.from("test_business_processes").insert(data.bp_ids.map(b => ({ test_id: testId, business_process_id: b })));
        if (e3) throw e3;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tests"] });
      qc.invalidateQueries({ queryKey: ["test_relations"] });
    },
  });
}

export function useUpdateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; name: string; test_date: string; building_ids: string[]; platform_ids: string[]; bp_ids: string[] }) => {
      const { error } = await supabase.from("tests").update({ name: data.name, test_date: data.test_date }).eq("id", data.id);
      if (error) throw error;
      // Replace relations
      await supabase.from("test_buildings").delete().eq("test_id", data.id);
      await supabase.from("test_platforms").delete().eq("test_id", data.id);
      await supabase.from("test_business_processes").delete().eq("test_id", data.id);
      if (data.building_ids.length > 0) {
        await supabase.from("test_buildings").insert(data.building_ids.map(b => ({ test_id: data.id, building_id: b })));
      }
      if (data.platform_ids.length > 0) {
        await supabase.from("test_platforms").insert(data.platform_ids.map(p => ({ test_id: data.id, platform_id: p })));
      }
      if (data.bp_ids.length > 0) {
        await supabase.from("test_business_processes").insert(data.bp_ids.map(b => ({ test_id: data.id, business_process_id: b })));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tests"] });
      qc.invalidateQueries({ queryKey: ["test_relations"] });
    },
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tests"] });
      qc.invalidateQueries({ queryKey: ["test_relations"] });
    },
  });
}

export function useTestRelations(testId: string | null) {
  return useQuery({
    queryKey: ["test_relations", testId],
    enabled: !!testId,
    queryFn: async () => {
      const [b, p, bp] = await Promise.all([
        supabase.from("test_buildings").select("building_id").eq("test_id", testId!),
        supabase.from("test_platforms").select("platform_id").eq("test_id", testId!),
        supabase.from("test_business_processes").select("business_process_id").eq("test_id", testId!),
      ]);
      return {
        building_ids: (b.data || []).map((r: any) => r.building_id),
        platform_ids: (p.data || []).map((r: any) => r.platform_id),
        bp_ids: (bp.data || []).map((r: any) => r.business_process_id),
      };
    },
  });
}

export function useAllTestRelations() {
  return useQuery({
    queryKey: ["test_relations", "all"],
    queryFn: async () => {
      const [b, p, bp] = await Promise.all([
        supabase.from("test_buildings").select("*"),
        supabase.from("test_platforms").select("*"),
        supabase.from("test_business_processes").select("*"),
      ]);
      return {
        buildings: (b.data || []) as { test_id: string; building_id: string }[],
        platforms: (p.data || []) as { test_id: string; platform_id: string }[],
        bps: (bp.data || []) as { test_id: string; business_process_id: string }[],
      };
    },
  });
}
