import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUserProfile, useCurrentUserRoles } from "@/hooks/useUserRoles";
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2 px-3 py-2">
        <SidebarTrigger className="shrink-0" />

        <div className="flex items-center gap-1.5 mr-2">
          <AlertTriangle className="h-5 w-5 text-alert sat-keep" />
          <h1 className="text-sm font-bold tracking-wider uppercase hidden sm:block">
            GCN
          </h1>
        </div>

        {/* User info */}
        <div className="flex items-center gap-1.5 mr-1 shrink-0 hidden md:flex">
          <User className="h-3.5 w-3.5 text-muted-foreground sat-keep" />
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {profile?.display_name || user?.email || "—"}
          </span>
          {roles.length > 0 && (
            <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0">
              {roleLabels[roles[0]] || roles[0]}
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground sat-keep" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === "pt" ? "Pesquisar..." : "Search..."}
            className="pl-8 h-8 text-sm bg-secondary border-border"
          />
        </div>

        {/* Satellite toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Satellite className="h-4 w-4 text-muted-foreground sat-keep" />
          <Switch
            checked={satelliteMode}
            onCheckedChange={toggleSatellite}
            className="data-[state=checked]:bg-alert"
          />
        </div>

        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "pt" ? "en" : "pt")}
          className="text-xs font-mono shrink-0 h-8 px-2"
        >
          <Globe className="h-3.5 w-3.5 mr-1 sat-keep" />
          {lang.toUpperCase()}
        </Button>

        {/* Crisis clear button */}
        {crisisActive && (
          <Button
            variant="destructive"
            size="sm"
            onClick={clearCrisis}
            className="h-8 text-xs animate-pulse-crisis"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            {lang === "pt" ? "LIMPAR" : "CLEAR"}
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-xs shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
          title={user?.email || ""}
        >
          <LogOut className="h-3.5 w-3.5 mr-1 sat-keep" />
          {lang === "pt" ? "Sair" : "Logout"}
        </Button>
      </div>
    </header>
  );
};

export default Header;
