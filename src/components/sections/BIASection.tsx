import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Pencil, Trash2, X, Server, Database, Link2 } from "lucide-react";
import { useBIAProcesses, useCreateBIAProcess, useUpdateBIAProcess, useDeleteBIAProcess, DBBIAProcess } from "@/hooks/useBIAProcesses";
import { useBusinessProcesses } from "@/hooks/useBusinessProcesses";
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
  const { data: businessProcesses = [] } = useBusinessProcesses();
  const { data: procPlatLinks = [] } = useBIAProcessPlatforms();
  const linkPlatform = useLinkBIAProcessPlatform();
  const unlinkPlatform = useUnlinkBIAProcessPlatform();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBBIAProcess | null>(null);
  const [form, setForm] = useState({
    name_pt: "", name_en: "", rto: 0, rpo: 0, criticality: "medium",
    business_process_id: null as string | null,
    dr_type_id: null as string | null,
  });
  const [linkDialog, setLinkDialog] = useState<string | null>(null);
  const [linkPlatId, setLinkPlatId] = useState("");
  const [filterBPId, setFilterBPId] = useState<string>("__all");

  // Cascading filters for business process selection in dialog
  const [selTipoFuncao, setSelTipoFuncao] = useState<string>("__all");
  const [selFuncao, setSelFuncao] = useState<string>("__all");
  const [selMacro, setSelMacro] = useState<string>("__all");

  const t = (pt: string, en: string) => lang === "pt" ? pt : en;

  // When DR type changes, auto-fill RTO/RPO from DR type
  const handleDRTypeChange = (drTypeId: string) => {
    const dr = drTypes.find(d => d.id === drTypeId);
    setForm(f => ({
      ...f,
      dr_type_id: drTypeId || null,
      rto: dr ? dr.rto : f.rto,
      rpo: dr ? dr.rpo : f.rpo,
    }));
  };

  // Cascading filter options
  const tipoFuncoes = [...new Set(businessProcesses.map(bp => bp.tipo_funcao))].sort();
  const funcoes = [...new Set(businessProcesses
    .filter(bp => selTipoFuncao === "__all" || bp.tipo_funcao === selTipoFuncao)
    .map(bp => bp.funcao))].sort();
  const macros = [...new Set(businessProcesses
    .filter(bp => (selTipoFuncao === "__all" || bp.tipo_funcao === selTipoFuncao) &&
                  (selFuncao === "__all" || bp.funcao === selFuncao))
    .map(bp => bp.macro_processo))].sort();
  const filteredBPs = businessProcesses.filter(bp =>
    (selTipoFuncao === "__all" || bp.tipo_funcao === selTipoFuncao) &&
    (selFuncao === "__all" || bp.funcao === selFuncao) &&
    (selMacro === "__all" || bp.macro_processo === selMacro)
  );

  const resetCascade = (bp?: { tipo_funcao: string; funcao: string; macro_processo: string }) => {
    setSelTipoFuncao(bp?.tipo_funcao || "__all");
    setSelFuncao(bp?.funcao || "__all");
    setSelMacro(bp?.macro_processo || "__all");
  };

  const chartData = biaProcesses.map(p => ({
    name: t(p.name_pt, p.name_en),
    RTO: p.rto,
    RPO: p.rpo,
    criticality: p.criticality,
  }));

  const openNew = () => {
    setEditing(null);
    setForm({ name_pt: "", name_en: "", rto: 0, rpo: 0, criticality: "medium", business_process_id: null, dr_type_id: null });
    resetCascade();
    setDialogOpen(true);
  };

  const openEdit = (p: DBBIAProcess) => {
    setEditing(p);
    setForm({
      name_pt: p.name_pt, name_en: p.name_en, rto: p.rto, rpo: p.rpo,
      criticality: p.criticality,
      business_process_id: p.business_process_id || null,
      dr_type_id: p.dr_type_id || null,
    });
    const bp = p.business_process_id ? businessProcesses.find(b => b.id === p.business_process_id) : undefined;
    resetCascade(bp);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...form });
        toast.success(t("Processo atualizado", "Process updated"));
      } else {
        await createMut.mutateAsync(form);
        toast.success(t("Processo criado", "Process created"));
      }
      setDialogOpen(false);
    } catch {
      toast.error(t("Erro ao guardar", "Error saving"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success(t("Processo eliminado", "Process deleted"));
    } catch {
      toast.error(t("Erro ao eliminar", "Error deleting"));
    }
  };


  if (isLoading) return <div className="text-sm text-muted-foreground">{t("A carregar...", "Loading...")}</div>;

  // Filter and group BIAs by business process
  const filtered = filterBPId === "__all"
    ? biaProcesses
    : biaProcesses.filter(p => p.business_process_id === filterBPId);

  const grouped = new Map<string | null, DBBIAProcess[]>();
  filtered.forEach(p => {
    const key = p.business_process_id || null;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {t("Análise de Impacto (BIA)", "Business Impact Analysis (BIA)")}
        </h2>
        <div className="flex items-center gap-2">
          <Select value={filterBPId} onValueChange={setFilterBPId}>
            <SelectTrigger className="w-[220px] h-8 text-xs">
              <SelectValue placeholder={t("Filtrar por processo...", "Filter by process...")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">{t("Todos os processos", "All processes")}</SelectItem>
              {businessProcesses.map(bp => (
                <SelectItem key={bp.id} value={bp.id}>
                  {bp.funcao} › {bp.processo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" /> {t("Nova BIA", "New BIA")}
          </Button>
        </div>
      </div>

      {/* Chart */}
      {biaProcesses.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm">{t("RTO vs RPO (horas)", "RTO vs RPO (hours)")}</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }} />
                <Bar dataKey="RTO" fill="hsl(0, 72%, 51%)" radius={[0, 2, 2, 0]} />
                <Bar dataKey="RPO" fill="hsl(45, 90%, 55%)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* BIAs grouped by Business Process */}
      {Array.from(grouped.entries()).map(([bpId, bias]) => {
        const bp = bpId ? businessProcesses.find(b => b.id === bpId) : null;
        return (
          <Card key={bpId || "__none"}>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                {bp ? `${bp.funcao} › ${bp.processo}` : t("Processo não definido", "Process not set")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2">
              {bias.map(p => {
                const dr = p.dr_type_id ? drTypes.find(d => d.id === p.dr_type_id) : null;
                const pLinks = procPlatLinks.filter(l => l.bia_process_id === p.id);
                const linkedPlats = pLinks.map(l => ({
                  link: l,
                  platform: platforms.find(pl => pl.id === l.platform_id),
                })).filter(x => x.platform);

                return (
                  <div key={p.id} className="rounded-md border border-border/50 bg-secondary/20 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: critColor[p.criticality] }} />
                          <span className="text-sm font-semibold">{t(p.name_pt, p.name_en)}</span>
                          {dr && (
                            <Badge variant="outline" className="text-[10px] h-5">{dr.code}</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            RTO: {p.rto}h · RPO: {p.rpo}h
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Platform dependencies */}
                    <div className="flex flex-wrap gap-1 items-center">
                      <Server className="h-3 w-3 text-muted-foreground" />
                      {linkedPlats.map(({ link, platform }) => {
                        const platDr = drTypes.find(d => d.id === platform!.dr_type_id);
                        return (
                          <Badge key={link.id} variant="outline" className="text-[10px] gap-1 pr-1">
                            {platform!.name} {platDr ? `(${platDr.code})` : ""}
                            <button onClick={() => unlinkPlatform.mutate(link.id)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                          </Badge>
                        );
                      })}
                      <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => { setLinkDialog(p.id); setLinkPlatId(""); }}>
                        <Plus className="h-2.5 w-2.5 mr-0.5" />{t("Plataforma", "Platform")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {biaProcesses.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">{t("Sem processos BIA.", "No BIA processes.")}</p>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("Editar BIA", "Edit BIA") : t("Nova BIA", "New BIA")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Business Process - Cascading filters */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Processo de Negócio", "Business Process")}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">{t("Tipo Função", "Function Type")}</Label>
                  <Select value={selTipoFuncao} onValueChange={v => { setSelTipoFuncao(v); setSelFuncao("__all"); setSelMacro("__all"); setForm(f => ({ ...f, business_process_id: null })); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="__all">{t("Todos", "All")}</SelectItem>
                      {tipoFuncoes.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">{t("Função", "Function")}</Label>
                  <Select value={selFuncao} onValueChange={v => { setSelFuncao(v); setSelMacro("__all"); setForm(f => ({ ...f, business_process_id: null })); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="__all">{t("Todas", "All")}</SelectItem>
                      {funcoes.map(fn => <SelectItem key={fn} value={fn}>{fn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">{t("Macro Processo", "Macro Process")}</Label>
                  <Select value={selMacro} onValueChange={v => { setSelMacro(v); setForm(f => ({ ...f, business_process_id: null })); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="__all">{t("Todos", "All")}</SelectItem>
                      {macros.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Select
                value={form.business_process_id || "__none"}
                onValueChange={v => setForm(f => ({ ...f, business_process_id: v === "__none" ? null : v }))}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("Selecionar processo...", "Select process...")} /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__none">{t("— Nenhum —", "— None —")}</SelectItem>
                  {filteredBPs.map(bp => (
                    <SelectItem key={bp.id} value={bp.id}>
                      {bp.processo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Nome (PT)</Label><Input value={form.name_pt} onChange={e => setForm(f => ({ ...f, name_pt: e.target.value }))} /></div>
              <div><Label className="text-xs">Name (EN)</Label><Input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></div>
            </div>

            {/* DR Type */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Tipo de DR", "DR Type")}
              </Label>
              <Select
                value={form.dr_type_id || "__none"}
                onValueChange={v => v === "__none" ? setForm(f => ({ ...f, dr_type_id: null })) : handleDRTypeChange(v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">{t("— Nenhum —", "— None —")}</SelectItem>
                  {drTypes.map(dr => (
                    <SelectItem key={dr.id} value={dr.id}>
                      {dr.code} — {dr.label} (RTO: {dr.rto}h / RPO: {dr.rpo}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RTO / RPO */}
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">RTO ({t("horas", "hours")})</Label><Input type="number" step="0.5" min="0" value={form.rto} onChange={e => setForm(f => ({ ...f, rto: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label className="text-xs">RPO ({t("horas", "hours")})</Label><Input type="number" step="0.5" min="0" value={form.rpo} onChange={e => setForm(f => ({ ...f, rpo: parseFloat(e.target.value) || 0 }))} /></div>
            </div>

            {/* Criticality */}
            <div>
              <Label className="text-xs">{t("Criticidade", "Criticality")}</Label>
              <Select value={form.criticality} onValueChange={v => setForm(f => ({ ...f, criticality: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{t("Crítico", "Critical")}</SelectItem>
                  <SelectItem value="high">{t("Alto", "High")}</SelectItem>
                  <SelectItem value="medium">{t("Médio", "Medium")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("Cancelar", "Cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.name_pt}>{t("Guardar", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link platform dialog */}
      <Dialog open={!!linkDialog} onOpenChange={(o) => !o && setLinkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              {t("Associar Plataforma", "Link Platform")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={linkPlatId} onValueChange={setLinkPlatId}>
              <SelectTrigger><SelectValue placeholder={t("Selecionar plataforma...", "Select platform...")} /></SelectTrigger>
              <SelectContent>
                {platforms.map(p => {
                  const dr = drTypes.find(d => d.id === p.dr_type_id);
                  return <SelectItem key={p.id} value={p.id}>{p.name} {dr ? `(${dr.code})` : ""}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Button onClick={async () => {
              if (!linkDialog || !linkPlatId) return;
              try {
                await linkPlatform.mutateAsync({ bia_process_id: linkDialog, platform_id: linkPlatId });
                setLinkPlatId("");
                toast.success(t("Plataforma associada", "Platform linked"));
              } catch { toast.error(t("Erro ao associar", "Error linking")); }
            }} disabled={!linkPlatId || linkPlatform.isPending} className="w-full">
              {t("Associar", "Link")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BIASection;
