import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChevronDown, ChevronUp,
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

const capabilityLabels: Record<string, { pt: string; en: string; emoji: string }> = {
  digital: { pt: "Capacidade Digital", en: "Digital Capability", emoji: "💻" },
  fisica: { pt: "Presença Física", en: "Physical Presence", emoji: "🏢" },
  rh: { pt: "Recursos Humanos", en: "Human Resources", emoji: "👥" },
  eco: { pt: "Ecossistema", en: "Ecosystem", emoji: "🌐" },
  energia: { pt: "Energética", en: "Energy", emoji: "⚡" },
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

  const filtered = cards.filter(c => {
    const title = lang === "pt" ? c.title_pt : c.title_en;
    return !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Action Cards de Emergência" : "Emergency Action Cards"}
        </h2>
        <Button size="sm" onClick={openCreate} className="h-8 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          {lang === "pt" ? "Novo" : "New"}
        </Button>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {lang === "pt" ? "Nenhum action card encontrado." : "No action cards found."}
        </p>
      )}

      {filtered.map(card => {
        const isOpen = expanded[card.id];
        const items = allItems.filter(i => i.action_card_id === card.id);
        const statesMap = Object.fromEntries(allStates.map(s => [s.checklist_item_id, s.checked]));
        const done = items.filter(i => statesMap[i.id]).length;
        const total = items.length;
        const title = lang === "pt" ? card.title_pt : card.title_en;
        const cap = card.capability ? capabilityLabels[card.capability] : null;
        const bp = card.business_process_id
          ? businessProcesses.find(p => p.id === card.business_process_id)
          : null;

        return (
          <Card key={card.id} className={`border-l-4 ${severityColors[card.severity] || ""}`}>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggle(card.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <span className="text-xs text-muted-foreground">{done}/{total}</span>
                  {bp && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      📋 {lang === "pt" ? bp.name_pt : bp.name_en || bp.name_pt}
                    </Badge>
                  )}
                  {cap && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {cap.emoji} {lang === "pt" ? cap.pt : cap.en}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); openEdit(card); }}
                  >
                    <Pencil className="h-3.5 w-3.5 sat-keep" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5 sat-keep" />
                  </Button>
                  {isOpen ? <ChevronUp className="h-4 w-4 sat-keep" /> : <ChevronDown className="h-4 w-4 sat-keep" />}
                </div>
              </div>
              <div className="w-full h-1 bg-secondary rounded mt-2">
                <div className="h-1 bg-ok rounded transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
              </div>
            </CardHeader>
            {isOpen && (
              <CardContent className="p-3 pt-0 space-y-2">
                {items.map(item => {
                  const checked = !!statesMap[item.id];
                  const text = lang === "pt" ? item.text_pt : item.text_en;
                  return (
                    <div key={item.id} className="flex items-start gap-2 py-1 group">
                      <label className="flex items-start gap-2 cursor-pointer flex-1">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleCheck.mutate({ itemId: item.id, checked: !checked })}
                          className="mt-0.5"
                        />
                        <span className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{text}</span>
                      </label>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => deleteItem.mutate(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
                {/* Add new checklist item */}
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
          <div className="space-y-3">
            <Input
              placeholder={lang === "pt" ? "Título (PT)" : "Title (PT)"}
              value={form.title_pt}
              onChange={(e) => setForm(f => ({ ...f, title_pt: e.target.value }))}
              className="bg-secondary border-border"
            />
            <Input
              placeholder={lang === "pt" ? "Título (EN)" : "Title (EN)"}
              value={form.title_en}
              onChange={(e) => setForm(f => ({ ...f, title_en: e.target.value }))}
              className="bg-secondary border-border"
            />
            <Select value={form.severity} onValueChange={(v) => setForm(f => ({ ...f, severity: v }))}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">{lang === "pt" ? "Crítico" : "Critical"}</SelectItem>
                <SelectItem value="high">{lang === "pt" ? "Alto" : "High"}</SelectItem>
                <SelectItem value="medium">{lang === "pt" ? "Médio" : "Medium"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.business_process_id || "none"} onValueChange={(v) => setForm(f => ({ ...f, business_process_id: v === "none" ? "" : v }))}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder={lang === "pt" ? "Processo de Negócio" : "Business Process"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{lang === "pt" ? "— Nenhum —" : "— None —"}</SelectItem>
                {businessProcesses.map(bp => (
                  <SelectItem key={bp.id} value={bp.id}>
                    {lang === "pt" ? bp.name_pt : bp.name_en || bp.name_pt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
