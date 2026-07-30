import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, UserCog, Briefcase, ShieldAlert, Link2, X, Server, Settings, Building, FileText, Building2, Users, Truck, MapPin, Monitor, Home, UserCheck, Network, Zap, Info, Download } from "lucide-react";
import { APP_OVERVIEW, APP_OVERVIEW_INTRO, APP_OVERVIEW_TITLE } from "@/lib/appOverviewContent";
import { generateAppOverviewPDF } from "@/lib/generateAppOverviewPDF";
import { useAllUsersWithRoles, useAssignRole, useRemoveRole } from "@/hooks/useUserRoles";
import { useBusinessProcesses, useCreateBusinessProcess, useUpdateBusinessProcess, useDeleteBusinessProcess } from "@/hooks/useBusinessProcesses";
import { useRecursos, useCreateRecurso, useUpdateRecurso, useDeleteRecurso } from "@/hooks/useRecursos";
import { useSubCapacidades, useCreateSubCapacidade, useUpdateSubCapacidade, useDeleteSubCapacidade } from "@/hooks/useSubCapacidades";
import { useCenarios, useCreateCenario, useUpdateCenario, useDeleteCenario, useCenarioRecursos, useLinkCenarioRecurso, useUnlinkCenarioRecurso } from "@/hooks/useCenarios";
import { useDRTypes, useUpdateDRType, useCMDBPlatforms, useCreateCMDBPlatform, useUpdateCMDBPlatform, useDeleteCMDBPlatform } from "@/hooks/useCMDBPlatforms";
import { useBuildings, useCreateBuilding, useUpdateBuilding, useDeleteBuilding } from "@/hooks/useBuildings";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/useDepartments";
import { useDocumentCategories, useCreateDocumentCategory, useUpdateDocumentCategory, useDeleteDocumentCategory } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
const BuildingIcon = Building2;

const roleLabels: Record<string, string> = {
  steering_gcn: "Steering GCN",
  tecnico_departamento: "Técnico Departamento",
  especialista_gcn: "Especialista GCN",
};
const allRoles = ["steering_gcn", "tecnico_departamento", "especialista_gcn"];

