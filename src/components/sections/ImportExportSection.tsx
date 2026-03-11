import React, { useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCMDBPlatforms, useCreateCMDBPlatform, useDeleteCMDBPlatform } from "@/hooks/useCMDBPlatforms";
import { useBusinessProcesses, useCreateBusinessProcess, useDeleteBusinessProcess } from "@/hooks/useBusinessProcesses";
import { Download, Upload, Loader2, Server, Briefcase } from "lucide-react";
import * as XLSX from "xlsx";

const ImportExportSection: React.FC = () => {
  const { lang } = useApp();
  const { toast } = useToast();
  const { data: platforms = [] } = useCMDBPlatforms();
  const { data: processes = [] } = useBusinessProcesses();
  const createPlat = useCreateCMDBPlatform();
  const createBP = useCreateBusinessProcess();
  const deletePlat = useDeleteCMDBPlatform();
  const deleteBP = useDeleteBusinessProcess();

  const [importing, setImporting] = useState<string | null>(null);
  const platFileRef = useRef<HTMLInputElement>(null);
  const bpFileRef = useRef<HTMLInputElement>(null);

  // ── Export Platforms ──
  const exportPlatforms = () => {
    const rows = platforms.map(p => ({ Nome: p.name, DR_Type_ID: p.dr_type_id || "" }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plataformas");
    XLSX.writeFile(wb, "plataformas.xlsx");
  };

  // ── Export Processes ──
  const exportProcesses = () => {
    const rows = processes.map(p => ({
      Tipo_Funcao: p.tipo_funcao,
      Funcao: p.funcao,
      Macro_Processo: p.macro_processo,
      Processo: p.processo,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processos");
    XLSX.writeFile(wb, "processos.xlsx");
  };

  // ── Export Templates ──
  const exportTemplatePlatforms = () => {
    const ws = XLSX.utils.json_to_sheet([{ Nome: "", DR_Type_ID: "" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plataformas");
    XLSX.writeFile(wb, "template_plataformas.xlsx");
  };

  const exportTemplateProcesses = () => {
    const ws = XLSX.utils.json_to_sheet([{ Tipo_Funcao: "", Funcao: "", Macro_Processo: "", Processo: "" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processos");
    XLSX.writeFile(wb, "template_processos.xlsx");
  };

  // ── Import Platforms ──
  const importPlatforms = async (file: File) => {
    setImporting("platforms");
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<{ Nome: string; DR_Type_ID?: string }>(ws);

      let count = 0;
      for (const row of rows) {
        if (!row.Nome?.trim()) continue;
        await createPlat.mutateAsync({ name: row.Nome.trim(), dr_type_id: row.DR_Type_ID?.trim() || null });
        count++;
      }
      toast({ title: lang === "pt" ? `${count} plataformas importadas` : `${count} platforms imported` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  // ── Import Processes ──
  const importProcesses = async (file: File) => {
    setImporting("processes");
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<{ Tipo_Funcao?: string; Funcao?: string; Macro_Processo?: string; Processo?: string }>(ws);

      let count = 0;
      for (const row of rows) {
        if (!row.Processo?.trim() && !row.Funcao?.trim()) continue;
        await createBP.mutateAsync({
          tipo_funcao: row.Tipo_Funcao?.trim() || "",
          funcao: row.Funcao?.trim() || "",
          macro_processo: row.Macro_Processo?.trim() || "",
          processo: row.Processo?.trim() || "",
        });
        count++;
      }
      toast({ title: lang === "pt" ? `${count} processos importados` : `${count} processes imported` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Import / Export" : "Import / Export"}
      </h2>

      <input ref={platFileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) importPlatforms(f); e.target.value = ""; }} />
      <input ref={bpFileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) importProcesses(f); e.target.value = ""; }} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Platforms Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4" />
              {lang === "pt" ? "Plataformas CMDB" : "CMDB Platforms"}
              <Badge variant="secondary" className="ml-auto">{platforms.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportPlatforms} disabled={platforms.length === 0}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {lang === "pt" ? "Exportar Dados" : "Export Data"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportTemplatePlatforms}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Template
              </Button>
              <Button size="sm" onClick={() => platFileRef.current?.click()} disabled={importing === "platforms"}>
                {importing === "platforms" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                {lang === "pt" ? "Importar" : "Import"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "pt"
                ? "Colunas: Nome, DR_Type_ID (opcional)"
                : "Columns: Nome, DR_Type_ID (optional)"}
            </p>
          </CardContent>
        </Card>

        {/* Processes Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {lang === "pt" ? "Processos de Negócio" : "Business Processes"}
              <Badge variant="secondary" className="ml-auto">{processes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportProcesses} disabled={processes.length === 0}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {lang === "pt" ? "Exportar Dados" : "Export Data"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportTemplateProcesses}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Template
              </Button>
              <Button size="sm" onClick={() => bpFileRef.current?.click()} disabled={importing === "processes"}>
                {importing === "processes" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                {lang === "pt" ? "Importar" : "Import"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "pt"
                ? "Colunas: Tipo_Funcao, Funcao, Macro_Processo, Processo"
                : "Columns: Tipo_Funcao, Funcao, Macro_Processo, Processo"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportExportSection;
