import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useBIAProcesses, useCreateBIAProcess, useUpdateBIAProcess, useDeleteBIAProcess, DBBIAProcess } from "@/hooks/useBIAProcesses";
import { useCMDBPlatforms, useDRTypes, useBIAProcessPlatforms, useLinkBIAProcessPlatform, useUnlinkBIAProcessPlatform } from "@/hooks/useCMDBPlatforms";
import { toast } from "sonner";

const critColor: Record<string, string> = {
  critical: "hsl(0, 72%, 51%)",
  high: "hsl(45, 90%, 55%)",
  medium: "hsl(220, 5%, 55%)",
};

const BIASection: React.FC = () => {
  const { lang } = useApp();
  const { data: biaProcesses = [], isLoading } = useBIAProcesses();
  const createMut = useCreateBIAProcess();
  const updateMut = useUpdateBIAProcess();
  const deleteMut = useDeleteBIAProcess();
  const { data: platforms = [] } = useCMDBPlatforms();
  const { data: drTypes = [] } = useDRTypes();
  const { data: procPlatLinks = [] } = useBIAProcessPlatforms();
  const linkPlatform = useLinkBIAProcessPlatform();
  const unlinkPlatform = useUnlinkBIAProcessPlatform();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBBIAProcess | null>(null);
  const [form, setForm] = useState({ name_pt: "", name_en: "", rto: 0, rpo: 0, criticality: "medium", dependencies: [] as string[] });
  const [linkDialog, setLinkDialog] = useState<string | null>(null);
  const [linkPlatId, setLinkPlatId] = useState("");

  const t = (pt: string, en: string) => lang === "pt" ? pt : en;

  const chartData = biaProcesses.map(p => ({
    name: t(p.name_pt, p.name_en),
    RTO: p.rto,
    RPO: p.rpo,
    criticality: p.criticality,
  }));

  const openNew = () => {
    setEditing(null);
    setForm({ name_pt: "", name_en: "", rto: 0, rpo: 0, criticality: "medium", dependencies: [] });
    setDialogOpen(true);
  };

  const openEdit = (p: DBBIAProcess) => {
    setEditing(p);
    setForm({ name_pt: p.name_pt, name_en: p.name_en, rto: p.rto, rpo: p.rpo, criticality: p.criticality, dependencies: p.dependencies || [] });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...form });
        toast.success(lang === "pt" ? "Processo atualizado" : "Process updated");
      } else {
        await createMut.mutateAsync(form);
        toast.success(lang === "pt" ? "Processo criado" : "Process created");
      }
      setDialogOpen(false);
    } catch {
      toast.error(lang === "pt" ? "Erro ao guardar" : "Error saving");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success(lang === "pt" ? "Processo eliminado" : "Process deleted");
    } catch {
      toast.error(lang === "pt" ? "Erro ao eliminar" : "Error deleting");
    }
  };

  const toggleDep = (depId: string) => {
    setForm(f => ({
      ...f,
      dependencies: f.dependencies.includes(depId)
        ? f.dependencies.filter(d => d !== depId)
        : [...f.dependencies, depId],
    }));
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Análise de Impacto (BIA)" : "Business Impact Analysis (BIA)"}
        </h2>
        <Button size="sm" variant="outline" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> {lang === "pt" ? "Novo" : "New"}
        </Button>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">{lang === "pt" ? "RTO vs RPO (horas)" : "RTO vs RPO (hours)"}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(60, 5%, 70%)" }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "hsl(60, 5%, 70%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(220, 10%, 18%)", border: "1px solid hsl(220, 8%, 28%)", color: "hsl(60, 5%, 90%)" }} />
              <Bar dataKey="RTO" fill="hsl(0, 72%, 51%)" radius={[0, 2, 2, 0]} />
              <Bar dataKey="RPO" fill="hsl(45, 90%, 55%)" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dependency map by platforms */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">{lang === "pt" ? "Mapa de Dependências por Plataformas" : "Dependency Map by Platforms"}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="space-y-3">
            {biaProcesses.map(p => {
              const deps = (p.dependencies || []).map(d => {
                const found = biaProcesses.find(bp => bp.id === d);
                return found ? t(found.name_pt, found.name_en) : d;
              });
              const pLinks = procPlatLinks.filter(l => l.bia_process_id === p.id);
              const linkedPlats = pLinks.map(l => ({
                link: l,
                platform: platforms.find(pl => pl.id === l.platform_id),
              })).filter(x => x.platform);

              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-block w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: critColor[p.criticality] }} />
                    <div className="flex-1">
                      <span className="font-medium">{t(p.name_pt, p.name_en)}</span>
                      {deps.length > 0 && (
                        <span className="text-muted-foreground"> → {deps.join(", ")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(p)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {/* Platforms for this process */}
                  <div className="pl-5 flex flex-wrap gap-1 items-center">
                    {linkedPlats.map(({ link, platform }) => {
                      const dr = drTypes.find(d => d.id === platform!.dr_type_id);
                      return (
                        <Badge key={link.id} variant="outline" className="text-[10px] gap-1 pr-1">
                          🖥 {platform!.name} {dr ? `(${dr.code})` : ""}
                          <button onClick={() => unlinkPlatform.mutate(link.id)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                        </Badge>
                      );
                    })}
                    <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => { setLinkDialog(p.id); setLinkPlatId(""); }}>
                      <Plus className="h-2.5 w-2.5 mr-0.5" />{lang === "pt" ? "Plataforma" : "Platform"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create process dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? (lang === "pt" ? "Editar Processo" : "Edit Process") : (lang === "pt" ? "Novo Processo" : "New Process")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Nome (PT)</Label><Input value={form.name_pt} onChange={e => setForm(f => ({ ...f, name_pt: e.target.value }))} /></div>
              <div><Label>Name (EN)</Label><Input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>RTO ({lang === "pt" ? "horas" : "hours"})</Label><Input type="number" step="0.5" min="0" value={form.rto} onChange={e => setForm(f => ({ ...f, rto: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>RPO ({lang === "pt" ? "horas" : "hours"})</Label><Input type="number" step="0.5" min="0" value={form.rpo} onChange={e => setForm(f => ({ ...f, rpo: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div>
              <Label>{lang === "pt" ? "Criticidade" : "Criticality"}</Label>
              <Select value={form.criticality} onValueChange={v => setForm(f => ({ ...f, criticality: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{lang === "pt" ? "Crítico" : "Critical"}</SelectItem>
                  <SelectItem value="high">{lang === "pt" ? "Alto" : "High"}</SelectItem>
                  <SelectItem value="medium">{lang === "pt" ? "Médio" : "Medium"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{lang === "pt" ? "Dependências" : "Dependencies"}</Label>
              <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                {biaProcesses.filter(bp => bp.id !== editing?.id).map(bp => (
                  <div key={bp.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.dependencies.includes(bp.id)}
                      onCheckedChange={() => toggleDep(bp.id)}
                    />
                    <span className="text-sm">{t(bp.name_pt, bp.name_en)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{lang === "pt" ? "Cancelar" : "Cancel"}</Button>
            <Button onClick={handleSave} disabled={!form.name_pt}>{lang === "pt" ? "Guardar" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link platform to BIA process */}
      <Dialog open={!!linkDialog} onOpenChange={(o) => !o && setLinkDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === "pt" ? "Associar Plataforma" : "Link Platform"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={linkPlatId} onValueChange={setLinkPlatId}>
              <SelectTrigger><SelectValue placeholder={lang === "pt" ? "Selecionar plataforma..." : "Select platform..."} /></SelectTrigger>
              <SelectContent>
                {platforms.map(p => {
                  const dr = drTypes.find(d => d.id === p.dr_type_id);
                  return <SelectItem key={p.id} value={p.id}>🖥 {p.name} {dr ? `(${dr.code})` : ""}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Button onClick={async () => {
              if (!linkDialog || !linkPlatId) return;
              try {
                await linkPlatform.mutateAsync({ bia_process_id: linkDialog, platform_id: linkPlatId });
                setLinkPlatId("");
                toast.success(lang === "pt" ? "Plataforma associada" : "Platform linked");
              } catch { toast.error(lang === "pt" ? "Erro ao associar" : "Error linking"); }
            }} disabled={!linkPlatId || linkPlatform.isPending} className="w-full">
              {lang === "pt" ? "Associar" : "Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BIASection;
