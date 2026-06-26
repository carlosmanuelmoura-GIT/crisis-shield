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
  SidebarMenuButton } from
"@/components/ui/sidebar";
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
  Shield,
  Building2,
  ArrowUpDown,
  Users } from
"lucide-react";


/* ── Operacional ── */
const operationalItems = [
{ id: "scenarios", icon: LayoutGrid, label: { pt: "Cenários Crise", en: "Crisis Scenarios" } },
{ id: "procedures", icon: FileText, label: { pt: "Action Cards Gestão de Crise", en: "Crisis Action Cards" } },
{ id: "bia", icon: BarChart3, label: { pt: "BIA", en: "BIA" } },
{ id: "pcn-departamentais", icon: Building2, label: { pt: "PCN Departamentais", en: "Departmental BCPs" } },
{ id: "pessoas-criticas", icon: Users, label: { pt: "Pessoas Críticas", en: "Critical People" } },
{ id: "contacts", icon: Phone, label: { pt: "Contactos", en: "Contacts" } },
{ id: "sms", icon: MessageSquare, label: { pt: "SMS Express", en: "SMS Express" } },
{ id: "test-calendar", icon: ClipboardList, label: { pt: "Calendário de Testes", en: "Test Calendar" } }];


/* ── War Room ── */
const warRoomItems = [
{ id: "crisis-control", icon: Shield, label: { pt: "Controlo da Gestão de Crise", en: "Crisis Management Control" } },
{ id: "emergency", icon: AlertTriangle, label: { pt: "Action Cards Departamentos", en: "Departmental Action Cards" } },
{ id: "meetings", icon: Video, label: { pt: "Sala de Reuniões Virtuais", en: "Virtual Meeting Rooms" } },
{ id: "log", icon: ClipboardList, label: { pt: "Log das Acções Gestão Crise", en: "Action Log" } }];


/* ── Documentação ── */
const documentacaoItems = [
{ id: "documentacao", label: { pt: "Documentação GCN", en: "Documentation" }, icon: FileText }];


/* ── Component ── */
const AppSidebar: React.FC = () => {
  const { lang, activeSection, setActiveSection } = useApp();

  const MenuBtn: React.FC<{id: string;icon: React.ElementType;label: string;}> = ({ id, icon: Icon, label }) =>
  <SidebarMenuItem>
      <SidebarMenuButton
      onClick={() => setActiveSection(id)}
      className={activeSection === id ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}>
      
        <Icon className="h-4 w-4 mr-2 shrink-0 sat-keep" />
        <span className="truncate text-sm">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>;


  const renderGroup = (
  labelText: string,
  icon: React.ElementType | null,
  items: {id: string;icon: React.ElementType;label: {pt: string;en: string;};}[]) =>

  <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
        {icon && React.createElement(icon, { className: "h-3.5 w-3.5 mr-1.5 inline sat-keep" })}
        {labelText}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) =>
        <MenuBtn key={item.id} id={item.id} icon={item.icon} label={t(item.label, lang)} />
        )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;


  return (
    <Sidebar className="border-r border-sidebar-border">
      <ScrollArea className="h-full">
        <SidebarContent className="pt-14 pb-6">
          {renderGroup(lang === "pt" ? "OPERACIONAL" : "OPERATIONAL", null, operationalItems)}
          {renderGroup(lang === "pt" ? "WAR ROOM / Gestão Crise" : "WAR ROOM / Crisis Mgmt", null, warRoomItems)}
          {renderGroup(lang === "pt" ? "DOCUMENTAÇÃO GCN" : "DOCUMENTATION", Eye, documentacaoItems)}

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-sidebar-primary">
              🔧 {lang === "pt" ? "ADMINISTRAÇÃO" : "ADMINISTRATION"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuBtn id="backoffice" icon={Settings} label="Back Office" />
                <MenuBtn id="import-export" icon={ArrowUpDown} label="Import / Export" />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>);

};

export default AppSidebar;