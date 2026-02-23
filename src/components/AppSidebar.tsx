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
  Activity,
  Video,
  ClipboardList,
  LayoutGrid,
} from "lucide-react";

const sections = [
  { id: "scenarios", icon: LayoutGrid, label: { pt: "Cenários", en: "Scenarios" }, group: "emergency" },
  { id: "procedures", icon: FileText, label: { pt: "Procedimentos", en: "Procedures" }, group: "emergency" },
  { id: "emergency", icon: AlertTriangle, label: { pt: "Action Cards", en: "Action Cards" }, group: "operational" },
  { id: "contacts", icon: Phone, label: { pt: "Contactos", en: "Contacts" }, group: "operational" },
  { id: "sms", icon: MessageSquare, label: { pt: "SMS Express", en: "SMS Express" }, group: "operational" },
  { id: "bia", icon: BarChart3, label: { pt: "BIA", en: "BIA" }, group: "operational" },
  { id: "services", icon: Activity, label: { pt: "Serviços", en: "Services" }, group: "operational" },
  { id: "meetings", icon: Video, label: { pt: "Reuniões", en: "Meetings" }, group: "warroom" },
  { id: "log", icon: ClipboardList, label: { pt: "Log Decisões", en: "Decision Log" }, group: "warroom" },
];

const groupLabels: Record<string, { pt: string; en: string }> = {
  emergency: { pt: "🚨 EMERGÊNCIA", en: "🚨 EMERGENCY" },
  operational: { pt: "⚙️ OPERACIONAL", en: "⚙️ OPERATIONAL" },
  warroom: { pt: "🏛️ WAR ROOM", en: "🏛️ WAR ROOM" },
};

const AppSidebar: React.FC = () => {
  const { lang, activeSection, setActiveSection } = useApp();

  const groups = ["emergency", "operational", "warroom"];

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="pt-2">
        {groups.map(group => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-xs font-bold tracking-wider text-muted-foreground">
              {t(groupLabels[group], lang)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.filter(s => s.group === group).map(section => (
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
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
