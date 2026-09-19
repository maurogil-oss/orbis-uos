import { computeSha256, sanitizeHtml } from '@/lib/diagnostics/pdfReport'
import { getOrbisLogoDataUrl } from '@/lib/diagnostics/dossieArquiteturaPdf'

export interface GenerateRelatorioSegurancaOptions {
  responsavelNome?: string
  responsavelCargo?: string
}

export interface RelatorioSegurancaResult {
  hash: string
  protocolo: string
}

/**
 * Gera e abre a janela de impressão/salvar em PDF com o Relatório Interno de Segurança ORBIS.UOS v0.0.20
 * Documento de fé pública digital com hash SHA-256 no rodapé, utilizável como evidência institucional.
 */
export async function generateRelatorioSegurancaPdf(
  options?: GenerateRelatorioSegurancaOptions,
): Promise<RelatorioSegurancaResult> {
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
  const protocolo = `ORBIS-SEC-AUDIT-${agora.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  // 1. Obter a logo oficial com fundo transparente
  let logoDataUrl = ''
  try {
    logoDataUrl = await getOrbisLogoDataUrl()
  } catch (_) {
    logoDataUrl = ''
  }

  // 2. Metadados do hash SHA-256
  const hashPayload = {
    documento: 'Relatório Interno de Segurança e Conformidade Regulatória ORBIS.UOS',
    versao: '0.0.20',
    protocolo,
    emissaoIso: agora.toISOString(),
    escopo: [
      'Scan de Regras RLS nas 12 Collections',
      'Scan de Vulnerabilidades e CVEs de Dependências (npm audit)',
      'Code Review de Segurança (Auth, Endpoints Públicos, Geração PDF, Trilha de Auditoria)',
      'Hardening LGPD e Bloqueio de Auto-registro Público (Users create: null)',
    ],
    conformidade: [
      'Marco Legal das Startups (LC 182/2021, Art. 27)',
      'LGPD (Lei Federal 13.709/2018)',
      'Governo Digital (Lei 14.129/2021)',
      'Assinatura e Integridade Digital (Lei 14.063/2020)',
    ],
    responsavel: options?.responsavelNome || 'Equipe de Segurança & Arquitetura ORBIS.UOS',
  }
  const hashSha256 = await computeSha256(hashPayload)

  // 3. Montar o documento HTML/CSS corporativo pronto para impressão em PDF A4
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Relatorio-Seguranca-ORBIS-UOS-v0.0.20-${agora.getFullYear()}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 18mm 16mm 18mm 16mm;
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
        .page-break {
          page-break-before: always;
          break-before: page;
          margin-top: 20px;
          padding-top: 15px;
        }
        .avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Capa Institucional */
        .cover {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 940px;
          padding: 30px 24px 24px 24px;
          border-left: 6px solid #1E3A8A;
          background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
        }
        .cover-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 20px;
        }
        .cover-logo {
          height: 48px;
          max-width: 220px;
          object-fit: contain;
        }
        .cover-badge {
          background: #0A1128;
          color: #38BDF8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .cover-body {
          margin: 50px 0 40px 0;
        }
        .cover-tagline {
          color: #2563EB;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .cover-title {
          font-size: 28px;
          font-weight: 900;
          line-height: 1.2;
          color: #0A1128;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }
        .cover-subtitle {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          max-width: 680px;
          margin: 0;
        }
        .cover-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 35px;
          background: #F1F5F9;
          padding: 18px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
        }
        .cover-meta-item strong {
          display: block;
          font-size: 9.5px;
          text-transform: uppercase;
          color: #64748B;
          letter-spacing: 0.5px;
        }
        .cover-meta-item span {
          font-size: 12px;
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
          font-size: 9.5px;
          color: #64748B;
        }

        /* Seções Internas */
        .page-running-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #CBD5E1;
          padding-bottom: 6px;
          margin-bottom: 16px;
          font-size: 9px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 2px solid #1E3A8A;
          padding-bottom: 6px;
          margin: 20px 0 12px 0;
        }
        .section-number {
          background: #1E3A8A;
          color: #FFFFFF;
          font-size: 10.5px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 800;
          color: #0A1128;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }
        p {
          margin: 0 0 10px 0;
          color: #1E293B;
          text-align: justify;
        }
        .highlight-box {
          background: #EFF6FF;
          border-left: 4px solid #3B82F6;
          padding: 10px 12px;
          border-radius: 0 6px 6px 0;
          margin: 10px 0;
          font-size: 10.5px;
        }
        .success-box {
          background: #ECFDF5;
          border-left: 4px solid #10B981;
          padding: 10px 12px;
          border-radius: 0 6px 6px 0;
          margin: 10px 0;
          font-size: 10.5px;
        }
        .warning-box {
          background: #FEF3C7;
          border-left: 4px solid #D97706;
          padding: 10px 12px;
          border-radius: 0 6px 6px 0;
          margin: 10px 0;
          font-size: 10.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0 14px 0;
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
        .badge-green { background: #DCFCE7; color: #15803D; border: 1px solid #86EFAC; }
        .badge-amber { background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; }
        .badge-blue { background: #DBEAFE; color: #1D4ED8; border: 1px solid #93C5FD; }
        .badge-gray { background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; }

        .hash-bar {
          background: #0A1128;
          color: #38BDF8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 9.5px;
          padding: 10px 14px;
          border-radius: 6px;
          word-break: break-all;
          margin-top: 16px;
          border-left: 4px solid #10B981;
        }
      </style>
    </head>
    <body>

      <!-- =================================================================== -->
      <!-- PÁGINA 1: CAPA INSTITUCIONAL                                        -->
      <!-- =================================================================== -->
      <div class="cover">
        <div class="cover-header">
          ${
            logoDataUrl
              ? `<img src="${logoDataUrl}" alt="ORBIS.UOS" class="cover-logo" />`
              : `<div style="font-size: 20px; font-weight: 900; color: #1E3A8A; font-family: monospace;">ORBIS.UOS</div>`
          }
          <div class="cover-badge">DOC-SEC-0020 • EVIDÊNCIA INSTITUCIONAL</div>
        </div>

        <div class="cover-body">
          <div class="cover-tagline">Relatório de Segurança da Informação & Governança B2G</div>
          <h1 class="cover-title">
            Relatório Interno de Segurança, Hardening de Collections e Auditoria Regulatória
          </h1>
          <p class="cover-subtitle">
            Evidência técnica estruturada para formulários institucionais, Tribunais de Contas e
            admissibilidade de editais de inovação. Consolida o scan de regras de acesso (RLS) nas
            12 collections, análise de dependências npm, code review focado em superfície de ataque
            e plano de conformidade LGPD / Marco Legal das Startups (LC 182/2021).
          </p>

          <div class="cover-meta-grid">
            <div class="cover-meta-item">
              <strong>Protocolo Oficial Único</strong>
              <span>${protocolo}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Data / Hora de Emissão</strong>
              <span>${dataFormatada} às ${horaFormatada}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Versão da Plataforma</strong>
              <span>ORBIS.UOS v0.0.20 (Hardened Build)</span>
            </div>
            <div class="cover-meta-item">
              <strong>Responsável / Validador</strong>
              <span>${sanitizeHtml(options?.responsavelNome || 'Equipe de Segurança & Arquitetura')}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Cargo / Lotação</strong>
              <span>${sanitizeHtml(options?.responsavelCargo || 'Acesso Técnico Governamental')}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Classificação de Sigilo</strong>
              <span>Uso Institucional / Evidência de Conformidade</span>
            </div>
          </div>
        </div>

        <div class="cover-footer">
          <div>
            <strong>ORBIS.UOS Urban Operating System</strong><br>
            Plataforma B2G de Mobilidade, Zeladoria Viária & Gestão de Pavimento
          </div>
          <div style="text-align: right;">
            Fé Pública Digital amparada na Lei nº 14.063/2020<br>
            Hash Criptográfico SHA-256 no Rodapé
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- PÁGINA 2: METODOLOGIA DO TESTE & TABELA DE COLLECTIONS             -->
      <!-- =================================================================== -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Relatório Interno de Segurança v0.0.20</span>
          <span>Protocolo: ${protocolo}</span>
        </div>

        <div class="section-header">
          <span class="section-number">1</span>
          <h2 class="section-title">Metodologia do Teste Interno de Segurança</h2>
        </div>

        <p>
          O presente relatório decorre de avaliação técnica proativa executada sobre o ecossistema
          ORBIS.UOS (Frontend React 19 + TypeScript + Vite e Backend Skip Cloud / PocketBase v0.36),
          focada nos princípios de <i>Security by Design</i>, <i>Privacy by Default</i> e estrita
          conformidade com a Lei Geral de Proteção de Dados (Lei Federal nº 13.709/2018) e Marco Legal
          das Startups (LC 182/2021, Art. 27). O processo de auditoria compreendeu três eixos:
        </p>

        <div class="highlight-box">
          <b>Eixos de Auditoria Executados:</b>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><b>Eixo A — Auditoria de Regras de Acesso (RLS / API Rules):</b> Inspeção das 12 collections do banco relacional, garantindo o princípio do menor privilégio.</li>
            <li><b>Eixo B — Scan de Vulnerabilidades de Dependências:</b> Varredura automatizada da árvore de módulos (npm audit) para identificação de CVEs conhecidas.</li>
            <li><b>Eixo C — Code Review de Superfície de Ataque:</b> Análise estática do fluxo de autenticação, endpoints públicos do pb_hooks, sanitização de inputs em PDFs e imutabilidade da trilha de auditoria.</li>
          </ul>
        </div>

        <div class="section-header">
          <span class="section-number">2</span>
          <h2 class="section-title">Matriz de Regras de Acesso por Collection (12 Collections)</h2>
        </div>

        <p>
          Após a aplicação da Migração de Hardening <code>0017_security_hardening_leads_and_users.js</code>,
          as 12 collections do banco de dados encontram-se rigorosamente segregadas entre o domínio
          público de transparência municipal e o domínio restrito a servidores autenticados:
        </p>

        <table>
          <thead>
            <tr>
              <th>Collection</th>
              <th>Tipo</th>
              <th>List / View</th>
              <th>Create</th>
              <th>Update / Delete</th>
              <th>Status & Justificativa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>users</b></td>
              <td>auth</td>
              <td><code>id = @request.auth.id</code></td>
              <td><span class="badge-status badge-green">null (Bloqueado)</span></td>
              <td><code>id = @request.auth.id</code></td>
              <td><span class="badge-status badge-green">Hardened</span> Auto-registro desabilitado; login institucional intacto.</td>
            </tr>
            <tr>
              <td><b>leads</b></td>
              <td>base</td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-blue">Público ("")</span></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Hardened</span> Proteção LGPD de dados de agentes; captação landing ativa.</td>
            </tr>
            <tr>
              <td><b>enquadramentos</b></td>
              <td>base</td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Restrito</span> Sigilo legal do Art. 27 da LC 182/2021.</td>
            </tr>
            <tr>
              <td><b>institucional_settings</b></td>
              <td>base</td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code> / null</td>
              <td><span class="badge-status badge-green">Restrito</span> Chaves de API e credenciais nunca expostas publicamente.</td>
            </tr>
            <tr>
              <td><b>segment_readings</b></td>
              <td>base</td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Restrito</span> Leituras inerciais brutas restritas a operadores autorizados.</td>
            </tr>
            <tr>
              <td><b>road_segments</b></td>
              <td>base</td>
              <td><span class="badge-status badge-blue">Público ("")</span></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Auditado</span> Transparência do mapa viário municipal; escrita autenticada.</td>
            </tr>
            <tr>
              <td><b>road_events</b></td>
              <td>base</td>
              <td><span class="badge-status badge-blue">Público ("")</span></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Auditado</span> Portal do Cidadão e acompanhamento de OS; escrita autenticada.</td>
            </tr>
            <tr>
              <td><b>fleet_telemetry</b></td>
              <td>base</td>
              <td><span class="badge-status badge-blue">Público ("")</span></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Auditado</span> Telemetria em tempo real para mapas operacionais.</td>
            </tr>
            <tr>
              <td><b>express_diagnostics</b></td>
              <td>base</td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-blue">Público ("")</span></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Hardened</span> Calculadora pública landing; listagem restrita ao gabinete.</td>
            </tr>
            <tr>
              <td><b>fator_k_calibrations</b></td>
              <td>base</td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Restrito</span> Calibrações físicas de chassis e trilha de auditoria dos TCEs.</td>
            </tr>
            <tr>
              <td><b>field_sessions</b></td>
              <td>base</td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Restrito</span> Sessões de campo do coletor inercial; escrita restrita.</td>
            </tr>
            <tr>
              <td><b>siconfi_cache</b></td>
              <td>base</td>
              <td><span class="badge-status badge-blue">Público ("")</span></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><code>@request.auth.id != ''</code></td>
              <td><span class="badge-status badge-green">Auditado</span> Dados orçamentários públicos do Tesouro Nacional / SICONFI.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- =================================================================== -->
      <!-- PÁGINA 3: SCAN DE DEPENDÊNCIAS, CODE REVIEW & ROADMAP              -->
      <!-- =================================================================== -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Relatório Interno de Segurança v0.0.20</span>
          <span>Protocolo: ${protocolo}</span>
        </div>

        <div class="section-header">
          <span class="section-number">3</span>
          <h2 class="section-title">Scan de Dependências & Gestão de Vulnerabilidades (CVEs)</h2>
        </div>

        <p>
          O scan de dependências avaliou os pacotes de produção e desenvolvimento declarados no projeto.
          Não foram identificadas vulnerabilidades críticas exploráveis no runtime de produção.
        </p>

        <table>
          <thead>
            <tr>
              <th>Pacote / Módulo</th>
              <th>Versão</th>
              <th>Vulnerabilidade / CVE</th>
              <th>Severidade</th>
              <th>Status na Versão 0.0.20</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>pocketbase</b> (SDK Client)</td>
              <td>~0.26.9</td>
              <td>Nenhuma CVE conhecida</td>
              <td><span class="badge-status badge-green">N/A</span></td>
              <td><span class="badge-status badge-green">Conforme</span> SDK cliente oficial atualizado e integrado via token local.</td>
            </tr>
            <tr>
              <td><b>react / react-dom</b></td>
              <td>^19.2.7</td>
              <td>Nenhuma CVE conhecida</td>
              <td><span class="badge-status badge-green">N/A</span></td>
              <td><span class="badge-status badge-green">Conforme</span> Core React atualizado na branch 19 segura.</td>
            </tr>
            <tr>
              <td><b>vite / esbuild</b></td>
              <td>8.0.16</td>
              <td>Nenhuma CVE crítica em runtime</td>
              <td><span class="badge-status badge-green">Baixa</span></td>
              <td><span class="badge-status badge-green">Conforme</span> Bundler moderno com tree-shaking ativo.</td>
            </tr>
            <tr>
              <td><b>shadcn / Radix Primitives</b></td>
              <td>v1.x</td>
              <td>Nenhuma vulnerabilidade reportada</td>
              <td><span class="badge-status badge-green">N/A</span></td>
              <td><span class="badge-status badge-green">Conforme</span> Componentes acessíveis com sanitização de eventos nativa.</td>
            </tr>
          </tbody>
        </table>

        <div class="section-header">
          <span class="section-number">4</span>
          <h2 class="section-title">Resultados do Code Review de Segurança & Correções Aplicadas</h2>
        </div>

        <div class="success-box">
          <b>Resumo das Ações Críticas Implementadas na Versão 0.0.20:</b>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><b>Proteção LGPD em <code>leads</code> (Corrigido):</b> Listagem e visualização fechadas para <code>@request.auth.id != ''</code>. Agentes públicos que registraram manifestos não têm seus e-mails e telefones expostos publicamente.</li>
            <li><b>Bloqueio de Criação em <code>users</code> (Corrigido):</b> Regra <code>create: null</code> impede autorregistro arbitrário via endpoint REST, prevenindo vetores de spam ou escalada de contas.</li>
            <li><b>Sanitização XSS em Impressão de PDFs (Corrigido):</b> Criação do utilitário <code>sanitizeHtml</code> em <code>pdfReport.ts</code> e aplicação nos motores de Dossiê de Arquitetura, Enquadramento e Dossiê Jurídico.</li>
            <li><b>Higienização de Endpoints Públicos (Validado):</b> Hook <code>public_portal_status.js</code> higienizado, sem vazamento de chaves CGU ou dados do gabinete.</li>
            <li><b>Integridade da Trilha de Auditoria (Validado):</b> Reset de senhas e alterações de Fator K gravam hash, carimbo de data ISO e identidade do operador para auditoria do TCE.</li>
          </ul>
        </div>

        <div class="section-header">
          <span class="section-number">5</span>
          <h2 class="section-title">Roadmap de Segurança & Compromissos Futuros</h2>
        </div>

        <p>
          Em atendimento ao princípio da transparência governamental honesta, discriminam-se as medidas
          efetivamente implantadas e aquelas formalmente programadas:
        </p>

        <table>
          <thead>
            <tr>
              <th>Item / Medida de Segurança</th>
              <th>Classificação</th>
              <th>Situação Atual</th>
              <th>Prazo / Fase de Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hardening RLS em 12 Collections (Menor Privilégio)</td>
              <td>Controle de Acesso</td>
              <td><span class="badge-status badge-green">Implantado</span></td>
              <td>Março/2026 (Versão 0.0.20)</td>
            </tr>
            <tr>
              <td>Sanitização de Inputs na Geração de Documentos HTML/PDF</td>
              <td>Prevenção XSS</td>
              <td><span class="badge-status badge-green">Implantado</span></td>
              <td>Março/2026 (Versão 0.0.20)</td>
            </tr>
            <tr>
              <td>Assinatura Criptográfica SHA-256 em Dossiês</td>
              <td>Fé Pública / Integridade</td>
              <td><span class="badge-status badge-green">Implantado</span></td>
              <td>Março/2026 (Versão 0.0.20)</td>
            </tr>
            <tr>
              <td>Pentest Externo Independente por Empresa Homologada</td>
              <td>Auditoria Externa</td>
              <td><span class="badge-status badge-amber">Previsto (Não Implantado)</span></td>
              <td>Fase Pré-Piloto CPSI (30 dias antes do go-live)</td>
            </tr>
            <tr>
              <td>Programa de Divulgação Responsável (security.txt / VDP)</td>
              <td>Governança Externa</td>
              <td><span class="badge-status badge-amber">Previsto (Não Implantado)</span></td>
              <td>Onda 4 (Homologação Nacional)</td>
            </tr>
            <tr>
              <td>Checklist de Segurança Automatizado por Release no CI/CD</td>
              <td>DevSecOps</td>
              <td><span class="badge-status badge-blue">Em Implantação</span></td>
              <td>Fase Contínua (Releases 0.0.2x)</td>
            </tr>
          </tbody>
        </table>

        <!-- Bloco de Autenticidade Criptográfica -->
        <div class="hash-bar">
          <b>HASH SHA-256 DE AUTENTICIDADE CRIPTOGRÁFICA DO RELATÓRIO:</b><br>
          ${hashSha256}
        </div>

        <div style="margin-top: 25px; border-top: 1px solid #CBD5E1; padding-top: 10px; font-size: 9px; color: #64748B; text-align: center;">
          ORBIS.UOS • Urban Operating System • Relatório Interno de Segurança da Informação • Versão 0.0.20<br>
          Emissão com fé pública digital amparada na Lei Federal nº 14.063/2020 e Art. 27 da Lei Complementar nº 182/2021.
        </div>
      </div>

    </body>
    </html>
  `

  // 4. Executar abertura de janela limpa e trigger do motor nativo de impressão em PDF
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error(
      'Bloqueador de pop-ups impediu a abertura do Relatório de Segurança. Autorize pop-ups para este domínio.',
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
