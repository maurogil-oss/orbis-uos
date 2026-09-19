import rawLogoUrl from '@/assets/uos-novo-d94c4.png'
import { computeSha256, sanitizeHtml } from '@/lib/diagnostics/pdfReport'

/**
 * Função auxiliar para obter a logomarca oficial com fundo transparente em formato DataURL
 */
export async function getOrbisLogoDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = rawLogoUrl

      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width
          const h = img.naturalHeight || img.height
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (!ctx) {
            resolve(rawLogoUrl)
            return
          }
          ctx.drawImage(img, 0, 0)
          const imgData = ctx.getImageData(0, 0, w, h)
          const d = imgData.data

          // Remove fundo branco / quase branco com suavização anti-aliasing
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i]
            const g = d[i + 1]
            const b = d[i + 2]
            const minC = Math.min(r, g, b)
            const maxC = Math.max(r, g, b)
            const isWhiteish = minC > 215 && maxC - minC < 30

            if (isWhiteish) {
              if (minC >= 245) {
                d[i + 3] = 0
              } else {
                const alphaFactor = (255 - minC) / 35
                d[i + 3] = Math.max(0, Math.min(255, Math.round(d[i + 3] * alphaFactor)))
              }
            }
          }

          ctx.putImageData(imgData, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } catch {
          resolve(rawLogoUrl)
        }
      }

      img.onerror = () => {
        resolve(rawLogoUrl)
      }
    } catch {
      resolve(rawLogoUrl)
    }
  })
}

export interface GenerateDossieArquiteturaOptions {
  responsavelNome?: string
  responsavelCargo?: string
  municipioReferencia?: string
}

/**
 * Gera e abre a janela de impressão/salvar em PDF com o Dossiê Completo de Arquitetura Técnica ORBIS.UOS v2.1
 */
