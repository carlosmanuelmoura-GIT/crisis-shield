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
import { useSubCapacidades } from "@/hooks/useSubCapacidades";
import { useDepartments } from "@/hooks/useDepartments";
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
  const { lang, searchQuery, crisisActive, crisisRecursoIds, crisisStartTime } = useApp();
  const { data: cards = [], isLoading } = useActionCards();
  const { data: allItems = [] } = useChecklistItems();
  const { data: allStates = [] } = useChecklistStates();
  const { data: businessProcesses = [] } = useBusinessProcesses();
  const { data: recursos = [] } = useRecursos();
  const { data: subCapacidades = [] } = useSubCapacidades();
  const { data: departments = [] } = useDepartments();
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

  // Check if there's a declared crisis (real or simulated) in DB
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
  const [form, setForm] = useState({ title_pt: "", title_en: "", severity: "medium", capability: "", funcao: "", macro_processo: "", recurso_id: "", sub_capacidade_id: "", department_id: "" });
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [expandedKanban, setExpandedKanban] = useState<Record<string, boolean>>({});
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Confirmation dialog for checking items
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCheck, setPendingCheck] = useState<{ itemId: string; checked: boolean; itemText: string; cardId: string } | null>(null);
  const [confirmForm, setConfirmForm] = useState({ department: "", person: "", notes: "" });

  // Filters
  const [filterRecurso, setFilterRecurso] = useState<string>("all");
  const [filterSubCapacidade, setFilterSubCapacidade] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");

  const effectiveFilterRecurso = filterRecurso;
  const hasActiveFilter = effectiveFilterRecurso !== "all" || filterSubCapacidade !== "all" || filterDepartment !== "all";

  // Sub-capacidades for current recurso filter
  const filteredSubCaps = useMemo(() => {
    if (filterRecurso === "all") return subCapacidades;
    return subCapacidades.filter(sc => sc.recurso_id === filterRecurso);
  }, [subCapacidades, filterRecurso]);

  // Sub-capacidades for form (based on selected recurso)
  const formSubCaps = useMemo(() => {
    if (!form.recurso_id) return [];
    return subCapacidades.filter(sc => sc.recurso_id === form.recurso_id);
  }, [subCapacidades, form.recurso_id]);

  const filtered = useMemo(() => {
    return cards.filter(c => {
      const title = lang === "pt" ? c.title_pt : c.title_en;
      if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (effectiveFilterRecurso !== "all" && c.recurso_id !== effectiveFilterRecurso) return false;
      if (filterSubCapacidade !== "all" && (c as any).sub_capacidade_id !== filterSubCapacidade) return false;
      if (filterDepartment !== "all" && (c as any).department_id !== filterDepartment) return false;
      return true;
    });
  }, [cards, searchQuery, lang, effectiveFilterRecurso, filterSubCapacidade, filterDepartment]);

  // Group cards by sub_capacidade (within recurso)
  const groupedCards = useMemo(() => {
    const groups: { subCap: typeof subCapacidades[0] | null; recurso: typeof recursos[0] | null; cards: typeof filtered }[] = [];
    const subCapMap = new Map(subCapacidades.map(sc => [sc.id, sc]));
    const recursoMap = new Map(recursos.map(r => [r.id, r]));

    const bySubCap = new Map<string, typeof filtered>();
    const unassigned: typeof filtered = [];

    filtered.forEach(card => {
      const scId = (card as any).sub_capacidade_id;
      if (scId && subCapMap.has(scId)) {
        const existing = bySubCap.get(scId) || [];
        existing.push(card);
        bySubCap.set(scId, existing);
      } else {
        unassigned.push(card);
      }
    });

    // Sort by recurso then sub-cap name
    const sortedKeys = [...bySubCap.keys()].sort((a, b) => {
      const sa = subCapMap.get(a);
      const sb = subCapMap.get(b);
      const ra = sa ? recursoMap.get(sa.recurso_id) : null;
      const rb = sb ? recursoMap.get(sb.recurso_id) : null;
      const cmp = (ra?.name_pt || "").localeCompare(rb?.name_pt || "");
      if (cmp !== 0) return cmp;
      return (sa?.name_pt || "").localeCompare(sb?.name_pt || "");
    });

    sortedKeys.forEach(id => {
      const sc = subCapMap.get(id)!;
      groups.push({ subCap: sc, recurso: recursoMap.get(sc.recurso_id) || null, cards: bySubCap.get(id)! });
    });

    if (unassigned.length > 0) {
      groups.push({ subCap: null, recurso: null, cards: unassigned });
    }

    return groups;
  }, [filtered, subCapacidades, recursos]);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleGroup = (id: string) => setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const openCreate = (recursoId?: string) => {
    setEditingCard(null);
    setForm({ title_pt: "", title_en: "", severity: "medium", capability: "", funcao: "", macro_processo: "", recurso_id: recursoId || "", sub_capacidade_id: "", department_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (card: typeof cards[0]) => {
    setEditingCard(card.id);
    setForm({
      title_pt: card.title_pt, title_en: card.title_en, severity: card.severity,
      capability: card.capability || "", funcao: card.funcao || "",
      macro_processo: card.macro_processo || "", recurso_id: card.recurso_id || "",
      sub_capacidade_id: (card as any).sub_capacidade_id || "",
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
        sub_capacidade_id: form.sub_capacidade_id || undefined,
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
        sub_capacidade_id: (card as any).sub_capacidade_id,
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
      // Opening: show confirmation dialog
      setPendingCheck({ itemId, checked, itemText, cardId });
      setConfirmForm({ department: "", person: "", notes: "" });
      setConfirmDialogOpen(true);
    } else {
      // Unchecking: direct toggle
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
    setFilterRecurso("all"); setFilterSubCapacidade("all"); setFilterDepartment("all");
  };

  const handleDragStart = (cardId: string) => setDragCardId(cardId);
  const handleDragEnd = () => { setDragCardId(null); setDragOverCol(null); };
  const handleDragOver = (e: React.DragEvent, colId: string) => { e.preventDefault(); setDragOverCol(colId); };
  const handleDrop = async (e: React.DragEvent, targetSubCapId: string | null) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!dragCardId) return;
    const card = cards.find(c => c.id === dragCardId);
    if (!card || (card as any).sub_capacidade_id === targetSubCapId) { setDragCardId(null); return; }
    try {
      // When dropping to a sub-cap, also update recurso_id to match
      const targetSc = targetSubCapId ? subCapacidades.find(sc => sc.id === targetSubCapId) : null;
      await updateCard.mutateAsync({
        id: card.id, title_pt: card.title_pt, title_en: card.title_en,
        severity: card.severity, capability: card.capability || undefined,
        funcao: card.funcao || undefined, macro_processo: card.macro_processo || undefined,
        recurso_id: targetSc?.recurso_id || card.recurso_id || undefined,
        sub_capacidade_id: targetSubCapId || undefined,
      });
      toast({ title: lang === "pt" ? "Card movido" : "Card moved" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setDragCardId(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const statesMap = Object.fromEntries(allStates.map(s => [s.checklist_item_id, s.checked]));

  // Helper to get sub-cap label for a card
  const getSubCapLabel = (card: typeof cards[0]) => {
    const scId = (card as any).sub_capacidade_id;
    if (!scId) return null;
    const sc = subCapacidades.find(s => s.id === scId);
    return sc ? (lang === "pt" ? sc.name_pt : sc.name_en || sc.name_pt) : null;
  };

  const getDeptLabel = (card: typeof cards[0]) => {
    const dId = (card as any).department_id;
    if (!dId) return null;
    const d = departments.find(dep => dep.id === dId);
    return d ? d.name : null;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Recurso que se perde" : "Resource lost"}</Label>
              <Select value={filterRecurso} onValueChange={(v) => { setFilterRecurso(v); setFilterSubCapacidade("all"); }}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.name_pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Sub-capacidade" : "Sub-capability"}</Label>
              <Select value={filterSubCapacidade} onValueChange={setFilterSubCapacidade}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todas" : "All"}</SelectItem>
                  {filteredSubCaps.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name_pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Owner</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
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

      {/* LIST VIEW - grouped by sub-capacidade */}
      {viewMode === "list" && groupedCards.map(({ subCap, recurso, cards: groupCards }) => {
        const groupId = subCap?.id || "__unassigned";
        const isGroupCollapsed = collapsedGroups[groupId];
        const groupTotal = groupCards.reduce((sum, card) => sum + allItems.filter(i => i.action_card_id === card.id).length, 0);
        const groupDone = groupCards.reduce((sum, card) => {
          const items = allItems.filter(i => i.action_card_id === card.id);
          return sum + items.filter(i => statesMap[i.id]).length;
        }, 0);

        const groupLabel = subCap
          ? `${recurso ? (lang === "pt" ? recurso.name_pt : recurso.name_en || recurso.name_pt) + " › " : ""}${lang === "pt" ? subCap.name_pt : subCap.name_en || subCap.name_pt}`
          : (lang === "pt" ? "Sem sub-capacidade associada" : "No sub-capability assigned");

        return (
          <div key={groupId} className="space-y-3">
            <div
              className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg cursor-pointer border border-border/50"
              onClick={() => toggleGroup(groupId)}
            >
              {React.createElement(recurso ? (iconMap[recurso.icon] || Package) : Package, { className: "h-5 w-5 text-muted-foreground shrink-0" })}
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
                  const scLabel = getSubCapLabel(card);

                          const deptLabel = getDeptLabel(card);

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
                              {scLabel && <Badge variant="outline" className="text-[11px] font-normal bg-accent/30">{scLabel}</Badge>}
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
                          {items.map(item => {
                            const checked = !!statesMap[item.id];
                            const text = lang === "pt" ? item.text_pt : item.text_en;
                            return (
                              <div key={item.id} className="flex items-start gap-2 py-0.5 group">
                                <label className={`flex items-start gap-2 flex-1 ${canCheck ? "cursor-pointer" : "cursor-default opacity-80"}`}>
                                  <Checkbox checked={checked} onCheckedChange={() => handleToggleCheck(item.id, !checked, text, card.id)} className="mt-0.5" disabled={!canCheck} />
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

      {/* KANBAN VIEW - columns by recurso (capacidade), grouped by sub-capacidade inside */}
      {viewMode === "kanban" && filtered.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
          {[...recursos, null].map(recurso => {
            const colId = recurso?.id || "__unassigned";
            const colCards = filtered.filter(c => recurso ? c.recurso_id === recurso.id : !c.recurso_id || !recursos.some(r => r.id === c.recurso_id));
            if (colCards.length === 0 && recurso) return null;
            const isDragOver = dragOverCol === colId;

            // Group cards within this column by sub-capacidade
            const colSubCaps = recurso ? subCapacidades.filter(sc => sc.recurso_id === recurso.id) : [];
            const cardsBySubCap = new Map<string | null, typeof colCards>();
            colCards.forEach(card => {
              const scId = (card as any).sub_capacidade_id;
              const key = scId && colSubCaps.some(sc => sc.id === scId) ? scId : null;
              const arr = cardsBySubCap.get(key) || [];
              arr.push(card);
              cardsBySubCap.set(key, arr);
            });

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
                  if (!card || card.recurso_id === (recurso?.id || null)) { setDragCardId(null); return; }
                  updateCard.mutateAsync({
                    id: card.id, title_pt: card.title_pt, title_en: card.title_en,
                    severity: card.severity, capability: card.capability || undefined,
                    funcao: card.funcao || undefined, macro_processo: card.macro_processo || undefined,
                    recurso_id: recurso?.id || undefined,
                    sub_capacidade_id: undefined,
                  }).then(() => toast({ title: lang === "pt" ? "Card movido" : "Card moved" }))
                    .catch((err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }));
                  setDragCardId(null);
                }}
              >
                <div className="p-3 border-b border-border/50 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold truncate block">
                      {recurso ? (lang === "pt" ? recurso.name_pt : recurso.name_en || recurso.name_pt) : (lang === "pt" ? "Sem recurso" : "No resource")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{colCards.length}</Badge>
                </div>

                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-3">
                    {/* Render groups by sub-capacidade */}
                    {[...colSubCaps, null].map(sc => {
                      const scId = sc?.id || null;
                      const scCards = cardsBySubCap.get(scId);
                      if (!scCards || scCards.length === 0) return null;
                      const scLabel = sc ? (lang === "pt" ? sc.name_pt : sc.name_en || sc.name_pt) : (lang === "pt" ? "Sem sub-capacidade" : "No sub-capability");

                      return (
                        <div key={scId || "__none"} className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">{scLabel}</p>
                          <div className="space-y-2">
                            {scCards.map(card => {
                              const items = allItems.filter(i => i.action_card_id === card.id);
                              const done = items.filter(i => statesMap[i.id]).length;
                              const total = items.length;
                              const title = lang === "pt" ? card.title_pt : card.title_en;
                              const severity = severityLabels[card.severity];
                              const isDragging = dragCardId === card.id;
                              const isCardExpanded = expandedKanban[card.id];

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
                                        <p className="text-xs font-medium leading-tight">{title}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          <Badge variant="secondary" className="text-[8px]">
                                            {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                                          </Badge>
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
                                      <span className="text-[8px] text-muted-foreground">{done}/{total}</span>
                                      {total > 0 && (
                                        <button onClick={() => setExpandedKanban(prev => ({ ...prev, [card.id]: !prev[card.id] }))} className="text-muted-foreground">
                                          {isCardExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </button>
                                      )}
                                    </div>
                                    {/* Checklist items */}
                                    {isCardExpanded && items.length > 0 && (
                                      <div className="space-y-1 pt-1 border-t border-border/50">
                                        {items.map(item => {
                                          const checked = !!statesMap[item.id];
                                          const text = lang === "pt" ? item.text_pt : item.text_en;
                                          return (
                                            <label key={item.id} className={`flex items-start gap-1.5 ${canCheck ? "cursor-pointer" : "cursor-default opacity-80"}`}>
                                              <Checkbox checked={checked} onCheckedChange={() => handleToggleCheck(item.id, !checked, text, card.id)} className="mt-0.5 h-3 w-3" disabled={!canCheck} />
                                              <span className={`text-[10px] leading-tight ${checked ? "line-through text-muted-foreground" : ""}`}>{text}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
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
              <Label className="text-sm font-medium">{lang === "pt" ? "Recurso que se perde" : "Resource lost"}</Label>
              <Select value={form.recurso_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, recurso_id: v === "none" ? "" : v, sub_capacidade_id: "" }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Nenhum —" : "— None —"}</SelectItem>
                  {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.name_pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {formSubCaps.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{lang === "pt" ? "Sub-capacidade perdida" : "Sub-capability lost"}</Label>
                <Select value={form.sub_capacidade_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, sub_capacidade_id: v === "none" ? "" : v }))}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{lang === "pt" ? "— Nenhuma —" : "— None —"}</SelectItem>
                    {formSubCaps.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name_pt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              <Label className="text-sm font-medium">{lang === "pt" ? "Departamento (Owner)" : "Department (Owner)"}</Label>
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
