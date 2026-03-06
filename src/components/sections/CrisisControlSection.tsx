import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUserRoles } from "@/hooks/useUserRoles";
import {
  useCrises, useCreateCrisis, useUpdateCrisis, useDeleteCrisis,
  useCrisisCabinetMembers, useCrisisPhaseActions,
  useCreatePhaseAction, useTogglePhaseAction, useDeletePhaseAction,
  type DBCrisis,
} from "@/hooks/useCrises";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertTriangle, Plus, Trash2, Shield, Loader2,
  CheckCircle2, ArrowDown, Eye, Copy, X,
} from "lucide-react";

const PHASES = [
  { id: "alerta", label: { pt: "ALERTA & CONTENÇÃO", en: "ALERT & CONTAINMENT" }, color: "border-alert bg-alert/10", icon: "🔔" },
  { id: "declaracao", label: { pt: "DECLARAÇÃO DE CRISE", en: "CRISIS DECLARATION" }, color: "border-crisis bg-crisis/10", icon: "🚨" },
  { id: "ativacao", label: { pt: "ATIVAÇÃO & RECUPERAÇÃO", en: "ACTIVATION & RECOVERY" }, color: "border-primary bg-primary/10", icon: "⚡" },
  { id: "retorno-inicio", label: { pt: "INÍCIO DE RETORNO", en: "RETURN START" }, color: "border-accent bg-accent/10", icon: "🔄" },
  { id: "retorno-fim", label: { pt: "RETORNO E FIM DE CRISE", en: "RETURN & END OF CRISIS" }, color: "border-secondary bg-secondary/10", icon: "📋" },
  { id: "fim", label: { pt: "FIM DE CRISE", en: "END OF CRISIS" }, color: "border-green-500 bg-green-500/10", icon: "✅" },
] as const;

const STATUS_MAP: Record<DBCrisis["status"], { pt: string; en: string; variant: string }> = {
  registada: { pt: "REGISTADA", en: "REGISTERED", variant: "bg-muted text-muted-foreground" },
  em_alerta: { pt: "EM ALERTA", en: "ALERT", variant: "bg-alert text-alert-foreground" },
  crise_em_curso: { pt: "CRISE EM CURSO", en: "CRISIS IN PROGRESS", variant: "bg-crisis text-crisis-foreground" },
  retorno: { pt: "RETORNO", en: "RETURN", variant: "bg-accent text-accent-foreground" },
  fim: { pt: "FIM", en: "END", variant: "bg-green-600 text-white" },
};

