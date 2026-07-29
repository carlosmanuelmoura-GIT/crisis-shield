import React, { useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCMDBPlatforms, useCreateCMDBPlatform, useDeleteCMDBPlatform, useBIAProcessPlatforms, useDRTypes } from "@/hooks/useCMDBPlatforms";
import { useBusinessProcesses, useCreateBusinessProcess, useDeleteBusinessProcess } from "@/hooks/useBusinessProcesses";
import { useBIAProcesses, useCreateBIAProcess } from "@/hooks/useBIAProcesses";
import { useActionCards } from "@/hooks/useActionCards";
import { useBIAActionCards } from "@/hooks/useBIAActionCards";
import { useDepartments } from "@/hooks/useDepartments";
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
  const { data: drTypes = [] } = useDRTypes();
  const { data: processes = [] } = useBusinessProcesses();
  const { data: biaProcesses = [] } = useBIAProcesses();
  const { data: biaPlatLinks = [] } = useBIAProcessPlatforms();
  const { data: actionCards = [] } = useActionCards();
  const { data: biaActionCardLinks = [] } = useBIAActionCards();
  const { data: departments = [] } = useDepartments();
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
    const platMap = new Map(platforms.map(p => [p.id, p.name]));
    const bpMap = new Map(processes.map(p => [p.id, p.processo]));
    const acMap = new Map(actionCards.map(a => [a.id, a.title_pt]));
    const drMap = new Map(drTypes.map(d => [d.id, `${d.code} — ${d.label}`]));
    const deptMap = new Map(departments.map(d => [d.id, d.name]));

    const rows = biaProcesses.map(b => {
      const linkedPlatIds = biaPlatLinks.filter(l => l.bia_process_id === b.id).map(l => l.platform_id);
      const platNames = linkedPlatIds.map(pid => platMap.get(pid) || pid).join("; ");
      const linkedAcIds = biaActionCardLinks.filter(l => l.bia_process_id === b.id).map(l => l.action_card_id);
      const acNames = linkedAcIds.map(aid => acMap.get(aid) || aid).join("; ");
      const deptId = (b as any).department_id || "";

      return {
        Nome_PT: b.name_pt,
        Nome_EN: b.name_en,
        Descricao: (b as any).description || "",
        RTO: b.rto,
        RPO: b.rpo,
        Tipo_BIA: b.criticality,
        DR_Type_ID: b.dr_type_id || "",
        DR_Type_Nome: b.dr_type_id ? (drMap.get(b.dr_type_id) || "") : "",
        Business_Process_ID: b.business_process_id || "",
        Business_Process_Nome: b.business_process_id ? (bpMap.get(b.business_process_id) || "") : "",
        Departamento_ID: deptId,
        Departamento_Nome: deptId ? (deptMap.get(deptId) || "") : "",
        Plataformas: platNames,
        Action_Cards: acNames,
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
      Nome_PT: "", Nome_EN: "", Descricao: "", RTO: 0, RPO: 0, Tipo_BIA: "analitica",
      DR_Type_ID: "", DR_Type_Nome: "",
      Business_Process_ID: "", Business_Process_Nome: "",
      Departamento_ID: "", Departamento_Nome: "",
      Plataformas: "", Action_Cards: "",
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
        Nome_PT?: string; Nome_EN?: string; Descricao?: string; RTO?: number; RPO?: number;
        Tipo_BIA?: string; Criticidade?: string;
        DR_Type_ID?: string; DR_Type_Nome?: string;
        Business_Process_ID?: string; Business_Process_Nome?: string;
        Departamento_ID?: string; Departamento_Nome?: string;
        Plataformas?: string; Action_Cards?: string;
      }>(ws);

      // Build name -> id lookups (case-insensitive)
      const platNameMap = new Map(platforms.map(p => [p.name.toLowerCase().trim(), p.id]));
      const bpNameMap = new Map(processes.map(p => [(p.processo || "").toLowerCase().trim(), p.id]));
      const acNameMap = new Map(actionCards.map(a => [(a.title_pt || "").toLowerCase().trim(), a.id]));
      const drNameMap = new Map<string, string>();
      drTypes.forEach(d => {
        drNameMap.set((d.code || "").toLowerCase().trim(), d.id);
        drNameMap.set((d.label || "").toLowerCase().trim(), d.id);
        drNameMap.set(`${d.code} — ${d.label}`.toLowerCase().trim(), d.id);
      });
      const deptNameMap = new Map(departments.map(d => [(d.name || "").toLowerCase().trim(), d.id]));

      let count = 0;
      for (const row of rows) {
        if (!row.Nome_PT?.trim()) continue;

        // Resolve business_process_id: prefer explicit ID, else derive process name
        // from Business_Process_Nome (string after the first "-"), lookup by name,
        // and create a new business_processes row when not found.
        let bpId: string | null = row.Business_Process_ID?.trim() || null;
        let bpProcessoName = "";
        if (!bpId && row.Business_Process_Nome?.trim()) {
          const raw = row.Business_Process_Nome.trim();
          const dashIdx = raw.indexOf("-");
          bpProcessoName = (dashIdx >= 0 ? raw.slice(dashIdx + 1) : raw).trim();
          if (bpProcessoName) {
            const key = bpProcessoName.toLowerCase();
            bpId = bpNameMap.get(key) || null;
            if (!bpId) {
              // Try to find an existing process by name to copy hierarchy
              const match = processes.find(p => (p.processo || "").toLowerCase().trim() === key);
              const { data: newBp, error: bpErr } = await supabase
                .from("business_processes")
                .insert({
                  tipo_funcao: match?.tipo_funcao || "N/A",
                  funcao: match?.funcao || "N/A",
                  macro_processo: match?.macro_processo || "N/A",
                  processo: bpProcessoName,
                  owner_id: user?.id,
                } as any)
                .select("id")
                .single();
              if (bpErr) throw bpErr;
              bpId = newBp!.id;
              bpNameMap.set(key, bpId);
            }
          }
        } else if (bpId) {
          // If explicit ID provided, resolve processo name for description
          const found = processes.find(p => p.id === bpId);
          bpProcessoName = found?.processo || "";
        }

        // Resolve dr_type_id: prefer explicit ID, else lookup by name/code
        let drId: string | null = row.DR_Type_ID?.trim() || null;
        if (!drId && row.DR_Type_Nome?.trim()) {
          drId = drNameMap.get(row.DR_Type_Nome.toLowerCase().trim()) || null;
        }

        // Resolve department_id: prefer explicit ID, else lookup by name
        let deptId: string | null = row.Departamento_ID?.trim() || null;
        if (!deptId && row.Departamento_Nome?.trim()) {
          deptId = deptNameMap.get(row.Departamento_Nome.toLowerCase().trim()) || null;
        }

        // Description: use the file value when present, else auto-fill "<Nome_PT> · <Processo>"
        const namePt = row.Nome_PT.trim();
        const description = row.Descricao?.trim()
          || (bpProcessoName ? `${namePt} · ${bpProcessoName}` : namePt);

        // Insert BIA process and get the new id
        const { data: inserted, error: insertErr } = await supabase
          .from("bia_processes")
          .insert({
            name_pt: namePt,
            name_en: row.Nome_EN?.trim() || "",
            rto: Number(row.RTO) || 0,
            rpo: Number(row.RPO) || 0,
            criticality: (() => {
              const raw = (row.Tipo_BIA ?? row.Criticidade ?? "").toString().trim().toLowerCase();
              if (["vital", "critical", "crítico", "critico"].includes(raw)) return "vital";
              if (["decisao", "decisão", "high", "alto"].includes(raw)) return "decisao";
              if (["analitica", "analítica", "medium", "low", "médio", "medio", "baixo"].includes(raw)) return "analitica";
              return "analitica";
            })(),
            dr_type_id: drId,
            business_process_id: bpId,
            department_id: deptId,
            description,
            owner_id: user?.id,
          } as any)
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

        // Link Action Cards by name if specified
        if (row.Action_Cards?.trim() && inserted) {
          const acNames = row.Action_Cards.split(";").map(s => s.trim()).filter(Boolean);
          for (const acName of acNames) {
            const acId = acNameMap.get(acName.toLowerCase());
            if (acId) {
              await supabase.from("bia_action_cards").insert({
                bia_process_id: inserted.id,
                action_card_id: acId,
              });
            }
          }
        }
        count++;
      }

      qc.invalidateQueries({ queryKey: ["bia_processes"] });
      qc.invalidateQueries({ queryKey: ["bia_process_platforms"] });
      qc.invalidateQueries({ queryKey: ["bia_action_cards"] });
      qc.invalidateQueries({ queryKey: ["business_processes"] });
      toast({ title: t(`${count} processos BIA importados`, `${count} BIA processes imported`) });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  // ── Export Pessoas Críticas ──
  const exportPessoas = () => {
    const rows = pessoas.map(p => ({
      Nome: p.nome, Email: p.email, Telefone: p.telefone,
      Departamento: p.departamento, Funcao: p.funcao,
      Prioridade: p.prioridade, Codigo_Postal: p.codigo_postal,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pessoas_Criticas");
    XLSX.writeFile(wb, "pessoas_criticas.xlsx");
  };

  const exportTemplatePessoas = () => {
    const ws = XLSX.utils.json_to_sheet([{
      Nome: "", Email: "", Telefone: "", Departamento: "", Funcao: "", Prioridade: 0, Codigo_Postal: "",
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pessoas_Criticas");
    XLSX.writeFile(wb, "template_pessoas_criticas.xlsx");
  };

  const importPessoas = async (file: File) => {
    setImporting("pessoas");
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<{
        Nome?: string; Email?: string; Telefone?: string;
        Departamento?: string; Funcao?: string; Prioridade?: number; Codigo_Postal?: string;
      }>(ws);

      let count = 0;
      for (const row of rows) {
        if (!row.Nome?.trim()) continue;
        await insertPessoa.mutateAsync({
          nome: row.Nome.trim(),
          email: row.Email?.trim() || "",
          telefone: row.Telefone?.trim() || "",
          departamento: row.Departamento?.trim() || "",
          funcao: row.Funcao?.trim() || "",
          prioridade: Number(row.Prioridade) || 0,
          codigo_postal: row.Codigo_Postal?.trim() || "",
        });
        count++;
      }
      toast({ title: t(`${count} pessoas importadas`, `${count} people imported`) });
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
      <input ref={pessoasFileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) importPessoas(f); e.target.value = ""; }} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title={t("BIAS", "BIAs")}
          count={biaProcesses.length}
          onExport={exportBIA}
          onTemplate={exportTemplateBIA}
          onImportClick={() => biaFileRef.current?.click()}
          importKey="bia"
          hint={t(
            "Colunas: Nome_PT, Nome_EN, RTO, RPO, Tipo_BIA (vital/decisao/analitica), DR_Type_ID/DR_Type_Nome, Business_Process_ID/Business_Process_Nome, Departamento_ID/Departamento_Nome, Plataformas, Action_Cards (nomes separados por ;)",
            "Columns: Nome_PT, Nome_EN, RTO, RPO, Tipo_BIA (vital/decisao/analitica), DR_Type_ID/DR_Type_Nome, Business_Process_ID/Business_Process_Nome, Departamento_ID/Departamento_Nome, Plataformas, Action_Cards (names separated by ;)"
          )}
        />
        <ImportCard
          icon={Users}
          title={t("Pessoas Críticas", "Critical People")}
          count={pessoas.length}
          onExport={exportPessoas}
          onTemplate={exportTemplatePessoas}
          onImportClick={() => pessoasFileRef.current?.click()}
          importKey="pessoas"
          hint={t(
            "Colunas: Nome, Email, Telefone, Departamento, Funcao, Prioridade, Codigo_Postal",
            "Columns: Nome, Email, Telefone, Departamento, Funcao, Prioridade, Codigo_Postal"
          )}
        />
      </div>
    </div>
  );
};

export default ImportExportSection;
