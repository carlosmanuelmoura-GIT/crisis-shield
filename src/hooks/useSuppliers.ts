import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Essentiality = "low" | "medium" | "high";
export type Alternatives = "multiple" | "limited" | "none";
export type SubstitutionTime = "low" | "medium" | "high";
export type ExitStrategy = "validado" | "nao_testado" | "nao_existente";

export const SUPPLIER_TYPES = [
  "Infraestrutura TI",
  "Energia",
  "Software",
  "Serviços SI/TI",
  "Manutenção de Infraestruturas Técnicas",
  "Telecomunicações",
  "Manutenção de Edifícios",
  "Pagamentos",
  "Emissão de Numerário",
] as const;
export type SupplierType = (typeof SUPPLIER_TYPES)[number];

export const SERVICE_TYPES = ["core", "especifico"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];
export const SERVICE_TYPE_LABEL: Record<string, { pt: string; en: string }> = {
  core: { pt: "CORE", en: "CORE" },
  especifico: { pt: "ESPECÍFICO", en: "SPECIFIC" },
};

export interface Supplier {
  id: string;
  catalog_id: string | null;
  name: string;
  contract_name: string;
  subcontractors: string;
  critical_area: string;
  supplier_type: string | null;
  service_type: string | null;
  rto_supplier_hours: number | null;
  rto_process_hours: number | null;
  dr_type_id: string | null;
  supplier_rto_compliant: boolean | null;
  essentiality: Essentiality;
  alternatives: Alternatives;
  substitution_time: SubstitutionTime;
  exit_strategy: ExitStrategy;
  last_gcn_test: string | null;
  department_id: string | null;
  notes: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierInput {
  catalog_id?: string | null;
  name: string;
  contract_name?: string;
  subcontractors?: string;
  critical_area?: string;
  supplier_type?: string | null;
  service_type?: string | null;
  dr_type_id?: string | null;
  supplier_rto_compliant?: boolean | null;
  essentiality?: Essentiality;
  alternatives?: Alternatives;
  substitution_time?: SubstitutionTime;
  exit_strategy?: ExitStrategy;
  last_gcn_test?: string | null;
  department_id?: string | null;
  notes?: string;
  funcoes?: string[];
}



export interface SupplierCatalogEntry {
  id: string;
  name: string;
}

export function useSupplierCatalog() {
  return useQuery({
    queryKey: ["supplier_catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supplier_catalog").select("id,name").order("name");
      if (error) throw error;
      return data as SupplierCatalogEntry[];
    },
  });
}

export function useCreateSupplierCatalogEntry() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("supplier_catalog")
        .insert({ name, owner_id: user?.id })
        .select("id,name")
        .single();
      if (error) throw error;
      return data as SupplierCatalogEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier_catalog"] }),
  });
}


export function useDeleteSupplierCatalogEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supplier_catalog").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier_catalog"] }),
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return data as Supplier[];
    },
  });
}

export function useSupplierRelations() {
  return useQuery({
    queryKey: ["supplier_relations"],
    queryFn: async () => {
      const f = await supabase.from("supplier_functions").select("supplier_id,funcao");
      if (f.error) throw f.error;
      return {
        funcoes: (f.data ?? []) as { supplier_id: string; funcao: string }[],
      };
    },
  });
}

async function syncRelations(supplierId: string, funcoes?: string[]) {
  if (funcoes) {
    await supabase.from("supplier_functions").delete().eq("supplier_id", supplierId);
    if (funcoes.length) {
      const { error } = await supabase
        .from("supplier_functions")
        .insert(funcoes.map((funcao) => ({ supplier_id: supplierId, funcao })));
      if (error) throw error;
    }
  }
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ funcoes, ...input }: SupplierInput) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...input, owner_id: user?.id })
        .select("id")
        .single();
      if (error) throw error;
      await syncRelations(data.id, funcoes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["supplier_relations"] });
    },
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, funcoes, ...input }: { id: string } & SupplierInput) => {
      const { error } = await supabase.from("suppliers").update(input).eq("id", id);
      if (error) throw error;
      await syncRelations(id, funcoes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["supplier_relations"] });
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["supplier_relations"] });
    },
  });
}

/* ── Helpers ── */
export const hasRtoMismatch = (s: Supplier) => s.supplier_rto_compliant === false;


export const isLockIn = (s: Supplier) => s.essentiality === "high" && s.alternatives === "none";

export const isGcnExpired = (s: Supplier) => {
  if (!s.last_gcn_test) return true;
  const d = new Date(s.last_gcn_test);
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() - 1);
  return d < limit;
};

export interface SupplierGroup {
  key: string;
  name: string;
  contracts: Supplier[];
}

export function groupBySupplier(rows: Supplier[]): SupplierGroup[] {
  const map = new Map<string, SupplierGroup>();
  for (const r of rows) {
    const key = r.catalog_id ?? `name:${r.name}`;
    const g = map.get(key) ?? { key, name: r.name, contracts: [] };
    g.contracts.push(r);
    map.set(key, g);
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
