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
import BackOfficeSection from "@/components/sections/BackOfficeSection";
import PCNDepartamentaisSection from "@/components/sections/PCNDepartamentaisSection";
import TestCalendarSection from "@/components/sections/TestCalendarSection";
import CrisisControlSection from "@/components/sections/CrisisControlSection";
import DocumentationSection from "@/components/sections/DocumentationSection";
import ImportExportSection from "@/components/sections/ImportExportSection";

const sectionMap: Record<string, React.FC> = {
  scenarios: ScenariosSection,
  "crisis-control": CrisisControlSection,
  emergency: EmergencySection,
  contacts: ContactsSection,
  sms: SMSSection,
  procedures: ProceduresSection,
  bia: BIASection,
  services: ServicesSection,
  meetings: MeetingsSection,
  log: DecisionLogSection,
  backoffice: BackOfficeSection,
  "pcn-departamentais": PCNDepartamentaisSection,
  "test-calendar": TestCalendarSection,
  documentacao: DocumentationSection,
  "import-export": ImportExportSection,
};

const Index = () => {
  const { activeSection } = useApp();
  const Section = sectionMap[activeSection] || EmergencySection;

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 w-full">
      <Section />
    </main>
  );
};

export default Index;
