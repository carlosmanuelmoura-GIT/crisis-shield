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
} from "lucide-react";

const sections = [
  { id: "scenarios", icon: LayoutGrid, label: { pt: "Cenários", en: "Scenarios" }, group: "scenarios" },
  { id: "emergency", icon: AlertTriangle, label: { pt: "Action Cards", en: "Action Cards" }, group: "operational" },
  { id: "contacts", icon: Phone, label: { pt: "Contactos", en: "Contacts" }, group: "operational" },
  { id: "sms", icon: MessageSquare, label: { pt: "SMS Express", en: "SMS Express" }, group: "operational" },
  { id: "procedures", icon: FileText, label: { pt: "Procedimentos", en: "Procedures" }, group: "operational" },
  { id: "bia", icon: BarChart3, label: { pt: "BIA", en: "BIA" }, group: "operational" },
  { id: "meetings", icon: Video, label: { pt: "Sala de Reuniões Virtuais", en: "Virtual Meeting Rooms" }, group: "warroom" },
  { id: "log", icon: ClipboardList, label: { pt: "Log Decisões", en: "Decision Log" }, group: "warroom" },
  { id: "backoffice", icon: Settings, label: { pt: "Back Office", en: "Back Office" }, group: "admin" },
];

const groupLabels: Record<string, { pt: string; en: string }> = {
  scenarios: { pt: "🎯 CENÁRIOS", en: "🎯 SCENARIOS" },
  operational: { pt: "⚙️ OPERACIONAL", en: "⚙️ OPERATIONAL" },
  warroom: { pt: "🏛️ WAR ROOM", en: "🏛️ WAR ROOM" },
  admin: { pt: "🔧 ADMINISTRAÇÃO", en: "🔧 ADMINISTRATION" },
};

const AppSidebar: React.FC = () => {
  const { lang, activeSection, setActiveSection } = useApp();

  const groups = ["scenarios", "operational", "warroom", "admin"];

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="pt-14">
        {groups.map(group => {
          const groupSections = sections.filter(s => s.group === group);

          return (
            <SidebarGroup key={group}>
              <SidebarGroupLabel className="text-xs font-bold tracking-wider text-muted-foreground">
                {t(groupLabels[group], lang)}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupSections.map(section => (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(section.id)}
                        className={`${activeSection === section.id ? "bg-accent text-accent-foreground font-medium" : ""}`}
                      >
                        <section.icon className="h-4 w-4 mr-2 sat-keep" />
                        <span>{t(section.label, lang)}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
