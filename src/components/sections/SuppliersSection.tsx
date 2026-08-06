import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Eye, Trash2, AlertTriangle, ShieldAlert, Truck, CalendarClock, X } from "lucide-react";
import {
  useSuppliers,
  useSupplierRelations,
  useSupplierCatalog,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  hasRtoMismatch,
  isLockIn,
  isGcnExpired,
  type Supplier,
  type SupplierInput,
  SUPPLIER_TYPES,
} from "@/hooks/useSuppliers";
import { useDepartments } from "@/hooks/useDepartments";
import { useDRTypes } from "@/hooks/useCMDBPlatforms";

import { useBusinessProcesses } from "@/hooks/useBusinessProcesses";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ALL = "__all__";

const ESS_LABEL: Record<string, { pt: string; en: string }> = {
  low: { pt: "Baixa", en: "Low" },
  medium: { pt: "Média", en: "Medium" },
  high: { pt: "Alta", en: "High" },
};
const ALT_LABEL: Record<string, { pt: string; en: string }> = {
  multiple: { pt: "Múltiplas alternativas", en: "Multiple" },
  limited: { pt: "Alternativas limitadas", en: "Limited" },
  none: { pt: "Sem alternativas viáveis", en: "No viable alternatives" },
};
const SUB_LABEL: Record<string, { pt: string; en: string }> = {
  low: { pt: "< 6 meses", en: "< 6 months" },
  medium: { pt: "6 - 18 meses", en: "6 - 18 months" },
  high: { pt: "> 18 meses", en: "> 18 months" },
};
const RISK_TONE: Record<"good" | "warn" | "bad", string> = {
  good: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  warn: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  bad: "bg-destructive/10 text-destructive border-destructive/30",
};
const ESS_RISK: Record<string, "good" | "warn" | "bad"> = { low: "good", medium: "warn", high: "bad" };
const ALT_RISK: Record<string, "good" | "warn" | "bad"> = { multiple: "good", limited: "warn", none: "bad" };
const SUB_RISK: Record<string, "good" | "warn" | "bad"> = { low: "good", medium: "warn", high: "bad" };

const DepBadge: React.FC<{ risk: "good" | "warn" | "bad"; children: React.ReactNode }> = ({ risk, children }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", RISK_TONE[risk])}>
    <span className={cn("h-1.5 w-1.5 rounded-full", risk === "good" ? "bg-emerald-500" : risk === "warn" ? "bg-amber-500" : "bg-destructive")} />
    {children}
  </span>
);
const EXIT_LABEL: Record<string, { pt: string; en: string }> = {
  validado: { pt: "Validado", en: "Validated" },
  nao_testado: { pt: "Não testado", en: "Not tested" },
  nao_existente: { pt: "Não existente", en: "Not defined" },
};

const emptyForm = (): SupplierInput => ({
  name: "",
  subcontractors: "",
  critical_area: "",
  supplier_type: null,
  dr_type_id: null,
  supplier_rto_compliant: null,

  essentiality: "medium",
  alternatives: "limited",
  substitution_time: "medium",
  exit_strategy: "nao_existente",
  last_gcn_test: null,
  department_id: null,
  notes: "",
  funcoes: [],
  
});

