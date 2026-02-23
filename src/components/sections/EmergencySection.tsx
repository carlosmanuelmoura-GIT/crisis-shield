import React, { useState } from "react";
import { useApp, t } from "@/contexts/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Flame, ShieldAlert, CloudRain, HeartPulse, ZapOff, WifiOff } from "lucide-react";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  "flame": Flame,
  "shield-alert": ShieldAlert,
  "cloud-rain": CloudRain,
  "heart-pulse": HeartPulse,
  "zap-off": ZapOff,
  "wifi-off": WifiOff,
};

const severityColors: Record<string, string> = {
  critical: "border-crisis bg-crisis/10",
  high: "border-alert bg-alert/10",
  medium: "border-muted",
};

const EmergencySection: React.FC = () => {
  const { lang, actionCards, checklistState, toggleCheckItem, searchQuery } = useApp();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [actionCards[0]?.id]: true });

  const filtered = actionCards.filter(c =>
    !searchQuery || t(c.title, lang).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Action Cards de Emergência" : "Emergency Action Cards"}
      </h2>
      {filtered.map(card => {
        const Icon = iconMap[card.icon] || Flame;
        const isOpen = expanded[card.id];
        const done = card.checklist.filter(i => checklistState[i.id]).length;
        const total = card.checklist.length;

        return (
          <Card key={card.id} className={`border-l-4 ${severityColors[card.severity] || ""}`}>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggle(card.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 sat-keep" />
                  <CardTitle className="text-base">{t(card.title, lang)}</CardTitle>
                  <span className="text-xs text-muted-foreground ml-2">{done}/{total}</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 sat-keep" /> : <ChevronDown className="h-4 w-4 sat-keep" />}
              </div>
              {/* Progress bar */}
              <div className="w-full h-1 bg-secondary rounded mt-2">
                <div
                  className="h-1 bg-ok rounded transition-all"
                  style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                />
              </div>
            </CardHeader>
            {isOpen && (
              <CardContent className="p-3 pt-0 space-y-2">
                {card.checklist.map(item => (
                  <label key={item.id} className="flex items-start gap-2 cursor-pointer py-1">
                    <Checkbox
                      checked={!!checklistState[item.id]}
                      onCheckedChange={() => toggleCheckItem(item.id)}
                      className="mt-0.5"
                    />
                    <span className={`text-sm ${checklistState[item.id] ? "line-through text-muted-foreground" : ""}`}>
                      {t(item.text, lang)}
                    </span>
                  </label>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default EmergencySection;
