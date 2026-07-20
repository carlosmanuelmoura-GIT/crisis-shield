import React, { useState, useEffect, useMemo, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUserRoles } from "@/hooks/useUserRoles";
import {
  useCrises, useCreateCrisis, useUpdateCrisis, useDeleteCrisis,
  useCrisisCabinetMembers, useCrisisPhaseActions,
  useCreatePhaseAction, useTogglePhaseAction, useDeletePhaseAction,
  useUpdateCabinetMembers, useLogDecisionFromCrisis,
  type DBCrisis,
} from "@/hooks/useCrises";
import { useCrisisPhases, useUpdateCrisisPhase, seedPhasesForCrisis, DEFAULT_PHASES, type DBCrisisPhase } from "@/hooks/useCrisisPhases";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, Plus, Trash2, Shield, Loader2,
  CheckCircle2, ArrowDown, Eye, Copy, X, Pencil, Filter, ChevronDown, ChevronUp,
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

const TYPE_LABELS: Record<string, { pt: string; en: string }> = {
  real: { pt: "REAL", en: "REAL" },
  simulated: { pt: "SIMULADA", en: "SIMULATED" },
  template: { pt: "TEMPLATE", en: "TEMPLATE" },
};

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

const CrisisControlSection: React.FC = () => {
  const { lang } = useApp();
  const { data: roles = [] } = useCurrentUserRoles();
  const isSteering = roles.includes("steering_gcn") || roles.includes("especialista_gcn");

  const { data: crises = [], isLoading } = useCrises();
  const createCrisis = useCreateCrisis();
  const updateCrisis = useUpdateCrisis();
  const deleteCrisis = useDeleteCrisis();

  const [selectedCrisisId, setSelectedCrisisId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCrisisId, setEditingCrisisId] = useState<string | null>(null);
  const [cloneFromId, setCloneFromId] = useState<string | null>(null);

  // Tab: separate templates from real/simulated crises
  const [activeTab, setActiveTab] = useState<"real" | "template">("real");

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 16));
  const [formType, setFormType] = useState<string>("real");
  const [formTemplateId, setFormTemplateId] = useState<string>("none");
  const [cabinetMembers, setCabinetMembers] = useState<{ name: string; role: string }[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  const templates = useMemo(() => crises.filter((c) => c.crisis_type === "template"), [crises]);

  const selectedCrisis = crises.find((c) => c.id === selectedCrisisId);

  const filteredCrises = useMemo(() => {
    return crises.filter((c) => {
      if (activeTab === "template" && c.crisis_type !== "template") return false;
      if (activeTab === "real" && c.crisis_type === "template") return false;
      if (filterType !== "all" && c.crisis_type !== filterType) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterName && !c.title.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterDate) {
        const crisisDay = new Date(c.crisis_date).toISOString().slice(0, 10);
        if (crisisDay !== filterDate) return false;
      }
      return true;
    });
  }, [crises, activeTab, filterType, filterStatus, filterName, filterDate]);

  const hasActiveFilter = filterType !== "all" || filterStatus !== "all" || filterName !== "" || filterDate !== "";

  const resetFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setFilterName("");
    setFilterDate("");
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDate(new Date().toISOString().slice(0, 16));
    setFormType("real");
    setFormTemplateId("none");
    setCabinetMembers([]);
    setNewMemberName("");
    setNewMemberRole("");
    setCloneFromId(null);
    setEditingCrisisId(null);
  };

  const openCreate = (cloneId?: string) => {
    resetForm();
    if (cloneId) {
      const source = crises.find((c) => c.id === cloneId);
      if (source) {
        setFormTitle(`${source.title} (cópia)`);
        setFormType(source.crisis_type);
        setCloneFromId(cloneId);
      }
    } else {
      setFormType(activeTab === "template" ? "template" : "real");
    }
    setShowDialog(true);
  };

  const openEdit = (crisisId: string) => {
    const c = crises.find((x) => x.id === crisisId);
    if (!c) return;
    resetForm();
    setEditingCrisisId(crisisId);
    setFormTitle(c.title);
    setFormDate(new Date(c.crisis_date).toISOString().slice(0, 16));
    setFormType(c.crisis_type);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) return;

    if (editingCrisisId) {
      await updateCrisis.mutateAsync({
        id: editingCrisisId,
        title: formTitle.trim(),
        crisis_date: new Date(formDate).toISOString(),
        crisis_type: formType,
      });
    } else {
      await createCrisis.mutateAsync({
        title: formTitle.trim(),
        crisis_date: new Date(formDate).toISOString(),
        crisis_type: formType,
        cabinet_members: cabinetMembers.filter((m) => m.name.trim()),
        clone_from_id: cloneFromId || (formTemplateId !== "none" ? formTemplateId : undefined),
      });
    }
    setShowDialog(false);
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
        onEditCrisis={() => openEdit(selectedCrisis.id)}
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

      {/* Tabs: Real crises vs Templates */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "real" | "template")}>
        <TabsList>
          <TabsTrigger value="real">
            {lang === "pt" ? "Crises Reais" : "Real Crises"}
            <Badge variant="outline" className="ml-2 text-[10px]">
              {crises.filter((c) => c.crisis_type !== "template").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="template">
            {lang === "pt" ? "Templates" : "Templates"}
            <Badge variant="outline" className="ml-2 text-[10px]">
              {crises.filter((c) => c.crisis_type === "template").length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>


      {/* Filters */}
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {lang === "pt" ? "Filtros" : "Filters"}
              </span>
            </div>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={resetFilters}>
                {lang === "pt" ? "Limpar" : "Clear"}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Nome" : "Name"}</Label>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder={lang === "pt" ? "Pesquisar..." : "Search..."}
                className="h-8 text-xs bg-secondary border-border"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Tipo" : "Type"}</Label>
              <Select value={filterType} onValueChange={setFilterType} disabled={activeTab === "template"}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {activeTab === "real" ? (
                    <>
                      <SelectItem value="real">REAL</SelectItem>
                      <SelectItem value="simulated">{lang === "pt" ? "SIMULADA" : "SIMULATED"}</SelectItem>
                    </>
                  ) : (
                    <SelectItem value="template">TEMPLATE</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Estado" : "Status"}</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                  {(Object.keys(STATUS_MAP) as DBCrisis["status"][]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_MAP[s][lang]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "pt" ? "Data" : "Date"}</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="h-8 text-xs bg-secondary border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filteredCrises.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            {lang === "pt" ? "Nenhuma crise encontrada." : "No crises found."}
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
                {filteredCrises.map((crisis) => {
                  const st = STATUS_MAP[crisis.status];
                  const typeLabel = TYPE_LABELS[crisis.crisis_type] || { pt: crisis.crisis_type, en: crisis.crisis_type };
                  return (
                    <TableRow key={crisis.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCrisisId(crisis.id)}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(crisis.crisis_date).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{crisis.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{typeLabel[lang]}</Badge>
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
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(crisis.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
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

      {/* Create / Edit crisis dialog */}
      <CrisisFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        lang={lang}
        isEditing={!!editingCrisisId}
        editingCrisisId={editingCrisisId}
        cloneFromId={cloneFromId}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formDate={formDate}
        setFormDate={setFormDate}
        formType={formType}
        setFormType={setFormType}
        formTemplateId={formTemplateId}
        setFormTemplateId={setFormTemplateId}
        templates={templates}
        cabinetMembers={cabinetMembers}
        setCabinetMembers={setCabinetMembers}
        newMemberName={newMemberName}
        setNewMemberName={setNewMemberName}
        newMemberRole={newMemberRole}
        setNewMemberRole={setNewMemberRole}
        addMember={addMember}
        removeMember={removeMember}
        onSubmit={handleSubmit}
        isPending={createCrisis.isPending || updateCrisis.isPending}
      />
    </div>
  );
};

/* ──────────────────────────────────────────────
   Form Dialog for Create / Edit
   ────────────────────────────────────────────── */

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: "pt" | "en";
  isEditing: boolean;
  editingCrisisId: string | null;
  cloneFromId: string | null;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDate: string;
  setFormDate: (v: string) => void;
  formType: string;
  setFormType: (v: string) => void;
  formTemplateId: string;
  setFormTemplateId: (v: string) => void;
  templates: DBCrisis[];
  cabinetMembers: { name: string; role: string }[];
  setCabinetMembers: React.Dispatch<React.SetStateAction<{ name: string; role: string }[]>>;
  newMemberName: string;
  setNewMemberName: (v: string) => void;
  newMemberRole: string;
  setNewMemberRole: (v: string) => void;
  addMember: () => void;
  removeMember: (idx: number) => void;
  onSubmit: () => void;
  isPending: boolean;
}

const CrisisFormDialog: React.FC<FormDialogProps> = ({
  open, onOpenChange, lang, isEditing, editingCrisisId, cloneFromId,
  formTitle, setFormTitle, formDate, setFormDate, formType, setFormType,
  formTemplateId, setFormTemplateId, templates,
  cabinetMembers, setCabinetMembers, newMemberName, setNewMemberName,
  newMemberRole, setNewMemberRole, addMember, removeMember, onSubmit, isPending,
}) => {
  const { data: existingMembers = [] } = useCrisisCabinetMembers(isEditing ? editingCrisisId! : undefined);
  const updateCabinetMembers = useUpdateCabinetMembers();
  const loadedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      loadedForRef.current = null;
      return;
    }
    if (isEditing && editingCrisisId && loadedForRef.current !== editingCrisisId) {
      loadedForRef.current = editingCrisisId;
      setCabinetMembers(existingMembers.map((m) => ({ name: m.name, role: m.role })));
    }
  }, [open, isEditing, editingCrisisId, existingMembers, setCabinetMembers]);

  const handleSave = async () => {
    await onSubmit();
    if (isEditing && editingCrisisId) {
      await updateCabinetMembers.mutateAsync({
        crisis_id: editingCrisisId,
        members: cabinetMembers.filter((m) => m.name.trim()),
      });
    }
  };

  const dialogTitle = isEditing
    ? (lang === "pt" ? "Editar Crise" : "Edit Crisis")
    : cloneFromId
      ? (lang === "pt" ? "Clonar Crise" : "Clone Crisis")
      : (lang === "pt" ? "Registar Nova Crise" : "Register New Crisis");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
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
            <Select value={formType} onValueChange={setFormType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="real">REAL</SelectItem>
                <SelectItem value="simulated">{lang === "pt" ? "SIMULADA" : "SIMULATED"}</SelectItem>
                <SelectItem value="template">TEMPLATE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isEditing && !cloneFromId && formType !== "template" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {lang === "pt" ? "Template base (opcional)" : "Base template (optional)"}
              </label>
              <Select value={formTemplateId} onValueChange={setFormTemplateId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {lang === "pt" ? "Nenhum — crise vazia" : "None — empty crisis"}
                  </SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formTemplateId !== "none" && (
                <p className="text-xs text-muted-foreground mt-1">
                  ℹ️ {lang === "pt" ? "Todas as acções do template serão copiadas." : "All template actions will be copied."}
                </p>
              )}
            </div>
          )}

          <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
            <div className="font-semibold text-sm">
              {lang === "pt" ? "Constituição do Gabinete de Gestão de Crise" : "Crisis Management Cabinet Members"}
            </div>
            <div className="space-y-1">
              {cabinetMembers.length === 0 && (
                <div className="text-xs text-muted-foreground italic">
                  {lang === "pt" ? "Sem membros adicionados." : "No members added."}
                </div>
              )}
              {cabinetMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-background rounded px-2 py-1 border">
                  <span className="font-medium">{m.name}</span>
                  {m.role && <span className="text-muted-foreground">— {m.role}</span>}
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => removeMember(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {lang === "pt" ? "Cancelar" : "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={!formTitle.trim() || isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {isEditing ? (lang === "pt" ? "Guardar" : "Save") : (lang === "pt" ? "Registar" : "Register")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  onEditCrisis: () => void;
}

const CrisisKanbanView: React.FC<KanbanProps> = ({ crisis, lang, isSteering, onBack, onUpdateStatus, onEditCrisis }) => {
  const { data: phaseActions = [] } = useCrisisPhaseActions(crisis.id);
  const { data: cabinetMembers = [] } = useCrisisCabinetMembers(crisis.id);
  const { data: dbPhases = [] } = useCrisisPhases(crisis.id);
  const updatePhase = useUpdateCrisisPhase();
  const createAction = useCreatePhaseAction();
  const toggleAction = useTogglePhaseAction();
  const deleteAction = useDeletePhaseAction();
  const updateCrisis = useUpdateCrisis();
  const logDecision = useLogDecisionFromCrisis();

  // Fallback to DEFAULT_PHASES until DB seeds load
  const PHASES = React.useMemo(() => {
    if (dbPhases.length > 0) {
      return dbPhases.slice().sort((a, b) => a.sort_order - b.sort_order).map((p) => ({
        id: p.phase_key,
        dbId: p.id,
        label: { pt: p.label_pt, en: p.label_en },
        color: p.color,
        icon: p.icon,
      }));
    }
    return DEFAULT_PHASES.map((p) => ({
      id: p.phase_key,
      dbId: null as string | null,
      label: { pt: p.label_pt, en: p.label_en },
      color: p.color,
      icon: p.icon,
    }));
  }, [dbPhases]);

  // Auto-seed if missing
  React.useEffect(() => {
    if (dbPhases.length === 0 && crisis.id) {
      seedPhasesForCrisis(crisis.id).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbPhases.length, crisis.id]);

  const [newActionText, setNewActionText] = useState<Record<string, string>>({});
  const [declaredBy, setDeclaredBy] = useState(crisis.declared_by || "");
  const [endedBy, setEndedBy] = useState(crisis.ended_by || "");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(PHASES[0]?.id || "alerta");
  const [phaseEditOpen, setPhaseEditOpen] = useState(false);
  const [phaseEditForm, setPhaseEditForm] = useState({ id: "", label_pt: "", label_en: "", icon: "", color: "" });

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{ actionId: string; checked: boolean; actionText: string; phaseLabel: string } | null>(null);
  const [confirmForm, setConfirmForm] = useState({ info_department: "", info_person: "", notes: "" });


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

  const handleToggle = (actionId: string, checked: boolean, actionText: string, phaseLabel: string) => {
    if (checked) {
      // Opening confirmation dialog
      setPendingToggle({ actionId, checked, actionText, phaseLabel });
      setConfirmForm({ info_department: "", info_person: "", notes: "" });
      setConfirmDialogOpen(true);
    } else {
      // Unchecking directly
      toggleAction.mutate({ id: actionId, checked: false, crisis_id: crisis.id });
      logDecision.mutate({
        title: "↩️ Acção revertida",
        text: `↩️ ${phaseLabel} — ${actionText} (revertida)`,
        crisis_id: crisis.id,
      });
    }
  };

  const handleConfirmToggle = () => {
    if (!pendingToggle) return;
    const { actionId, actionText, phaseLabel } = pendingToggle;
    toggleAction.mutate({
      id: actionId,
      checked: true,
      crisis_id: crisis.id,
      info_department: confirmForm.info_department,
      info_person: confirmForm.info_person,
      notes: confirmForm.notes,
    });
    const details = [
      confirmForm.info_department && `Dept: ${confirmForm.info_department}`,
      confirmForm.info_person && `Por: ${confirmForm.info_person}`,
      confirmForm.notes && `Notas: ${confirmForm.notes}`,
    ].filter(Boolean).join(" | ");
    logDecision.mutate({
      title: "✅ Acção concluída",
      text: `✅ ${phaseLabel} — ${actionText}${details ? ` (${details})` : ""}`,
      crisis_id: crisis.id,
    });
    setConfirmDialogOpen(false);
    setPendingToggle(null);
  };

  const handleDeclareCrisis = async () => {
    if (!declaredBy.trim()) return;
    await updateCrisis.mutateAsync({
      id: crisis.id,
      status: "crise_em_curso",
      declared_by: declaredBy.trim(),
    });
    logDecision.mutate({
      title: "🚨 Crise declarada",
      text: `🚨 Crise declarada por ${declaredBy.trim()}: ${crisis.title}`,
      author: declaredBy.trim(),
      crisis_id: crisis.id,
    });
  };

  const handleEndCrisis = async () => {
    if (!endedBy.trim()) return;
    await updateCrisis.mutateAsync({
      id: crisis.id,
      status: "fim",
      ended_by: endedBy.trim(),
    });
    logDecision.mutate({
      title: "✅ Fim de crise",
      text: `✅ Fim de crise aprovado por ${endedBy.trim()}: ${crisis.title}`,
      author: endedBy.trim(),
      crisis_id: crisis.id,
    });
  };

  const getPhaseProgress = (phaseId: string) => {
    const list = phaseActions.filter((a) => a.phase_id === phaseId);
    if (list.length === 0) return null;
    const done = list.filter((a) => a.checked).length;
    return { done, total: list.length, pct: Math.round((done / list.length) * 100) };
  };

  const st = STATUS_MAP[crisis.status];
  const typeLabel = TYPE_LABELS[crisis.crisis_type] || { pt: crisis.crisis_type, en: crisis.crisis_type };

  const renderActions = (actions: typeof phaseActions, phaseId: string, phaseLabel: string) => (
    <>
      {actions.map((action) => (
        <div key={action.id} className="flex items-start gap-3 py-1.5 group">
          <Checkbox
            checked={action.checked}
            onCheckedChange={(checked) => handleToggle(action.id, !!checked, action.text, phaseLabel)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${action.checked ? "line-through text-muted-foreground" : ""}`}>
              {action.text}
            </span>
            {action.checked && ((action as any).info_department || (action as any).info_person || (action as any).notes) && (
              <div className="text-xs text-muted-foreground mt-0.5 space-x-2">
                {(action as any).info_department && <span>📍 {(action as any).info_department}</span>}
                {(action as any).info_person && <span>👤 {(action as any).info_person}</span>}
                {(action as any).notes && <span>📝 {(action as any).notes}</span>}
              </div>
            )}
          </div>
          {isSteering && (
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
              onClick={() => deleteAction.mutate({ id: action.id, crisis_id: crisis.id })}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
        </div>
      ))}

      {isSteering && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            placeholder={lang === "pt" ? "Nova acção..." : "New action..."}
            value={newActionText[phaseId] || ""}
            onChange={(e) => setNewActionText((prev) => ({ ...prev, [phaseId]: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addAction(phaseId)}
            className="h-8 text-sm"
          />
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => addAction(phaseId)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← {lang === "pt" ? "Voltar" : "Back"}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{crisis.title}</h2>
            {isSteering && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEditCrisis}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(crisis.crisis_date).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            {" · "}{typeLabel[lang]}
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

      {/* Declaration / End info */}
      {crisis.crisis_type !== "template" && (
        <>
          {crisis.declared_by && (
            <div className="text-xs text-muted-foreground bg-crisis/10 border border-crisis/30 rounded px-3 py-2">
              🚨 {lang === "pt" ? "Declarada por" : "Declared by"}: <strong>{crisis.declared_by}</strong>
            </div>
          )}
          {crisis.ended_by && (
            <div className="text-xs text-muted-foreground bg-green-500/10 border border-green-500/30 rounded px-3 py-2">
              ✅ {lang === "pt" ? "Fim aprovado por" : "End approved by"}: <strong>{crisis.ended_by}</strong>
            </div>
          )}
        </>
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

      {/* Phase detail — two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: phase stepper */}
        <div className="lg:col-span-1 space-y-2">
          {PHASES.map((phase, idx) => {
            const progress = getPhaseProgress(phase.id);
            const pct = progress?.pct ?? 0;
            const isSelected = selectedPhaseId === phase.id;
            const phaseLabel = phase.label[lang] || phase.label.pt;
            return (
              <React.Fragment key={phase.id}>
                <button
                  type="button"
                  onClick={() => setSelectedPhaseId(phase.id)}
                  className={`w-full text-left rounded-lg border-2 px-3 py-2.5 transition-all ${phase.color} ${
                    isSelected ? "ring-2 ring-primary shadow-md" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{phase.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold tracking-wider text-muted-foreground">
                        {lang === "pt" ? `FASE ${idx + 1}` : `PHASE ${idx + 1}`}
                      </div>
                      <div className="text-sm font-semibold truncate">{phaseLabel}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {pct}%
                    </Badge>
                  </div>
                </button>
                {idx < PHASES.length - 1 && (
                  <div className="flex justify-center">
                    <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* RIGHT: selected phase detail */}
        <div className="lg:col-span-2">
          {(() => {
            const phaseIdx = PHASES.findIndex((p) => p.id === selectedPhaseId);
            const phase = PHASES[phaseIdx] ?? PHASES[0];
            const phaseLabel = phase.label[lang] || phase.label.pt;
            const actions = phaseActions.filter((a) => a.phase_id === phase.id);
            const progress = getPhaseProgress(phase.id);
            const pct = progress?.pct ?? 0;
            const isDeclarationPhase = phase.id === "declaracao";
            const isEndPhase = phase.id === "fim";

            return (
              <Card className={`border-l-4 ${phase.color}`}>
                <CardHeader className="py-4 px-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-2">
                        {lang === "pt" ? `FASE ${phaseIdx + 1} DE ${PHASES.length}` : `PHASE ${phaseIdx + 1} OF ${PHASES.length}`}
                      </Badge>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <span>{phase.icon}</span>
                        {phaseLabel}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold tracking-wider text-muted-foreground">
                        {lang === "pt" ? "PROGRESSO DA FASE" : "PHASE PROGRESS"}
                      </div>
                      <div className="text-xl font-bold text-primary">{pct}%</div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 space-y-4">
                  <div className="min-h-[160px] space-y-1">
                    {renderActions(actions, phase.id, phaseLabel)}
                  </div>

                  {isDeclarationPhase && (
                    <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold tracking-wider text-muted-foreground">
                          {lang === "pt" ? "AUTORIZADO POR" : "AUTHORIZED BY"}
                        </label>
                        {crisis.status === "em_alerta" && isSteering ? (
                          <Input
                            value={declaredBy}
                            onChange={(e) => setDeclaredBy(e.target.value)}
                            placeholder={lang === "pt" ? "Nome de quem autoriza..." : "Name of authorizer..."}
                            className="h-9 text-sm mt-1"
                          />
                        ) : (
                          <p className="text-sm mt-1 font-medium min-h-[36px] flex items-center">
                            {declaredBy || <span className="text-muted-foreground italic">—</span>}
                          </p>
                        )}
                      </div>
                      {crisis.status === "em_alerta" && isSteering && (
                        <Button
                          className="bg-crisis hover:bg-crisis/90 text-crisis-foreground sm:w-auto"
                          onClick={handleDeclareCrisis}
                          disabled={!declaredBy.trim() || updateCrisis.isPending}
                        >
                          {updateCrisis.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {lang === "pt" ? "DECLARAR CRISE" : "DECLARE CRISIS"}
                        </Button>
                      )}
                    </div>
                  )}

                  {isEndPhase && (
                    <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold tracking-wider text-muted-foreground">
                          {lang === "pt" ? "APROVADO POR" : "APPROVED BY"}
                        </label>
                        {crisis.status === "crise_em_curso" && isSteering ? (
                          <Input
                            value={endedBy}
                            onChange={(e) => setEndedBy(e.target.value)}
                            placeholder={lang === "pt" ? "Nome de quem aprova..." : "Name of approver..."}
                            className="h-9 text-sm mt-1"
                          />
                        ) : (
                          <p className="text-sm mt-1 font-medium min-h-[36px] flex items-center">
                            {endedBy || <span className="text-muted-foreground italic">—</span>}
                          </p>
                        )}
                      </div>
                      {crisis.status === "crise_em_curso" && isSteering && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white sm:w-auto"
                          onClick={handleEndCrisis}
                          disabled={!endedBy.trim() || updateCrisis.isPending}
                        >
                          {updateCrisis.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {lang === "pt" ? "FIM DE CRISE" : "END CRISIS"}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>


      {/* Confirmation dialog for checking tasks */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {lang === "pt" ? "Confirmar acção" : "Confirm action"}
            </DialogTitle>
          </DialogHeader>
          {pendingToggle && (
            <div className="space-y-1 mb-2">
              <p className="text-sm font-medium">{pendingToggle.actionText}</p>
              <p className="text-xs text-muted-foreground">{pendingToggle.phaseLabel}</p>
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {lang === "pt" ? "DEP Origem da Informação" : "Info Source Department"}
              </Label>
              <Input
                value={confirmForm.info_department}
                onChange={(e) => setConfirmForm(f => ({ ...f, info_department: e.target.value }))}
                placeholder={lang === "pt" ? "Departamento..." : "Department..."}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {lang === "pt" ? "Quem deu a informação" : "Who provided the information"}
              </Label>
              <Input
                value={confirmForm.info_person}
                onChange={(e) => setConfirmForm(f => ({ ...f, info_person: e.target.value }))}
                placeholder={lang === "pt" ? "Nome da pessoa..." : "Person name..."}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {lang === "pt" ? "Notas" : "Notes"}
              </Label>
              <Input
                value={confirmForm.notes}
                onChange={(e) => setConfirmForm(f => ({ ...f, notes: e.target.value }))}
                placeholder={lang === "pt" ? "Observações..." : "Observations..."}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              {lang === "pt" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleConfirmToggle}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {lang === "pt" ? "Confirmar" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrisisControlSection;