export async function generateDossieArquiteturaPdf(
  options?: GenerateDossieArquiteturaOptions,
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
  const protocolo = `ORBIS-DOSSIE-ARQ-2.1-${agora.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  // 1. Obter a logo oficial processada
  const logoDataUrl = await getOrbisLogoDataUrl()

  // 2. Calcular o Hash SHA-256 do documento
  const hashPayload = {
    documento: 'Dossiê de Arquitetura ORBIS UOS',
    versao: '2.1 Homologada',
    protocolo,
    emissaoIso: agora.toISOString(),
    indices: ['IMM', 'IMV', 'IMA'],
    pilaresImv: ['A - IRI Estimado', 'B - Anomalias', 'C - Aderencia/Drenagem', 'D - Criticidade'],
    escudoConfianca: 'F >= 3 passagens',
    interoperabilidade: [
      'GeoJSON IMM',
      'JSON Prioridade Zero',
      'Leituras Inerciais',
      'Webhooks CIC',
    ],
    infraestrutura: 'Skip Cloud PocketBase, Migracoes Versionadas, LGPD Privacy-by-Design',
    responsavel: options?.responsavelNome || 'Acesso Público / Avaliação Institucional',
  }
  const hashSha256 = await computeSha256(hashPayload)

  // 3. Montar a folha de estilo e HTML corporativo institucional com alta legibilidade impressa
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Dossie-Arquitetura-ORBIS-UOS-v2.1-2026</title>
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
          font-size: 11.5px;
          line-height: 1.5;
        }

        /* Classes utilitárias */
        .page-break {
          page-break-before: always;
          break-before: page;
          margin-top: 25px;
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
          padding: 30px 20px 20px 20px;
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
          height: 52px;
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
          margin: 60px 0 40px 0;
        }
        .cover-tagline {
          color: #2563EB;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .cover-title {
          font-size: 32px;
          font-weight: 900;
          line-height: 1.15;
          color: #0A1128;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }
        .cover-subtitle {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          max-width: 680px;
          margin: 0;
        }
        .cover-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 40px;
          background: #F1F5F9;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
        }
        .cover-meta-item strong {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          color: #64748B;
          letter-spacing: 0.5px;
        }
        .cover-meta-item span {
          font-size: 13px;
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
          font-size: 10px;
          color: #64748B;
        }

        /* Seções e Cabeçalhos Internos */
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 2px solid #1E3A8A;
          padding-bottom: 8px;
          margin: 22px 0 14px 0;
        }
        .section-number {
          background: #1E3A8A;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 800;
          color: #0A1128;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin: 0;
        }

        /* Elementos de layout */
        p {
          margin: 0 0 10px 0;
          color: #1E293B;
          text-align: justify;
        }
        .highlight-box {
          background: #EFF6FF;
          border-left: 4px solid #3B82F6;
          padding: 10px 14px;
          border-radius: 0 6px 6px 0;
          margin: 12px 0;
          font-size: 11px;
        }
        .warning-box {
          background: #FEF3C7;
          border-left: 4px solid #D97706;
          padding: 10px 14px;
          border-radius: 0 6px 6px 0;
          margin: 12px 0;
          font-size: 11px;
        }
        .success-box {
          background: #ECFDF5;
          border-left: 4px solid #10B981;
          padding: 10px 14px;
          border-radius: 0 6px 6px 0;
          margin: 12px 0;
          font-size: 11px;
        }

        /* Tabelas */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0 16px 0;
          font-size: 10.5px;
        }
        th, td {
          border: 1px solid #CBD5E1;
          padding: 7px 9px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: #F1F5F9;
          font-weight: 800;
          color: #0A1128;
          text-transform: uppercase;
          font-size: 9.5px;
          letter-spacing: 0.5px;
        }
        tr:nth-child(even) td {
          background: #F8FAFC;
        }

        /* Cards em Grid */
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 12px 0;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin: 12px 0;
        }
        .grid-4 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 10px;
          margin: 12px 0;
        }
        .card {
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 10px 12px;
          background: #FFFFFF;
        }
        .card-navy {
          background: #0A1128;
          color: #F8FAFC;
          border-color: #1E293B;
        }
        .card-navy strong {
          color: #38BDF8;
        }

        /* Código e Hash */
        pre, code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
        }
        .code-box {
          background: #0A1128;
          color: #CBD5E1;
          padding: 10px 12px;
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 9.5px;
          margin: 8px 0;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .hash-bar {
          background: #0A1128;
          color: #38BDF8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 9.5px;
          padding: 10px 14px;
          border-radius: 6px;
          word-break: break-all;
          margin-top: 18px;
          border-left: 4px solid #10B981;
        }

        /* Cabeçalho de continuação nas páginas internas */
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
      </style>
    </head>
    <body>

      <!-- ========================================================================= -->
      <!-- PÁGINA 1: CAPA INSTITUCIONAL -->
      <!-- ========================================================================= -->
      <div class="cover">
        <div class="cover-header">
          <img src="${logoDataUrl}" alt="ORBIS UOS" class="cover-logo">
          <div class="cover-badge">METODOLOGIA v2.1 HOMOLOGADA</div>
        </div>

        <div class="cover-body">
          <div class="cover-tagline">Urban Operating System • Plataforma GovTech B2G</div>
          <h1 class="cover-title">Dossiê de Arquitetura Técnica & Metodológica</h1>
          <p class="cover-subtitle">
            Especificação formal da engenharia de dados, hierarquia de índices (IMM, IMV e IMA),
            bandas espectrais FFT por modo de coleta, Fator K calibrado, escudo anti-falso-positivo,
            interoperabilidade governamental e conformidade LGPD.
          </p>

          <div class="cover-meta-grid">
            <div class="cover-meta-item">
              <strong>Versão da Metodologia</strong>
              <span>Versão 2.1 Homologada (Onda 3)</span>
            </div>
            <div class="cover-meta-item">
              <strong>Data de Emissão</strong>
              <span>${dataFormatada}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Protocolo de Autenticidade</strong>
              <span>${protocolo}</span>
            </div>
            <div class="cover-meta-item">
              <strong>Base Normativa Federal</strong>
              <span>Art. 320 CTB • LC 182/2021 • Lei 14.129/2021</span>
            </div>
          </div>
        </div>

        <div class="cover-footer">
          <div>
            <b>ORBIS.UOS GovTech B2G</b> • Sensoriamento Urbano Contínuo Zero CAPEX<br>
            Infraestrutura em Nuvem Gerenciada (Skip Cloud) • Esquema Versionado em Migrações
          </div>
          <div style="text-align: right;">
            Documento com Fé Pública Digital<br>
            Amparo: Lei Federal nº 14.063/2020
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PÁGINA 2: HIERARQUIA DE ÍNDICES E MOTOR DO IMV (4 PILARES) -->
      <!-- ========================================================================= -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Dossiê de Arquitetura v2.1</span>
          <span>1. Hierarquia de Índices & Pilares IMV</span>
        </div>

        <div class="section-header">
          <span class="section-number">1</span>
          <h2 class="section-title">Hierarquia dos Índices & Arquitetura de Consolidação (v2.1)</h2>
        </div>

        <p>
          A arquitetura metodológica do ORBIS.UOS opera em modelo federado de índices, garantindo
          a soberania executiva para o Gabinete do Prefeito sem descaracterizar a precisão inercial
          e física da zeladoria urbana:
        </p>

        <div class="grid-3">
          <div class="card">
            <b style="color: #2563EB; font-size: 12px;">IMM (Índice-Síntese)</b><br>
            <span style="font-size: 9.5px; color: #64748B;">Índice de Mobilidade do Município</span>
            <p style="margin-top: 6px; font-size: 10.5px;">
              Número soberano da gestão no Gabinete (escala 0 a 100). Consolida os sub-índices ativos
              com transparência auditável:
              <br>• <b>Com coleta ativa (IMA):</b> 70% IMV + 30% IMA
              <br>• <b>Sem coleta ativa:</b> 100% IMV (sem inventar dados)
            </p>
          </div>

          <div class="card">
            <b style="color: #059669; font-size: 12px;">IMV (Sub-índice Viário)</b><br>
            <span style="font-size: 9.5px; color: #64748B;">Índice de Manutenção Viária</span>
            <p style="margin-top: 6px; font-size: 10.5px;">
              Herda intacto o motor físico inercial da malha asfáltica. Apurado continuamente por
              veículos da frota municipal (ônibus, viaturas, coleta) via 4 pilares ponderados com
              validação tripla F ≥ 3.
            </p>
          </div>

          <div class="card">
            <b style="color: #0D9488; font-size: 12px;">IMA (Acessibilidade)</b><br>
            <span style="font-size: 9.5px; color: #64748B;">Sub-índice de Mobilidade Ativa</span>
            <p style="margin-top: 6px; font-size: 10.5px;">
              Homologado na Versão 2.1 (Onda 3). Mensura a integridade de calçadas, travessias e
              ciclovias por pedestres e ciclistas, aplicando tratamento estatístico ao viés de desvio
              declarado.
            </p>
          </div>
        </div>

        <div class="highlight-box">
          <b>Princípio da Honestidade Metodológica & Estado Neutro:</b> Quando o município não iniciou
          coletas de mobilidade ativa a pé ou por bicicleta, o sub-índice IMA permanece declarado como
          <i>"Aguardando Campo"</i> e o IMM sintetiza exclusivamente dados empíricos reais (100% IMV).
          Nunca são projetadas notas artificiais.
        </div>

        <div class="section-header">
          <span class="section-number">2</span>
          <h2 class="section-title">Os 4 Pilares do IMV, Fator K e Faixas Orçamentárias</h2>
        </div>

        <p>
          O cálculo do IMV é segmentado a cada 100 metros lineares de via pública, fundamentado
          na <i>"Redação Técnica Obrigatória: IRI estimado por telemetria inercial ponderado por Fator K,
          correlacionado ao método do Banco Mundial"</i>:
        </p>

        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Pilar</th>
              <th style="width: 12%;">Peso / Função</th>
              <th style="width: 38%;">Grandeza Física & Mecanismo de Aferição</th>
              <th style="width: 35%;">Impacto no Cálculo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Pilar A</b></td>
              <td><b>0,40</b> (40%)</td>
              <td><b>IRI Estimado (m/km)</b> via aceleração vertical no eixo Z, filtrada por velocidade e normalizada pelo Fator K do chassi do veículo.</td>
              <td>Pavimento perfeito (< 2,0 m/km) pontua 96–100; vias esburacadas (> 6,5 m/km) pontuam abaixo de 25.</td>
            </tr>
            <tr>
              <td><b>Pilar B</b></td>
              <td><b>0,30</b> (30%)</td>
              <td><b>Severidade e Densidade de Anomalias</b> (trincas superficiais, buracos de média gravidade e crateras de alto impacto > 3,0g).</td>
              <td>Penalidades progressivas por defeito reincidente com carimbo de coordenada métrica GPS.</td>
            </tr>
            <tr>
              <td><b>Pilar C</b></td>
              <td><b>0,20</b> (20%)</td>
              <td><b>Aderência, Frenagem Brusca e Drenagem</b> (taxa de desaceleração longitudinal < -0,3g e alertas hidrológicos Cemaden).</td>
              <td>Pontuação máxima de 95 com redução por ocorrências de derrapagem e acúmulo de lâmina d'água.</td>
            </tr>
            <tr>
              <td><b>Pilar D</b></td>
              <td><b>1,0 a 1,5x</b> (Mult.)</td>
              <td><b>Criticidade Hierárquica do Segmento Viário</b> (Corredor BRT 1,5x; Arteriais hospitalares 1,3x; Coletoras 1,1x; Locais 1,0x).</td>
              <td>Amplifica o rigor de intervenção em vias com alto fluxo de passageiros e ambulâncias.</td>
            </tr>
          </tbody>
        </table>

        <div class="section-header" style="margin-top: 18px;">
          <span class="section-number">3</span>
          <h2 class="section-title">Faixas Orçamentárias do IMV, Custo Evitado e Multiplicador 10x</h2>
        </div>

        <p>
          O sistema converte os dados inerciais em recomendações de engenharia com custos balizados pela
          tabela SINAPI / SICRO, demonstrando a economicidade da prevenção:
        </p>

        <table>
          <thead>
            <tr>
              <th>Faixa IMV</th>
              <th>Classificação</th>
              <th>Ação Orçamentária Recomendada</th>
              <th>Custo Médio / m²</th>
              <th>Relação Custo Evitado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b style="color: #059669;">85 a 100</b></td>
              <td>Pavimento Sadio</td>
              <td>Monitoramento Passivo Contínuo</td>
              <td><b>R$ 0 / m²</b></td>
              <td>100% de preservação preventiva</td>
            </tr>
            <tr>
              <td><b style="color: #2563EB;">70 a 84</b></td>
              <td>Desgaste Precoce</td>
              <td>Microrrevestimento / Selagem de Trincas</td>
              <td><b>~ R$ 18 / m²</b></td>
              <td><b>Economia de até 10x</b> vs. Reconstrução Emergencial</td>
            </tr>
            <tr>
              <td><b style="color: #D97706;">50 a 69</b></td>
              <td>Degradação Moderada</td>
              <td>Fresagem e Recapeamento CBUQ 3–5 cm</td>
              <td><b>~ R$ 65 / m²</b></td>
              <td>Economia moderada (3x menor que reconstrução)</td>
            </tr>
            <tr>
              <td><b style="color: #DC2626;">0 a 49</b></td>
              <td>Colapso Estrutural</td>
              <td>Reconstrução Profunda de Base e Asfalto Novo</td>
              <td><b>~ R$ 190 / m²</b></td>
              <td>Custo máximo emergencial (obra civil pesada)</td>
            </tr>
          </tbody>
        </table>

        <div class="success-box">
          <b>Comprovação do Multiplicador 10x aos Tribunais de Contas:</b> Intervir preventivamente na faixa
          azul (R$ 18/m²) antes da evolução para colapso de base (R$ 190/m²) evita R$ 172 por m² tratado. Em um lote
          típico de 20 km de vias arteriais, o Custo Evitado comprovado ultrapassa R$ 4,8 milhões de reais por exercício.
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PÁGINA 3: BANDAS FFT, FATOR K E ESCUDO ANTI-FALSO-POSITIVO -->
      <!-- ========================================================================= -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Dossiê de Arquitetura v2.1</span>
          <span>2. Espectro FFT, Fator K & Escudo F ≥ 3</span>
        </div>

        <div class="section-header">
          <span class="section-number">4</span>
          <h2 class="section-title">Bandas Espectrais FFT por Modo e Baselines do Fator K</h2>
        </div>

        <p>
          O processamento de sinal digital embarcado no SDK Edge executa janelamento Hanning e algoritmo
          FFT Radix-2 particionando a energia vibracional na banda específica de cada categoria física de sensor.
          Isso desacopla a resposta natural da suspensão do chassi da real irregularidade da pista:
        </p>

        <table>
          <thead>
            <tr>
              <th>Modo / Categoria</th>
              <th>Banda FFT Alvo</th>
              <th>Baseline Fator K</th>
              <th>Dinâmica Mecânica & Tratamento Espectral</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Ônibus Urbano / BRT</b></td>
              <td>1,0 a 20,0 Hz</td>
              <td><b>K = 1,15</b></td>
              <td>Alta massa suspensa e suspensão a ar/mista. Atenua microfissuras e amplifica oscilações verticais de baixa frequência.</td>
            </tr>
            <tr>
              <td><b>Viatura Policial / Guarda</b></td>
              <td>1,0 a 20,0 Hz</td>
              <td><b>K = 0,90</b></td>
              <td>Chassi leve com amortecimento esportivo e rígido. Resposta direta a degraus asfálticos e picos de impacto seco.</td>
            </tr>
            <tr>
              <td><b>Caminhão de Coleta / Obras</b></td>
              <td>1,0 a 20,0 Hz</td>
              <td><b>K = 1,35</b></td>
              <td>Eixo rígido e feixe de molas duplo. Alta rigidez torsional; picos elevados requerem normalização redutora.</td>
            </tr>
            <tr>
              <td><b>Ambulância do SAMU</b></td>
              <td>1,0 a 20,0 Hz</td>
              <td><b>K = 1,05</b></td>
              <td>Furgão adaptado com estabilização mista para transporte de macas; dinâmica intermediária equilibrada.</td>
            </tr>
            <tr>
              <td><b>Veículos Leves Oficiais</b></td>
              <td>1,0 a 20,0 Hz</td>
              <td><b>K = 1,00</b></td>
              <td>Padrão neutro de referência unitária para frotas institucionais leves convencionais.</td>
            </tr>
            <tr>
              <td><b>Pedestre (Calçadas - IMA)</b></td>
              <td>0,8 a 3,5 Hz</td>
              <td><b>K = 0,75</b></td>
              <td>Filtro passa-baixa biomecânico do passo (1,4–2,5 Hz). Identifica lajotas soltas, degraus e desníveis de raiz arbórea.</td>
            </tr>
            <tr>
              <td><b>Ciclista (Ciclovias - IMA)</b></td>
              <td>2,0 a 12,0 Hz</td>
              <td><b>K = 1,45</b></td>
              <td>Garfo dianteiro rígido sem suspensão e pneus finos de alta pressão. Responde com nitidez a tampas de bueiro desniveladas.</td>
            </tr>
            <tr>
              <td><b>Motociclista (Pistas - IMA)</b></td>
              <td>3,0 a 22,0 Hz</td>
              <td><b>K = 1,25</b></td>
              <td>Suspensão telescópica dianteira e rolagem dinâmica. Complemento de alta amostragem conjugado com filtro de desvio.</td>
            </tr>
          </tbody>
        </table>

        <div class="card" style="margin-top: 12px; background: #F8FAFC;">
          <b>Metodologia de Calibração Empírica do Fator K:</b> Em campo, o sistema recalibra o K baseline por
          dois métodos estatísticos:
          <br>1. <b>Razão em Segmentos Compartilhados (Método Primário):</b> Compara a aceleração RMS e picos FFT da categoria
          avaliada frente às demais categorias que trafegaram exatamente sobre o mesmo trecho físico com F ≥ 3.
          <br>2. <b>Fallback por Média Absoluta da Malha:</b> Na ausência temporária de sobreposição direta, ajusta o Fator K pela
          razão da aceleração média frente à linha de base calibrada do município.
        </div>

        <div class="section-header" style="margin-top: 20px;">
          <span class="section-number">5</span>
          <h2 class="section-title">Escudo Anti-Falso-Positivo & Tratamento do Viés de Desvio</h2>
        </div>

        <p>
          Para assegurar fé pública e evitar o dispêndio indevido de recursos com falsas Ordens de Serviço,
          o ORBIS.UOS adota critérios rígidos de validação estatística:
        </p>

        <div class="grid-2">
          <div class="card">
            <b style="color: #059669;">Regra de Validação Tripla (F ≥ 3)</b>
            <p style="margin-top: 6px; font-size: 10.5px;">
              Nenhum defeito viário se converte em Ordem de Serviço (OS) com apenas uma leitura isolada.
              Exige-se a confirmação de <b>pelo menos 3 passagens de veículos distintos</b> no mesmo trecho
              de 100 metros.
              <br><br>
              Trechos sem tráfego de frota são classificados formalmente como <b>"NÃO AUDITADOS" (cinza)</b>,
              sendo vedada a atribuição de notas presumidas.
            </p>
          </div>

          <div class="card">
            <b style="color: #D97706;">Tratamento Estatístico do Viés de Desvio Declarado</b>
            <p style="margin-top: 6px; font-size: 10.5px;">
              Pedestres, ciclistas e motociclistas desviam instintivamente de buracos. Se apenas o impacto vertical
              Z fosse computado, vias intransitáveis seriam falsamente categorizadas como sadias.
              <br><br>
              O sistema monitora a rotação giroscópica de <i>roll</i> (> 32°/s) sem impacto vertical. Quando 3 ou mais
              passagens contornam o mesmo ponto, o evento é registrado como <b>anomalia indireta confirmada</b> no Pilar C.
            </p>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PÁGINA 4: INTEROPERABILIDADE, WEBHOOKS E ROADMAP GTFS/NTCIP -->
      <!-- ========================================================================= -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Dossiê de Arquitetura v2.1</span>
          <span>3. Interoperabilidade & APIs B2G</span>
        </div>

        <div class="section-header">
          <span class="section-number">6</span>
          <h2 class="section-title">Interoperabilidade B2G, Endpoints GeoJSON e Webhooks</h2>
        </div>

        <p>
          A plataforma é orientada a padrões abertos de governo digital (e-PING e OGC Compliant), permitindo
          integração imediata com o Centro Integrado de Comando (CIC), datalakes municipais e secretarias:
        </p>

        <table>
          <thead>
            <tr>
              <th>Método / Rota</th>
              <th>Formato</th>
              <th>Frequência</th>
              <th>Descrição Técnica & Objeto do Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b style="color: #2563EB;">GET</b> <code>/backend/v1/telemetry/imm-segments</code></td>
              <td>GeoJSON</td>
              <td>Diária (24h)</td>
              <td>LineStrings dos trechos de 100m georreferenciados com scores IMV e IMM, pilar A (aceleração Z), pilar B (passagens F) e pilar C (aderência).</td>
            </tr>
            <tr>
              <td><b style="color: #2563EB;">GET</b> <code>/backend/v1/safety/prioridade-zero</code></td>
              <td>JSON</td>
              <td>Semanal / Demanda</td>
              <td>Matriz de Prioridade Zero: cruzamento analítico de asfalto degradado, histórico de sinistros fatais e perímetro de 100m de escolas e hospitais.</td>
            </tr>
            <tr>
              <td><b style="color: #2563EB;">GET</b> <code>/backend/v1/telemetry/leituras-agregadas</code></td>
              <td>JSON</td>
              <td>A cada 15 min</td>
              <td>Série histórica de janelas espectrais (aceleração Z, velocidade média, frequência FFT dominante) 100% anonimizada sem identificação pessoal.</td>
            </tr>
            <tr>
              <td><b style="color: #059669;">POST</b> <code>/backend/v1/webhooks/subscribe</code></td>
              <td>Push HTTP</td>
              <td>Tempo Real</td>
              <td>Disparo imediato de callbacks estruturados para a Defesa Civil ou CIC na detecção de crateras críticas ou risco iminente de colapso de drenagem.</td>
            </tr>
          </tbody>
        </table>

        <div class="card" style="margin-top: 10px;">
          <b style="font-size: 11px;">Exemplo de Payload GeoJSON Exportado pelo Endpoint IMM por Segmento:</b>
          <div class="code-box">{
  "type": "FeatureCollection",
  "municipio_ibge": "4106902",
  "metodologia_versao": "2.1",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "segment_id": "seg_pr_ctba_84920",
        "imv_score": 78.4,
        "imm_sintese_score": 78.4,
        "faixa_criticidade": "desgaste_precoce",
        "pilar_a_aceleracao_z": 4.12,
        "pilar_b_passagens_confianca": 8,
        "pilar_c_aderencia": 0.91,
        "fator_k_veiculo": 1.15,
        "acao_orcamentaria": "Microrrevestimento / Selagem de Trincas"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [[-49.2731, -25.4382], [-49.2740, -25.4390]]
      }
    }
  ]
}</div>
        </div>

        <div class="section-header" style="margin-top: 18px;">
          <span class="section-number">7</span>
          <h2 class="section-title">Roadmap de Interoperabilidade Viária Avançada</h2>
        </div>

        <div class="grid-2">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <b>GTFS-RT / General Transit Feed</b>
              <span style="font-size: 9px; font-weight: 700; background: #FEF3C7; color: #D97706; padding: 2px 6px; border-radius: 4px;">ROADMAP Q2/2025</span>
            </div>
            <p style="margin-top: 6px; font-size: 10px;">
              Integração com feeds operacionais de transporte público (GTFS-Realtime Service Alerts & Trip Updates),
              correlacionando atrasos e desgaste mecânico de ônibus com segmentos de asfalto degradado.
            </p>
          </div>

          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <b>NTCIP 1202 / SCOOT & SCATS</b>
              <span style="font-size: 9px; font-weight: 700; background: #FEF3C7; color: #D97706; padding: 2px 6px; border-radius: 4px;">ROADMAP Q3/2025</span>
            </div>
            <p style="margin-top: 6px; font-size: 10px;">
              Compatibilidade com centrais semafóricas inteligentes NTCIP 1202 v03 para modulação adaptativa
              de ciclos em cruzamentos com anomalias graves e redução preventiva de velocidade.
            </p>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PÁGINA 5: INFRAESTRUTURA, LGPD, ROADMAP HONESTO E TRILHA DE AUDITORIA -->
      <!-- ========================================================================= -->
      <div class="page-break">
        <div class="page-running-header">
          <span>ORBIS.UOS • Dossiê de Arquitetura v2.1</span>
          <span>4. Infraestrutura, LGPD & Auditoria SHA-256</span>
        </div>

        <div class="section-header">
          <span class="section-number">8</span>
          <h2 class="section-title">Infraestrutura em Nuvem, Migrações Versionadas & LGPD</h2>
        </div>

        <p>
          A plataforma ORBIS.UOS foi concebida sob os princípios de <i>Security by Default</i> e <i>Privacy by Design</i>,
          assegurando conformidade integral com a Lei Geral de Proteção de Dados (Lei Federal nº 13.709/2018):
        </p>

        <div class="grid-2">
          <div class="card">
            <b>Nuvem Gerenciada & Banco Auditável</b>
            <p style="margin-top: 6px; font-size: 10.5px;">
              Backend hospedado em nuvem gerenciada soberana (Skip Cloud com motor de alta performance PocketBase / SQLite WAL).
              Esquema de dados 100% versionado em arquivos de migração imutáveis em TypeScript/JavaScript, garantindo
              reprodutibilidade e ausência de mutações ad-hoc não auditadas.
            </p>
          </div>

          <div class="card">
            <b>Blindagem LGPD & Coleta Passiva</b>
            <p style="margin-top: 6px; font-size: 10.5px;">
              <b>Zero câmeras, zero fotos, zero placas e zero identificadores pessoais.</b> O celular do motorista ou do
              cidadão atua estritamente como sensor inercial (acelerômetro e giroscópio) guardado no suporte ou no bolso.
              Toda transmissão é agregada em janelas de 100 metros e anonimizada na borda antes do envio.
            </p>
          </div>
        </div>

        <div class="section-header" style="margin-top: 18px;">
          <span class="section-number">9</span>
          <h2 class="section-title">Roadmap de Infraestrutura (Declaração Honesta de Conformidade)</h2>
        </div>

        <p>
          Em observância ao princípio da transparência pública com órgãos de fiscalização e prefeituras parceiras,
          declaramos formalmente o status das seguintes rotinas de infraestrutura:
        </p>

        <table>
          <thead>
            <tr>
              <th style="width: 28%;">Recurso de Infraestrutura</th>
              <th style="width: 18%;">Status Atual</th>
              <th style="width: 54%;">Detalhamento & Compromisso Técnico</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Backup Automatizado Diário</b></td>
              <td><b style="color: #D97706;">Previsto (Não Implantado)</b></td>
              <td>Rotina de snapshots automáticos em bucket geodistribuído independente com retenção de 30 dias (planejado para Q2/2025).</td>
            </tr>
            <tr>
              <td><b>Política de Retenção LGPD</b></td>
              <td><b style="color: #D97706;">Previsto (Não Implantado)</b></td>
              <td>Expurgo automático e irreversível de janelas inerciais cruas de telemetria após 180 dias da consolidação dos índices viários.</td>
            </tr>
            <tr>
              <td><b>Job de Sincronização CGU / Painel Obras</b></td>
              <td><b style="color: #D97706;">Previsto (Não Implantado)</b></td>
              <td>Integração automatizada com os painéis federais de obras públicas da Controladoria-Geral da União (planejado para Q3/2025).</td>
            </tr>
          </tbody>
        </table>

        <div class="section-header" style="margin-top: 18px;">
          <span class="section-number">10</span>
          <h2 class="section-title">Trilha de Auditoria com Hash SHA-256 e Fé Pública Digital</h2>
        </div>

        <p>
          Todo dossiê emitido pelo ORBIS.UOS recebe uma assinatura criptográfica de integridade inalterável
          calculada via algoritmo <b>SHA-256 (Secure Hash Algorithm 256 bits)</b> sobre os metadados do documento.
          O registro assegura fé pública perante o Tribunal de Contas do Estado (TCE), Ministério Público e Controladoria:
        </p>

        <div class="grid-2" style="font-size: 10.5px;">
          <div class="card">
            <b>Protocolo do Dossiê:</b> <span style="font-family: monospace;">${protocolo}</span><br>
            <b>Data e Hora da Emissão:</b> ${dataFormatada} às ${horaFormatada}<br>
            <b>Responsável / Perfil:</b> ${sanitizeHtml(options?.responsavelNome || 'Público / Avaliação de Conformidade')} (${sanitizeHtml(options?.responsavelCargo || 'Acesso Técnico')})
          </div>

          <div class="card">
            <b>Padrão Criptográfico:</b> SHA-256 IEEE P1363<br>
            <b>Base Legal:</b> Art. 10, § 2º da MP 2.200-2/2001 & Lei Federal nº 14.063/2020<br>
            <b>Integridade:</b> Imutável e verificável independentemente
          </div>
        </div>

        <div class="hash-bar">
          <b>HASH SHA-256 DE AUTENTICIDADE CRIPTOGRÁFICA DO DOSSIÊ:</b><br>
          ${hashSha256}
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #CBD5E1; padding-top: 12px; font-size: 9.5px; color: #64748B; text-align: center;">
          ORBIS.UOS • Urban Operating System • Plataforma B2G de Mobilidade e Zeladoria Viária<br>
          Metodologia Versão 2.1 Homologada (2025–2026) • Documento com fé pública digital amparado na Lei 14.063/2020.
        </div>
      </div>

    </body>
    </html>
  `

  // 4. Executar abertura de janela limpa e trigger do motor nativo de impressão em PDF
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error(
      'Bloqueador de pop-ups impediu a abertura do Dossiê. Autorize pop-ups para este domínio.',
    )
  }

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()

  // Tempo hábil para renderização completa das fontes e da logo DataURL antes de disparar print
  setTimeout(() => {
    try {
      printWindow.print()
    } catch (e) {
      console.warn('Erro ao disparar impressão automática:', e)
    }
  }, 450)

  return { hash: hashSha256, protocolo }
}
