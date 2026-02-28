import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, CalendarIcon, List, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useTests, useCreateTest, useUpdateTest, useDeleteTest, useAllTestRelations } from "@/hooks/useTests";
import { useBuildings } from "@/hooks/useBuildings";
import { useCMDBPlatforms } from "@/hooks/useCMDBPlatforms";
import { useBusinessProcesses } from "@/hooks/useBusinessProcesses";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TestCalendarSection: React.FC = () => {
  const { lang } = useApp();
  const { toast } = useToast();
  const { data: tests = [], isLoading } = useTests();
  const { data: relations } = useAllTestRelations();
  const { data: buildings = [] } = useBuildings();
  const { data: platforms = [] } = useCMDBPlatforms();
  const { data: bps = [] } = useBusinessProcesses();
  const createTest = useCreateTest();
  const updateTest = useUpdateTest();
  const deleteTest = useDeleteTest();

  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [month, setMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", test_date: undefined as Date | undefined, building_ids: [] as string[], platform_ids: [] as string[], bp_ids: [] as string[] });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Filters for macro processos
  const [filterTipoFuncao, setFilterTipoFuncao] = useState<string>("__all__");
  const [filterFuncao, setFilterFuncao] = useState<string>("__all__");
  const [filterSearch, setFilterSearch] = useState<string>("");

  const resetFilters = () => { setFilterTipoFuncao("__all__"); setFilterFuncao("__all__"); setFilterSearch(""); };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", test_date: undefined, building_ids: [], platform_ids: [], bp_ids: [] });
    resetFilters();
    setDialogOpen(true);
  };

  const openEdit = (t: typeof tests[0]) => {
    setEditingId(t.id);
    const rel = relations;
    const bIds = rel?.buildings.filter(r => r.test_id === t.id).map(r => r.building_id) || [];
    const pIds = rel?.platforms.filter(r => r.test_id === t.id).map(r => r.platform_id) || [];
    const bpIds = rel?.bps.filter(r => r.test_id === t.id).map(r => r.business_process_id) || [];
    setForm({ name: t.name, test_date: parseISO(t.test_date), building_ids: bIds, platform_ids: pIds, bp_ids: bpIds });
    resetFilters();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.test_date) return;
    const dateStr = format(form.test_date, "yyyy-MM-dd");
    try {
      if (editingId) {
        await updateTest.mutateAsync({ id: editingId, name: form.name, test_date: dateStr, building_ids: form.building_ids, platform_ids: form.platform_ids, bp_ids: form.bp_ids });
      } else {
        await createTest.mutateAsync({ name: form.name, test_date: dateStr, building_ids: form.building_ids, platform_ids: form.platform_ids, bp_ids: form.bp_ids });
      }
      setDialogOpen(false);
      toast({ title: lang === "pt" ? "Guardado" : "Saved" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTest.mutateAsync(id);
      toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const toggleMulti = (arr: string[], id: string) => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];

  // Toggle all BPs of a macro_processo
  const toggleMacroProcesso = (macroKey: string) => {
    const macroIDs = bps.filter(b => `${b.tipo_funcao}|${b.funcao}|${b.macro_processo}` === macroKey).map(b => b.id);
    const allSelected = macroIDs.every(id => form.bp_ids.includes(id));
    if (allSelected) {
      setForm(f => ({ ...f, bp_ids: f.bp_ids.filter(id => !macroIDs.includes(id)) }));
    } else {
      setForm(f => ({ ...f, bp_ids: [...new Set([...f.bp_ids, ...macroIDs])] }));
    }
  };

  // Unique filter values
  const uniqueTipoFuncoes = useMemo(() => [...new Set(bps.map(b => b.tipo_funcao))].filter(Boolean).sort(), [bps]);
  const uniqueFuncoes = useMemo(() => {
    const filtered = filterTipoFuncao !== "__all__" ? bps.filter(b => b.tipo_funcao === filterTipoFuncao) : bps;
    return [...new Set(filtered.map(b => b.funcao))].filter(Boolean).sort();
  }, [bps, filterTipoFuncao]);

  // Unique macro processos for selection
  const filteredMacros = useMemo(() => {
    let list = bps;
    if (filterTipoFuncao !== "__all__") list = list.filter(b => b.tipo_funcao === filterTipoFuncao);
    if (filterFuncao !== "__all__") list = list.filter(b => b.funcao === filterFuncao);
    const macroMap = new Map<string, { key: string; tipo_funcao: string; funcao: string; macro_processo: string; bp_ids: string[] }>();
    list.forEach(b => {
      const k = `${b.tipo_funcao}|${b.funcao}|${b.macro_processo}`;
      if (!macroMap.has(k)) macroMap.set(k, { key: k, tipo_funcao: b.tipo_funcao, funcao: b.funcao, macro_processo: b.macro_processo, bp_ids: [] });
      macroMap.get(k)!.bp_ids.push(b.id);
    });
    let macros = [...macroMap.values()];
    if (filterSearch) macros = macros.filter(m => m.macro_processo.toLowerCase().includes(filterSearch.toLowerCase()));
    return macros.sort((a, b) => a.macro_processo.localeCompare(b.macro_processo));
  }, [bps, filterTipoFuncao, filterFuncao, filterSearch]);

  // Selected macro processos info for badges
  const selectedMacrosInfo = useMemo(() => {
    const selected = new Map<string, { key: string; funcao: string; macro_processo: string }>();
    bps.filter(b => form.bp_ids.includes(b.id)).forEach(b => {
      const k = `${b.tipo_funcao}|${b.funcao}|${b.macro_processo}`;
      if (!selected.has(k)) selected.set(k, { key: k, funcao: b.funcao, macro_processo: b.macro_processo });
    });
    return [...selected.values()];
  }, [bps, form.bp_ids]);

  // Calendar grid
  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const startDow = getDay(days[0]);

  const testsByDate = useMemo(() => {
    const map: Record<string, typeof tests> = {};
    tests.forEach(t => {
      const key = t.test_date;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tests]);

  const getBuildingNames = (testId: string) => {
    const ids = relations?.buildings.filter(r => r.test_id === testId).map(r => r.building_id) || [];
    return buildings.filter(b => ids.includes(b.id)).map(b => b.name);
  };

  const getPlatformNames = (testId: string) => {
    const ids = relations?.platforms.filter(r => r.test_id === testId).map(r => r.platform_id) || [];
    return platforms.filter(p => ids.includes(p.id)).map(p => p.name);
  };

  const getBPNames = (testId: string) => {
    const ids = relations?.bps.filter(r => r.test_id === testId).map(r => r.business_process_id) || [];
    const matched = bps.filter(b => ids.includes(b.id));
    const macros = new Set(matched.map(b => `${b.funcao} > ${b.macro_processo}`));
    return [...macros];
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Calendário de Testes" : "Test Calendar"}
        </h2>
        <div className="flex gap-2">
          <Tabs value={view} onValueChange={v => setView(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="calendar" className="text-xs h-7"><CalendarIcon className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Calendário" : "Calendar"}</TabsTrigger>
              <TabsTrigger value="list" className="text-xs h-7"><List className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Lista" : "List"}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={openCreate} className="h-8 text-xs"><Plus className="h-3.5 w-3.5 mr-1" />{lang === "pt" ? "Novo Teste" : "New Test"}</Button>
        </div>
      </div>

      {view === "calendar" ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold capitalize">
                {format(month, "MMMM yyyy", { locale: lang === "pt" ? pt : undefined })}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonth(m => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                <div key={d} className="bg-muted p-1.5 text-center text-[10px] font-medium text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: (startDow + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-background p-1 min-h-[70px]" />
              ))}
              {days.map(day => {
                const key = format(day, "yyyy-MM-dd");
                const dayTests = testsByDate[key] || [];
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={key} className={cn("bg-background p-1 min-h-[70px] relative", isToday && "ring-1 ring-primary ring-inset")}>
                    <span className={cn("text-[11px] font-medium", isToday && "text-primary")}>{format(day, "d")}</span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayTests.map(t => (
                        <button key={t.id} onClick={() => openEdit(t)}
                          className="w-full text-left text-[10px] bg-primary/10 text-primary rounded px-1 py-0.5 truncate hover:bg-primary/20 transition-colors">
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{lang === "pt" ? "Data" : "Date"}</TableHead>
                <TableHead className="text-xs">{lang === "pt" ? "Nome" : "Name"}</TableHead>
                <TableHead className="text-xs">{lang === "pt" ? "Edifícios" : "Buildings"}</TableHead>
                <TableHead className="text-xs">{lang === "pt" ? "Plataformas" : "Platforms"}</TableHead>
                <TableHead className="text-xs">{lang === "pt" ? "Macro Processos" : "Macro Processes"}</TableHead>
                <TableHead className="text-xs w-20">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">{lang === "pt" ? "Nenhum teste agendado." : "No tests scheduled."}</TableCell></TableRow>
              ) : tests.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{format(parseISO(t.test_date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-sm font-medium">{t.name}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{getBuildingNames(t.id).map(n => <Badge key={n} variant="outline" className="text-[10px]">{n}</Badge>)}</div></TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{getPlatformNames(t.id).map(n => <Badge key={n} variant="secondary" className="text-[10px]">{n}</Badge>)}</div></TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{getBPNames(t.id).map(n => <Badge key={n} variant="outline" className="text-[10px]">{n}</Badge>)}</div></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CRUD Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? (lang === "pt" ? "Editar Teste" : "Edit Test") : (lang === "pt" ? "Novo Teste" : "New Test")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">{lang === "pt" ? "Nome do Teste" : "Test Name"}</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={lang === "pt" ? "Ex: Teste DRP Anual" : "E.g. Annual DRP Test"} />
              </div>
              <div>
                <Label className="text-xs">{lang === "pt" ? "Data do Teste" : "Test Date"}</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !form.test_date && "text-muted-foreground")}>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {form.test_date ? format(form.test_date, "dd/MM/yyyy") : (lang === "pt" ? "Selecionar data" : "Pick a date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar mode="single" selected={form.test_date} onSelect={d => { setForm(f => ({ ...f, test_date: d || f.test_date })); if (d) setDatePickerOpen(false); }} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Buildings multi-select */}
              <div>
                <Label className="text-xs">{lang === "pt" ? "Edifícios Envolvidos" : "Buildings Involved"}</Label>
                <ScrollArea className="h-32 border rounded-md p-2 mt-1">
                  {buildings.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{lang === "pt" ? "Configure edifícios no Back Office." : "Configure buildings in Back Office."}</p>
                  ) : buildings.map(b => (
                    <label key={b.id} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <Checkbox checked={form.building_ids.includes(b.id)} onCheckedChange={() => setForm(f => ({ ...f, building_ids: toggleMulti(f.building_ids, b.id) }))} />
                      <span className="text-xs">{b.name}</span>
                    </label>
                  ))}
                </ScrollArea>
              </div>

              {/* Platforms multi-select */}
              <div>
                <Label className="text-xs">{lang === "pt" ? "Plataformas Envolvidas" : "Platforms Involved"}</Label>
                <ScrollArea className="h-32 border rounded-md p-2 mt-1">
                  {platforms.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{lang === "pt" ? "Configure plataformas no Back Office." : "Configure platforms in Back Office."}</p>
                  ) : platforms.map(p => (
                    <label key={p.id} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <Checkbox checked={form.platform_ids.includes(p.id)} onCheckedChange={() => setForm(f => ({ ...f, platform_ids: toggleMulti(f.platform_ids, p.id) }))} />
                      <span className="text-xs">{p.name}</span>
                    </label>
                  ))}
                </ScrollArea>
              </div>
            </div>

            {/* Macro Processos with filters */}
            <div>
              <Label className="text-xs font-semibold">{lang === "pt" ? "Macro Processos" : "Macro Processes"}</Label>
              
              {/* Selected macro processos badges */}
              {selectedMacrosInfo.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {selectedMacrosInfo.map(m => (
                    <Badge key={m.key} variant="secondary" className="text-[10px] gap-1 pr-1">
                      {m.funcao} &gt; {m.macro_processo}
                      <button onClick={() => {
                        const macroIDs = bps.filter(b => `${b.tipo_funcao}|${b.funcao}|${b.macro_processo}` === m.key).map(b => b.id);
                        setForm(f => ({ ...f, bp_ids: f.bp_ids.filter(id => !macroIDs.includes(id)) }));
                      }} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Filters row */}
              <div className="grid grid-cols-3 gap-2 mt-1 mb-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">{lang === "pt" ? "Tipo de Função" : "Function Type"}</Label>
                  <Select value={filterTipoFuncao} onValueChange={v => { setFilterTipoFuncao(v); setFilterFuncao("__all__"); }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={lang === "pt" ? "Todos" : "All"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{lang === "pt" ? "Todos" : "All"}</SelectItem>
                      {uniqueTipoFuncoes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">{lang === "pt" ? "Função" : "Function"}</Label>
                  <Select value={filterFuncao} onValueChange={setFilterFuncao}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={lang === "pt" ? "Todas" : "All"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{lang === "pt" ? "Todas" : "All"}</SelectItem>
                      {uniqueFuncoes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">{lang === "pt" ? "Pesquisar Macro Processo" : "Search Macro Process"}</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="h-8 text-xs pl-7" placeholder={lang === "pt" ? "Filtrar..." : "Filter..."} />
                  </div>
                </div>
              </div>

              <ScrollArea className="h-52 border rounded-md p-2">
                {filteredMacros.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">{lang === "pt" ? "Nenhum macro processo encontrado." : "No macro processes found."}</p>
                ) : filteredMacros.map(m => {
                  const allSelected = m.bp_ids.every(id => form.bp_ids.includes(id));
                  return (
                    <label key={m.key} className="flex items-center gap-2 py-1 cursor-pointer">
                      <Checkbox checked={allSelected} onCheckedChange={() => toggleMacroProcesso(m.key)} />
                      <span className="text-xs">
                        <span className="text-muted-foreground">{m.funcao} &gt;</span> {m.macro_processo}
                      </span>
                    </label>
                  );
                })}
              </ScrollArea>
            </div>

            <Button type="button" onClick={handleSave} className="w-full" disabled={!form.name || !form.test_date || createTest.isPending || updateTest.isPending}>
              {(createTest.isPending || updateTest.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestCalendarSection;