const BackOfficeSection: React.FC = () => {
  const { lang } = useApp();
  const { toast } = useToast();

  // --- User Roles ---
  const { data: users = [], isLoading: usersLoading } = useAllUsersWithRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const [roleDialog, setRoleDialog] = useState<{ user_id: string; name: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  // --- Business Processes ---
  const { data: processes = [], isLoading: bpLoading } = useBusinessProcesses();
  const createBP = useCreateBusinessProcess();
  const updateBP = useUpdateBusinessProcess();
  const deleteBP = useDeleteBusinessProcess();
  const [bpDialog, setBpDialog] = useState(false);
  const [editingBP, setEditingBP] = useState<string | null>(null);
  const [bpForm, setBpForm] = useState({ tipo_funcao: "", funcao: "", macro_processo: "", processo: "" });

  // --- Recursos ---
  const { data: recursos = [], isLoading: recLoading } = useRecursos();
  const createRec = useCreateRecurso();
  const updateRec = useUpdateRecurso();
  const deleteRec = useDeleteRecurso();
  const [recDialog, setRecDialog] = useState(false);
  const [editingRec, setEditingRec] = useState<string | null>(null);
  const [recForm, setRecForm] = useState({ name_pt: "", name_en: "", description_pt: "", description_en: "", icon: "Monitor" });

  // --- Sub-Capacidades ---
  const { data: subCapacidades = [] } = useSubCapacidades();
  const createSubCap = useCreateSubCapacidade();
  const updateSubCap = useUpdateSubCapacidade();
  const deleteSubCap = useDeleteSubCapacidade();
  const [subCapDialog, setSubCapDialog] = useState(false);
  const [editingSubCap, setEditingSubCap] = useState<string | null>(null);
  const [subCapForm, setSubCapForm] = useState({ name_pt: "", name_en: "", recurso_id: "" });

  // --- Cenários ---
  const { data: cenarios = [], isLoading: cenLoading } = useCenarios();
  const createCen = useCreateCenario();
  const updateCen = useUpdateCenario();
  const deleteCen = useDeleteCenario();
  const [cenDialog, setCenDialog] = useState(false);
  const [editingCen, setEditingCen] = useState<string | null>(null);
  const [cenForm, setCenForm] = useState({ roman: "", name_pt: "", name_en: "", description_pt: "" });

  // --- Cenário <-> Recurso ---
  const { data: cenRecLinks = [] } = useCenarioRecursos();
  const linkCR = useLinkCenarioRecurso();
  const unlinkCR = useUnlinkCenarioRecurso();
  const [linkDialog, setLinkDialog] = useState<string | null>(null); // cenario_id
  const [linkRecursoId, setLinkRecursoId] = useState("");

  // --- DR Types ---
  const { data: drTypes = [], isLoading: drLoading } = useDRTypes();
  const updateDR = useUpdateDRType();
  const [editingDR, setEditingDR] = useState<string | null>(null);
  const [drForm, setDrForm] = useState({ rto: 0, rpo: 0 });

  // --- CMDB Platforms ---
  const { data: platforms = [], isLoading: platLoading } = useCMDBPlatforms();
  const createPlat = useCreateCMDBPlatform();
  const updatePlat = useUpdateCMDBPlatform();
  const deletePlat = useDeleteCMDBPlatform();
  const [platDialog, setPlatDialog] = useState(false);
  const [editingPlat, setEditingPlat] = useState<string | null>(null);
  const [platForm, setPlatForm] = useState({ name: "", dr_type_id: "" });

  // --- Buildings ---
  const { data: buildingsList = [], isLoading: bldLoading } = useBuildings();
  const createBld = useCreateBuilding();
  const updateBld = useUpdateBuilding();
  const deleteBld = useDeleteBuilding();
  const [bldDialog, setBldDialog] = useState(false);
  const [editingBld, setEditingBld] = useState<string | null>(null);
  const emptyBldForm = { name: "", autonomia_horas_contingencia: "", depositos: "", combustivel_litros: "", num_geradores: "", num_ups: "", observacoes: "" };
  const [bldForm, setBldForm] = useState(emptyBldForm);

  // --- Departments ---
  const { data: departmentsList = [], isLoading: deptLoading } = useDepartments();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const [deptDialog, setDeptDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState<{ name: string; code: string; has_cc: boolean }>({ name: "", code: "", has_cc: false });

  // --- Document Categories ---
  const { data: docCats = [], isLoading: docCatLoading } = useDocumentCategories();
  const createDocCat = useCreateDocumentCategory();
  const updateDocCat = useUpdateDocumentCategory();
  const deleteDocCat = useDeleteDocumentCategory();
  const [docCatDialog, setDocCatDialog] = useState(false);
  const [editingDocCat, setEditingDocCat] = useState<string | null>(null);
  const [docCatForm, setDocCatForm] = useState({ name_pt: "", name_en: "" });

  const openCreateDocCat = () => { setEditingDocCat(null); setDocCatForm({ name_pt: "", name_en: "" }); setDocCatDialog(true); };
  const openEditDocCat = (d: typeof docCats[0]) => { setEditingDocCat(d.id); setDocCatForm({ name_pt: d.name_pt, name_en: d.name_en }); setDocCatDialog(true); };
  const handleSaveDocCat = async () => {
    try {
      if (editingDocCat) await updateDocCat.mutateAsync({ id: editingDocCat, ...docCatForm });
      else await createDocCat.mutateAsync(docCatForm);
      setDocCatDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeleteDocCat = async (id: string) => {
    try { await deleteDocCat.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const openCreateBld = () => { setEditingBld(null); setBldForm(emptyBldForm); setBldDialog(true); };
  const openEditBld = (b: typeof buildingsList[0]) => {
    setEditingBld(b.id);
    setBldForm({
      name: b.name ?? "",
      autonomia_horas_contingencia: b.autonomia_horas_contingencia?.toString() ?? "",
      depositos: b.depositos ?? "",
      combustivel_litros: b.combustivel_litros?.toString() ?? "",
      num_geradores: b.num_geradores?.toString() ?? "",
      num_ups: b.num_ups?.toString() ?? "",
      observacoes: b.observacoes ?? "",
    });
    setBldDialog(true);
  };
  const handleSaveBld = async () => {
    try {
      const numOrNull = (v: string) => v.trim() === "" ? null : Number(v.replace(",", "."));
      const payload = {
        name: bldForm.name.trim(),
        autonomia_horas_contingencia: numOrNull(bldForm.autonomia_horas_contingencia),
        depositos: bldForm.depositos.trim() || null,
        combustivel_litros: numOrNull(bldForm.combustivel_litros),
        num_geradores: bldForm.num_geradores.trim() === "" ? null : parseInt(bldForm.num_geradores, 10),
        num_ups: bldForm.num_ups.trim() === "" ? null : parseInt(bldForm.num_ups, 10),
        observacoes: bldForm.observacoes.trim() || null,
      };
      if (editingBld) await updateBld.mutateAsync({ id: editingBld, ...payload });
      else await createBld.mutateAsync(payload);
      setBldDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeleteBld = async (id: string) => {
    try { await deleteBld.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Departments handlers
  const openCreateDept = () => { setEditingDept(null); setDeptForm({ name: "", code: "", has_cc: false }); setDeptDialog(true); };
  const openEditDept = (d: typeof departmentsList[0]) => { setEditingDept(d.id); setDeptForm({ name: d.name, code: d.code ?? "", has_cc: !!d.has_cc }); setDeptDialog(true); };
  const handleSaveDept = async () => {
    try {
      const payload = { name: deptForm.name, code: deptForm.code.trim() || null, has_cc: deptForm.has_cc };
      if (editingDept) await updateDept.mutateAsync({ id: editingDept, ...payload });
      else await createDept.mutateAsync(payload);
      setDeptDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeleteDept = async (id: string) => {
    try { await deleteDept.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // --- Handlers ---
  const handleAssignRole = async () => {
    if (!roleDialog || !selectedRole) return;
    try {
      await assignRole.mutateAsync({ user_id: roleDialog.user_id, role: selectedRole });
      setRoleDialog(null); setSelectedRole("");
      toast({ title: lang === "pt" ? "Perfil atribuído" : "Role assigned" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleRemoveRole = async (user_id: string, role: string) => {
    try { await removeRole.mutateAsync({ user_id, role }); toast({ title: lang === "pt" ? "Perfil removido" : "Role removed" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // BP
  const openCreateBP = () => { setEditingBP(null); setBpForm({ tipo_funcao: "", funcao: "", macro_processo: "", processo: "" }); setBpDialog(true); };
  const openEditBP = (bp: typeof processes[0]) => { setEditingBP(bp.id); setBpForm({ tipo_funcao: bp.tipo_funcao, funcao: bp.funcao, macro_processo: bp.macro_processo, processo: bp.processo }); setBpDialog(true); };
  const handleSaveBP = async () => {
    try {
      if (editingBP) await updateBP.mutateAsync({ id: editingBP, ...bpForm });
      else await createBP.mutateAsync(bpForm);
      setBpDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeleteBP = async (id: string) => {
    try { await deleteBP.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Recursos
  const openCreateRec = () => { setEditingRec(null); setRecForm({ name_pt: "", name_en: "", description_pt: "", description_en: "", icon: "Monitor" }); setRecDialog(true); };
  const openEditRec = (r: typeof recursos[0]) => { setEditingRec(r.id); setRecForm({ name_pt: r.name_pt, name_en: r.name_en, description_pt: r.description_pt || "", description_en: r.description_en || "", icon: r.icon || "Monitor" }); setRecDialog(true); };
  const handleSaveRec = async () => {
    try {
      if (editingRec) await updateRec.mutateAsync({ id: editingRec, ...recForm });
      else await createRec.mutateAsync(recForm);
      setRecDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeleteRec = async (id: string) => {
    try { await deleteRec.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Sub-Capacidades handlers
  const openCreateSubCap = (recursoId: string) => { setEditingSubCap(null); setSubCapForm({ name_pt: "", name_en: "", recurso_id: recursoId }); setSubCapDialog(true); };
  const openEditSubCap = (sc: typeof subCapacidades[0]) => { setEditingSubCap(sc.id); setSubCapForm({ name_pt: sc.name_pt, name_en: sc.name_en, recurso_id: sc.recurso_id }); setSubCapDialog(true); };
  const handleSaveSubCap = async () => {
    try {
      if (editingSubCap) await updateSubCap.mutateAsync({ id: editingSubCap, ...subCapForm });
      else await createSubCap.mutateAsync(subCapForm);
      setSubCapDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeleteSubCap = async (id: string) => {
    try { await deleteSubCap.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Cenários
  const openCreateCen = () => { setEditingCen(null); setCenForm({ roman: "", name_pt: "", name_en: "", description_pt: "" }); setCenDialog(true); };
  const openEditCen = (c: typeof cenarios[0]) => { setEditingCen(c.id); setCenForm({ roman: c.roman, name_pt: c.name_pt, name_en: c.name_en, description_pt: c.description_pt }); setCenDialog(true); };
  const handleSaveCen = async () => {
    try {
      if (editingCen) await updateCen.mutateAsync({ id: editingCen, ...cenForm });
      else await createCen.mutateAsync(cenForm);
      setCenDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeleteCen = async (id: string) => {
    try { await deleteCen.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Link cenário <-> recurso
  const handleLink = async () => {
    if (!linkDialog || !linkRecursoId) return;
    try {
      await linkCR.mutateAsync({ cenario_id: linkDialog, recurso_id: linkRecursoId });
      setLinkRecursoId(""); toast({ title: lang === "pt" ? "Associado" : "Linked" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // DR Types
  const openEditDR = (dr: typeof drTypes[0]) => { setEditingDR(dr.id); setDrForm({ rto: dr.rto, rpo: dr.rpo }); };
  const handleSaveDR = async () => {
    if (!editingDR) return;
    try { await updateDR.mutateAsync({ id: editingDR, ...drForm }); setEditingDR(null); toast({ title: lang === "pt" ? "Guardado" : "Saved" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Platforms
  const openCreatePlat = () => { setEditingPlat(null); setPlatForm({ name: "", dr_type_id: "" }); setPlatDialog(true); };
  const openEditPlat = (p: typeof platforms[0]) => { setEditingPlat(p.id); setPlatForm({ name: p.name, dr_type_id: p.dr_type_id || "" }); setPlatDialog(true); };
  const handleSavePlat = async () => {
    try {
      const payload = { name: platForm.name, dr_type_id: platForm.dr_type_id || null };
      if (editingPlat) await updatePlat.mutateAsync({ id: editingPlat, ...payload });
      else await createPlat.mutateAsync(payload);
      setPlatDialog(false); toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };
  const handleDeletePlat = async (id: string) => {
    try { await deletePlat.mutateAsync(id); toast({ title: lang === "pt" ? "Eliminado" : "Deleted" }); }
    catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">Back Office</h2>

      <Tabs defaultValue="about">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="about" className="text-xs"><Info className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Sobre a Aplicação" : "About the App"}</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs"><UserCog className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Perfis" : "Roles"}</TabsTrigger>
          <TabsTrigger value="bp" className="text-xs"><Briefcase className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Processos" : "Processes"}</TabsTrigger>
          <TabsTrigger value="recursos" className="text-xs"><ShieldAlert className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Tipos de Falha" : "Failure Types"}</TabsTrigger>
          <TabsTrigger value="cenarios" className="text-xs"><Link2 className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Cenários" : "Scenarios"}</TabsTrigger>
          <TabsTrigger value="platforms" className="text-xs"><Server className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Plataformas" : "Platforms"}</TabsTrigger>
          <TabsTrigger value="drtypes" className="text-xs"><Settings className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Tipos DR" : "DR Types"}</TabsTrigger>
          <TabsTrigger value="buildings" className="text-xs"><BuildingIcon className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Edifícios" : "Buildings"}</TabsTrigger>
          <TabsTrigger value="departments" className="text-xs"><Building className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Departamentos" : "Departments"}</TabsTrigger>
          <TabsTrigger value="doccats" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Documentação GCN" : "Documentation"}</TabsTrigger>
        </TabsList>

        {/* ===== ABOUT / FUNCTIONAL MANUAL ===== */}
        <TabsContent value="about" className="space-y-4 mt-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl space-y-1">
              <h3 className="text-base font-bold uppercase tracking-wider text-primary">
                {APP_OVERVIEW_TITLE[lang]}
              </h3>
              <p className="text-sm text-muted-foreground">{APP_OVERVIEW_INTRO[lang]}</p>
            </div>
            <Button size="sm" onClick={() => generateAppOverviewPDF(lang)}>
              <Download className="h-4 w-4 mr-1.5" />
              {lang === "pt" ? "Gerar PDF" : "Generate PDF"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {APP_OVERVIEW.map(section => (
              <Card key={section.title.pt}>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2">
                    {section.title[lang]}
                  </h4>
                  <ul className="space-y-2.5">
                    {section.items.map(item => (
                      <li key={item.name.pt}>
                        <p className="text-sm font-semibold">{item.name[lang]}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== USER ROLES ===== */}
        <TabsContent value="roles" className="space-y-3 mt-3">

          {usersLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
            users.map(u => (
              <Card key={u.user_id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.display_name || "—"}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.roles.length === 0 && <span className="text-xs text-muted-foreground italic">{lang === "pt" ? "Sem perfil" : "No role"}</span>}
                        {u.roles.map(r => (
                          <Badge key={r} variant="secondary" className="text-[10px] gap-1">
                            {roleLabels[r] || r}
                            <button onClick={() => handleRemoveRole(u.user_id, r)} className="ml-0.5 hover:text-destructive">×</button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs shrink-0"
                      onClick={() => { setRoleDialog({ user_id: u.user_id, name: u.display_name || "—" }); setSelectedRole(""); }}>
                      <Plus className="h-3 w-3 mr-1" />{lang === "pt" ? "Perfil" : "Role"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ===== BUSINESS PROCESSES ===== */}
        <TabsContent value="bp" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateBP} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}</Button>
          </div>
          {bpLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : processes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{lang === "pt" ? "Nenhum processo configurado." : "No processes configured."}</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{lang === "pt" ? "Tipo Função" : "Function Type"}</TableHead>
                    <TableHead className="text-xs">{lang === "pt" ? "Função" : "Function"}</TableHead>
                    <TableHead className="text-xs">{lang === "pt" ? "Macro Processo" : "Macro Process"}</TableHead>
                    <TableHead className="text-xs">{lang === "pt" ? "Processo" : "Process"}</TableHead>
                    <TableHead className="text-xs w-20">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map(bp => (
                    <TableRow key={bp.id}>
                      <TableCell className="text-sm">{bp.tipo_funcao || "—"}</TableCell>
                      <TableCell className="text-sm">{bp.funcao || "—"}</TableCell>
                      <TableCell className="text-sm">{bp.macro_processo || "—"}</TableCell>
                      <TableCell className="text-sm">{bp.processo || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBP(bp)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteBP(bp.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ===== RECURSOS ===== */}
          <TabsContent value="recursos" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateRec} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo Tipo de Falha" : "New Failure Type"}</Button>
          </div>
          {recLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : recursos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{lang === "pt" ? "Nenhum tipo de falha configurado." : "No failure types configured."}</p>
          ) : (
            recursos.map(r => {
              const recSubCaps = subCapacidades.filter(sc => sc.recurso_id === r.id);
              return (
                <Card key={r.id}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{r.name_pt}</p>
                          {r.name_en && <p className="text-xs text-muted-foreground">{r.name_en}</p>}
                          {r.description_pt && <p className="text-[10px] text-muted-foreground">{r.description_pt}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRec(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteRec(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {/* Sub-capacidades */}
                    <div className="pl-2 border-l-2 border-border space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {lang === "pt" ? "Sub-capacidades" : "Sub-capabilities"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {recSubCaps.map(sc => (
                          <Badge key={sc.id} variant="outline" className="text-[10px] gap-1 pr-1">
                            {sc.name_pt}
                            <button onClick={() => openEditSubCap(sc)} className="ml-0.5 hover:text-primary"><Pencil className="h-2 w-2" /></button>
                            <button onClick={() => handleDeleteSubCap(sc.id)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                          </Badge>
                        ))}
                        <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => openCreateSubCap(r.id)}>
                          <Plus className="h-2.5 w-2.5 mr-0.5" />{lang === "pt" ? "Adicionar" : "Add"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ===== CENÁRIOS + RELAÇÃO COM RECURSOS ===== */}
        <TabsContent value="cenarios" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateCen} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}</Button>
          </div>
          {cenLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : cenarios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{lang === "pt" ? "Nenhum cenário configurado." : "No scenarios configured."}</p>
          ) : (
            cenarios.map(c => {
              const links = cenRecLinks.filter(l => l.cenario_id === c.id);
              const linkedRecursos = links.map(l => ({ link: l, recurso: recursos.find(r => r.id === l.recurso_id) })).filter(x => x.recurso);
              return (
                <Card key={c.id}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {c.roman && <span className="text-muted-foreground mr-1">{c.roman}.</span>}
                          {lang === "pt" ? c.name_pt : c.name_en || c.name_pt}
                        </p>
                        {c.description_pt && <p className="text-xs text-muted-foreground mt-0.5">{c.description_pt}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCen(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCen(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {/* Recursos associados */}
                    <div className="pl-2 border-l-2 border-border space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {lang === "pt" ? "Tipos de Falha que se perdem" : "Failure Types lost"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {linkedRecursos.map(({ link, recurso }) => (
                          <Badge key={link.id} variant="outline" className="text-[10px] gap-1 pr-1">
                            {recurso!.name_pt}
                            <button onClick={() => unlinkCR.mutate(link.id)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                          </Badge>
                        ))}
                        <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => { setLinkDialog(c.id); setLinkRecursoId(""); }}>
                          <Plus className="h-2.5 w-2.5 mr-0.5" />{lang === "pt" ? "Associar" : "Link"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ===== PLATAFORMAS CMDB ===== */}
        <TabsContent value="platforms" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreatePlat} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Nova" : "New"}</Button>
          </div>
          {platLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : platforms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{lang === "pt" ? "Nenhuma plataforma configurada." : "No platforms configured."}</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{lang === "pt" ? "Nome" : "Name"}</TableHead>
                    <TableHead className="text-xs">{lang === "pt" ? "Tipo DR" : "DR Type"}</TableHead>
                    <TableHead className="text-xs">RTO (h)</TableHead>
                    <TableHead className="text-xs">RPO (h)</TableHead>
                    <TableHead className="text-xs w-20">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platforms.map(p => {
                    const dr = drTypes.find(d => d.id === p.dr_type_id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm font-medium">{p.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{dr?.code || "—"}</Badge></TableCell>
                        <TableCell className="text-sm">{dr?.rto ?? "—"}</TableCell>
                        <TableCell className="text-sm">{dr?.rpo ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditPlat(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeletePlat(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ===== TIPOS DR ===== */}
        <TabsContent value="drtypes" className="space-y-3 mt-3">
          {drLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{lang === "pt" ? "Código" : "Code"}</TableHead>
                    <TableHead className="text-xs">Label</TableHead>
                    <TableHead className="text-xs">RTO (h)</TableHead>
                    <TableHead className="text-xs">RPO (h)</TableHead>
                    <TableHead className="text-xs w-20">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drTypes.map(dr => (
                    <TableRow key={dr.id}>
                      <TableCell className="text-sm font-medium">{dr.code}</TableCell>
                      <TableCell className="text-sm">{dr.label}</TableCell>
                      <TableCell className="text-sm">
                        {editingDR === dr.id ? (
                          <Input type="number" step="0.25" min="0" value={drForm.rto} onChange={e => setDrForm(f => ({ ...f, rto: parseFloat(e.target.value) || 0 }))} className="h-7 w-20 text-xs" />
                        ) : dr.rto}
                      </TableCell>
                      <TableCell className="text-sm">
                        {editingDR === dr.id ? (
                          <Input type="number" step="0.25" min="0" value={drForm.rpo} onChange={e => setDrForm(f => ({ ...f, rpo: parseFloat(e.target.value) || 0 }))} className="h-7 w-20 text-xs" />
                        ) : dr.rpo}
                      </TableCell>
                      <TableCell>
                        {editingDR === dr.id ? (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleSaveDR}>{lang === "pt" ? "Guardar" : "Save"}</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingDR(null)}><X className="h-3 w-3" /></Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDR(dr)}><Pencil className="h-3.5 w-3.5" /></Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ===== BUILDINGS ===== */}
        <TabsContent value="buildings" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateBld} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}</Button>
          </div>
          {bldLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : buildingsList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{lang === "pt" ? "Nenhum edifício configurado." : "No buildings configured."}</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{lang === "pt" ? "Nome" : "Name"}</TableHead>
                    <TableHead className="text-xs text-right w-24">{lang === "pt" ? "Autonomia (h)" : "Autonomy (h)"}</TableHead>
                    <TableHead className="text-xs text-right w-28">{lang === "pt" ? "Combustível (L)" : "Fuel (L)"}</TableHead>
                    <TableHead className="text-xs text-right w-20">{lang === "pt" ? "Geradores" : "Generators"}</TableHead>
                    <TableHead className="text-xs text-right w-16">UPS</TableHead>
                    <TableHead className="text-xs w-20">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildingsList.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="text-sm font-medium">{b.name}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">{b.autonomia_horas_contingencia ?? "—"}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">{b.combustivel_litros?.toLocaleString("pt-PT") ?? "—"}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">{b.num_geradores ?? "—"}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">{b.num_ups ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBld(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteBld(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ===== DEPARTMENTS ===== */}
        <TabsContent value="departments" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateDept} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}</Button>
          </div>
          {deptLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : departmentsList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{lang === "pt" ? "Nenhum departamento configurado." : "No departments configured."}</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{lang === "pt" ? "Nome" : "Name"}</TableHead>
                    <TableHead className="text-xs w-20">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentsList.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm"><span className="font-mono text-xs mr-2 text-muted-foreground">{d.code || "—"}</span>{d.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDept(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteDept(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ===== DOCUMENT CATEGORIES ===== */}
        <TabsContent value="doccats" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateDocCat} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Nova" : "New"}</Button>
          </div>
          {docCatLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : docCats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{lang === "pt" ? "Sem categorias" : "No categories"}</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">{lang === "pt" ? "Nome (PT)" : "Name (PT)"}</TableHead>
                  <TableHead className="text-xs">{lang === "pt" ? "Nome (EN)" : "Name (EN)"}</TableHead>
                  <TableHead className="text-xs w-24"></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {docCats.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm">{d.name_pt}</TableCell>
                      <TableCell className="text-sm">{d.name_en}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDocCat(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteDocCat(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== DIALOGS ===== */}

      {/* Assign Role */}
      <Dialog open={!!roleDialog} onOpenChange={(o) => !o && setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === "pt" ? "Atribuir Perfil" : "Assign Role"} — {roleDialog?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder={lang === "pt" ? "Selecionar perfil..." : "Select role..."} /></SelectTrigger>
              <SelectContent>{allRoles.map(r => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleAssignRole} disabled={!selectedRole || assignRole.isPending} className="w-full">
              {assignRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Atribuir" : "Assign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Process */}
      <Dialog open={bpDialog} onOpenChange={setBpDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingBP ? (lang === "pt" ? "Editar Processo" : "Edit Process") : (lang === "pt" ? "Novo Processo" : "New Process")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Tipo de Função" : "Function Type"}</Label>
              <Input value={bpForm.tipo_funcao} onChange={e => setBpForm(f => ({ ...f, tipo_funcao: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Função" : "Function"}</Label>
              <Input value={bpForm.funcao} onChange={e => setBpForm(f => ({ ...f, funcao: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Macro Processo" : "Macro Process"}</Label>
              <Input value={bpForm.macro_processo} onChange={e => setBpForm(f => ({ ...f, macro_processo: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Processo" : "Process"}</Label>
              <Input value={bpForm.processo} onChange={e => setBpForm(f => ({ ...f, processo: e.target.value }))} className="bg-secondary border-border" /></div>
            <Button onClick={handleSaveBP} disabled={!bpForm.tipo_funcao || createBP.isPending || updateBP.isPending} className="w-full">
              {(createBP.isPending || updateBP.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurso */}
      <Dialog open={recDialog} onOpenChange={setRecDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingRec ? (lang === "pt" ? "Editar Tipo de Falha" : "Edit Failure Type") : (lang === "pt" ? "Novo Tipo de Falha" : "New Failure Type")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{lang === "pt" ? "Nome (PT)" : "Name (PT)"}</Label>
              <Input value={recForm.name_pt} onChange={e => setRecForm(f => ({ ...f, name_pt: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>{lang === "pt" ? "Nome (EN)" : "Name (EN)"}</Label>
              <Input value={recForm.name_en} onChange={e => setRecForm(f => ({ ...f, name_en: e.target.value }))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>{lang === "pt" ? "Ícone" : "Icon"}</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={recForm.icon}
                onChange={e => setRecForm(f => ({ ...f, icon: e.target.value }))}
              >
                {["Server","Building2","Users","Truck","MapPin","ShieldAlert","Monitor","Home","UserCheck","Network","Zap"].map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>{lang === "pt" ? "Descrição (PT)" : "Description (PT)"}</Label>
              <Textarea rows={3} value={recForm.description_pt} onChange={e => setRecForm(f => ({ ...f, description_pt: e.target.value }))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>{lang === "pt" ? "Descrição (EN)" : "Description (EN)"}</Label>
              <Textarea rows={3} value={recForm.description_en} onChange={e => setRecForm(f => ({ ...f, description_en: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecDialog(false)}>{lang === "pt" ? "Cancelar" : "Cancel"}</Button>
            <Button onClick={handleSaveRec} disabled={!recForm.name_pt || createRec.isPending || updateRec.isPending}>
              {(createRec.isPending || updateRec.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Cenário */}
      <Dialog open={cenDialog} onOpenChange={setCenDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCen ? (lang === "pt" ? "Editar Cenário" : "Edit Scenario") : (lang === "pt" ? "Novo Cenário" : "New Scenario")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Numeração (romano)" : "Roman numeral"}</Label>
              <Input value={cenForm.roman} onChange={e => setCenForm(f => ({ ...f, roman: e.target.value }))} placeholder="I, II, III..." className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (PT)" : "Name (PT)"}</Label>
              <Input value={cenForm.name_pt} onChange={e => setCenForm(f => ({ ...f, name_pt: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (EN)" : "Name (EN)"}</Label>
              <Input value={cenForm.name_en} onChange={e => setCenForm(f => ({ ...f, name_en: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Descrição" : "Description"}</Label>
              <Input value={cenForm.description_pt} onChange={e => setCenForm(f => ({ ...f, description_pt: e.target.value }))} className="bg-secondary border-border" /></div>
            <Button onClick={handleSaveCen} disabled={!cenForm.name_pt || createCen.isPending || updateCen.isPending} className="w-full">
              {(createCen.isPending || updateCen.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Cenário <-> Recurso */}
      <Dialog open={!!linkDialog} onOpenChange={(o) => !o && setLinkDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === "pt" ? "Associar Tipo de Falha ao Cenário" : "Link Failure Type to Scenario"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={linkRecursoId} onValueChange={setLinkRecursoId}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder={lang === "pt" ? "Selecionar tipo de falha..." : "Select failure type..."} /></SelectTrigger>
              <SelectContent>
                {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.name_pt}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleLink} disabled={!linkRecursoId || linkCR.isPending} className="w-full">
              {linkCR.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Associar" : "Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Platform */}
      <Dialog open={platDialog} onOpenChange={setPlatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingPlat ? (lang === "pt" ? "Editar Plataforma" : "Edit Platform") : (lang === "pt" ? "Nova Plataforma" : "New Platform")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome" : "Name"}</Label>
              <Input value={platForm.name} onChange={e => setPlatForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Tipo DR" : "DR Type"}</Label>
              <Select value={platForm.dr_type_id} onValueChange={v => setPlatForm(f => ({ ...f, dr_type_id: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder={lang === "pt" ? "Selecionar..." : "Select..."} /></SelectTrigger>
                <SelectContent>
                  {drTypes.map(dr => <SelectItem key={dr.id} value={dr.id}>{dr.code} — {dr.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSavePlat} disabled={!platForm.name || createPlat.isPending || updatePlat.isPending} className="w-full">
              {(createPlat.isPending || updatePlat.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Building */}
      <Dialog open={bldDialog} onOpenChange={setBldDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingBld ? (lang === "pt" ? "Editar Edifício" : "Edit Building") : (lang === "pt" ? "Novo Edifício" : "New Building")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Edifício / Zona" : "Building / Zone"}</Label>
              <Input value={bldForm.name} onChange={e => setBldForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{lang === "pt" ? "Autonomia (h)" : "Autonomy (h)"}</Label>
                <Input type="number" step="0.5" value={bldForm.autonomia_horas_contingencia} onChange={e => setBldForm(f => ({ ...f, autonomia_horas_contingencia: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{lang === "pt" ? "Combustível (L)" : "Fuel (L)"}</Label>
                <Input type="number" step="1" value={bldForm.combustivel_litros} onChange={e => setBldForm(f => ({ ...f, combustivel_litros: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{lang === "pt" ? "Nº Geradores" : "Generators"}</Label>
                <Input type="number" step="1" value={bldForm.num_geradores} onChange={e => setBldForm(f => ({ ...f, num_geradores: e.target.value }))} className="bg-secondary border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Nº UPS</Label>
                <Input type="number" step="1" value={bldForm.num_ups} onChange={e => setBldForm(f => ({ ...f, num_ups: e.target.value }))} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Depósitos" : "Tanks"}</Label>
              <Textarea rows={2} value={bldForm.depositos} onChange={e => setBldForm(f => ({ ...f, depositos: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Observações" : "Notes"}</Label>
              <Textarea rows={3} value={bldForm.observacoes} onChange={e => setBldForm(f => ({ ...f, observacoes: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <Button onClick={handleSaveBld} disabled={!bldForm.name.trim() || createBld.isPending || updateBld.isPending} className="w-full">
              {(createBld.isPending || updateBld.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-Capacidade */}
      <Dialog open={subCapDialog} onOpenChange={setSubCapDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSubCap ? (lang === "pt" ? "Editar Sub-capacidade" : "Edit Sub-capability") : (lang === "pt" ? "Nova Sub-capacidade" : "New Sub-capability")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (PT)" : "Name (PT)"}</Label>
              <Input value={subCapForm.name_pt} onChange={e => setSubCapForm(f => ({ ...f, name_pt: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (EN)" : "Name (EN)"}</Label>
              <Input value={subCapForm.name_en} onChange={e => setSubCapForm(f => ({ ...f, name_en: e.target.value }))} className="bg-secondary border-border" /></div>
            <Button onClick={handleSaveSubCap} disabled={!subCapForm.name_pt || createSubCap.isPending || updateSubCap.isPending} className="w-full">
              {(createSubCap.isPending || updateSubCap.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Department Dialog */}
      <Dialog open={deptDialog} onOpenChange={setDeptDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingDept ? (lang === "pt" ? "Editar Departamento" : "Edit Department") : (lang === "pt" ? "Novo Departamento" : "New Department")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Código" : "Code"}</Label>
                <Input value={deptForm.code} onChange={e => setDeptForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="DSI" className="bg-secondary border-border font-mono" /></div>
              <div className="space-y-1.5 col-span-2"><Label className="text-sm font-medium">{lang === "pt" ? "Nome" : "Name"}</Label>
                <Input value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border" /></div>
            </div>
            <Button onClick={handleSaveDept} disabled={!deptForm.name || createDept.isPending || updateDept.isPending} className="w-full">
              {(createDept.isPending || updateDept.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DOCUMENT CATEGORIES TAB CONTENT ===== */}
      {/* (inserted via TabsContent in the Tabs block) */}

      {/* Document Category Dialog */}
      <Dialog open={docCatDialog} onOpenChange={setDocCatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingDocCat ? (lang === "pt" ? "Editar Categoria" : "Edit Category") : (lang === "pt" ? "Nova Categoria" : "New Category")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (PT)" : "Name (PT)"}</Label>
              <Input value={docCatForm.name_pt} onChange={e => setDocCatForm(f => ({ ...f, name_pt: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (EN)" : "Name (EN)"}</Label>
              <Input value={docCatForm.name_en} onChange={e => setDocCatForm(f => ({ ...f, name_en: e.target.value }))} className="bg-secondary border-border" /></div>
            <Button onClick={handleSaveDocCat} disabled={!docCatForm.name_pt || createDocCat.isPending || updateDocCat.isPending} className="w-full">
              {(createDocCat.isPending || updateDocCat.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackOfficeSection;
