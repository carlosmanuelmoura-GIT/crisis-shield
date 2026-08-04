import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Shield, FlaskConical, FileText, AlertCircle, X, Download } from "lucide-react";
import { generateCrisisLogPDF } from "@/lib/generateCrisisLogPDF";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  useDecisionLog, useCreateDecisionLog, useUpdateDecisionLog, useDeleteDecisionLog,
  type DBDecisionLog,
} from "@/hooks/useDecisionLog";
import { useCrises, type DBCrisis } from "@/hooks/useCrises";
import { useToast } from "@/hooks/use-toast";

interface CrisisGroup {
  key: string;
  crisis: DBCrisis | null;
  entries: DBDecisionLog[];
}

const ALL = "__all__";

const DecisionLogSection: React.FC = () => {
  const { lang, crisisStartTime } = useApp();
  const { data: entries = [], isLoading } = useDecisionLog();
  const { data: crises = [] } = useCrises();
  const createEntry = useCreateDecisionLog();
  const updateEntry = useUpdateDecisionLog();
  const deleteEntry = useDeleteDecisionLog();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", text: "", author: "" });
  const [yearFilter, setYearFilter] = useState<string>(ALL);
  const [monthFilter, setMonthFilter] = useState<string>(ALL);

  const activeCrisis = useMemo(() => {
    return crises.find(c =>
      (c.status === "crise_em_curso" || c.status === "em_alerta" || c.status === "retorno") &&
      (c.crisis_type === "real" || c.crisis_type === "simulated")
    );
  }, [crises]);

  const groups = useMemo((): CrisisGroup[] => {
    const crisesMap = new Map(crises.map(c => [c.id, c]));
    const byCrisis = new Map<string, DBDecisionLog[]>();

    entries.forEach(e => {
      const cId = (e as any).crisis_id;
      if (cId && crisesMap.has(cId)) {
        const crisis = crisesMap.get(cId)!;
        if (crisis.crisis_type === "real" || crisis.crisis_type === "simulated") {
          if (!byCrisis.has(cId)) byCrisis.set(cId, []);
          byCrisis.get(cId)!.push(e);
        }
      }
    });

    const sortedKeys = Array.from(byCrisis.keys()).sort((a, b) => {
      const ca = crisesMap.get(a);
      const cb = crisesMap.get(b);
      return new Date(cb?.crisis_date || 0).getTime() - new Date(ca?.crisis_date || 0).getTime();
    });

    return sortedKeys.map(key => ({
      key,
      crisis: crisesMap.get(key) || null,
      entries: byCrisis.get(key)!.slice().sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    }));
  }, [entries, crises]);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    groups.forEach(g => {
      if (g.crisis?.crisis_date) set.add(new Date(g.crisis.crisis_date).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (yearFilter === ALL) return groups;
    return groups.filter(g => {
      if (!g.crisis?.crisis_date) return false;
      const d = new Date(g.crisis.crisis_date);
      if (d.getFullYear() !== Number(yearFilter)) return false;
      if (monthFilter !== ALL && d.getMonth() !== Number(monthFilter)) return false;
      return true;
    });
  }, [groups, yearFilter, monthFilter]);

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
          crisis_id: activeCrisis?.id || null,
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
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const STATUS_LABELS: Record<string, { pt: string; en: string }> = {
    registada: { pt: "Registada", en: "Registered" },
    em_alerta: { pt: "Em Alerta", en: "Alert" },
    crise_em_curso: { pt: "Em Curso", en: "In Progress" },
    retorno: { pt: "Retorno", en: "Return" },
    fim: { pt: "Terminada", en: "Ended" },
  };

  const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const months = lang === "pt" ? MONTHS_PT : MONTHS_EN;

  const hasFilter = yearFilter !== ALL || monthFilter !== ALL;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider">
            {lang === "pt" ? "Log das Acções Gestão Crise" : "Action Log"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "pt"
              ? "Lista de crises — mais recente primeiro"
              : "List of crises — most recent first"}
          </p>
        </div>
        {activeCrisis && (
          <Button size="sm" onClick={openCreate} className="h-9 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {lang === "pt" ? "Nova Acção" : "New Action"}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-end gap-2 flex-wrap">
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {lang === "pt" ? "Ano" : "Year"}
          </Label>
          <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); if (v === ALL) setMonthFilter(ALL); }}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{lang === "pt" ? "Todos" : "All"}</SelectItem>
              {availableYears.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {lang === "pt" ? "Mês" : "Month"}
          </Label>
          <Select value={monthFilter} onValueChange={setMonthFilter} disabled={yearFilter === ALL}>
            <SelectTrigger className="h-9 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{lang === "pt" ? "Todos" : "All"}</SelectItem>
              {months.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={() => { setYearFilter(ALL); setMonthFilter(ALL); }} className="h-9 text-xs gap-1">
            <X className="h-3.5 w-3.5" />
            {lang === "pt" ? "Limpar" : "Clear"}
          </Button>
        )}
        <div className="ml-auto text-xs text-muted-foreground">
          {filteredGroups.length} {lang === "pt" ? "crises" : "crises"}
        </div>
      </div>

      {/* Empty state */}
      {filteredGroups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              {hasFilter
                ? (lang === "pt" ? "Sem crises no período seleccionado" : "No crises in the selected period")
                : (lang === "pt" ? "Sem registos de crises" : "No crisis records")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Accordion list — crises DESC, entries ASC */}
      {filteredGroups.length > 0 && (
        <Accordion type="multiple" defaultValue={activeCrisis ? [activeCrisis.id] : []} className="space-y-2">
          {filteredGroups.map(group => {
            const crisis = group.crisis;
            const isActive = activeCrisis?.id === group.key;
            const isSimulated = crisis?.crisis_type === "simulated";
            const isSystemEntry = (e: DBDecisionLog) =>
              e.title === "" && (e.text.startsWith("🚨") || e.text.startsWith("✅") || e.text.startsWith("📋"));

            return (
              <AccordionItem key={group.key} value={group.key} className={`border rounded-lg bg-card ${isActive ? "border-crisis/40 shadow-sm" : ""}`}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2 flex-wrap flex-1 text-left">
                    {isSimulated ? <FlaskConical className="h-4 w-4 text-alert shrink-0" /> : <Shield className="h-4 w-4 text-crisis shrink-0" />}
                    <span className="text-sm font-semibold">{crisis?.title || (lang === "pt" ? "Crise" : "Crisis")}</span>
                    {crisis && (
                      <span className="text-[10px] text-muted-foreground">{formatCrisisDate(crisis.crisis_date)}</span>
                    )}
                    <Badge variant={isSimulated ? "secondary" : "destructive"} className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                      {isSimulated ? (lang === "pt" ? "Simulada" : "Simulated") : (lang === "pt" ? "Real" : "Real")}
                    </Badge>
                    {crisis && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        {STATUS_LABELS[crisis.status]?.[lang] || crisis.status}
                      </Badge>
                    )}
                    {isActive && (
                      <Badge variant="destructive" className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                        {lang === "pt" ? "Ativa" : "Active"}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-auto mr-2">
                      {group.entries.length} {lang === "pt" ? "acções" : "actions"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {group.entries.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        {lang === "pt" ? "Sem acções registadas." : "No actions logged."}
                      </p>
                    )}

                    {group.entries.map(entry => {
                      if (isSystemEntry(entry)) {
                        return (
                          <div key={entry.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/60 text-xs">
                            <div className="flex flex-col items-center justify-center px-2 py-1 rounded bg-muted/80 min-w-[60px]">
                              <span className="text-[10px] font-bold text-foreground leading-none">
                                {new Date(entry.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", { day: "2-digit", month: "2-digit" })}
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                                {new Date(entry.created_at).toLocaleTimeString(lang === "pt" ? "pt-PT" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <span className="flex-1 font-medium truncate">{entry.text}</span>
                          </div>
                        );
                      }

                      return (
                        <Card key={entry.id} className="bg-secondary/30 border-border/50">
                          <CardContent className="p-2.5">
                            <div className="flex items-start gap-2.5">
                              <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-md bg-muted/70 min-w-[64px] shrink-0">
                                <span className="text-sm font-bold text-foreground leading-tight">
                                  {new Date(entry.created_at).getDate().toString().padStart(2, "0")}
                                </span>
                                <span className="text-[10px] uppercase font-medium text-muted-foreground leading-tight">
                                  {new Date(entry.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", { month: "short" })}
                                </span>
                                <span className="text-[10px] font-semibold text-primary leading-tight">
                                  {new Date(entry.created_at).toLocaleTimeString(lang === "pt" ? "pt-PT" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 space-y-1">
                                {entry.title && (
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="text-xs font-semibold truncate">{entry.title}</span>
                                  </div>
                                )}
                                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                  {entry.text}
                                </p>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <span className="font-medium">{entry.author}</span>
                                </p>
                              </div>
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(entry)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(entry.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

        </Accordion>
      )}


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
