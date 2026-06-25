import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Pencil, Trash2, X, Server, Database, Link2, AlertTriangle, Layers, ChevronDown, Filter } from "lucide-react";
import { useBIAProcesses, useCreateBIAProcess, useUpdateBIAProcess, useDeleteBIAProcess, DBBIAProcess } from "@/hooks/useBIAProcesses";
import { useBusinessProcesses } from "@/hooks/useBusinessProcesses";
import { useCMDBPlatforms, useDRTypes, useBIAProcessPlatforms, useLinkBIAProcessPlatform, useUnlinkBIAProcessPlatform } from "@/hooks/useCMDBPlatforms";
import { useActionCards } from "@/hooks/useActionCards";
import { useBIAActionCards, useLinkBIAActionCard, useUnlinkBIAActionCard } from "@/hooks/useBIAActionCards";
import { useDepartments } from "@/hooks/useDepartments";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";

const critColor: Record<string, string> = {
  vital: "hsl(0, 72%, 51%)",
  decisao: "hsl(35, 92%, 52%)",
  analitica: "hsl(220, 5%, 55%)",
};

const BIASection: React.FC = () => {
  const { lang } = useApp();
  const { data: biaProcesses = [], isLoading } = useBIAProcesses();
  const createMut = useCreateBIAProcess();
  const updateMut = useUpdateBIAProcess();
  const deleteMut = useDeleteBIAProcess();
  const { data: platforms = [] } = useCMDBPlatforms();
  const { data: drTypes = [] } = useDRTypes();
  const { data: businessProcesses = [] } = useBusinessProcesses();
  const { data: procPlatLinks = [] } = useBIAProcessPlatforms();
  const linkPlatform = useLinkBIAProcessPlatform();
  const unlinkPlatform = useUnlinkBIAProcessPlatform();
  const { data: actionCards = [] } = useActionCards();
  const { data: biaActionCardLinks = [] } = useBIAActionCards();
  const linkActionCard = useLinkBIAActionCard();
  const unlinkActionCard = useUnlinkBIAActionCard();
  const { data: departments = [] } = useDepartments();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBBIAProcess | null>(null);
  const [form, setForm] = useState({
    name_pt: "", name_en: "", rto: 0, rpo: 0, criticality: "analitica",
    business_process_id: null as string | null,
    dr_type_id: null as string | null,
    department_id: null as string | null,
  });
  const [linkDialog, setLinkDialog] = useState<string | null>(null);
  const [linkPlatId, setLinkPlatId] = useState("");
  const [linkActionDialog, setLinkActionDialog] = useState<string | null>(null);
  const [linkActionCardId, setLinkActionCardId] = useState("");
  const [filterBPId, setFilterBPId] = useState<string>("__all");
  const [filterPlatformIds, setFilterPlatformIds] = useState<string[]>([]);

  // List-level cascading filters
  const [listTipoFuncao, setListTipoFuncao] = useState<string>("__all__");
  const [listFuncao, setListFuncao] = useState<string>("__all__");
  const [listMacro, setListMacro] = useState<string>("__all__");
  const [listProcesso, setListProcesso] = useState<string>("__all__");

  // Cascading filters for business process selection in dialog
  const [selTipoFuncao, setSelTipoFuncao] = useState<string>("__all");
  const [selFuncao, setSelFuncao] = useState<string>("__all");
  const [selMacro, setSelMacro] = useState<string>("__all");

  const t = (pt: string, en: string) => lang === "pt" ? pt : en;

  // When DR type changes, auto-fill RTO/RPO from DR type
  const handleDRTypeChange = (drTypeId: string) => {
    const dr = drTypes.find(d => d.id === drTypeId);
    setForm(f => ({
      ...f,
      dr_type_id: drTypeId || null,
      rto: dr ? dr.rto : f.rto,
      rpo: dr ? dr.rpo : f.rpo,
    }));
  };

  // Cascading filter options
  const tipoFuncoes = [...new Set(businessProcesses.map(bp => bp.tipo_funcao))].sort();
  const funcoes = [...new Set(businessProcesses
    .filter(bp => selTipoFuncao === "__all" || bp.tipo_funcao === selTipoFuncao)
    .map(bp => bp.funcao))].sort();
  const macros = [...new Set(businessProcesses
    .filter(bp => (selTipoFuncao === "__all" || bp.tipo_funcao === selTipoFuncao) &&
                  (selFuncao === "__all" || bp.funcao === selFuncao))
    .map(bp => bp.macro_processo))].sort();
  const filteredBPs = businessProcesses.filter(bp =>
    (selTipoFuncao === "__all" || bp.tipo_funcao === selTipoFuncao) &&
    (selFuncao === "__all" || bp.funcao === selFuncao) &&
    (selMacro === "__all" || bp.macro_processo === selMacro)
  );

  const resetCascade = (bp?: { tipo_funcao: string; funcao: string; macro_processo: string }) => {
    setSelTipoFuncao(bp?.tipo_funcao || "__all");
    setSelFuncao(bp?.funcao || "__all");
    setSelMacro(bp?.macro_processo || "__all");
  };

  const chartData = biaProcesses.map(p => ({
    name: t(p.name_pt, p.name_en),
    RTO: p.rto,
    RPO: p.rpo,
    criticality: p.criticality,
  }));

  const openNew = () => {
    setEditing(null);
    setForm({ name_pt: "", name_en: "", rto: 0, rpo: 0, criticality: "medium", business_process_id: null, dr_type_id: null, department_id: null });
    resetCascade();
    setDialogOpen(true);
  };

  const openEdit = (p: DBBIAProcess) => {
    setEditing(p);
    setForm({
      name_pt: p.name_pt, name_en: p.name_en, rto: p.rto, rpo: p.rpo,
      criticality: p.criticality,
      business_process_id: p.business_process_id || null,
      dr_type_id: p.dr_type_id || null,
      department_id: (p as any).department_id || null,
    });
    const bp = p.business_process_id ? businessProcesses.find(b => b.id === p.business_process_id) : undefined;
    resetCascade(bp);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...form });
        toast.success(t("Processo atualizado", "Process updated"));
      } else {
        await createMut.mutateAsync(form);
        toast.success(t("Processo criado", "Process created"));
      }
      setDialogOpen(false);
    } catch {
      toast.error(t("Erro ao guardar", "Error saving"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success(t("Processo eliminado", "Process deleted"));
    } catch {
      toast.error(t("Erro ao eliminar", "Error deleting"));
    }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">{t("A carregar...", "Loading...")}</div>;

  // Platform impact analysis (multi-select)
  const platformImpact = filterPlatformIds.length > 0 ? (() => {
    const affectedBiaIds = procPlatLinks
      .filter(l => filterPlatformIds.includes(l.platform_id))
      .map(l => l.bia_process_id);
    const affectedBias = biaProcesses.filter(b => affectedBiaIds.includes(b.id));
    const affectedBpIds = [...new Set(affectedBias.map(b => b.business_process_id).filter(Boolean))];
    const affectedBps = businessProcesses.filter(bp => affectedBpIds.includes(bp.id));
    const affectedFuncoes = [...new Set(affectedBps.map(bp => bp.funcao))];
    const selectedPlats = platforms.filter(p => filterPlatformIds.includes(p.id));
    return { affectedBias, affectedBps, affectedFuncoes, selectedPlats };
  })() : null;

  // List-level cascading filter options
  const listTipoFuncoes = [...new Set(businessProcesses.map(bp => bp.tipo_funcao))].sort();
  const listFuncoes = [...new Set(businessProcesses
    .filter(bp => listTipoFuncao === "__all__" || bp.tipo_funcao === listTipoFuncao)
    .map(bp => bp.funcao))].sort();
  const listMacros = [...new Set(businessProcesses
    .filter(bp => (listTipoFuncao === "__all__" || bp.tipo_funcao === listTipoFuncao) &&
                  (listFuncao === "__all__" || bp.funcao === listFuncao))
    .map(bp => bp.macro_processo))].sort();
  const listProcessos = businessProcesses.filter(bp =>
    (listTipoFuncao === "__all__" || bp.tipo_funcao === listTipoFuncao) &&
    (listFuncao === "__all__" || bp.funcao === listFuncao) &&
    (listMacro === "__all__" || bp.macro_processo === listMacro)
  );

  // Filter BIAs by list-level cascading + platform filters
  const filteredByListCascade = (() => {
    let result = biaProcesses;
    // Filter by business process hierarchy
    if (listProcesso !== "__all__") {
      result = result.filter(p => p.business_process_id === listProcesso);
    } else if (listMacro !== "__all__" || listFuncao !== "__all__" || listTipoFuncao !== "__all__") {
      const validBpIds = listProcessos.map(bp => bp.id);
      result = result.filter(p => p.business_process_id && validBpIds.includes(p.business_process_id));
    }
    // Filter by platforms
    if (filterPlatformIds.length > 0) {
      const biaIdsWithPlatform = procPlatLinks
        .filter(l => filterPlatformIds.includes(l.platform_id))
        .map(l => l.bia_process_id);
      result = result.filter(p => biaIdsWithPlatform.includes(p.id));
    }
    return result;
  })();

  // Filter and group BIAs by business process
  const filtered = filterBPId === "__all"
    ? filteredByListCascade
    : filteredByListCascade.filter(p => p.business_process_id === filterBPId);

  const grouped = new Map<string | null, DBBIAProcess[]>();
  filtered.forEach(p => {
    const key = p.business_process_id || null;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {t("Análise de Impacto (BIA)", "Business Impact Analysis (BIA)")}
        </h2>
        <Button size="sm" variant="outline" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> {t("Nova BIA", "New BIA")}
        </Button>
      </div>

      {/* Filters bar */}
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("Filtros", "Filters")}</span>
            {(listTipoFuncao !== "__all__" || listFuncao !== "__all__" || listMacro !== "__all__" || listProcesso !== "__all__" || filterPlatformIds.length > 0) && (
              <Button variant="ghost" size="sm" className="h-5 text-[10px] ml-auto" onClick={() => {
                setListTipoFuncao("__all__"); setListFuncao("__all__"); setListMacro("__all__"); setListProcesso("__all__"); setFilterPlatformIds([]);
              }}>
                <X className="h-3 w-3 mr-0.5" />{t("Limpar filtros", "Clear filters")}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">{t("Tipo Função", "Function Type")}</Label>
              <Select value={listTipoFuncao} onValueChange={v => { setListTipoFuncao(v); setListFuncao("__all__"); setListMacro("__all__"); setListProcesso("__all__"); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__all__">{t("Todos", "All")}</SelectItem>
                  {listTipoFuncoes.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t("Função", "Function")}</Label>
              <Select value={listFuncao} onValueChange={v => { setListFuncao(v); setListMacro("__all__"); setListProcesso("__all__"); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__all__">{t("Todas", "All")}</SelectItem>
                  {listFuncoes.map(fn => <SelectItem key={fn} value={fn}>{fn}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t("Macro Processo", "Macro Process")}</Label>
              <Select value={listMacro} onValueChange={v => { setListMacro(v); setListProcesso("__all__"); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__all__">{t("Todos", "All")}</SelectItem>
                  {listMacros.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t("Processo", "Process")}</Label>
              <Select value={listProcesso} onValueChange={setListProcesso}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__all__">{t("Todos", "All")}</SelectItem>
                  {listProcessos.map(bp => <SelectItem key={bp.id} value={bp.id}>{bp.processo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t("Plataformas", "Platforms")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-8 w-full text-xs justify-between font-normal">
                    <span className="truncate">
                      {filterPlatformIds.length === 0
                        ? t("Todas", "All")
                        : `${filterPlatformIds.length} ${t("selecionadas", "selected")}`}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-1 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-popover z-50" align="start">
                  <ScrollArea className="max-h-52">
                    <div className="space-y-1">
                      {platforms.map(p => {
                        const dr = drTypes.find(d => d.id === p.dr_type_id);
                        const checked = filterPlatformIds.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) => {
                                setFilterPlatformIds(prev =>
                                  c ? [...prev, p.id] : prev.filter(id => id !== p.id)
                                );
                              }}
                            />
                            <span className="truncate">{p.name} {dr ? `(${dr.code})` : ""}</span>
                          </label>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  {filterPlatformIds.length > 0 && (
                    <Button variant="ghost" size="sm" className="w-full mt-1 h-7 text-[10px]" onClick={() => setFilterPlatformIds([])}>
                      {t("Limpar seleção", "Clear selection")}
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Impact Panel */}
      {platformImpact && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
              <Server className="h-4 w-4 text-primary" />
              {t("Impacto das Plataformas", "Platform Impact")}:
              {platformImpact.selectedPlats.map(p => (
                <Badge key={p.id} variant="secondary" className="text-[10px]">{p.name}</Badge>
              ))}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {platformImpact.affectedBias.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">{t("Nenhuma BIA associada a esta plataforma.", "No BIA linked to this platform.")}</p>
            ) : (
              <div className="space-y-3">
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-background p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{platformImpact.affectedBias.length}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("BIAs Afetadas", "Affected BIAs")}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{platformImpact.affectedBps.length}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("Processos", "Processes")}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{platformImpact.affectedFuncoes.length}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("Funções", "Functions")}</div>
                  </div>
                </div>

                {/* Affected functions & processes */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3 w-3" />
                    {t("Funções e Processos Afetados", "Affected Functions & Processes")}
                  </div>
                  {platformImpact.affectedFuncoes.map(funcao => {
                    const bpsInFunc = platformImpact.affectedBps.filter(bp => bp.funcao === funcao);
                    return (
                      <div key={funcao} className="rounded-md border border-border bg-background p-2.5">
                        <div className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          {funcao}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {bpsInFunc.map(bp => (
                            <Badge key={bp.id} variant="secondary" className="text-[10px] py-0.5">
                              {bp.macro_processo} › {bp.processo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Affected BIAs detail */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" />
                    {t("BIAs Afetadas", "Affected BIAs")}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {platformImpact.affectedBias.map(bia => {
                      const dr = bia.dr_type_id ? drTypes.find(d => d.id === bia.dr_type_id) : null;
                      const bp = bia.business_process_id ? businessProcesses.find(b => b.id === bia.business_process_id) : null;
                      return (
                        <div key={bia.id} className="rounded-md border border-border bg-background p-2.5 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: critColor[bia.criticality] }} />
                            <span className="text-xs font-semibold truncate">{t(bia.name_pt, bia.name_en)}</span>
                            {dr && <Badge variant="outline" className="text-[9px] h-4 px-1 ml-auto shrink-0">{dr.code}</Badge>}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span>RTO: {bia.rto}h</span>
                            <span>RPO: {bia.rpo}h</span>
                            {bp && <span className="truncate">· {bp.funcao} › {bp.processo}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {biaProcesses.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm">{t("RTO vs RPO (horas)", "RTO vs RPO (hours)")}</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }} />
                <Bar dataKey="RTO" fill="hsl(0, 72%, 51%)" radius={[0, 2, 2, 0]} />
                <Bar dataKey="RPO" fill="hsl(45, 90%, 55%)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* BIAs grouped by Business Process */}
      {Array.from(grouped.entries()).map(([bpId, bias]) => {
        const bp = bpId ? businessProcesses.find(b => b.id === bpId) : null;
        return (
          <Card key={bpId || "__none"}>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                {bp ? `${bp.funcao} › ${bp.processo}` : t("Processo não definido", "Process not set")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              {bias.map(p => {
                const dr = p.dr_type_id ? drTypes.find(d => d.id === p.dr_type_id) : null;
                const dept = (p as any).department_id ? departments.find(d => d.id === (p as any).department_id) : null;
                const pLinks = procPlatLinks.filter(l => l.bia_process_id === p.id);
                const linkedPlats = pLinks.map(l => ({
                  link: l,
                  platform: platforms.find(pl => pl.id === l.platform_id),
                })).filter(x => x.platform);

                return (
                  <div key={p.id} className="rounded-md border border-border/50 bg-secondary/20 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: critColor[p.criticality] }} />
                          <span className="text-sm font-semibold">{t(p.name_pt, p.name_en)}</span>
                          {dr && (
                            <Badge variant="outline" className="text-[10px] h-5">{dr.code}</Badge>
                          )}
                          {dept && (
                            <Badge variant="secondary" className="text-[10px] h-5">{dept.name}</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            RTO: {p.rto}h · RPO: {p.rpo}h
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Platform dependencies */}
                    <div className="flex flex-wrap gap-1 items-center">
                      <Server className="h-3 w-3 text-muted-foreground" />
                      {linkedPlats.map(({ link, platform }) => {
                        const platDr = drTypes.find(d => d.id === platform!.dr_type_id);
                        return (
                          <Badge key={link.id} variant="outline" className="text-[10px] gap-1 pr-1">
                            {platform!.name} {platDr ? `(${platDr.code})` : ""}
                            <button onClick={() => unlinkPlatform.mutate(link.id)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                          </Badge>
                        );
                      })}
                      <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => { setLinkDialog(p.id); setLinkPlatId(""); }}>
                        <Plus className="h-2.5 w-2.5 mr-0.5" />{t("Plataforma", "Platform")}
                      </Button>
                    </div>

                    {/* Action Cards linked to this BIA */}
                    {(() => {
                      const linkedACs = biaActionCardLinks
                        .filter(l => l.bia_process_id === p.id)
                        .map(l => ({ link: l, card: actionCards.find(ac => ac.id === l.action_card_id) }))
                        .filter(x => x.card);
                      return (
                        <div className="flex flex-wrap gap-1 items-center">
                          <ListChecks className="h-3 w-3 text-muted-foreground" />
                          {linkedACs.map(({ link, card }) => (
                            <Badge key={link.id} variant="outline" className="text-[10px] gap-1 pr-1 bg-accent/30">
                              {t(card!.title_pt, card!.title_en)}
                              <button onClick={() => unlinkActionCard.mutate(link.id)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => { setLinkActionDialog(p.id); setLinkActionCardId(""); }}>
                            <Plus className="h-2.5 w-2.5 mr-0.5" />{t("Action Card", "Action Card")}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {biaProcesses.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">{t("Sem processos BIA.", "No BIA processes.")}</p>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("Editar BIA", "Edit BIA") : t("Nova BIA", "New BIA")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Business Process - Cascading filters */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Processo de Negócio", "Business Process")}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">{t("Tipo Função", "Function Type")}</Label>
                  <Select value={selTipoFuncao} onValueChange={v => { setSelTipoFuncao(v); setSelFuncao("__all"); setSelMacro("__all"); setForm(f => ({ ...f, business_process_id: null })); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="__all">{t("Todos", "All")}</SelectItem>
                      {tipoFuncoes.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">{t("Função", "Function")}</Label>
                  <Select value={selFuncao} onValueChange={v => { setSelFuncao(v); setSelMacro("__all"); setForm(f => ({ ...f, business_process_id: null })); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="__all">{t("Todas", "All")}</SelectItem>
                      {funcoes.map(fn => <SelectItem key={fn} value={fn}>{fn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">{t("Macro Processo", "Macro Process")}</Label>
                  <Select value={selMacro} onValueChange={v => { setSelMacro(v); setForm(f => ({ ...f, business_process_id: null })); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="__all">{t("Todos", "All")}</SelectItem>
                      {macros.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Select
                value={form.business_process_id || "__none"}
                onValueChange={v => setForm(f => ({ ...f, business_process_id: v === "__none" ? null : v }))}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("Selecionar processo...", "Select process...")} /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__none">{t("— Nenhum —", "— None —")}</SelectItem>
                  {filteredBPs.map(bp => (
                    <SelectItem key={bp.id} value={bp.id}>
                      {bp.processo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Nome (PT)</Label><Input value={form.name_pt} onChange={e => setForm(f => ({ ...f, name_pt: e.target.value }))} /></div>
              <div><Label className="text-xs">Name (EN)</Label><Input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></div>
            </div>

            {/* DR Type */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Tipo de DR", "DR Type")}
              </Label>
              <Select
                value={form.dr_type_id || "__none"}
                onValueChange={v => v === "__none" ? setForm(f => ({ ...f, dr_type_id: null })) : handleDRTypeChange(v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">{t("— Nenhum —", "— None —")}</SelectItem>
                  {drTypes.map(dr => (
                    <SelectItem key={dr.id} value={dr.id}>
                      {dr.code} — {dr.label} (RTO: {dr.rto}h / RPO: {dr.rpo}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Departamento */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Departamento", "Department")}
              </Label>
              <Select
                value={form.department_id || "__none"}
                onValueChange={v => setForm(f => ({ ...f, department_id: v === "__none" ? null : v }))}
              >
                <SelectTrigger><SelectValue placeholder={t("Selecionar departamento...", "Select department...")} /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__none">{t("— Nenhum —", "— None —")}</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RTO / RPO */}
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">RTO ({t("horas", "hours")})</Label><Input type="number" step="0.5" min="0" value={form.rto} onChange={e => setForm(f => ({ ...f, rto: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label className="text-xs">RPO ({t("horas", "hours")})</Label><Input type="number" step="0.5" min="0" value={form.rpo} onChange={e => setForm(f => ({ ...f, rpo: parseFloat(e.target.value) || 0 }))} /></div>
            </div>

            {/* Criticality */}
            <div>
              <Label className="text-xs">{t("Criticidade", "Criticality")}</Label>
              <Select value={form.criticality} onValueChange={v => setForm(f => ({ ...f, criticality: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{t("Crítico", "Critical")}</SelectItem>
                  <SelectItem value="high">{t("Alto", "High")}</SelectItem>
                  <SelectItem value="medium">{t("Médio", "Medium")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("Cancelar", "Cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.name_pt}>{t("Guardar", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link platform dialog */}
      <Dialog open={!!linkDialog} onOpenChange={(o) => !o && setLinkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              {t("Associar Plataforma", "Link Platform")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={linkPlatId} onValueChange={setLinkPlatId}>
              <SelectTrigger><SelectValue placeholder={t("Selecionar plataforma...", "Select platform...")} /></SelectTrigger>
              <SelectContent>
                {platforms.map(p => {
                  const dr = drTypes.find(d => d.id === p.dr_type_id);
                  return <SelectItem key={p.id} value={p.id}>{p.name} {dr ? `(${dr.code})` : ""}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Button onClick={async () => {
              if (!linkDialog || !linkPlatId) return;
              try {
                await linkPlatform.mutateAsync({ bia_process_id: linkDialog, platform_id: linkPlatId });
                setLinkPlatId("");
                toast.success(t("Plataforma associada", "Platform linked"));
              } catch { toast.error(t("Erro ao associar", "Error linking")); }
            }} disabled={!linkPlatId || linkPlatform.isPending} className="w-full">
              {t("Associar", "Link")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Action Card dialog */}
      <Dialog open={!!linkActionDialog} onOpenChange={(o) => !o && setLinkActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              {t("Associar Action Card", "Link Action Card")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(() => {
              const alreadyLinkedIds = new Set(
                biaActionCardLinks
                  .filter(l => l.bia_process_id === linkActionDialog)
                  .map(l => l.action_card_id)
              );
              const available = actionCards.filter(ac => !alreadyLinkedIds.has(ac.id));
              return (
                <>
                  <Select value={linkActionCardId} onValueChange={setLinkActionCardId}>
                    <SelectTrigger><SelectValue placeholder={t("Selecionar action card...", "Select action card...")} /></SelectTrigger>
                    <SelectContent>
                      {available.length === 0 && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">{t("Sem action cards disponíveis", "No action cards available")}</div>
                      )}
                      {available.map(ac => (
                        <SelectItem key={ac.id} value={ac.id}>{t(ac.title_pt, ac.title_en)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={async () => {
                    if (!linkActionDialog || !linkActionCardId) return;
                    try {
                      await linkActionCard.mutateAsync({ bia_process_id: linkActionDialog, action_card_id: linkActionCardId });
                      setLinkActionCardId("");
                      toast.success(t("Action Card associado", "Action Card linked"));
                    } catch { toast.error(t("Erro ao associar", "Error linking")); }
                  }} disabled={!linkActionCardId || linkActionCard.isPending} className="w-full">
                    {t("Associar", "Link")}
                  </Button>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BIASection;
