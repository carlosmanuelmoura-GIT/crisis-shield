import jsPDF from "jspdf";
import { APP_OVERVIEW, APP_OVERVIEW_INTRO, APP_OVERVIEW_TITLE } from "./appOverviewContent";

const BRAND_BLUE: [number, number, number] = [30, 64, 148];

export function generateAppOverviewPDF(lang: "pt" | "en" = "pt") {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  const drawHeader = () => {
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("PORTAL GCN", margin, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      lang === "pt" ? "MANUAL FUNCIONAL DA APLICAÇÃO" : "APPLICATION FUNCTIONAL MANUAL",
      margin,
      14
    );
    doc.setTextColor(0, 0, 0);
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const dateStr = new Date().toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB");
    doc.text(`Portal GCN · ${dateStr}`, margin, pageH - 6);
    doc.text(
      `${lang === "pt" ? "Página" : "Page"} ${pageNum} / ${totalPages}`,
      pageW - margin,
      pageH - 6,
      { align: "right" }
    );
    doc.setTextColor(0, 0, 0);
  };

  drawHeader();
  let y = 26;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 14) {
      doc.addPage();
      drawHeader();
      y = 26;
    }
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BRAND_BLUE);
  const titleLines = doc.splitTextToSize(APP_OVERVIEW_TITLE[lang], contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 2;
  doc.setTextColor(0, 0, 0);

  // Intro
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  const introLines = doc.splitTextToSize(APP_OVERVIEW_INTRO[lang], contentW);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.4 + 5;
  doc.setTextColor(0, 0, 0);

  APP_OVERVIEW.forEach((section) => {
    ensureSpace(16);
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(section.title[lang], margin + 3, y + 5.5);
    doc.setTextColor(0, 0, 0);
    y += 12;

    section.items.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      const nameLines = doc.splitTextToSize(`• ${item.name[lang]}`, contentW - 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(item.desc[lang], contentW - 8);
      const blockH = nameLines.length * 4.6 + descLines.length * 4.2 + 4;
      ensureSpace(blockH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...BRAND_BLUE);
      doc.text(nameLines, margin + 2, y);
      y += nameLines.length * 4.6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text(descLines, margin + 6, y);
      y += descLines.length * 4.2 + 4;
      doc.setTextColor(0, 0, 0);
    });

    y += 2;
  });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(p, total);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Portal_GCN_Manual_Funcional_${dateStr}.pdf`);
}
