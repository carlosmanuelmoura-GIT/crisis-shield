import jsPDF from "jspdf";

export interface ManualCard {
  id: string;
  code: string;
  title: string;
  category: string;
  goldenRule?: string;
}
export interface ManualStep {
  procedure_id: string;
  text: string;
  sort_order: number;
}
export interface ManualPhase {
  key: string;
  label: string;
  index: number;
  cards: ManualCard[];
}

const NAVY: [number, number, number] = [15, 23, 42];
const BLUE: [number, number, number] = [37, 99, 235];
const GREY: [number, number, number] = [100, 116, 139];
const AMBER_BG: [number, number, number] = [254, 249, 231];
const AMBER_BR: [number, number, number] = [234, 179, 8];
const AMBER_TX: [number, number, number] = [146, 100, 5];

const PHASE_COLOR: Record<string, [number, number, number]> = {
  preparacao: [59, 130, 246],
  gestao: [234, 179, 8],
  fim: [16, 185, 129],
};

export function generateCrisisManualPDF(opts: {
  phases: ManualPhase[];
  steps: ManualStep[];
  lang?: "pt" | "en";
}) {
  const { phases, steps } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentW = pageW - margin * 2;
  const GAP = 6;
  const CARD_W = (contentW - GAP) / 2;

  const stepsByCard = new Map<string, ManualStep[]>();
  steps.forEach((s) => {
    const arr = stepsByCard.get(s.procedure_id) ?? [];
    arr.push(s);
    stepsByCard.set(s.procedure_id, arr);
  });
  stepsByCard.forEach((arr) => arr.sort((a, b) => a.sort_order - b.sort_order));

  const year = new Date().getFullYear();
  const ref = `MAN_GCN_CRISE_${year}_V1`;
  const revision = new Date()
    .toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase();

  const drawDocHeader = () => {
    let y = margin;
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

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text("REF:", pageW - margin - 55, y + 3.5);
    doc.setFont("courier", "bold");
    doc.setTextColor(...NAVY);
    doc.text(ref, pageW - margin, y + 3.5, { align: "right" });

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

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text("MANUAL DE GESTÃO DE CRISE — ACTION CARDS", margin, y);

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

  const measureCard = (card: ManualCard): number => {
    const inner = CARD_W - 10;
    let h = 2.5;
    h += 8; // id / actions count row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    h += doc.splitTextToSize((card.title || "").toUpperCase(), inner).length * 5;
    if (card.category) {
      doc.setFontSize(7.5);
      h += doc.splitTextToSize(`CATEGORIA: ${card.category.toUpperCase()}`, inner).length * 3.6 + 1;
    }
    h += 3;
    const gr = (card.goldenRule || "").trim();
    if (gr) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      h += doc.splitTextToSize(`REGRA DE OURO: ${gr}`, inner - 6).length * 3.4 + 5;
    }
    h += 6;
    const cardSteps = stepsByCard.get(card.id) ?? [];
    if (cardSteps.length === 0) {
      h += 5;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      cardSteps.forEach((s) => {
        const lines = doc.splitTextToSize(s.text || "", inner - 9);
        h += Math.max(lines.length * 3.6, 5) + 1.6;
      });
    }
    h += 8;
    return h;
  };

  const drawCard = (card: ManualCard, phaseKey: string, x: number, y: number, h: number) => {
    const accent = PHASE_COLOR[phaseKey] ?? BLUE;
    const inner = CARD_W - 10;
    const cardSteps = stepsByCard.get(card.id) ?? [];

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, CARD_W, h, 1.5, 1.5, "FD");
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(x + 0.5, y + 0.4, CARD_W - 1, 1.6, "F");

    let cy = y + 7;

    // ID chip
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    const idTxt = `ID: ${card.code}`;
    const idW = doc.getTextWidth(idTxt) + 4;
    doc.roundedRect(x + 5, cy - 3.6, idW, 5, 1, 1, "FD");
    doc.setTextColor(...NAVY);
    doc.text(idTxt, x + 7, cy);

    // Actions count badge (right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    const cntTxt = `${cardSteps.length} ${cardSteps.length === 1 ? "AÇÃO" : "AÇÕES"}`;
    const cntW = doc.getTextWidth(cntTxt) + 5;
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(x + CARD_W - 5 - cntW, cy - 3.6, cntW, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(cntTxt, x + CARD_W - 5 - cntW / 2, cy, { align: "center" });

    cy += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    const titleLines = doc.splitTextToSize((card.title || "").toUpperCase(), inner);
    doc.text(titleLines, x + 5, cy);
    cy += titleLines.length * 5;

    if (card.category) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...BLUE);
      const cl = doc.splitTextToSize(`CATEGORIA: ${card.category.toUpperCase()}`, inner);
      doc.text(cl, x + 5, cy);
      cy += cl.length * 3.6 + 1;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(x + 5, cy, x + CARD_W - 5, cy);
    cy += 4;

    const gr = (card.goldenRule || "").trim();
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text("AÇÕES SEQUENCIAIS:", x + 5, cy + 3);
    cy += 6;

    if (cardSteps.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text("(Sem ações definidas)", x + 5, cy + 2);
      cy += 5;
    } else {
      cardSteps.forEach((s, idx) => {
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
        const lines = doc.splitTextToSize(s.text || "", inner - 9);
        doc.text(lines, x + 14, cy + 2.2);
        cy += Math.max(lines.length * 3.6, 5) + 1.6;
      });
    }

    const fy = y + h - 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 5, fy - 4, x + CARD_W - 5, fy - 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text("REGISTO:", x + CARD_W - 5 - doc.getTextWidth("LOG DA CRISE") - 2, fy, { align: "right" });
    doc.setTextColor(...NAVY);
    doc.text("LOG DA CRISE", x + CARD_W - 5, fy, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  phases.forEach((phase) => {
    if (phase.cards.length === 0) return;
    const accent = PHASE_COLOR[phase.key] ?? BLUE;

    ensureSpace(24);

    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, cursorY, contentW, 11, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const phaseTxt = `FASE 0${phase.index + 1}`;
    const pw = doc.getTextWidth(phaseTxt) + 6;
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(margin + 4, cursorY + 3, pw, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(phaseTxt, margin + 7, cursorY + 6.5);
    doc.setFontSize(11);
    doc.text(phase.label.toUpperCase(), margin + 8 + pw, cursorY + 7.5);

    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `${phase.cards.length} ACTION CARD${phase.cards.length === 1 ? "" : "S"}`,
      pageW - margin - 4,
      cursorY + 7,
      { align: "right" }
    );
    doc.setTextColor(0, 0, 0);
    cursorY += 15;

    for (let i = 0; i < phase.cards.length; i += 2) {
      const left = phase.cards[i];
      const right = phase.cards[i + 1];
      const hL = measureCard(left);
      const hR = right ? measureCard(right) : 0;
      const rowH = Math.max(hL, hR);
      ensureSpace(rowH + 4);
      drawCard(left, phase.key, margin, cursorY, rowH);
      if (right) drawCard(right, phase.key, margin + CARD_W + GAP, cursorY, rowH);
      cursorY += rowH + 5;
    }
    cursorY += 2;
  });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(p, total);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Manual_Gestao_Crise_${dateStr}.pdf`);
}
