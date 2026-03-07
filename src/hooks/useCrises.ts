import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DBCrisis {
  id: string;
  title: string;
  crisis_date: string;
  status: "registada" | "em_alerta" | "crise_em_curso" | "retorno" | "fim";
  crisis_type: string;
  owner_id: string | null;
  cloned_from_id: string | null;
  declared_by: string;
  ended_by: string;
  created_at: string;
  updated_at: string;
}

export interface DBCrisisCabinetMember {
  id: string;
  crisis_id: string;
  name: string;
  role: string;
  created_at: string;
}

export interface DBCrisisPhaseAction {
  id: string;
  crisis_id: string;
  phase_id: string;
  text: string;
  checked: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useCrises() {
  return useQuery({
    queryKey: ["crises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crises")
        .select("*")
        .order("crisis_date", { ascending: false });
      if (error) throw error;
      return data as DBCrisis[];
    },
  });
}

export function useCreateCrisis() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      crisis_date: string;
      crisis_type: string;
      status?: DBCrisis["status"];
      cabinet_members?: { name: string; role: string }[];
      clone_from_id?: string;
    }) => {
      const { data: crisis, error } = await supabase
        .from("crises")
        .insert({
          title: data.title,
          crisis_date: data.crisis_date,
          crisis_type: data.crisis_type,
          status: data.status || "registada",
          owner_id: user?.id,
          cloned_from_id: data.clone_from_id || null,
        } as any)
        .select()
        .single();
      if (error) throw error;

      if (data.cabinet_members && data.cabinet_members.length > 0) {
        const { error: cmErr } = await supabase
          .from("crisis_cabinet_members")
          .insert(
            data.cabinet_members.map((m) => ({
              crisis_id: (crisis as any).id,
              name: m.name,
              role: m.role,
            })) as any
          );
        if (cmErr) throw cmErr;
      }

      if (data.clone_from_id) {
        const { data: sourceActions } = await supabase
          .from("crisis_phase_actions")
          .select("*")
          .eq("crisis_id", data.clone_from_id)
          .order("sort_order");
        if (sourceActions && sourceActions.length > 0) {
          const { error: cloneErr } = await supabase
            .from("crisis_phase_actions")
            .insert(
              sourceActions.map((a: any) => ({
                crisis_id: (crisis as any).id,
                phase_id: a.phase_id,
                text: a.text,
                checked: false,
                sort_order: a.sort_order,
              })) as any
            );
          if (cloneErr) throw cloneErr;
        }
      }

      // Log to decision_log
      await supabase.from("decision_log").insert({
        title: `📋 Crise registada`,
        text: `Crise "${data.title}" registada (${data.crisis_type})`,
        author: "Sistema",
        owner_id: user?.id,
      } as any);

      return crisis as DBCrisis;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crises"] });
      qc.invalidateQueries({ queryKey: ["crisis_cabinet_members"] });
      qc.invalidateQueries({ queryKey: ["crisis_phase_actions"] });
      qc.invalidateQueries({ queryKey: ["decision_log"] });
    },
  });
}

export function useUpdateCrisis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      title?: string;
      status?: DBCrisis["status"];
      crisis_type?: string;
      crisis_date?: string;
      declared_by?: string;
      ended_by?: string;
    }) => {
      const { error } = await supabase.from("crises").update(data as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crises"] }),
  });
}

export function useDeleteCrisis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crises"] });
      qc.invalidateQueries({ queryKey: ["crisis_cabinet_members"] });
      qc.invalidateQueries({ queryKey: ["crisis_phase_actions"] });
    },
  });
}

export function useCrisisCabinetMembers(crisisId?: string) {
  return useQuery({
    queryKey: ["crisis_cabinet_members", crisisId],
    enabled: !!crisisId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crisis_cabinet_members")
        .select("*")
        .eq("crisis_id", crisisId!)
        .order("created_at");
      if (error) throw error;
      return data as DBCrisisCabinetMember[];
    },
  });
}

export function useUpdateCabinetMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ crisis_id, members }: { crisis_id: string; members: { name: string; role: string }[] }) => {
      // Delete existing
      const { error: delErr } = await supabase.from("crisis_cabinet_members").delete().eq("crisis_id", crisis_id);
      if (delErr) throw delErr;
      // Re-insert
      if (members.length > 0) {
        const { error: insErr } = await supabase.from("crisis_cabinet_members").insert(
          members.map((m) => ({ crisis_id, name: m.name, role: m.role })) as any
        );
        if (insErr) throw insErr;
      }
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["crisis_cabinet_members", vars.crisis_id] }),
  });
}

export function useCrisisPhaseActions(crisisId?: string) {
  return useQuery({
    queryKey: ["crisis_phase_actions", crisisId],
    enabled: !!crisisId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crisis_phase_actions")
        .select("*")
        .eq("crisis_id", crisisId!)
        .order("sort_order");
      if (error) throw error;
      return data as DBCrisisPhaseAction[];
    },
  });
}

export function useCreatePhaseAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { crisis_id: string; phase_id: string; text: string; sort_order?: number }) => {
      const { error } = await supabase.from("crisis_phase_actions").insert({
        crisis_id: data.crisis_id,
        phase_id: data.phase_id,
        text: data.text,
        sort_order: data.sort_order || 0,
      } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["crisis_phase_actions", vars.crisis_id] }),
  });
}

export function useTogglePhaseAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checked, crisis_id }: { id: string; checked: boolean; crisis_id: string }) => {
      const { error } = await supabase.from("crisis_phase_actions").update({ checked } as any).eq("id", id);
      if (error) throw error;
      return crisis_id;
    },
    onSuccess: (crisis_id) => qc.invalidateQueries({ queryKey: ["crisis_phase_actions", crisis_id] }),
  });
}

export function useDeletePhaseAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, crisis_id }: { id: string; crisis_id: string }) => {
      const { error } = await supabase.from("crisis_phase_actions").delete().eq("id", id);
      if (error) throw error;
      return crisis_id;
    },
    onSuccess: (crisis_id) => qc.invalidateQueries({ queryKey: ["crisis_phase_actions", crisis_id] }),
  });
}

export function useLogDecisionFromCrisis() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { title: string; text: string; author?: string; crisis_id?: string }) => {
      const { error } = await supabase.from("decision_log").insert({
        title: data.title,
        text: data.text,
        author: data.author || "Sistema",
        owner_id: user?.id,
        crisis_id: data.crisis_id || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decision_log"] }),
  });
}
