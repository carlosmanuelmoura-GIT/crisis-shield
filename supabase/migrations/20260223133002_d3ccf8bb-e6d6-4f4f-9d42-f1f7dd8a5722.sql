
-- ==========================================
-- Tabela: procedures
-- ==========================================
CREATE TABLE public.procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_pt text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  category_pt text NOT NULL DEFAULT '',
  category_en text NOT NULL DEFAULT '',
  content_pt text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view procedures" ON public.procedures FOR SELECT USING (true);
CREATE POLICY "Privileged can insert procedures" ON public.procedures FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update procedures" ON public.procedures FOR UPDATE USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete procedures" ON public.procedures FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

CREATE TRIGGER update_procedures_updated_at
  BEFORE UPDATE ON public.procedures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- Tabela: bia_processes
-- ==========================================
CREATE TABLE public.bia_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_pt text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  rto numeric NOT NULL DEFAULT 0,
  rpo numeric NOT NULL DEFAULT 0,
  criticality text NOT NULL DEFAULT 'medium',
  dependencies text[] NOT NULL DEFAULT '{}',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bia_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bia_processes" ON public.bia_processes FOR SELECT USING (true);
CREATE POLICY "Privileged can insert bia_processes" ON public.bia_processes FOR INSERT WITH CHECK (is_privileged(auth.uid()));
CREATE POLICY "Owner or privileged can update bia_processes" ON public.bia_processes FOR UPDATE USING ((auth.uid() = owner_id) OR is_privileged(auth.uid()));
CREATE POLICY "Especialista can delete bia_processes" ON public.bia_processes FOR DELETE USING (has_role(auth.uid(), 'especialista_gcn'::app_role));

CREATE TRIGGER update_bia_processes_updated_at
  BEFORE UPDATE ON public.bia_processes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- Seed: procedures
-- ==========================================
INSERT INTO public.procedures (title_pt, title_en, category_pt, category_en, content_pt, content_en) VALUES
('Plano de Evacuação Geral', 'General Evacuation Plan', 'Emergência', 'Emergency',
 E'## Plano de Evacuação\n\n### Objetivo\nGarantir a evacuação segura de todas as pessoas do edifício.\n\n### Passos\n1. Ao ouvir o alarme, parar toda a atividade\n2. Seguir sinalética de evacuação verde\n3. NÃO utilizar elevadores\n4. Dirigir-se ao ponto de encontro designado (Parque Norte)\n5. Responsáveis de piso confirmam evacuação completa\n6. Aguardar autorização para reentrada\n\n### Pontos de Encontro\n- **Primário**: Parque de estacionamento Norte\n- **Secundário**: Jardim Municipal (500m)',
 E'## Evacuation Plan\n\n### Objective\nEnsure safe evacuation of all building occupants.\n\n### Steps\n1. Upon hearing the alarm, stop all activity\n2. Follow green evacuation signage\n3. DO NOT use elevators\n4. Proceed to designated assembly point (North Parking)\n5. Floor wardens confirm complete evacuation\n6. Wait for re-entry authorization\n\n### Assembly Points\n- **Primary**: North parking lot\n- **Secondary**: Municipal Garden (500m)'),

('Resposta a Incidente Cibernético', 'Cyber Incident Response', 'TI/Ciber', 'IT/Cyber',
 E'## Resposta a Incidente Cibernético\n\n### Fase 1 — Contenção\n- Isolar segmento de rede afetado\n- Bloquear contas comprometidas\n- Preservar estado dos sistemas (snapshots)\n\n### Fase 2 — Investigação\n- Analisar logs de acesso\n- Identificar vetor de ataque\n- Avaliar dados expostos\n\n### Fase 3 — Recuperação\n- Restaurar sistemas a partir de backups limpos\n- Monitorizar atividade anómala 72h\n- Relatório pós-incidente em 48h',
 E'## Cyber Incident Response\n\n### Phase 1 — Containment\n- Isolate affected network segment\n- Block compromised accounts\n- Preserve system state (snapshots)\n\n### Phase 2 — Investigation\n- Analyze access logs\n- Identify attack vector\n- Assess exposed data\n\n### Phase 3 — Recovery\n- Restore systems from clean backups\n- Monitor anomalous activity 72h\n- Post-incident report within 48h'),

