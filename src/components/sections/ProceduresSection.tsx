import React, { useState } from "react";
import { useApp, t } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const ProceduresSection: React.FC = () => {
  const { lang, procedures, searchQuery } = useApp();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = procedures.filter(p =>
    !searchQuery ||
    t(p.title, lang).toLowerCase().includes(searchQuery.toLowerCase()) ||
    t(p.content, lang).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // Simple markdown renderer (headers, bold, lists)
  const renderMd = (md: string) => {
    return md.split("\n").map((line, i) => {
      if (line.startsWith("### ")) return <h4 key={i} className="font-bold text-sm mt-3 mb-1">{line.slice(4)}</h4>;
      if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-base mt-4 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) return <li key={i} className="ml-4 text-sm"><strong>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}</li>;
      }
      if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm list-disc">{line.slice(2)}</li>;
      if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 text-sm list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-sm">{line}</p>;
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Procedimentos Críticos" : "Critical Procedures"}
      </h2>
      {filtered.map(proc => (
        <Card key={proc.id}>
          <CardHeader className="p-3 cursor-pointer" onClick={() => toggle(proc.id)}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">{t(proc.title, lang)}</CardTitle>
                <p className="text-xs text-muted-foreground">{t(proc.category, lang)}</p>
              </div>
              {expanded[proc.id] ? <ChevronUp className="h-4 w-4 sat-keep" /> : <ChevronDown className="h-4 w-4 sat-keep" />}
            </div>
          </CardHeader>
          {expanded[proc.id] && (
            <CardContent className="p-3 pt-0 border-t border-border">
              {renderMd(t(proc.content, lang))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ProceduresSection;
