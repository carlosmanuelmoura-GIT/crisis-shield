import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, Shield, FlaskConical, Clock, FileText, AlertCircle } from "lucide-react";
import {
  useDecisionLog, useCreateDecisionLog, useUpdateDecisionLog, useDeleteDecisionLog,
  type DBDecisionLog,
} from "@/hooks/useDecisionLog";
import { useToast } from "@/hooks/use-toast";

interface CrisisGroup {
  key: string;
  startedAt: string;
  entries: DBDecisionLog[];
  isSystem: boolean;
}

const DecisionLogSection: React.FC = () => {
  const { lang, crisisActive, crisisStartTime, crisisType } = useApp();
  const { data: entries = [], isLoading } = useDecisionLog();
  const createEntry = useCreateDecisionLog();
  const updateEntry = useUpdateDecisionLog();
  const deleteEntry = useDeleteDecisionLog();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", text: "", author: "" });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group entries by crisis_started_at
  const groups = useMemo((): CrisisGroup[] => {
    const map = new Map<string, DBDecisionLog[]>();
    const ungrouped: DBDecisionLog[] = [];

    entries.forEach(e => {
      if (e.crisis_started_at) {
        const key = e.crisis_started_at;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
      } else {
        ungrouped.push(e);
      }
    });

    const result: CrisisGroup[] = [];

    // Sort crisis groups by start time descending
    const sortedKeys = Array.from(map.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    for (const key of sortedKeys) {
      const groupEntries = map.get(key)!;
      result.push({
        key,
        startedAt: key,
        entries: groupEntries,
        isSystem: false,
      });
    }

    if (ungrouped.length > 0) {
      result.push({
        key: "__ungrouped",
        startedAt: "",
        entries: ungrouped,
        isSystem: true,
      });
    }

    // Auto-expand the current crisis group
    if (crisisStartTime && !expandedGroups.has(crisisStartTime)) {
      setExpandedGroups(prev => new Set([...prev, crisisStartTime]));
    }

    return result;
  }, [entries, crisisStartTime]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", text: "", author: "" });
    setDialogOpen(true);
  };

  const openEdit = (entry: DBDecisionLog) => {
    setEditingId(entry.id);
    setForm({ title: entry.title || "", text: entry.text, author: entry.author });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) return;
    const author = form.author.trim() || (lang === "pt" ? "Anónimo" : "Anonymous");
    try {
      if (editingId) {
        await updateEntry.mutateAsync({ id: editingId, title: form.title.trim(), text: form.text.trim(), author });
        toast({ title: lang === "pt" ? "Atualizado" : "Updated" });
      } else {
        await createEntry.mutateAsync({
          title: form.title.trim(),
          text: form.text.trim(),
          author,
          crisis_started_at: crisisStartTime,
        });
        toast({ title: lang === "pt" ? "Acção registada" : "Action logged" });
      }
      setDialogOpen(false);
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

  const formatCrisisDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider">
            {lang === "pt" ? "Log das Acções" : "Action Log"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "pt"
              ? "Registo cronológico de acções por crise"
              : "Chronological action record by crisis"}
          </p>
        </div>
        {crisisActive && (
          <Button size="sm" onClick={openCreate} className="h-9 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {lang === "pt" ? "Nova Acção" : "New Action"}
          </Button>
        )}
      </div>

      {/* No crisis active message */}
      {!crisisActive && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {lang === "pt"
                  ? "Nenhuma crise ativa"
                  : "No active crisis"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "pt"
                   ? "O registo de acções só está disponível durante uma crise ativa. Declare uma crise para começar a registar."
                   : "Action logging is only available during an active crisis. Declare a crisis to start logging."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crisis groups */}
      {groups.length === 0 && !crisisActive && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {lang === "pt" ? "Sem entradas no log." : "No log entries."}
        </p>
      )}

      {groups.map(group => {
        const isOpen = expandedGroups.has(group.key);
        const isCurrentCrisis = crisisActive && crisisStartTime === group.startedAt;
        const systemEntries = group.entries.filter(e => e.title === "" && (e.text.startsWith("🚨") || e.text.startsWith("✅")));
        const decisionEntries = group.entries.filter(e => !systemEntries.includes(e));

        return (
          <Collapsible key={group.key} open={isOpen} onOpenChange={() => toggleGroup(group.key)}>
            <Card className={isCurrentCrisis ? "border-crisis/40 shadow-sm" : ""}>
              <CollapsibleTrigger asChild>
                <CardHeader className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    
                    {group.isSystem ? (
                      <span className="text-sm font-medium text-muted-foreground">
                        {lang === "pt" ? "Entradas anteriores" : "Previous entries"}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {(() => {
                          const startEntry = group.entries.find(e => e.text.startsWith("🚨"));
                          const isSimulated = startEntry ? startEntry.text.includes("SIMULADA") || startEntry.text.includes("SIMULATED") : false;
                          return (
                            <>
                              {isSimulated ? <FlaskConical className="h-4 w-4 text-alert shrink-0" /> : <Shield className="h-4 w-4 text-crisis shrink-0" />}
                              <span className="text-sm font-semibold truncate">
                                {lang === "pt" ? "Crise" : "Crisis"} — {formatCrisisDate(group.startedAt)}
                              </span>
                              <Badge variant={isSimulated ? "secondary" : "destructive"} className="text-[10px] h-5 px-1.5 uppercase tracking-wider shrink-0">
                                {isSimulated ? (lang === "pt" ? "Simulada" : "Simulated") : (lang === "pt" ? "Real" : "Real")}
                              </Badge>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {isCurrentCrisis && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                          {lang === "pt" ? "Ativa" : "Active"}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        {decisionEntries.length} {lang === "pt" ? "acções" : "actions"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="p-3 pt-0 space-y-2">
                  {/* System entries (crisis declared/ended) */}
                  {systemEntries.map(entry => (
                    <div key={entry.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/60 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="flex-1 font-medium">{entry.text}</span>
                      <span className="text-muted-foreground shrink-0">
                        {new Date(entry.created_at).toLocaleTimeString(lang === "pt" ? "pt-PT" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}

                  {/* Decision entries */}
                  {decisionEntries.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      {lang === "pt" ? "Sem acções registadas nesta crise." : "No actions logged for this crisis."}
                    </p>
                  )}

                  {decisionEntries.map(entry => (
                    <Card key={entry.id} className="bg-secondary/30 border-border/50">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 space-y-1">
                            {entry.title && (
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-sm font-semibold">{entry.title}</span>
                              </div>
                            )}
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {entry.text}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <span className="font-medium">{entry.author}</span>
                              <span>·</span>
                              <span>
                                {new Date(entry.created_at).toLocaleString(lang === "pt" ? "pt-PT" : "en-GB", {
                                  hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
                                })}
                              </span>
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
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {editingId
                ? (lang === "pt" ? "Editar Acção" : "Edit Action")
                : (lang === "pt" ? "Registar Acção" : "Log Action")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {lang === "pt" ? "Autor" : "Author"}
                </Label>
                <Input
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  placeholder={lang === "pt" ? "Nome do autor" : "Author name"}
                  className="bg-secondary border-border h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {lang === "pt" ? "Nome da Acção" : "Action Name"}
                </Label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={lang === "pt" ? "Ex: Ativação do BCP" : "E.g.: BCP Activation"}
                  className="bg-secondary border-border h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {lang === "pt" ? "Nota / Descrição" : "Note / Description"}
              </Label>
              <Textarea
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder={lang === "pt"
                  ? "Descreva a decisão tomada, o contexto e as ações a realizar..."
                  : "Describe the decision, context, and actions to take..."}
                className="bg-secondary border-border min-h-[140px] resize-y text-sm leading-relaxed"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!form.text.trim() || createEntry.isPending || updateEntry.isPending}
              className="w-full h-10"
            >
              {(createEntry.isPending || updateEntry.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId
                ? (lang === "pt" ? "Guardar Alterações" : "Save Changes")
                : (lang === "pt" ? "Registar Acção" : "Log Action")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DecisionLogSection;
