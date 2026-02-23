import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react";
import { useProcedures, useCreateProcedure, useUpdateProcedure, useDeleteProcedure, DBProcedure } from "@/hooks/useProcedures";
import { toast } from "sonner";

const ProceduresSection: React.FC = () => {
  const { lang, searchQuery } = useApp();
  const { data: procedures = [], isLoading } = useProcedures();
  const createMut = useCreateProcedure();
  const updateMut = useUpdateProcedure();
  const deleteMut = useDeleteProcedure();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBProcedure | null>(null);
  const [form, setForm] = useState({ title_pt: "", title_en: "", category_pt: "", category_en: "", content_pt: "", content_en: "" });

  const t = (pt: string, en: string) => lang === "pt" ? pt : en;

  const filtered = procedures.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const title = t(p.title_pt, p.title_en).toLowerCase();
    const content = t(p.content_pt, p.content_en).toLowerCase();
    return title.includes(q) || content.includes(q);
  });

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const openNew = () => {
    setEditing(null);
    setForm({ title_pt: "", title_en: "", category_pt: "", category_en: "", content_pt: "", content_en: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: DBProcedure) => {
    setEditing(p);
    setForm({ title_pt: p.title_pt, title_en: p.title_en, category_pt: p.category_pt, category_en: p.category_en, content_pt: p.content_pt, content_en: p.content_en });
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

  const renderMd = (md: string) => {
    return md.split("\n").map((line, i) => {
      if (line.startsWith("### ")) return <h4 key={i} className="font-bold text-sm mt-3 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-base mt-4 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) return <li key={i} className="ml-4 text-sm"><strong>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}</li>;
      }
      if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm list-disc">{line.slice(2)}</li>;
      if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 text-sm list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-sm">{line}</p>;
    });
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Procedimentos Críticos" : "Critical Procedures"}
        </h2>
        <Button size="sm" variant="outline" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> {lang === "pt" ? "Novo" : "New"}
        </Button>
      </div>

      {filtered.map(proc => (
        <Card key={proc.id}>
          <CardHeader className="p-3 cursor-pointer" onClick={() => toggle(proc.id)}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm">{t(proc.title_pt, proc.title_en)}</CardTitle>
                <p className="text-xs text-muted-foreground">{t(proc.category_pt, proc.category_en)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEdit(proc); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); handleDelete(proc.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                {expanded[proc.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
          {expanded[proc.id] && (
            <CardContent className="p-3 pt-0 border-t border-border">
              {renderMd(t(proc.content_pt, proc.content_en))}
            </CardContent>
          )}
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? (lang === "pt" ? "Editar Procedimento" : "Edit Procedure") : (lang === "pt" ? "Novo Procedimento" : "New Procedure")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Título (PT)</Label><Input value={form.title_pt} onChange={e => setForm(f => ({ ...f, title_pt: e.target.value }))} /></div>
              <div><Label>Title (EN)</Label><Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Categoria (PT)</Label><Input value={form.category_pt} onChange={e => setForm(f => ({ ...f, category_pt: e.target.value }))} /></div>
              <div><Label>Category (EN)</Label><Input value={form.category_en} onChange={e => setForm(f => ({ ...f, category_en: e.target.value }))} /></div>
            </div>
            <div><Label>Conteúdo (PT) — Markdown</Label><Textarea rows={8} value={form.content_pt} onChange={e => setForm(f => ({ ...f, content_pt: e.target.value }))} /></div>
            <div><Label>Content (EN) — Markdown</Label><Textarea rows={8} value={form.content_en} onChange={e => setForm(f => ({ ...f, content_en: e.target.value }))} /></div>
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
