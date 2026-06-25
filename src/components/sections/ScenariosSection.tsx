import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server, Building2, Users, Truck, MapPin, ShieldAlert,
  Monitor, Home, UserCheck, Network, Zap, Loader2,
} from "lucide-react";
import { useCenarios, useCenarioRecursos } from "@/hooks/useCenarios";
import { useRecursos } from "@/hooks/useRecursos";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Server, Building2, Users, Truck, MapPin, ShieldAlert,
  Monitor, Home, UserCheck, Network, Zap,
};

const ScenariosSection: React.FC = () => {
  const { lang } = useApp();

  const { data: cenarios, isLoading: loadingC } = useCenarios();
  const { data: recursos, isLoading: loadingR } = useRecursos();
  const { data: links, isLoading: loadingL } = useCenarioRecursos();

  const t = (pt: string, en: string) => (lang === "en" ? en : pt) || pt;

  if (loadingC || loadingR || loadingL) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Cenários de Crise" : "Crisis Scenarios"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(cenarios ?? []).map(s => {
          const scenarioRecursos = (recursos ?? []).filter(r =>
            (links ?? []).some(l => l.cenario_id === s.id && l.recurso_id === r.id)
          );

          return (
            <Card key={s.id} className={`border-l-4 ${s.color} h-full flex flex-col`}>
              <div className="p-4 border-b bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted-foreground tracking-widest">
                      {lang === "pt" ? "CENÁRIO" : "SCENARIO"} {s.roman}
                    </p>
                    <p className="text-sm font-semibold leading-snug">
                      {t(s.name_pt, s.name_en)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {scenarioRecursos.length} {lang === "pt" ? "rec." : "res."}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3 flex-1 bg-muted/30">
                {scenarioRecursos.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    {lang === "pt" ? "Sem recursos associados." : "No resources associated."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {scenarioRecursos.map(rec => {
                      const Icon = iconMap[rec.icon] || Monitor;
                      const otherCenarios = (cenarios ?? []).filter(c =>
                        c.id !== s.id &&
                        (links ?? []).some(l => l.cenario_id === c.id && l.recurso_id === rec.id)
                      );
                      return (
                        <Card key={rec.id} className="border border-border/60 shadow-sm">
                          <CardContent className="p-2.5 flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0 sat-keep" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{t(rec.name_pt, rec.name_en)}</p>
                              {otherCenarios.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {otherCenarios.map(c => (
                                    <Badge key={c.id} variant="secondary" className="text-[9px] px-1 py-0">
                                      {c.roman}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ScenariosSection;
