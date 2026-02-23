import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server, Building2, Users, Truck, MapPin, ShieldAlert,
  Monitor, Home, UserCheck, Network, Zap, ChevronRight,
} from "lucide-react";

interface Capability {
  id: string;
  name: { pt: string; en: string };
  icon: React.FC<{ className?: string }>;
  scenarios: string[];
}

interface Scenario {
  id: string;
  roman: string;
  name: { pt: string; en: string };
  icon: React.FC<{ className?: string }>;
  color: string;
}

const scenarios: Scenario[] = [
  { id: "s1", roman: "I", name: { pt: "Indisponibilidade de sistemas", en: "Systems unavailability" }, icon: Server, color: "border-crisis bg-crisis/10" },
  { id: "s2", roman: "II", name: { pt: "Indisponibilidade de edifícios", en: "Buildings unavailability" }, icon: Building2, color: "border-alert bg-alert/10" },
  { id: "s3", roman: "III", name: { pt: "Indisponibilidade de recursos humanos", en: "Human resources unavailability" }, icon: Users, color: "border-alert bg-alert/10" },
  { id: "s4", roman: "IV", name: { pt: "Indisponibilidade de fornecedores críticos", en: "Critical suppliers unavailability" }, icon: Truck, color: "border-muted" },
  { id: "s5", roman: "V", name: { pt: "Desastre alargado na Área Metropolitana de Lisboa", en: "Large-scale disaster in Lisbon Metropolitan Area" }, icon: MapPin, color: "border-crisis bg-crisis/10" },
  { id: "s6", roman: "VI", name: { pt: "Ciberataque", en: "Cyber attack" }, icon: ShieldAlert, color: "border-crisis bg-crisis/10" },
];

const capabilities: Capability[] = [
  { id: "cap-digital", name: { pt: "Capacidade Digital", en: "Digital Capability" }, icon: Monitor, scenarios: ["s1", "s6"] },
  { id: "cap-fisica", name: { pt: "Capacidade de Presença Física", en: "Physical Presence Capability" }, icon: Home, scenarios: ["s2", "s5"] },
  { id: "cap-rh", name: { pt: "Capacidade Recursos Humanos", en: "Human Resources Capability" }, icon: UserCheck, scenarios: ["s3"] },
  { id: "cap-eco", name: { pt: "Capacidade de Ecossistema", en: "Ecosystem Capability" }, icon: Network, scenarios: ["s4"] },
  { id: "cap-energia", name: { pt: "Capacidade Energética", en: "Energy Capability" }, icon: Zap, scenarios: ["s5"] },
];

const ScenariosSection: React.FC = () => {
  const { lang } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const t = (text: { pt: string; en: string }) => text[lang] ?? text.pt;

  const activeCapabilities = selected
    ? capabilities.filter(c => c.scenarios.includes(selected))
    : capabilities;

  const selectedScenario = scenarios.find(s => s.id === selected);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Cenários de Crise" : "Crisis Scenarios"}
      </h2>

      {/* Scenario grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {scenarios.map(s => {
          const Icon = s.icon;
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
                <Icon className={`h-5 w-5 shrink-0 sat-keep ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground tracking-wider">
                    {lang === "pt" ? "CENÁRIO" : "SCENARIO"} {s.roman}
                  </p>
                  <p className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}>
                    {t(s.name)}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 sat-keep transition-transform ${isActive ? "rotate-90 text-foreground" : "text-muted-foreground"}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Capabilities section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "pt" ? "Recursos que se perdem" : "Lost Resources"}
          </h3>
          {selectedScenario && (
            <Badge variant="outline" className="text-xs">
              {lang === "pt" ? "Cenário" : "Scenario"} {selectedScenario.roman}
            </Badge>
          )}
        </div>

        {activeCapabilities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {lang === "pt" ? "Nenhuma capacidade afetada neste cenário." : "No capabilities affected in this scenario."}
          </p>
        ) : (
          <div className="grid gap-2">
            {activeCapabilities.map(cap => {
              const Icon = cap.icon;
              const linkedScenarios = scenarios.filter(s => cap.scenarios.includes(s.id));
              return (
                <Card key={cap.id} className="border-l-4 border-accent">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0 sat-keep" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t(cap.name)}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {linkedScenarios.map(s => (
                          <Badge
                            key={s.id}
                            variant="secondary"
                            className={`text-[10px] cursor-pointer ${selected === s.id ? "bg-ring text-background" : ""}`}
                            onClick={() => setSelected(selected === s.id ? null : s.id)}
                          >
                            {s.roman}
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
