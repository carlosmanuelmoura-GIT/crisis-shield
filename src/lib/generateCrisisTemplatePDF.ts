import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PHASES } from "@/hooks/useCrisisPhases";

const NAVY: [number, number, number] = [15, 23, 42];
const BLUE: [number, number, number] = [37, 99, 235];
const GREY: [number, number, number] = [100, 116, 139];
const COLORS: [number, number, number][] = [
  [234, 179, 8], [220, 38, 38], [37, 99, 235], [139, 92, 246], [14, 165, 233], [16, 185, 129],
];

export async function generateCrisisTemplatePDF(crisis: { id: string; title: string; crisis_type: string }, lang: "pt" | "en" = "pt") {
  const [{ data: phasesData, error: e1 }, { data: actionsData, error: e2 }] = await Promise.all([
    supabase.from("crisis_phases" as any).select("*").eq("crisis_id", crisis.id).order("sort_order"),
    supabase.from("crisis_phase_actions").select("*").eq("crisis_id", crisis.id).order("sort_order"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  let phases = ((phasesData || []) as any[]).map((p) => ({ key: p.phase_key, label: lang === "pt" ? p.label_pt : p.label_en }));
  if (phases.length === 0) phases = DEFAULT_PHASES.map((p) => ({ key: p.phase_key, label: lang === "pt" ? p.label_pt : p.label_en }));
  const actions = (actionsData || []) as any[];

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 12;
  const cw = pageW - m * 2;
  const issued = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();

  const header = () => {
    let y = m;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7);
    const b = "EUROSISTEMA / GCN"; const bw = doc.getTextWidth(b) + 6;
    doc.setFillColor(...NAVY); doc.roundedRect(m, y, bw, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255); doc.text(b, m + 3, y + 3.5);
    doc.setTextColor(...GREY); doc.text("PLANO DE CONTINUIDADE DE NEGÓCIO", m + bw + 4, y + 3.5);
    doc.setFont("courier", "bold"); doc.setTextColor(...NAVY);
    doc.text(`REF: TPL_CRISE_${new Date().getFullYear()}`, pageW - m, y + 3.5, { align: "right" });
    y += 12;
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...NAVY);
    doc.text("GESTÃO DE CONTINUIDADE DE NEGÓCIO", m, y);
    doc.setFontSize(7); doc.setFillColor(226, 232, 240);
    doc.roundedRect(pageW - m - 22, y - 7.5, 22, 5, 1, 1, "F");
    doc.text("RESERVADO", pageW - m - 11, y - 4, { align: "center" });
    y += 6;
    doc.setFontSize(9); doc.setTextColor(...BLUE);
    doc.text("TEMPLATE DE GESTÃO DE CRISE — FASES E CHECKLISTS", m, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...GREY);
    doc.text(`EMITIDO: ${issued}`, pageW - m, y, { align: "right" });
    y += 5;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...NAVY);
    doc.text(doc.splitTextToSize(`${crisis.title}  (${crisis.crisis_type.toUpperCase()})`, cw)[0], m, y);
    return y + 6;
  };

  let y = header();
  const ensure = (h: number) => { if (y + h > pageH - 14) { doc.addPage(); y = header(); } };

  phases.forEach((ph, i) => {
    const color = COLORS[i % COLORS.length];
    const list = actions.filter((a) => a.phase_id === ph.key);
    ensure(22);
    doc.setFillColor(...NAVY); doc.roundedRect(m, y, cw, 10, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7);
    const t = `FASE ${String(i + 1).padStart(2, "0")}`; const tw = doc.getTextWidth(t) + 6;
    doc.setFillColor(...color); doc.roundedRect(m + 4, y + 2.5, tw, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255); doc.text(t, m + 7, y + 6);
    doc.setFontSize(11); doc.text((ph.label || "").toUpperCase(), m + 8 + tw, y + 7);
    doc.setFont("courier", "normal"); doc.setFontSize(6.5); doc.setTextColor(203, 213, 225);
    doc.text(`${list.length} ${list.length === 1 ? "AÇÃO" : "AÇÕES"}`, pageW - m - 4, y + 6.5, { align: "right" });
    y += 14;

    if (list.length === 0) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(...GREY);
      doc.text("(Sem ações definidas)", m + 4, y); y += 7; return;
    }
    list.forEach((a, idx) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      const lines = doc.splitTextToSize(a.text || "", cw - 24);
      const meta = [
        a.info_department && `Dep Origem: ${a.info_department}`,
        a.info_person && `Quem deu a informação: ${a.info_person}`,
      ].filter(Boolean).join("   ·   ");
      doc.setFontSize(7);
      const notes = a.notes ? doc.splitTextToSize(`Notas: ${a.notes}`, cw - 24) : [];
      const h = lines.length * 3.8 + (meta ? 3.5 : 0) + notes.length * 3.2 + 3;
      ensure(h + 2);
      doc.setFillColor(...NAVY); doc.roundedRect(m + 2, y - 3.2, 6, 4.6, 0.8, 0.8, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(255, 255, 255);
      doc.text(String(idx + 1).padStart(2, "0"), m + 5, y - 0.1, { align: "center" });
      doc.setDrawColor(...GREY); doc.setLineWidth(0.3); doc.rect(m + 10, y - 3, 4, 4);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);
      doc.text(lines, m + 17, y);
      let yy = y + lines.length * 3.8;
      doc.setFontSize(7); doc.setTextColor(...GREY);
      if (meta) { doc.text(meta, m + 17, yy); yy += 3.5; }
      if (notes.length) { doc.text(notes, m + 17, yy); yy += notes.length * 3.2; }
      doc.setDrawColor(226, 232, 240); doc.line(m + 2, yy, pageW - m, yy);
      y = yy + 4.5;
    });
    y += 3;
  });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240); doc.line(m, pageH - 10, pageW - m, pageH - 10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...GREY);
    doc.text("GCN // DOCUMENTO DE OPERAÇÃO DE EMERGÊNCIA", m, pageH - 6);
    doc.text(`PÁGINA ${p} DE ${total}`, pageW - m, pageH - 6, { align: "right" });
  }
  const safe = crisis.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 50);
  doc.save(`Template_Crise_${safe}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
