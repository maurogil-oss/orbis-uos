/**
 * ORBIS.UOS — IEC (Índice de Estresse Cinemático) Engine
 *
 * O IEC mede a tensão mecânica e inercial da condução automotiva através da
 * física do deslocamento (acelerômetro e velocidade da telemetria embarcada).
 *
 * Princípios Fundamentais:
 * - "IMV mede a via; IEC mede o comportamento sobre a via."
 * - Não adivinha o cérebro do condutor: motorista calmo pratica desacelerações
 *   progressivas e velocidade de cruzeiro estável; condutor sob estresse/pressa/distração
 *   pratica condução reativa (aproximações rápidas, aceleração forte e frenagens repentinas).
 * - Sem biometria, sem neurodados, sem gravação de voz ou câmera, zero PII.
 * - Amparado no Art. 12 da LGPD (dado físico de dinâmica veicular, agregado k-anônimo).
 * - Enquadramento: Órgão Municipal de Trânsito / Obras (agentes municipais, sinalização,
 *   engenharia de tráfego, vistoria de trecho).
 * - Rodovias federais e estaduais (PRF, BR-101, etc.): Fora do escopo operacional municipal;
 *   "em estudo de conformidade".
 * - Tipagem metodológica permanente: "hipótese a validar em campo" (modelo calibrável).
 */

export type IecNivelId = 'verde' | 'ciano' | 'ambar' | 'vermelho'

export interface IecNivelConfig {
  id: IecNivelId
  min: number
  max: number
  nome: string // Nome institucional padrão
  nomeGamificacao?: string
  corHex: string
  corTailwindBadge: string
  corTailwindBg: string
  corTailwindBorder: string
  corTailwindText: string
  padraoFisico: string
  riscoColisao: string
  acaoRecomendadaMunicipal: string
}

/**
 * Escala Oficial de 4 Níveis do IEC (Prescrita pelo usuário, faixas exatas)
 */
export const IEC_NIVEIS: Record<IecNivelId, IecNivelConfig> = {
  verde: {
    id: 'verde',
    min: 0,
    max: 24,
    nome: 'Condução Fluida',
    nomeGamificacao: 'Zen',
    corHex: '#10B981',
    corTailwindBadge: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40',
    corTailwindBg: 'bg-[#10B981]/10',
    corTailwindBorder: 'border-[#10B981]/40',
    corTailwindText: 'text-[#10B981]',
    padraoFisico: 'Velocidade de cruzeiro estável, desacelerações suaves e progressivas.',
    riscoColisao: 'Risco quase nulo de colisão traseira.',
    acaoRecomendadaMunicipal:
      'Trecho com fluidez exemplar. Manter padrão de sinalização e cronometragem semafórica atual.',
  },
  ciano: {
    id: 'ciano',
    min: 25,
    max: 49,
    nome: 'Condução Estável',
    corHex: '#06B6D4',
    corTailwindBadge: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40',
    corTailwindBg: 'bg-[#06B6D4]/10',
    corTailwindBorder: 'border-[#06B6D4]/40',
    corTailwindText: 'text-[#06B6D4]',
    padraoFisico: 'Reduções normais de fluxo e acomodação ao tráfego habitual urbano.',
    riscoColisao: 'Risco residual baixo de colisão.',
    acaoRecomendadaMunicipal:
      'Operação regular de tráfego. Monitoramento passivo de rotina pelas frotas municipais.',
  },
  ambar: {
    id: 'ambar',
    min: 50,
    max: 74,
    nome: 'Tensão Elevada',
    corHex: '#F59E0B',
    corTailwindBadge: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40',
    corTailwindBg: 'bg-[#F59E0B]/10',
    corTailwindBorder: 'border-[#F59E0B]/40',
    corTailwindText: 'text-[#F59E0B]',
    padraoFisico:
      'Oscilação constante de velocidade, aproximações rápidas e freadas moderadas repetidas.',
    riscoColisao:
      'Alerta preventivo: trecho com trânsito nervoso, retenção repentina ou pista escorregadia.',
    acaoRecomendadaMunicipal:
      'Vistoria de engenharia de tráfego municipal: checar visibilidade de placas, calibrar tempos semafóricos e verificar aderência do pavimento.',
  },
  vermelho: {
    id: 'vermelho',
    min: 75,
    max: 100,
    nome: 'Estresse Crítico',
    corHex: '#EF4444',
    corTailwindBadge: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40',
    corTailwindBg: 'bg-[#EF4444]/10',
    corTailwindBorder: 'border-[#EF4444]/40',
    corTailwindText: 'text-[#EF4444]',
    padraoFisico:
      'Freadas violentas consecutivas, desacelerações bruscas e acelerações súbitas sucessivas.',
    riscoColisao: 'Alerta máximo (hotspot): risco iminente de colisão traseira.',
    acaoRecomendadaMunicipal:
      'Despacho prioritário de agentes municipais de trânsito para vistoria imediata, reforço emergencial de sinalização vertical/horizontal e checagem de obstáculos ou buracos na via.',
  },
}

