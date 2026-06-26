import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2, Copy, GripVertical } from "lucide-react";
import { useProcedures, useCreateProcedure, useUpdateProcedure, useDeleteProcedure, DBProcedure, ProcedurePhase } from "@/hooks/useProcedures";
import { toast } from "sonner";

const PHASES: { key: ProcedurePhase; label_pt: string; label_en: string; color: string }[] = [
  { key: "preparacao", label_pt: "PREPARAÇÃO", label_en: "PREPARATION", color: "border-blue-400 bg-blue-50/40" },
  { key: "gestao", label_pt: "GESTÃO DA CRISE", label_en: "CRISIS MANAGEMENT", color: "border-amber-400 bg-amber-50/40" },
  { key: "fim", label_pt: "FIM DA CRISE", label_en: "END OF CRISIS", color: "border-emerald-400 bg-emerald-50/40" },
];

const ProceduresSection: React.FC = () => {
  const { lang, searchQuery } = useApp();
  const { data: procedures = [], isLoading } = useProcedures();
  const createMut = useCreateProcedure();
  const updateMut = useUpdateProcedure();
  const deleteMut = useDeleteProcedure();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBProcedure | null>(null);
  const [form, setForm] = useState<{ title_pt: string; title_en: string; category_pt: string; category_en: string; content_pt: string; content_en: string; phase: ProcedurePhase }>({ title_pt: "", title_en: "", category_pt: "", category_en: "", content_pt: "", content_en: "", phase: "gestao" });
  const [dragOver, setDragOver] = useState<ProcedurePhase | null>(null);

  const t = (pt: string, en: string) => lang === "pt" ? pt : en;

  const filtered = procedures.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t(p.title_pt, p.title_en).toLowerCase().includes(q) || t(p.content_pt, p.content_en).toLowerCase().includes(q);
  });

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const openNew = (phase: ProcedurePhase = "gestao") => {
    setEditing(null);
    setForm({ title_pt: "", title_en: "", category_pt: "", category_en: "", content_pt: "", content_en: "", phase });
    setDialogOpen(true);
  };

  const openEdit = (p: DBProcedure) => {
    setEditing(p);
    setForm({ title_pt: p.title_pt, title_en: p.title_en, category_pt: p.category_pt, category_en: p.category_en, content_pt: p.content_pt, content_en: p.content_en, phase: p.phase ?? "gestao" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...form });
        toast.success(lang === "pt" ? "Procedimento atualizado" : "Procedure updated");
      } else {
        await createMut.mutateAsync(form);
        toast.success(lang === "pt" ? "Procedimento criado" : "Procedure created");
      }
      setDialogOpen(false);
    } catch {
      toast.error(lang === "pt" ? "Erro ao guardar" : "Error saving");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success(lang === "pt" ? "Procedimento eliminado" : "Procedure deleted");
    } catch {
      toast.error(lang === "pt" ? "Erro ao eliminar" : "Error deleting");
    }
  };

  const handleClone = async (p: DBProcedure) => {
    try {
      const suffix = lang === "pt" ? " (cópia)" : " (copy)";
      await createMut.mutateAsync({
        title_pt: p.title_pt + suffix,
        title_en: p.title_en + suffix,
        category_pt: p.category_pt,
        category_en: p.category_en,
        content_pt: p.content_pt,
        content_en: p.content_en,
        phase: p.phase ?? "gestao",
      });
      toast.success(lang === "pt" ? "Procedimento clonado" : "Procedure cloned");
    } catch {
      toast.error(lang === "pt" ? "Erro ao clonar" : "Error cloning");
    }
  };

  const reorderInPhase = async (phase: ProcedurePhase, draggedId: string, targetId: string | null) => {
    const items = procedures.filter(p => (p.phase ?? "gestao") === phase && p.id !== draggedId);
    const dragged = procedures.find(p => p.id === draggedId);
    if (!dragged) return;
    const targetIdx = targetId ? items.findIndex(p => p.id === targetId) : items.length;
    const insertAt = targetIdx < 0 ? items.length : targetIdx;
    const newList = [...items.slice(0, insertAt), dragged, ...items.slice(insertAt)];
    try {
      await Promise.all(newList.map((p, i) => {
        const newOrder = (i + 1) * 10;
        if (p.id === draggedId && (dragged.phase !== phase || dragged.sort_order !== newOrder)) {
          return updateMut.mutateAsync({ id: p.id, phase, sort_order: newOrder });
        }
        if (p.sort_order !== newOrder) {
          return updateMut.mutateAsync({ id: p.id, sort_order: newOrder });
        }
        return Promise.resolve();
      }));
    } catch {
      toast.error(lang === "pt" ? "Erro ao reordenar" : "Error reordering");
    }
  };

  const handleColumnDrop = async (phase: ProcedurePhase, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    await reorderInPhase(phase, id, null);
  };

  const handleCardDrop = async (phase: ProcedurePhase, targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id || id === targetId) return;
    await reorderInPhase(phase, id, targetId);
  };

  const renderMd = (md: string) => md.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h4 key={i} className="font-bold text-sm mt-3 mb-1">{line.slice(4)}</h4>;
    if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-base mt-4 mb-1">{line.slice(3)}</h3>;
    if (line.startsWith("- **")) {
      const m = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
      if (m) return <li key={i} className="ml-4 text-sm"><strong>{m[1]}</strong>{m[2] ? `: ${m[2]}` : ""}</li>;
    }
    if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm list-disc">{line.slice(2)}</li>;
    if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 text-sm list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className="text-sm">{line}</p>;
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Procedimentos Críticos Gestão Crise" : "Critical Procedures BCM"}
        </h2>
        <Button size="sm" variant="outline" onClick={() => openNew("gestao")}>
          <Plus className="h-4 w-4 mr-1" /> {lang === "pt" ? "Novo" : "New"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {PHASES.map(ph => {
          const items = filtered.filter(p => (p.phase ?? "gestao") === ph.key);
          return (
            <div
              key={ph.key}
              onDragOver={e => { e.preventDefault(); setDragOver(ph.key); }}
              onDragLeave={() => setDragOver(cur => cur === ph.key ? null : cur)}
              onDrop={e => handleColumnDrop(ph.key, e)}
              className={`rounded-lg border-2 ${ph.color} p-2 min-h-[200px] transition-all ${dragOver === ph.key ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-center justify-between px-1 py-2">
                <h3 className="text-xs font-bold tracking-wider">{t(ph.label_pt, ph.label_en)} <span className="text-muted-foreground">({items.length})</span></h3>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openNew(ph.key)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-2">
                {items.map(proc => (
                  <Card
                    key={proc.id}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData("text/plain", proc.id); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => handleCardDrop(ph.key, proc.id, e)}
                    className="cursor-move"
                  >
                    <CardHeader className="p-2.5">
                      <div className="flex items-start gap-1.5">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 cursor-pointer" onClick={() => toggle(proc.id)}>
                          <CardTitle className="text-xs leading-tight">{t(proc.title_pt, proc.title_en)}</CardTitle>
                          {proc.category_pt && <p className="text-[10px] text-muted-foreground mt-0.5">{t(proc.category_pt, proc.category_en)}</p>}
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button size="icon" variant="ghost" className="h-6 w-6" title={lang === "pt" ? "Clonar" : "Clone"} onClick={e => { e.stopPropagation(); handleClone(proc); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={e => { e.stopPropagation(); openEdit(proc); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); handleDelete(proc.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => toggle(proc.id)}>
                            {expanded[proc.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {expanded[proc.id] && (
                      <CardContent className="p-2.5 pt-0 border-t border-border">
                        {renderMd(t(proc.content_pt, proc.content_en))}
                      </CardContent>
                    )}
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-6 italic">
                    {lang === "pt" ? "Arraste para aqui" : "Drop here"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? (lang === "pt" ? "Editar Procedimento" : "Edit Procedure") : (lang === "pt" ? "Novo Procedimento" : "New Procedure")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{lang === "pt" ? "Fase" : "Phase"}</Label>
              <Select value={form.phase} onValueChange={(v: ProcedurePhase) => setForm(f => ({ ...f, phase: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PHASES.map(p => <SelectItem key={p.key} value={p.key}>{t(p.label_pt, p.label_en)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Título (PT)</Label><Input value={form.title_pt} onChange={e => setForm(f => ({ ...f, title_pt: e.target.value }))} /></div>
              <div><Label>Title (EN)</Label><Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Categoria (PT)</Label><Input value={form.category_pt} onChange={e => setForm(f => ({ ...f, category_pt: e.target.value }))} /></div>
              <div><Label>Category (EN)</Label><Input value={form.category_en} onChange={e => setForm(f => ({ ...f, category_en: e.target.value }))} /></div>
            </div>
            <div><Label>Conteúdo (PT) — Markdown</Label><Textarea rows={14} className="min-h-[200px]" value={form.content_pt} onChange={e => setForm(f => ({ ...f, content_pt: e.target.value }))} /></div>
            <div><Label>Content (EN) — Markdown</Label><Textarea rows={14} className="min-h-[200px]" value={form.content_en} onChange={e => setForm(f => ({ ...f, content_en: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{lang === "pt" ? "Cancelar" : "Cancel"}</Button>
            <Button onClick={handleSave} disabled={!form.title_pt}>{lang === "pt" ? "Guardar" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProceduresSection;
