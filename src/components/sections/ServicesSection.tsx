import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";

const statusColors: Record<string, string> = {
  green: "bg-ok",
  yellow: "bg-alert",
  red: "bg-crisis",
};

const statusLabels: Record<string, { pt: string; en: string }> = {
  green: { pt: "Operacional", en: "Operational" },
  yellow: { pt: "Degradado", en: "Degraded" },
  red: { pt: "Indisponível", en: "Unavailable" },
};

const ServicesSection: React.FC = () => {
  const { lang, services } = useApp();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Estado dos Serviços" : "Service Status"}
      </h2>
      <div className="grid gap-2">
        {services.map(svc => (
          <Card key={svc.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full shrink-0 ${statusColors[svc.status]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t(svc.name, lang)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(statusLabels[svc.status], lang)} — {new Date(svc.lastUpdate).toLocaleTimeString(lang === "pt" ? "pt-PT" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