/**
 * Parâmetros físicos de entrada para cálculo do IEC em uma janela ou trecho
 */
export interface KineticStressInput {
  /**
   * Taxa de freadas bruscas (desaceleração acima de limiar > 0.35g)
   * em eventos por minuto ou fração amostrada (0 a 10+)
   */
  frenagensBruscasTaxa?: number

  /**
   * Intensidade média ou máxima das desacelerações em 'g' (ex: 0.15 a 0.85g)
   */
  intensidadeDesaceleracaoG?: number

  /**
   * Frequência de acelerações súbitas (> 0.25g) em eventos/min (0 a 8+)
   */
  aceleracoesSubitasTaxa?: number

  /**
   * Desvio-padrão ou coeficiente de oscilação da velocidade (km/h) (0 a 25+)
   */
  oscilacaoVelocidadeKmh?: number

  /**
   * Taxa de aproximações rápidas / fechamento de gap veicular (0 a 5+)
   */
  aproximacoesRapidasTaxa?: number

  /**
   * Velocidade média no segmento (km/h) para ponderação de inércia
   */
  velocidadeMediaKmh?: number
}

/**
 * Resultado estruturado da função de cálculo oficial
 */
export interface KineticStressResult {
  score: number // 0 a 100 arredondado
  scoreBruto: number
  nivel: IecNivelConfig
  statusTipagem: 'hipotese_a_validar_em_campo'
  fatores: {
    frenagem: number // contribuição 0 a 100
    aceleracao: number // contribuição 0 a 100
    oscilacao: number // contribuição 0 a 100
    aproximacao: number // contribuição 0 a 100
  }
  pesosUtilizados: {
    frenagem: number
    aceleracao: number
    oscilacao: number
    aproximacao: number
  }
  rotuloAuditoria: string
}

/**
 * Função de Cálculo Oficial prescrita: `calculateKineticStressIndex`
 *
 * Modelo calibrável baseado em física inercial da condução:
 * - Frequência e intensidade de freadas bruscas (peso 0.40)
 * - Acelerações súbitas e retomadas agressivas (peso 0.25)
 * - Oscilação / variabilidade de velocidade escalar (peso 0.20)
 * - Aproximações rápidas / condução reativa (peso 0.15)
 *
 * Normalização 0 a 100 com escala de 4 níveis.
 * Tipagem: Hipótese a validar em campo.
 */
