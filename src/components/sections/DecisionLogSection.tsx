import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  useDecisionLog, useCreateDecisionLog, useUpdateDecisionLog, useDeleteDecisionLog,
} from "@/hooks/useDecisionLog";
import { useToast } from "@/hooks/use-toast";

const DecisionLogSection: React.FC = () => {
  const { lang } = useApp();
  const { data: entries = [], isLoading } = useDecisionLog();
  const createEntry = useCreateDecisionLog();
  const updateEntry = useUpdateDecisionLog();
  const deleteEntry = useDeleteDecisionLog();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ text: "", author: "" });

  // Quick-add
  const [quickText, setQuickText] = useState("");
  const [quickAuthor, setQuickAuthor] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setForm({ text: "", author: "" });
    setDialogOpen(true);
  };

  const openEdit = (entry: typeof entries[0]) => {
    setEditingId(entry.id);
    setForm({ text: entry.text, author: entry.author });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) return;
    try {
      if (editingId) {
        await updateEntry.mutateAsync({ id: editingId, text: form.text.trim(), author: form.author.trim() || (lang === "pt" ? "Anónimo" : "Anonymous") });
        toast({ title: lang === "pt" ? "Atualizado" : "Updated" });
      } else {
        await createEntry.mutateAsync({ text: form.text.trim(), author: form.author.trim() || (lang === "pt" ? "Anónimo" : "Anonymous") });
        toast({ title: lang === "pt" ? "Criado" : "Created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleQuickAdd = async () => {
    if (!quickText.trim()) return;
    try {
      await createEntry.mutateAsync({
        text: quickText.trim(),
        author: quickAuthor.trim() || (lang === "pt" ? "Anónimo" : "Anonymous"),
      });
      setQuickText("");
      toast({ title: lang === "pt" ? "Registado" : "Logged" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry.mutateAsync(id);
      toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
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
          {lang === "pt" ? "Log de Decisões" : "Decision Log"}
        </h2>
        <Button size="sm" onClick={openCreate} className="h-8 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          {lang === "pt" ? "Nova Entrada" : "New Entry"}
        </Button>
      </div>

      {/* Quick add */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <Input
            value={quickAuthor}
            onChange={e => setQuickAuthor(e.target.value)}
            placeholder={lang === "pt" ? "Nome (opcional)" : "Name (optional)"}
            className="text-sm h-8 bg-secondary border-border"
          />
          <div className="flex gap-2">
            <Input
              value={quickText}
              onChange={e => setQuickText(e.target.value)}
              placeholder={lang === "pt" ? "Nota rápida..." : "Quick note..."}
              className="text-sm bg-secondary border-border"
              onKeyDown={e => e.key === "Enter" && handleQuickAdd()}
            />
            <Button onClick={handleQuickAdd} size="icon" className="shrink-0 bg-ok hover:bg-ok/90 text-ok-foreground" disabled={createEntry.isPending}>
              {createEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {lang === "pt" ? "Sem entradas no log." : "No log entries."}
          </p>
        )}
        {entries.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {entry.author} — {new Date(entry.created_at).toLocaleString(lang === "pt" ? "pt-PT" : "en-GB")}
                  </p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? (lang === "pt" ? "Editar Entrada" : "Edit Entry")
                : (lang === "pt" ? "Nova Entrada" : "New Entry")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Autor" : "Author"}</Label>
              <Input
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder={lang === "pt" ? "Nome" : "Name"}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Texto" : "Text"}</Label>
              <Input
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder={lang === "pt" ? "Decisão ou nota..." : "Decision or note..."}
                className="bg-secondary border-border"
              />
            </div>
            <Button onClick={handleSave} disabled={!form.text.trim() || createEntry.isPending || updateEntry.isPending} className="w-full">
              {(createEntry.isPending || updateEntry.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DecisionLogSection;
