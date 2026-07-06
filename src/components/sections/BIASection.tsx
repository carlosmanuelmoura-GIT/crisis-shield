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

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Pencil, Trash2, X, Server, Database, Link2, AlertTriangle, Layers, ChevronDown, Filter, Building2 } from "lucide-react";
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
    description: "",
  });
  const [linkDialog, setLinkDialog] = useState<string | null>(null);
  const [linkPlatId, setLinkPlatId] = useState("");
  const [linkActionDialog, setLinkActionDialog] = useState<string | null>(null);
  const [linkActionCardId, setLinkActionCardId] = useState("");
  const [filterBPId, setFilterBPId] = useState<string>("__all");
  const [filterActionCardId, setFilterActionCardId] = useState<string | null>(null);
  const [actionCardSearch, setActionCardSearch] = useState<string>("");
  const [actionCardPopoverOpen, setActionCardPopoverOpen] = useState(false);
  const [selectedTipoBIA, setSelectedTipoBIA] = useState<string | null>(null);

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


  const openNew = () => {
    setEditing(null);
    setForm({ name_pt: "", name_en: "", rto: 0, rpo: 0, criticality: "analitica", business_process_id: null, dr_type_id: null, department_id: null, description: "" });
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
      description: p.description ?? "",
    });
    const bp = p.business_process_id ? businessProcesses.find(b => b.id === p.business_process_id) : undefined;
    resetCascade(bp);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, description: form.description.trim() || null };
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...payload });
        toast.success(t("Processo atualizado", "Process updated"));
      } else {
        await createMut.mutateAsync(payload);
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

  // (Platform impact panel removed — filter replaced by Action Card)


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

  // Filter BIAs by list-level cascading + action card filter
  const filteredByListCascade = (() => {
    let result = biaProcesses;
    // Filter by business process hierarchy
    if (listProcesso !== "__all__") {
      result = result.filter(p => p.business_process_id === listProcesso);
    } else if (listMacro !== "__all__" || listFuncao !== "__all__" || listTipoFuncao !== "__all__") {
      const validBpIds = listProcessos.map(bp => bp.id);
      result = result.filter(p => p.business_process_id && validBpIds.includes(p.business_process_id));
    }
    // Filter by Action Card
    if (filterActionCardId) {
      const biaIdsWithAC = biaActionCardLinks
        .filter(l => l.action_card_id === filterActionCardId)
        .map(l => l.bia_process_id);
      result = result.filter(p => biaIdsWithAC.includes(p.id));
    }
    return result;
  })();

  // Filter by business process selection
  const filteredByBP = filterBPId === "__all"
    ? filteredByListCascade
    : filteredByListCascade.filter(p => p.business_process_id === filterBPId);

  // Filter by selected pie slice (Tipo de BIA)
  const filtered = selectedTipoBIA
    ? filteredByBP.filter(p => p.criticality === selectedTipoBIA)
    : filteredByBP;

  // Pie chart data — count by Tipo de BIA (uses filteredByBP so slice highlighting reflects current filters)
  const tipoLabel: Record<string, string> = { vital: "VITAL", decisao: "DECISÃO", analitica: "ANALÍTICA" };
  const pieData = ["vital", "decisao", "analitica"].map(k => ({
    key: k,
    name: tipoLabel[k],
    value: filteredByBP.filter(p => p.criticality === k).length,
    color: critColor[k],
  })).filter(d => d.value > 0);

  // Group BIAs by department
  const groupedByDept = new Map<string | null, DBBIAProcess[]>();
  filtered.forEach(p => {
    const key = (p as any).department_id || null;
    if (!groupedByDept.has(key)) groupedByDept.set(key, []);
    groupedByDept.get(key)!.push(p);
  });
  const sortedDeptGroups = Array.from(groupedByDept.entries()).sort((a, b) => {
    const an = a[0] ? (departments.find(d => d.id === a[0])?.name || "") : "\uffff";
    const bn = b[0] ? (departments.find(d => d.id === b[0])?.name || "") : "\uffff";
    return an.localeCompare(bn);
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
            {(listTipoFuncao !== "__all__" || listFuncao !== "__all__" || listMacro !== "__all__" || listProcesso !== "__all__" || filterActionCardId) && (
              <Button variant="ghost" size="sm" className="h-5 text-[10px] ml-auto" onClick={() => {
                setListTipoFuncao("__all__"); setListFuncao("__all__"); setListMacro("__all__"); setListProcesso("__all__"); setFilterActionCardId(null); setActionCardSearch("");
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
              <Label className="text-[10px] text-muted-foreground">{t("Action Card", "Action Card")}</Label>
              <Popover open={actionCardPopoverOpen} onOpenChange={setActionCardPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      className="h-8 text-xs pr-7"
                      placeholder={t("Escreva nome...", "Type name...")}
                      value={
                        filterActionCardId
                          ? (() => {
                              const ac = actionCards.find(a => a.id === filterActionCardId);
                              return ac ? (lang === "pt" ? ac.title_pt : ac.title_en) : actionCardSearch;
                            })()
                          : actionCardSearch
                      }
                      onChange={e => {
                        setActionCardSearch(e.target.value);
                        setFilterActionCardId(null);
                        setActionCardPopoverOpen(true);
                      }}
                      onFocus={() => setActionCardPopoverOpen(true)}
                    />
                    {(filterActionCardId || actionCardSearch) && (
                      <button
                        type="button"
                        onClick={() => { setFilterActionCardId(null); setActionCardSearch(""); }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-1 bg-popover z-50" align="start" onOpenAutoFocus={e => e.preventDefault()}>
                  <ScrollArea className="max-h-52">
                    <div className="space-y-0.5">
                      {actionCards
                        .filter(ac => {
                          if (!actionCardSearch.trim()) return true;
                          const q = actionCardSearch.toLowerCase();
                          return ac.title_pt.toLowerCase().includes(q) || ac.title_en.toLowerCase().includes(q);
                        })
                        .slice(0, 50)
                        .map(ac => (
                          <button
                            key={ac.id}
                            type="button"
                            onClick={() => {
                              setFilterActionCardId(ac.id);
                              setActionCardSearch("");
                              setActionCardPopoverOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-xs truncate"
                          >
                            {lang === "pt" ? ac.title_pt : ac.title_en}
                          </button>
                        ))}
                      {actionCards.filter(ac => {
                        if (!actionCardSearch.trim()) return true;
                        const q = actionCardSearch.toLowerCase();
                        return ac.title_pt.toLowerCase().includes(q) || ac.title_en.toLowerCase().includes(q);
                      }).length === 0 && (
                        <div className="px-2 py-3 text-[10px] text-muted-foreground text-center">{t("Sem resultados", "No results")}</div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Pie chart — Tipo de BIA, clickable slices */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{t("BIAs por Tipo", "BIAs by Type")}</span>
              {selectedTipoBIA && (
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setSelectedTipoBIA(null)}>
                  <X className="h-3 w-3 mr-0.5" />{t("Limpar seleção", "Clear selection")}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(d: any) => `${d.name}: ${d.value}`}
                  onClick={(d: any) => {
                    const k = d?.key ?? d?.payload?.key;
                    if (!k) return;
                    setSelectedTipoBIA(prev => prev === k ? null : k);
                  }}
                  className="cursor-pointer outline-none"
                  isAnimationActive={false}
                >
                  {pieData.map(entry => (
                    <Cell
                      key={entry.key}
                      fill={entry.color}
                      stroke={selectedTipoBIA === entry.key ? "hsl(var(--foreground))" : "hsl(var(--background))"}
                      strokeWidth={selectedTipoBIA === entry.key ? 3 : 1}
                      opacity={selectedTipoBIA && selectedTipoBIA !== entry.key ? 0.35 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* BIAs grouped by Department (accordion) → Kanban by DR Type */}
      {sortedDeptGroups.length > 0 && (
        <Accordion type="multiple" className="space-y-2">
          {sortedDeptGroups.map(([deptId, bias]) => {
            const dept = deptId ? departments.find(d => d.id === deptId) : null;
            const deptName = dept ? dept.name : t("Sem departamento", "No department");
            // Build kanban columns by DR Type
            const drColumns: { id: string | null; label: string; bias: DBBIAProcess[] }[] = drTypes.map(dr => ({
              id: dr.id,
              label: `${dr.code} — ${dr.label}`,
              bias: bias.filter(b => b.dr_type_id === dr.id),
            }));
            const sinDr = bias.filter(b => !b.dr_type_id);
            if (sinDr.length > 0) {
              drColumns.push({ id: null, label: t("Sem DR", "No DR"), bias: sinDr });
            }
            const nonEmptyCols = drColumns.filter(c => c.bias.length > 0);

            return (
              <AccordionItem key={deptId || "__none"} value={deptId || "__none"} className="border rounded-md bg-card">
                <AccordionTrigger className="px-3 py-2 hover:no-underline">
                  <div className="flex items-center gap-2 flex-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{deptName}</span>
                    <Badge variant="secondary" className="text-[10px] h-5">{bias.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {nonEmptyCols.map(col => (
                      <div key={col.id || "__none_dr"} className="min-w-[260px] w-[260px] shrink-0 rounded-md border border-border/50 bg-secondary/20 p-2">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">{col.label}</span>
                          <Badge variant="outline" className="text-[10px] h-4">{col.bias.length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {col.bias.map(p => {
                            const pLinks = procPlatLinks.filter(l => l.bia_process_id === p.id);
                            const linkedPlats = pLinks.map(l => ({
                              link: l,
                              platform: platforms.find(pl => pl.id === l.platform_id),
                            })).filter(x => x.platform);
                            const bp = p.business_process_id ? businessProcesses.find(b => b.id === p.business_process_id) : null;
                            const linkedACs = biaActionCardLinks
                              .filter(l => l.bia_process_id === p.id)
                              .map(l => ({ link: l, card: actionCards.find(ac => ac.id === l.action_card_id) }))
                              .filter(x => x.card);
                            return (
                              <div key={p.id} className="rounded-md border border-border/60 bg-background p-2 space-y-1.5 shadow-sm">
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                    <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: critColor[p.criticality] }} />
                                    <span className="text-xs font-semibold leading-tight">
                                      {p.description?.trim() || `BIA-${p.id.slice(0, 8).toUpperCase()} · ${bp?.processo || t(p.name_pt, p.name_en)}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(p)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDelete(p.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                {bp && (
                                  <div className="text-[10px] text-muted-foreground truncate">{bp.processo}</div>
                                )}
                                <div className="text-[10px] text-muted-foreground">RTO: {p.rto}h · RPO: {p.rpo}h</div>
                                <div className="flex flex-wrap gap-1 items-center">
                                  <Server className="h-3 w-3 text-muted-foreground" />
                                  {linkedPlats.map(({ link, platform }) => {
                                    const platDr = drTypes.find(d => d.id === platform!.dr_type_id);
                                    return (
                                      <Badge key={link.id} variant="outline" className="text-[9px] gap-0.5 pr-1 h-4">
                                        {platform!.name}{platDr ? ` (${platDr.code})` : ""}
                                        <button onClick={() => unlinkPlatform.mutate(link.id)} className="ml-0.5 hover:text-destructive"><X className="h-2 w-2" /></button>
                                      </Badge>
                                    );
                                  })}
                                  <Button variant="outline" size="sm" className="h-4 text-[9px] px-1" onClick={() => { setLinkDialog(p.id); setLinkPlatId(""); }}>
                                    <Plus className="h-2 w-2 mr-0.5" />{t("Plat.", "Plat.")}
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-1 items-center">
                                  <ListChecks className="h-3 w-3 text-muted-foreground" />
                                  {linkedACs.map(({ link, card }) => (
                                    <Badge key={link.id} variant="outline" className="text-[9px] gap-0.5 pr-1 h-4 bg-accent/30">
                                      {t(card!.title_pt, card!.title_en)}
                                      <button onClick={() => unlinkActionCard.mutate(link.id)} className="ml-0.5 hover:text-destructive"><X className="h-2 w-2" /></button>
                                    </Badge>
                                  ))}
                                  <Button variant="outline" size="sm" className="h-4 text-[9px] px-1" onClick={() => { setLinkActionDialog(p.id); setLinkActionCardId(""); }}>
                                    <Plus className="h-2 w-2 mr-0.5" />AC
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {nonEmptyCols.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">{t("Sem BIAs", "No BIAs")}</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}


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

            {/* Descrição (título do cartão) */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Descrição (título do cartão)", "Description (card title)")}
              </Label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={
                  editing
                    ? `BIA-${editing.id.slice(0, 8).toUpperCase()} · ${
                        (form.business_process_id
                          ? businessProcesses.find(b => b.id === form.business_process_id)?.processo
                          : "") || form.name_pt || t("processo", "process")
                      }`
                    : t("Deixar vazio para usar o valor por defeito", "Leave empty to use default")
                }
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {t("Se vazio, mostra: BIA-<id> · <processo>", "If empty, shows: BIA-<id> · <process>")}
              </p>
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

            {/* Tipo de BIA */}
            <div>
              <Label className="text-xs">{t("Tipo de BIA", "BIA Type")}</Label>
              <Select value={form.criticality} onValueChange={v => setForm(f => ({ ...f, criticality: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vital">VITAL</SelectItem>
                  <SelectItem value="decisao">DECISÃO</SelectItem>
                  <SelectItem value="analitica">ANALÍTICA</SelectItem>
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
