import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  useBuildings,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
  Building,
} from "@/hooks/useBuildings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Fuel,
  Zap,
  AlertTriangle,
  Settings2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { generateDieselReportPDF, computeTier, TierKey } from "@/lib/generateDieselReportPDF";

const TIER_META: Record<TierKey, { pt: string; en: string; cls: string }> = {
  tier1: { pt: "Tier 1 · Crítico", en: "Tier 1 · Critical", cls: "bg-primary/10 text-primary border-primary/30" },
  tier2: { pt: "Tier 2 · Intermédio", en: "Tier 2 · Intermediate", cls: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  tier3: { pt: "Tier 3 · Agência & Numerário", en: "Tier 3 · Branch & Cash", cls: "bg-muted text-muted-foreground border-border" },
  fragil: { pt: "Tier 4 · Agências", en: "Tier 4 · Branches", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  na: { pt: "Por validar", en: "To validate", cls: "bg-muted text-muted-foreground border-border" },
};

const emptyForm = {
  name: "",
  autonomia_horas_contingencia: "",
  combustivel_litros: "",
  num_geradores: "",
  num_ups: "",
  depositos: "",
  observacoes: "",
};

const AutonomiaEnergeticaSection: React.FC = () => {
  const { lang } = useApp();
  const pt = lang === "pt";
  const { data: buildings = [], isLoading } = useBuildings();
  const createB = useCreateBuilding();
  const updateB = useUpdateBuilding();
  const deleteB = useDeleteBuilding();

  const [filter, setFilter] = useState<"all" | TierKey>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => {
    const totalFuel = buildings.reduce((s, b) => s + (b.combustivel_litros ?? 0), 0);
    const totalGens = buildings.reduce((s, b) => s + (b.num_geradores ?? 0), 0);
    const totalUps = buildings.reduce((s, b) => s + (b.num_ups ?? 0), 0);
    const core = buildings.reduce<Building | null>(
      (best, b) =>
        (b.autonomia_horas_contingencia ?? -1) > (best?.autonomia_horas_contingencia ?? -1) ? b : best,
      null
    );
    const fragile = buildings.filter(b => (b.num_geradores ?? 0) <= 0);
    return { totalFuel, totalGens, totalUps, core, fragile };
  }, [buildings]);

  const maxFuel = useMemo(
    () => Math.max(1, ...buildings.map(b => b.combustivel_litros ?? 0)),
    [buildings]
  );

  const visible = useMemo(() => {
    return buildings
      .filter(b => (filter === "all" ? true : computeTier(b) === filter))
      .filter(b => b.name.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => (b.autonomia_horas_contingencia ?? -1) - (a.autonomia_horas_contingencia ?? -1));
  }, [buildings, filter, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (b: Building) => {
    setEditing(b);
    setForm({
      name: b.name,
      autonomia_horas_contingencia: b.autonomia_horas_contingencia?.toString() ?? "",
      combustivel_litros: b.combustivel_litros?.toString() ?? "",
      num_geradores: b.num_geradores?.toString() ?? "",
      num_ups: b.num_ups?.toString() ?? "",
      depositos: b.depositos ?? "",
      observacoes: b.observacoes ?? "",
    });
    setDialogOpen(true);
  };

  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  const save = async () => {
    if (!form.name.trim()) {
      toast.error(pt ? "Indique o nome do edifício." : "Building name is required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      autonomia_horas_contingencia: num(form.autonomia_horas_contingencia),
      combustivel_litros: num(form.combustivel_litros),
      num_geradores: num(form.num_geradores),
      num_ups: num(form.num_ups),
      depositos: form.depositos.trim() || null,
      observacoes: form.observacoes.trim() || null,
    };
    try {
      if (editing) await updateB.mutateAsync({ id: editing.id, ...payload });
      else await createB.mutateAsync(payload);
      toast.success(pt ? "Edifício guardado." : "Building saved.");
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (b: Building) => {
    if (!window.confirm(pt ? `Eliminar "${b.name}"?` : `Delete "${b.name}"?`)) return;
    try {
      await deleteB.mutateAsync(b.id);
      toast.success(pt ? "Edifício eliminado." : "Building deleted.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const kpis = [
    {
      label: pt ? "Reserva total diesel" : "Total diesel reserve",
      value: `${stats.totalFuel.toLocaleString("pt-PT")} L`,
      hint: pt ? "Soma dos depósitos registados" : "Sum of registered tanks",
      icon: Fuel,
    },
    {
      label: pt ? "Nó core (maior autonomia)" : "Core node (highest autonomy)",
      value: stats.core?.autonomia_horas_contingencia
        ? `${stats.core.autonomia_horas_contingencia}h`
        : "—",
      hint: stats.core
        ? `${stats.core.name}${
            stats.core.autonomia_horas_contingencia
              ? ` · ${(stats.core.autonomia_horas_contingencia / 24).toFixed(1)} ${pt ? "dias" : "days"}`
              : ""
          }`
        : "—",
      icon: Zap,
    },
    {
      label: pt ? "Tier 4 · Agências (apenas UPS)" : "Tier 4 · Branches (UPS only)",
      value: `${stats.fragile.length}`,
      hint: pt ? "Sem grupo gerador" : "No generator set",
      icon: AlertTriangle,
      danger: true,
    },
    {
      label: pt ? "Equipamento instalado" : "Installed equipment",
      value: `${stats.totalGens} ${pt ? "grupos" : "gensets"}`,
      hint: `${stats.totalUps} ${pt ? "unidades UPS ativas" : "active UPS units"}`,
      icon: Settings2,
    },
  ];

  const tierFilters: { key: "all" | TierKey; label: string }[] = [
    { key: "all", label: `${pt ? "Todos" : "All"} (${buildings.length})` },
    { key: "tier1", label: pt ? "Tier 1 · Crítico" : "Tier 1 · Critical" },
    { key: "tier2", label: pt ? "Tier 2 · Intermédio" : "Tier 2 · Intermediate" },
    { key: "tier3", label: pt ? "Tier 3 · Agência & Numerário" : "Tier 3 · Branch & Cash" },
    { key: "fragil", label: pt ? "Tier 4 · Agências" : "Tier 4 · Branches" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide">
            {pt ? "Infraestruturas & Autonomia Energética" : "Infrastructure & Power Autonomy"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pt
              ? "Monitorização contínua do perímetro operacional GCN"
              : "Continuous monitoring of the BCM operational perimeter"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => generateDieselReportPDF(buildings)}
            disabled={buildings.length === 0}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            {pt ? "Relatório Diesel" : "Diesel Report"}
          </Button>
          <Button size="sm" className="h-9" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            {pt ? "Novo Edifício" : "New Building"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </p>
                <p
                  className={`font-mono text-2xl font-bold mt-1 ${
                    k.danger ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {k.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">{k.hint}</p>
              </div>
              <span
                className={`shrink-0 rounded-md p-2 ${
                  k.danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                }`}
              >
                <k.icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          {tierFilters.map(f => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "secondary"}
              className="h-8 text-xs"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={pt ? "Pesquisar edifício..." : "Search building..."}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          {pt ? "Nenhum edifício encontrado." : "No buildings found."}
        </p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wider">
                  {pt ? "Edifício / Instalação" : "Building / Facility"}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider w-40">
                  {pt ? "Tier / Criticidade" : "Tier / Criticality"}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider w-40">
                  {pt ? "Geradores & UPS" : "Gensets & UPS"}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider w-40">
                  {pt ? "Combustível (L)" : "Fuel (L)"}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider w-40">
                  {pt ? "Autonomia estimada" : "Estimated autonomy"}
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider w-20 text-right">
                  {pt ? "Ações" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(b => {
                const tier = computeTier(b);
                const meta = TIER_META[tier];
                const h = b.autonomia_horas_contingencia;
                const fuel = b.combustivel_litros ?? 0;
                return (
                  <TableRow key={b.id}>
                    <TableCell className="align-top">
                      <p className="text-sm font-semibold">{b.name}</p>
                      {(b.depositos || b.observacoes) && (
                        <p className="text-xs text-muted-foreground max-w-md">
                          {b.depositos || b.observacoes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${meta.cls}`}>
                        {pt ? meta.pt : meta.en}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top font-mono text-xs">
                      <span className="font-semibold">{b.num_geradores ?? 0}</span>{" "}
                      {pt ? "grupos" : "gensets"}
                      <span className="text-muted-foreground"> | {b.num_ups ?? 0} UPS</span>
                    </TableCell>
                    <TableCell className="align-top">
                      <p className="font-mono text-xs font-semibold">
                        {fuel.toLocaleString("pt-PT")} L
                      </p>
                      <div className="mt-1 h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round((fuel / maxFuel) * 100)}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <p
                        className={`font-mono text-sm font-semibold ${
                          h == null
                            ? "text-muted-foreground"
                            : h >= 48
                            ? "text-emerald-600"
                            : h >= 12
                            ? "text-amber-600"
                            : "text-destructive"
                        }`}
                      >
                        {h == null ? "—" : `${h}h`}
                      </p>
                      {h != null && (
                        <p className="text-xs text-muted-foreground">
                          {(h / 24).toFixed(1)} {pt ? "dias de autonomia" : "days of autonomy"}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(b)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => remove(b)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? pt
                  ? "Editar Edifício"
                  : "Edit Building"
                : pt
                ? "Novo Edifício"
                : "New Building"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {pt ? "Edifício / Instalação" : "Building / Facility"}
              </Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{pt ? "Autonomia (h)" : "Autonomy (h)"}</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={form.autonomia_horas_contingencia}
                  onChange={e => setForm(f => ({ ...f, autonomia_horas_contingencia: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{pt ? "Combustível (L)" : "Fuel (L)"}</Label>
                <Input
                  type="number"
                  step="1"
                  value={form.combustivel_litros}
                  onChange={e => setForm(f => ({ ...f, combustivel_litros: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{pt ? "Nº Geradores" : "Generators"}</Label>
                <Input
                  type="number"
                  step="1"
                  value={form.num_geradores}
                  onChange={e => setForm(f => ({ ...f, num_geradores: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Nº UPS</Label>
                <Input
                  type="number"
                  step="1"
                  value={form.num_ups}
                  onChange={e => setForm(f => ({ ...f, num_ups: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{pt ? "Depósitos" : "Tanks"}</Label>
              <Textarea
                rows={2}
                value={form.depositos}
                onChange={e => setForm(f => ({ ...f, depositos: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{pt ? "Observações" : "Notes"}</Label>
              <Textarea
                rows={3}
                value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {pt ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={save} disabled={createB.isPending || updateB.isPending}>
              {(createB.isPending || updateB.isPending) && (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              )}
              {pt ? "Guardar" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutonomiaEnergeticaSection;
