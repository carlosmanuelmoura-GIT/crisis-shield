import React, { useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCMDBPlatforms, useCreateCMDBPlatform, useDeleteCMDBPlatform, useBIAProcessPlatforms } from "@/hooks/useCMDBPlatforms";
import { useBusinessProcesses, useCreateBusinessProcess, useDeleteBusinessProcess } from "@/hooks/useBusinessProcesses";
import { useBIAProcesses, useCreateBIAProcess } from "@/hooks/useBIAProcesses";
import { usePessoasCriticas, useInsertPessoaCritica } from "@/hooks/usePessoasCriticas";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Loader2, Server, Briefcase, BarChart3, Users } from "lucide-react";
import * as XLSX from "xlsx";

const ImportExportSection: React.FC = () => {
  const { lang } = useApp();
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: platforms = [] } = useCMDBPlatforms();
  const { data: processes = [] } = useBusinessProcesses();
  const { data: biaProcesses = [] } = useBIAProcesses();
  const { data: biaPlatLinks = [] } = useBIAProcessPlatforms();
  const { data: pessoas = [] } = usePessoasCriticas();
  const createPlat = useCreateCMDBPlatform();
  const createBP = useCreateBusinessProcess();
  const createBIA = useCreateBIAProcess();
  const insertPessoa = useInsertPessoaCritica();
  const deletePlat = useDeleteCMDBPlatform();
  const deleteBP = useDeleteBusinessProcess();

  const [importing, setImporting] = useState<string | null>(null);
  const platFileRef = useRef<HTMLInputElement>(null);
  const bpFileRef = useRef<HTMLInputElement>(null);
  const biaFileRef = useRef<HTMLInputElement>(null);
  const pessoasFileRef = useRef<HTMLInputElement>(null);

  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);

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

  // ── Export BIA ──
  const exportBIA = () => {
    // Build platform name lookup
    const platMap = new Map(platforms.map(p => [p.id, p.name]));

    const rows = biaProcesses.map(b => {
      // Find linked platform names
      const linkedPlatIds = biaPlatLinks.filter(l => l.bia_process_id === b.id).map(l => l.platform_id);
      const platNames = linkedPlatIds.map(pid => platMap.get(pid) || pid).join("; ");

      return {
        Nome_PT: b.name_pt,
        Nome_EN: b.name_en,
        RTO: b.rto,
        RPO: b.rpo,
        Criticidade: b.criticality,
        DR_Type_ID: b.dr_type_id || "",
        Business_Process_ID: b.business_process_id || "",
        Plataformas: platNames,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BIA");
    XLSX.writeFile(wb, "bia_processos.xlsx");
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

  const exportTemplateBIA = () => {
    const ws = XLSX.utils.json_to_sheet([{
      Nome_PT: "", Nome_EN: "", RTO: 0, RPO: 0, Criticidade: "medium",
      DR_Type_ID: "", Business_Process_ID: "", Plataformas: "",
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BIA");
    XLSX.writeFile(wb, "template_bia.xlsx");
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
      toast({ title: t(`${count} plataformas importadas`, `${count} platforms imported`) });
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
      toast({ title: t(`${count} processos importados`, `${count} processes imported`) });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  // ── Import BIA with platform links ──
  const importBIA = async (file: File) => {
    setImporting("bia");
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<{
        Nome_PT?: string; Nome_EN?: string; RTO?: number; RPO?: number;
        Criticidade?: string; DR_Type_ID?: string; Business_Process_ID?: string;
        Plataformas?: string;
      }>(ws);

      // Build platform name -> id lookup (case-insensitive)
      const platNameMap = new Map(platforms.map(p => [p.name.toLowerCase().trim(), p.id]));

      let count = 0;
      for (const row of rows) {
        if (!row.Nome_PT?.trim()) continue;

        // Insert BIA process and get the new id
        const { data: inserted, error: insertErr } = await supabase
          .from("bia_processes")
          .insert({
            name_pt: row.Nome_PT.trim(),
            name_en: row.Nome_EN?.trim() || "",
            rto: Number(row.RTO) || 0,
            rpo: Number(row.RPO) || 0,
            criticality: row.Criticidade?.trim() || "medium",
            dr_type_id: row.DR_Type_ID?.trim() || null,
            business_process_id: row.Business_Process_ID?.trim() || null,
            owner_id: user?.id,
          })
          .select("id")
          .single();

        if (insertErr) throw insertErr;

        // Link platforms if specified
        if (row.Plataformas?.trim() && inserted) {
          const platNames = row.Plataformas.split(";").map(s => s.trim()).filter(Boolean);
          for (const pName of platNames) {
            const platId = platNameMap.get(pName.toLowerCase());
            if (platId) {
              await supabase.from("bia_process_platforms").insert({
                bia_process_id: inserted.id,
                platform_id: platId,
              });
            }
          }
        }
        count++;
      }

      qc.invalidateQueries({ queryKey: ["bia_processes"] });
      qc.invalidateQueries({ queryKey: ["bia_process_platforms"] });
      toast({ title: t(`${count} processos BIA importados`, `${count} BIA processes imported`) });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  const ImportCard: React.FC<{
    icon: React.ElementType; title: string; count: number;
    onExport: () => void; onTemplate: () => void;
    onImportClick: () => void; importKey: string; hint: string;
  }> = ({ icon: Icon, title, count, onExport, onTemplate, onImportClick, importKey, hint }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
          <Badge variant="secondary" className="ml-auto">{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onExport} disabled={count === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("Exportar Dados", "Export Data")}
          </Button>
          <Button variant="outline" size="sm" onClick={onTemplate}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Template
          </Button>
          <Button size="sm" onClick={onImportClick} disabled={importing === importKey}>
            {importing === importKey ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
            {t("Importar", "Import")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">Import / Export</h2>

      <input ref={platFileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) importPlatforms(f); e.target.value = ""; }} />
      <input ref={bpFileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) importProcesses(f); e.target.value = ""; }} />
      <input ref={biaFileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) importBIA(f); e.target.value = ""; }} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ImportCard
          icon={Server}
          title={t("Plataformas CMDB", "CMDB Platforms")}
          count={platforms.length}
          onExport={exportPlatforms}
          onTemplate={exportTemplatePlatforms}
          onImportClick={() => platFileRef.current?.click()}
          importKey="platforms"
          hint={t("Colunas: Nome, DR_Type_ID (opcional)", "Columns: Nome, DR_Type_ID (optional)")}
        />
        <ImportCard
          icon={Briefcase}
          title={t("Processos de Negócio", "Business Processes")}
          count={processes.length}
          onExport={exportProcesses}
          onTemplate={exportTemplateProcesses}
          onImportClick={() => bpFileRef.current?.click()}
          importKey="processes"
          hint={t("Colunas: Tipo_Funcao, Funcao, Macro_Processo, Processo", "Columns: Tipo_Funcao, Funcao, Macro_Processo, Processo")}
        />
        <ImportCard
          icon={BarChart3}
          title={t("BIA + Plataformas", "BIA + Platforms")}
          count={biaProcesses.length}
          onExport={exportBIA}
          onTemplate={exportTemplateBIA}
          onImportClick={() => biaFileRef.current?.click()}
          importKey="bia"
          hint={t(
            "Colunas: Nome_PT, Nome_EN, RTO, RPO, Criticidade, DR_Type_ID, Business_Process_ID, Plataformas (nomes separados por ;)",
            "Columns: Nome_PT, Nome_EN, RTO, RPO, Criticidade, DR_Type_ID, Business_Process_ID, Plataformas (names separated by ;)"
          )}
        />
      </div>
    </div>
  );
};

export default ImportExportSection;
