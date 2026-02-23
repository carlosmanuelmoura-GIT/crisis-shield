import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const SMSSection: React.FC = () => {
  const { lang, contacts } = useApp();
  const [message, setMessage] = useState(lang === "pt" ? "ALERTA GCN: Situação de emergência declarada. Contactar coordenador de crise imediatamente." : "BCM ALERT: Emergency situation declared. Contact crisis coordinator immediately.");

  const criticalContacts = contacts.filter(c => c.priority === "critical" && c.phone !== "112");

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "SMS Express" : "Express SMS"}
      </h2>
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">{lang === "pt" ? "Mensagem Rápida" : "Quick Message"}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="text-sm"
          />
          <div className="grid gap-2">
            {criticalContacts.map(c => (
              <Button key={c.id} asChild variant="secondary" className="justify-start text-sm h-auto py-2">
                <a href={`sms:${c.phone}?body=${encodeURIComponent(message)}`}>
                  <Send className="h-3.5 w-3.5 mr-2 sat-keep" />
                  {c.name}
                </a>
              </Button>
            ))}
          </div>
          <Button asChild className="w-full bg-crisis hover:bg-crisis/90 text-crisis-foreground">
            <a href={`sms:${criticalContacts.map(c => c.phone).join(",")}?body=${encodeURIComponent(message)}`}>
              <Send className="h-4 w-4 mr-2 sat-keep" />
              {lang === "pt" ? "ENVIAR A TODOS" : "SEND TO ALL"}
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSSection;
