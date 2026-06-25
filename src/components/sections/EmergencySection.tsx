import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ChevronDown, ChevronUp, Filter, AlertTriangle,
  Plus, Pencil, Trash2, Copy, X, Loader2,
  Monitor, Home, UserCheck, Network, Zap, Package,
  LayoutList, Columns3, GripVertical,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
import { useCenarios } from "@/hooks/useCenarios";
import { useDepartments } from "@/hooks/useDepartments";
import { useBIAProcesses } from "@/hooks/useBIAProcesses";
import { useBIAActionCards, useLinkBIAActionCard, useUnlinkBIAActionCard } from "@/hooks/useBIAActionCards";
import { useToast } from "@/hooks/use-toast";
import { useCreateDecisionLog } from "@/hooks/useDecisionLog";
import { useCrises } from "@/hooks/useCrises";
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
  const { lang, searchQuery, crisisStartTime } = useApp();
  const { data: cards = [], isLoading } = useActionCards();
  const { data: allItems = [] } = useChecklistItems();
  const { data: allStates = [] } = useChecklistStates();
  const { data: businessProcesses = [] } = useBusinessProcesses();
  const { data: recursos = [] } = useRecursos();
  const { data: cenarios = [] } = useCenarios();
  const { data: departments = [] } = useDepartments();
  const { data: biaProcesses = [] } = useBIAProcesses();
  const { data: biaACLinks = [] } = useBIAActionCards();
  const linkBIA = useLinkBIAActionCard();
  const unlinkBIA = useUnlinkBIAActionCard();
  const { data: dbCrises = [] } = useCrises();
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

  const activeDeclaredCrisis = useMemo(() => {
    return dbCrises.find(c =>
      c.status === "crise_em_curso" &&
      (c.crisis_type === "real" || c.crisis_type === "simulated")
    );
  }, [dbCrises]);
  const canCheck = !!activeDeclaredCrisis;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [form, setForm] = useState({ title_pt: "", title_en: "", severity: "medium", capability: "", funcao: "", macro_processo: "", recurso_id: "", cenario_id: "", department_id: "" });
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [expandedKanban, setExpandedKanban] = useState<Record<string, boolean>>({});
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [addBiaForCard, setAddBiaForCard] = useState<Record<string, string>>({});

  // Confirmation dialog for checking items
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCheck, setPendingCheck] = useState<{ itemId: string; checked: boolean; itemText: string; cardId: string } | null>(null);
  const [confirmForm, setConfirmForm] = useState({ department: "", person: "", notes: "" });

  // Filters: Cenário, Departamento, Recurso
  const [filterCenario, setFilterCenario] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterRecurso, setFilterRecurso] = useState<string>("all");

  const hasActiveFilter = filterCenario !== "all" || filterDepartment !== "all" || filterRecurso !== "all";

  const filtered = useMemo(() => {
    return cards.filter(c => {
      const title = lang === "pt" ? c.title_pt : c.title_en;
      if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCenario !== "all" && (c as any).cenario_id !== filterCenario) return false;
      if (filterDepartment !== "all" && (c as any).department_id !== filterDepartment) return false;
      if (filterRecurso !== "all" && c.recurso_id !== filterRecurso) return false;
      return true;
    });
  }, [cards, searchQuery, lang, filterCenario, filterDepartment, filterRecurso]);

  // Group cards by Recurso (for both list and kanban views)
  const groupedCards = useMemo(() => {
    const groups: { recurso: typeof recursos[0] | null; cards: typeof filtered }[] = [];
    const recMap = new Map(recursos.map(r => [r.id, r]));

    const byRec = new Map<string, typeof filtered>();
    const unassigned: typeof filtered = [];

    filtered.forEach(card => {
      const rId = card.recurso_id;
      if (rId && recMap.has(rId)) {
        const existing = byRec.get(rId) || [];
        existing.push(card);
        byRec.set(rId, existing);
      } else {
        unassigned.push(card);
      }
    });

    const sortedKeys = [...byRec.keys()].sort((a, b) => {
      const ra = recMap.get(a);
      const rb = recMap.get(b);
      return (ra?.name_pt || "").localeCompare(rb?.name_pt || "");
    });

    sortedKeys.forEach(id => {
      groups.push({ recurso: recMap.get(id)!, cards: byRec.get(id)! });
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
    setForm({ title_pt: "", title_en: "", severity: "medium", capability: "", funcao: "", macro_processo: "", recurso_id: recursoId || "", cenario_id: "", department_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (card: typeof cards[0]) => {
    setEditingCard(card.id);
    setForm({
      title_pt: card.title_pt, title_en: card.title_en, severity: card.severity,
      capability: card.capability || "", funcao: card.funcao || "",
      macro_processo: card.macro_processo || "", recurso_id: card.recurso_id || "",
      cenario_id: (card as any).cenario_id || "",
      department_id: (card as any).department_id || "",
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
        cenario_id: form.cenario_id || undefined,
        department_id: form.department_id || undefined,
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
        cenario_id: (card as any).cenario_id,
        department_id: (card as any).department_id,
        owner_id: card.owner_id,
      } as any).select("id").single();
      if (error) throw error;

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
      if (canCheck) {
        const author = profile?.display_name || "Sistema";
        const cardTitle = lang === "pt" ? card?.title_pt : card?.title_en;
        await createLog.mutateAsync({ text: `➕ Ação adicionada em "${cardTitle}": ${text}`, author, crisis_started_at: crisisStartTime, crisis_id: activeDeclaredCrisis?.id || null }).catch(() => {});
      }
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    const card = item ? cards.find(c => c.id === item.action_card_id) : null;
    try {
      await deleteItem.mutateAsync(itemId);
      if (canCheck && item) {
        const author = profile?.display_name || "Sistema";
        const cardTitle = lang === "pt" ? card?.title_pt : card?.title_en;
        const itemText = lang === "pt" ? item.text_pt : item.text_en;
        await createLog.mutateAsync({ text: `➖ Ação removida de "${cardTitle}": ${itemText}`, author, crisis_started_at: crisisStartTime, crisis_id: activeDeclaredCrisis?.id || null }).catch(() => {});
      }
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleToggleCheck = async (itemId: string, checked: boolean, itemText: string, cardId: string) => {
    if (!canCheck) return;
    if (checked) {
      setPendingCheck({ itemId, checked, itemText, cardId });
      setConfirmForm({ department: "", person: "", notes: "" });
      setConfirmDialogOpen(true);
    } else {
      const card = cards.find(c => c.id === cardId);
      const cardTitle = lang === "pt" ? card?.title_pt : card?.title_en;
      const author = profile?.display_name || "Sistema";
      toggleCheck.mutate({ itemId, checked });
      await createLog.mutateAsync({ text: `⬜ "${itemText}" em "${cardTitle}"`, author, crisis_started_at: crisisStartTime, crisis_id: activeDeclaredCrisis?.id || null }).catch(() => {});
    }
  };

  const handleConfirmCheck = async () => {
    if (!pendingCheck) return;
    const { itemId, itemText, cardId } = pendingCheck;
    const card = cards.find(c => c.id === cardId);
    const cardTitle = lang === "pt" ? card?.title_pt : card?.title_en;
    const author = profile?.display_name || "Sistema";
    toggleCheck.mutate({
      itemId,
      checked: true,
      confirmed_by_department: confirmForm.department,
      confirmed_by_person: confirmForm.person,
      notes: confirmForm.notes,
    });
    const details = [
      confirmForm.department && `Dept: ${confirmForm.department}`,
      confirmForm.person && `Por: ${confirmForm.person}`,
      confirmForm.notes && `Notas: ${confirmForm.notes}`,
    ].filter(Boolean).join(" | ");
    await createLog.mutateAsync({
      text: `✅ "${itemText}" em "${cardTitle}"${details ? ` (${details})` : ""}`,
      author,
      crisis_started_at: crisisStartTime,
      crisis_id: activeDeclaredCrisis?.id || null,
    }).catch(() => {});
    setConfirmDialogOpen(false);
    setPendingCheck(null);
  };

  const resetFilters = () => {
    setFilterCenario("all"); setFilterDepartment("all"); setFilterRecurso("all");
  };

  const handleDragStart = (cardId: string) => setDragCardId(cardId);
  const handleDragEnd = () => { setDragCardId(null); setDragOverCol(null); };
  const handleDragOver = (e: React.DragEvent, colId: string) => { e.preventDefault(); setDragOverCol(colId); };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const statesMap = Object.fromEntries(allStates.map(s => [s.checklist_item_id, s.checked]));

  const getCenarioLabel = (card: typeof cards[0]) => {
    const cId = (card as any).cenario_id;
    if (!cId) return null;
    const c = cenarios.find(x => x.id === cId);
    return c ? `${c.roman ? c.roman + " — " : ""}${lang === "pt" ? c.name_pt : c.name_en || c.name_pt}` : null;
  };

  const getDeptLabel = (card: typeof cards[0]) => {
    const dId = (card as any).department_id;
    if (!dId) return null;
    const d = departments.find(dep => dep.id === dId);
    return d ? d.name : null;
  };

  const getRecursoLabel = (card: typeof cards[0]) => {
    if (!card.recurso_id) return null;
    const r = recursos.find(x => x.id === card.recurso_id);
    return r ? (lang === "pt" ? r.name_pt : r.name_en || r.name_pt) : null;
  };

  return (
    <div className="space-y-4">
      {/* Crisis banner */}
      {canCheck && activeDeclaredCrisis && (
        <div className="p-3 rounded-lg bg-crisis/10 border border-crisis text-sm">
          <div className="flex items-center gap-2 font-bold text-crisis">
            <AlertTriangle className="h-4 w-4" />
            {lang === "pt" ? "CRISE DECLARADA" : "CRISIS DECLARED"} — {activeDeclaredCrisis.title}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "pt" ? "Os checklists estão desbloqueados para interação." : "Checklists are unlocked for interaction."}
          </p>
        </div>
      )}
      {!canCheck && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
          <p className="text-xs text-muted-foreground">
            {lang === "pt"
              ? "Os checklists só podem ser preenchidos quando existe uma crise declarada do tipo Real ou Simulada."
              : "Checklists can only be filled when a Real or Simulated crisis is declared."}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Action Cards de Emergência" : "Emergency Action Cards"}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" className="h-8 rounded-none px-2" onClick={() => setViewMode("kanban")}><Columns3 className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" className="h-8 rounded-none px-2" onClick={() => setViewMode("list")}><LayoutList className="h-3.5 w-3.5" /></Button>
          </div>
          <Button size="sm" onClick={() => openCreate()} className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}
          </Button>
        </div>
      </div>

      {/* Filters: Cenário, Departamento, Recurso */}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Cenário" : "Scenario"}</Label>
              <Select value={filterCenario} onValueChange={setFilterCenario}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {cenarios.map(c => <SelectItem key={c.id} value={c.id}>{c.roman ? `${c.roman} — ` : ""}{lang === "pt" ? c.name_pt : c.name_en || c.name_pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Departamento" : "Department"}</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Recurso" : "Resource"}</Label>
              <Select value={filterRecurso} onValueChange={setFilterRecurso}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.name_pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">{lang === "pt" ? "Nenhum action card encontrado." : "No action cards found."}</p>
      )}

      {/* LIST VIEW - grouped by Recurso */}
      {viewMode === "list" && groupedCards.map(({ recurso, cards: groupCards }) => {
        const groupId = recurso?.id || "__unassigned";
        const isGroupCollapsed = collapsedGroups[groupId];
        const groupTotal = groupCards.reduce((sum, card) => sum + allItems.filter(i => i.action_card_id === card.id).length, 0);
        const groupDone = groupCards.reduce((sum, card) => {
          const items = allItems.filter(i => i.action_card_id === card.id);
          return sum + items.filter(i => statesMap[i.id]).length;
        }, 0);

        const groupLabel = recurso
          ? (lang === "pt" ? recurso.name_pt : recurso.name_en || recurso.name_pt)
          : (lang === "pt" ? "Sem recurso associado" : "No resource assigned");

        return (
          <div key={groupId} className="space-y-3">
            <div
              className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg cursor-pointer border border-border/50"
              onClick={() => toggleGroup(groupId)}
            >
              <Package className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold">{groupLabel}</h3>
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
                  const cenLabel = getCenarioLabel(card);
                  const deptLabel = getDeptLabel(card);
                  const recLabel = getRecursoLabel(card);

                  return (
                    <Card key={card.id} className={`border-l-4 ${severityColors[card.severity] || ""} flex flex-col`}>
                      <CardHeader className="p-3 pb-1 cursor-pointer" onClick={() => toggle(card.id)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 flex-1">
                            <CardTitle className="text-base leading-tight">{title}</CardTitle>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-[11px]">
                                {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                              </Badge>
                              {bpLabel && <Badge variant="outline" className="text-[11px] font-normal">{bpLabel}</Badge>}
                              {cenLabel && <Badge variant="outline" className="text-[11px] font-normal bg-accent/30">{cenLabel}</Badge>}
                              {recLabel && <Badge variant="outline" className="text-[11px] font-normal">{recLabel}</Badge>}
                              {deptLabel && <Badge variant="outline" className="text-[11px] font-normal bg-primary/10 text-primary">{deptLabel}</Badge>}
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
                          <span className="text-xs text-muted-foreground font-medium">{done}/{total}</span>
                        </div>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="p-3 pt-1 space-y-1.5 border-t border-border/50">
                          {items.map((item, idx) => {
                            const checked = !!statesMap[item.id];
                            const text = lang === "pt" ? item.text_pt : item.text_en;
                            return (
                              <div key={item.id} className="flex items-start gap-2 py-0.5 group">
                                <span className="text-xs text-muted-foreground font-medium mt-0.5 w-5 shrink-0 text-right">{idx + 1}.</span>
                                <label className={`flex items-start gap-2 flex-1 ${canCheck ? "cursor-pointer" : "cursor-default opacity-80"}`}>
                                  <Checkbox checked={checked} onCheckedChange={() => handleToggleCheck(item.id, !checked, text, card.id)} className="mt-0.5" disabled={!canCheck} />
                                  <span className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{text}</span>
                                </label>
                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDeleteItem(item.id)} title={lang === "pt" ? "Eliminar linha" : "Delete row"}><Trash2 className="h-3 w-3" /></Button>
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

      {/* KANBAN VIEW - columns by Cenário */}
      {viewMode === "kanban" && filtered.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
          {[...cenarios, null].map(cenario => {
            const colId = cenario?.id || "__unassigned";
            const colCards = filtered.filter(c => cenario ? (c as any).cenario_id === cenario.id : !(c as any).cenario_id || !cenarios.some(x => x.id === (c as any).cenario_id));
            if (colCards.length === 0 && cenario) return null;
            const isDragOver = dragOverCol === colId;

            return (
              <div
                key={colId}
                className={`flex-shrink-0 w-72 flex flex-col rounded-lg border transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-border bg-secondary/30"}`}
                onDragOver={(e) => handleDragOver(e, colId)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  if (!dragCardId) return;
                  const card = cards.find(c => c.id === dragCardId);
                  const targetCenId = cenario?.id || null;
                  if (!card || (card as any).cenario_id === targetCenId) { setDragCardId(null); return; }
                  updateCard.mutateAsync({
                    id: card.id, title_pt: card.title_pt, title_en: card.title_en,
                    severity: card.severity, capability: card.capability || undefined,
                    funcao: card.funcao || undefined, macro_processo: card.macro_processo || undefined,
                    recurso_id: card.recurso_id || undefined,
                    cenario_id: targetCenId || undefined,
                    department_id: (card as any).department_id || undefined,
                  }).then(() => toast({ title: lang === "pt" ? "Card movido" : "Card moved" }))
                    .catch((err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }));
                  setDragCardId(null);
                }}
              >
                <div className="p-3 border-b border-border/50 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold truncate block">
                      {cenario ? `${cenario.roman ? cenario.roman + " — " : ""}${lang === "pt" ? cenario.name_pt : cenario.name_en || cenario.name_pt}` : (lang === "pt" ? "Sem cenário" : "No scenario")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{colCards.length}</Badge>
                </div>

                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-2">
                    {colCards.map(card => {
                      const items = allItems.filter(i => i.action_card_id === card.id);
                      const done = items.filter(i => statesMap[i.id]).length;
                      const total = items.length;
                      const title = lang === "pt" ? card.title_pt : card.title_en;
                      const severity = severityLabels[card.severity];
                      const isDragging = dragCardId === card.id;
                      const isCardExpanded = expandedKanban[card.id];
                      const recLabel = getRecursoLabel(card);
                      const deptLabel = getDeptLabel(card);

                      return (
                        <Card
                          key={card.id}
                          draggable
                          onDragStart={() => handleDragStart(card.id)}
                          onDragEnd={handleDragEnd}
                          className={`border-l-4 ${severityColors[card.severity] || ""} cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? "opacity-40" : ""}`}
                        >
                          <CardContent className="p-2.5 space-y-1.5">
                            <div className="flex items-start gap-1.5">
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 sat-keep" />
                              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedKanban(prev => ({ ...prev, [card.id]: !prev[card.id] }))}>
                                <p className="text-sm font-medium leading-tight">{title}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                                  </Badge>
                                  {recLabel && <Badge variant="outline" className="text-[10px] font-normal">{recLabel}</Badge>}
                                  {deptLabel && <Badge variant="outline" className="text-[10px] font-normal bg-primary/10 text-primary">{deptLabel}</Badge>}
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => openEdit(card)}><Pencil className="h-2.5 w-2.5 sat-keep" /></Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleDuplicate(card)}><Copy className="h-2.5 w-2.5 sat-keep" /></Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => handleDelete(card.id)}><Trash2 className="h-2.5 w-2.5 sat-keep" /></Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-secondary rounded-full">
                                <div className="h-1 bg-ok rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{done}/{total}</span>
                              <button onClick={() => setExpandedKanban(prev => ({ ...prev, [card.id]: !prev[card.id] }))} className="text-muted-foreground">
                                {isCardExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                            {isCardExpanded && (
                              <div className="space-y-1 pt-1 border-t border-border/50">
                                {items.map((item, idx) => {
                                  const checked = !!statesMap[item.id];
                                  const text = lang === "pt" ? item.text_pt : item.text_en;
                                  return (
                                    <div key={item.id} className="flex items-start gap-1.5 group">
                                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5 w-4 shrink-0 text-right">{idx + 1}.</span>
                                      <label className={`flex items-start gap-1.5 flex-1 ${canCheck ? "cursor-pointer" : "cursor-default opacity-80"}`}>
                                        <Checkbox checked={checked} onCheckedChange={() => handleToggleCheck(item.id, !checked, text, card.id)} className="mt-0.5 h-3 w-3" disabled={!canCheck} />
                                        <span className={`text-xs leading-tight ${checked ? "line-through text-muted-foreground" : ""}`}>{text}</span>
                                      </label>
                                      <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDeleteItem(item.id)} title={lang === "pt" ? "Eliminar linha" : "Delete row"}><Trash2 className="h-2.5 w-2.5" /></Button>
                                    </div>
                                  );
                                })}
                                <div className="flex gap-1.5 pt-1">
                                  <Input value={newItemText[card.id] || ""} onChange={(e) => setNewItemText(prev => ({ ...prev, [card.id]: e.target.value }))}
                                    placeholder={lang === "pt" ? "Novo item..." : "New item..."} className="h-6 text-[10px] bg-secondary border-border px-2"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddItem(card.id)} />
                                  <Button size="sm" variant="secondary" className="h-6 px-1.5" onClick={() => handleAddItem(card.id)}><Plus className="h-3 w-3" /></Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {colCards.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-6">{lang === "pt" ? "Arraste cards para aqui" : "Drag cards here"}</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      )}

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
              <Label className="text-sm font-medium">{lang === "pt" ? "Cenário" : "Scenario"}</Label>
              <Select value={form.cenario_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, cenario_id: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Nenhum —" : "— None —"}</SelectItem>
                  {cenarios.map(c => <SelectItem key={c.id} value={c.id}>{c.roman ? `${c.roman} — ` : ""}{lang === "pt" ? c.name_pt : c.name_en || c.name_pt}</SelectItem>)}
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
                  {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.name_pt}</SelectItem>)}
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
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Departamento" : "Department"}</Label>
              <Select value={form.department_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, department_id: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Nenhum —" : "— None —"}</SelectItem>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
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

      {/* Confirmation dialog for checking items */}
      <Dialog open={confirmDialogOpen} onOpenChange={(open) => { if (!open) { setConfirmDialogOpen(false); setPendingCheck(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === "pt" ? "Confirmação de Ação" : "Action Confirmation"}</DialogTitle>
          </DialogHeader>
          {pendingCheck && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {lang === "pt" ? "A confirmar:" : "Confirming:"} <strong>{pendingCheck.itemText}</strong>
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{lang === "pt" ? "Departamento" : "Department"}</Label>
                  <Input
                    value={confirmForm.department}
                    onChange={(e) => setConfirmForm(f => ({ ...f, department: e.target.value }))}
                    placeholder={lang === "pt" ? "Nome do departamento..." : "Department name..."}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === "pt" ? "Pessoa" : "Person"}</Label>
                  <Input
                    value={confirmForm.person}
                    onChange={(e) => setConfirmForm(f => ({ ...f, person: e.target.value }))}
                    placeholder={lang === "pt" ? "Nome da pessoa..." : "Person name..."}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === "pt" ? "Notas adicionais" : "Additional notes"}</Label>
                  <Textarea
                    rows={3}
                    value={confirmForm.notes}
                    onChange={(e) => setConfirmForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={lang === "pt" ? "Observações..." : "Notes..."}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmDialogOpen(false); setPendingCheck(null); }}>
              {lang === "pt" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleConfirmCheck} disabled={toggleCheck.isPending}>
              {toggleCheck.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lang === "pt" ? "Confirmar" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencySection;
