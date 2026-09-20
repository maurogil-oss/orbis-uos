import { computeSha256, sanitizeHtml } from '@/lib/diagnostics/pdfReport'
import { getOrbisLogoDataUrl } from '@/lib/diagnostics/dossieArquiteturaPdf'

export interface GeneratePlaybookImplantacaoOptions {
  responsavelNome?: string
  responsavelCargo?: string
  orgaoInteressado?: string
  municipio?: string
  uf?: string
}

export interface PlaybookImplantacaoResult {
  hash: string
  protocolo: string
}

/**
 * Gera e abre a janela de impressão/salvar em PDF com o Playbook Oficial de Implantação GovTech ORBIS UOS
 * Contendo:
 *  (a) Pré-requisitos de Implantação
 *  (b) Matriz RACI Startup × Órgão (6 Fases)
 *  (c) Critérios Objetivos de Homologação
 *  (d) Critérios e Procedimento de Go-Live
 *  (e) Procedimento de Rollback e Encerramento Soberano
 */
export async function generatePlaybookImplantacaoPdf(
  options?: GeneratePlaybookImplantacaoOptions,
): Promise<PlaybookImplantacaoResult> {
  const agora = new Date()
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const horaFormatada = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const protocolo = 'ORBIS-PLAYBOOK-2026-001'

  let logoDataUrl = ''
  try {
    logoDataUrl = await getOrbisLogoDataUrl()
  } catch (_) {
    logoDataUrl = ''
  }

  const hashPayload = {
    documento: 'Playbook Oficial de Implantação GovTech B2G — ORBIS UOS',
    protocolo,
    versao: '0.0.26',
    emissaoIso: agora.toISOString(),
    municipioAlvo: options?.municipio || 'Curitiba',
    ufAlvo: options?.uf || 'PR',
    preRequisitos: [
      'Contas individuais RBAC (admin/operador) criadas pelo órgão sem compartilhamento de senha',
      'Definição formal de linhas de ônibus, rotas de coleta e viaturas para coleta passiva',
      'Indicação do Fiscal Técnico e Fiscal Administrativo do contrato CPSI',
      'Declaração de adesão aos Termos de Uso e Política de Privacidade LGPD',
    ],
    matrizRaci: [
      {
        fase: '1. Contratação (CPSI)',
        r: 'Procuradoria & Startup',
        a: 'Prefeito / Secretário',
        c: 'Câmara / Controle',
        i: 'Sociedade',
      },
      {
        fase: '2. Provisionamento Técnico',
        r: 'Engenharia Startup',
        a: 'CTO Startup & DTI Órgão',
        c: 'DPO',
        i: 'Operadores',
      },
      {
        fase: '3. Homologação Funcional',
        r: 'Comissão Técnica Órgão',
        a: 'Fiscal do Contrato',
        c: 'Startup Lead',
        i: 'Secretaria Obras',
      },
      {
        fase: '4. Go-Live Oficial',
        r: 'Startup & Fiscal Órgão',
        a: 'Secretário Municipal',
        c: 'Gabinete',
        i: 'População',
      },
      {
        fase: '5. Operação Assistida (30d)',
        r: 'Engenharia Suporte & Fiscais',
        a: 'Gestor do Contrato',
        c: 'Equipe Campo',
        i: 'TCE',
      },
      {
        fase: '6. Operação Autônoma',
        r: 'Secretaria de Obras',
        a: 'Prefeito',
        c: 'Startup (Nível 3)',
        i: 'TCE / CGU',
      },
    ],
    criteriosHomologacao: [
      'Validação de 3 passagens inerciais com Fator de Confiança F >= 3',
      'Indexação espacial H3 com k-anonimato (k >= 3 sessões)',
      'Consistência do banco de dados atestada por PRAGMA integrity_check',
      'Trilha de auditoria institucional registrando operações administrativas com autoria',
      'Sincronização offline-first confirmada em trechos com sombra de sinal celular',
    ],
    procedimentoRollback: {
      gatilhos: [
        'Inconsistência insanável de dados',
        'Quebra de conformidade legal',
        'Decisão unilateral do ente',
      ],
      preservacaoDados:
        'Soberania exclusiva do órgão: exportação aberta GeoJSON/PDF em até 48h sem lock-in',
    },
    responsavel: options?.responsavelNome || 'Acesso Institucional Governamental',
    cargo: options?.responsavelCargo || 'Gestão de Contratos e Implantação B2G',
    orgao: options?.orgaoInteressado || 'Prefeitura Municipal / Secretaria de Obras',
  }

  const hashSha256 = await computeSha256(hashPayload)

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Playbook-Implantacao-ORBIS-UOS-${protocolo}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 16mm 16mm 16mm 16mm;
          @bottom-right {
            content: counter(page) "/" counter(pages);
          }
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.5;
        }
        .cover {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 940px;
          padding: 30px 24px 24px 24px;
          border-left: 6px solid #2563EB;
          background: linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%);
        }
        .cover-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 18px;
        }
        .cover-logo {
          height: 44px;
          max-width: 200px;
          object-fit: contain;
        }
        .cover-badge {
          background: #1E3A8A;
          color: #60A5FA;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .cover-body {
          margin: 40px 0 30px 0;
        }
        .cover-tagline {
          color: #2563EB;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .cover-title {
          font-size: 26px;
          font-weight: 900;
          line-height: 1.25;
          color: #0A1128;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }
        .cover-subtitle {
          font-size: 12.5px;
          color: #475569;
          line-height: 1.6;
          max-width: 680px;
          margin: 0;
        }
        .cover-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 30px;
          background: #F8FAFC;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
        }
        .cover-meta-item strong {
          display: block;
          font-size: 9px;
          text-transform: uppercase;
          color: #64748B;
          letter-spacing: 0.5px;
        }
        .cover-meta-item span {
          font-size: 11px;
          font-weight: 700;
          color: #0F172A;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .cover-footer {
          border-top: 2px solid #E2E8F0;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 9px;
          color: #64748B;
        }
        .page-break {
          page-break-before: always;
          break-before: page;
          margin-top: 20px;
          padding-top: 15px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 2px solid #2563EB;
          padding-bottom: 6px;
          margin: 18px 0 10px 0;
        }
        .section-number {
          background: #2563EB;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          color: #0A1128;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }
        p {
          margin: 0 0 9px 0;
          color: #1E293B;
          text-align: justify;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0 12px 0;
          font-size: 10px;
        }
        th, td {
          border: 1px solid #CBD5E1;
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: #F1F5F9;
          font-weight: 800;
          color: #0A1128;
          text-transform: uppercase;
          font-size: 9px;
          letter-spacing: 0.5px;
        }
        tr:nth-child(even) td {
          background: #F8FAFC;
        }
        .badge-status {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 9px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .badge-blue { background: #DBEAFE; color: #1D4ED8; border: 1px solid #93C5FD; }
        .badge-green { background: #DCFCE7; color: #15803D; border: 1px solid #86EFAC; }
        .highlight-box {
          background: #EFF6FF;
          border-left: 4px solid #3B82F6;
          padding: 10px 12px;
          border-radius: 0 6px 6px 0;
          margin: 10px 0;
          font-size: 10.5px;
        }
        .hash-bar {
          background: #0A1128;
          color: #38BDF8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 9px;
          padding: 10px 14px;
          border-radius: 6px;
          word-break: break-all;
          margin-top: 16px;
          border-left: 4px solid #3B82F6;
        }
      </style>
    </head>
    <body>
      <div class="cover">
        <div class="cover-header">
          ${
            logoDataUrl
              ? `<img src="${logoDataUrl}" alt="ORBIS.UOS" class="cover-logo" />`
              : `<div style="font-size: 18px; font-weight: 900; color: #1E3A8A; font-family: monospace;">ORBIS.UOS</div>`
          }
          <div class="cover-badge">DOC-PLAYBOOK-001 • GOVTECH B2G</div>
        </div>

        <div class="cover-body">
          <div class="cover-tagline">Rito de Homologação, Transparência & Entrada em Operação</div>
          <h1 class="cover-title">
            Playbook Oficial de Implantação GovTech (RACI Startup × Órgão)
          </h1>
          <p class="cover-subtitle">
            Diretriz executiva formal para conduzir a implantação, teste de conformidade, homologação e
            go-live da plataforma ORBIS.UOS na administração pública municipal ou estadual. Estruturado
            sob as garantias da Lei Complementar nº 182/2021 (Marco Legal das Startups), com critérios
            objetivos de aceite e procedimento formal de encerramento sem dependência tecnológica.
          </p>

          <div class="cover-meta-grid">
            <div class="cover-meta-item">
              <strong>Protocolo de Homologação</strong>
              <span>${protocolo}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Data / Hora de Publicação</strong>
              <span>${dataFormatada} às ${horaFormatada}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Versão Homologada</strong>
              <span>ORBIS.UOS v0.0.26 (Hardened B2G)</span>
            </div>
            <div class="cover-meta-item">
              <strong>Órgão Contratante / Ente</strong>
              <span>${sanitizeHtml(options?.orgaoInteressado || 'Prefeitura Municipal / Secretaria')}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Gestor Responsável Declarado</strong>
              <span>${sanitizeHtml(options?.responsavelNome || 'Acesso Institucional Governamental')}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Classificação de Acesso</strong>
              <span>Documento Público de Governança (Art. 8º Lei 12.527/2011)</span>
            </div>
          </div>
        </div>

        <div class="cover-footer">
          <div>
            <strong>ORBIS.UOS GovTech</strong> • Rito de Entrada em Produção B2G<br>
            Marco Legal das Startups (LC 182/2021) • Soberania Pública de Dados
          </div>
          <div style="text-align: right;">
            Fé Pública Digital amparada na Lei nº 14.063/2020<br>
            Autenticidade Criptográfica SHA-256 no Rodapé
          </div>
        </div>
      </div>

      <div class="page-break">
        <div class="section-header">
          <span class="section-number">1</span>
          <h2 class="section-title">Pré-Requisitos Mandatórios de Implantação</h2>
        </div>

        <p>
          Antes do início da coleta em campo ou da emissão das primeiras ordens de serviço viárias, o órgão
          contratante deve atestar a completude dos seguintes pré-requisitos objetivos:
        </p>

        <ul style="margin: 6px 0 12px 18px; padding: 0; font-size: 10.5px;">
          <li><b>1. Criação de Contas Individuais RBAC:</b> Criação exclusiva pelo gestor institucional autenticado (papel <code>admin</code>), atribuindo perfis adequados (<code>admin</code> para tomadores de decisão; <code>operador</code> para agentes de trânsito). O auto-registro público permanece desativado.</li>
          <li><b>2. Calendário e Itinerários de Coleta:</b> Definição formal das frotas-sensor existentes (ônibus, caminhões coletores ou viaturas da Guarda Municipal) com mapeamento preliminar de itinerários para assegurar cobertura geográfica.</li>
          <li><b>3. Designação da Equipe e Fiscais:</b> Portaria ou despacho nomeando o Fiscal Técnico, Fiscal Administrativo e o Agente de Proteção de Dados (DPO) do município.</li>
          <li><b>4. Conformidade e Termos de Uso:</b> Ciência inequívoca da Política de Privacidade (com retenção estrita de 180 dias de telemetria bruta) e dos Termos de Uso garantindo soberania total dos dados.</li>
        </ul>

        <div class="section-header">
          <span class="section-number">2</span>
          <h2 class="section-title">Matriz de Responsabilidades RACI (Startup × Órgão Público)</h2>
        </div>

        <p>
          Legenda: <b>R</b> (Responsible / Executor), <b>A</b> (Accountable / Aprovador Soberano), <b>C</b> (Consulted / Consultado), <b>I</b> (Informed / Informado).
        </p>

        <table>
          <thead>
            <tr>
              <th>Fase do Projeto</th>
              <th>Escopo de Trabalho</th>
              <th>Startup Orbis UOS</th>
              <th>Órgão Público Contratante</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>1. Contratação</b></td>
              <td>Enquadramento legal CPSI (LC 182/2021), matriz de riscos e termo de referência.</td>
              <td><span class="badge-status badge-blue">R (Suporte Técnico)</span></td>
              <td><span class="badge-status badge-green">A (Procuradoria / Gestor)</span></td>
            </tr>
            <tr>
              <td><b>2. Provisionamento</b></td>
              <td>Instalação do tenant dedicado na nuvem Skip Cloud e configuração de RBAC.</td>
              <td><span class="badge-status badge-blue">R (Engenharia Nuvem)</span></td>
              <td><span class="badge-status badge-green">A (DTI / Gestor Contas)</span></td>
            </tr>
            <tr>
              <td><b>3. Homologação</b></td>
              <td>Teste de campo de 3 passagens inerciais, check SQLite WAL e k-anonimato H3.</td>
              <td><span class="badge-status badge-blue">R (Apoio Metodológico)</span></td>
              <td><span class="badge-status badge-green">A (Comissão de Aceite)</span></td>
            </tr>
            <tr>
              <td><b>4. Go-Live</b></td>
              <td>Liberação das rotinas em produção e abertura do Modo Gabinete executivo.</td>
              <td><span class="badge-status badge-blue">R (Monitoramento Nível 1)</span></td>
              <td><span class="badge-status badge-green">A (Prefeito / Secretário)</span></td>
            </tr>
            <tr>
              <td><b>5. Operação Assistida</b></td>
              <td>30 primeiros dias com acompanhamento diário de telemetria e calibração Fator K.</td>
              <td><span class="badge-status badge-blue">R (Engenharia de Dados)</span></td>
              <td><span class="badge-status badge-green">A (Fiscal de Contrato)</span></td>
            </tr>
            <tr>
              <td><b>6. Operação Autônoma</b></td>
              <td>Rotina diária de reparos, OS automáticas e prestação de contas com fé pública aos TCEs.</td>
              <td><span class="badge-status badge-blue">C (SLA & Sustentação P1-P3)</span></td>
              <td><span class="badge-status badge-green">R / A (Secretaria de Obras)</span></td>
            </tr>
          </tbody>
        </table>

        <div class="section-header">
          <span class="section-number">3</span>
          <h2 class="section-title">Critérios Objetivos de Homologação & Aceite Técnico</h2>
        </div>

        <div class="highlight-box">
          <b>Checklist Objetivo de Aprovação Pré-Go-Live:</b>
          <div style="margin-top: 4px; font-size: 10px;">
            [✓] <b>Coleta Offline-First:</b> Coleta executada em túnel ou área de sombra 4G com sincronização posterior íntegra.<br>
            [✓] <b>Cálculo de Índices IMV e IMA:</b> Segmentos submetidos ao limiar F ≥ 3 passagens exibindo nota entre 0 e 100.<br>
            [✓] <b>k-Anonimato Espacial H3:</b> Ocultação estrita de células com menos de 3 sessões independentes (Art. 12 LGPD).<br>
            [✓] <b>Trilha de Auditoria com Autoria:</b> Toda alteração administrativa gerando log imutável com ID, nome e papel.<br>
            [✓] <b>Teste de Restauração de Backup:</b> <code>PRAGMA integrity_check</code> aprovado e restauração comprovada sob o RTO de 24h.
          </div>
        </div>

        <div class="section-header">
          <span class="section-number">4</span>
          <h2 class="section-title">Procedimento de Rollback e Encerramento Soberano</h2>
        </div>

        <p>
          Caso o município decida descontinuar o piloto ou ocorra rescisão contratual amparada pela LC 182/2021:
        </p>

        <ul style="margin: 4px 0 12px 18px; padding: 0; font-size: 10.5px;">
          <li><b>Rollback Imediato de Emergência:</b> Desconexão imediata das sondas e restauração do snapshot estável imediatamente anterior (D-1).</li>
          <li><b>Soberania e Portabilidade Total:</b> O município recebe a totalidade dos dados da malha, relatórios de anomalias e índices em formatos abertos (GeoJSON, JSON e CSV) em até 48 horas úteis, sem retenção indevida ou custo rescisório adicional.</li>
          <li><b>Destruição Segura de Dados Transitórios:</b> Purga formal de instâncias de teste e certificados com emissão de Certificado de Descarte de Dados conforme o Art. 16 da LGPD.</li>
        </ul>

        <div class="hash-bar">
          <b>HASH SHA-256 DO PLAYBOOK OFICIAL DE IMPLANTAÇÃO:</b><br>
          ${hashSha256}
        </div>

        <div style="margin-top: 25px; border-top: 1px solid #CBD5E1; padding-top: 10px; font-size: 9px; color: #64748B; text-align: center;">
          ORBIS.UOS • Urban Operating System • Playbook Oficial de Implantação B2G • Versão 0.0.26<br>
          Emissão com fé pública digital amparada na Lei nº 14.063/2020 e Art. 27 da Lei Complementar nº 182/2021.
        </div>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error(
      'Bloqueador de pop-ups impediu a abertura do Playbook de Implantação. Autorize pop-ups para este domínio.',
    )
  }

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    try {
      printWindow.print()
    } catch (e) {
      console.warn('Erro ao disparar impressão automática:', e)
    }
  }, 450)

  return { hash: hashSha256, protocolo }
}