export function calculateKineticStressIndex(input: KineticStressInput): KineticStressResult {
  const frenagens = Math.max(0, input.frenagensBruscasTaxa ?? 0)
  const intensidadeG = Math.max(0, input.intensidadeDesaceleracaoG ?? 0)
  const aceleracoes = Math.max(0, input.aceleracoesSubitasTaxa ?? 0)
  const oscilacao = Math.max(0, input.oscilacaoVelocidadeKmh ?? 0)
  const aproximacoes = Math.max(0, input.aproximacoesRapidasTaxa ?? 0)

  // 1. Sub-fator Frenagem (Frequência normalizada + intensidade além do limiar de conforto 0.25g)
  // 0 freadas bruscas = 0; 4+ freadas/min ou >0.6g atinge teto 100
  const freqFrenagemScore = Math.min(100, (frenagens / 3.5) * 70)
  const intensFrenagemScore = Math.min(30, Math.max(0, (intensidadeG - 0.25) / 0.4) * 30)
  const subFrenagem = Math.min(100, Math.round(freqFrenagemScore + intensFrenagemScore))

  // 2. Sub-fator Aceleração Súbita (Arrancadas, ultrapassagens forçadas)
  // 0 acel/min = 0; 3+ acel/min = 100
  const subAceleracao = Math.min(100, Math.round((aceleracoes / 3.0) * 100))

  // 3. Sub-fator Oscilação de Velocidade (Condução instável / stop-and-go nervoso)
  // desvio <= 2 km/h = ~10; desvio >= 14 km/h = 100
  const subOscilacao = Math.min(100, Math.round((oscilacao / 14) * 100))

  // 4. Sub-fator Aproximações Rápidas (Aceleração em direção a veículo da frente)
  // 0 aproximações/min = 0; 2.5+ aproximações/min = 100
  const subAproximacao = Math.min(100, Math.round((aproximacoes / 2.5) * 100))

  // Pesos do modelo físico inercial calibrável
  const pesos = {
    frenagem: 0.4,
    aceleracao: 0.25,
    oscilacao: 0.2,
    aproximacao: 0.15,
  }

  const scoreBruto =
    subFrenagem * pesos.frenagem +
    subAceleracao * pesos.aceleracao +
    subOscilacao * pesos.oscilacao +
    subAproximacao * pesos.aproximacao

  const score = Math.max(0, Math.min(100, Math.round(scoreBruto)))
  const nivel = getIecNivel(score)

  return {
    score,
    scoreBruto: Number(scoreBruto.toFixed(2)),
    nivel,
    statusTipagem: 'hipotese_a_validar_em_campo',
    fatores: {
      frenagem: subFrenagem,
      aceleracao: subAceleracao,
      oscilacao: subOscilacao,
      aproximacao: subAproximacao,
    },
    pesosUtilizados: pesos,
    rotuloAuditoria: `IEC ${score}/100 • ${nivel.nome} (hipótese a validar em campo)`,
  }
}

/**
 * Retorna a configuração de nível oficial para um score IEC (0 a 100)
 */
export function getIecNivel(score: number): IecNivelConfig {
  const s = Math.max(0, Math.min(100, Math.round(score)))
  if (s <= 24) return IEC_NIVEIS.verde
  if (s <= 49) return IEC_NIVEIS.ciano
  if (s <= 74) return IEC_NIVEIS.ambar
  return IEC_NIVEIS.vermelho
}

/**
 * Cenários prescritos para o Simulador Interativo (/demo)
 */
export type IecCenarioPreset = 'Normal' | 'Moderada' | 'Frenagem Brusca'

export interface IecCenarioConfig {
  id: IecCenarioPreset
  label: string
  descricao: string
  input: KineticStressInput
  telemetriaAmostra: {
    velocidadeMediaKmh: number
    acelLongitudinalMaxG: number
    decelMaxG: number
    eventosPorMinuto: number
    fatorVariabilidade: string
  }
}

