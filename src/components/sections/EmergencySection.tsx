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
  LayoutList, Columns3, GripVertical, ArrowUp, ArrowDown, FileDown,
} from "lucide-react";
import { generateDeptActionCardsPDF } from "@/lib/generateDeptActionCardsPDF";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Monitor, Home, UserCheck, Network, Zap,
};
import {
  useActionCards, useChecklistItems, useChecklistStates, useToggleChecklistState,
  useCreateActionCard, useUpdateActionCard, useDeleteActionCard,
  useCreateChecklistItem, useDeleteChecklistItem, useUpdateChecklistItem, useReorderChecklistItems,
} from "@/hooks/useActionCards";
import { useBusinessProcesses } from "@/hooks/useBusinessProcesses";
import { useRecursos } from "@/hooks/useRecursos";
import { useCenarios } from "@/hooks/useCenarios";
import { useDepartments } from "@/hooks/useDepartments";
import { useDRTypes } from "@/hooks/useCMDBPlatforms";
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
  const { data: drTypes = [] } = useDRTypes();
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
  const updateItem = useUpdateChecklistItem();
  const reorderItems = useReorderChecklistItems();
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
  const [form, setForm] = useState({ title_pt: "", title_en: "", severity: "medium", capability: "", recurso_id: "", cenario_id: "", department_id: "", dr_type_id: "" });
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [expandedKanban, setExpandedKanban] = useState<Record<string, boolean>>({});
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [addBiaForCard, setAddBiaForCard] = useState<Record<string, string>>({});
  const [linkBiaDialogCard, setLinkBiaDialogCard] = useState<string | null>(null);
  const [biaToLink, setBiaToLink] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [biaDetailId, setBiaDetailId] = useState<string | null>(null);

  // Confirmation dialog for checking items
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingCheck, setPendingCheck] = useState<{ itemId: string; checked: boolean; itemText: string; cardId: string } | null>(null);
  const [confirmForm, setConfirmForm] = useState({ department: "", person: "", notes: "" });

  // Filters: Cenário, Departamento, Recurso
  const [filterCenario, setFilterCenario] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterRecurso, setFilterRecurso] = useState<string>("all");
  const [filterDR, setFilterDR] = useState<string>("all");

  const hasActiveFilter = filterCenario !== "all" || filterDepartment !== "all" || filterRecurso !== "all" || filterDR !== "all";

  const filtered = useMemo(() => {
    return cards.filter(c => {
      const title = lang === "pt" ? c.title_pt : c.title_en;
      if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCenario !== "all" && (c as any).cenario_id !== filterCenario) return false;
      if (filterDepartment !== "all" && (c as any).department_id !== filterDepartment) return false;
      if (filterRecurso !== "all" && c.recurso_id !== filterRecurso) return false;
      if (filterDR !== "all" && ((c as any).dr_type_id || "__none") !== filterDR) return false;
      return true;
    });
  }, [cards, searchQuery, lang, filterCenario, filterDepartment, filterRecurso, filterDR]);

  // Group cards: primary by Cenário, secondary by Recurso (used by both views)
  const groupedByCenario = useMemo(() => {
    const cenMap = new Map(cenarios.map(c => [c.id, c]));
    const recMap = new Map(recursos.map(r => [r.id, r]));
    const drMap = new Map(drTypes.map(d => [d.id, d]));

    const byCen = new Map<string, typeof filtered>();
    const cenUnassigned: typeof filtered = [];

    filtered.forEach(card => {
      const cId = (card as any).cenario_id;
      if (cId && cenMap.has(cId)) {
        const arr = byCen.get(cId) || [];
        arr.push(card);
        byCen.set(cId, arr);
      } else {
        cenUnassigned.push(card);
      }
    });

    const sortedCenKeys = [...byCen.keys()].sort((a, b) => {
      const ca = cenMap.get(a); const cb = cenMap.get(b);
      const ra = ca?.roman || ""; const rb = cb?.roman || "";
      if (ra && rb && ra !== rb) return ra.localeCompare(rb);
      return (ca?.name_pt || "").localeCompare(cb?.name_pt || "");
    });

    const buildRecGroups = (cardList: typeof filtered) => {
      const byRec = new Map<string, typeof filtered>();
      const recUnassigned: typeof filtered = [];
      cardList.forEach(c => {
        if (c.recurso_id && recMap.has(c.recurso_id)) {
          const arr = byRec.get(c.recurso_id) || [];
          arr.push(c); byRec.set(c.recurso_id, arr);
        } else recUnassigned.push(c);
      });
      const keys = [...byRec.keys()].sort((a, b) =>
        (recMap.get(a)?.name_pt || "").localeCompare(recMap.get(b)?.name_pt || "")
      );
      const out: { recurso: typeof recursos[0] | null; cards: typeof filtered }[] = [];
      keys.forEach(k => out.push({ recurso: recMap.get(k)!, cards: byRec.get(k)! }));
      if (recUnassigned.length) out.push({ recurso: null, cards: recUnassigned });
      return out;
    };

    const buildDrGroups = (cardList: typeof filtered) => {
      const byDr = new Map<string, typeof filtered>();
      const drUnassigned: typeof filtered = [];
      cardList.forEach(c => {
        const id = (c as any).dr_type_id;
        if (id && drMap.has(id)) {
          const arr = byDr.get(id) || [];
          arr.push(c); byDr.set(id, arr);
        } else drUnassigned.push(c);
      });
      const keys = [...byDr.keys()].sort((a, b) =>
        (drMap.get(a)?.sort_order ?? 999) - (drMap.get(b)?.sort_order ?? 999)
      );
      const out: { drType: typeof drTypes[0] | null; recursoGroups: ReturnType<typeof buildRecGroups>; total: number }[] = [];
      keys.forEach(k => {
        const list = byDr.get(k)!;
        out.push({ drType: drMap.get(k)!, recursoGroups: buildRecGroups(list), total: list.length });
      });
      if (drUnassigned.length) out.push({ drType: null, recursoGroups: buildRecGroups(drUnassigned), total: drUnassigned.length });
      return out;
    };

    const groups: { cenario: typeof cenarios[0] | null; drGroups: ReturnType<typeof buildDrGroups>; total: number }[] = [];
    sortedCenKeys.forEach(id => {
      const list = byCen.get(id)!;
      groups.push({ cenario: cenMap.get(id)!, drGroups: buildDrGroups(list), total: list.length });
    });
    if (cenUnassigned.length) {
      groups.push({ cenario: null, drGroups: buildDrGroups(cenUnassigned), total: cenUnassigned.length });
    }
    return groups;
  }, [filtered, cenarios, recursos, drTypes]);


  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleGroup = (id: string) => setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const openCreate = (recursoId?: string) => {
    setEditingCard(null);
    setForm({ title_pt: "", title_en: "", severity: "medium", capability: "", recurso_id: recursoId || "", cenario_id: "", department_id: "", dr_type_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (card: typeof cards[0]) => {
    setEditingCard(card.id);
    setForm({
      title_pt: card.title_pt, title_en: card.title_en, severity: card.severity,
      capability: card.capability || "",
      recurso_id: card.recurso_id || "",
      cenario_id: card.cenario_id || "",
      department_id: card.department_id || "",
      dr_type_id: (card as any).dr_type_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        recurso_id: form.recurso_id || undefined,
        capability: form.capability || undefined,
        cenario_id: form.cenario_id || undefined,
        department_id: form.department_id || undefined,
        dr_type_id: form.dr_type_id || undefined,
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
        dr_type_id: (card as any).dr_type_id,
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

  const startEditItem = (itemId: string, currentText: string) => {
    setEditingItemId(itemId);
    setEditingItemText(currentText);
  };
  const cancelEditItem = () => { setEditingItemId(null); setEditingItemText(""); };
  const commitEditItem = async (itemId: string, originalText: string) => {
    const newText = editingItemText.trim();
    if (!newText || newText === originalText) { cancelEditItem(); return; }
    try {
      await updateItem.mutateAsync({ id: itemId, text: newText });
      const item = allItems.find(i => i.id === itemId);
      const card = item ? cards.find(c => c.id === item.action_card_id) : null;
      if (canCheck && card) {
        const author = profile?.display_name || "Sistema";
        const cardTitle = lang === "pt" ? card.title_pt : card.title_en;
        await createLog.mutateAsync({ text: `✏️ Ação editada em "${cardTitle}": "${originalText}" → "${newText}"`, author, crisis_started_at: crisisStartTime, crisis_id: activeDeclaredCrisis?.id || null }).catch(() => {});
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      cancelEditItem();
    }
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
    setFilterCenario("all"); setFilterDepartment("all"); setFilterRecurso("all"); setFilterDR("all");
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

  const getDRLabel = (card: typeof cards[0]) => {
    const id = (card as any).dr_type_id;
    if (!id) return null;
    const d = drTypes.find(x => x.id === id);
    return d ? `${d.code} — ${d.label}` : null;
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
          {lang === "pt" ? "Action Cards Departamentos" : "Departmental Action Cards"}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" className="h-8 rounded-none px-2" onClick={() => setViewMode("kanban")}><Columns3 className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" className="h-8 rounded-none px-2" onClick={() => setViewMode("list")}><LayoutList className="h-3.5 w-3.5" /></Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={filterDepartment === "all"}
            title={filterDepartment === "all" ? (lang === "pt" ? "Selecione um departamento para gerar o report" : "Select a department to generate the report") : ""}
            onClick={() => {
              const dept = departments.find(d => d.id === filterDepartment);
              if (!dept) return;
              const deptCards = cards.filter(c => (c as any).department_id === filterDepartment);
              generateDeptActionCardsPDF({
                departmentName: dept.name,
                cards: deptCards as any,
                items: allItems as any,
                cenarios: cenarios as any,
                recursos: recursos as any,
              });
            }}
          >
            <FileDown className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Report" : "Report"}
          </Button>
          <Button size="sm" onClick={() => openCreate()} className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}
          </Button>
        </div>
      </div>

      {/* Severity legend */}
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-secondary/40 border border-border rounded-lg">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {lang === "pt" ? "Severidade:" : "Severity:"}
        </span>
        {(["critical", "high", "medium"] as const).map(key => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-sm border-l-4 ${severityColors[key]}`} />
            <span className="text-xs">{lang === "pt" ? severityLabels[key].pt : severityLabels[key].en}</span>
          </div>
        ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Tipo de DR" : "DR Type"}</Label>
              <Select value={filterDR} onValueChange={setFilterDR}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {drTypes.map(d => <SelectItem key={d.id} value={d.id}>{d.code} — {d.label}</SelectItem>)}
                  <SelectItem value="__none">{lang === "pt" ? "Sem tipo de DR" : "No DR type"}</SelectItem>
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
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Tipo de Falha" : "Failure Type"}</Label>
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

      {/* Reusable card renderer (list variant) */}
      {/* LIST VIEW - grouped by Cenário > Recurso */}
      {viewMode === "list" && groupedByCenario.map(({ cenario, drGroups, total: cenTotal }) => {
        const cenId = cenario?.id || "__no_cenario";
        const isCenCollapsed = collapsedGroups[`cen:${cenId}`];
        const cenLabel = cenario
          ? `${cenario.roman ? cenario.roman + " — " : ""}${lang === "pt" ? cenario.name_pt : cenario.name_en || cenario.name_pt}`
          : (lang === "pt" ? "Sem cenário associado" : "No scenario assigned");

        return (
          <div key={cenId} className="space-y-3">
            <div
              className="flex items-center gap-3 px-3 py-2 bg-primary/10 rounded-lg cursor-pointer border border-primary/30"
              onClick={() => toggleGroup(`cen:${cenId}`)}
            >
              <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold uppercase tracking-wide">{lang === "pt" ? "Cenário" : "Scenario"}: {cenLabel}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-[10px]">{cenTotal} cards</Badge>
                {isCenCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </div>

            {!isCenCollapsed && drGroups.map(({ drType, recursoGroups, total: drTotal }) => {
            const drId = drType?.id || "__no_dr";
            const drGroupKey = `${cenId}:dr:${drId}`;
            const isDrCollapsed = collapsedGroups[drGroupKey];
            const drLabel = drType
              ? `${drType.code} — ${drType.label}`
              : (lang === "pt" ? "Sem tipo de DR" : "No DR type");
            return (
            <div key={drGroupKey} className="space-y-2 ml-3">
              <div
                className="flex items-center gap-3 px-3 py-1.5 bg-blue-500/10 rounded-lg cursor-pointer border border-blue-500/30"
                onClick={() => toggleGroup(drGroupKey)}
              >
                <Network className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wide">{lang === "pt" ? "Tipo de DR" : "DR Type"}: {drLabel}</h4>
                  {drType && (
                    <span className="text-[10px] text-muted-foreground">RTO {drType.rto}h · RPO {drType.rpo}h</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">{drTotal} cards</Badge>
                  {isDrCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </div>
              </div>
              {!isDrCollapsed && recursoGroups.map(({ recurso, cards: groupCards }) => {
              const groupId = `${drGroupKey}:${recurso?.id || "__unassigned"}`;
              const isGroupCollapsed = collapsedGroups[groupId];
              const groupTotal = groupCards.reduce((sum, card) => sum + allItems.filter(i => i.action_card_id === card.id).length, 0);
              const groupDone = groupCards.reduce((sum, card) => {
                const items = allItems.filter(i => i.action_card_id === card.id);
                return sum + items.filter(i => statesMap[i.id]).length;
              }, 0);
              const groupLabel = recurso
                ? (lang === "pt" ? recurso.name_pt : recurso.name_en || recurso.name_pt)
                : (lang === "pt" ? "Sem tipo de falha associado" : "No failure type assigned");

              return (
                <div key={groupId} className="space-y-2 ml-4">
                  <div
                    className="flex items-center gap-3 px-3 py-1.5 bg-secondary/50 rounded-lg cursor-pointer border border-border/50"
                    onClick={() => toggleGroup(groupId)}
                  >
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">{lang === "pt" ? "Tipo de Falha" : "Failure Type"}: {groupLabel}</h4>
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
                        const severity = severityLabels[card.severity];
                        const cLabel = getCenarioLabel(card);
                        const deptLabel = getDeptLabel(card);
                        const linkedBias = biaACLinks.filter(l => l.action_card_id === card.id);

                        return (
                          <Card
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`border-l-4 ${severityColors[card.severity] || ""} flex flex-col cursor-pointer transition-all hover:shadow-md ${selectedCardId === card.id ? "ring-2 ring-primary" : ""}`}
                          >
                            <CardHeader className="p-3 pb-2">
                              <div className="flex items-start justify-end gap-2 mb-1">
                                <Badge className={`text-[10px] uppercase tracking-wide ${
                                  card.severity === "critical" ? "bg-red-600 text-white hover:bg-red-600" :
                                  card.severity === "high" ? "bg-amber-500 text-white hover:bg-amber-500" :
                                  "bg-yellow-400 text-slate-900 hover:bg-yellow-400"
                                }`}>
                                  {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                                </Badge>
                              </div>
                              <CardTitle className="text-sm font-bold uppercase leading-tight">{title}</CardTitle>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cLabel && <Badge variant="outline" className="text-[10px] font-normal bg-accent/30">{cLabel}</Badge>}
                                {getDRLabel(card) && <Badge variant="outline" className="text-[10px] font-normal bg-blue-500/10 text-blue-700">{getDRLabel(card)}</Badge>}
                                {deptLabel && <Badge variant="outline" className="text-[10px] font-normal bg-primary/10 text-primary">{deptLabel}</Badge>}
                                {linkedBias.length > 0 && (
                                  <Badge variant="outline" className="text-[10px] font-normal bg-blue-500/10 text-blue-700 dark:text-blue-300">
                                    {linkedBias.length} BIA{linkedBias.length > 1 ? "s" : ""}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1 bg-secondary rounded-full">
                                  <div className="h-1 bg-ok rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">{done}/{total}</span>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
            );
            })}
          </div>
        );
      })}

      {/* KANBAN VIEW - columns by Cenário, inner sub-groups by Recurso */}
      {viewMode === "kanban" && filtered.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 px-3 scroll-px-3" style={{ minHeight: 400 }}>
          {groupedByCenario.map(({ cenario, drGroups, total: colCount }) => {
            const colId = cenario?.id || "__no_cenario";
            const isDragOver = dragOverCol === colId;
            const colTitle = cenario
              ? `${cenario.roman ? cenario.roman + " — " : ""}${lang === "pt" ? cenario.name_pt : cenario.name_en || cenario.name_pt}`
              : (lang === "pt" ? "Sem cenário" : "No scenario");

            return (
              <div
                key={colId}
                className={`flex-shrink-0 w-80 flex flex-col rounded-lg border transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-border bg-secondary/30"}`}
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
                    recurso_id: card.recurso_id || undefined,
                    cenario_id: targetCenId || undefined,
                    department_id: card.department_id || undefined,
                    dr_type_id: (card as any).dr_type_id || undefined,
                  }).then(() => toast({ title: lang === "pt" ? "Card movido" : "Card moved" }))
                    .catch((err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }));
                  setDragCardId(null);
                }}
              >
                <div className="p-3 border-b border-border/50 flex items-center gap-2 bg-primary/10">
                  <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold truncate block uppercase tracking-wide">{colTitle}</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{colCount}</Badge>
                </div>

                <div className="flex-1 min-w-0 overflow-y-auto">
                  <div className="box-border w-full space-y-3 p-2 pr-4">
                    {drGroups.map(({ drType, recursoGroups, total: drTotal }) => (
                    <div key={`${colId}:dr:${drType?.id || "__no_dr"}`} className="space-y-2">
                      <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-blue-500/10 border border-blue-500/20">
                        <Network className="h-3 w-3 text-blue-600 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 truncate">
                          {drType ? `${drType.code} — ${drType.label}` : (lang === "pt" ? "Sem tipo de DR" : "No DR type")}
                        </span>
                        <Badge variant="outline" className="text-[9px] ml-auto">{drTotal}</Badge>
                      </div>
                    {recursoGroups.map(({ recurso, cards: subCards }) => {
                      const subLabel = recurso
                        ? (lang === "pt" ? recurso.name_pt : recurso.name_en || recurso.name_pt)
                        : (lang === "pt" ? "Sem tipo de falha" : "No failure type");
                      return (
                        <div key={`${colId}:${recurso?.id || "__unassigned"}`} className="space-y-1.5">
                          <div className="flex items-center gap-1.5 px-1 py-0.5 border-b border-border/40">
                            <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground truncate">{subLabel}</span>
                            <Badge variant="outline" className="text-[9px] ml-auto">{subCards.length}</Badge>
                          </div>
                          <div className="space-y-2">
                            {subCards.map(card => {
                              const items = allItems.filter(i => i.action_card_id === card.id);
                              const done = items.filter(i => statesMap[i.id]).length;
                              const total = items.length;
                              const title = lang === "pt" ? card.title_pt : card.title_en;
                              const severity = severityLabels[card.severity];
                              const isDragging = dragCardId === card.id;
                              const isCardExpanded = expandedKanban[card.id];
                              const deptLabel = getDeptLabel(card);
                              const linkedBias = biaACLinks.filter(l => l.action_card_id === card.id);

                              return (
                                <Card
                                  key={card.id}
                                  draggable
                                  onDragStart={() => handleDragStart(card.id)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => setSelectedCardId(card.id)}
                                  className={`w-full min-w-0 border-l-4 ${severityColors[card.severity] || ""} cursor-pointer active:cursor-grabbing transition-all hover:shadow-md ${isDragging ? "opacity-40" : ""} ${selectedCardId === card.id ? "ring-2 ring-primary" : ""}`}
                                >
                                  <CardContent className="p-2.5 space-y-1.5">
                                    <div className="flex items-start justify-end gap-2">
                                      <Badge className={`text-[9px] uppercase tracking-wide ${
                                        card.severity === "critical" ? "bg-red-600 text-white hover:bg-red-600" :
                                        card.severity === "high" ? "bg-amber-500 text-white hover:bg-amber-500" :
                                        "bg-yellow-400 text-slate-900 hover:bg-yellow-400"
                                      }`}>
                                        {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-bold uppercase leading-tight">{title}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {deptLabel && <Badge variant="outline" className="text-[10px] font-normal bg-primary/10 text-primary">{deptLabel}</Badge>}
                                      {getDRLabel(card) && <Badge variant="outline" className="text-[10px] font-normal bg-blue-500/10 text-blue-700">{getDRLabel(card)}</Badge>}
                                      {linkedBias.length > 0 && (
                                        <Badge variant="outline" className="text-[10px] font-normal bg-blue-500/10 text-blue-700 dark:text-blue-300">
                                          {linkedBias.length} BIA{linkedBias.length > 1 ? "s" : ""}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1 bg-secondary rounded-full">
                                        <div className="h-1 bg-ok rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">{done}/{total}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                    ))}
                  </div>
                </div>
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
              <Label className="text-sm font-medium">{lang === "pt" ? "Tipo de DR" : "DR Type"}</Label>
              <Select value={form.dr_type_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, dr_type_id: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{lang === "pt" ? "— Sem DR —" : "— No DR —"}</SelectItem>
                  {drTypes.map(d => <SelectItem key={d.id} value={d.id}>{d.code} — {d.label} (RTO {d.rto}h / RPO {d.rpo}h)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Tipo de Falha que se perde" : "Failure Type lost"}</Label>
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

      {/* Link BIA to Action Card dialog */}
      <Dialog open={!!linkBiaDialogCard} onOpenChange={(o) => { if (!o) { setLinkBiaDialogCard(null); setBiaToLink(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{lang === "pt" ? "Associar BIA" : "Link BIA"}</DialogTitle>
          </DialogHeader>
          {linkBiaDialogCard && (() => {
            const card = cards.find(c => c.id === linkBiaDialogCard);
            const deptId = card?.department_id ?? null;
            const linked = biaACLinks.filter(l => l.action_card_id === linkBiaDialogCard).map(l => l.bia_process_id);
            const notLinked = biaProcesses.filter(b => !linked.includes(b.id));
            const available = deptId
              ? notLinked.filter(b => b.department_id === deptId)
              : notLinked;
            return (
              <div className="space-y-3">
                <Label className="text-sm">
                  {lang === "pt" ? "BIAs do departamento" : "Department BIAs"}
                  {!deptId && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {lang === "pt" ? "(Action Card sem departamento — a mostrar todas)" : "(Card has no department — showing all)"}
                    </span>
                  )}
                </Label>
                <div className="max-h-[400px] overflow-auto space-y-2 rounded-md border border-border p-2 bg-secondary/30">
                  {available.length === 0 && (
                    <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                      {lang === "pt" ? "Sem BIAs para este departamento" : "No BIAs for this department"}
                    </div>
                  )}
                  {available.map(b => {
                    const name = (lang === "pt" ? b.name_pt : b.name_en) || b.name_pt;
                    const desc = b.description || `${name}`;
                    const selected = biaToLink === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBiaToLink(b.id)}
                        className={`w-full text-left rounded-md border p-3 transition-colors ${
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                            : "border-border bg-background hover:bg-accent"
                        }`}
                      >
                        <div className="font-medium text-sm text-foreground">{name}</div>
                        {desc && desc !== name && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <Button onClick={async () => {
                  if (!linkBiaDialogCard || !biaToLink) return;
                  try {
                    await linkBIA.mutateAsync({ action_card_id: linkBiaDialogCard, bia_process_id: biaToLink });
                    const targetCard = cards.find(c => c.id === linkBiaDialogCard);
                    const bia = biaProcesses.find(b => b.id === biaToLink);
                    if (targetCard && bia?.dr_type_id && !(targetCard as any).dr_type_id) {
                      await updateCard.mutateAsync({
                        id: targetCard.id,
                        title_pt: targetCard.title_pt,
                        title_en: targetCard.title_en,
                        severity: targetCard.severity,
                        capability: targetCard.capability || undefined,
                        recurso_id: targetCard.recurso_id || undefined,
                        cenario_id: targetCard.cenario_id || undefined,
                        department_id: targetCard.department_id || undefined,
                        dr_type_id: bia.dr_type_id,
                      });
                    }
                    setBiaToLink("");
                    toast({ title: lang === "pt" ? "BIA associada" : "BIA linked" });
                  } catch (err: any) {
                    toast({ title: "Erro", description: err.message, variant: "destructive" });
                  }
                }} disabled={!biaToLink || linkBIA.isPending} className="w-full">
                  {linkBIA.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {lang === "pt" ? "Associar" : "Link"}
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* BIA detail dialog */}
      <Dialog open={!!biaDetailId} onOpenChange={(o) => !o && setBiaDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{lang === "pt" ? "Detalhe da BIA" : "BIA Detail"}</DialogTitle>
          </DialogHeader>
          {biaDetailId && (() => {
            const bia = biaProcesses.find(b => b.id === biaDetailId);
            if (!bia) return null;
            const name = (lang === "pt" ? bia.name_pt : bia.name_en) || bia.name_pt;
            const dr = drTypes.find(d => d.id === bia.dr_type_id);
            const dept = departments.find(d => d.id === bia.department_id);
            const bp = businessProcesses.find(b => b.id === bia.business_process_id);
            const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
              <div className="flex items-start gap-3 py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs uppercase tracking-wide text-muted-foreground w-40 shrink-0">{label}</span>
                <span className="text-sm text-foreground flex-1 min-w-0 break-words">{value || "—"}</span>
              </div>
            );
            return (
              <div className="space-y-3">
                <div>
                  <p className="text-base font-bold leading-tight">{name}</p>
                  {bia.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{bia.description}</p>}
                </div>
                <div className="rounded-md border border-border p-3 bg-secondary/30">
                  <Row label={lang === "pt" ? "Criticidade" : "Criticality"} value={bia.criticality} />
                  <Row label="RTO / RPO" value={`${bia.rto}h / ${bia.rpo}h`} />
                  <Row label={lang === "pt" ? "Tipo de DR" : "DR Type"} value={dr ? `${dr.code} — ${dr.label} (RTO ${dr.rto}h / RPO ${dr.rpo}h)` : null} />
                  <Row label={lang === "pt" ? "Departamento" : "Department"} value={dept?.name} />
                  <Row label={lang === "pt" ? "Tipo de Função" : "Function Type"} value={bp?.tipo_funcao} />
                  <Row label={lang === "pt" ? "Função" : "Function"} value={bp?.funcao} />
                  <Row label={lang === "pt" ? "Macro Processo" : "Macro Process"} value={bp?.macro_processo} />
                  <Row label={lang === "pt" ? "Processo" : "Process"} value={bp?.processo} />
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Action Card detail drawer */}
      <Dialog open={!!selectedCardId} onOpenChange={(o) => !o && setSelectedCardId(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 flex flex-col gap-0 bg-slate-50 overflow-hidden">
          {selectedCardId && (() => {
            const card = cards.find(c => c.id === selectedCardId);
            if (!card) return null;
            const title = lang === "pt" ? card.title_pt : card.title_en;
            const severity = severityLabels[card.severity];
            const items = allItems.filter(i => i.action_card_id === card.id);
            const done = items.filter(i => statesMap[i.id]).length;
            const total = items.length;
            const deptLabel = getDeptLabel(card);
            const recLabel = getRecursoLabel(card);
            const cLabel = getCenarioLabel(card);
            const linkedBias = biaACLinks.filter(l => l.action_card_id === card.id);
            const sevChip =
              card.severity === "critical" ? "bg-red-600 text-white" :
              card.severity === "high" ? "bg-amber-500 text-white" :
              "bg-yellow-400 text-slate-900";

            return (
              <>
                {/* Header (slate-900) */}
                <div className="bg-slate-900 text-slate-50 px-5 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/10 text-slate-100 uppercase tracking-wider">
                        AC · {card.id.slice(0, 8)}
                      </span>
                      <Badge className={`text-[10px] uppercase tracking-wide ${sevChip} hover:${sevChip}`}>
                        {severity ? (lang === "pt" ? severity.pt : severity.en) : card.severity}
                      </Badge>
                    </div>
                    <button
                      onClick={() => setSelectedCardId(null)}
                      className="text-slate-300 hover:text-white p-1 rounded transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight leading-tight">{title}</h2>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-300 font-semibold uppercase tracking-wider">
                    {deptLabel && <span>{deptLabel}</span>}
                    {recLabel && <span>· {recLabel}</span>}
                    {cLabel && <span>· {cLabel}</span>}
                    {getDRLabel(card) && <span>· DR: {getDRLabel(card)}</span>}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => openEdit(card)}>
                      <Pencil className="h-3 w-3 mr-1" />{lang === "pt" ? "Editar" : "Edit"}
                    </Button>
                    <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => handleDuplicate(card)}>
                      <Copy className="h-3 w-3 mr-1" />{lang === "pt" ? "Duplicar" : "Duplicate"}
                    </Button>
                    <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => { setLinkBiaDialogCard(card.id); setBiaToLink(""); }}>
                      <Plus className="h-3 w-3 mr-1" />BIA
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs ml-auto" onClick={() => { handleDelete(card.id); setSelectedCardId(null); }}>
                      <Trash2 className="h-3 w-3 mr-1" />{lang === "pt" ? "Eliminar" : "Delete"}
                    </Button>
                  </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1">
                  <div className="p-5 space-y-5">
                    {/* Linked BIAs */}
                    {linkedBias.length > 0 && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                          {lang === "pt" ? "BIAs Associadas" : "Linked BIAs"} ({linkedBias.length})
                        </p>
                        <div className="space-y-2">
                          {linkedBias.map(link => {
                            const bia = biaProcesses.find(b => b.id === link.bia_process_id);
                            if (!bia) return null;
                            const biaName = lang === "pt" ? bia.name_pt : (bia.name_en || bia.name_pt);
                            const desc = bia.description && bia.description.trim().length > 0
                              ? bia.description
                              : biaName;
                            return (
                              <div key={link.id} className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 flex items-start gap-2">
                                <button
                                  type="button"
                                  onClick={() => setBiaDetailId(bia.id)}
                                  className="flex-1 min-w-0 text-left group"
                                  title={lang === "pt" ? "Ver detalhe da BIA" : "View BIA detail"}
                                >
                                  <p className="text-sm font-bold text-blue-800 leading-tight group-hover:underline">{biaName}</p>
                                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{desc}</p>
                                </button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive shrink-0"
                                  disabled={unlinkBIA.isPending}
                                  onClick={async () => {
                                    const msg = lang === "pt"
                                      ? `Eliminar associação da BIA "${biaName}" a este Action Card?`
                                      : `Remove BIA "${biaName}" link from this Action Card?`;
                                    if (!window.confirm(msg)) return;
                                    try {
                                      await unlinkBIA.mutateAsync(link.id);
                                      toast({ title: lang === "pt" ? "Associação eliminada" : "Link removed" });
                                    } catch (err: any) {
                                      toast({ title: "Erro", description: err.message, variant: "destructive" });
                                    }
                                  }}
                                  title={lang === "pt" ? "Eliminar associação" : "Remove link"}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Checklist */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                        {lang === "pt" ? "Ações" : "Actions"} ({done}/{total})
                      </p>

                      <div className="space-y-2">
                        {items.map((item, idx) => {
                          const checked = !!statesMap[item.id];
                          const text = lang === "pt" ? item.text_pt : item.text_en;
                          return (
                            <div key={item.id} className={`flex items-start gap-2 p-2.5 rounded-lg border group transition-colors ${checked ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
                              <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 rounded px-1.5 py-0.5 mt-0.5 w-7 text-center shrink-0">{idx + 1}</span>
                              {editingItemId === item.id ? (
                                <Textarea
                                  autoFocus
                                  value={editingItemText}
                                  onChange={(e) => setEditingItemText(e.target.value)}
                                  onBlur={() => commitEditItem(item.id, text)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commitEditItem(item.id, text); }
                                    else if (e.key === "Escape") { e.preventDefault(); cancelEditItem(); }
                                  }}
                                  rows={3}
                                  className="min-h-[72px] text-sm flex-1 bg-white border-slate-300 resize-y"
                                />
                              ) : (
                                <label className={`flex items-start gap-2 flex-1 min-w-0 ${canCheck ? "cursor-pointer" : "cursor-default opacity-70"}`}>
                                  <Checkbox checked={checked} onCheckedChange={() => handleToggleCheck(item.id, !checked, text, card.id)} className="mt-0.5" disabled={!canCheck} />
                                  <span className={`text-sm whitespace-pre-wrap ${checked ? "text-slate-500" : "text-slate-800"}`}>{text}</span>
                                </label>
                              )}
                              {editingItemId !== item.id && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => {
                                    const prev = items[idx - 1];
                                    if (!prev) return;
                                    reorderItems.mutate([
                                      { id: item.id, sort_order: prev.sort_order },
                                      { id: prev.id, sort_order: item.sort_order },
                                    ]);
                                  }}><ArrowUp className="h-3 w-3" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === items.length - 1} onClick={() => {
                                    const next = items[idx + 1];
                                    if (!next) return;
                                    reorderItems.mutate([
                                      { id: item.id, sort_order: next.sort_order },
                                      { id: next.id, sort_order: item.sort_order },
                                    ]);
                                  }}><ArrowDown className="h-3 w-3" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditItem(item.id, text)}><Pencil className="h-3 w-3" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {items.length === 0 && (
                          <p className="text-xs text-slate-500 italic px-2 py-3 text-center">
                            {lang === "pt" ? "Sem ações ainda. Adiciona a primeira abaixo." : "No actions yet. Add the first below."}
                          </p>
                        )}
                      </div>

                      {/* Add new action */}
                      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-slate-200">
                        <Textarea
                          value={newItemText[card.id] || ""}
                          onChange={(e) => setNewItemText(prev => ({ ...prev, [card.id]: e.target.value }))}
                          placeholder={lang === "pt" ? "Nova ação..." : "New action..."}
                          rows={3}
                          className="min-h-[72px] text-sm bg-white border-slate-300 resize-y flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddItem(card.id)} disabled={!newItemText[card.id]?.trim()} className="mt-1">
                          <Plus className="h-4 w-4 mr-1" />{lang === "pt" ? "Adicionar" : "Add"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span className="font-semibold uppercase tracking-wider">{lang === "pt" ? "Progresso" : "Progress"}</span>
                      <span className="font-mono">{done}/{total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  {!canCheck && (
                    <span className="text-[10px] text-amber-600 font-semibold uppercase max-w-[140px] leading-tight">
                      {lang === "pt" ? "Checklist bloqueado" : "Checklist locked"}
                    </span>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencySection;
