import React, { useState, useMemo } from "react";
import { useApp, t } from "@/contexts/AppContext";
import {
  usePessoasCriticas,
  useInsertPessoaCritica,
  useUpdatePessoaCritica,
  useDeletePessoaCritica,
  PessoaCritica,
} from "@/hooks/usePessoasCriticas";
import { useDepartments } from "@/hooks/useDepartments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, MapPin } from "lucide-react";

/* ── Portugal postal-code district mapping ── */
const DISTRICT_COORDS: Record<string, { name: string; lat: number; lng: number }> = {
  "1": { name: "Lisboa", lat: 38.72, lng: -9.14 },
  "2": { name: "Lisboa / Setúbal", lat: 38.6, lng: -9.0 },
  "3": { name: "Coimbra / Aveiro", lat: 40.35, lng: -8.4 },
  "4": { name: "Porto", lat: 41.15, lng: -8.61 },
  "5": { name: "Vila Real / Bragança", lat: 41.5, lng: -7.5 },
  "6": { name: "Castelo Branco / Guarda", lat: 40.2, lng: -7.3 },
  "7": { name: "Évora / Beja", lat: 38.3, lng: -7.8 },
  "8": { name: "Faro", lat: 37.02, lng: -7.93 },
  "9": { name: "Madeira / Açores", lat: 32.65, lng: -16.9 },
};

const getDistrictKey = (cp: string) => cp?.trim().charAt(0) || "";

const empty: Omit<PessoaCritica, "id" | "owner_id" | "created_at" | "updated_at"> = {
  nome: "", email: "", telefone: "", departamento: "", funcao: "", prioridade: 0, codigo_postal: "",
};

const PessoasCriticasSection: React.FC = () => {
  const { lang } = useApp();
  const { data: pessoas = [], isLoading } = usePessoasCriticas();
  const { data: departments = [] } = useDepartments();
  const insertMut = useInsertPessoaCritica();
  const updateMut = useUpdatePessoaCritica();
  const deleteMut = useDeletePessoaCritica();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PessoaCritica | null>(null);
  const [form, setForm] = useState(empty);
  const [filterDept, setFilterDept] = useState("all");

  const filtered = useMemo(() =>
    filterDept === "all" ? pessoas : pessoas.filter(p => p.departamento === filterDept),
    [pessoas, filterDept]
  );

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: PessoaCritica) => {
    setEditing(p);
    setForm({ nome: p.nome, email: p.email, telefone: p.telefone, departamento: p.departamento, funcao: p.funcao, prioridade: p.prioridade, codigo_postal: p.codigo_postal });
    setOpen(true);
  };

  const save = async () => {
    if (!form.nome.trim()) { toast.error(lang === "pt" ? "Nome é obrigatório" : "Name is required"); return; }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...form });
        toast.success(lang === "pt" ? "Atualizado" : "Updated");
      } else {
        await insertMut.mutateAsync(form);
        toast.success(lang === "pt" ? "Criado" : "Created");
      }
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    try { await deleteMut.mutateAsync(id); toast.success(lang === "pt" ? "Removido" : "Deleted"); }
    catch (e: any) { toast.error(e.message); }
  };

  /* ── Heatmap data ── */
  const heatData = useMemo(() => {
    const counts: Record<string, number> = {};
    pessoas.forEach(p => {
      const k = getDistrictKey(p.codigo_postal);
      if (k && DISTRICT_COORDS[k]) counts[k] = (counts[k] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts).map(([k, count]) => ({
      ...DISTRICT_COORDS[k], count, intensity: count / max, key: k,
    }));
  }, [pessoas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          {lang === "pt" ? "Pessoas Críticas por Departamento" : "Critical People by Department"}
        </h1>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />{lang === "pt" ? "Adicionar" : "Add"}</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">{lang === "pt" ? "Lista" : "List"}</TabsTrigger>
          <TabsTrigger value="heatmap">{lang === "pt" ? "Mapa de Calor" : "Heat Map"}</TabsTrigger>
        </TabsList>

        {/* ── LIST ── */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">{lang === "pt" ? "Filtrar Departamento:" : "Filter Dept:"}</Label>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "pt" ? "Prioridade" : "Priority"}</TableHead>
                    <TableHead>{lang === "pt" ? "Nome" : "Name"}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>{lang === "pt" ? "Telefone" : "Phone"}</TableHead>
                    <TableHead>{lang === "pt" ? "Departamento" : "Department"}</TableHead>
                    <TableHead>{lang === "pt" ? "Função" : "Role"}</TableHead>
                    <TableHead>{lang === "pt" ? "Cód. Postal" : "Postal Code"}</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{lang === "pt" ? "Sem registos" : "No records"}</TableCell></TableRow>
                  ) : filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono font-bold">{p.prioridade}</TableCell>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.telefone}</TableCell>
                      <TableCell>{p.departamento}</TableCell>
                      <TableCell>{p.funcao}</TableCell>
                      <TableCell>{p.codigo_postal}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HEATMAP ── */}
        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {lang === "pt" ? "Distribuição por Código Postal (Portugal)" : "Distribution by Postal Code (Portugal)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heatData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  {lang === "pt" ? "Sem dados de código postal para visualizar" : "No postal code data to visualize"}
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(DISTRICT_COORDS).sort((a, b) => Number(a[0]) - Number(b[0])).map(([key, district]) => {
                    const count = heatData.find(h => h.key === key)?.count ?? 0;
                    const intensity = heatData.find(h => h.key === key)?.intensity ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-sm font-mono w-8 text-muted-foreground">{key}xxx</span>
                        <span className="text-sm w-48 truncate font-medium">{district.name}</span>
                        <div className="flex-1 h-8 rounded-md bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-md transition-all"
                            style={{
                              width: `${Math.max(intensity * 100, count > 0 ? 5 : 0)}%`,
                              backgroundColor: count > 0
                                ? `hsl(0, ${Math.round(30 + intensity * 60)}%, ${Math.round(55 - intensity * 20)}%)`
                                : "transparent",
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-10 text-right">{count}</span>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground mt-4">
                    {lang === "pt"
                      ? "* Baseado no primeiro dígito do código postal"
                      : "* Based on the first digit of the postal code"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── DIALOG ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? (lang === "pt" ? "Editar Pessoa Crítica" : "Edit Critical Person")
                : (lang === "pt" ? "Nova Pessoa Crítica" : "New Critical Person")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>{lang === "pt" ? "Nome" : "Name"} *</Label>
              <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>{lang === "pt" ? "Telefone" : "Phone"}</Label>
                <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>{lang === "pt" ? "Departamento" : "Department"}</Label>
                <Select value={form.departamento} onValueChange={v => setForm(f => ({ ...f, departamento: v }))}>
                  <SelectTrigger><SelectValue placeholder={lang === "pt" ? "Selecionar" : "Select"} /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>{lang === "pt" ? "Função" : "Role"}</Label>
                <Input value={form.funcao} onChange={e => setForm(f => ({ ...f, funcao: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>{lang === "pt" ? "Prioridade" : "Priority"}</Label>
                <Input type="number" value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: Number(e.target.value) }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>{lang === "pt" ? "Código Postal" : "Postal Code"}</Label>
                <Input value={form.codigo_postal} onChange={e => setForm(f => ({ ...f, codigo_postal: e.target.value }))} placeholder="1000-001" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{lang === "pt" ? "Cancelar" : "Cancel"}</Button>
            <Button onClick={save}>{lang === "pt" ? "Guardar" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PessoasCriticasSection;
