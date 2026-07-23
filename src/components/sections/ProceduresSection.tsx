import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, Copy, GripVertical, X,
  Wrench, AlertTriangle, CheckCircle2, ShieldCheck, User, Settings, ArrowRight,
} from "lucide-react";
import { useProcedures, useCreateProcedure, useUpdateProcedure, useDeleteProcedure, DBProcedure, ProcedurePhase } from "@/hooks/useProcedures";
import { toast } from "sonner";

const PHASES: { key: ProcedurePhase; label_pt: string; label_en: string; tint: string; ring: string; icon: React.FC<{ className?: string }> }[] = [
  { key: "preparacao", label_pt: "PREPARAÇÃO", label_en: "PREPARATION", tint: "border-blue-400/60 bg-blue-50/40", ring: "ring-blue-500", icon: Wrench },
  { key: "gestao", label_pt: "GESTÃO DA CRISE", label_en: "CRISIS MANAGEMENT", tint: "border-amber-400/60 bg-amber-50/40", ring: "ring-amber-500", icon: AlertTriangle },
  { key: "fim", label_pt: "FIM DA CRISE", label_en: "END OF CRISIS", tint: "border-emerald-400/60 bg-emerald-50/40", ring: "ring-emerald-500", icon: CheckCircle2 },
];

function parseProcedure(md: string): { description: string; actions: string[]; goldenRule?: string } {
  const lines = md.split("\n");
  const descParts: string[] = [];
  const actions: string[] = [];
  let goldenRule: string | undefined;
  let mode: "desc" | "actions" | "golden" = "desc";

  for (const raw of lines) {
    const line = raw.trimEnd();
    const lower = line.toLowerCase();
    if (/^#{2,3}\s/.test(line) && (lower.includes("regra de ouro") || lower.includes("golden rule"))) {
      mode = "golden";
      continue;
    }
    if (/^#{2,3}\s/.test(line)) {
      // section header — if we already have actions, keep mode; otherwise it's a description-ish header
      if (actions.length > 0) mode = "actions";
      continue;
    }
    const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (bullet) {
      mode = "actions";
      let text = bullet[1];
      // strip leading bold label "**X**:" duplication
      text = text.replace(/^\*\*(.+?)\*\*:?\s*/, "$1: ").replace(/^:\s*/, "");
      actions.push(text.trim());
      continue;
    }
    if (line.trim() === "") continue;
    if (mode === "desc") descParts.push(line);
    else if (mode === "golden") goldenRule = (goldenRule ? goldenRule + " " : "") + line;
  }

  return {
    description: descParts.join(" ").trim(),
    actions,
    goldenRule: goldenRule?.trim(),
  };
}

