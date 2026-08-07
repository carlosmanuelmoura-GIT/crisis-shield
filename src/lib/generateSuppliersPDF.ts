import jsPDF from "jspdf";

export interface SupplierPDFRow {
  id: string;
  name: string;
  contract_name: string;
  subcontractors: string;
  critical_area: string;
  supplier_type: string | null;
  service_type: string | null;
  dr_label: string;
  rto_compliant: boolean | null;
  essentiality: string;
  alternatives: string;
  substitution_time: string;
  exit_strategy: string;
  last_gcn_test: string | null;
  department: string;
  funcoes: string[];
  notes: string;
}

export interface SuppliersPDFInput {
  lang: "pt" | "en";
  rows: SupplierPDFRow[];
  kpis: { total: number; lockIn: number; mismatch: number; gcn: number };
}

const BRAND_BLUE: [number, number, number] = [30, 64, 148];

const ESS: Record<string, { pt: string; en: string }> = {
  low: { pt: "Baixa", en: "Low" },
  medium: { pt: "Média", en: "Medium" },
  high: { pt: "Alta", en: "High" },
};
const ALT: Record<string, { pt: string; en: string }> = {
  multiple: { pt: "Múltiplas", en: "Multiple" },
  limited: { pt: "Limitadas", en: "Limited" },
  none: { pt: "Sem alternativas", en: "None" },
};
const SUB: Record<string, { pt: string; en: string }> = {
  low: { pt: "< 6 meses", en: "< 6 months" },
  medium: { pt: "6 - 18 meses", en: "6 - 18 months" },
  high: { pt: "> 18 meses", en: "> 18 months" },
};
const SVC: Record<string, { pt: string; en: string }> = {
  core: { pt: "CORE", en: "CORE" },
  especifico: { pt: "ESPECÍFICO", en: "SPECIFIC" },
};
const EXIT: Record<string, { pt: string; en: string }> = {
  validado: { pt: "Validado", en: "Validated" },
  nao_testado: { pt: "Não testado", en: "Not tested" },
  nao_existente: { pt: "Não existente", en: "Not defined" },
};

