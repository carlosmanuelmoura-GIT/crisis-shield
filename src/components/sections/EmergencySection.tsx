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
  ChevronDown, ChevronUp, Filter, AlertTriangle,
  Plus, Pencil, Trash2, Copy, X, Loader2,
  Monitor, Home, UserCheck, Network, Zap, Package,
} from "lucide-react";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Monitor, Home, UserCheck, Network, Zap,
};
import {
  useActionCards, useChecklistItems, useChecklistStates, useToggleChecklistState,
  useCreateActionCard, useUpdateActionCard, useDeleteActionCard,
  useCreateChecklistItem, useDeleteChecklistItem,
} from "@/hooks/useActionCards";
import { useBusinessProcesses } from "@/hooks/useBusinessProcesses";
import { useRecursos } from "@/hooks/useRecursos";
import { useToast } from "@/hooks/use-toast";
import { useCreateDecisionLog } from "@/hooks/useDecisionLog";
import { useCurrentUserProfile } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  const { lang, searchQuery, crisisActive, crisisRecursoIds, crisisStartTime } = useApp();
  const { data: cards = [], isLoading } = useActionCards();
  const { data: allItems = [] } = useChecklistItems();
  const { data: allStates = [] } = useChecklistStates();
  const { data: businessProcesses = [] } = useBusinessProcesses();
  const { data: recursos = [] } = useRecursos();
  const toggleCheck = useToggleChecklistState();
  const createCard = useCreateActionCard();
  const updateCard = useUpdateActionCard();
  const deleteCard = useDeleteActionCard();
  const createItem = useCreateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createLog = useCreateDecisionLog();
  const { data: profile } = useCurrentUserProfile();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [form, setForm] = useState({ title_pt: "", title_en: "", severity: "medium", capability: "", funcao: "", macro_processo: "", recurso_id: "" });
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  // Filters
  const [filterRecurso, setFilterRecurso] = useState<string>("all");
  const [filterTipoFuncao, setFilterTipoFuncao] = useState<string>("all");
  const [filterFuncao, setFilterFuncao] = useState<string>("all");
  const [filterMacroProcesso, setFilterMacroProcesso] = useState<string>("all");
  const [filterProcesso, setFilterProcesso] = useState<string>("all");

  // Cascading BP filters
  const uniqueTipoFuncao = useMemo(() => [...new Set(businessProcesses.map(bp => bp.tipo_funcao).filter(Boolean))], [businessProcesses]);
  const filteredByTipo = useMemo(() => filterTipoFuncao === "all" ? businessProcesses : businessProcesses.filter(bp => bp.tipo_funcao === filterTipoFuncao), [businessProcesses, filterTipoFuncao]);
  const uniqueFuncao = useMemo(() => [...new Set(filteredByTipo.map(bp => bp.funcao).filter(Boolean))], [filteredByTipo]);
  const filteredByFuncao = useMemo(() => filterFuncao === "all" ? filteredByTipo : filteredByTipo.filter(bp => bp.funcao === filterFuncao), [filteredByTipo, filterFuncao]);
  const uniqueMacroProcesso = useMemo(() => [...new Set(filteredByFuncao.map(bp => bp.macro_processo).filter(Boolean))], [filteredByFuncao]);
  const filteredByMacro = useMemo(() => filterMacroProcesso === "all" ? filteredByFuncao : filteredByFuncao.filter(bp => bp.macro_processo === filterMacroProcesso), [filteredByFuncao, filterMacroProcesso]);
  const uniqueProcesso = useMemo(() => [...new Set(filteredByMacro.map(bp => bp.processo).filter(Boolean))], [filteredByMacro]);

  const hasBpFilter = filterTipoFuncao !== "all" || filterFuncao !== "all" || filterMacroProcesso !== "all" || filterProcesso !== "all";

  // Derive the set of funcao/macro_processo values that match current BP filters
  const matchingBpValues = useMemo(() => {
    let bps = filteredByMacro;
    if (filterProcesso !== "all") bps = bps.filter(bp => bp.processo === filterProcesso);
    return {
      funcaoSet: new Set(bps.map(bp => bp.funcao)),
      macroSet: new Set(bps.map(bp => bp.macro_processo)),
    };
  }, [filteredByMacro, filterProcesso]);

  // During crisis, do NOT force filter — allow user to see all cards
  const effectiveFilterRecurso = filterRecurso;
  const hasActiveFilter = effectiveFilterRecurso !== "all" || hasBpFilter;

  const filtered = useMemo(() => {
    return cards.filter(c => {
      const title = lang === "pt" ? c.title_pt : c.title_en;
      if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (effectiveFilterRecurso !== "all" && c.recurso_id !== effectiveFilterRecurso) {
        return false;
      }
      if (hasBpFilter) {
        const funcaoMatch = !c.funcao || matchingBpValues.funcaoSet.has(c.funcao);
        const macroMatch = !c.macro_processo || matchingBpValues.macroSet.has(c.macro_processo);
        if (!funcaoMatch || !macroMatch) return false;
      }
      return true;
    });
  }, [cards, searchQuery, lang, effectiveFilterRecurso, hasBpFilter, matchingBpValues]);

  // Group cards by recurso que se perde
  const groupedCards = useMemo(() => {
    const groups: { recurso: typeof recursos[0] | null; cards: typeof filtered }[] = [];
    const recursoMap = new Map(recursos.map(r => [r.id, r]));

    // Group by recurso_id
    const byRecurso = new Map<string, typeof filtered>();
    const unassigned: typeof filtered = [];

    filtered.forEach(card => {
      if (card.recurso_id) {
        const existing = byRecurso.get(card.recurso_id) || [];
        existing.push(card);
        byRecurso.set(card.recurso_id, existing);
      } else {
        unassigned.push(card);
      }
    });

    // Sort recursos by name
    const sortedRecursoIds = [...byRecurso.keys()].sort((a, b) => {
      const ra = recursoMap.get(a);
      const rb = recursoMap.get(b);
      return (ra?.name_pt || "").localeCompare(rb?.name_pt || "");
    });

    sortedRecursoIds.forEach(id => {
      groups.push({ recurso: recursoMap.get(id) || null, cards: byRecurso.get(id)! });
    });

    if (unassigned.length > 0) {
      groups.push({ recurso: null, cards: unassigned });
    }

    return groups;
  }, [filtered, recursos]);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleGroup = (id: string) => setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const openCreate = (recursoId?: string) => {
    setEditingCard(null);
    setForm({ title_pt: "", title_en: "", severity: "medium", capability: "", funcao: "", macro_processo: "", recurso_id: recursoId || "" });
    setDialogOpen(true);
  };

  const openEdit = (card: typeof cards[0]) => {
    setEditingCard(card.id);
    setForm({
      title_pt: card.title_pt, title_en: card.title_en, severity: card.severity,
      capability: card.capability || "", funcao: card.funcao || "",
      macro_processo: card.macro_processo || "", recurso_id: card.recurso_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        funcao: form.funcao || undefined,
        macro_processo: form.macro_processo || undefined,
        recurso_id: form.recurso_id || undefined,
        capability: form.capability || undefined,
      };
      if (editingCard) {
        await updateCard.mutateAsync({ id: editingCard, ...payload });
        toast({ title: lang === "pt" ? "Atualizado" : "Updated" });
      } else {
        await createCard.mutateAsync(payload);
        toast({ title: lang === "pt" ? "Criado" : "Created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCard.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleDuplicate = async (card: typeof cards[0]) => {
    try {
      const { data: newCard, error } = await supabase.from("action_cards").insert({
        title_pt: `${card.title_pt} (cópia)`,
        title_en: card.title_en ? `${card.title_en} (copy)` : "",
        severity: card.severity,
        capability: card.capability,
        funcao: card.funcao,
        macro_processo: card.macro_processo,
        recurso_id: card.recurso_id,
        owner_id: card.owner_id,
      }).select("id").single();
      if (error) throw error;

      // Copy checklist items
      const items = allItems.filter(i => i.action_card_id === card.id);
      if (items.length > 0 && newCard) {
        const { error: itemsErr } = await supabase.from("checklist_items").insert(
          items.map(i => ({ action_card_id: newCard.id, text_pt: i.text_pt, text_en: i.text_en, sort_order: i.sort_order }))
        );
        if (itemsErr) throw itemsErr;
      }

      queryClient.invalidateQueries({ queryKey: ["action_cards"] });
      queryClient.invalidateQueries({ queryKey: ["checklist_items"] });
      toast({ title: lang === "pt" ? "Action Card duplicado" : "Action Card duplicated" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleAddItem = async (cardId: string) => {
    const text = newItemText[cardId]?.trim();
    if (!text) return;
    const items = allItems.filter(i => i.action_card_id === cardId);
    const card = cards.find(c => c.id === cardId);
    try {
      await createItem.mutateAsync({ action_card_id: cardId, text_pt: text, text_en: text, sort_order: items.length + 1 });
      setNewItemText(prev => ({ ...prev, [cardId]: "" }));
      if (crisisActive) {
        const author = profile?.display_name || "Sistema";
        const cardTitle = lang === "pt" ? card?.title_pt : card?.title_en;
        await createLog.mutateAsync({ text: `➕ Ação adicionada em "${cardTitle}": ${text}`, author, crisis_started_at: crisisStartTime }).catch(() => {});
      }
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    const card = item ? cards.find(c => c.id === item.action_card_id) : null;
    try {
      await deleteItem.mutateAsync(itemId);
      if (crisisActive && item) {
        const author = profile?.display_name || "Sistema";
        const cardTitle = lang === "pt" ? card?.title_pt : card?.title_en;
        const itemText = lang === "pt" ? item.text_pt : item.text_en;
        await createLog.mutateAsync({ text: `➖ Ação removida de "${cardTitle}": ${itemText}`, author, crisis_started_at: crisisStartTime }).catch(() => {});
      }
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleToggleCheck = async (itemId: string, checked: boolean, itemText: string, cardId: string) => {
    if (!crisisActive) return;
    const card = cards.find(c => c.id === cardId);
    const cardTitle = lang === "pt" ? card?.title_pt : card?.title_en;
    const author = profile?.display_name || "Sistema";
    toggleCheck.mutate({ itemId, checked });
    const action = checked ? "✅" : "⬜";
    await createLog.mutateAsync({ text: `${action} "${itemText}" em "${cardTitle}"`, author, crisis_started_at: crisisStartTime }).catch(() => {});
  };

  const resetFilters = () => {
    setFilterRecurso("all"); setFilterTipoFuncao("all"); setFilterFuncao("all"); setFilterMacroProcesso("all"); setFilterProcesso("all");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const statesMap = Object.fromEntries(allStates.map(s => [s.checklist_item_id, s.checked]));

  return (
    <div className="space-y-4">
      {/* Crisis banner */}
      {crisisActive && crisisRecursoIds.length > 0 && (
        <div className="p-3 rounded-lg bg-crisis/10 border border-crisis text-sm">
          <div className="flex items-center gap-2 font-bold text-crisis">
            <AlertTriangle className="h-4 w-4" />
            {lang === "pt" ? "CRISE ATIVA" : "ACTIVE CRISIS"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "pt" ? "Filtrado por recursos perdidos: " : "Filtered by lost resources: "}
            {crisisRecursoIds.map(id => recursos.find(r => r.id === id)?.name_pt || id).join(", ")}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Action Cards de Emergência" : "Emergency Action Cards"}
        </h2>
        <Button size="sm" onClick={() => openCreate()} className="h-8 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{lang === "pt" ? "Filtros" : "Filters"}</span>
            </div>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={resetFilters}>{lang === "pt" ? "Limpar" : "Clear"}</Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Recurso que se perde" : "Resource lost"}</Label>
              <Select value={filterRecurso} onValueChange={setFilterRecurso}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.name_pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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

      {/* Grouped cards by Recurso */}
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">{lang === "pt" ? "Nenhum action card encontrado." : "No action cards found."}</p>
      )}

      {groupedCards.map(({ recurso, cards: groupCards }) => {
        const groupId = recurso?.id || "__unassigned";
        const isGroupCollapsed = collapsedGroups[groupId];
        const groupTotal = groupCards.reduce((sum, card) => sum + allItems.filter(i => i.action_card_id === card.id).length, 0);
        const groupDone = groupCards.reduce((sum, card) => {
          const items = allItems.filter(i => i.action_card_id === card.id);
          return sum + items.filter(i => statesMap[i.id]).length;
        }, 0);

        return (
          <div key={groupId} className="space-y-3">
            {/* Group header */}
            <div
              className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg cursor-pointer border border-border/50"
              onClick={() => toggleGroup(groupId)}
            >
              {React.createElement(iconMap[recurso?.icon || ""] || Package, { className: "h-5 w-5 text-muted-foreground shrink-0" })}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold">
                  {recurso ? (lang === "pt" ? recurso.name_pt : recurso.name_en || recurso.name_pt) : (lang === "pt" ? "Sem recurso que se perde associado" : "No resource lost assigned")}
                </h3>
                {recurso?.description_pt && <p className="text-[10px] text-muted-foreground truncate">{recurso.description_pt}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px]">{groupCards.length} cards</Badge>
                <span className="text-[10px] text-muted-foreground">{groupDone}/{groupTotal}</span>
                {isGroupCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </div>

            {!isGroupCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 border-l-2 border-border/50 ml-3">
                {groupCards.map(card => {
                  const isOpen = expanded[card.id];
                  const items = allItems.filter(i => i.action_card_id === card.id);
                  const done = items.filter(i => statesMap[i.id]).length;
                  const total = items.length;
                  const title = lang === "pt" ? card.title_pt : card.title_en;
                  const bpLabel = [card.funcao, card.macro_processo].filter(Boolean).join(" › ");
                  const severity = severityLabels[card.severity];

                  return (
                    <Card key={card.id} className={`border-l-4 ${severityColors[card.severity] || ""} flex flex-col`}>
                      <CardHeader className="p-3 pb-1 cursor-pointer" onClick={() => toggle(card.id)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 flex-1">
                            <CardTitle className="text-sm leading-tight">{title}</CardTitle>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-[9px]">
                                {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                              </Badge>
                              {bpLabel && <Badge variant="outline" className="text-[9px] font-normal">{bpLabel}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDuplicate(card); }} title={lang === "pt" ? "Duplicar" : "Duplicate"}><Copy className="h-3 w-3 sat-keep" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openEdit(card); }}><Pencil className="h-3 w-3 sat-keep" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}><Trash2 className="h-3 w-3 sat-keep" /></Button>
                            {isOpen ? <ChevronUp className="h-3.5 w-3.5 sat-keep" /> : <ChevronDown className="h-3.5 w-3.5 sat-keep" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1 bg-secondary rounded-full">
                            <div className="h-1 bg-ok rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                          </div>
                          <span className="text-[9px] text-muted-foreground font-medium">{done}/{total}</span>
                        </div>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="p-3 pt-1 space-y-1.5 border-t border-border/50">
                          {items.map(item => {
                            const checked = !!statesMap[item.id];
                            const text = lang === "pt" ? item.text_pt : item.text_en;
                            return (
                              <div key={item.id} className="flex items-start gap-2 py-0.5 group">
                                <label className={`flex items-start gap-2 flex-1 ${crisisActive ? "cursor-pointer" : "cursor-default opacity-80"}`}>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => handleToggleCheck(item.id, !checked, text, card.id)}
                                    className="mt-0.5"
                                    disabled={!crisisActive}
                                  />
                                  <span className={`text-xs ${checked ? "line-through text-muted-foreground" : ""}`}>{text}</span>
                                </label>
                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDeleteItem(item.id)}><X className="h-2.5 w-2.5" /></Button>
                              </div>
                            );
                          })}
                          <div className="flex gap-2 pt-1">
                            <Input value={newItemText[card.id] || ""} onChange={(e) => setNewItemText(prev => ({ ...prev, [card.id]: e.target.value }))}
                              placeholder={lang === "pt" ? "Novo item..." : "New item..."} className="h-7 text-xs bg-secondary border-border"
                              onKeyDown={(e) => e.key === "Enter" && handleAddItem(card.id)} />
                            <Button size="sm" variant="secondary" className="h-7 px-2" onClick={() => handleAddItem(card.id)}><Plus className="h-3 w-3" /></Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCard ? (lang === "pt" ? "Editar Action Card" : "Edit Action Card") : (lang === "pt" ? "Novo Action Card" : "New Action Card")}
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
              <Label className="text-sm font-medium">{lang === "pt" ? "Recurso que se perde" : "Resource lost"}</Label>
              <Select value={form.recurso_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, recurso_id: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Nenhum —" : "— None —"}</SelectItem>
                  {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.icon || "📦"} {r.name_pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Função" : "Function"}</Label>
              <Select value={form.funcao || "none"} onValueChange={(v) => setForm(f => ({ ...f, funcao: v === "none" ? "" : v, macro_processo: "" }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Nenhuma —" : "— None —"}</SelectItem>
                  {[...new Set(businessProcesses.map(bp => bp.funcao).filter(Boolean))].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Macro Processo" : "Macro Process"}</Label>
              <Select value={form.macro_processo || "none"} onValueChange={(v) => setForm(f => ({ ...f, macro_processo: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Nenhum —" : "— None —"}</SelectItem>
                  {[...new Set(businessProcesses.filter(bp => !form.funcao || bp.funcao === form.funcao).map(bp => bp.macro_processo).filter(Boolean))].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
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
