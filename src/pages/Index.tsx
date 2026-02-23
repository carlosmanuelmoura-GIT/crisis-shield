import React from "react";
import { useApp } from "@/contexts/AppContext";
import EmergencySection from "@/components/sections/EmergencySection";
import ContactsSection from "@/components/sections/ContactsSection";
import SMSSection from "@/components/sections/SMSSection";
import ProceduresSection from "@/components/sections/ProceduresSection";
import BIASection from "@/components/sections/BIASection";
import ServicesSection from "@/components/sections/ServicesSection";
import MeetingsSection from "@/components/sections/MeetingsSection";
import DecisionLogSection from "@/components/sections/DecisionLogSection";
import ScenariosSection from "@/components/sections/ScenariosSection";

const sectionMap: Record<string, React.FC> = {
  scenarios: ScenariosSection,
  emergency: EmergencySection,
  contacts: ContactsSection,
  sms: SMSSection,
  procedures: ProceduresSection,
  bia: BIASection,
  services: ServicesSection,
  meetings: MeetingsSection,
  log: DecisionLogSection,
};

const Index = () => {
  const { activeSection } = useApp();
  const Section = sectionMap[activeSection] || EmergencySection;

  return (
    <main className="flex-1 overflow-auto p-4 max-w-3xl">
      <Section />
    </main>
  );
};

export default Index;
