import { computeSha256, sanitizeHtml } from '@/lib/diagnostics/pdfReport'
import { getOrbisLogoDataUrl } from '@/lib/diagnostics/dossieArquiteturaPdf'

export interface GeneratePacoteOperacionalOptions {
  responsavelNome?: string
  responsavelCargo?: string
  orgaoInteressado?: string
}

export interface PacoteOperacionalResult {
  hash: string
  protocolo: string
}

/**
 * Gera e abre a janela de impressão/salvar em PDF com o Pacote Operacional ORBIS.UOS v0.0.23
 * Contém os 3 documentos oficiais:
 *  1. Política de Backup e Restauração com Procedimento de Teste de Restore
 *  2. Plano de Continuidade Mínimo (RTO/RPO Declarados: 24h)
 *  3. Política de Suporte com SLA e Canal de Incidentes
 */
export async function generatePacoteOperacionalPdf(
  options?: GeneratePacoteOperacionalOptions,
): Promise<PacoteOperacionalResult> {
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
  const protocolo = `ORBIS-OPS-PKG-${agora.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  // 1. Obter a logo oficial com fundo transparente
  let logoDataUrl = ''
  try {
    logoDataUrl = await getOrbisLogoDataUrl()
  } catch (_) {
    logoDataUrl = ''
  }

  // 2. Metadados para cálculo do Hash SHA-256 de integridade e fé pública digital
  const hashPayload = {
    documento: 'Pacote Operacional Oficial — ORBIS.UOS Urban Operating System',
    versao: '0.0.23',
    protocolo,
    emissaoIso: agora.toISOString(),
    documentos: [
      {
        id: 'POL-OPS-01',
        titulo: 'Política de Backup e Restauração',
        infraestrutura: 'Skip Cloud / PocketBase Gerenciado (SQLite WAL)',
        frequencia: 'Diário automatizado com snapshots consistentes',
        testeRestore: {
          status: 'Previsto (Não Implantado)',
          dataAlvo: 'Fase Pré-Piloto CPSI (30 dias antes do go-live com órgão cliente)',
          procedimentoFases: 5,
        },
      },
      {
        id: 'PLN-OPS-02',
        titulo: 'Plano de Continuidade Mínimo',
        rto_horas: 24,
        rpo_horas: 24,
        cenariosContingencia: [
          'Indisponibilidade de infraestrutura Skip Cloud',
          'Indisponibilidade de APIs federais (SICONFI / Tesouro e CGU Fiscaliza SG)',
          'Perda de conectividade celular em campo (coleta offline no dispositivo móvel)',
        ],
        slaComunicacaoClienteHoras: 4,
      },
      {
        id: 'POL-OPS-03',
        titulo: 'Política de Suporte Técnico, SLAs e Gestão de Incidentes',
        canalOficial: 'contato@orbis-uos.gov.br',
        horarioAtendimento: 'Segunda a Sexta-feira, das 08h00 às 18h00 (Horário de Brasília - BRT)',
        niveisSla: {
          P1_critico: 'Resposta em até 4 horas úteis',
          P2_alto: 'Resposta em até 8 horas úteis',
          P3_medio_baixo: 'Resposta em até 2 dias úteis',
        },
        integracaoLgpd: 'Artigo 48 da Lei 13.709/2018 (conforme publicado na rota /privacidade)',
      },
    ],
    responsavel: options?.responsavelNome || 'Acesso Institucional / Avaliação Governamental',
    orgao: options?.orgaoInteressado || 'Administração Pública Municipal / Estadual',
  }

  const hashSha256 = await computeSha256(hashPayload)

  // 3. Montar o documento HTML/CSS corporativo pronto para impressão em PDF A4
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Pacote-Operacional-ORBIS-UOS-v0.0.23-${agora.getFullYear()}</title>
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
          height: 46px;
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
          margin: 45px 0 35px 0;
        }
        .cover-tagline {
          color: #2563EB;
          font-size: 11.5px;
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
          font-size: 11.5px;
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
          margin: 18px 0 10px 0;
        }
        .section-number {
          background: #1E3A8A;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .section-title {
          font-size: 13.5px;
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
        .badge-green { background: #DCFCE7; color: #15803D; border: 1px solid #86EFAC; }
        .badge-amber { background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; }
        .badge-blue { background: #DBEAFE; color: #1D4ED8; border: 1px solid #93C5FD; }
        .badge-gray { background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; }

        .hash-bar {
          background: #0A1128;
          color: #38BDF8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 9px;
          padding: 10px 14px;
          border-radius: 6px;
          word-break: break-all;
          margin-top: 16px;
          border-left: 4px solid #10B981;
        }

        .step-list {
          margin: 6px 0 10px 0;
          padding: 0;
          list-style: none;
        }
        .step-item {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }
        .step-badge {
          background: #1E3A8A;
          color: #FFF;
          font-weight: bold;
          font-size: 9px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
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
          <div class="cover-badge">DOC-OPS-0023 • PACOTE OPERACIONAL</div>
        </div>

        <div class="cover-body">
          <div class="cover-tagline">Governança B2G & Garantia de Sustentação Operacional</div>
          <h1 class="cover-title">
            Pacote Operacional de Continuidade, Resiliência, Backups e Acordos de Nível de Serviço (SLA)
          </h1>
          <p class="cover-subtitle">
            Instrumento técnico oficial destinado a órgãos da Administração Pública contratante,
            prefeituras conveniadas, Procuradorias Municipais e Tribunais de Contas. Consolida a
            Política de Backup e Restauração com passo a passo de teste de restore, Plano de Continuidade
            Mínimo com RTO/RPO declarados e Política de Suporte com matriz de criticidade de incidentes.
          </p>

          <div class="cover-meta-grid">
            <div class="cover-meta-item">
              <strong>Protocolo Oficial do Documento</strong>
              <span>${protocolo}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Data / Hora de Geração</strong>
              <span>${dataFormatada} às ${horaFormatada}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Versão & Release do Produto</strong>
              <span>ORBIS.UOS v0.0.23 (Pacote Operacional Homologado)</span>
            </div>
            <div class="cover-meta-item">
              <strong>Responsável / Validador</strong>
              <span>${sanitizeHtml(options?.responsavelNome || 'Acesso Institucional / Avaliação Técnica')}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Lotação / Cargo Declarado</strong>
              <span>${sanitizeHtml(options?.responsavelCargo || 'Servidor Municipal / Acesso Governamental')}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Classificação de Acesso</strong>
              <span>Público Institucional (Art. 8º da LAI nº 12.527/2011)</span>
            </div>
          </div>
        </div>

        <div class="cover-footer">
          <div>
            <strong>ORBIS.UOS Urban Operating System</strong><br>
            Plataforma B2G de Mobilidade, Zeladoria Viária & Gestão de Pavimento
          </div>
          <div style="text-align: right;">
            Fé Pública Digital amparada na Lei Federal nº 14.063/2020<br>
            Autenticidade Criptográfica SHA-256 no Rodapé
          </div>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- PÁGINA 2: POLÍTICA DE BACKUP E RESTAURAÇÃO                         -->
      <!-- =================================================================== -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Pacote Operacional v0.0.23</span>
          <span>Protocolo: ${protocolo}</span>
        </div>

        <div class="section-header">
          <span class="section-number">1</span>
          <h2 class="section-title">Documento 1: Política de Backup e Restauração de Dados</h2>
        </div>

        <p>
          A plataforma <b>ORBIS.UOS</b> opera em ambiente gerenciado de computação em nuvem <b>Skip Cloud</b>
          (PocketBase v0.36 sobre SQLite em modo WAL — <i>Write-Ahead Logging</i>). A integridade e
          recuperabilidade de dados viários, calibrações de sensores, parametrizações do município e
          enquadramentos orçamentários constituem requisito de sustentação contínua do contrato B2G.
        </p>

        <div class="highlight-box">
          <b>Escopo e Arquitetura de Backup Gerenciado:</b>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><b>Base Relacional & Metadados:</b> Snapshots diários completos do banco de dados relacional e migrações persistidas em armazenamento em nuvem com criptografia AES-256 em repouso.</li>
            <li><b>Volumes de Mídia e Arquivos:</b> Cópia incremental contínua do diretório de assets, avatares e evidências de vias públicas.</li>
            <li><b>Imutabilidade de Migrações:</b> Código das migrações (0001 a 0019) rastreado com controle de versão imutável, garantindo reconstituição determística da base.</li>
            <li><b>Frequência Declarada:</b> Snapshots automáticos a cada 24 horas (janela da madrugada: 03h00 BRT).</li>
          </ul>
        </div>

        <div class="section-header">
          <span class="section-number">1.1</span>
          <h2 class="section-title">Procedimento Operacional de Teste de Restore (Passo a Passo)</h2>
        </div>

        <p>
          O restabelecimento de serviço segue um procedimento padronizado em 5 etapas para evitar
          corrupção de dados ou regressões de schema em produção:
        </p>

        <ul class="step-list">
          <li class="step-item">
            <span class="step-badge">1</span>
            <div>
              <b>Fase 1 — Isolamento do Incidente & Congelamento de Produção:</b> Corte de tráfego de gravação externa via manutenção programada (status HTTP 503 com tela explicativa institucional) para assegurar que nenhuma nova transação fique pendente no banco antes da verificação.
            </div>
          </li>
          <li class="step-item">
            <span class="step-badge">2</span>
            <div>
              <b>Fase 2 — Provisionamento de Instância Staging de Recuperação:</b> Criação de réplica idêntica e isolada da infraestrutura na nuvem (ambiente de homologação <code>staging</code>) com o mesmo release do PocketBase, sem impacto na base primária.
            </div>
          </li>
          <li class="step-item">
            <span class="step-badge">3</span>
            <div>
              <b>Fase 3 — Aplicação do Snapshot de Backup:</b> Descompactação do arquivo de snapshot mais recente e carregamento das tabelas SQLite. Validação do WAL check com execução de <code>PRAGMA integrity_check</code> e <code>PRAGMA quick_check</code> para atestar ausência de blocos corrompidos.
            </div>
          </li>
          <li class="step-item">
            <span class="step-badge">4</span>
            <div>
              <b>Fase 4 — Verificação de Integridade Referencial & SHA-256:</b> Auditoria de amostras das collections essenciais (<code>users</code>, <code>institucional_settings</code>, <code>fator_k_calibrations</code>, <code>road_segments</code>) comparando a contagem de registros e checagem de hashes criptográficos prévios.
            </div>
          </li>
          <li class="step-item">
            <span class="step-badge">5</span>
            <div>
              <b>Fase 5 — Reapontamento de Tráfego ou Rollback Seguro:</b> Validadas as 4 fases anteriores, o roteamento de tráfego DNS/Edge é redirecionado à instância restabelecida. Caso qualquer teste falhe, mantém-se a contingência e aciona-se snapshot anterior (D-1).
            </div>
          </li>
        </ul>

        <div class="warning-box">
          <b>Declaração de Transparência Institucional — Status do Teste de Restore:</b><br>
          <b>Situação Atual:</b> <span class="badge-status badge-amber">Previsto (Não Implantado)</span><br>
          <b>Periodicidade Obrigatória Programada:</b> Semestral (a cada 6 meses) com emissão de Relatório de Simulação.<br>
          <b>Data-Alvo da 1ª Execução Oficial:</b> <b>Fase Pré-Piloto CPSI (30 dias antes do go-live com o primeiro órgão cliente conveniado)</b>.<br>
          <b>Registro em Trilha de Auditoria:</b> O resultado, horário, tempos aferidos e responsável pela simulação serão persistidos de forma permanente na collection <code>institucional_settings</code>, com visibilidade para fiscalização do Tribunal de Contas do Estado (TCE) e CGU.
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- PÁGINA 3: PLANO DE CONTINUIDADE MÍNIMO                             -->
      <!-- =================================================================== -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Pacote Operacional v0.0.23</span>
          <span>Protocolo: ${protocolo}</span>
        </div>

        <div class="section-header">
          <span class="section-number">2</span>
          <h2 class="section-title">Documento 2: Plano de Continuidade de Negócio Mínimo (PCN)</h2>
        </div>

        <p>
          O Plano de Continuidade visa garantir a manutenção das funções vitais da plataforma ORBIS.UOS
          durante incidentes graves de infraestrutura, desastres lógicos ou interrupções de redes públicas.
        </p>

        <table>
          <thead>
            <tr>
              <th>Parâmetro Operacional</th>
              <th>Valor Declarado</th>
              <th>Significado Técnico para o Município</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>RTO (Recovery Time Objective)</b><br>Tempo Máximo de Restabelecimento</td>
              <td><span class="badge-status badge-blue">Até 24 horas</span></td>
              <td>Em caso de falha catastrófica no data center principal, o serviço completo da plataforma será restabelecido em ambiente redundante dentro do prazo limite de 24 horas.</td>
            </tr>
            <tr>
              <td><b>RPO (Recovery Point Objective)</b><br>Tolerância Máxima de Perda de Dados</td>
              <td><span class="badge-status badge-blue">Até 24 horas</span></td>
              <td>O ponto de restauração admitido corresponde ao snapshot do ciclo anterior (janela diária de backup). Leituras em campo retidas localmente em dispositivos móveis não sofrem perda por operarem em modo <i>offline-first</i>.</td>
            </tr>
            <tr>
              <td><b>SLA de Notificação de Incidente Crítico</b></td>
              <td><span class="badge-status badge-green">Até 4 horas úteis</span></td>
              <td>Prazo formal para emissão do primeiro Comunicado de Incidente aos gestores indicados pelo órgão contratante.</td>
            </tr>
          </tbody>
        </table>

        <div class="section-header">
          <span class="section-number">2.1</span>
          <h2 class="section-title">Cenários de Contingência Mapeados & Estratégias de Mitigação</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Cenário de Risco</th>
              <th>Probabilidade / Impacto</th>
              <th>Estratégia Técnica de Mitigação Aplicada</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Cenário A: Indisponibilidade de Provedor de Nuvem (Skip Cloud / PocketBase)</b></td>
              <td>Baixa / Alto</td>
              <td>Exportação de snapshot estruturado com espelhamento em repositório secundário. Procedimento de reconstituição rápida da API através das migrações declarativas (<code>pocketbase/migrations/</code>) e runtime SQLite universal.</td>
            </tr>
            <tr>
              <td><b>Cenário B: Falha ou Indisponibilidade de APIs Federais (SICONFI / Tesouro Nacional ou CGU)</b></td>
              <td>Média / Médio</td>
              <td><b>Mitigação por Cache Persistido:</b> A plataforma utiliza a collection <code>siconfi_cache</code> e buffers em <code>institucional_settings</code>. Painéis do Modo Gabinete continuam operacionais exibindo o último snapshot contábil autenticado com aviso de <i>fallback local</i>.</td>
            </tr>
            <tr>
              <td><b>Cenário C: Perda de Conectividade Celular em Campo (Sombra de Sinal 4G/5G)</b></td>
              <td>Alta / Baixo</td>
              <td><b>Arquitetura Offline-First no Coletor:</b> O aplicativo de telemetria veicular armazena as amostras DeviceMotion e coordenadas GPS na memória volátil/IndexedDB do smartphone. Assim que o sinal for restabelecido, os lotes agregados são sincronizados sem perda de dados.</td>
            </tr>
          </tbody>
        </table>

        <div class="section-header">
          <span class="section-number">2.2</span>
          <h2 class="section-title">Protocolo de Comunicação e Transparência com o Órgão Cliente</h2>
        </div>

        <p>
          Em caso de acionamento do Plano de Continuidade, o canal oficial de comunicação externa emitirá
          três boletins formais assinados ao Gestor do Contrato do município:
        </p>

        <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 10px; color: #334155;">
          <li><b>Boletim Inicial (em até 4h da detecção):</b> Confirmação do incidente, serviços afetados, medidas de contenção ativadas e previsão de restabelecimento.</li>
          <li><b>Boletins Intermediários (a cada 8h durante o evento):</b> Status do procedimento de restauração e atualização do cronograma.</li>
          <li><b>Relatório Conclusivo de Encerramento (em até 48h após a normalização):</b> Causa-raiz técnica (RCA), volume de dados afetados, conformidade com o RTO/RPO e plano de prevenção contra reincidência.</li>
        </ul>
      </div>

      <!-- =================================================================== -->
      <!-- PÁGINA 4: POLÍTICA DE SUPORTE E INCIDENTES                         -->
      <!-- =================================================================== -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Pacote Operacional v0.0.23</span>
          <span>Protocolo: ${protocolo}</span>
        </div>

        <div class="section-header">
          <span class="section-number">3</span>
          <h2 class="section-title">Documento 3: Política de Suporte Técnico, SLAs e Canal de Incidentes</h2>
        </div>

        <p>
          A sustentação operacional do ORBIS.UOS contempla atendimento técnico contínuo para suporte a
          servidores municipais, secretarias de obras, gabinetes do executivo e operadores em campo.
        </p>

        <div class="highlight-box">
          <b>Canais Oficiais de Atendimento & Horário de Funcionamento:</b>
          <div style="margin-top: 5px; font-size: 10.5px;">
            • <b>Canal Oficial de E-mail de Incidentes:</b> <code style="font-weight: bold; color: #1D4ED8;">contato@orbis-uos.gov.br</code> (canal padronizado e unificado com a Política de Privacidade)<br>
            • <b>Horário Padrão de Atendimento:</b> Segunda a Sexta-feira, das 08h00 às 18h00 (Horário Oficial de Brasília - BRT), exceto feriados nacionais.<br>
            • <b>Plantão de Monitoramento P1:</b> Monitoramento automatizado de disponibilidade 24x7 para eventos de parada crítica do serviço.
          </div>
        </div>

        <div class="section-header">
          <span class="section-number">3.1</span>
          <h2 class="section-title">Matriz de Severidade e Acordos de Nível de Serviço (SLA)</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Severidade</th>
              <th>Definição Operacional</th>
              <th>SLA de Primeira Resposta</th>
              <th>Meta de Resolução / Mitigação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge-status" style="background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5;">P1 — Crítico</span></td>
              <td><b>Indisponibilidade Total da Plataforma</b> ou <b>Incidente de Segurança / Vazamento de Dados</b>. Afeta a operação integral de todos os usuários ou compromete a integridade do banco.</td>
              <td><b>Até 4 horas úteis</b> (Confirmação e equipe técnica em contenção)</td>
              <td><b>Até 24 horas</b> (Conforme RTO do Plano de Continuidade)</td>
            </tr>
            <tr>
              <td><span class="badge-status badge-amber">P2 — Alto</span></td>
              <td><b>Degradação de Função Crítica</b> sem parada total (ex.: falha de geração do Dossiê de Arquitetura, erro no cálculo de IMV/IMA de um corredor ou perda de sincronização da frota).</td>
              <td><b>Até 8 horas úteis</b></td>
              <td><b>Até 48 horas úteis</b> (Aplicação de hotfix ou contorno documentado)</td>
            </tr>
            <tr>
              <td><span class="badge-status badge-blue">P3 — Médio / Baixo</span></td>
              <td><b>Dúvidas Operacionais, Ajustes Cadastrais ou Sugestões de Melhoria</b> (ex.: redefinição de perfil de fiscal, calibragem de filtro de visualização ou suporte à navegação).</td>
              <td><b>Até 2 dias úteis</b> (48 horas úteis)</td>
              <td>Planejada na sprint subsequente de produto</td>
            </tr>
          </tbody>
        </table>

        <div class="section-header">
          <span class="section-number">3.2</span>
          <h2 class="section-title">Integração com o Procedimento de Incidentes de Segurança (Art. 48 LGPD)</h2>
        </div>

        <p>
          Qualquer ocorrência classificada como <b>Incidente de Segurança com Dados Pessoais</b> (ex.:
          exposição inadvertida de contatos institucionais de servidores) segue rigorosamente o
          <b>Protocolo Operacional Contínuo em 4 Fases do Art. 48 da LGPD</b> publicado publicamente na
          rota <code>/privacidade</code> (Seção 5):
        </p>

        <div class="success-box">
          <b>Harmonização Regulatória com a Política de Privacidade:</b>
          <div style="font-size: 10px; margin-top: 4px;">
            • <b>Fase 1 (0h a 4h):</b> Detecção, triage e ativação do Comitê de Incidentes;<br>
            • <b>Fase 2 (Imediata):</b> Contenção, isolamento e revogação preventiva de credenciais;<br>
            • <b>Fase 3 (Até 48h):</b> Avaliação de risco aos titulares e determinação de dados atingidos;<br>
            • <b>Fase 4 (Prazo Razoável):</b> Notificação formal à Autoridade Nacional de Proteção de Dados (ANPD) e aos titulares afetados quando houver risco relevante.<br>
            <i>Nota: Evita-se duplicidade normativa — a íntegra dos fluxos de titular e DPO permanece soberana na página /privacidade.</i>
          </div>
        </div>

        <div class="section-header">
          <span class="section-number">3.3</span>
          <h2 class="section-title">Livro de Registro de Incidentes & Prestação de Contas ao TCE</h2>
        </div>

        <p>
          Todos os incidentes operacionais P1 e P2, bem como simulações de contingência, são lavrados no
          <b>Livro Digital de Registro de Incidentes</b> mantido pela equipe de engenharia e governança.
          Cada lançamento contém data, horário, severidade, tempo de resposta, tempo de resolução, causa-raiz
          e hash criptográfico para fiscalização dos órgãos de controle interno e Tribunais de Contas.
        </p>

        <!-- Bloco de Autenticidade Criptográfica -->
        <div class="hash-bar">
          <b>HASH SHA-256 DE AUTENTICIDADE CRIPTOGRÁFICA DO PACOTE OPERACIONAL:</b><br>
          ${hashSha256}
        </div>

        <div style="margin-top: 25px; border-top: 1px solid #CBD5E1; padding-top: 10px; font-size: 9px; color: #64748B; text-align: center;">
          ORBIS.UOS • Urban Operating System • Pacote Operacional Oficial • Versão 0.0.23<br>
          Emissão com fé pública digital amparada na Lei Federal nº 14.063/2020 e Art. 27 da Lei Complementar nº 182/2021.
        </div>
      </div>

    </body>
    </html>
  `

  // 4. Disparar abertura de janela para impressão / PDF nativo
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error(
      'Bloqueador de pop-ups impediu a abertura do Pacote Operacional. Autorize pop-ups para este domínio.',
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
