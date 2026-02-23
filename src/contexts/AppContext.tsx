import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import crisisDataRaw from "@/data/crisis_data.json";

type Lang = "pt" | "en";
type I18nText = { pt: string; en: string };

export const t = (text: I18nText | string, lang: Lang): string => {
  if (typeof text === "string") return text;
  return text[lang] ?? text.pt;
};

export interface ChecklistItem { id: string; text: I18nText }
export interface ActionCard { id: string; title: I18nText; severity: string; icon: string; checklist: ChecklistItem[] }
export interface Contact { id: string; name: string; role: I18nText; phone: string; email: string; priority: string }
export interface Procedure { id: string; title: I18nText; category: I18nText; content: I18nText }
export interface BIAProcess { id: string; name: I18nText; rto: number; rpo: number; criticality: string; dependencies: string[] }
export interface ServiceStatus { id: string; name: I18nText; status: "green" | "yellow" | "red"; lastUpdate: string }
export interface MeetingLink { id: string; name: I18nText; url: string; platform: string }
export interface CrisisLogEntry { id: string; timestamp: string; text: string; author: string }

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  satelliteMode: boolean;
  toggleSatellite: () => void;
  crisisActive: boolean;
  declareCrisis: () => void;
  clearCrisis: () => void;
  actionCards: ActionCard[];
  contacts: Contact[];
  procedures: Procedure[];
  biaProcesses: BIAProcess[];
  services: ServiceStatus[];
  meetingLinks: MeetingLink[];
  checklistState: Record<string, boolean>;
  toggleCheckItem: (id: string) => void;
  crisisLog: CrisisLogEntry[];
  addLogEntry: (text: string, author: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => loadJSON("gcn-lang", "pt"));
  const [satelliteMode, setSatellite] = useState(() => loadJSON("gcn-satellite", false));
  const [crisisActive, setCrisis] = useState(() => loadJSON("gcn-crisis", false));
  const [checklistState, setChecklist] = useState<Record<string, boolean>>(() => loadJSON("gcn-checklist", {}));
  const [crisisLog, setCrisisLog] = useState<CrisisLogEntry[]>(() => loadJSON("gcn-log", []));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("emergency");

  const data = crisisDataRaw as any;

  // Persist to localStorage
  useEffect(() => { localStorage.setItem("gcn-lang", JSON.stringify(lang)); }, [lang]);
  useEffect(() => { localStorage.setItem("gcn-satellite", JSON.stringify(satelliteMode)); }, [satelliteMode]);
  useEffect(() => { localStorage.setItem("gcn-crisis", JSON.stringify(crisisActive)); }, [crisisActive]);
  useEffect(() => { localStorage.setItem("gcn-checklist", JSON.stringify(checklistState)); }, [checklistState]);
  useEffect(() => { localStorage.setItem("gcn-log", JSON.stringify(crisisLog)); }, [crisisLog]);

  // Apply CSS classes
  useEffect(() => {
    document.documentElement.classList.toggle("satellite-mode", satelliteMode);
  }, [satelliteMode]);
  useEffect(() => {
    document.documentElement.classList.toggle("crisis-active", crisisActive);
  }, [crisisActive]);

  const toggleSatellite = useCallback(() => setSatellite(p => !p), []);
  const declareCrisis = useCallback(() => {
    setCrisis(true);
    setActiveSection("emergency");
  }, []);
  const clearCrisis = useCallback(() => setCrisis(false), []);

  const toggleCheckItem = useCallback((id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const addLogEntry = useCallback((text: string, author: string) => {
    const entry: CrisisLogEntry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), text, author };
    setCrisisLog(prev => [entry, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang,
      satelliteMode, toggleSatellite,
      crisisActive, declareCrisis, clearCrisis,
      actionCards: data.actionCards,
      contacts: data.contacts,
      procedures: data.procedures,
      biaProcesses: data.bia.processes,
      services: data.services,
      meetingLinks: data.warRoom.meetingLinks,
      checklistState, toggleCheckItem,
      crisisLog, addLogEntry,
      searchQuery, setSearchQuery,
      activeSection, setActiveSection,
    }}>
      {children}
    </AppContext.Provider>
  );
};