export const IEC_SIMULATOR_SCENARIOS: Record<IecCenarioPreset, IecCenarioConfig> = {
  Normal: {
    id: 'Normal',
    label: 'Normal (Fluxo Calmo)',
    descricao:
      'Velocidade estável de cruzeiro, desacelerações progressivas e aproximações suaves. Padrão de motorista calmo e tráfego desimpedido.',
    input: {
      frenagensBruscasTaxa: 0.1,
      intensidadeDesaceleracaoG: 0.18,
      aceleracoesSubitasTaxa: 0.2,
      oscilacaoVelocidadeKmh: 1.8,
      aproximacoesRapidasTaxa: 0.1,
      velocidadeMediaKmh: 48,
    },
    telemetriaAmostra: {
      velocidadeMediaKmh: 48,
      acelLongitudinalMaxG: 0.12,
      decelMaxG: -0.18,
      eventosPorMinuto: 0,
      fatorVariabilidade: 'Baixa (±1.8 km/h)',
    },
  },
  Moderada: {
    id: 'Moderada',
    label: 'Moderada (Tráfego Nervoso)',
    descricao:
      'Oscilação constante de velocidade com reduções frequentes e aproximações rápidas. Padrão de retenção repentina ou onda de tráfego intermitente.',
    input: {
      frenagensBruscasTaxa: 1.8,
      intensidadeDesaceleracaoG: 0.42,
      aceleracoesSubitasTaxa: 1.6,
      oscilacaoVelocidadeKmh: 8.5,
      aproximacoesRapidasTaxa: 1.2,
      velocidadeMediaKmh: 34,
    },
    telemetriaAmostra: {
      velocidadeMediaKmh: 34,
      acelLongitudinalMaxG: 0.28,
      decelMaxG: -0.44,
      eventosPorMinuto: 3,
      fatorVariabilidade: 'Média (±8.5 km/h)',
    },
  },
  'Frenagem Brusca': {
    id: 'Frenagem Brusca',
    label: 'Frenagem Brusca (Condução Reativa Crítica)',
    descricao:
      'Freadas violentas consecutivas (>0.60g) com acelerações súbitas em sequência. Risco iminente de colisão traseira provocado por parada repentina ou defeito de visibilidade da via.',
    input: {
      frenagensBruscasTaxa: 4.2,
      intensidadeDesaceleracaoG: 0.72,
      aceleracoesSubitasTaxa: 3.4,
      oscilacaoVelocidadeKmh: 16.2,
      aproximacoesRapidasTaxa: 2.8,
      velocidadeMediaKmh: 28,
    },
    telemetriaAmostra: {
      velocidadeMediaKmh: 28,
      acelLongitudinalMaxG: 0.45,
      decelMaxG: -0.74,
      eventosPorMinuto: 7,
      fatorVariabilidade: 'Severa (±16.2 km/h)',
    },
  },
}

/**
 * Estrutura de agregação k-anônima do IEC para exibição nos painéis do órgão municipal.
 * NUNCA contém identificadores de veículo isolado, placa ou perfil do motorista.
 */
export interface IecSegmentAggregation {
  segmentoId: string
  via: string
  bairro: string
  extensaoMetros: number
  totalVeiculosAmostrados: number // k-anônimo (deve ser >= 3 para validação)
  kAnonimatoAtendido: boolean
  iecScore: number
  iecNivel: IecNivelConfig
  distribuicaoContagemPorNivel: {
    verde: number
    ciano: number
    ambar: number
    vermelho: number
  }
  causaProvavelTrecho: string
  acaoRecomendadaMunicipal: string
  isModeladoDemonstracao: boolean
  statusTipagem: 'hipotese_a_validar_em_campo'
  coordenadasCentro: [number, number]
}

/**
 * Segmentos de demonstração com IEC agregado k-anônimo e causas prováveis de engenharia municipal
 */
