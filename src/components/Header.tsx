import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUserProfile, useCurrentUserRoles } from "@/hooks/useUserRoles";
import { useCreateDecisionLog } from "@/hooks/useDecisionLog";
import { Search, Satellite, Globe, AlertTriangle, X, LogOut, User } from "lucide-react";
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

const Header: React.FC = () => {
  const {
    lang, setLang,
    satelliteMode, toggleSatellite,
    crisisActive, clearCrisis,
    searchQuery, setSearchQuery,
  } = useApp();
  const { signOut, user } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const { data: roles = [] } = useCurrentUserRoles();
  const createLog = useCreateDecisionLog();

  const handleClearCrisis = async () => {
    const author = profile?.display_name || user?.email || "Sistema";
    const text = lang === "pt" ? "✅ FIM DA CRISE" : "✅ CRISIS ENDED";
    try { await createLog.mutateAsync({ text, author }); } catch {}
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
            {lang === "pt" ? "LIMPAR" : "CLEAR"}
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
