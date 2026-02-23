import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, UserCog, Briefcase } from "lucide-react";
import {
  useAllUsersWithRoles, useAssignRole, useRemoveRole,
} from "@/hooks/useUserRoles";
import {
  useBusinessProcesses, useCreateBusinessProcess,
  useUpdateBusinessProcess, useDeleteBusinessProcess,
} from "@/hooks/useBusinessProcesses";
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

  // User roles
  const { data: users = [], isLoading: usersLoading } = useAllUsersWithRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const [roleDialog, setRoleDialog] = useState<{ user_id: string; name: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  // Business processes
  const { data: processes = [], isLoading: bpLoading } = useBusinessProcesses();
  const createBP = useCreateBusinessProcess();
  const updateBP = useUpdateBusinessProcess();
  const deleteBP = useDeleteBusinessProcess();
  const [bpDialog, setBpDialog] = useState(false);
  const [editingBP, setEditingBP] = useState<string | null>(null);
  const [bpForm, setBpForm] = useState({ name_pt: "", name_en: "", description_pt: "", description_en: "", tipo_funcao: "processo" });

  const openCreateBP = () => {
    setEditingBP(null);
    setBpForm({ name_pt: "", name_en: "", description_pt: "", description_en: "", tipo_funcao: "processo" });
    setBpDialog(true);
  };

  const openEditBP = (bp: typeof processes[0]) => {
    setEditingBP(bp.id);
    setBpForm({ name_pt: bp.name_pt, name_en: bp.name_en, description_pt: bp.description_pt, description_en: bp.description_en, tipo_funcao: bp.tipo_funcao || "processo" });
    setBpDialog(true);
  };

  const handleSaveBP = async () => {
    try {
      if (editingBP) {
        await updateBP.mutateAsync({ id: editingBP, ...bpForm });
      } else {
        await createBP.mutateAsync(bpForm);
      }
      setBpDialog(false);
      toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteBP = async (id: string) => {
    try {
      await deleteBP.mutateAsync(id);
      toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleAssignRole = async () => {
    if (!roleDialog || !selectedRole) return;
    try {
      await assignRole.mutateAsync({ user_id: roleDialog.user_id, role: selectedRole });
      setRoleDialog(null);
      setSelectedRole("");
      toast({ title: lang === "pt" ? "Perfil atribuído" : "Role assigned" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleRemoveRole = async (user_id: string, role: string) => {
    try {
      await removeRole.mutateAsync({ user_id, role });
      toast({ title: lang === "pt" ? "Perfil removido" : "Role removed" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Back Office" : "Back Office"}
      </h2>

      <Tabs defaultValue="roles">
        <TabsList className="bg-secondary">
          <TabsTrigger value="roles" className="text-xs">
            <UserCog className="h-3.5 w-3.5 mr-1.5" />
            {lang === "pt" ? "Perfis de Utilizador" : "User Roles"}
          </TabsTrigger>
          <TabsTrigger value="bp" className="text-xs">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            {lang === "pt" ? "Processos de Negócio" : "Business Processes"}
          </TabsTrigger>
        </TabsList>

        {/* User Roles Tab */}
        <TabsContent value="roles" className="space-y-3 mt-3">
          {usersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            users.map(u => (
              <Card key={u.user_id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.display_name || "—"}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">
                            {lang === "pt" ? "Sem perfil" : "No role"}
                          </span>
                        )}
                        {u.roles.map(r => (
                          <Badge key={r} variant="secondary" className="text-[10px] gap-1">
                            {roleLabels[r] || r}
                            <button
                              onClick={() => handleRemoveRole(u.user_id, r)}
                              className="ml-0.5 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline" size="sm" className="h-7 text-xs shrink-0"
                      onClick={() => { setRoleDialog({ user_id: u.user_id, name: u.display_name || "—" }); setSelectedRole(""); }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {lang === "pt" ? "Perfil" : "Role"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Business Processes Tab */}
        <TabsContent value="bp" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateBP} className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {lang === "pt" ? "Novo" : "New"}
            </Button>
          </div>

          {bpLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : processes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {lang === "pt" ? "Nenhum processo configurado." : "No processes configured."}
            </p>
          ) : (
            processes.map(bp => (
              <Card key={bp.id}>
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{lang === "pt" ? bp.name_pt : bp.name_en || bp.name_pt}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {bp.tipo_funcao === "funcao" ? "Função" : bp.tipo_funcao === "macro_processo" ? "Macro Processo" : "Processo"}
                      </Badge>
                    </div>
                    {(bp.description_pt || bp.description_en) && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {lang === "pt" ? bp.description_pt : bp.description_en || bp.description_pt}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBP(bp)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteBP(bp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Role Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={(o) => !o && setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === "pt" ? "Atribuir Perfil" : "Assign Role"} — {roleDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder={lang === "pt" ? "Selecionar perfil..." : "Select role..."} />
              </SelectTrigger>
              <SelectContent>
                {allRoles.map(r => (
                  <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignRole} disabled={!selectedRole || assignRole.isPending} className="w-full">
              {assignRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lang === "pt" ? "Atribuir" : "Assign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Process Dialog */}
      <Dialog open={bpDialog} onOpenChange={setBpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBP
                ? (lang === "pt" ? "Editar Processo" : "Edit Process")
                : (lang === "pt" ? "Novo Processo de Negócio" : "New Business Process")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={bpForm.tipo_funcao} onValueChange={(v) => setBpForm(f => ({ ...f, tipo_funcao: v }))}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Tipo Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funcao">Função</SelectItem>
                <SelectItem value="macro_processo">Macro Processo</SelectItem>
                <SelectItem value="processo">Processo</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder={lang === "pt" ? "Nome (PT)" : "Name (PT)"} value={bpForm.name_pt}
              onChange={e => setBpForm(f => ({ ...f, name_pt: e.target.value }))} className="bg-secondary border-border" />
            <Input placeholder={lang === "pt" ? "Nome (EN)" : "Name (EN)"} value={bpForm.name_en}
              onChange={e => setBpForm(f => ({ ...f, name_en: e.target.value }))} className="bg-secondary border-border" />
            <Input placeholder={lang === "pt" ? "Descrição (PT)" : "Description (PT)"} value={bpForm.description_pt}
              onChange={e => setBpForm(f => ({ ...f, description_pt: e.target.value }))} className="bg-secondary border-border" />
            <Input placeholder={lang === "pt" ? "Descrição (EN)" : "Description (EN)"} value={bpForm.description_en}
              onChange={e => setBpForm(f => ({ ...f, description_en: e.target.value }))} className="bg-secondary border-border" />
            <Button onClick={handleSaveBP} disabled={!bpForm.name_pt || createBP.isPending || updateBP.isPending} className="w-full">
              {(createBP.isPending || updateBP.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackOfficeSection;
