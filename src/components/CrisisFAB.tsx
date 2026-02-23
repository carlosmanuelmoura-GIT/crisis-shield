import React from "react";
import { useApp, t } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const CrisisFAB: React.FC = () => {
  const { lang, crisisActive, declareCrisis } = useApp();

  if (crisisActive) return null;

  return (
    <Button
      onClick={declareCrisis}
      className="fixed bottom-6 right-6 z-50 h-14 px-5 rounded-full bg-crisis text-crisis-foreground shadow-lg hover:bg-crisis/90 text-sm font-bold uppercase tracking-wide"
    >
      <AlertTriangle className="h-5 w-5 mr-2 sat-keep" />
      {lang === "pt" ? "DECLARAR CRISE" : "DECLARE CRISIS"}
    </Button>
  );
};

export default CrisisFAB;
