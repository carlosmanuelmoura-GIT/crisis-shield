import scenariosAsset from "@/assets/screenshots/scenarios.jpg.asset.json";
import biaAsset from "@/assets/screenshots/bia.jpg.asset.json";
import pcnAsset from "@/assets/screenshots/pcn-departamentais.jpg.asset.json";
import pessoasAsset from "@/assets/screenshots/pessoas-criticas.jpg.asset.json";
import contactsAsset from "@/assets/screenshots/contacts.jpg.asset.json";
import testsAsset from "@/assets/screenshots/test-calendar.jpg.asset.json";
import crisisAsset from "@/assets/screenshots/crisis-control.jpg.asset.json";
import proceduresAsset from "@/assets/screenshots/procedures.jpg.asset.json";
import emergencyAsset from "@/assets/screenshots/emergency.jpg.asset.json";
import logAsset from "@/assets/screenshots/log.jpg.asset.json";
import docsAsset from "@/assets/screenshots/documentacao.jpg.asset.json";
import backofficeAsset from "@/assets/screenshots/backoffice.jpg.asset.json";

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
  { id: "scenarios", url: scenariosAsset.url, ...SIZE, caption: { pt: "Cenários de Crise", en: "Crisis Scenarios" } },
  { id: "bia", url: biaAsset.url, ...SIZE, caption: { pt: "BIA — Análise de Impacto no Negócio", en: "BIA — Business Impact Analysis" } },
  { id: "pcn", url: pcnAsset.url, ...SIZE, caption: { pt: "PCN Departamentais", en: "Departmental BCPs" } },
  { id: "pessoas", url: pessoasAsset.url, ...SIZE, caption: { pt: "Pessoas Críticas", en: "Critical People" } },
  { id: "contacts", url: contactsAsset.url, ...SIZE, caption: { pt: "Contactos", en: "Contacts" } },
  { id: "tests", url: testsAsset.url, ...SIZE, caption: { pt: "Calendário de Testes", en: "Test Calendar" } },
  { id: "crisis", url: crisisAsset.url, ...SIZE, caption: { pt: "Controlo da Gestão de Crise", en: "Crisis Management Control" } },
  { id: "procedures", url: proceduresAsset.url, ...SIZE, caption: { pt: "Action Cards Gestão de Crise", en: "Crisis Action Cards" } },
  { id: "emergency", url: emergencyAsset.url, ...SIZE, caption: { pt: "Action Cards Departamentos", en: "Departmental Action Cards" } },
  { id: "log", url: logAsset.url, ...SIZE, caption: { pt: "Log das Ações de Gestão de Crise", en: "Crisis Action Log" } },
  { id: "docs", url: docsAsset.url, ...SIZE, caption: { pt: "Documentação GCN", en: "BCM Documentation" } },
  { id: "backoffice", url: backofficeAsset.url, ...SIZE, caption: { pt: "Back Office — Tabelas Mestras", en: "Back Office — Master Tables" } },
];
