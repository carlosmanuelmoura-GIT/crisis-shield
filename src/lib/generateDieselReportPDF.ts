import jsPDF from "jspdf";

export interface DieselBuilding {
  id: string;
  name: string;
  tier?: string | null;
  autonomia_horas_contingencia: number | null;
  combustivel_litros: number | null;
  num_geradores: number | null;
  num_ups: number | null;
  depositos: string | null;
  observacoes: string | null;
}

const BRAND_BLUE: [number, number, number] = [30, 64, 148];

export type TierKey = "tier1" | "tier2" | "tier3" | "tier4" | "na";

export const TIER_LABEL: Record<TierKey, string> = {
  tier1: "TIER 1 — CRÍTICO",
  tier2: "TIER 2 — INTERMÉDIO",
  tier3: "TIER 3 — AGÊNCIA & NUMERÁRIO",
  tier4: "TIER 4 — AGÊNCIAS",
  na: "POR VALIDAR",
};

const TIER_COLOR: Record<TierKey, [number, number, number]> = {
  tier1: [30, 64, 148],
  tier2: [217, 119, 6],
  tier3: [100, 116, 139],
  tier4: [220, 38, 38],
  na: [148, 163, 184],
};

/** Sugestão automática de tier a partir da autonomia/geradores. */
export function suggestTier(b: Pick<DieselBuilding, "num_geradores" | "autonomia_horas_contingencia">): TierKey {
  const gens = b.num_geradores ?? 0;
  const h = b.autonomia_horas_contingencia;
  if (gens <= 0) return "tier4";
  if (h == null) return "na";
  if (h >= 48) return "tier1";
  if (h >= 12) return "tier2";
  return "tier3";
}

/** Tier efetivo: valor gravado, com fallback para a sugestão automática. */
export function computeTier(b: DieselBuilding): TierKey {
  const t = b.tier;
  if (t && t in TIER_LABEL) return t as TierKey;
  return suggestTier(b);
}

const TIER_ORDER: TierKey[] = ["tier1", "tier2", "tier3", "tier4", "na"];


export function generateDieselReportPDF(buildings: DieselBuilding[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentW = pageW - margin * 2;

  const drawHeader = () => {
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("GESTÃO DE CONTINUIDADE DE NEGÓCIO", margin, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("RELATÓRIO DIESEL — AUTONOMIA ENERGÉTICA DOS EDIFÍCIOS", margin, 14);
    doc.setTextColor(0, 0, 0);
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Portal GCN · ${new Date().toLocaleDateString("pt-PT")}`, margin, pageH - 6);
    doc.text(`Página ${pageNum} / ${totalPages}`, pageW - margin, pageH - 6, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  let y = 26;
  drawHeader();

  const ensure = (needed: number) => {
    if (y + needed > pageH - 14) {
      doc.addPage();
      y = 26;
      drawHeader();
    }
  };

  // ── Resumo ──
  const totalFuel = buildings.reduce((s, b) => s + (b.combustivel_litros ?? 0), 0);
  const totalGens = buildings.reduce((s, b) => s + (b.num_geradores ?? 0), 0);
  const totalUps = buildings.reduce((s, b) => s + (b.num_ups ?? 0), 0);
  const core = buildings.reduce<DieselBuilding | null>(
    (best, b) => ((b.autonomia_horas_contingencia ?? -1) > (best?.autonomia_horas_contingencia ?? -1) ? b : best),
    null
  );
  const fragile = buildings.filter(b => computeTier(b) === "tier4").length;

  const cards: [string, string][] = [
    ["RESERVA TOTAL DIESEL", `${totalFuel.toLocaleString("pt-PT")} L`],
    ["NÓ CORE", core ? `${core.autonomia_horas_contingencia ?? 0}h — ${core.name}` : "—"],
    ["TIER 4 — AGÊNCIAS", `${fragile}`],

    ["EQUIPAMENTO", `${totalGens} geradores · ${totalUps} UPS`],
  ];
  const cw = (contentW - 9) / 4;
  cards.forEach(([label, value], i) => {
    const x = margin + i * (cw + 3);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, y, cw, 18, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(doc.splitTextToSize(label, cw - 6)[0] ?? "", x + 3, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND_BLUE);
    doc.text(doc.splitTextToSize(value, cw - 6)[0] ?? "", x + 3, y + 13);
    doc.setTextColor(0, 0, 0);
  });
  y += 26;

  // ── Tabela por Tier ──
  const COLS = [
    { key: "name", label: "EDIFÍCIO / INSTALAÇÃO", w: contentW * 0.3 },
    { key: "gen", label: "GERADORES & UPS", w: contentW * 0.15 },
    { key: "fuel", label: "COMBUSTÍVEL (L)", w: contentW * 0.13 },
    { key: "aut", label: "AUTONOMIA", w: contentW * 0.13 },
    { key: "obs", label: "OBSERVAÇÕES", w: contentW * 0.29 },
  ];

  const drawTableHead = () => {
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    let x = margin + 2;
    COLS.forEach(c => {
      doc.text(c.label, x, y + 4.7);
      x += c.w;
    });
    doc.setTextColor(0, 0, 0);
    y += 9;
  };

  TIER_ORDER.forEach(tier => {
    const rows = buildings.filter(b => computeTier(b) === tier);
    if (rows.length === 0) return;
    ensure(24);
    const col = TIER_COLOR[tier];
    doc.setFillColor(col[0], col[1], col[2]);
    doc.roundedRect(margin, y, contentW, 7, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`${TIER_LABEL[tier]}  (${rows.length})`, margin + 3, y + 4.8);
    doc.setTextColor(0, 0, 0);
    y += 10;
    drawTableHead();

    rows
      .slice()
      .sort((a, b) => (b.autonomia_horas_contingencia ?? 0) - (a.autonomia_horas_contingencia ?? 0))
      .forEach((b, idx) => {
        const obsLines = doc.splitTextToSize(b.observacoes || b.depositos || "—", COLS[4].w - 4);
        const rowH = Math.max(8, obsLines.length * 3.6 + 4);
        ensure(rowH + 2);
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y - 4, contentW, rowH, "F");
        }
        let x = margin + 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(doc.splitTextToSize(b.name, COLS[0].w - 4)[0] ?? "", x, y);
        x += COLS[0].w;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        doc.text(`${b.num_geradores ?? 0} ger. · ${b.num_ups ?? 0} UPS`, x, y);
        x += COLS[1].w;
        doc.text((b.combustivel_litros ?? 0).toLocaleString("pt-PT"), x, y);
        x += COLS[2].w;
        const h = b.autonomia_horas_contingencia;
        doc.text(h == null ? "—" : `${h}h (${(h / 24).toFixed(1)} d)`, x, y);
        x += COLS[3].w;
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(obsLines, x, y);
        doc.setTextColor(0, 0, 0);
        y += rowH;
      });
    y += 4;
  });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(i, total);
  }
  doc.save(`Relatorio_Diesel_${new Date().toISOString().slice(0, 10)}.pdf`);
}
