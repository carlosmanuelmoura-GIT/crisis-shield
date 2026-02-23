import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, UserCog, Briefcase, ShieldAlert, Link2, X } from "lucide-react";
import { useAllUsersWithRoles, useAssignRole, useRemoveRole } from "@/hooks/useUserRoles";
import { useBusinessProcesses, useCreateBusinessProcess, useUpdateBusinessProcess, useDeleteBusinessProcess } from "@/hooks/useBusinessProcesses";
import { useRecursos, useCreateRecurso, useUpdateRecurso, useDeleteRecurso } from "@/hooks/useRecursos";
import { useCenarios, useCreateCenario, useUpdateCenario, useDeleteCenario, useCenarioRecursos, useLinkCenarioRecurso, useUnlinkCenarioRecurso } from "@/hooks/useCenarios";
import { useToast } from "@/hooks/use-toast";

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
  const [recForm, setRecForm] = useState({ name_pt: "", name_en: "", description_pt: "", icon: "" });

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
  const openCreateRec = () => { setEditingRec(null); setRecForm({ name_pt: "", name_en: "", description_pt: "", icon: "" }); setRecDialog(true); };
  const openEditRec = (r: typeof recursos[0]) => { setEditingRec(r.id); setRecForm({ name_pt: r.name_pt, name_en: r.name_en, description_pt: r.description_pt, icon: r.icon }); setRecDialog(true); };
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">Back Office</h2>

      <Tabs defaultValue="roles">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="roles" className="text-xs"><UserCog className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Perfis" : "Roles"}</TabsTrigger>
          <TabsTrigger value="bp" className="text-xs"><Briefcase className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Processos" : "Processes"}</TabsTrigger>
          <TabsTrigger value="recursos" className="text-xs"><ShieldAlert className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Recursos" : "Resources"}</TabsTrigger>
          <TabsTrigger value="cenarios" className="text-xs"><Link2 className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Cenários" : "Scenarios"}</TabsTrigger>
        </TabsList>

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
            <Button size="sm" onClick={openCreateRec} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo" : "New"}</Button>
          </div>
          {recLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : recursos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{lang === "pt" ? "Nenhum recurso configurado." : "No resources configured."}</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{lang === "pt" ? "Ícone" : "Icon"}</TableHead>
                    <TableHead className="text-xs">{lang === "pt" ? "Nome (PT)" : "Name (PT)"}</TableHead>
                    <TableHead className="text-xs">{lang === "pt" ? "Nome (EN)" : "Name (EN)"}</TableHead>
                    <TableHead className="text-xs">{lang === "pt" ? "Descrição" : "Description"}</TableHead>
                    <TableHead className="text-xs w-20">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recursos.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-lg">{r.icon || "📦"}</TableCell>
                      <TableCell className="text-sm font-medium">{r.name_pt}</TableCell>
                      <TableCell className="text-sm">{r.name_en || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{r.description_pt || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRec(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteRec(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                        {lang === "pt" ? "Recursos que se perdem" : "Resources lost"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {linkedRecursos.map(({ link, recurso }) => (
                          <Badge key={link.id} variant="outline" className="text-[10px] gap-1 pr-1">
                            {recurso!.icon || "📦"} {recurso!.name_pt}
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
        <DialogContent>
          <DialogHeader><DialogTitle>{editingRec ? (lang === "pt" ? "Editar Recurso" : "Edit Resource") : (lang === "pt" ? "Novo Recurso" : "New Resource")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Ícone (emoji)" : "Icon (emoji)"}</Label>
              <Input value={recForm.icon} onChange={e => setRecForm(f => ({ ...f, icon: e.target.value }))} placeholder="💻 🏢 👥 ⚡ 🌐" className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (PT)" : "Name (PT)"}</Label>
              <Input value={recForm.name_pt} onChange={e => setRecForm(f => ({ ...f, name_pt: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Nome (EN)" : "Name (EN)"}</Label>
              <Input value={recForm.name_en} onChange={e => setRecForm(f => ({ ...f, name_en: e.target.value }))} className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">{lang === "pt" ? "Descrição" : "Description"}</Label>
              <Input value={recForm.description_pt} onChange={e => setRecForm(f => ({ ...f, description_pt: e.target.value }))} className="bg-secondary border-border" /></div>
            <Button onClick={handleSaveRec} disabled={!recForm.name_pt || createRec.isPending || updateRec.isPending} className="w-full">
              {(createRec.isPending || updateRec.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
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
          <DialogHeader><DialogTitle>{lang === "pt" ? "Associar Recurso ao Cenário" : "Link Resource to Scenario"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={linkRecursoId} onValueChange={setLinkRecursoId}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder={lang === "pt" ? "Selecionar recurso..." : "Select resource..."} /></SelectTrigger>
              <SelectContent>
                {recursos.map(r => <SelectItem key={r.id} value={r.id}>{r.icon || "📦"} {r.name_pt}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleLink} disabled={!linkRecursoId || linkCR.isPending} className="w-full">
              {linkCR.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{lang === "pt" ? "Associar" : "Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackOfficeSection;