const ProceduresSection: React.FC = () => {
  const { lang, searchQuery } = useApp();
  const { data: procedures = [], isLoading } = useProcedures();
  const createMut = useCreateProcedure();
  const updateMut = useUpdateProcedure();
  const deleteMut = useDeleteProcedure();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBProcedure | null>(null);
  const [form, setForm] = useState<{ title_pt: string; title_en: string; category_pt: string; category_en: string; content_pt: string; content_en: string; phase: ProcedurePhase }>({ title_pt: "", title_en: "", category_pt: "", category_en: "", content_pt: "", content_en: "", phase: "gestao" });
  const [selectedPhase, setSelectedPhase] = useState<ProcedurePhase>("gestao");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [localChecks, setLocalChecks] = useState<Record<string, boolean>>({});

  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);

  const filtered = procedures.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t(p.title_pt, p.title_en).toLowerCase().includes(q) || t(p.content_pt, p.content_en).toLowerCase().includes(q);
  });

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

  const handleCardDrop = async (phase: ProcedurePhase, targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain");
    if (!id || id === targetId) return;
    await reorderInPhase(phase, id, targetId);
  };

  const handleListDrop = async (phase: ProcedurePhase, e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    await reorderInPhase(phase, id, null);
  };

  const phaseIndex = (key: ProcedurePhase) => PHASES.findIndex(p => p.key === key);
  const codeFor = (phase: ProcedurePhase, idx: number) => {
    const prefix = phase === "preparacao" ? "AC_PRP" : phase === "fim" ? "AC_END" : "AC_GCC";
    return `${prefix}_${String(idx + 1).padStart(2, "0")}`;
  };

  const itemsByPhase = useMemo(() => {
    const map: Record<ProcedurePhase, DBProcedure[]> = { preparacao: [], gestao: [], fim: [] };
    filtered.forEach(p => { map[p.phase ?? "gestao"].push(p); });
    return map;
  }, [filtered]);

  const detail = detailId ? procedures.find(p => p.id === detailId) : null;
  const detailPhase = detail ? (detail.phase ?? "gestao") : "gestao";
  const detailIdx = detail ? itemsByPhase[detailPhase].findIndex(p => p.id === detail.id) : -1;
  const parsed = detail ? parseProcedure(t(detail.content_pt, detail.content_en)) : null;

  if (isLoading) return <div className="text-sm text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</div>;

  const currentPhaseItems = itemsByPhase[selectedPhase];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Action Cards Gestão de Crise" : "Crisis Action Cards"}
        </h2>
        <Button size="sm" variant="outline" onClick={() => openNew(selectedPhase)}>
          <Plus className="h-4 w-4 mr-1" /> {lang === "pt" ? "Novo" : "New"}
        </Button>
      </div>

      {/* Top phase tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PHASES.map((ph, i) => {
          const Icon = ph.icon;
          const count = itemsByPhase[ph.key].length;
          const active = selectedPhase === ph.key;
          return (
            <button
              key={ph.key}
              onClick={() => setSelectedPhase(ph.key)}
              className={`text-left rounded-lg border-2 p-3 transition-all flex items-center gap-3 ${ph.tint} ${active ? `ring-2 ${ph.ring} shadow-sm` : "opacity-70 hover:opacity-100"}`}
            >
              <div className={`h-10 w-10 rounded-md flex items-center justify-center bg-background/70 border border-border shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  {lang === "pt" ? `FASE 0${i + 1}` : `PHASE 0${i + 1}`}{active ? (lang === "pt" ? " (ATIVA)" : " (ACTIVE)") : ""}
                </div>
                <div className="text-sm font-bold tracking-wide truncate">{t(ph.label_pt, ph.label_en)}</div>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {count} {count === 1 ? "Card" : "Cards"}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Grid header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {t(PHASES[phaseIndex(selectedPhase)].label_pt, PHASES[phaseIndex(selectedPhase)].label_en)}
          <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
        </div>
        <div className="text-xs text-muted-foreground italic">
          {lang === "pt" ? "Clique num cartão para abrir a vista operacional completa" : "Click a card to open the full operational view"}
        </div>
      </div>

      {/* Cards grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[200px]"
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleListDrop(selectedPhase, e)}
      >
        {currentPhaseItems.map((proc, idx) => {
          const parsedCard = parseProcedure(t(proc.content_pt, proc.content_en));
          const code = codeFor(selectedPhase, idx);
          return (
            <Card
              key={proc.id}
              draggable
              onDragStart={e => { e.dataTransfer.setData("text/plain", proc.id); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => handleCardDrop(selectedPhase, proc.id, e)}
              onClick={() => setDetailId(proc.id)}
              className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all relative"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 border-primary/30 text-primary">
                    {code}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Settings className="h-3 w-3" />
                      {parsedCard.actions.length} {lang === "pt" ? "Passos" : "Steps"}
                    </Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <Button size="icon" variant="ghost" className="h-6 w-6" title={lang === "pt" ? "Clonar" : "Clone"} onClick={e => { e.stopPropagation(); handleClone(proc); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={e => { e.stopPropagation(); openEdit(proc); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); handleDelete(proc.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-move" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-base font-bold uppercase tracking-wide leading-tight">
                  {t(proc.title_pt, proc.title_en)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {parsedCard.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{parsedCard.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{t(proc.category_pt, proc.category_en) || "—"}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                    {lang === "pt" ? "Ver Card" : "View Card"} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {currentPhaseItems.length === 0 && (
          <div className="col-span-full text-center text-xs text-muted-foreground py-10 italic border-2 border-dashed border-border rounded-lg">
            {lang === "pt" ? "Sem action cards nesta fase" : "No action cards in this phase"}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
          {detail && parsed && (() => {
            const ph = PHASES[phaseIndex(detailPhase)];
            const code = codeFor(detailPhase, detailIdx);
            return (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 border-primary/30 text-primary">{code}</Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{t(ph.label_pt, ph.label_en)}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDetailId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wide leading-tight">
                    {t(detail.title_pt, detail.title_en)}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Authority */}
                  {(detail.category_pt || detail.category_en) && (
                    <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          {lang === "pt" ? "Autoridade / Nível Requerido" : "Authority / Required Level"}
                        </div>
                        <div className="text-sm font-bold text-primary truncate">
                          {t(detail.category_pt, detail.category_en)}
                        </div>
                      </div>
                      <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    </div>
                  )}

                  {/* Description */}
                  {parsed.description && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        {lang === "pt" ? "Descrição & Objetivo" : "Description & Objective"}
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
                        {parsed.description}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {parsed.actions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {lang === "pt" ? "Ações Sequenciais (Heurísticas)" : "Sequential Actions (Heuristics)"}
                        </div>
                        <span className="text-[10px] font-mono text-primary">
                          {lang === "pt" ? "Modo Operacional" : "Operational Mode"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {parsed.actions.map((action, i) => {
                          const key = `${detail.id}:${i}`;
                          const checked = !!localChecks[key];
                          return (
                            <label
                              key={i}
                              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${checked ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-muted/40"}`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => setLocalChecks(s => ({ ...s, [key]: !!v }))}
                                className="mt-0.5"
                              />
                              <span className="text-sm leading-relaxed">
                                <span className="font-semibold mr-1">{i + 1}.</span>
                                {action}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Golden rule */}
                  {parsed.goldenRule && (
                    <div className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          {lang === "pt" ? "Regra de Ouro Antifrágil" : "Antifragile Golden Rule"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{parsed.goldenRule}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(t(detail.content_pt, detail.content_en));
                      toast.success(lang === "pt" ? "Copiado" : "Copied");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1.5" />
                    {lang === "pt" ? "Copiar" : "Copy"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { openEdit(detail); }}>
                      <Pencil className="h-4 w-4 mr-1.5" />
                      {lang === "pt" ? "Editar" : "Edit"}
                    </Button>
                    <Button size="sm" onClick={() => setDetailId(null)}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      {lang === "pt" ? "Concluído" : "Done"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* CRUD Dialog */}
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
