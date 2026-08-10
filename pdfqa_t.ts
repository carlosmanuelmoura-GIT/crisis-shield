console.log("t start");
import { generateDeptActionCardsPDF } from "./src/lib/generateDeptActionCardsPDF";
const cards = [1,2,3,4].map(i => ({
  id: `abcd${i}0000-0000-0000-0000-000000000000`,
  title_pt: i%2? "Gestão de TARGET2 e SICOI em falha sistémica":"Contingência de Superintendência de Pagamentos",
  title_en: "x", severity: i%2? "critical":"high",
  cenario_id: i<3? "c1":"c2", recurso_id: "r1", dr_type_id: "d1",
  macro_processo: "Liquidação por bruto e compensação de retalho",
  golden_rule: i%2? "Na dúvida sobre a integridade dos dados de liquidação, travar a replicação automática e transitar imediatamente para o Módulo de Contingência Manual." : "",
  activation_authority: "Coordenador DPG / Turno",
  strategic_pause: i===2,
}));
const items = cards.flatMap(c => [1,2,3,4,5].map(n => ({ id: c.id+n, action_card_id: c.id, text_pt: `Isolar a rede interna e suspender as tarefas automáticas de envio/receção de ficheiros de compensação (${n}).`, text_en:"", sort_order:n })));
generateDeptActionCardsPDF({
  departmentName: "Departamento de Sistemas de Pagamentos (DPG)", departmentCode: "DPG",
  cards: cards as any, items: items as any,
  cenarios: [{id:"c1",roman:"I",name_pt:"Indisponibilidade de Sistemas Core",description_pt:"Interrupção catastrófica da disponibilidade de sistemas informáticos críticos de liquidação, incluindo plataformas geridas internamente pelo Banco ou contratadas ao exterior.",color:""},{id:"c2",roman:"II",name_pt:"Indisponibilidade de Edifícios",description_pt:"Perda de acesso às instalações.",color:""}] as any,
  recursos: [{id:"r1",name_pt:"Sistemas Aplicacionais"}] as any,
  drTypes: [{id:"d1",code:"DR1",label:"Crítico",rto:2,rpo:0}] as any,
});