export const DEMO_IEC_SEGMENTS: IecSegmentAggregation[] = [
  {
    segmentoId: 'SEG-4106902-VISCONDE-GUARAPUAVA-01',
    via: 'Av. Visconde de Guarapuava, trecho Desembargador Motta / Brigadeiro Franco',
    bairro: 'Batel / Centro',
    extensaoMetros: 350,
    totalVeiculosAmostrados: 48,
    kAnonimatoAtendido: true,
    iecScore: 78,
    iecNivel: IEC_NIVEIS.vermelho,
    distribuicaoContagemPorNivel: {
      verde: 4,
      ciano: 8,
      ambar: 14,
      vermelho: 22,
    },
    causaProvavelTrecho:
      'Defeito de visibilidade semafórica e retenção repentina em cruzamento; múltiplos condutores reagem com frenagem violenta no mesmo ponto métrico.',
    acaoRecomendadaMunicipal:
      'Vistoria imediata da Setran/Obras: sincronismo da onda verde, avanço de foco semafórico e reforço de sinalização de retenção 50m antes.',
    isModeladoDemonstracao: true,
    statusTipagem: 'hipotese_a_validar_em_campo',
    coordenadasCentro: [-25.4389, -49.2825],
  },
  {
    segmentoId: 'SEG-4106902-MARECHAL-DEODORO-02',
    via: 'Rua Marechal Deodoro, proximidade Travessa da Lapa',
    bairro: 'Centro',
    extensaoMetros: 280,
    totalVeiculosAmostrados: 62,
    kAnonimatoAtendido: true,
    iecScore: 68,
    iecNivel: IEC_NIVEIS.ambar,
    distribuicaoContagemPorNivel: {
      verde: 8,
      ciano: 15,
      ambar: 29,
      vermelho: 10,
    },
    causaProvavelTrecho:
      'Conflito recorrente com embarque/desembarque irregular e conversões bruscas; oscilação severa de velocidade com paradas súbitas.',
    acaoRecomendadaMunicipal:
      'Operação de fiscalização municipal em área de carga/descarga e revisão de canalização de faixas.',
    isModeladoDemonstracao: true,
    statusTipagem: 'hipotese_a_validar_em_campo',
    coordenadasCentro: [-25.4312, -49.2685],
  },
  {
    segmentoId: 'SEG-4106902-SETE-SETEMBRO-03',
    via: 'Av. Sete de Setembro, corredor Praça do Japão',
    bairro: 'Água Verde',
    extensaoMetros: 420,
    totalVeiculosAmostrados: 85,
    kAnonimatoAtendido: true,
    iecScore: 42,
    iecNivel: IEC_NIVEIS.ciano,
    distribuicaoContagemPorNivel: {
      verde: 28,
      ciano: 41,
      ambar: 12,
      vermelho: 4,
    },
    causaProvavelTrecho:
      'Tráfego urbano estável com reduções habituais em aproximação de cruzamentos canalizados.',
    acaoRecomendadaMunicipal:
      'Manutenção da rotina operacional sem necessidade de intervenção estrutural.',
    isModeladoDemonstracao: true,
    statusTipagem: 'hipotese_a_validar_em_campo',
    coordenadasCentro: [-25.4442, -49.2892],
  },
  {
    segmentoId: 'SEG-4106902-LINHA-VERDE-URBANA-04',
    via: 'Linha Verde Urbana (Antiga BR-476 municipalizada), trecho Prado Velho',
    bairro: 'Prado Velho',
    extensaoMetros: 500,
    totalVeiculosAmostrados: 110,
    kAnonimatoAtendido: true,
    iecScore: 18,
    iecNivel: IEC_NIVEIS.verde,
    distribuicaoContagemPorNivel: {
      verde: 78,
      ciano: 24,
      ambar: 6,
      vermelho: 2,
    },
    causaProvavelTrecho:
      'Velocidade de cruzeiro estável, desacelerações suaves e faixas segregadas; condução altamente fluida.',
    acaoRecomendadaMunicipal: 'Padrão viário de referência. Monitoramento passivo contínuo.',
    isModeladoDemonstracao: true,
    statusTipagem: 'hipotese_a_validar_em_campo',
    coordenadasCentro: [-25.4578, -49.2552],
  },
  {
    segmentoId: 'SEG-4106902-MANOEL-RIBAS-05',
    via: 'Av. Manoel Ribas, proximidade Portal de Santa Felicidade',
    bairro: 'Santa Felicidade',
    extensaoMetros: 310,
    totalVeiculosAmostrados: 37,
    kAnonimatoAtendido: true,
    iecScore: 71,
    iecNivel: IEC_NIVEIS.ambar,
    distribuicaoContagemPorNivel: {
      verde: 5,
      ciano: 8,
      ambar: 18,
      vermelho: 6,
    },
    causaProvavelTrecho:
      'Trecho em declive com redução brusca de limite e lombada física com pintura desgastada; veículos desaceleram tardiamente.',
    acaoRecomendadaMunicipal:
      'Repintura imediata de redutor de velocidade, colocação de placa R-19 com advertência antecipada a 100m.',
    isModeladoDemonstracao: true,
    statusTipagem: 'hipotese_a_validar_em_campo',
    coordenadasCentro: [-25.4052, -49.3218],
  },
]
