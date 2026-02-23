import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  FileText,
  Phone,
  BarChart3,
  Building2,
  Key,
  ChevronRight,
  Search,
} from "lucide-react";

const departments = [
  { code: "DAS", name: "Departamento de Auditoria e Supervisão", hasCC: false },
  { code: "DAU", name: "Departamento de Auditoria", hasCC: false },
  { code: "DCC", name: "Departamento de Contabilidade e Controlo", hasCC: false },
  { code: "DCM", name: "Departamento de Comunicação", hasCC: false },
  { code: "DCR", name: "Departamento de Controlo de Risco", hasCC: true },
  { code: "DDE", name: "Departamento de Desenvolvimento Económico", hasCC: false },
  { code: "DEE", name: "Departamento de Estudos Económicos", hasCC: false },
  { code: "DES", name: "Departamento de Estatística", hasCC: false },
  { code: "DET", name: "Departamento de Estabilidade", hasCC: false },
  { code: "DJU", name: "Departamento Jurídico", hasCC: false },
  { code: "DMR", name: "Departamento de Mercados e Reservas", hasCC: true },
  { code: "DPE", name: "Departamento de Pessoas", hasCC: false },
  { code: "DPG", name: "Departamento de Pagamentos", hasCC: true },
  { code: "DRE", name: "Departamento de Relações Internacionais", hasCC: false },
  { code: "DLI", name: "Departamento de Logística e Instalações", hasCC: false },
  { code: "DSC", name: "Departamento de Supervisão Comportamental", hasCC: false },
  { code: "DSI", name: "Departamento de Sistemas de Informação", hasCC: true },
  { code: "DSP", name: "Departamento de Supervisão Prudencial", hasCC: false },
  { code: "GAB", name: "Gabinete", hasCC: false },
  { code: "GPD", name: "Gabinete de Planeamento e Design", hasCC: false },
  { code: "SEC", name: "Secretariado", hasCC: false },
  { code: "SEC-DRC", name: "Secretariado - DRC", hasCC: false },
];

const subItemIcon: Record<string, React.ElementType> = {
  proc: FileText,
  contacts: Phone,
  cc: Key,
  bia: BarChart3,
  fornecedores: Building2,
};

const PCNDepartamentaisSection: React.FC = () => {
  const { lang } = useApp();
  const [filter, setFilter] = useState("");

  const filtered = departments.filter(
    (d) =>
      d.code.toLowerCase().includes(filter.toLowerCase()) ||
      d.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getSubItems = (dept: typeof departments[0]) => {
    const items = [
      { key: "proc", label: lang === "pt" ? "Procedimentos" : "Procedures" },
      { key: "contacts", label: lang === "pt" ? "Lista de Contactos" : "Contact List" },
    ];
    if (dept.hasCC) {
      items.push({ key: "cc", label: lang === "pt" ? "Lista de Acesso ao CC" : "CC Access List" });
    }
    items.push(
      { key: "bia", label: "BIA" },
      { key: "fornecedores", label: lang === "pt" ? "Fornecedores" : "Suppliers" }
    );
    return items;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "PCN Departamentais" : "Departmental BCPs"}
      </h2>

      {/* Search / filter */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={lang === "pt" ? "Filtrar departamentos..." : "Filter departments..."}
          className="pl-8 h-9 text-sm"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} {lang === "pt" ? "departamentos" : "departments"}
      </p>

      {/* Department grid */}
      <div className="grid gap-2">
        {filtered.map((dept) => (
          <Collapsible key={dept.code}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="p-3 flex flex-row items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors group">
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="font-mono text-xs shrink-0">
                      {dept.code}
                    </Badge>
                    <span className="text-sm font-medium truncate">{dept.name}</span>
                  </div>
                  {dept.hasCC && (
                    <Badge className="ml-auto shrink-0 text-[10px] bg-primary/10 text-primary border-0">
                      CC
                    </Badge>
                  )}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-0 border-t border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-border">
                    {getSubItems(dept).map((sub) => {
                      const Icon = subItemIcon[sub.key];
                      return (
                        <button
                          key={sub.key}
                          className="flex flex-col items-center gap-1 py-3 px-2 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-center leading-tight">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default PCNDepartamentaisSection;