('Ativação do Site Alternativo', 'Alternative Site Activation', 'Continuidade', 'Continuity',
 E'## Ativação do Site Alternativo\n\n### Critérios de Ativação\n- Indisponibilidade do site principal > 4 horas\n- Danos estruturais que impeçam acesso\n- Ordem da coordenação de crise\n\n### Procedimento\n1. Coordenador de crise autoriza ativação\n2. Equipa TI ativa VPN e serviços no site DR\n3. Pessoal essencial desloca-se para site alternativo\n4. Comunicar nova localização a todos os colaboradores\n5. Testar conectividade e sistemas críticos',
 E'## Alternative Site Activation\n\n### Activation Criteria\n- Primary site unavailable > 4 hours\n- Structural damage preventing access\n- Crisis coordination order\n\n### Procedure\n1. Crisis coordinator authorizes activation\n2. IT team activates VPN and services at DR site\n3. Essential personnel relocate to alternative site\n4. Communicate new location to all staff\n5. Test connectivity and critical systems'),

('Comunicação de Crise — Stakeholders', 'Crisis Communication — Stakeholders', 'Comunicação', 'Communication',
 E'## Comunicação de Crise\n\n### Princípios\n- Uma só voz (porta-voz designado)\n- Factos confirmados apenas\n- Atualizações regulares (mín. cada 2h)\n\n### Cadeia de Comunicação\n1. Equipa de crise → Direção\n2. Direção → Colaboradores\n3. Porta-voz → Media/Público\n4. Jurídico → Autoridades reguladoras\n\n### Templates\n- Comunicado interno inicial\n- Atualização de situação\n- Comunicado de resolução',
 E'## Crisis Communication\n\n### Principles\n- Single voice (designated spokesperson)\n- Confirmed facts only\n- Regular updates (min. every 2h)\n\n### Communication Chain\n1. Crisis team → Management\n2. Management → Staff\n3. Spokesperson → Media/Public\n4. Legal → Regulatory authorities\n\n### Templates\n- Initial internal communication\n- Situation update\n- Resolution communication'),

('Gestão de Fornecedores Críticos', 'Critical Supplier Management', 'Operações', 'Operations',
 E'## Gestão de Fornecedores Críticos\n\n### Classificação\n- **Tier 1**: Sem alternativa imediata (energia, telecom)\n- **Tier 2**: Alternativa disponível em 24-48h\n- **Tier 3**: Alternativa disponível em <24h\n\n### Em Situação de Crise\n1. Contactar fornecedores Tier 1 imediatamente\n2. Ativar contratos de SLA de emergência\n3. Documentar todas as comunicações\n4. Avaliar impacto financeiro',
 E'## Critical Supplier Management\n\n### Classification\n- **Tier 1**: No immediate alternative (power, telecom)\n- **Tier 2**: Alternative available in 24-48h\n- **Tier 3**: Alternative available in <24h\n\n### In Crisis Situation\n1. Contact Tier 1 suppliers immediately\n2. Activate emergency SLA contracts\n3. Document all communications\n4. Assess financial impact');

-- ==========================================
-- Seed: bia_processes
-- ==========================================
INSERT INTO public.bia_processes (name_pt, name_en, rto, rpo, criticality, dependencies) VALUES
('Email Corporativo', 'Corporate Email', 2, 1, 'critical', '{}'),
('ERP / Gestão', 'ERP / Management', 4, 2, 'critical', '{}'),
('Website Público', 'Public Website', 8, 4, 'high', '{}'),
('Active Directory', 'Active Directory', 1, 0.5, 'critical', '{}'),
('Rede / Conectividade', 'Network / Connectivity', 0.5, 0, 'critical', '{}'),
('Base de Dados Central', 'Central Database', 2, 1, 'critical', '{}'),
('Telefonia VoIP', 'VoIP Telephony', 4, 0, 'high', '{}'),
('Sistema de CCTV', 'CCTV System', 12, 24, 'medium', '{}');