export function generateSuppliersPDF({ lang, rows, kpis }: SuppliersPDFInput) {
  const L = (o: { pt: string; en: string }) => (lang === "pt" ? o.pt : o.en);
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
    doc.text("PORTAL GCN", margin, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      L({ pt: "ANÁLISE DE FORNECEDORES CRÍTICOS", en: "CRITICAL SUPPLIER ANALYSIS" }).toUpperCase(),
      margin,
      14
    );
    doc.setTextColor(0, 0, 0);
  };

  const drawFooter = (page: number, total: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Portal GCN · ${new Date().toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB")}`, margin, pageH - 6);
    doc.text(`${L({ pt: "Página", en: "Page" })} ${page} / ${total}`, pageW - margin, pageH - 6, { align: "right" });
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

  const sectionTitle = (text: string, color: [number, number, number] = BRAND_BLUE) => {
    ensure(16);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, y, contentW, 7, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(text.toUpperCase(), margin + 3, y + 4.8);
    doc.setTextColor(0, 0, 0);
    y += 11;
  };

  /* ── KPIs ── */
  const cards: [string, string][] = [
    [L({ pt: "TOTAL DE FORNECEDORES", en: "TOTAL SUPPLIERS" }), `${kpis.total}`],
    [L({ pt: "VULNERABILIDADE / LOCK-IN", en: "VULNERABILITY / LOCK-IN" }), `${kpis.lockIn}`],
    [L({ pt: "RTO NÃO CONFORME", en: "RTO NON-COMPLIANT" }), `${kpis.mismatch}`],
    [L({ pt: "GCN PENDENTE / EXPIRADO", en: "BCM TEST PENDING / EXPIRED" }), `${kpis.gcn}`],
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
    doc.setFontSize(11);
    doc.setTextColor(...BRAND_BLUE);
    doc.text(value, x + 3, y + 13);
    doc.setTextColor(0, 0, 0);
  });
  y += 26;

  /* ── 1. Matriz de Concentração ── */
  sectionTitle(L({ pt: "Matriz de Concentração e Dependência", en: "Concentration & Dependency Matrix" }));

  const quad = (essHigh: boolean, subHigh: boolean) =>
    rows.filter((r) => (r.essentiality === "high") === essHigh && (r.substitution_time === "high") === subHigh);

  const quadrants: { title: { pt: string; en: string }; essHigh: boolean; subHigh: boolean; critical: boolean }[] = [
    { title: { pt: "Vulnerabilidade Extrema / Lock-in", en: "Extreme vulnerability / Lock-in" }, essHigh: true, subHigh: true, critical: true },
    { title: { pt: "Substituição lenta, essencialidade baixa/média", en: "Slow substitution, low/medium essentiality" }, essHigh: false, subHigh: true, critical: false },
    { title: { pt: "Essencial mas substituível", en: "Essential but replaceable" }, essHigh: true, subHigh: false, critical: false },
    { title: { pt: "Risco controlado", en: "Controlled risk" }, essHigh: false, subHigh: false, critical: false },
  ];

  const MCOLS = [contentW * 0.34, contentW * 0.16, contentW * 0.1, contentW * 0.4];
  const mHead = [
    L({ pt: "QUADRANTE", en: "QUADRANT" }),
    L({ pt: "ESSENCIALIDADE", en: "ESSENTIALITY" }),
    L({ pt: "Nº", en: "COUNT" }),
    L({ pt: "FORNECEDORES", en: "SUPPLIERS" }),
  ];
  const drawMatrixHead = () => {
    ensure(12);
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    let x = margin + 2;
    mHead.forEach((h, i) => {
      doc.text(h, x, y + 4.7);
      x += MCOLS[i];
    });
    doc.setTextColor(0, 0, 0);
    y += 9;
  };
  drawMatrixHead();

  quadrants.forEach((q) => {
    const items = quad(q.essHigh, q.subHigh);
    const names = items.map((s) => s.name).join(", ") || "—";
    const nameLines = doc.splitTextToSize(names, MCOLS[3] - 4);
    const titleLines = doc.splitTextToSize(L(q.title), MCOLS[0] - 4);
    const rowH = Math.max(9, Math.max(nameLines.length, titleLines.length) * 3.8 + 4);
    ensure(rowH + 2);
    if (q.critical) {
      doc.setFillColor(254, 226, 226);
      doc.rect(margin, y - 4, contentW, rowH, "F");
    }
    let x = margin + 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    if (q.critical) doc.setTextColor(185, 28, 28);
    else doc.setTextColor(15, 23, 42);
    doc.text(titleLines, x, y);
    x += MCOLS[0];
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(
      `${q.essHigh ? L({ pt: "Alta", en: "High" }) : L({ pt: "Baixa/Média", en: "Low/Medium" })} · ${
        q.subHigh ? "> 18m" : "< 18m"
      }`,
      x,
      y
    );
    x += MCOLS[1];
    doc.setFont("helvetica", "bold");
    doc.text(`${items.length}`, x, y);
    x += MCOLS[2];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(nameLines, x, y);
    doc.setTextColor(0, 0, 0);
    y += rowH;
  });
  y += 6;

  /* ── 2. Lista de Fornecedores ── */
  sectionTitle(L({ pt: "Lista de Fornecedores", en: "Supplier List" }));

  const COLS = [
    { label: L({ pt: "FORNECEDOR / CONTRATO", en: "SUPPLIER / CONTRACT" }), w: contentW * 0.18 },
    { label: L({ pt: "TIPO", en: "TYPE" }), w: contentW * 0.11 },
    { label: L({ pt: "FUNÇÕES", en: "FUNCTIONS" }), w: contentW * 0.12 },
    { label: L({ pt: "RTO PROCESSO", en: "PROCESS RTO" }), w: contentW * 0.08 },
    { label: L({ pt: "RTO FORN.", en: "SUPPLIER RTO" }), w: contentW * 0.09 },
    { label: L({ pt: "TIPO SERVIÇO", en: "SERVICE TYPE" }), w: contentW * 0.08 },
    { label: L({ pt: "ESSENC.", en: "ESSENT." }), w: contentW * 0.06 },
    { label: L({ pt: "ALTERNATIVAS", en: "ALTERNATIVES" }), w: contentW * 0.09 },
    { label: L({ pt: "SUBSTITUIÇÃO", en: "SUBSTITUTION" }), w: contentW * 0.07 },
    { label: L({ pt: "SAÍDA", en: "EXIT" }), w: contentW * 0.06 },
    { label: L({ pt: "ÚLT. TESTE", en: "LAST TEST" }), w: contentW * 0.06 },
  ];

  const drawTableHead = () => {
    ensure(12);
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    let x = margin + 2;
    COLS.forEach((c) => {
      doc.text(doc.splitTextToSize(c.label, c.w - 3)[0] ?? "", x, y + 4.7);
      x += c.w;
    });
    doc.setTextColor(0, 0, 0);
    y += 9;
  };
  drawTableHead();

  const groups: { name: string; items: SupplierPDFRow[] }[] = [];
  rows.forEach((r) => {
    const g = groups.find((x) => x.name === r.name);
    if (g) g.items.push(r);
    else groups.push({ name: r.name, items: [r] });
  });

  groups.forEach((g) => {
    ensure(10);
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y - 4, contentW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${g.name}  (${g.items.length} ${g.items.length === 1 ? L({ pt: "contrato", en: "contract" }) : L({ pt: "contratos", en: "contracts" })})`,
      margin + 2,
      y
    );
    doc.setTextColor(0, 0, 0);
    y += 8;

    g.items.forEach((r, idx) => {
      const nameLines = doc.splitTextToSize(
        `${r.contract_name}${r.subcontractors ? ` (${r.subcontractors})` : ""}`,
        COLS[0].w - 6
      );
      const typeLines = doc.splitTextToSize(r.supplier_type || "—", COLS[1].w - 4);
      const funcLines = doc.splitTextToSize(r.funcoes.join(", ") || "—", COLS[2].w - 4);
      const altLines = doc.splitTextToSize(L(ALT[r.alternatives] ?? { pt: "—", en: "—" }), COLS[7].w - 4);
      const rowH = Math.max(
        8,
        Math.max(nameLines.length, typeLines.length, funcLines.length, altLines.length) * 3.4 + 4
      );
      ensure(rowH + 2);
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 4, contentW, rowH, "F");
      }
      let x = margin + 4;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(nameLines, x, y);
      x = margin + 2 + COLS[0].w;
      doc.setTextColor(51, 65, 85);
      doc.text(typeLines, x, y);
      x += COLS[1].w;
      doc.text(funcLines, x, y);
      x += COLS[2].w;
      doc.text(r.dr_label || "—", x, y);
      x += COLS[3].w;
      if (r.rto_compliant === false) doc.setTextColor(185, 28, 28);
      else if (r.rto_compliant === true) doc.setTextColor(4, 120, 87);
      doc.text(
        r.rto_compliant == null
          ? "—"
          : r.rto_compliant
            ? L({ pt: "Conforme", en: "Compliant" })
            : L({ pt: "Não conforme", en: "Non-compliant" }),
        x,
        y
      );
      doc.setTextColor(51, 65, 85);
      x += COLS[4].w;
      doc.text(r.service_type ? L(SVC[r.service_type] ?? { pt: "—", en: "—" }) : "—", x, y);
      x += COLS[5].w;
      doc.text(L(ESS[r.essentiality] ?? { pt: "—", en: "—" }), x, y);
      x += COLS[6].w;
      doc.text(altLines, x, y);
      x += COLS[7].w;
      doc.text(L(SUB[r.substitution_time] ?? { pt: "—", en: "—" }), x, y);
      x += COLS[8].w;
      doc.text(L(EXIT[r.exit_strategy] ?? { pt: "—", en: "—" }), x, y);
      x += COLS[9].w;
      doc.text(r.last_gcn_test ?? L({ pt: "Sem teste", en: "No test" }), x, y);
      doc.setTextColor(0, 0, 0);
      y += rowH;
    });
    y += 3;
  });

  y += 6;

  /* ── 3. Detalhe por Fornecedor ── */
  sectionTitle(L({ pt: "Detalhe por Fornecedor", en: "Supplier Detail" }));

  rows.forEach((r) => {
    const pairs: [string, string][] = [
      [L({ pt: "Subcontratados / 4ª parte", en: "Subcontractors / 4th party" }), r.subcontractors || "—"],
      [L({ pt: "Tipo de Fornecedor", en: "Supplier type" }), r.supplier_type || "—"],
      [L({ pt: "Contrato", en: "Contract" }), r.contract_name || "—"],
      [L({ pt: "Processo Crítico", en: "Critical process" }), r.critical_area || "—"],
      [L({ pt: "Tipo de Serviço", en: "Service type" }), r.service_type ? L(SVC[r.service_type]) : "—"],
      [L({ pt: "Funções", en: "Functions" }), r.funcoes.join(", ") || "—"],
      [L({ pt: "RTO Processo (Tipo de DR)", en: "Process RTO (DR type)" }), r.dr_label || "—"],
      [
        L({ pt: "RTO Fornecedor", en: "Supplier RTO" }),
        r.rto_compliant == null
          ? "—"
          : r.rto_compliant
            ? L({ pt: "Conforme", en: "Compliant" })
            : L({ pt: "Não conforme", en: "Non-compliant" }),
      ],
      [L({ pt: "Essencialidade", en: "Essentiality" }), L(ESS[r.essentiality] ?? { pt: "—", en: "—" })],
      [L({ pt: "Alternativas Viáveis", en: "Viable alternatives" }), L(ALT[r.alternatives] ?? { pt: "—", en: "—" })],
      [L({ pt: "Tempo de Substituição", en: "Substitution time" }), L(SUB[r.substitution_time] ?? { pt: "—", en: "—" })],
      [L({ pt: "Estratégia de Saída", en: "Exit strategy" }), L(EXIT[r.exit_strategy] ?? { pt: "—", en: "—" })],
      [L({ pt: "Último Teste GCN", en: "Last BCM test" }), r.last_gcn_test ?? L({ pt: "Sem teste", en: "No test" })],
      [L({ pt: "Departamento", en: "Department" }), r.department || "—"],
      [L({ pt: "Notas", en: "Notes" }), r.notes || "—"],
    ];

    ensure(16);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentW, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_BLUE);
    doc.text(r.name, margin + 2, y + 4.5);
    doc.setTextColor(0, 0, 0);
    y += 9;

    const labelW = contentW * 0.22;
    pairs.forEach(([label, value]) => {
      const lines = doc.splitTextToSize(value, contentW - labelW - 6);
      const h = Math.max(4.5, lines.length * 3.6 + 1);
      ensure(h + 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(label, margin + 2, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(lines, margin + labelW, y);
      doc.setTextColor(0, 0, 0);
      y += h;
    });
    y += 5;
  });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(i, total);
  }
  doc.save(`Fornecedores_Criticos_${new Date().toISOString().slice(0, 10)}.pdf`);
}
