import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUserProfile, useCurrentUserRoles } from "@/hooks/useUserRoles";
import { useCreateDecisionLog } from "@/hooks/useDecisionLog";
import { useClearAllChecklistStates } from "@/hooks/useActionCards";
import { Search, Satellite, Globe, AlertTriangle, X, LogOut, Clock, Shield, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, string> = {
  steering_gcn: "Steering",
  tecnico_departamento: "Técnico",
  especialista_gcn: "Especialista",
};

function formatElapsed(startISO: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(startISO).getTime()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const CrisisTimer: React.FC<{ startTime: string; crisisType: "real" | "simulated" | null; lang: string }> = ({ startTime, crisisType, lang }) => {
  const [elapsed, setElapsed] = useState(() => formatElapsed(startTime));

  useEffect(() => {
    setElapsed(formatElapsed(startTime));
    const interval = setInterval(() => setElapsed(formatElapsed(startTime)), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const isSimulated = crisisType === "simulated";

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-bold shrink-0 ${isSimulated ? "bg-alert/20 text-alert border border-alert/30" : "bg-crisis/20 text-crisis border border-crisis/30"}`}>
      {isSimulated ? <FlaskConical className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
      <Clock className="h-3.5 w-3.5" />
      <span>{elapsed}</span>
      <span className="text-[10px] uppercase opacity-80">
        {isSimulated ? (lang === "pt" ? "SIM" : "SIM") : (lang === "pt" ? "REAL" : "REAL")}
      </span>
    </div>
  );
};

const Header: React.FC = () => {
  const {
    lang, setLang,
    satelliteMode, toggleSatellite,
    crisisActive, clearCrisis, crisisType, crisisStartTime,
    searchQuery, setSearchQuery,
  } = useApp();
  const { signOut, user } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const { data: roles = [] } = useCurrentUserRoles();
  const createLog = useCreateDecisionLog();
  const clearChecks = useClearAllChecklistStates();

  const handleClearCrisis = async () => {
    const author = profile?.display_name || user?.email || "Sistema";
    const typeLabel = crisisType === "simulated"
      ? (lang === "pt" ? "SIMULADA" : "SIMULATED")
      : (lang === "pt" ? "REAL" : "REAL");
    const text = lang === "pt" ? `✅ FIM DA CRISE ${typeLabel}` : `✅ ${typeLabel} CRISIS ENDED`;
    try { await createLog.mutateAsync({ text, author, crisis_started_at: crisisStartTime }); } catch {}
    try { await clearChecks.mutateAsync(); } catch {}
    clearCrisis();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Left: sidebar trigger + logo */}
        <SidebarTrigger className="shrink-0" />
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-5 w-5 text-alert sat-keep" />
          <h1 className="text-sm font-bold tracking-wider uppercase hidden sm:block">
            GCN
          </h1>
        </div>

        {/* Crisis Timer - always visible when crisis active */}
        {crisisActive && crisisStartTime && (
          <CrisisTimer startTime={crisisStartTime} crisisType={crisisType} lang={lang} />
        )}

        {/* Center: Search */}
        <div className="relative flex-1 max-w-md mx-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground sat-keep" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === "pt" ? "Pesquisar..." : "Search..."}
            className="pl-8 h-8 text-sm bg-secondary border-border"
          />
        </div>

        {/* Crisis clear */}
        {crisisActive && (
          <Button variant="destructive" size="sm" onClick={handleClearCrisis} className="h-8 text-xs animate-pulse-crisis shrink-0">
            <X className="h-3.5 w-3.5 mr-1" />
            {lang === "pt" ? "FIM DE CRISE" : "END CRISIS"}
          </Button>
        )}

        {/* Satellite toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Satellite className="h-4 w-4 text-muted-foreground sat-keep" />
          <Switch checked={satelliteMode} onCheckedChange={toggleSatellite} className="data-[state=checked]:bg-alert" />
        </div>

        {/* Right: user info, language, logout */}
        <div className="flex items-center gap-2 shrink-0 border-l border-border pl-3 ml-1">
          {/* User name & role */}
          <div className="hidden md:flex flex-col items-end leading-none">
            <span className="text-xs font-medium truncate max-w-[140px]">
              {profile?.display_name || user?.email || "—"}
            </span>
            {roles.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {roleLabels[roles[0]] || roles[0]}
              </span>
            )}
          </div>

          {/* Language */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
            className="text-xs font-mono h-8 px-2"
          >
            <Globe className="h-3.5 w-3.5 mr-1 sat-keep" />
            {lang.toUpperCase()}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
            title={user?.email || ""}
          >
            <LogOut className="h-3.5 w-3.5 mr-1 sat-keep" />
            {lang === "pt" ? "Sair" : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
