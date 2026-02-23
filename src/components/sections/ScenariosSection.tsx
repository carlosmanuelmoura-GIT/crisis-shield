import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server, Building2, Users, Truck, MapPin, ShieldAlert,
  Monitor, Home, UserCheck, Network, Zap, ChevronRight, Loader2,
} from "lucide-react";
import { useCenarios, useCenarioRecursos } from "@/hooks/useCenarios";
import { useRecursos } from "@/hooks/useRecursos";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Server, Building2, Users, Truck, MapPin, ShieldAlert,
  Monitor, Home, UserCheck, Network, Zap,
};

const ScenariosSection: React.FC = () => {
  const { lang } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: cenarios, isLoading: loadingC } = useCenarios();
  const { data: recursos, isLoading: loadingR } = useRecursos();
  const { data: links, isLoading: loadingL } = useCenarioRecursos();

  const t = (pt: string, en: string) => (lang === "en" ? en : pt) || pt;

  if (loadingC || loadingR || loadingL) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const activeRecursos = selected
    ? (recursos ?? []).filter(r => (links ?? []).some(l => l.cenario_id === selected && l.recurso_id === r.id))
    : (recursos ?? []);

  const selectedCenario = (cenarios ?? []).find(c => c.id === selected);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Cenários de Crise" : "Crisis Scenarios"}
      </h2>

      {/* Scenario grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(cenarios ?? []).map(s => {
          const isActive = selected === s.id;
          return (
            <Card
              key={s.id}
              onClick={() => setSelected(isActive ? null : s.id)}
              className={`border-l-4 cursor-pointer transition-all ${s.color} ${
                isActive ? "ring-2 ring-ring shadow-lg scale-[1.02]" : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground tracking-wider">
                    {lang === "pt" ? "CENÁRIO" : "SCENARIO"} {s.roman}
                  </p>
                  <p className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}>
                    {t(s.name_pt, s.name_en)}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 sat-keep transition-transform ${isActive ? "rotate-90 text-foreground" : "text-muted-foreground"}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recursos section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "pt" ? "Recursos que se perdem" : "Lost Resources"}
          </h3>
          {selectedCenario && (
            <Badge variant="outline" className="text-xs">
              {lang === "pt" ? "Cenário" : "Scenario"} {selectedCenario.roman}
            </Badge>
          )}
        </div>

        {activeRecursos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {lang === "pt" ? "Nenhum recurso afetado neste cenário." : "No resources affected in this scenario."}
          </p>
        ) : (
          <div className="grid gap-2">
            {activeRecursos.map(rec => {
              const Icon = iconMap[rec.icon] || Monitor;
              const linkedCenarios = (cenarios ?? []).filter(c =>
                (links ?? []).some(l => l.cenario_id === c.id && l.recurso_id === rec.id)
              );
              return (
                <Card key={rec.id} className="border-l-4 border-accent">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0 sat-keep" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t(rec.name_pt, rec.name_en)}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {linkedCenarios.map(c => (
                          <Badge
                            key={c.id}
                            variant="secondary"
                            className={`text-[10px] cursor-pointer ${selected === c.id ? "bg-ring text-background" : ""}`}
                            onClick={() => setSelected(selected === c.id ? null : c.id)}
                          >
                            {c.roman}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenariosSection;
