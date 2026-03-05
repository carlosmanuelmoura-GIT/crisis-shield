import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUserRoles, useCurrentUserProfile } from "@/hooks/useUserRoles";
import { useRecursos } from "@/hooks/useRecursos";
import { useCreateDecisionLog } from "@/hooks/useDecisionLog";
import { useClearAllChecklistStates } from "@/hooks/useActionCards";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle, Plus, Trash2, Shield, FlaskConical,
  Loader2, CheckCircle2, Circle, ArrowDown,
} from "lucide-react";

interface PhaseAction {
  id: string;
  text: string;
  checked: boolean;
}

const PHASES = [
  { id: "alerta", label: { pt: "ALERTA & CONTENÇÃO", en: "ALERT & CONTAINMENT" }, color: "border-alert bg-alert/10", icon: "🔔" },
  { id: "declaracao", label: { pt: "DECLARAÇÃO DE CRISE", en: "CRISIS DECLARATION" }, color: "border-crisis bg-crisis/10", icon: "🚨" },
  { id: "ativacao", label: { pt: "ATIVAÇÃO & RECUPERAÇÃO", en: "ACTIVATION & RECOVERY" }, color: "border-primary bg-primary/10", icon: "⚡" },
  { id: "retorno-inicio", label: { pt: "INÍCIO DE RETORNO", en: "RETURN START" }, color: "border-accent bg-accent/10", icon: "🔄" },
  { id: "retorno-fim", label: { pt: "RETORNO E FIM DE CRISE", en: "RETURN & END OF CRISIS" }, color: "border-secondary bg-secondary/10", icon: "📋" },
  { id: "fim", label: { pt: "FIM DE CRISE", en: "END OF CRISIS" }, color: "border-green-500 bg-green-500/10", icon: "✅" },
] as const;

const loadActions = (): Record<string, PhaseAction[]> => {
  try {
    const v = localStorage.getItem("gcn-crisis-control-actions");
    return v ? JSON.parse(v) : {};
  } catch { return {}; }
};

