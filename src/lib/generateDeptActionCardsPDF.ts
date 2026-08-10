import jsPDF from "jspdf";

interface Card {
  id: string;
  title_pt: string;
  title_en: string;
  severity: string;
  cenario_id?: string | null;
  recurso_id?: string | null;
  dr_type_id?: string | null;
  macro_processo?: string | null;
  golden_rule?: string | null;
  activation_authority?: string | null;
  strategic_pause?: boolean | null;
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
interface DRType {
  id: string;
  code: string;
  label: string;
  rto: number;
  rpo: number;
}

const SEV_COLOR: Record<string, [number, number, number]> = {
  critical: [220, 38, 38],
  high: [234, 88, 12],
  medium: [202, 138, 4],
  low: [22, 163, 74],
};
const SEV_LABEL: Record<string, string> = {
  critical: "CRÍTICO",
  high: "ALTO",
  medium: "MÉDIO",
  low: "BAIXO",
};
const NAVY: [number, number, number] = [15, 23, 42];      // slate-900
const BLUE: [number, number, number] = [37, 99, 235];     // blue-600
const GREY: [number, number, number] = [100, 116, 139];   // slate-500
const AMBER_BG: [number, number, number] = [254, 249, 231];
const AMBER_BR: [number, number, number] = [234, 179, 8];
const AMBER_TX: [number, number, number] = [146, 100, 5];

export function generateDeptActionCardsPDF(opts: {
  departmentName: string;
  departmentCode?: string;
  cards: Card[];
  items: Item[];
  cenarios: Cenario[];
  recursos: Recurso[];
  drTypes?: DRType[];
}) {
  const { departmentName, departmentCode, cards, items, cenarios, recursos, drTypes = [] } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();   // 297
  const pageH = doc.internal.pageSize.getHeight();  // 210
  const margin = 12;
  const contentW = pageW - margin * 2;
  const GAP = 6;
  const CARD_W = (contentW - GAP) / 2;

  const cenMap = new Map(cenarios.map(c => [c.id, c]));
  const recMap = new Map(recursos.map(r => [r.id, r.name_pt]));
  const drMap = new Map(drTypes.map(d => [d.id, d]));

  const itemsByCard = new Map<string, Item[]>();
  items.forEach(i => {
    const arr = itemsByCard.get(i.action_card_id) ?? [];
    arr.push(i);
    itemsByCard.set(i.action_card_id, arr);
  });
  itemsByCard.forEach(arr => arr.sort((a, b) => a.sort_order - b.sort_order));

  const deptCode = (departmentCode || departmentName.slice(0, 3)).toUpperCase();
  const year = new Date().getFullYear();
  const ref = `MAN_GCN_${deptCode.replace(/[^A-Z0-9]/g, "")}_${year}_V1`;
  const revision = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();

  const drawDocHeader = () => {
    let y = margin;
    // Badge EUROSISTEMA / GCN
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const badgeTxt = "EUROSISTEMA / GCN";
    const bw = doc.getTextWidth(badgeTxt) + 6;
    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, y, bw, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(badgeTxt, margin + 3, y + 3.5);
    doc.setTextColor(...GREY);
    doc.setFontSize(7.5);
    doc.text("PLANO DE CONTINUIDADE DE NEGÓCIO", margin + bw + 4, y + 3.5);

    // Right meta block
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text("REF:", pageW - margin - 55, y + 3.5);
    doc.setFont("courier", "bold");
    doc.setTextColor(...NAVY);
    doc.text(ref, pageW - margin, y + 3.5, { align: "right" });

    // Title
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...NAVY);
    doc.text("GESTÃO DE CONTINUIDADE DE NEGÓCIO", margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text("CLASSIFICAÇÃO:", pageW - margin - 30, y - 4);
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(pageW - margin - 22, y - 7.5, 22, 5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text("RESERVADO", pageW - margin - 11, y - 4, { align: "center" });

    // Subtitle
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text(`MANUAL DE AÇÕES IMEDIATAS — ${departmentName.toUpperCase()}`, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text(`ÚLTIMA REVISÃO: ${revision}`, pageW - margin, y, { align: "right" });

    doc.setTextColor(0, 0, 0);
    return y + 6;
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 10, pageW - margin, pageH - 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text("GCN // DOCUMENTO DE OPERAÇÃO DE EMERGÊNCIA", margin, pageH - 6);
    doc.text(`PÁGINA ${pageNum} DE ${totalPages}`, pageW - margin, pageH - 6, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  let cursorY = drawDocHeader();

  const newPage = () => {
    doc.addPage();
    cursorY = drawDocHeader();
  };

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageH - 14) newPage();
  };

  const cardMeta = (card: Card) => {
    const dr = card.dr_type_id ? drMap.get(card.dr_type_id) : null;
    const rto = dr ? `${dr.rto}h` : "—";
    const rec = card.recurso_id ? recMap.get(card.recurso_id) : null;
    const shortId = `AC_${deptCode}_${card.id.slice(0, 4).toUpperCase()}`;
    return { dr, rto, rec, shortId };
  };

  const measureCard = (card: Card): number => {
    const { rec } = cardMeta(card);
    const inner = CARD_W - 10;
    let h = 2.5; // top severity bar
    h += 8;      // id / rto / severity row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    h += doc.splitTextToSize((card.title_pt || "").toUpperCase(), inner).length * 5;
    if (rec || card.macro_processo) {
      doc.setFontSize(7.5);
      h += doc.splitTextToSize(`PROCESSO: ${(card.macro_processo || rec || "").toUpperCase()}`, inner).length * 3.6 + 1;
    }
    h += 3; // divider
    const gr = (card.golden_rule || "").trim();
    if (gr) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const lines = doc.splitTextToSize(`REGRA DE OURO: ${gr}`, inner - 6);
      h += lines.length * 3.4 + 5;
    }
    h += 6; // "AÇÕES SEQUENCIAIS" label
    const cardItems = itemsByCard.get(card.id) ?? [];
    if (cardItems.length === 0) {
      h += 5;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      cardItems.forEach(it => {
        const lines = doc.splitTextToSize(it.text_pt || "", inner - 9);
        h += Math.max(lines.length * 3.6, 5) + 1.6;
      });
    }
    h += 8; // footer authority
    return h;
  };

  const drawCard = (card: Card, x: number, y: number, h: number) => {
    const sev = SEV_COLOR[card.severity] ?? [100, 100, 100];
    const { rto, rec, shortId } = cardMeta(card);
    const inner = CARD_W - 10;
    const cardItems = itemsByCard.get(card.id) ?? [];

    // Frame
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, CARD_W, h, 1.5, 1.5, "FD");
    // Severity top bar
    doc.setFillColor(sev[0], sev[1], sev[2]);
    doc.rect(x + 0.5, y + 0.4, CARD_W - 1, 1.6, "F");

    let cy = y + 7;

    // ID chip
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    const idTxt = `ID: ${shortId}`;
    const idW = doc.getTextWidth(idTxt) + 4;
    doc.roundedRect(x + 5, cy - 3.6, idW, 5, 1, 1, "FD");
    doc.setTextColor(...NAVY);
    doc.text(idTxt, x + 7, cy);

    // Severity badge (right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    const sevTxt = SEV_LABEL[card.severity] ?? card.severity.toUpperCase();
    const sevW = doc.getTextWidth(sevTxt) + 5;
    doc.setFillColor(sev[0], sev[1], sev[2]);
    doc.roundedRect(x + CARD_W - 5 - sevW, cy - 3.6, sevW, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(sevTxt, x + CARD_W - 5 - sevW / 2, cy, { align: "center" });

    // RTO
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text(`RTO: ${rto}`, x + CARD_W - 5 - sevW - 3, cy, { align: "right" });

    // Strategic pause chip
    if (card.strategic_pause) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      const pTxt = "PAUSA ESTRATÉGICA";
      const pW = doc.getTextWidth(pTxt) + 4;
      doc.setFillColor(...AMBER_BR);
      doc.roundedRect(x + 5 + idW + 2, cy - 3.6, pW, 5, 1, 1, "F");
      doc.setTextColor(...NAVY);
      doc.text(pTxt, x + 5 + idW + 4, cy);
    }

    cy += 6;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    const titleLines = doc.splitTextToSize((card.title_pt || "").toUpperCase(), inner);
    doc.text(titleLines, x + 5, cy);
    cy += titleLines.length * 5;

    // Process line
    if (rec || card.macro_processo) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...BLUE);
      const pl = doc.splitTextToSize(`PROCESSO: ${(card.macro_processo || rec || "").toUpperCase()}`, inner);
      doc.text(pl, x + 5, cy);
      cy += pl.length * 3.6 + 1;
    }

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 5, cy, x + CARD_W - 5, cy);
    cy += 4;

    // Golden rule box
    const gr = (card.golden_rule || "").trim();
    if (gr) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const lines = doc.splitTextToSize(`REGRA DE OURO: ${gr}`, inner - 6);
      const boxH = lines.length * 3.4 + 4;
      doc.setFillColor(...AMBER_BG);
      doc.setDrawColor(...AMBER_BR);
      doc.roundedRect(x + 5, cy - 2, inner, boxH, 1, 1, "FD");
      doc.setTextColor(...AMBER_TX);
      doc.text(lines, x + 8, cy + 1.4);
      cy += boxH + 1;
    }

    // Actions label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text("AÇÕES SEQUENCIAIS DE SOBREVIVÊNCIA:", x + 5, cy + 3);
    cy += 6;

    if (cardItems.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text("(Sem ações definidas)", x + 5, cy + 2);
      cy += 5;
    } else {
      cardItems.forEach((it, idx) => {
        const num = String(idx + 1).padStart(2, "0");
        doc.setFillColor(...NAVY);
        doc.roundedRect(x + 5, cy - 1, 6, 4.8, 0.8, 0.8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text(num, x + 8, cy + 2.3, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(it.text_pt || "", inner - 9);
        doc.text(lines, x + 14, cy + 2.2);
        cy += Math.max(lines.length * 3.6, 5) + 1.6;
      });
    }

    // Card footer
    const fy = y + h - 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 5, fy - 4, x + CARD_W - 5, fy - 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text("AUTORIDADE:", x + 5, fy);
    doc.setTextColor(...NAVY);
    doc.text((card.activation_authority || "—").toUpperCase(), x + 5 + doc.getTextWidth("AUTORIDADE:") + 2, fy);
    doc.setTextColor(...GREY);
    doc.setTextColor(...GREY);
    doc.text("REGISTO:", x + CARD_W - 5 - doc.getTextWidth("LOG DA CRISE") - 2, fy, { align: "right" });
    doc.setTextColor(...NAVY);
    doc.text("LOG DA CRISE", x + CARD_W - 5, fy, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  // Group cards by scenario
  const groups = new Map<string, Card[]>();
  cards.forEach(c => {
    const k = c.cenario_id || "__none__";
    const arr = groups.get(k) ?? [];
    arr.push(c);
    groups.set(k, arr);
  });
  const orderedKeys = Array.from(groups.keys()).sort((a, b) => {
    const ra = cenMap.get(a)?.roman ?? "ZZ";
    const rb = cenMap.get(b)?.roman ?? "ZZ";
    return ra.localeCompare(rb);
  });

  orderedKeys.forEach(key => {
    const cen = cenMap.get(key);
    const groupCards = groups.get(key) ?? [];

    ensureSpace(24);

    // Scenario bar
    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, cursorY, contentW, 11, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const romanTxt = cen ? `CENÁRIO ${cen.roman}` : "SEM CENÁRIO";
    const rw = doc.getTextWidth(romanTxt) + 6;
    doc.setFillColor(...BLUE);
    doc.roundedRect(margin + 4, cursorY + 3, rw, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(romanTxt, margin + 7, cursorY + 6.5);
    doc.setFontSize(11);
    doc.text((cen ? cen.name_pt : "Sem cenário atribuído").toUpperCase(), margin + 8 + rw, cursorY + 7.5);

    // Failure types on right
    const failTypes = Array.from(new Set(groupCards.map(c => (c.recurso_id ? recMap.get(c.recurso_id) : null)).filter(Boolean))) as string[];
    if (failTypes.length) {
      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225);
      const txt = failTypes.join("  /  ").toUpperCase();
      doc.text(doc.splitTextToSize(txt, contentW / 2)[0], pageW - margin - 4, cursorY + 7, { align: "right" });
    }
    doc.setTextColor(0, 0, 0);
    cursorY += 14;

    if (cen?.description_pt) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      const dl = doc.splitTextToSize(cen.description_pt, contentW);
      doc.text(dl, margin, cursorY);
      cursorY += dl.length * 3.2 + 3;
      doc.setTextColor(0, 0, 0);
    }

    for (let i = 0; i < groupCards.length; i += 2) {
      const left = groupCards[i];
      const right = groupCards[i + 1];
      const hL = measureCard(left);
      const hR = right ? measureCard(right) : 0;
      const rowH = Math.max(hL, hR);
      ensureSpace(rowH + 4);
      drawCard(left, margin, cursorY, rowH);
      if (right) drawCard(right, margin + CARD_W + GAP, cursorY, rowH);
      cursorY += rowH + 5;
    }
    cursorY += 2;
  });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(p, total);
  }

  const safeDept = (departmentName || "departamento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`ActionCards_${safeDept}_${dateStr}.pdf`);
}
