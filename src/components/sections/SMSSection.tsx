import React from "react";
import { useApp } from "@/contexts/AppContext";

const SMSSection: React.FC = () => {
  const { lang } = useApp();

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "SMS Express" : "Express SMS"}
      </h2>
      <div className="flex-1 min-h-0">
        <iframe
          src="https://smsexpress.cloud.meoempresas.pt/smsexpress/"
          className="w-full h-full min-h-[600px] rounded-md border border-border"
          title="SMS Express"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
};

export default SMSSection;
