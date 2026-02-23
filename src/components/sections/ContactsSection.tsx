import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const priorityBorder: Record<string, string> = {
  critical: "border-l-4 border-crisis",
  high: "border-l-4 border-alert",
  medium: "border-l-4 border-muted-foreground",
};

const ContactsSection: React.FC = () => {
  const { lang, contacts, searchQuery } = useApp();

  const filtered = contacts.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t(c.role, lang).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Contactos — Linha Vermelha" : "Contacts — Red Line"}
      </h2>
      <div className="grid gap-2">
        {filtered.map(c => (
          <Card key={c.id} className={priorityBorder[c.priority] || ""}>
            <CardContent className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{t(c.role, lang)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                  <a href={`tel:${c.phone}`}><Phone className="h-4 w-4 text-ok sat-keep" /></a>
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                  <a href={`sms:${c.phone}?body=${encodeURIComponent(lang === "pt" ? "URGENTE GCN: " : "URGENT BCM: ")}`}>
                    <MessageSquare className="h-4 w-4 text-alert sat-keep" />
                  </a>
                </Button>
                {c.email && (
                  <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                    <a href={`mailto:${c.email}`}><Mail className="h-4 w-4 sat-keep" /></a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactsSection;
