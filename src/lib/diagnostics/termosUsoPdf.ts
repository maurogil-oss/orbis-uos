import { computeSha256, generateIntegrityProtocol, sanitizeHtml } from './pdfReport'
import { getOrbisLogoDataUrl } from './dossieArquiteturaPdf'

export interface GenerateTermosUsoOptions {
  responsavelNome?: string
  responsavelCargo?: string
  orgaoInteressado?: string
  versaoTermos?: string
}

export interface TermosUsoResult {
  protocolo: string
  hashSha256: string
  htmlContent: string
  geradoEm: Date
}

export async function generateTermosUsoPdf(
  options?: GenerateTermosUsoOptions,
): Promise<TermosUsoResult> {
  const agora = new Date()
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const horaFormatada = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const versao = options?.versaoTermos || '1.0 (Pós-Workshop 4 / Onda 1)'
  const protocolo = generateIntegrityProtocol('TERMOS', 'BR')
  const logoDataUrl = getOrbisLogoDataUrl()

  const hashPayload = {
    tipo: 'TERMOS_DE_USO_ORBIS_UOS',
    versao,
    protocolo,
    geradoEm: agora.toISOString(),
    controlador: 'ORBIS UOS GovTech Tecnologia e Mobilidade Urbana B2G',
    objeto:
      'Termos de Uso e Condições Gerais da Plataforma ORBIS UOS para Órgãos Públicos e Agentes Autorizados',
    propriedade_dados:
      'Soberania exclusiva do órgão contratante em padrões abertos (GeoJSON/PDF/CSV)',
    privacidade_lgpd_ref: 'Política de Privacidade e Retenção Estrita em /privacidade',
    responsavel: options?.responsavelNome || 'Servidor Municipal / Gabinete de Gestão',
    orgao: options?.orgaoInteressado || 'Administração Pública Municipal / Estadual',
  }

  const hashSha256 = await computeSha256(hashPayload)

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Termos-de-Uso-ORBIS-UOS-v${versao.replace(/\s+/g, '-')}</title>
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
      </style>
    </head>
    <body>

      <!-- CAPA -->
      <div class="cover">
        <div class="cover-header">
          ${
            logoDataUrl
              ? `<img src="${logoDataUrl}" alt="ORBIS.UOS" class="cover-logo" />`
              : `<div style="font-size: 20px; font-weight: 900; color: #1E3A8A; font-family: monospace;">ORBIS.UOS</div>`
          }
          <div class="cover-badge">DOC-TERMS-0001 • TERMOS DE USO B2G</div>
        </div>

        <div class="cover-body">
          <div class="cover-tagline">Marco Legal B2G & Contrato de Licenciamento Tecnológico</div>
          <h1 class="cover-title">
            Termos de Uso e Condições Gerais de Operação da Plataforma ORBIS UOS
          </h1>
          <p class="cover-subtitle">
            Instrumento jurídico regulador do uso da plataforma de inteligência de pavimento urbano,
            estabelecendo os direitos, elegibilidade institucional, regras de coleta com smartphones,
            titularidade soberana de dados públicos em formatos abertos e matriz de responsabilidades
            entre a GovTech e a Administração Pública.
          </p>

          <div class="cover-meta-grid">
            <div class="cover-meta-item">
              <strong>Protocolo de Integridade</strong>
              <span>${protocolo}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Data / Hora de Homologação</strong>
              <span>${dataFormatada} às ${horaFormatada}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Versão dos Termos</strong>
              <span>${versao}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Controlador do Sistema</strong>
              <span>ORBIS UOS GovTech Tecnologia B2G</span>
            </div>
            <div class="cover-meta-item">
              <strong>Órgão Interessado / Usuário</strong>
              <span>${sanitizeHtml(options?.orgaoInteressado || 'Administração Pública Municipal')}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Agente / Representante</strong>
              <span>${sanitizeHtml(options?.responsavelNome || 'Servidor Municipal Homologado')}</span>
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

      <!-- PÁGINA 2: CLÁUSULAS 1 A 4 -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Termos de Uso (Versão ${versao})</span>
          <span>Protocolo: ${protocolo}</span>
        </div>

        <div class="section-header">
          <span class="section-number">1</span>
          <h2 class="section-title">Identificação do Controlador e Objeto</h2>
        </div>
        <p>
          A plataforma <b>ORBIS UOS (Urban Operating System)</b> é desenvolvida e mantida pela
          <b>ORBIS UOS GovTech</b>, sociedade empresarial de base tecnológica focada no setor público
          (B2G). Estes Termos de Uso disciplinam as condições gerais de acesso, licenciamento e fruição
          dos serviços de telemetria inercial, diagnóstico de malha viária, cálculo do Índice Multicritério
          Viário (IMV), integração geoespacial H3 e gestão de ordens de serviço por prefeituras, governos
          estaduais e concessionárias autorizadas.
        </p>

        <div class="section-header">
          <span class="section-number">2</span>
          <h2 class="section-title">Elegibilidade e Contas Individuais com Papéis</h2>
        </div>
        <p>
          O uso da plataforma é estritamente restrito a <b>órgãos públicos contratantes, servidores devidamente
          autorizados</b> e agentes de campo vinculados às secretarias de obras, mobilidade, planejamento e
          fiscalização.
        </p>
        <div class="highlight-box">
          <b>Regras de Acesso e Contas Individuais:</b>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><b>Bloqueio de Auto-registro Aberto:</b> É vedada a criação pública e autônoma de contas. Todas as credenciais de acesso são geradas de forma individual e nominal por um Administrador do órgão contratante.</li>
            <li><b>Papel Administrador (admin):</b> Gestão de usuários, concessão de acessos, visualização do Modo Gabinete, acionamento de rotinas de purga e parametrizações institucionais.</li>
            <li><b>Papel Operador (operador):</b> Acesso restrito ao aplicativo de coleta de campo (DeviceMotion), monitoramento de passagens por segmento e visualizações de engenharia, sem gestão de contas de terceiros.</li>
            <li><b>Sigilo das Credenciais:</b> As credenciais são individuais e intransferíveis, respondendo o titular administrativamente pelo seu uso nos termos da Lei nº 8.429/1992 (Lei de Improbidade Administrativa).</li>
          </ul>
        </div>

        <div class="section-header">
          <span class="section-number">3</span>
          <h2 class="section-title">Uso Aceitável da Coleta em Campo (DeviceMotion)</h2>
        </div>
        <p>
          O aplicativo móvel do ORBIS UOS utiliza sensores inerciais embarcados em smartphones (acelerômetro
          e giroscópio) operando a 50 Hz para aferição de vibração mecânica e cálculo do Índice de Regularidade
          Internacional (IRI) e Fator K. Os agentes e motoristas credenciados comprometem-se a:
        </p>
        <p>
          I — Fixar o dispositivo de forma estável no veículo (suporte veicular rígido no painel ou para-brisa),
          assegurando a fidelidade do vetor de aceleração no eixo Z;<br>
          II — Não manipular o dispositivo durante a condução de veículo, em observância estrita ao Código de
          Trânsito Brasileiro (CTB);<br>
          III — Utilizar a coleta de campo exclusivamente para as finalidades públicas de fiscalização viária e
          zeladoria do município contratante.
        </p>

        <div class="section-header">
          <span class="section-number">4</span>
          <h2 class="section-title">Soberania e Propriedade dos Dados Públicos</h2>
        </div>
        <div class="success-box">
          <b>Titularidade Exclusiva do Órgão Público:</b>
          Todos os dados capturados, mapas de anomalias, índices de degradação IMV/IMA, ordens de serviço
          e relatórios gerados pertencem <b>exclusiva e soberanamente ao órgão público contratante</b>.
          A GovTech não reivindica direitos patrimoniais sobre os dados viários do município.
        </div>
        <p>
          A plataforma garante a <b>portabilidade plena</b> e exportação contínua em padrões abertos e não-proprietários
          (GeoJSON, CSV, Shapefile e relatórios em PDF com hash criptográfico SHA-256), assegurando que o ente
          público não sofra de dependência tecnológica (<i>lock-in</i>).
        </p>
      </div>

      <!-- PÁGINA 3: CLÁUSULAS 5 A 8 -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Termos de Uso (Versão ${versao})</span>
          <span>Protocolo: ${protocolo}</span>
        </div>

        <div class="section-header">
          <span class="section-number">5</span>
          <h2 class="section-title">Responsabilidades das Partes</h2>
        </div>
        <p>
          <b>I. Da ORBIS UOS GovTech:</b><br>
          a) Assegurar a disponibilidade e resiliência da infraestrutura conforme o Pacote Operacional e SLAs contratados;<br>
          b) Aplicar rotinas automatizadas diárias de purga irreversível da telemetria bruta com mais de 180 dias,
          preservando os índices agregados de pavimentação viária;<br>
          c) Manter trilha de auditoria íntegra de todos os acessos administrativos e operações críticas do sistema;<br>
          d) Garantir a conformidade com as diretrizes da LGPD (Lei nº 13.709/2018) e do Marco Legal das Startups (LC 182/2021).
        </p>
        <p>
          <b>II. Do Órgão Público Contratante e seus Usuários:</b><br>
          a) Designar formalmente os servidores administradores e operadores responsáveis pelo acesso;<br>
          b) Desativar imediatamente as contas de servidores ou colaboradores desvinculados do projeto;<br>
          c) Assegurar a legitimidade das decisões administrativas e ordens de serviço emitidas a partir dos laudos gerados;<br>
          d) Observar as recomendações técnicas de calibração do Fator K para as diferentes tipologias de veículos da frota.
        </p>

        <div class="section-header">
          <span class="section-number">6</span>
          <h2 class="section-title">Limitação de Responsabilidade</h2>
        </div>
        <p>
          O ORBIS UOS fornece subsídios técnicos de engenharia de pavimentos e priorização algorítmica para a tomada
          de decisão de zeladoria. A startup não se responsabiliza por intervenções viárias executadas em desacordo
          com as normas da ABNT/DNIT, por atrasos imputáveis a concessionárias de obras, ou por interrupções
          decorrentes de caso fortuito, força maior ou falha em redes de telecomunicações móveis de terceiros.
        </p>

        <div class="section-header">
          <span class="section-number">7</span>
          <h2 class="section-title">Proteção de Dados Pessoais (LGPD) e Trilha de Auditoria</h2>
        </div>
        <p>
          O tratamento de dados pessoais no âmbito da plataforma (restrito a credenciais de servidores públicos,
          matrícula e logs de auditoria) submete-se estritamente à <b>Política de Privacidade do ORBIS UOS</b>,
          disponível publicamente na rota <code>/privacidade</code>, cujos termos são aqui incorporados por referência.
          Todos os eventos de criação de usuários, atualização de papéis e purga de dados são formalmente
          registrados na <b>trilha de auditoria com identificação nominal do autor</b> para controle externo pelo
          Tribunal de Contas (TCE) e Controladoria Geral (CGU).
        </p>

        <div class="section-header">
          <span class="section-number">8</span>
          <h2 class="section-title">Vigência, Alterações e Foro</h2>
        </div>
        <p>
          Estes Termos de Uso vigoram por prazo indeterminado durante a vigência do contrato, convênio ou termo
          de cooperação celebrado entre o órgão público e o ORBIS UOS. Qualquer modificação substancial será
          notificada aos Administradores do órgão com antecedência mínima de 30 (trinta) dias e registrada na
          trilha de auditoria da plataforma.
        </p>
        <p>
          Fica eleito o Foro da Comarca da Capital do Estado sede do órgão contratante (ou da sede da contratante
          conforme estipulado no Contrato de Licenciamento) para dirimir controvérsias decorrentes destes Termos,
          com renúncia a qualquer outro, por mais privilegiado que seja.
        </p>

        <!-- Hash de Integridade SHA-256 -->
        <div class="hash-bar">
          <b>ASSINATURA DIGITAL & PROTOCOLO SHA-256 DO DOCUMENTO:</b><br>
          Protocolo: ${protocolo} | Hash: ${hashSha256}<br>
          Homologado em: ${dataFormatada} às ${horaFormatada} | Documento Auditável B2G
        </div>
      </div>

    </body>
    </html>
  `

  return {
    protocolo,
    hashSha256,
    htmlContent,
    geradoEm: agora,
  }
}
