import scenariosAsset from "@/assets/screenshots/scenarios.jpg";
import biaAsset from "@/assets/screenshots/bia.jpg";
import pcnAsset from "@/assets/screenshots/pcn-departamentais.jpg";
import pessoasAsset from "@/assets/screenshots/pessoas-criticas.jpg";
import contactsAsset from "@/assets/screenshots/contacts.jpg";
import testsAsset from "@/assets/screenshots/test-calendar.jpg";
import crisisAsset from "@/assets/screenshots/crisis-control.jpg";
import proceduresAsset from "@/assets/screenshots/procedures.jpg";
import emergencyAsset from "@/assets/screenshots/emergency.jpg";
import logAsset from "@/assets/screenshots/log.jpg";
import docsAsset from "@/assets/screenshots/documentacao.jpg";
import backofficeAsset from "@/assets/screenshots/backoffice.jpg";

export interface OverviewScreen {
  id: string;
  url: string;
  width: number;
  height: number;
  caption: { pt: string; en: string };
}

export const APP_OVERVIEW_SCREENS_TITLE = {
  pt: "ANEXO — ECRÃS DA APLICAÇÃO",
  en: "ANNEX — APPLICATION SCREENS",
};

const SIZE = { width: 1400, height: 875 };

export const APP_OVERVIEW_SCREENS: OverviewScreen[] = [
  { id: "scenarios", url: scenariosAsset, ...SIZE, caption: { pt: "Cenários de Crise", en: "Crisis Scenarios" } },
  { id: "bia", url: biaAsset, ...SIZE, caption: { pt: "BIA — Análise de Impacto no Negócio", en: "BIA — Business Impact Analysis" } },
  { id: "pcn", url: pcnAsset, ...SIZE, caption: { pt: "PCN Departamentais", en: "Departmental BCPs" } },
  { id: "pessoas", url: pessoasAsset, ...SIZE, caption: { pt: "Pessoas Críticas", en: "Critical People" } },
  { id: "contacts", url: contactsAsset, ...SIZE, caption: { pt: "Contactos", en: "Contacts" } },
  { id: "tests", url: testsAsset, ...SIZE, caption: { pt: "Calendário de Testes", en: "Test Calendar" } },
  { id: "crisis", url: crisisAsset, ...SIZE, caption: { pt: "Controlo da Gestão de Crise", en: "Crisis Management Control" } },
  { id: "procedures", url: proceduresAsset, ...SIZE, caption: { pt: "Action Cards Gestão de Crise", en: "Crisis Action Cards" } },
  { id: "emergency", url: emergencyAsset, ...SIZE, caption: { pt: "Action Cards Departamentos", en: "Departmental Action Cards" } },
  { id: "log", url: logAsset, ...SIZE, caption: { pt: "Log das Ações de Gestão de Crise", en: "Crisis Action Log" } },
  { id: "docs", url: docsAsset, ...SIZE, caption: { pt: "Documentação GCN", en: "BCM Documentation" } },
  { id: "backoffice", url: backofficeAsset, ...SIZE, caption: { pt: "Back Office — Tabelas Mestras", en: "Back Office — Master Tables" } },
];
