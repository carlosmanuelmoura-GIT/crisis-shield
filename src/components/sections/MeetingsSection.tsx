import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ExternalLink } from "lucide-react";

const MeetingsSection: React.FC = () => {
  const { lang, meetingLinks } = useApp();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Salas de Reunião" : "Meeting Rooms"}
      </h2>
      <div className="grid gap-2">
        {meetingLinks.map(link => (
          <Card key={link.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-ok sat-keep" />
                <div>
                  <p className="text-sm font-medium">{t(link.name, lang)}</p>
                  <p className="text-xs text-muted-foreground uppercase">{link.platform}</p>
                </div>
              </div>
              <Button asChild variant="secondary" size="sm">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1 sat-keep" />
                  {lang === "pt" ? "Entrar" : "Join"}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MeetingsSection;