const CrisisControlSection: React.FC = () => {
  const { lang, crisisActive, crisisType, crisisStartTime, declareCrisis, clearCrisis } = useApp();
  const { data: roles = [] } = useCurrentUserRoles();
  const { data: profile } = useCurrentUserProfile();
  const { data: recursos = [] } = useRecursos();
  const { user } = useAuth();
  const createLog = useCreateDecisionLog();
  const clearChecks = useClearAllChecklistStates();

  const [actions, setActions] = useState<Record<string, PhaseAction[]>>(loadActions);
  const [newActionText, setNewActionText] = useState<Record<string, string>>({});

  // Crisis declaration state
  const [selectedRecursos, setSelectedRecursos] = useState<string[]>([]);
  const [crisisTypeChoice, setCrisisTypeChoice] = useState<"real" | "simulated">("real");

  const isSteering = roles.includes("steering_gcn") || roles.includes("especialista_gcn");

  const persistActions = (updated: Record<string, PhaseAction[]>) => {
    setActions(updated);
    localStorage.setItem("gcn-crisis-control-actions", JSON.stringify(updated));
  };

  const addAction = (phaseId: string) => {
    const text = (newActionText[phaseId] || "").trim();
    if (!text) return;
    const updated = { ...actions };
    const list = [...(updated[phaseId] || [])];
    list.push({ id: crypto.randomUUID(), text, checked: false });
    updated[phaseId] = list;
    persistActions(updated);
    setNewActionText(prev => ({ ...prev, [phaseId]: "" }));
  };

  const toggleAction = (phaseId: string, actionId: string) => {
    const updated = { ...actions };
    const list = [...(updated[phaseId] || [])];
    const idx = list.findIndex(a => a.id === actionId);
    if (idx >= 0) { list[idx] = { ...list[idx], checked: !list[idx].checked }; }
    updated[phaseId] = list;
    persistActions(updated);
  };

  const removeAction = (phaseId: string, actionId: string) => {
    const updated = { ...actions };
    updated[phaseId] = (updated[phaseId] || []).filter(a => a.id !== actionId);
    persistActions(updated);
  };

  const toggleRecurso = (id: string) => {
    setSelectedRecursos(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleDeclare = async () => {
    const recursoNames = selectedRecursos
      .map(id => recursos.find(r => r.id === id))
      .filter(Boolean)
      .map(r => r!.name_pt)
      .join(", ");
    const typeLabel = crisisTypeChoice === "real" ? "REAL" : (lang === "pt" ? "SIMULADA" : "SIMULATED");
    const author = profile?.display_name || "Sistema";
    const text = lang === "pt"
      ? `🚨 CRISE ${typeLabel} DECLARADA — Recursos perdidos: ${recursoNames || "Nenhum selecionado"}`
      : `🚨 ${typeLabel} CRISIS DECLARED — Resources lost: ${recursoNames || "None selected"}`;
    const startTime = new Date().toISOString();
    try { await createLog.mutateAsync({ text, author, crisis_started_at: startTime }); } catch {}
    declareCrisis(selectedRecursos, crisisTypeChoice, startTime);
    setSelectedRecursos([]);
    setCrisisTypeChoice("real");
  };

  const handleEndCrisis = async () => {
    const author = profile?.display_name || user?.email || "Sistema";
    const typeLabel = crisisType === "simulated" ? (lang === "pt" ? "SIMULADA" : "SIMULATED") : "REAL";
    const text = lang === "pt" ? `✅ FIM DA CRISE ${typeLabel}` : `✅ ${typeLabel} CRISIS ENDED`;
    try { await createLog.mutateAsync({ text, author, crisis_started_at: crisisStartTime }); } catch {}
    try { await clearChecks.mutateAsync(); } catch {}
    clearCrisis();
  };

  const getPhaseProgress = (phaseId: string) => {
    const list = actions[phaseId] || [];
    if (list.length === 0) return null;
    const done = list.filter(a => a.checked).length;
    return { done, total: list.length, pct: Math.round((done / list.length) * 100) };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary sat-keep" />
          {lang === "pt" ? "Controlo da Gestão de Crise" : "Crisis Management Control"}
        </h2>
        {crisisActive && (
          <Badge className={crisisType === "simulated" ? "bg-alert text-alert-foreground" : "bg-crisis text-crisis-foreground"}>
            {crisisType === "simulated" ? (lang === "pt" ? "CRISE SIMULADA" : "SIMULATED CRISIS") : (lang === "pt" ? "CRISE REAL" : "REAL CRISIS")}
          </Badge>
        )}
      </div>

      {/* Vertical Kanban */}
      <div className="space-y-3">
        {PHASES.map((phase, idx) => {
          const progress = getPhaseProgress(phase.id);
          const isDeclarationPhase = phase.id === "declaracao";
          const isEndPhase = phase.id === "fim";
          const phaseLabel = phase.label[lang] || phase.label.pt;

          return (
            <React.Fragment key={phase.id}>
              <Card className={`border-l-4 ${phase.color}`}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span>{phase.icon}</span>
                      {phaseLabel}
                    </CardTitle>
                    {progress && (
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {progress.done}/{progress.total} ({progress.pct}%)
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  {/* Declaration phase: show declare crisis button */}
                  {isDeclarationPhase && !crisisActive && isSteering && (
                    <div className="space-y-3 p-3 rounded-lg border border-crisis/30 bg-crisis/5">
                      <p className="text-xs font-medium text-muted-foreground">
                        {lang === "pt" ? "Tipo de Crise" : "Crisis Type"}
                      </p>
                      <RadioGroup
                        value={crisisTypeChoice}
                        onValueChange={(v) => setCrisisTypeChoice(v as "real" | "simulated")}
                        className="flex gap-3"
                      >
                        <label className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-secondary flex-1">
                          <RadioGroupItem value="real" />
                          <Shield className="h-3.5 w-3.5 text-crisis" />
                          <span className="text-xs font-medium">REAL</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-secondary flex-1">
                          <RadioGroupItem value="simulated" />
                          <FlaskConical className="h-3.5 w-3.5 text-alert" />
                          <span className="text-xs font-medium">{lang === "pt" ? "SIMULADA" : "SIMULATED"}</span>
                        </label>
                      </RadioGroup>

                      <p className="text-xs font-medium text-muted-foreground">
                        {lang === "pt" ? "Recurso(s) perdidos" : "Resources lost"}
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {recursos.map(r => (
                          <label key={r.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-secondary cursor-pointer">
                            <Checkbox checked={selectedRecursos.includes(r.id)} onCheckedChange={() => toggleRecurso(r.id)} />
                            <span className="text-xs">{lang === "pt" ? r.name_pt : r.name_en || r.name_pt}</span>
                          </label>
                        ))}
                      </div>

                      <Button
                        onClick={handleDeclare}
                        className="w-full bg-crisis text-crisis-foreground hover:bg-crisis/90 font-bold"
                        disabled={createLog.isPending}
                      >
                        {createLog.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {lang === "pt" ? "DECLARAR CRISE" : "DECLARE CRISIS"}
                      </Button>
                    </div>
                  )}

                  {isDeclarationPhase && crisisActive && (
                    <div className="p-2 rounded-md bg-crisis/10 border border-crisis/20">
                      <p className="text-xs font-medium text-crisis flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {lang === "pt" ? "Crise declarada e ativa" : "Crisis declared and active"}
                      </p>
                    </div>
                  )}

                  {/* End crisis phase */}
                  {isEndPhase && crisisActive && isSteering && (
                    <Button
                      variant="destructive"
                      onClick={handleEndCrisis}
                      className="w-full font-bold"
                    >
                      {lang === "pt" ? "FIM DE CRISE" : "END CRISIS"}
                    </Button>
                  )}

                  {/* Action items */}
                  {(actions[phase.id] || []).map(action => (
                    <div key={action.id} className="flex items-center gap-2 group">
                      <Checkbox
                        checked={action.checked}
                        onCheckedChange={() => toggleAction(phase.id, action.id)}
                      />
                      <span className={`text-xs flex-1 ${action.checked ? "line-through text-muted-foreground" : ""}`}>
                        {action.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => removeAction(phase.id, action.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  {/* Add new action */}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      placeholder={lang === "pt" ? "Nova acção..." : "New action..."}
                      value={newActionText[phase.id] || ""}
                      onChange={e => setNewActionText(prev => ({ ...prev, [phase.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addAction(phase.id)}
                      className="h-7 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => addAction(phase.id)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Arrow between phases */}
              {idx < PHASES.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CrisisControlSection;