const CrisisControlSection: React.FC = () => {
  const { lang } = useApp();
  const { data: roles = [] } = useCurrentUserRoles();
  const isSteering = roles.includes("steering_gcn") || roles.includes("especialista_gcn");

  const { data: crises = [], isLoading } = useCrises();
  const createCrisis = useCreateCrisis();
  const updateCrisis = useUpdateCrisis();
  const deleteCrisis = useDeleteCrisis();

  const [selectedCrisisId, setSelectedCrisisId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [cloneFromId, setCloneFromId] = useState<string | null>(null);

  // Create form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 16));
  const [formType, setFormType] = useState<"real" | "simulated">("real");
  const [cabinetMembers, setCabinetMembers] = useState<{ name: string; role: string }[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  const selectedCrisis = crises.find((c) => c.id === selectedCrisisId);

  const resetForm = () => {
    setFormTitle("");
    setFormDate(new Date().toISOString().slice(0, 16));
    setFormType("real");
    setCabinetMembers([]);
    setNewMemberName("");
    setNewMemberRole("");
    setCloneFromId(null);
  };

  const openCreate = (cloneId?: string) => {
    resetForm();
    if (cloneId) {
      const source = crises.find((c) => c.id === cloneId);
      if (source) {
        setFormTitle(`${source.title} (cópia)`);
        setFormType(source.crisis_type as "real" | "simulated");
        setCloneFromId(cloneId);
      }
    }
    setShowCreateDialog(true);
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    await createCrisis.mutateAsync({
      title: formTitle.trim(),
      crisis_date: new Date(formDate).toISOString(),
      crisis_type: formType,
      cabinet_members: cabinetMembers.filter((m) => m.name.trim()),
      clone_from_id: cloneFromId || undefined,
    });
    setShowCreateDialog(false);
    resetForm();
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    setCabinetMembers((prev) => [...prev, { name: newMemberName.trim(), role: newMemberRole.trim() }]);
    setNewMemberName("");
    setNewMemberRole("");
  };

  const removeMember = (idx: number) => {
    setCabinetMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  if (selectedCrisis) {
    return (
      <CrisisKanbanView
        crisis={selectedCrisis}
        lang={lang}
        isSteering={isSteering}
        onBack={() => setSelectedCrisisId(null)}
        onUpdateStatus={(status) => updateCrisis.mutate({ id: selectedCrisis.id, status })}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {lang === "pt" ? "Controlo da Gestão de Crise" : "Crisis Management Control"}
        </h2>
        {isSteering && (
          <Button onClick={() => openCreate()} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {lang === "pt" ? "Nova Crise" : "New Crisis"}
          </Button>
        )}
      </div>

      {/* Crises table */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : crises.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            {lang === "pt" ? "Nenhuma crise registada." : "No crises registered."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === "pt" ? "Data" : "Date"}</TableHead>
                  <TableHead>{lang === "pt" ? "Título" : "Title"}</TableHead>
                  <TableHead>{lang === "pt" ? "Tipo" : "Type"}</TableHead>
                  <TableHead>{lang === "pt" ? "Estado" : "Status"}</TableHead>
                  <TableHead className="text-right">{lang === "pt" ? "Acções" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crises.map((crisis) => {
                  const st = STATUS_MAP[crisis.status];
                  return (
                    <TableRow key={crisis.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCrisisId(crisis.id)}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(crisis.crisis_date).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{crisis.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {crisis.crisis_type === "simulated" ? (lang === "pt" ? "SIMULADA" : "SIMULATED") : "REAL"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${st.variant}`}>{st[lang]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedCrisisId(crisis.id)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {isSteering && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCreate(crisis.id)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCrisis.mutate(crisis.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create crisis dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {cloneFromId
                ? (lang === "pt" ? "Clonar Crise" : "Clone Crisis")
                : (lang === "pt" ? "Registar Nova Crise" : "Register New Crisis")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{lang === "pt" ? "Título" : "Title"}</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder={lang === "pt" ? "Ex: Falha Datacenter Norte" : "Ex: North Datacenter Failure"} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{lang === "pt" ? "Data" : "Date"}</label>
              <Input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{lang === "pt" ? "Tipo" : "Type"}</label>
              <Select value={formType} onValueChange={(v) => setFormType(v as "real" | "simulated")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="real">REAL</SelectItem>
                  <SelectItem value="simulated">{lang === "pt" ? "SIMULADA" : "SIMULATED"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cabinet members */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {lang === "pt" ? "Constituição do Gabinete de Crise" : "Crisis Cabinet Members"}
              </label>
              <div className="space-y-1 mt-1">
                {cabinetMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1">
                    <span className="font-medium">{m.name}</span>
                    {m.role && <span className="text-muted-foreground">— {m.role}</span>}
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => removeMember(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input placeholder={lang === "pt" ? "Nome" : "Name"} value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="h-8 text-xs" />
                <Input placeholder={lang === "pt" ? "Função" : "Role"} value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} className="h-8 text-xs" />
                <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={addMember}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {cloneFromId && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                ℹ️ {lang === "pt" ? "As acções das fases serão copiadas da crise original." : "Phase actions will be copied from the original crisis."}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {lang === "pt" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleCreate} disabled={!formTitle.trim() || createCrisis.isPending}>
              {createCrisis.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {lang === "pt" ? "Registar" : "Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Kanban view for a single crisis
   ────────────────────────────────────────────── */

interface KanbanProps {
  crisis: DBCrisis;
  lang: "pt" | "en";
  isSteering: boolean;
  onBack: () => void;
  onUpdateStatus: (status: DBCrisis["status"]) => void;
}

const CrisisKanbanView: React.FC<KanbanProps> = ({ crisis, lang, isSteering, onBack, onUpdateStatus }) => {
  const { data: phaseActions = [] } = useCrisisPhaseActions(crisis.id);
  const { data: cabinetMembers = [] } = useCrisisCabinetMembers(crisis.id);
  const createAction = useCreatePhaseAction();
  const toggleAction = useTogglePhaseAction();
  const deleteAction = useDeletePhaseAction();

  const [newActionText, setNewActionText] = useState<Record<string, string>>({});

  const addAction = (phaseId: string) => {
    const text = (newActionText[phaseId] || "").trim();
    if (!text) return;
    const phaseActionsForPhase = phaseActions.filter((a) => a.phase_id === phaseId);
    createAction.mutate({
      crisis_id: crisis.id,
      phase_id: phaseId,
      text,
      sort_order: phaseActionsForPhase.length,
    });
    setNewActionText((prev) => ({ ...prev, [phaseId]: "" }));
  };

  const getPhaseProgress = (phaseId: string) => {
    const list = phaseActions.filter((a) => a.phase_id === phaseId);
    if (list.length === 0) return null;
    const done = list.filter((a) => a.checked).length;
    return { done, total: list.length, pct: Math.round((done / list.length) * 100) };
  };

  const st = STATUS_MAP[crisis.status];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← {lang === "pt" ? "Voltar" : "Back"}
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{crisis.title}</h2>
          <p className="text-xs text-muted-foreground">
            {new Date(crisis.crisis_date).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            {" · "}
            {crisis.crisis_type === "simulated" ? (lang === "pt" ? "Simulada" : "Simulated") : "Real"}
          </p>
        </div>
        <Badge className={`${st.variant}`}>{st[lang]}</Badge>
      </div>

      {/* Cabinet members */}
      {cabinetMembers.length > 0 && (
        <Card>
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {lang === "pt" ? "Gabinete de Crise" : "Crisis Cabinet"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {cabinetMembers.map((m) => (
                <Badge key={m.id} variant="outline" className="text-xs">
                  {m.name}{m.role ? ` (${m.role})` : ""}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status control */}
      {isSteering && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">{lang === "pt" ? "Alterar estado:" : "Change status:"}</span>
          {(Object.keys(STATUS_MAP) as DBCrisis["status"][]).map((s) => (
            <Button
              key={s}
              variant={crisis.status === s ? "default" : "outline"}
              size="sm"
              className="h-7 text-[10px]"
              onClick={() => onUpdateStatus(s)}
            >
              {STATUS_MAP[s][lang]}
            </Button>
          ))}
        </div>
      )}

      {/* Kanban phases */}
      <div className="space-y-3">
        {PHASES.map((phase, idx) => {
          const progress = getPhaseProgress(phase.id);
          const actions = phaseActions.filter((a) => a.phase_id === phase.id);
          const phaseLabel = phase.label[lang] || phase.label.pt;

          return (
            <React.Fragment key={phase.id}>
              <Card className={`border-l-4 ${phase.color}`}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span>{phase.icon}</span>
                      {phaseLabel}
                    </CardTitle>
                    {progress && (
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {progress.done}/{progress.total} ({progress.pct}%)
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  {/* Action items */}
                  {actions.map((action) => (
                    <div key={action.id} className="flex items-center gap-2 group">
                      <Checkbox
                        checked={action.checked}
                        onCheckedChange={(checked) =>
                          toggleAction.mutate({ id: action.id, checked: !!checked, crisis_id: crisis.id })
                        }
                      />
                      <span className={`text-xs flex-1 ${action.checked ? "line-through text-muted-foreground" : ""}`}>
                        {action.text}
                      </span>
                      {isSteering && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => deleteAction.mutate({ id: action.id, crisis_id: crisis.id })}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Add new action */}
                  {isSteering && (
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        placeholder={lang === "pt" ? "Nova acção..." : "New action..."}
                        value={newActionText[phase.id] || ""}
                        onChange={(e) => setNewActionText((prev) => ({ ...prev, [phase.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addAction(phase.id)}
                        className="h-7 text-xs"
                      />
                      <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={() => addAction(phase.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {idx < PHASES.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CrisisControlSection;
