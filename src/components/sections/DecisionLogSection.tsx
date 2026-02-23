import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const DecisionLogSection: React.FC = () => {
  const { lang, crisisLog, addLogEntry } = useApp();
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    addLogEntry(text.trim(), author.trim() || (lang === "pt" ? "Anónimo" : "Anonymous"));
    setText("");
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Log de Decisões" : "Decision Log"}
      </h2>

      {/* Add entry */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <Input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder={lang === "pt" ? "Nome (opcional)" : "Name (optional)"}
            className="text-sm h-8"
          />
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={lang === "pt" ? "Nota rápida..." : "Quick note..."}
              className="text-sm"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} size="icon" className="shrink-0 bg-ok hover:bg-ok/90 text-ok-foreground">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-2">
        {crisisLog.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {lang === "pt" ? "Sem entradas no log." : "No log entries."}
          </p>
        )}
        {crisisLog.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm">{entry.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {entry.author} — {new Date(entry.timestamp).toLocaleString(lang === "pt" ? "pt-PT" : "en-GB")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DecisionLogSection;
