import jsPDF from "jspdf";

export interface CrisisLogEntry {
  id: string;
  title?: string | null;
  text: string;
  author: string;
  created_at: string;
}

export interface CrisisLogInfo {
  title?: string | null;
  crisis_date?: string | null;
  crisis_type?: string | null;
  status?: string | null;
}

const BRAND_BLUE: [number, number, number] = [30, 64, 148];

const STATUS_LABELS: Record<string, { pt: string; en: string }> = {
  registada: { pt: "Registada", en: "Registered" },
  em_alerta: { pt: "Em Alerta", en: "Alert" },
  crise_em_curso: { pt: "Em Curso", en: "In Progress" },
  retorno: { pt: "Retorno", en: "Return" },
  fim: { pt: "Terminada", en: "Ended" },
};

// Helvetica has no emoji glyphs — strip them out.
const clean = (s: string) =>
  (s || "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const isSystemEntry = (e: CrisisLogEntry) =>
  !e.title && /^(\u{1F6A8}|\u2705|\u{1F4CB})/u.test(e.text);

export function generateCrisisLogPDF(opts: {
  crisis: CrisisLogInfo | null;
  entries: CrisisLogEntry[];
  lang: "pt" | "en";
}) {
  const { crisis, entries, lang } = opts;
  const pt = lang === "pt";
  const locale = pt ? "pt-PT" : "en-GB";

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentW = pageW - margin * 2;

  const crisisTitle = clean(crisis?.title || (pt ? "Crise" : "Crisis")) || (pt ? "Crise" : "Crisis");
  const typeLabel = crisis?.crisis_type === "simulated" ? (pt ? "SIMULADA" : "SIMULATED") : (pt ? "REAL" : "REAL");
  const statusLabel = crisis?.status ? (STATUS_LABELS[crisis.status]?.[lang] || crisis.status) : "—";
  const dateLabel = crisis?.crisis_date
    ? new Date(crisis.crisis_date).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const drawHeader = () => {
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(pt ? "LOG DAS AÇÕES DE GESTÃO DE CRISE" : "CRISIS MANAGEMENT ACTION LOG", margin, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `${crisisTitle.toUpperCase()} · ${typeLabel} · ${dateLabel} · ${statusLabel.toUpperCase()}`.slice(0, 120),
      margin,
      14,
    );
    doc.setTextColor(0, 0, 0);
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Portal GCN · ${new Date().toLocaleDateString(locale)}`, margin, pageH - 6);
    doc.text(
      `${pt ? "Página" : "Page"} ${pageNum} / ${totalPages}`,
      pageW - margin,
      pageH - 6,
      { align: "right" },
    );
    doc.setTextColor(0, 0, 0);
  };

  let cursorY = 26;
  drawHeader();

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > pageH - 14) {
      doc.addPage();
      cursorY = 26;
      drawHeader();
    }
  };

  const sorted = entries
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Summary line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${sorted.length} ${pt ? "ações registadas — ordem cronológica ascendente" : "logged actions — ascending chronological order"}`,
    margin,
    cursorY,
  );
  doc.setTextColor(0, 0, 0);
  cursorY += 6;

  // Table header
  const COL_N = margin + 2;
  const COL_DATE = margin + 12;
  const COL_TEXT = margin + 42;
  const TEXT_W = contentW - 42 + margin - margin - 2;

  const drawTableHead = () => {
    doc.setFillColor(238, 242, 249);
    doc.rect(margin, cursorY, contentW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("#", COL_N, cursorY + 4.8);
    doc.text(pt ? "DATA / HORA" : "DATE / TIME", COL_DATE, cursorY + 4.8);
    doc.text(pt ? "AÇÃO" : "ACTION", COL_TEXT, cursorY + 4.8);
    doc.setTextColor(0, 0, 0);
    cursorY += 9;
  };

  drawTableHead();

  if (sorted.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(pt ? "Sem ações registadas." : "No actions logged.", margin + 2, cursorY + 2);
    doc.setTextColor(0, 0, 0);
  }

  sorted.forEach((e, idx) => {
    const d = new Date(e.created_at);
    const dateStr = d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "2-digit" });
    const timeStr = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    const system = isSystemEntry(e);
    const title = clean(e.title || "");
    const body = clean(e.text);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const bodyLines = doc.splitTextToSize(body, TEXT_W);
    const blockH = (title ? 4.5 : 0) + bodyLines.length * 4 + (system ? 0 : 4.5) + 4;

    ensureSpace(blockH + 2);

    if (system) {
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, cursorY - 3.5, contentW, blockH, "F");
    }

    // Index
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_BLUE);
    doc.text(String(idx + 1), COL_N, cursorY);
    // Date
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    doc.text(dateStr, COL_DATE, cursorY);
    doc.text(timeStr, COL_DATE, cursorY + 4);

    let ty = cursorY;
    if (title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(doc.splitTextToSize(title, TEXT_W)[0] ?? "", COL_TEXT, ty);
      ty += 4.5;
    }
    doc.setFont("helvetica", system ? "italic" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(bodyLines, COL_TEXT, ty);
    ty += bodyLines.length * 4;

    if (!system) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(`${pt ? "Autor" : "Author"}: ${clean(e.author) || "—"}`, COL_TEXT, ty + 3);
      ty += 4.5;
    }

    doc.setTextColor(0, 0, 0);
    cursorY = ty + 4;
    doc.setDrawColor(228, 230, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY - 2, pageW - margin, cursorY - 2);
  });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(i, total);
  }

  const slug = crisisTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "crise";
  const fileDate = crisis?.crisis_date
    ? new Date(crisis.crisis_date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  doc.save(`log-crise-${slug}-${fileDate}.pdf`);
}
