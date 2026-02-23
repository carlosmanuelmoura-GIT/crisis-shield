import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const critColor: Record<string, string> = {
  critical: "hsl(0, 72%, 51%)",
  high: "hsl(45, 90%, 55%)",
  medium: "hsl(220, 5%, 55%)",
};

const BIASection: React.FC = () => {
  const { lang, biaProcesses } = useApp();

  const chartData = biaProcesses.map(p => ({
    name: t(p.name, lang),
    RTO: p.rto,
    RPO: p.rpo,
    criticality: p.criticality,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Análise de Impacto (BIA)" : "Business Impact Analysis (BIA)"}
      </h2>

      {/* Chart */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">{lang === "pt" ? "RTO vs RPO (horas)" : "RTO vs RPO (hours)"}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(60, 5%, 70%)" }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "hsl(60, 5%, 70%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(220, 10%, 18%)", border: "1px solid hsl(220, 8%, 28%)", color: "hsl(60, 5%, 90%)" }} />
              <Bar dataKey="RTO" fill="hsl(0, 72%, 51%)" radius={[0, 2, 2, 0]} />
              <Bar dataKey="RPO" fill="hsl(45, 90%, 55%)" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dependency table */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">{lang === "pt" ? "Mapa de Dependências" : "Dependency Map"}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="space-y-2">
            {biaProcesses.map(p => {
              const deps = p.dependencies.map(d => {
                const found = biaProcesses.find(bp => bp.id === d);
                return found ? t(found.name, lang) : d;
              });
              return (
                <div key={p.id} className="flex items-start gap-2 text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0`} style={{ backgroundColor: critColor[p.criticality] }} />
                  <div>
                    <span className="font-medium">{t(p.name, lang)}</span>
                    {deps.length > 0 && (
                      <span className="text-muted-foreground"> → {deps.join(", ")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BIASection;
