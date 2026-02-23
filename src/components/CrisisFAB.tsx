import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUserRoles, useCurrentUserProfile } from "@/hooks/useUserRoles";
import { useRecursos } from "@/hooks/useRecursos";
import { useCreateDecisionLog } from "@/hooks/useDecisionLog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Shield, FlaskConical } from "lucide-react";

const CrisisFAB: React.FC = () => {
  const { lang, crisisActive, declareCrisis } = useApp();
  const { data: roles = [] } = useCurrentUserRoles();
  const { data: profile } = useCurrentUserProfile();
  const { data: recursos = [] } = useRecursos();
  const createLog = useCreateDecisionLog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecursos, setSelectedRecursos] = useState<string[]>([]);
  const [crisisTypeChoice, setCrisisTypeChoice] = useState<"real" | "simulated">("real");

  const isSteering = roles.includes("steering_gcn") || roles.includes("especialista_gcn");

  if (crisisActive || !isSteering) return null;

  const toggleRecurso = (id: string) => {
    setSelectedRecursos(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleDeclare = async () => {
    const recursoNames = selectedRecursos
      .map(id => recursos.find(r => r.id === id))
      .filter(Boolean)
      .map(r => r!.name_pt)
      .join(", ");

    const typeLabel = crisisTypeChoice === "real"
      ? (lang === "pt" ? "REAL" : "REAL")
      : (lang === "pt" ? "SIMULADA" : "SIMULATED");

    const author = profile?.display_name || "Sistema";
    const text = lang === "pt"
      ? `🚨 CRISE ${typeLabel} DECLARADA — Recursos perdidos: ${recursoNames || "Nenhum selecionado"}`
      : `🚨 ${typeLabel} CRISIS DECLARED — Resources lost: ${recursoNames || "None selected"}`;

    const startTime = new Date().toISOString();
    try {
      await createLog.mutateAsync({ text, author, crisis_started_at: startTime });
    } catch {}

    declareCrisis(selectedRecursos, crisisTypeChoice, startTime);
    setDialogOpen(false);
    setSelectedRecursos([]);
    setCrisisTypeChoice("real");
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 px-5 rounded-full bg-crisis text-crisis-foreground shadow-lg hover:bg-crisis/90 text-sm font-bold uppercase tracking-wide"
      >
        <AlertTriangle className="h-5 w-5 mr-2 sat-keep" />
        {lang === "pt" ? "DECLARAR CRISE" : "DECLARE CRISIS"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-crisis">
              <AlertTriangle className="h-5 w-5" />
              {lang === "pt" ? "Declarar Crise" : "Declare Crisis"}
            </DialogTitle>
          </DialogHeader>

          {/* Crisis Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {lang === "pt" ? "Tipo de Crise" : "Crisis Type"}
            </Label>
            <RadioGroup
              value={crisisTypeChoice}
              onValueChange={(v) => setCrisisTypeChoice(v as "real" | "simulated")}
              className="flex gap-4"
            >
              <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-secondary flex-1 data-[state=checked]:border-crisis">
                <RadioGroupItem value="real" id="real" />
                <Shield className="h-4 w-4 text-crisis" />
                <span className="text-sm font-medium">{lang === "pt" ? "REAL" : "REAL"}</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-secondary flex-1">
                <RadioGroupItem value="simulated" id="simulated" />
                <FlaskConical className="h-4 w-4 text-alert" />
                <span className="text-sm font-medium">{lang === "pt" ? "SIMULADA" : "SIMULATED"}</span>
              </label>
            </RadioGroup>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {lang === "pt"
                ? "Recurso(s) que se perderam"
                : "Resource(s) lost"}
            </Label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {recursos.map(r => (
                <label key={r.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer">
                  <Checkbox
                    checked={selectedRecursos.includes(r.id)}
                    onCheckedChange={() => toggleRecurso(r.id)}
                  />
                  <span className="text-sm">{lang === "pt" ? r.name_pt : r.name_en || r.name_pt}</span>
                </label>
              ))}
              {recursos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {lang === "pt" ? "Sem recursos configurados." : "No resources configured."}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {lang === "pt" ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              onClick={handleDeclare}
              className="bg-crisis text-crisis-foreground hover:bg-crisis/90"
              disabled={createLog.isPending}
            >
              {createLog.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lang === "pt" ? "DECLARAR CRISE" : "DECLARE CRISIS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CrisisFAB;
