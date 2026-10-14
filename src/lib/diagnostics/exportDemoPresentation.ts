import { getOrbisLogoDataUrl } from '@/lib/diagnostics/dossieArquiteturaPdf'
import { computeSha256, sanitizeHtml } from '@/lib/diagnostics/pdfReport'

export interface DemoStepExportData {
  id: number
  title: string
  shortTitle: string
  institutionalTitle: string
  legalBadge: string
  institutionalSentences: string[]
  keyMetrics: { label: string; value: string; desc: string }[]
  extraDetails?: {
    narrativaGrafica?: string
    interpretacaoTendencia?: string
    aspectosTecnicos?: { chave: string; valor: string }[]
  }
}

export interface ExportDemoOptions {
  steps: DemoStepExportData[]
  municipio?: string
  destinatario?: string
  responsavelNome?: string
}

const INSTITUTIONAL_FOOTER_TEXT =
  'ORBIS.UOS — Plataforma GovTech de auditoria viária contínua · contato@orbis-uos.com.br · www.orbis-uos.com.br'

/**
 * Detalhes complementares para enriquecer a exportação executiva dos 6 slides
 */
export const DEMO_STEPS_COMPLEMENTS: Record<number, DemoStepExportData['extraDetails']> = {
  1: {
    narrativaGrafica:
      'Formulário guiado de pré-diagnóstico com parametrização de 10 variáveis do município (extensão de malha, tipo de frota pública, orçamento viário e histórico de recape). Geração automática de faixa provisória de elegibilidade CPSI.',
    interpretacaoTendencia:
      'Projeção de cobertura de 70% a 92% da malha viária prioritária nos primeiros 30 dias de operação utilizando a frota própria em circulação (ônibus, caminhões de coleta e viaturas municipais), eliminando contratações onerosas de varredura pontual.',
    aspectosTecnicos: [
      {
        chave: 'Tempo de Levantamento',
        valor: 'Inferior a 5 minutos sem solicitação de credenciais',
      },
      {
        chave: 'Capex de Hardware',
        valor: 'Zero CAPEX — uso de smartphones e sensores embarcados',
      },
      { chave: 'Enquadramento', valor: 'Art. 27 da Lei Complementar Federal nº 182/2021 (CPSI)' },
    ],
  },
  2: {
    narrativaGrafica:
      'Gráfico comparativo de custo acumulado: modelo tradicional reativo (tapa-buracos e recapeamento asfáltico emergencial) versus modelo ORBIS preditivo (zeladoria contínua e intervenção em microrrevestimento no tempo ótimo).',
    interpretacaoTendencia:
      'Economia direta de 42% a 68% em massa asfáltica ao antecipar fissuras antes da formação de panelas críticas. Comprovação do nexo causal estrito perante o Tribunal de Contas (TCE) para custeio 100% elegível ao saldo do Fundo Municipal de Multas (Art. 320 do CTB).',
    aspectosTecnicos: [
      {
        chave: 'Economia Orçamentária',
        valor: 'Até R$ 21,00 por habitante/ano em custo evitado formal',
      },
      {
        chave: 'Rubrica Orçamentária',
        valor: 'Art. 320 da Lei 4.320/1964 & Art. 320 da Lei 9.503/1997 (CTB)',
      },
      {
        chave: 'Retorno sobre Investimento',
        valor: 'Taxa superior a 4x em combustível, asfalto e sinistralidade',
      },
    ],
  },
  3: {
    narrativaGrafica:
      'Mapa espacial dinâmico do Gêmeo Digital viário georreferenciado (Curitiba/PR e malha de referência), com traçado de rotas ativas da frota de transporte e telemetria inercial vertical Z em tempo real.',
    interpretacaoTendencia:
      'Auditoria passiva diária sem alteração nas rotas dos motoristas. Processamento inercial a bordo com arquitetura Offline-First resiliente a sombras de cobertura 4G/5G, sincronizando lotes validados aos servidores soberanos.',
    aspectosTecnicos: [
      {
        chave: 'Motor de Borda',
        valor: 'Motor ORBIS DSP (amostragem inercial vertical Z e cálculo de IRI)',
      },
      {
        chave: 'Resiliência de Rede',
        valor: 'Armazenamento IndexedDB local com sincronização assíncrona',
      },
      {
        chave: 'Camadas Cartográficas',
        valor: 'Carto e OpenStreetMap soberano sem dependência de APIs pagas',
      },
    ],
  },
  4: {
    narrativaGrafica:
      'Grid espacial em hexágonos H3 da Uber (Resoluções 9 e 10) integrando os sub-índices IMV (Índice de Manutenção Viária, peso 70%) e IMA (Índice de Mobilidade Ativa e Calçadas, peso 30%). Visualização com supressão de células abaixo do limiar legal.',
    interpretacaoTendencia:
      'Interpretação da Tendência Algorítmica: O Índice IMV opera com escudo anti-falso-positivo Fator F ≥ 3 passagens veiculares distintas antes de emitir Ordens de Serviço. Em estrita conformidade com a LGPD (Art. 12 da Lei 13.709/2018), aplica k-anonimato territorial (k ≥ 3 sessões independentes), blindando rotas de cidadãos e condutores.',
    aspectosTecnicos: [
      {
        chave: 'Fator F de Confiança',
        valor: 'F ≥ 3 passagens independentes para validação de defeito',
      },
      {
        chave: 'k-Anonimato Territorial',
        valor: 'k ≥ 3 sessões por hexágono H3 (dados unicamente anonimizados)',
      },
      {
        chave: 'Resoluções H3',
        valor: 'Res 9 (~174m viário) e Res 10 (~65m calçadas e ciclovias)',
      },
    ],
  },
  5: {
    narrativaGrafica:
      'Diagrama de interoperabilidade em arquitetura aberta B2G com contratos de API RESTful, Webhooks autônomos de despacho e integração direta aos Centros Integrados de Operação (CIC/CICC) e sistemas municipais 156 / SIGOR.',
    interpretacaoTendencia:
      'Nenhum dado retido em formato proprietário (100% anti-lock-in). Formatos abertos GeoJSON RFC 7946 / OGC compatíveis com QGIS, GTFS e painéis de zeladoria, com despacho automático de ocorrências críticas em menos de 1,5 segundos.',
    aspectosTecnicos: [
      { chave: 'Padrão Geoespacial', valor: 'GeoJSON padronizado RFC 7946 e OGC WFS/WMS' },
      { chave: 'Governo Digital', valor: 'Em total conformidade com a Lei Federal nº 14.129/2021' },
      {
        chave: 'Soberania dos Dados',
        valor: 'Banco relacional municipalizado com exportação livre e irrestrita',
      },
    ],
  },
  6: {
    narrativaGrafica:
      'Dossiê pericial com 4 relatórios técnicos oficiais (Enquadramento CPSI, Laudo Dry-Run, Pacote Operacional de Continuidade e Playbook de Implantação em 30 dias), dotados de protocolo de validação e hash criptográfico SHA-256.',
    interpretacaoTendencia:
      'Blindagem jurídica dos gestores e ordenadores de despesa pública perante o Tribunal de Contas do Estado (TCE) e Ministério Público (MP). Imutabilidade matemática assegurada pela MP 2.200-2/2001 e Lei 14.063/2020.',
    aspectosTecnicos: [
      { chave: 'Autenticidade', valor: 'Carimbo SHA-256 de 64 caracteres hexadecimais imutável' },
      {
        chave: 'Minuta Legal',
        valor: 'Minuta de edital CPSI e nota técnica do Art. 320 do CTB inclusas',
      },
      {
        chave: 'Rastreabilidade',
        valor: 'Trilha de auditoria indelével (audit_trail) com registro de cada evento',
      },
    ],
  },
}

