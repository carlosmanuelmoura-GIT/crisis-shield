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
  Building2,
  Truck,
  Users,
  Key,
  MapPin,
  CreditCard,
  FileCheck,
} from "lucide-react";

/* ── Visão Global ── */
const visaoGlobalItems = [
  { id: "politica-gcn", label: { pt: "Política GCN", en: "BCM Policy" }, icon: Shield },
  { id: "proc-normalidade", label: { pt: "Procedimentos Normalidade e Alerta", en: "Normal & Alert Procedures" }, icon: FileCheck },
  { id: "glossario", label: { pt: "Glossário GCN", en: "BCM Glossary" }, icon: BookOpen },
  { id: "manual-bia", label: { pt: "Manual BIA", en: "BIA Manual" }, icon: BarChart3 },
  { id: "pcn-global", label: { pt: "Planos de Continuidade de Negócio", en: "Business Continuity Plans" }, icon: FileText },
  { id: "plano-crise", label: { pt: "Plano de Gestão de Crise", en: "Crisis Management Plan" }, icon: AlertTriangle },
  { id: "plano-dsi", label: { pt: "Plano Recuperação Tecnológica (DSI)", en: "Tech Recovery Plan (DSI)" }, icon: Settings },
  { id: "plano-dli", label: { pt: "Plano Emergência Interno (DLI)", en: "Internal Emergency Plan (DLI)" }, icon: AlertTriangle },
  { id: "plano-dpe", label: { pt: "Plano Recursos Humanos (DPE)", en: "HR Plan (DPE)" }, icon: Users },
];

/* ── Operacional ── */
const operationalItems = [
  { id: "scenarios", icon: LayoutGrid, label: { pt: "Cenários Crise", en: "Crisis Scenarios" } },
  { id: "crisis-control", icon: Shield, label: { pt: "Controlo da Gestão de Crise", en: "Crisis Management Control" } },
  { id: "procedures", icon: FileText, label: { pt: "Procedimentos GCN", en: "BCM Procedures" } },
  { id: "bia", icon: BarChart3, label: { pt: "BIA", en: "BIA" } },
  { id: "pcn-departamentais", icon: Building2, label: { pt: "PCN Departamentais", en: "Departmental BCPs" } },
  { id: "contacts", icon: Phone, label: { pt: "Contactos", en: "Contacts" } },
  { id: "sms", icon: MessageSquare, label: { pt: "SMS Express", en: "SMS Express" } },
  { id: "test-calendar", icon: ClipboardList, label: { pt: "Calendário de Testes", en: "Test Calendar" } },
];

/* ── War Room ── */
const warRoomItems = [
  { id: "meetings", icon: Video, label: { pt: "Sala de Reuniões Virtuais", en: "Virtual Meeting Rooms" } },
  { id: "log", icon: ClipboardList, label: { pt: "Log das Acções", en: "Action Log" } },
];

/* ── Logística ── */
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

  const renderGroup = (
    labelText: string,
    icon: React.ElementType | null,
    items: { id: string; icon: React.ElementType; label: { pt: string; en: string } }[]
  ) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
        {icon && React.createElement(icon, { className: "h-3.5 w-3.5 mr-1.5 inline sat-keep" })}
        {labelText}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <MenuBtn key={item.id} id={item.id} icon={item.icon} label={t(item.label, lang)} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="border-r border-sidebar-border">
      <ScrollArea className="h-full">
        <SidebarContent className="pt-14 pb-6">
          {renderGroup(lang === "pt" ? "OPERACIONAL" : "OPERATIONAL", null, operationalItems)}
          {renderGroup(lang === "pt" ? "WAR ROOM / Gestão Crise" : "WAR ROOM / Crisis Mgmt", null, warRoomItems)}
          {renderGroup(lang === "pt" ? "LOGÍSTICA" : "LOGISTICS", Truck, logisticaItems)}
          {renderGroup(lang === "pt" ? "DOCUMENTAÇÃO" : "DOCUMENTATION", Eye, visaoGlobalItems)}

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              🔧 {lang === "pt" ? "ADMINISTRAÇÃO" : "ADMINISTRATION"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuBtn id="backoffice" icon={Settings} label="Back Office" />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
};

export default AppSidebar;
