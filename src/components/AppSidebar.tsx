import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  FileText,
  BarChart3,
  Video,
  ClipboardList,
  LayoutGrid,
  Settings,
  Eye,
  BookOpen,
  Shield,
  Search as SearchIcon,
  Building2,
  ChevronRight,
  Truck,
  Users,
  Key,
  MapPin,
  CreditCard,
  FileCheck,
} from "lucide-react";

/* ── Top-level "Visão Global" items ── */
const visaoGlobalItems = [
  { id: "politica-gcn", label: { pt: "Política GCN", en: "BCM Policy" }, icon: Shield },
  { id: "proc-normalidade", label: { pt: "Procedimentos Normalidade e Alerta", en: "Normal & Alert Procedures" }, icon: FileCheck },
  { id: "scenarios", label: { pt: "Cenários Crise", en: "Crisis Scenarios" }, icon: LayoutGrid },
  { id: "glossario", label: { pt: "Glossário GCN", en: "BCM Glossary" }, icon: BookOpen },
  { id: "manual-bia", label: { pt: "Manual BIA", en: "BIA Manual" }, icon: BarChart3 },
  { id: "pcn-global", label: { pt: "Planos de Continuidade de Negócio", en: "Business Continuity Plans" }, icon: FileText },
  { id: "plano-crise", label: { pt: "Plano de Gestão de Crise", en: "Crisis Management Plan" }, icon: AlertTriangle },
  { id: "plano-dsi", label: { pt: "Plano Recuperação Tecnológica (DSI)", en: "Tech Recovery Plan (DSI)" }, icon: Settings },
  { id: "plano-dli", label: { pt: "Plano Emergência Interno (DLI)", en: "Internal Emergency Plan (DLI)" }, icon: AlertTriangle },
  { id: "plano-dpe", label: { pt: "Plano Recursos Humanos (DPE)", en: "HR Plan (DPE)" }, icon: Users },
];

/* ── Departments ── */
const departments = [
  { code: "DAS", hasCC: false },
  { code: "DAU", hasCC: false },
  { code: "DCC", hasCC: false },
  { code: "DCM", hasCC: false },
  { code: "DCR", hasCC: true },
  { code: "DDE", hasCC: false },
  { code: "DEE", hasCC: false },
  { code: "DES", hasCC: false },
  { code: "DET", hasCC: false },
  { code: "DJU", hasCC: false },
  { code: "DMR", hasCC: true },
  { code: "DPE", hasCC: false },
  { code: "DPG", hasCC: true },
  { code: "DRE", hasCC: false },
  { code: "DLI", hasCC: false },
  { code: "DSC", hasCC: false },
  { code: "DSI", hasCC: true },
  { code: "DSP", hasCC: false },
  { code: "GAB", hasCC: false },
  { code: "GPD", hasCC: false },
  { code: "SEC", hasCC: false },
  { code: "SEC-DRC", hasCC: false },
];

const deptSubItems = (code: string, hasCC: boolean, lang: "pt" | "en") => {
  const items = [
    { id: `${code}-proc`, label: lang === "pt" ? "Procedimentos" : "Procedures", icon: FileText },
    { id: `${code}-contacts`, label: lang === "pt" ? "Lista de Contactos" : "Contact List", icon: Phone },
  ];
  if (hasCC) {
    items.push({ id: `${code}-cc`, label: lang === "pt" ? "Lista de Acesso ao CC" : "CC Access List", icon: Key });
  }
  items.push(
    { id: `${code}-bia`, label: "BIA", icon: BarChart3 },
    { id: `${code}-fornecedores`, label: lang === "pt" ? "Fornecedores" : "Suppliers", icon: Building2 },
  );
  return items;
};

/* ── Operational / War Room items (existing) ── */
const operationalItems = [
  { id: "emergency", icon: AlertTriangle, label: { pt: "Action Cards", en: "Action Cards" } },
  { id: "contacts", icon: Phone, label: { pt: "Contactos", en: "Contacts" } },
  { id: "sms", icon: MessageSquare, label: { pt: "SMS Express", en: "SMS Express" } },
  { id: "procedures", icon: FileText, label: { pt: "Procedimentos", en: "Procedures" } },
  { id: "bia", icon: BarChart3, label: { pt: "BIA", en: "BIA" } },
];