const SuppliersSection: React.FC = () => {
  const { lang } = useApp();
  const L = (o: { pt: string; en: string }) => (lang === "pt" ? o.pt : o.en);
  const { toast } = useToast();

  const { data: suppliers = [], isLoading } = useSuppliers();
  const { data: relations } = useSupplierRelations();
  const { data: catalog = [] } = useSupplierCatalog();
  const { data: departments = [] } = useDepartments();
  const { data: bps = [] } = useBusinessProcesses();
  const { data: drTypes = [] } = useDRTypes();

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [tab, setTab] = useState("list");
  const [fArea, setFArea] = useState(ALL);
  const [fEss, setFEss] = useState(ALL);
  const [fRto, setFRto] = useState(ALL);
  const [fDr, setFDr] = useState(ALL);

  const [fLockIn, setFLockIn] = useState(false);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierInput>(emptyForm());
  const [detail, setDetail] = useState<Supplier | null>(null);

  const funcoesList = useMemo(
    () => Array.from(new Set(bps.map((b) => b.funcao).filter(Boolean))).sort(),
    [bps]
  );
  const areas = useMemo(
    () => Array.from(new Set(suppliers.map((s) => s.critical_area).filter(Boolean))).sort(),
    [suppliers]
  );

  const funcoesOf = (id: string) => relations?.funcoes.filter((r) => r.supplier_id === id).map((r) => r.funcao) ?? [];
  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? "—";
  const drOf = (id: string | null) => drTypes.find((d) => d.id === id);
  const drLabel = (id: string | null) => {
    const d = drOf(id);
    return d ? `${d.code} — ${d.rto}h` : "—";
  };

  const filtered = useMemo(
    () =>
      suppliers.filter((s) => {
        if (fArea !== ALL && s.critical_area !== fArea) return false;
        if (fEss !== ALL && s.essentiality !== fEss) return false;
        if (fRto === "mismatch" && s.supplier_rto_compliant !== false) return false;
        if (fRto === "ok" && s.supplier_rto_compliant !== true) return false;
        if (fDr !== ALL && s.dr_type_id !== fDr) return false;
        if (fLockIn && !(isLockIn(s) && s.substitution_time === "high")) return false;
        if (search && !`${s.name} ${s.subcontractors}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [suppliers, fArea, fEss, fRto, fDr, fLockIn, search]
  );



  const kpis = useMemo(
    () => ({
      total: suppliers.length,
      lockIn: suppliers.filter(isLockIn).length,
      mismatch: suppliers.filter(hasRtoMismatch).length,
      gcn: suppliers.filter(isGcnExpired).length,
    }),
    [suppliers]
  );

  const resetFilters = () => {
    setFArea(ALL);
    setFEss(ALL);
    setFRto(ALL);
    setFDr(ALL);

    setFLockIn(false);
    setSearch("");
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({
      catalog_id: s.catalog_id,
      name: s.name,
      subcontractors: s.subcontractors,
      critical_area: s.critical_area,
      supplier_type: s.supplier_type,
      dr_type_id: s.dr_type_id,
      supplier_rto_compliant: s.supplier_rto_compliant,

      essentiality: s.essentiality,
      alternatives: s.alternatives,
      substitution_time: s.substitution_time,
      exit_strategy: s.exit_strategy,
      last_gcn_test: s.last_gcn_test,
      department_id: s.department_id,
      notes: s.notes,
      funcoes: funcoesOf(s.id),
      
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      if (editingId) await updateSupplier.mutateAsync({ id: editingId, ...form });
      else await createSupplier.mutateAsync(form);
      setDialogOpen(false);
      toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (e: any) {
      toast({ title: lang === "pt" ? "Erro ao guardar" : "Save error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSupplier.mutateAsync(id);
    setDetail(null);
    toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
  };

  const toggleIn = (list: string[] | undefined, value: string) => {
    const arr = list ?? [];
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  };

  /* ── Matriz 2x2 ── */
  const quadrant = (essHigh: boolean, subHigh: boolean) =>
    suppliers.filter(
      (s) =>
        (s.essentiality === "high") === essHigh &&
        (s.substitution_time === "high") === subHigh
    );

  const applyQuadrant = (essHigh: boolean, subHigh: boolean, critical: boolean) => {
    resetFilters();
    setFEss(essHigh ? "high" : ALL);
    if (critical) setFLockIn(true);
    setTab("list");
  };

  const kpiCard = (icon: React.ElementType, label: string, value: number, tone: string) => {
    const Icon = icon;
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn("rounded-lg p-2", tone)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {L({ pt: "Análise de Fornecedores Críticos", en: "Critical Supplier Analysis" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {L({
              pt: "Risco, dependência e conformidade dos fornecedores críticos de TI, infraestruturas e pagamentos.",
              en: "Risk, dependency and compliance of critical IT, infrastructure and payment suppliers.",
            })}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {L({ pt: "Novo Fornecedor", en: "New Supplier" })}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCard(Truck, L({ pt: "Total de Fornecedores Críticos", en: "Total critical suppliers" }), kpis.total, "bg-primary/10 text-primary")}
        {kpiCard(ShieldAlert, L({ pt: "Vulnerabilidade Extrema / Lock-in", en: "Extreme vulnerability / Lock-in" }), kpis.lockIn, "bg-destructive/10 text-destructive")}
        {kpiCard(AlertTriangle, L({ pt: "Alertas de RTO Mismatch", en: "RTO mismatch alerts" }), kpis.mismatch, "bg-amber-500/10 text-amber-600")}
        {kpiCard(CalendarClock, L({ pt: "GCN Pendente / Expirado", en: "BCM test pending / expired" }), kpis.gcn, "bg-yellow-400/20 text-yellow-700")}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">{L({ pt: "Fornecedores", en: "Suppliers" })}</TabsTrigger>
          <TabsTrigger value="matrix">{L({ pt: "Matriz de Concentração", en: "Concentration Matrix" })}</TabsTrigger>
        </TabsList>

        {/* ── Lista ── */}
        <TabsContent value="list" className="space-y-3">
          <Card>
            <CardContent className="flex flex-wrap items-end gap-3 p-4">
              <div className="w-56">
                <Label className="text-xs">{L({ pt: "Área Crítica", en: "Critical Area" })}</Label>
                <Select value={fArea} onValueChange={setFArea}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{L({ pt: "Todas", en: "All" })}</SelectItem>
                    {areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label className="text-xs">{L({ pt: "Nível de Dependência", en: "Dependency level" })}</Label>
                <Select value={fEss} onValueChange={setFEss}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{L({ pt: "Todos", en: "All" })}</SelectItem>
                    {["high", "medium", "low"].map((k) => (
                      <SelectItem key={k} value={k}>{L(ESS_LABEL[k])}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label className="text-xs">{L({ pt: "RTO Fornecedor", en: "Supplier RTO" })}</Label>
                <Select value={fRto} onValueChange={setFRto}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{L({ pt: "Todos", en: "All" })}</SelectItem>
                    <SelectItem value="ok">{L({ pt: "Conforme", en: "Compliant" })}</SelectItem>
                    <SelectItem value="mismatch">{L({ pt: "Não conforme", en: "Non-compliant" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label className="text-xs">{L({ pt: "Tipo de DR (Processo)", en: "DR type (process)" })}</Label>
                <Select value={fDr} onValueChange={setFDr}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{L({ pt: "Todos", en: "All" })}</SelectItem>
                    {drTypes.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.code} — {d.rto}h</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-56">
                <Label className="text-xs">{L({ pt: "Pesquisar", en: "Search" })}</Label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={L({ pt: "Fornecedor…", en: "Supplier…" })} />
              </div>
              {(fArea !== ALL || fEss !== ALL || fRto !== ALL || fDr !== ALL || fLockIn || search) && (

                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" /> {L({ pt: "Limpar", en: "Clear" })}
                </Button>
              )}
              {fLockIn && (
                <Badge variant="destructive">{L({ pt: "Quadrante Lock-in", en: "Lock-in quadrant" })}</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{L({ pt: "Fornecedor & Subcontratados", en: "Supplier & subcontractors" })}</TableHead>
                      <TableHead>{L({ pt: "Função", en: "Function" })}</TableHead>
                      
                      <TableHead>{L({ pt: "RTO Fornecedor", en: "Supplier RTO" })}</TableHead>
                      <TableHead>{L({ pt: "Essencialidade", en: "Essentiality" })}</TableHead>
                      <TableHead>{L({ pt: "Alternativas Viáveis", en: "Viable alternatives" })}</TableHead>
                      <TableHead>{L({ pt: "Tempo de Substituição", en: "Substitution time" })}</TableHead>
                      <TableHead>{L({ pt: "Estratégia de Saída", en: "Exit strategy" })}</TableHead>
                      <TableHead>{L({ pt: "Último Teste GCN", en: "Last BCM test" })}</TableHead>
                      <TableHead className="text-right">{L({ pt: "Ações", en: "Actions" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">…</TableCell></TableRow>
                    )}
                    {!isLoading && filtered.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {L({ pt: "Sem fornecedores.", en: "No suppliers." })}
                      </TableCell></TableRow>
                    )}
                    {filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <p className="font-medium">{s.name}</p>
                          {s.subcontractors && <p className="text-xs text-muted-foreground">{s.subcontractors}</p>}
                          {s.supplier_type && <p className="text-xs text-muted-foreground">{s.supplier_type}</p>}
                          {s.critical_area && <p className="text-xs text-muted-foreground italic">{s.critical_area}</p>}
                        </TableCell>
                        <TableCell className="text-xs">{funcoesOf(s.id).join(", ") || "—"}</TableCell>
                        
                        <TableCell>
                          <Badge className={cn(s.supplier_rto_compliant === false ? "bg-destructive text-destructive-foreground" : s.supplier_rto_compliant === true ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>
                            {s.supplier_rto_compliant == null
                              ? "—"
                              : s.supplier_rto_compliant
                                ? L({ pt: "Conforme", en: "Compliant" })
                                : `${L({ pt: "Não conforme", en: "Non-compliant" })} ⚠`}
                          </Badge>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {L({ pt: "Processo", en: "Process" })}: {drLabel(s.dr_type_id)}
                          </p>
                        </TableCell>

                        <TableCell>
                          <DepBadge risk={ESS_RISK[s.essentiality]}>{L(ESS_LABEL[s.essentiality])}</DepBadge>
                        </TableCell>
                        <TableCell>
                          <DepBadge risk={ALT_RISK[s.alternatives]}>{L(ALT_LABEL[s.alternatives])}</DepBadge>
                        </TableCell>
                        <TableCell>
                          <DepBadge risk={SUB_RISK[s.substitution_time]}>{L(SUB_LABEL[s.substitution_time])}</DepBadge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.exit_strategy === "validado" ? "default" : s.exit_strategy === "nao_testado" ? "secondary" : "destructive"}>
                            {L(EXIT_LABEL[s.exit_strategy])}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className={cn(isGcnExpired(s) && "text-destructive font-medium")}>
                            {s.last_gcn_test ?? L({ pt: "Sem teste", en: "No test" })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="ghost" size="icon" onClick={() => setDetail(s)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Matriz ── */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {L({ pt: "Matriz de Concentração e Dependência", en: "Concentration & Dependency Matrix" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex items-center">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                    {L({ pt: "ESFORÇO DE SUBSTITUIÇÃO", en: "SUBSTITUTION EFFORT" })}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { essHigh: false, subHigh: true, critical: false, title: { pt: "Substituição lenta, essencialidade baixa/média", en: "Slow substitution, low/medium essentiality" }, tone: "bg-amber-500/10 border-amber-500/40" },
                      { essHigh: true, subHigh: true, critical: true, title: { pt: "Vulnerabilidade Extrema / Lock-in", en: "Extreme vulnerability / Lock-in" }, tone: "bg-destructive/10 border-destructive" },
                      { essHigh: false, subHigh: false, critical: false, title: { pt: "Risco controlado", en: "Controlled risk" }, tone: "bg-emerald-500/10 border-emerald-500/40" },
                      { essHigh: true, subHigh: false, critical: false, title: { pt: "Essencial mas substituível", en: "Essential but replaceable" }, tone: "bg-yellow-400/15 border-yellow-500/40" },
                    ].map((q, i) => {
                      const items = quadrant(q.essHigh, q.subHigh);
                      return (
                        <button
                          key={i}
                          onClick={() => applyQuadrant(q.essHigh, q.subHigh, q.critical)}
                          className={cn("text-left rounded-lg border p-4 min-h-[150px] transition-colors hover:brightness-95", q.tone)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{L(q.title)}</p>
                            <span className="text-2xl font-bold">{items.length}</span>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {items.map((s) => (
                              <li key={s.id} className="text-xs text-muted-foreground">• {s.name}</li>
                            ))}
                          </ul>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-muted-foreground">
                    <span>{L({ pt: "Essencialidade Baixa/Média", en: "Low/Medium essentiality" })}</span>
                    <span>{L({ pt: "Essencialidade Alta", en: "High essentiality" })}</span>
                  </div>
                  <p className="text-center text-xs font-semibold tracking-wider text-muted-foreground">
                    {L({ pt: "ESSENCIALIDADE DO SERVIÇO", en: "SERVICE ESSENTIALITY" })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {L({ pt: "Clique num quadrante para filtrar a lista de fornecedores.", en: "Click a quadrant to filter the supplier list." })}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialog CRUD ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl w-[calc(100%-2rem)] h-[90dvh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {editingId ? L({ pt: "Editar Fornecedor", en: "Edit Supplier" }) : L({ pt: "Novo Fornecedor", en: "New Supplier" })}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{L({ pt: "Fornecedor", en: "Supplier" })}</Label>
                {catalog.length > 0 && (
                  <Select
                    value={form.catalog_id ?? ""}
                    onValueChange={(v) => {
                      const entry = catalog.find((c) => c.id === v);
                      setForm({ ...form, catalog_id: v, name: entry?.name ?? form.name });
                    }}
                  >
                    <SelectTrigger className="mb-2"><SelectValue placeholder={L({ pt: "Escolher do catálogo", en: "Pick from catalogue" })} /></SelectTrigger>
                    <SelectContent>
                      {catalog.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>{L({ pt: "Subcontratados (4ª parte)", en: "Subcontractors (4th party)" })}</Label>
                <Input value={form.subcontractors ?? ""} onChange={(e) => setForm({ ...form, subcontractors: e.target.value })} />
              </div>
              <div>
                <Label>{L({ pt: "Área Crítica", en: "Critical Area" })}</Label>
                <Input value={form.critical_area ?? ""} onChange={(e) => setForm({ ...form, critical_area: e.target.value })} />
              </div>
              <div>
                <Label>{L({ pt: "Tipo de Fornecedor", en: "Supplier type" })}</Label>
                <Select value={form.supplier_type ?? ""} onValueChange={(v) => setForm({ ...form, supplier_type: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {SUPPLIER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{L({ pt: "Departamento responsável", en: "Responsible department" })}</Label>
                <Select value={form.department_id ?? ""} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{L({ pt: "RTO Fornecedor", en: "Supplier RTO" })}</Label>
                <Select
                  value={form.supplier_rto_compliant == null ? "" : form.supplier_rto_compliant ? "yes" : "no"}
                  onValueChange={(v) => setForm({ ...form, supplier_rto_compliant: v === "yes" })}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{L({ pt: "Conforme", en: "Compliant" })}</SelectItem>
                    <SelectItem value="no">{L({ pt: "Não conforme", en: "Non-compliant" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{L({ pt: "RTO Processo (Tipo de DR)", en: "Process RTO (DR type)" })}</Label>
                <Select value={form.dr_type_id ?? ""} onValueChange={(v) => setForm({ ...form, dr_type_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {drTypes.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.code} — {d.label} ({d.rto}h)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{L({ pt: "Essencialidade", en: "Essentiality" })}</Label>
                <Select value={form.essentiality} onValueChange={(v: any) => setForm({ ...form, essentiality: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["low", "medium", "high"].map((k) => <SelectItem key={k} value={k}>{L(ESS_LABEL[k])}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{L({ pt: "Alternativas Viáveis", en: "Viable alternatives" })}</Label>
                <Select value={form.alternatives} onValueChange={(v: any) => setForm({ ...form, alternatives: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["multiple", "limited", "none"].map((k) => <SelectItem key={k} value={k}>{L(ALT_LABEL[k])}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{L({ pt: "Tempo de Substituição", en: "Substitution time" })}</Label>
                <Select value={form.substitution_time} onValueChange={(v: any) => setForm({ ...form, substitution_time: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["low", "medium", "high"].map((k) => <SelectItem key={k} value={k}>{L(SUB_LABEL[k])}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{L({ pt: "Estratégia de Saída", en: "Exit strategy" })}</Label>
                <Select value={form.exit_strategy} onValueChange={(v: any) => setForm({ ...form, exit_strategy: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["validado", "nao_testado", "nao_existente"].map((k) => <SelectItem key={k} value={k}>{L(EXIT_LABEL[k])}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{L({ pt: "Data do último teste GCN", en: "Last BCM test date" })}</Label>
                <Input type="date" value={form.last_gcn_test ?? ""} onChange={(e) => setForm({ ...form, last_gcn_test: e.target.value || null })} />
              </div>
            </div>

            <div>
              <Label>{L({ pt: "Funções", en: "Functions" })}</Label>
              <ScrollArea className="h-40 rounded-md border p-2 mt-1">
                {funcoesList.map((f) => (
                  <label key={f} className="flex items-start gap-2 py-1 text-sm cursor-pointer">
                    <Checkbox
                      checked={form.funcoes?.includes(f)}
                      onCheckedChange={() => setForm({ ...form, funcoes: toggleIn(form.funcoes, f) })}
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </ScrollArea>
            </div>

            <div>
              <Label>{L({ pt: "Notas", en: "Notes" })}</Label>
              <Textarea rows={4} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="shrink-0">
            {editingId && (
              <Button variant="destructive" onClick={() => { handleDelete(editingId); setDialogOpen(false); }}>
                <Trash2 className="h-4 w-4 mr-1" /> {L({ pt: "Eliminar", en: "Delete" })}
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{L({ pt: "Cancelar", en: "Cancel" })}</Button>
            <Button onClick={handleSave}>{L({ pt: "Guardar", en: "Save" })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detalhe ── */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90dvh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{detail?.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3 text-sm pr-2">
              <div className="flex flex-wrap gap-2">
                {hasRtoMismatch(detail) && <Badge variant="destructive">RTO Mismatch</Badge>}
                {isLockIn(detail) && <Badge variant="destructive">Lock-in</Badge>}
                {isGcnExpired(detail) && <Badge variant="secondary">{L({ pt: "GCN expirado", en: "BCM expired" })}</Badge>}
              </div>
              {[
                [L({ pt: "Subcontratados (4ª parte)", en: "Subcontractors (4th party)" }), detail.subcontractors || "—"],
                [L({ pt: "Área Crítica", en: "Critical Area" }), detail.critical_area || "—"],
                [L({ pt: "Tipo de Fornecedor", en: "Supplier type" }), detail.supplier_type || "—"],
                [L({ pt: "Funções", en: "Functions" }), funcoesOf(detail.id).join(", ") || "—"],
                
                [L({ pt: "RTO Fornecedor", en: "Supplier RTO" }), detail.supplier_rto_compliant == null ? "—" : detail.supplier_rto_compliant ? L({ pt: "Conforme", en: "Compliant" }) : L({ pt: "Não conforme", en: "Non-compliant" })],
                [L({ pt: "RTO Processo (Tipo de DR)", en: "Process RTO (DR type)" }), drOf(detail.dr_type_id) ? `${drOf(detail.dr_type_id)!.code} — ${drOf(detail.dr_type_id)!.label} (${drOf(detail.dr_type_id)!.rto}h)` : "—"],

                [L({ pt: "Essencialidade", en: "Essentiality" }), L(ESS_LABEL[detail.essentiality])],
                [L({ pt: "Alternativas Viáveis", en: "Viable alternatives" }), L(ALT_LABEL[detail.alternatives])],
                [L({ pt: "Tempo de Substituição", en: "Substitution time" }), L(SUB_LABEL[detail.substitution_time])],
                [L({ pt: "Estratégia de Saída", en: "Exit strategy" }), L(EXIT_LABEL[detail.exit_strategy])],
                [L({ pt: "Último Teste GCN", en: "Last BCM test" }), detail.last_gcn_test ?? "—"],
                [L({ pt: "Departamento responsável", en: "Responsible department" }), deptName(detail.department_id)],
                [L({ pt: "Notas", en: "Notes" }), detail.notes || "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="grid grid-cols-3 gap-2 border-b pb-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="col-span-2 font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={() => { openEdit(detail); setDetail(null); }}>
                  <Pencil className="h-4 w-4 mr-1" /> {L({ pt: "Editar", en: "Edit" })}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersSection;
