import jsPDF from "jspdf";

interface Card {
  id: string;
  title_pt: string;
  title_en: string;
  severity: string;
  cenario_id?: string | null;
  recurso_id?: string | null;
  macro_processo?: string | null;
}
interface Item {
  id: string;
  action_card_id: string;
  text_pt: string;
  text_en: string;
  sort_order: number;
}
interface Cenario {
  id: string;
  roman: string;
  name_pt: string;
  description_pt: string;
  color: string;
}
interface Recurso {
  id: string;
  name_pt: string;
}

const SEV_COLOR: Record<string, [number, number, number]> = {
  critical: [220, 38, 38],   // red-600
  high: [234, 88, 12],       // orange-600
  medium: [202, 138, 4],     // amber-600
  low: [22, 163, 74],        // green-600
};
const SEV_LABEL: Record<string, string> = {
  critical: "CRÍTICO",
  high: "ALTO",
  medium: "MÉDIO",
  low: "BAIXO",
};
const BRAND_BLUE: [number, number, number] = [30, 64, 148];

export function generateDeptActionCardsPDF(opts: {
  departmentName: string;
  cards: Card[];
  items: Item[];
  cenarios: Cenario[];
  recursos: Recurso[];
}) {
  const { departmentName, cards, items, cenarios, recursos } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentW = pageW - margin * 2;

  const cenMap = new Map(cenarios.map(c => [c.id, c]));
  const recMap = new Map(recursos.map(r => [r.id, r.name_pt]));
  const itemsByCard = new Map<string, Item[]>();
  items.forEach(i => {
    const arr = itemsByCard.get(i.action_card_id) ?? [];
    arr.push(i);
    itemsByCard.set(i.action_card_id, arr);
  });
  itemsByCard.forEach(arr => arr.sort((a, b) => a.sort_order - b.sort_order));

  const drawHeader = () => {
    // Brand strip
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("GESTÃO DE CONTINUIDADE DE NEGÓCIO", margin, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`MANUAL DE AÇÕES IMEDIATAS — ${departmentName.toUpperCase()}`, margin, 14);
    doc.setTextColor(0, 0, 0);
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const dateStr = new Date().toLocaleDateString("pt-PT");
    doc.text(`Portal GCN · ${dateStr}`, margin, pageH - 6);
    doc.text(`Página ${pageNum} / ${totalPages}`, pageW - margin, pageH - 6, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  let cursorY = 24;
  drawHeader();

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageH - 14) {
      doc.addPage();
      cursorY = 24;
      drawHeader();
    }
  };

  // Group by cenario
  const groups = new Map<string, Card[]>();
  cards.forEach(c => {
    const k = c.cenario_id || "__none__";
    const arr = groups.get(k) ?? [];
    arr.push(c);
    groups.set(k, arr);
  });

  // Sort groups by roman
  const orderedKeys = Array.from(groups.keys()).sort((a, b) => {
    const ra = cenMap.get(a)?.roman ?? "ZZ";
    const rb = cenMap.get(b)?.roman ?? "ZZ";
    return ra.localeCompare(rb);
  });

  const CARD_W = (contentW - 6) / 2; // 2 columns
  const drawCard = (card: Card, x: number, y: number): number => {
    const sev = SEV_COLOR[card.severity] ?? [100, 100, 100];
    const cen = card.cenario_id ? cenMap.get(card.cenario_id) : null;
    const recName = card.recurso_id ? recMap.get(card.recurso_id) : null;
    const cardItems = itemsByCard.get(card.id) ?? [];

    // Header
    const headerH = 12;
    doc.setFillColor(sev[0], sev[1], sev[2]);
    doc.roundedRect(x, y, CARD_W, headerH, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const title = (card.title_pt || "").toUpperCase();
    const titleLines = doc.splitTextToSize(title, CARD_W - 30);
    doc.text(titleLines[0] ?? "", x + 3, y + 5);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(SEV_LABEL[card.severity] ?? card.severity.toUpperCase(), x + CARD_W - 3, y + 5, { align: "right" });
    if (titleLines.length > 1) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(titleLines[1], x + 3, y + 10);
    } else {
      // Meta line in header
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      const meta = [cen?.roman && `Cenário ${cen.roman}`, recName, card.macro_processo].filter(Boolean).join(" · ");
      doc.text(doc.splitTextToSize(meta, CARD_W - 6)[0] ?? "", x + 3, y + 10);
    }
    doc.setTextColor(0, 0, 0);

    // Body
    let by = y + headerH + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (cardItems.length === 0) {
      doc.setTextColor(120, 120, 120);
      doc.text("(Sem ações definidas)", x + 3, by);
      doc.setTextColor(0, 0, 0);
      by += 5;
    } else {
      cardItems.forEach((it, idx) => {
        const prefix = `${idx + 1}.º `;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BRAND_BLUE);
        doc.text(prefix, x + 3, by);
        const prefixW = doc.getTextWidth(prefix);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(it.text_pt || "", CARD_W - 6 - prefixW);
        doc.text(lines, x + 3 + prefixW, by);
        by += lines.length * 4 + 1;
      });
      doc.setTextColor(0, 0, 0);
    }

    const totalH = (by - y) + 2;
    // Border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, CARD_W, totalH, 2, 2, "S");
    return totalH;
  };

  const measureCardHeight = (card: Card): number => {
    const cardItems = itemsByCard.get(card.id) ?? [];
    const headerH = 12;
    let h = headerH + 4;
    doc.setFontSize(9);
    if (cardItems.length === 0) {
      h += 5;
    } else {
      cardItems.forEach((it, idx) => {
        const prefix = `${idx + 1}.º `;
        doc.setFont("helvetica", "bold");
        const prefixW = doc.getTextWidth(prefix);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(it.text_pt || "", CARD_W - 6 - prefixW);
        h += lines.length * 4 + 1;
      });
    }
    return h + 2;
  };

  orderedKeys.forEach(key => {
    const cen = cenMap.get(key);
    const groupCards = groups.get(key) ?? [];

    ensureSpace(14);
    // Scenario title bar
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(margin, cursorY, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const scenarioTitle = cen
      ? `CENÁRIO ${cen.roman} — ${cen.name_pt.toUpperCase()}`
      : "SEM CENÁRIO ATRIBUÍDO";
    doc.text(scenarioTitle, margin + 3, cursorY + 5.5);
    doc.setTextColor(0, 0, 0);
    cursorY += 11;

    if (cen?.description_pt) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      const dl = doc.splitTextToSize(cen.description_pt, contentW);
      doc.text(dl, margin, cursorY);
      cursorY += dl.length * 3.5 + 2;
      doc.setTextColor(0, 0, 0);
    }

    // Render cards in 2 columns
    for (let i = 0; i < groupCards.length; i += 2) {
      const left = groupCards[i];
      const right = groupCards[i + 1];
      const hL = measureCardHeight(left);
      const hR = right ? measureCardHeight(right) : 0;
      const rowH = Math.max(hL, hR);
      ensureSpace(rowH + 4);
      drawCard(left, margin, cursorY);
      if (right) drawCard(right, margin + CARD_W + 6, cursorY);
      cursorY += rowH + 4;
    }
    cursorY += 2;
  });

  // Footers
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(p, total);
  }

  const url = doc.output("bloburl");
  window.open(url, "_blank", "noopener,noreferrer");
}
