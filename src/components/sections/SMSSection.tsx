import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, MessageSquare } from "lucide-react";

const SMS_URL = "https://smsexpress.cloud.meoempresas.pt/smsexpress/";

const SMSSection: React.FC = () => {
  const { lang } = useApp();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "SMS Express" : "Express SMS"}
      </h2>

      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1">
              {lang === "pt" ? "Plataforma SMS Express — MEO Empresas" : "SMS Express Platform — MEO Empresas"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {lang === "pt"
                ? "Aceda à plataforma de envio de SMS em massa para comunicações de emergência e notificações de crise."
                : "Access the bulk SMS sending platform for emergency communications and crisis notifications."}
            </p>
          </div>
          <Button size="lg" onClick={() => window.open(SMS_URL, "_blank", "noopener,noreferrer")} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            {lang === "pt" ? "Abrir SMS Express" : "Open SMS Express"}
          </Button>
          <p className="text-xs text-muted-foreground">{SMS_URL}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSSection;