/**
 * 1. Exportação em Texto Estruturado (.md / .txt)
 * Roteiro completo da demonstração para anexar em e-mails, processos administrativos ou ofícios.
 */
export function generateDemoMarkdown(options: ExportDemoOptions): string {
  const agora = new Date()
  const dataExtenso = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const horaExtenso = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const municipio = options.municipio || 'Curitiba/PR (Ente de Referência)'
  const destinatario =
    options.destinatario || 'Gestores Públicos, Secretarias Municipais & Cliente-Piloto'

  let doc = ''
  doc += `# ORBIS.UOS — ROTEIRO EXECUTIVO DA DEMONSTRAÇÃO GUIADA B2G\n`
  doc += `Plataforma GovTech de Auditoria Viária Contínua & Zeladoria Preditiva\n`
  doc += `Marco Legal das Startups (LC 182/2021) · Fundo de Multas (Art. 320 CTB)\n\n`
  doc += `--------------------------------------------------------------------------------\n`
  doc += `METADADOS INSTITUCIONAIS DA APRESENTAÇÃO:\n`
  doc += `- Município de Referência: ${municipio}\n`
  doc += `- Destinatário: ${destinatario}\n`
  doc += `- Data e Hora de Emissão: ${dataExtenso} às ${horaExtenso}\n`
  doc += `- Motor de Coleta & Processamento: Motor ORBIS DSP (arquitetura de borda soberana)\n`
  doc += `- Trilha de Auditoria: DEMO_STARTED com protocolo auditado ativo\n`
  doc += `--------------------------------------------------------------------------------\n\n`

  doc += `## VISÃO GERAL DA SOLUÇÃO\n\n`
  doc += `O ORBIS.UOS transforma a frota pública que já circula pela cidade (ônibus, viaturas municipais\n`
  doc += `e caminhões de coleta) em uma rede contínua de sensores viários (Zero CAPEX). Através do Motor ORBIS DSP,\n`
  doc += `amostras de irregularidade longitudinal (IRI), aceleração vertical Z e anomalias são processadas\n`
  doc += `com escudo anti-falso-positivo (Fator F ≥ 3) e k-anonimato territorial em células H3 (LGPD Art. 12),\n`
  doc += `gerando ordens de serviço preditivas que reduzem o custo de recapeamento em até 68%.\n\n`

  doc += `================================================================================\n`
  doc += `SLIDES E ETAPAS DO TOUR DEMONSTRATIVO\n`
  doc += `================================================================================\n\n`

  options.steps.forEach((step, idx) => {
    const complement = DEMO_STEPS_COMPLEMENTS[step.id]

    doc += `### ETAPA ${step.id} DE ${options.steps.length}: ${step.title.toUpperCase()}\n`
    doc += `Tema: ${step.institutionalTitle}\n`
    doc += `Amparo Legal: [${step.legalBadge}]\n\n`

    doc += `1. CONTEXTO INSTITUCIONAL & BENEFÍCIOS AO ERÁRIO:\n`
    step.institutionalSentences.forEach((sentence) => {
      doc += `   • ${sentence}\n`
    })
    doc += `\n`

    doc += `2. PARÂMETROS E INDICADORES AUDITADOS:\n`
    step.keyMetrics.forEach((m) => {
      doc += `   - ${m.label}: ${m.value} (${m.desc})\n`
    })
    doc += `\n`

    if (complement) {
      if (complement.narrativaGrafica) {
        doc += `3. NARRATIVA DO ELEMENTO VISUAL / GRÁFICO:\n`
        doc += `   ${complement.narrativaGrafica}\n\n`
      }
      if (complement.interpretacaoTendencia) {
        doc += `4. ANÁLISE DE TENDÊNCIA & ACESSIBILIDADE:\n`
        doc += `   ${complement.interpretacaoTendencia}\n\n`
      }
      if (complement.aspectosTecnicos && complement.aspectosTecnicos.length > 0) {
        doc += `5. ESPECIFICAÇÕES TÉCNICAS RELEVANTES:\n`
        complement.aspectosTecnicos.forEach((asp) => {
          doc += `   - ${asp.chave}: ${asp.valor}\n`
        })
        doc += `\n`
      }
    }

    if (idx < options.steps.length - 1) {
      doc += `--------------------------------------------------------------------------------\n\n`
    }
  })

  doc += `\n================================================================================\n`
  doc += `ENCERRAMENTO INSTITUCIONAL & PRÓXIMOS PASSOS\n`
  doc += `================================================================================\n`
  doc += `1. Realização do Enquadramento CPSI Oficial (6 blocos com memória de cálculo);\n`
  doc += `2. Emissão da Minuta de Empenho vinculada ao Art. 320 do CTB;\n`
  doc += `3. Assinatura do Termo de Cooperação Técnica para início do Piloto de 30 dias (Zero CAPEX).\n\n`
  doc += `RODAPÉ OFICIAL:\n`
  doc += `${INSTITUTIONAL_FOOTER_TEXT}\n`

  return doc
}

