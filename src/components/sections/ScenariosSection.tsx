import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Server, Building2, Users, Truck, MapPin, ShieldAlert,
  Monitor, Home, UserCheck, Network, Zap, Loader2, Copy,
} from "lucide-react";
import {
  useCenarios, useCenarioRecursos, useLinkCenarioRecurso, useUnlinkCenarioRecurso,
} from "@/hooks/useCenarios";
import { useRecursos, useUpdateRecurso, DBRecurso } from "@/hooks/useRecursos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Server, Building2, Users, Truck, MapPin, ShieldAlert,
  Monitor, Home, UserCheck, Network, Zap,
};

const ScenariosSection: React.FC = () => {
  const { lang } = useApp();

  const { data: cenarios, isLoading: loadingC } = useCenarios();
  const { data: recursos, isLoading: loadingR } = useRecursos();
  const { data: links, isLoading: loadingL } = useCenarioRecursos();

  const linkMut = useLinkCenarioRecurso();
  const unlinkMut = useUnlinkCenarioRecurso();
  const updateRecurso = useUpdateRecurso();

  const [dragOver, setDragOver] = useState<string | null>(null);
  const [editing, setEditing] = useState<DBRecurso | null>(null);
  const [form, setForm] = useState({ name_pt: "", name_en: "", description_pt: "", description_en: "", icon: "Monitor" });

  const t = (pt: string, en: string) => (lang === "en" ? en : pt) || pt;

  if (loadingC || loadingR || loadingL) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const openEdit = (rec: DBRecurso) => {
    setEditing(rec);
    setForm({
      name_pt: rec.name_pt || "",
      name_en: rec.name_en || "",
      description_pt: rec.description_pt || "",
      description_en: rec.description_en || "",
      icon: rec.icon || "Monitor",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updateRecurso.mutateAsync({ id: editing.id, ...form });
      toast.success(lang === "pt" ? "Tipo de Falha atualizado" : "Failure Type updated");
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const cloneRecurso = async (rec: DBRecurso, cenarioId: string) => {
    try {
      const suffix = lang === "pt" ? " (cópia)" : " (copy)";
      const { data, error } = await supabase
        .from("recursos")
        .insert({
          name_pt: (rec.name_pt || "") + suffix,
          name_en: (rec.name_en || "") + suffix,
          description_pt: rec.description_pt,
          description_en: rec.description_en,
          icon: rec.icon,
        })
        .select()
        .single();
      if (error) throw error;
      await linkMut.mutateAsync({ cenario_id: cenarioId, recurso_id: (data as any).id });
      toast.success(lang === "pt" ? "Tipo de Falha clonado" : "Failure Type cloned");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDrop = async (targetCenarioId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const recursoId = e.dataTransfer.getData("recurso_id");
    const sourceCenarioId = e.dataTransfer.getData("source_cenario_id");
    if (!recursoId || !sourceCenarioId) return;
    if (sourceCenarioId === targetCenarioId) return;

    // Already linked to target?
    const existsInTarget = (links ?? []).some(l => l.cenario_id === targetCenarioId && l.recurso_id === recursoId);
    const sourceLink = (links ?? []).find(l => l.cenario_id === sourceCenarioId && l.recurso_id === recursoId);

    try {
      if (!existsInTarget) {
        await linkMut.mutateAsync({ cenario_id: targetCenarioId, recurso_id: recursoId });
      }
      if (sourceLink) {
        await unlinkMut.mutateAsync(sourceLink.id);
      }
      toast.success(lang === "pt" ? "Tipo de Falha movido" : "Failure Type moved");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Cenários de Crise" : "Crisis Scenarios"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {lang === "pt"
            ? "Arraste tipos de falha entre cenários · Duplo clique para editar · Botão de cópia para clonar"
            : "Drag failure types between scenarios · Double click to edit · Copy button to clone"}
        </p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={(cenarios ?? []).map(s => s.id)}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {(cenarios ?? []).map(s => {
          const scenarioRecursos = (recursos ?? []).filter(r =>
            (links ?? []).some(l => l.cenario_id === s.id && l.recurso_id === r.id)
          );
          const isOver = dragOver === s.id;

          return (
            <AccordionItem key={s.id} value={s.id} className="border-none">
              <Card
                className={`border-l-4 ${s.color} h-full flex flex-col transition-all ${isOver ? "ring-2 ring-ring shadow-lg" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(s.id); }}
                onDragLeave={() => setDragOver(prev => prev === s.id ? null : prev)}
                onDrop={(e) => handleDrop(s.id, e)}
              >
                <AccordionTrigger className="p-0 border-b bg-muted/20 hover:no-underline">
                  <div className="flex items-center justify-between gap-2 w-full p-4 text-left">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-muted-foreground tracking-widest">
                        {lang === "pt" ? "CENÁRIO" : "SCENARIO"} {s.roman}
                      </p>
                      <p className="text-sm font-semibold leading-snug">
                        {t(s.name_pt, s.name_en)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {scenarioRecursos.length} {lang === "pt" ? "fal." : "fail."}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <CardContent className={`p-3 flex-1 bg-muted/30 min-h-[120px] ${isOver ? "bg-accent/20" : ""}`}>
                    {scenarioRecursos.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        {lang === "pt" ? "Largue aqui um tipo de falha" : "Drop a failure type here"}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {scenarioRecursos.map(rec => {
                          const Icon = iconMap[rec.icon] || Monitor;
                          const otherCenarios = (cenarios ?? []).filter(c =>
                            c.id !== s.id &&
                            (links ?? []).some(l => l.cenario_id === c.id && l.recurso_id === rec.id)
                          );
                          return (
                            <Card
                              key={rec.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("recurso_id", rec.id);
                                e.dataTransfer.setData("source_cenario_id", s.id);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDoubleClick={() => openEdit(rec)}
                              className="border border-border/60 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                              title={lang === "pt" ? "Duplo clique para editar · arraste para mover" : "Double-click to edit · drag to move"}
                            >
                              <CardContent className="p-2.5 flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground shrink-0 sat-keep" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{t(rec.name_pt, rec.name_en)}</p>
                                  {otherCenarios.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {otherCenarios.map(c => (
                                        <Badge key={c.id} variant="secondary" className="text-[9px] px-1 py-0">
                                          {c.roman}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={(e) => { e.stopPropagation(); cloneRecurso(rec, s.id); }}
                                  title={lang === "pt" ? "Clonar tipo de falha" : "Clone failure type"}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{lang === "pt" ? "Editar Tipo de Falha" : "Edit Failure Type"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nome PT</Label>
              <Input value={form.name_pt} onChange={(e) => setForm({ ...form, name_pt: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Nome EN</Label>
              <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Ícone</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              >
                {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Descrição PT</Label>
              <Textarea rows={3} value={form.description_pt} onChange={(e) => setForm({ ...form, description_pt: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Descrição EN</Label>
              <Textarea rows={3} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>{lang === "pt" ? "Cancelar" : "Cancel"}</Button>
            <Button onClick={saveEdit} disabled={updateRecurso.isPending}>{lang === "pt" ? "Guardar" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenariosSection;
