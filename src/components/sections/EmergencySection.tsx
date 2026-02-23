import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChevronDown, ChevronUp, Filter,
  Plus, Pencil, Trash2, X, Loader2,
} from "lucide-react";
import {
  useActionCards, useChecklistItems, useChecklistStates, useToggleChecklistState,
  useCreateActionCard, useUpdateActionCard, useDeleteActionCard,
  useCreateChecklistItem, useDeleteChecklistItem,
} from "@/hooks/useActionCards";
import { useBusinessProcesses } from "@/hooks/useBusinessProcesses";
import { useToast } from "@/hooks/use-toast";

const severityColors: Record<string, string> = {
  critical: "border-crisis bg-crisis/10",
  high: "border-alert bg-alert/10",
  medium: "border-muted",
};

const severityLabels: Record<string, { pt: string; en: string }> = {
  critical: { pt: "Crítico", en: "Critical" },
  high: { pt: "Alto", en: "High" },
  medium: { pt: "Médio", en: "Medium" },
};

const EmergencySection: React.FC = () => {
  const { lang, searchQuery } = useApp();
  const { data: cards = [], isLoading } = useActionCards();
  const { data: allItems = [] } = useChecklistItems();
  const { data: allStates = [] } = useChecklistStates();
  const { data: businessProcesses = [] } = useBusinessProcesses();
  const toggleCheck = useToggleChecklistState();
  const createCard = useCreateActionCard();
  const updateCard = useUpdateActionCard();
  const deleteCard = useDeleteActionCard();
  const createItem = useCreateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const { toast } = useToast();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [form, setForm] = useState({ title_pt: "", title_en: "", severity: "medium", capability: "", business_process_id: "" });
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  // Filters
  const [filterTipoFuncao, setFilterTipoFuncao] = useState<string>("all");
  const [filterFuncao, setFilterFuncao] = useState<string>("all");
  const [filterMacroProcesso, setFilterMacroProcesso] = useState<string>("all");
  const [filterProcesso, setFilterProcesso] = useState<string>("all");

  // Unique values for filter dropdowns (cascading)
  const uniqueTipoFuncao = useMemo(() => [...new Set(businessProcesses.map(bp => bp.tipo_funcao).filter(Boolean))], [businessProcesses]);

  const filteredByTipo = useMemo(() => {
    if (filterTipoFuncao === "all") return businessProcesses;
    return businessProcesses.filter(bp => bp.tipo_funcao === filterTipoFuncao);
  }, [businessProcesses, filterTipoFuncao]);

  const uniqueFuncao = useMemo(() => [...new Set(filteredByTipo.map(bp => bp.funcao).filter(Boolean))], [filteredByTipo]);

  const filteredByFuncao = useMemo(() => {
    if (filterFuncao === "all") return filteredByTipo;
    return filteredByTipo.filter(bp => bp.funcao === filterFuncao);
  }, [filteredByTipo, filterFuncao]);

  const uniqueMacroProcesso = useMemo(() => [...new Set(filteredByFuncao.map(bp => bp.macro_processo).filter(Boolean))], [filteredByFuncao]);

  const filteredByMacro = useMemo(() => {
    if (filterMacroProcesso === "all") return filteredByFuncao;
    return filteredByFuncao.filter(bp => bp.macro_processo === filterMacroProcesso);
  }, [filteredByFuncao, filterMacroProcesso]);

  const uniqueProcesso = useMemo(() => [...new Set(filteredByMacro.map(bp => bp.processo).filter(Boolean))], [filteredByMacro]);

  const matchingBpIds = useMemo(() => {
    let bps = filteredByMacro;
    if (filterProcesso !== "all") {
      bps = bps.filter(bp => bp.processo === filterProcesso);
    }
    return new Set(bps.map(bp => bp.id));
  }, [filteredByMacro, filterProcesso]);

  const hasActiveFilter = filterTipoFuncao !== "all" || filterFuncao !== "all" || filterMacroProcesso !== "all" || filterProcesso !== "all";

  const filtered = useMemo(() => {
    return cards.filter(c => {
      const title = lang === "pt" ? c.title_pt : c.title_en;
      if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (hasActiveFilter) {
        if (!c.business_process_id || !matchingBpIds.has(c.business_process_id)) return false;
      }
      return true;
    });
  }, [cards, searchQuery, lang, hasActiveFilter, matchingBpIds]);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const openCreate = () => {
    setEditingCard(null);
    setForm({ title_pt: "", title_en: "", severity: "medium", capability: "", business_process_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (card: typeof cards[0]) => {
    setEditingCard(card.id);
    setForm({ title_pt: card.title_pt, title_en: card.title_en, severity: card.severity, capability: card.capability || "", business_process_id: card.business_process_id || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingCard) {
        await updateCard.mutateAsync({ id: editingCard, ...form });
        toast({ title: lang === "pt" ? "Atualizado" : "Updated" });
      } else {
        await createCard.mutateAsync(form);
        toast({ title: lang === "pt" ? "Criado" : "Created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCard.mutateAsync(id);
      toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleAddItem = async (cardId: string) => {
    const text = newItemText[cardId]?.trim();
    if (!text) return;
    const items = allItems.filter(i => i.action_card_id === cardId);
    try {
      await createItem.mutateAsync({
        action_card_id: cardId,
        text_pt: text,
        text_en: text,
        sort_order: items.length + 1,
      });
      setNewItemText(prev => ({ ...prev, [cardId]: "" }));
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const resetFilters = () => {
    setFilterTipoFuncao("all");
    setFilterFuncao("all");
    setFilterMacroProcesso("all");
    setFilterProcesso("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Action Cards de Emergência" : "Emergency Action Cards"}
        </h2>
        <Button size="sm" onClick={openCreate} className="h-8 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          {lang === "pt" ? "Novo" : "New"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {lang === "pt" ? "Filtros" : "Filters"}
              </span>
            </div>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={resetFilters}>
                {lang === "pt" ? "Limpar" : "Clear"}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Tipo de Função" : "Function Type"}</Label>
              <Select value={filterTipoFuncao} onValueChange={(v) => { setFilterTipoFuncao(v); setFilterFuncao("all"); setFilterMacroProcesso("all"); setFilterProcesso("all"); }}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {uniqueTipoFuncao.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Função" : "Function"}</Label>
              <Select value={filterFuncao} onValueChange={(v) => { setFilterFuncao(v); setFilterMacroProcesso("all"); setFilterProcesso("all"); }}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {uniqueFuncao.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Macro Processo" : "Macro Process"}</Label>
              <Select value={filterMacroProcesso} onValueChange={(v) => { setFilterMacroProcesso(v); setFilterProcesso("all"); }}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {uniqueMacroProcesso.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Processo" : "Process"}</Label>
              <Select value={filterProcesso} onValueChange={setFilterProcesso}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {uniqueProcesso.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards grid */}
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {lang === "pt" ? "Nenhum action card encontrado." : "No action cards found."}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(card => {
          const isOpen = expanded[card.id];
          const items = allItems.filter(i => i.action_card_id === card.id);
          const statesMap = Object.fromEntries(allStates.map(s => [s.checklist_item_id, s.checked]));
          const done = items.filter(i => statesMap[i.id]).length;
          const total = items.length;
          const title = lang === "pt" ? card.title_pt : card.title_en;
          const bp = card.business_process_id
            ? businessProcesses.find(p => p.id === card.business_process_id)
            : null;
          const severity = severityLabels[card.severity];

          return (
            <Card key={card.id} className={`border-l-4 ${severityColors[card.severity] || ""} flex flex-col`}>
              <CardHeader className="p-4 pb-2 cursor-pointer" onClick={() => toggle(card.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <CardTitle className="text-base leading-tight">{title}</CardTitle>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                      </Badge>
                      {bp && (
                        <>
                          {bp.tipo_funcao && <Badge variant="outline" className="text-[10px] font-normal">{bp.tipo_funcao}</Badge>}
                          {bp.funcao && <Badge variant="outline" className="text-[10px] font-normal">{bp.funcao}</Badge>}
                          {bp.macro_processo && <Badge variant="outline" className="text-[10px] font-normal bg-muted/50">{bp.macro_processo}</Badge>}
                          {bp.processo && <Badge variant="outline" className="text-[10px] font-normal bg-muted/50">{bp.processo}</Badge>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(card); }}>
                      <Pencil className="h-3.5 w-3.5 sat-keep" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}>
                      <Trash2 className="h-3.5 w-3.5 sat-keep" />
                    </Button>
                    {isOpen ? <ChevronUp className="h-4 w-4 sat-keep" /> : <ChevronDown className="h-4 w-4 sat-keep" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full">
                    <div className="h-1.5 bg-ok rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">{done}/{total}</span>
                </div>
              </CardHeader>
              {isOpen && (
                <CardContent className="p-4 pt-1 space-y-2 border-t border-border/50">
                  {items.map(item => {
                    const checked = !!statesMap[item.id];
                    const text = lang === "pt" ? item.text_pt : item.text_en;
                    return (
                      <div key={item.id} className="flex items-start gap-2 py-1 group">
                        <label className="flex items-start gap-2 cursor-pointer flex-1">
                          <Checkbox checked={checked} onCheckedChange={() => toggleCheck.mutate({ itemId: item.id, checked: !checked })} className="mt-0.5" />
                          <span className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{text}</span>
                        </label>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteItem.mutate(item.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={newItemText[card.id] || ""}
                      onChange={(e) => setNewItemText(prev => ({ ...prev, [card.id]: e.target.value }))}
                      placeholder={lang === "pt" ? "Novo item..." : "New item..."}
                      className="h-8 text-sm bg-secondary border-border"
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem(card.id)}
                    />
                    <Button size="sm" variant="secondary" className="h-8" onClick={() => handleAddItem(card.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCard
                ? (lang === "pt" ? "Editar Action Card" : "Edit Action Card")
                : (lang === "pt" ? "Novo Action Card" : "New Action Card")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Título (PT)" : "Title (PT)"}</Label>
              <Input value={form.title_pt} onChange={(e) => setForm(f => ({ ...f, title_pt: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Título (EN)" : "Title (EN)"}</Label>
              <Input value={form.title_en} onChange={(e) => setForm(f => ({ ...f, title_en: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Severidade" : "Severity"}</Label>
              <Select value={form.severity} onValueChange={(v) => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{lang === "pt" ? "Crítico" : "Critical"}</SelectItem>
                  <SelectItem value="high">{lang === "pt" ? "Alto" : "High"}</SelectItem>
                  <SelectItem value="medium">{lang === "pt" ? "Médio" : "Medium"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Processo de Negócio" : "Business Process"}</Label>
              <Select value={form.business_process_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, business_process_id: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Nenhum —" : "— None —"}</SelectItem>
                  {businessProcesses.map(bp => (
                    <SelectItem key={bp.id} value={bp.id}>
                      {[bp.tipo_funcao, bp.funcao, bp.macro_processo, bp.processo].filter(Boolean).join(" › ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={!form.title_pt || createCard.isPending || updateCard.isPending} className="w-full">
              {(createCard.isPending || updateCard.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencySection;