/**
 * Dispara o download no navegador do arquivo de texto estruturado (.md ou .txt)
 */
export function downloadDemoTextFile(
  options: ExportDemoOptions,
  filename = 'roteiro-demonstracao-orbis-uos.md',
): void {
  const text = generateDemoMarkdown(options)
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 2. Exportação em Apresentação / PDF via Navegador (A4 Paisagem Dark Navy)
 * Renderiza em nova janela com visual idêntico ao Dark Navy do ORBIS.UOS e CSS @media print
 */
export async function generateDemoPresentationPdf(
  options: ExportDemoOptions,
): Promise<{ hash: string; protocolo: string }> {
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
  const protocolo = `ORBIS-DEMO-SLIDES-${agora.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  // 1. Obter a logo oficial processada em DataURL
  const logoDataUrl = await getOrbisLogoDataUrl()

  const responsavel = options.responsavelNome || 'Acesso Técnico / Apresentação Institucional'
  const municipio = options.municipio || 'Curitiba/PR (Malha de Referência)'

  // 2. Hash SHA-256 de integridade criptográfica
  const hashPayload = {
    tipo: 'SLIDES_DEMONSTRACAO_EXECUTIVA_B2G',
    protocolo,
    emissaoIso: agora.toISOString(),
    totalSlides: options.steps.length,
    municipio,
    responsavel,
    etapas: options.steps.map((s) => ({
      id: s.id,
      titulo: s.title,
      badge: s.legalBadge,
    })),
  }
  const hashSha256 = await computeSha256(hashPayload)

  // 3. Montar slides HTML no padrão A4 Paisagem Dark Navy
  const slidesHtml = options.steps
    .map((step) => {
      const comp = DEMO_STEPS_COMPLEMENTS[step.id] || {}

      const metricsHtml = step.keyMetrics
        .map(
          (m) => `
          <div class="metric-card">
            <div class="metric-label">${sanitizeHtml(m.label)}</div>
            <div class="metric-value">${sanitizeHtml(m.value)}</div>
            <div class="metric-desc">${sanitizeHtml(m.desc)}</div>
          </div>
        `,
        )
        .join('')

      const sentencesHtml = step.institutionalSentences
        .map(
          (s) => `
          <div class="sentence-item">
            <span class="bullet-dot"></span>
            <span>${sanitizeHtml(s)}</span>
          </div>
        `,
        )
        .join('')

      const technicalAspectsHtml =
        comp.aspectosTecnicos && comp.aspectosTecnicos.length > 0
          ? `
            <div class="aspects-box">
              <div class="aspects-title">Destaques Técnicos & Operacionais:</div>
              <div class="aspects-grid">
                ${comp.aspectosTecnicos
                  .map(
                    (asp) => `
                  <div class="aspect-pill">
                    <span class="aspect-key">${sanitizeHtml(asp.chave)}:</span>
                    <span class="aspect-val">${sanitizeHtml(asp.valor)}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
          `
          : ''

      return `
      <section class="slide-page">
        <!-- Top Running Header -->
        <header class="slide-header">
          <div class="header-left">
            <img src="${logoDataUrl}" alt="ORBIS UOS" class="header-logo">
            <div class="header-brand">
              <span class="brand-title">ORBIS.UOS</span>
              <span class="brand-sub">GovTech B2G · Demonstração Técnica</span>
            </div>
          </div>
          <div class="header-right">
            <span class="step-badge">Slide ${step.id} de ${options.steps.length}</span>
            <span class="legal-badge">${sanitizeHtml(step.legalBadge)}</span>
          </div>
        </header>

        <!-- Slide Content Body -->
        <div class="slide-content">
          <div class="title-container">
            <div class="eyebrow-text">Etapa ${step.id} · ${sanitizeHtml(step.title)}</div>
            <h2 class="slide-title">${sanitizeHtml(step.institutionalTitle)}</h2>
          </div>

          <!-- Main 2-Column Split (Left: Narrative & Graphs, Right: Key Metrics & Technical Aspects) -->
          <div class="slide-grid">
            <!-- Left Column: Contexto Institucional & Narrativa dos Gráficos -->
            <div class="left-col">
              <div class="block-card">
                <div class="block-header">
                  <span class="block-icon">⚖</span>
                  <span class="block-title">Contexto Institucional & Nexo com o Erário Público</span>
                </div>
                <div class="sentences-list">
                  ${sentencesHtml}
                </div>
              </div>

              ${
                comp.narrativaGrafica
                  ? `
                <div class="block-card card-accent-blue">
                  <div class="block-header">
                    <span class="block-icon">📊</span>
                    <span class="block-title">Elemento Visual & Narrativa do Gráfico</span>
                  </div>
                  <p class="narrative-text">${sanitizeHtml(comp.narrativaGrafica)}</p>
                </div>
              `
                  : ''
              }

              ${
                comp.interpretacaoTendencia
                  ? `
                <div class="block-card card-accent-green">
                  <div class="block-header">
                    <span class="block-icon">📈</span>
                    <span class="block-title">Interpretação da Tendência & Acessibilidade</span>
                  </div>
                  <p class="narrative-text">${sanitizeHtml(comp.interpretacaoTendencia)}</p>
                </div>
              `
                  : ''
              }
            </div>

            <!-- Right Column: Métricas-Chave e Parâmetros de Engenharia -->
            <div class="right-col">
              <div class="metrics-section-title">Parâmetros & Indicadores Auditados</div>
              <div class="metrics-grid">
                ${metricsHtml}
              </div>

              ${technicalAspectsHtml}

              <div class="callout-card">
                <div class="callout-header">
                  <span class="callout-icon">🛡</span>
                  <span class="callout-title">Blindagem de Conformidade</span>
                </div>
                <div class="callout-body">
                  Conformidade com o Marco Legal das Startups (LC 182/2021), Art. 320 do CTB,
                  Art. 12 da LGPD e Lei do Governo Digital (Lei 14.129/2021).
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide Footer -->
        <footer class="slide-footer">
          <div class="footer-left">
            <span>${INSTITUTIONAL_FOOTER_TEXT}</span>
          </div>
          <div class="footer-right">
            <span>Protocolo: <code>${protocolo}</code></span>
            <span class="footer-separator">·</span>
            <span>Ref: ${sanitizeHtml(municipio)}</span>
          </div>
        </footer>
      </section>
    `
    })
    .join('')

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Apresentacao-Demonstracao-ORBIS-UOS-${agora.getFullYear()}</title>
  <style>
    /* Configuração A4 Paisagem (Landscape) para slides de apresentação B2G */
    @page {
      size: A4 landscape;
      margin: 8mm 10mm 8mm 10mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      background: #070D1F;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.45;
    }

    /* Barra de Ações Topo na Tela (oculta na impressão) */
    .screen-actions-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0A1128;
      border-bottom: 2px solid #1A2A5A;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .screen-actions-bar .info {
      font-size: 12px;
      color: #94A3B8;
    }
    .screen-actions-bar .info b {
      color: #FFFFFF;
    }
    .screen-actions-bar .actions {
      display: flex;
      gap: 12px;
    }
    .btn-print {
      background: #3B82F6;
      color: #FFFFFF;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .btn-print:hover {
      background: #2563EB;
    }
    .btn-close {
      background: #101B3A;
      color: #CBD5E1;
      border: 1px solid #1A2A5A;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-close:hover {
      background: #1A2A5A;
      color: #FFFFFF;
    }

    /* Container de cada Slide */
    .slide-page {
      width: 100%;
      min-height: 190mm; /* A4 Landscape height é ~210mm menos margens */
      max-height: 194mm;
      background: #070D1F;
      border: 1.5px solid #1A2A5A;
      border-radius: 12px;
      margin: 12px auto 24px auto;
      padding: 18px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      position: relative;
      overflow: hidden;
    }

    /* Slide Capa Institucional */
    .slide-cover {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 190mm;
      max-height: 194mm;
      background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.15) 0%, rgba(10, 17, 40, 0.95) 50%, #070D1F 100%);
      border: 2px solid #3B82F6;
      border-radius: 12px;
      margin: 12px auto 24px auto;
      padding: 32px 36px;
      page-break-after: always;
      break-after: page;
    }
    .cover-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #1A2A5A;
      padding-bottom: 16px;
    }
    .cover-logo-lg {
      height: 48px;
      max-width: 220px;
      object-fit: contain;
    }
    .cover-pill {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #60A5FA;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cover-main {
      margin: 28px 0;
    }
    .cover-tagline {
      color: #38BDF8;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .cover-main-title {
      font-size: 32px;
      font-weight: 900;
      color: #F8FAFC;
      line-height: 1.15;
      margin: 0 0 14px 0;
      letter-spacing: -0.5px;
    }
    .cover-sub {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.5;
      max-width: 820px;
      margin: 0;
    }
    .cover-meta-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 24px;
    }
    .cover-meta-card {
      background: rgba(16, 27, 58, 0.6);
      border: 1px solid #1A2A5A;
      border-radius: 8px;
      padding: 10px 14px;
    }
    .cover-meta-card .lbl {
      font-size: 9.5px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .cover-meta-card .val {
      font-size: 12px;
      font-weight: 700;
      color: #F8FAFC;
      margin-top: 3px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
    }
    .cover-bottom {
      border-top: 1.5px solid #1A2A5A;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #64748B;
    }
    .cover-bottom strong {
      color: #94A3B8;
    }

    /* Running Header dos Slides Internos */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1A2A5A;
      padding-bottom: 10px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo {
      height: 30px;
      max-width: 140px;
      object-fit: contain;
    }
    .header-brand {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 12px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 9.5px;
      color: #64748B;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .step-badge {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #60A5FA;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .legal-badge {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #10B981;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-size: 10px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 6px;
    }

    /* Corpo dos Slides */
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 10px 0 6px 0;
    }
    .title-container {
      margin-bottom: 10px;
    }
    .eyebrow-text {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #38BDF8;
      margin-bottom: 2px;
    }
    .slide-title {
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      line-height: 1.25;
    }

    /* Grid Dividido */
    .slide-grid {
      display: grid;
      grid-template-columns: 7fr 5fr;
      gap: 16px;
      align-items: stretch;
      flex: 1;
    }
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Blocos de Texto e Frases */
    .block-card {
      background: #0A1128;
      border: 1px solid #1A2A5A;
      border-radius: 8px;
      padding: 9px 12px;
    }
    .card-accent-blue {
      border-left: 3px solid #3B82F6;
      background: rgba(10, 17, 40, 0.7);
    }
    .card-accent-green {
      border-left: 3px solid #10B981;
      background: rgba(10, 17, 40, 0.7);
    }
    .block-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 5px;
    }
    .block-icon {
      font-size: 11px;
    }
    .block-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94A3B8;
    }
    .sentences-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .sentence-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 10.5px;
      line-height: 1.45;
      color: #CBD5E1;
      text-align: justify;
    }
    .bullet-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #3B82F6;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .narrative-text {
      font-size: 10px;
      line-height: 1.4;
      color: #94A3B8;
      margin: 0;
      text-align: justify;
    }

    /* Métricas */
    .metrics-section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94A3B8;
      margin-bottom: 2px;
    }
    .metrics-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .metric-card {
      background: #0A1128;
      border: 1px solid #1A2A5A;
      border-radius: 8px;
      padding: 7px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .metric-label {
      font-size: 10.5px;
      font-weight: 600;
      color: #CBD5E1;
    }
    .metric-value {
      font-size: 14px;
      font-weight: 800;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      color: #10B981;
    }
    .metric-desc {
      display: none; /* Mantido no layout para resumo */
    }

    /* Aspectos Técnicos Pílulas */
    .aspects-box {
      background: rgba(16, 27, 58, 0.5);
      border: 1px solid #1A2A5A;
      border-radius: 8px;
      padding: 7px 10px;
    }
    .aspects-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #38BDF8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .aspects-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .aspect-pill {
      font-size: 9.5px;
      display: flex;
      justify-content: space-between;
      gap: 6px;
    }
    .aspect-key {
      color: #94A3B8;
    }
    .aspect-val {
      color: #F8FAFC;
      font-weight: 600;
      text-align: right;
    }

    .callout-card {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      padding: 7px 10px;
      margin-top: auto;
    }
    .callout-header {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #10B981;
      font-weight: 700;
      font-size: 9.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .callout-icon {
      font-size: 11px;
    }
    .callout-body {
      font-size: 9.5px;
      color: #A7F3D0;
      line-height: 1.35;
    }

    /* Rodapé dos Slides */
    .slide-footer {
      border-top: 1px solid #1A2A5A;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748B;
    }
    .slide-footer code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      color: #94A3B8;
    }
    .footer-separator {
      margin: 0 4px;
      color: #334155;
    }

    /* REGRAS EXCLUSIVAS DE IMPRESSÃO */
    @media print {
      .screen-actions-bar {
        display: none !important;
      }
      body {
        background: #070D1F !important;
        color: #F8FAFC !important;
      }
      .slide-page, .slide-cover {
        margin: 0 auto !important;
        border-radius: 0 !important;
        border: 1px solid #1A2A5A !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>

  <!-- Barra de Ferramentas Visível em Tela -->
  <div class="screen-actions-bar">
    <div class="info">
      <b>ORBIS.UOS • Slides Executivos de Demonstração</b> — A4 Paisagem Dark Navy · Total de ${options.steps.length + 1} páginas
    </div>
    <div class="actions">
      <button type="button" class="btn-print" onclick="window.print()">
        <span>Imprimir / Salvar em PDF</span>
      </button>
      <button type="button" class="btn-close" onclick="window.close()">
        Fechar Janela
      </button>
    </div>
  </div>

  <!-- SLIDE 0: CAPA DA APRESENTAÇÃO -->
  <section class="slide-cover">
    <div class="cover-top">
      <img src="${logoDataUrl}" alt="ORBIS UOS" class="cover-logo-lg">
      <div class="cover-pill">Apresentação Institucional B2G</div>
    </div>

    <div class="cover-main">
      <div class="cover-tagline">Urban Operating System · Plataforma GovTech de Auditoria Viária Contínua</div>
      <h1 class="cover-main-title">Demonstração Técnica & Proposta de Valor B2G</h1>
      <p class="cover-sub">
        Roteiro executivo completo de apresentação para gestores públicos, prefeitos, secretários de obras
        e comissões de inovação CPSI. Apresenta o fluxo em 6 etapas: Diagnóstico Express, Simulador de
        Economicidade (Art. 320), Telemetria Contínua da Frota, Índices IMV/IMA com Blindagem LGPD,
        Interoperabilidade Governamental e Relatórios Oficiais com Hash Criptográfico SHA-256.
      </p>

      <div class="cover-meta-cards">
        <div class="cover-meta-card">
          <div class="lbl">Município / Piloto</div>
          <div class="val">${sanitizeHtml(municipio)}</div>
        </div>
        <div class="cover-meta-card">
          <div class="lbl">Data de Emissão</div>
          <div class="val">${dataFormatada}</div>
        </div>
        <div class="cover-meta-card">
          <div class="lbl">Protocolo Criptográfico</div>
          <div class="val">${protocolo}</div>
        </div>
        <div class="cover-meta-card">
          <div class="lbl">Base Normativa</div>
          <div class="val">LC 182/2021 · Art. 320 CTB</div>
        </div>
      </div>
    </div>

    <div class="cover-bottom">
      <div>
        <strong>ORBIS.UOS GovTech</strong> · Sensoriamento Viário Passivo Zero CAPEX · Motor ORBIS DSP
      </div>
      <div>
        Hash SHA-256: <code style="color: #38BDF8; font-size: 8.5px;">${hashSha256.substring(0, 32)}...</code>
      </div>
    </div>
  </section>

  <!-- SLIDES 1 A 6 -->
  ${slidesHtml}

</body>
</html>`

  // 4. Abrir janela limpa e disparar a impressão nativa
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error(
      'O bloqueador de pop-ups impediu a abertura da apresentação. Autorize pop-ups para este site para imprimir ou exportar os slides em PDF.',
    )
  }

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()

  // Tempo hábil para carregamento das imagens e estilos antes de disparar o print
  setTimeout(() => {
    try {
      printWindow.print()
    } catch (e) {
      console.warn('Erro ao disparar impressão automática:', e)
    }
  }, 450)

  return { hash: hashSha256, protocolo }
}