const warRoomItems = [
  { id: "meetings", icon: Video, label: { pt: "Sala de Reuniões Virtuais", en: "Virtual Meeting Rooms" } },
  { id: "log", icon: ClipboardList, label: { pt: "Log Decisões", en: "Decision Log" } },
];

/* ── Logística items ── */
const logisticaItems = [
  { id: "logistica-carregado", label: { pt: "Complexo do Carregado", en: "Carregado Complex" }, icon: MapPin },
  { id: "logistica-acessos", label: { pt: "Acessos autorizados", en: "Authorized Access" }, icon: Key },
  { id: "logistica-lugares", label: { pt: "Lugares por departamentos", en: "Seats by Department" }, icon: Building2 },
  { id: "logistica-concur", label: { pt: "Guia Prático Concur", en: "Concur Guide" }, icon: CreditCard },
  { id: "logistica-bolt", label: { pt: "Procedimento BOLT", en: "BOLT Procedure" }, icon: FileCheck },
];

/* ── Component ── */
const AppSidebar: React.FC = () => {
  const { lang, activeSection, setActiveSection } = useApp();

  const MenuBtn: React.FC<{ id: string; icon: React.ElementType; label: string }> = ({ id, icon: Icon, label }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setActiveSection(id)}
        className={activeSection === id ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}
      >
        <Icon className="h-4 w-4 mr-2 shrink-0 sat-keep" />
        <span className="truncate text-xs">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="border-r border-sidebar-border">
      <ScrollArea className="h-full">
        <SidebarContent className="pt-14 pb-6">

          {/* ── Visão Global ── */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              <Eye className="h-3.5 w-3.5 mr-1.5 inline sat-keep" />
              {lang === "pt" ? "VISÃO GLOBAL" : "GLOBAL VIEW"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visaoGlobalItems.map(item => (
                  <MenuBtn key={item.id} id={item.id} icon={item.icon} label={t(item.label, lang)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── Operacional ── */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              ⚙️ {lang === "pt" ? "OPERACIONAL" : "OPERATIONAL"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {operationalItems.map(item => (
                  <MenuBtn key={item.id} id={item.id} icon={item.icon} label={t(item.label, lang)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── War Room ── */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              🏛️ WAR ROOM
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {warRoomItems.map(item => (
                  <MenuBtn key={item.id} id={item.id} icon={item.icon} label={t(item.label, lang)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── PCN Departamentais ── */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              <Building2 className="h-3.5 w-3.5 mr-1.5 inline sat-keep" />
              {lang === "pt" ? "PCN DEPARTAMENTAIS" : "DEPARTMENTAL BCPs"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {departments.map(dept => (
                <Collapsible key={dept.code}>
                  <CollapsibleTrigger className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-semibold text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors group">
                    <ChevronRight className="h-3 w-3 shrink-0 transition-transform group-data-[state=open]:rotate-90 sat-keep" />
                    {dept.code}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="ml-4 border-l border-sidebar-border pl-2">
                      {deptSubItems(dept.code, dept.hasCC, lang).map(sub => (
                        <MenuBtn key={sub.id} id={sub.id} icon={sub.icon} label={sub.label} />
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── Logística ── */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              <Truck className="h-3.5 w-3.5 mr-1.5 inline sat-keep" />
              {lang === "pt" ? "LOGÍSTICA" : "LOGISTICS"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {logisticaItems.map(item => (
                  <MenuBtn key={item.id} id={item.id} icon={item.icon} label={t(item.label, lang)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── Administração ── */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              🔧 {lang === "pt" ? "ADMINISTRAÇÃO" : "ADMINISTRATION"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuBtn id="backoffice" icon={Settings} label={lang === "pt" ? "Back Office" : "Back Office"} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
};

export default AppSidebar;
