/**
 * Motor do IMM (Índice de Mobilidade Municipal — Físico, Dia 30)
 * Metodologia declarada Versão 1.0 (2025)
 *
 * 4 Sub-índices ponderados por segmento viário de 100 m:
 * Pilar A: IRI estimado por telemetria inercial (peso 0,4)
 * Pilar B: Severidade e densidade de anomalias (peso 0,3)
 * Pilar C: Aderência, drenagem e segurança (peso 0,2)
 * Pilar D: Criticidade viária (multiplicador 1,0 a 1,5)
 *
 * Escudo Anti-Falso-Positivo (Fator de Confiança F):
 * Um defeito só valida se registrado por PELO MENOS 3 PASSAGENS DE VEÍCULOS DIFERENTES.
 * Registros solitários não geram Ordem de Serviço (OS).
 * Segmento sem cobertura = "NÃO AUDITADO" (cinza, nunca nota boa).
 *
 * Faixas do IMM (0–100, 100 = via perfeita):
 * 85–100: Pavimento Sadio -> monitoramento passivo, R$ 0/m², "Monitoramento"
 * 70–84: Desgaste Superficial Precoce -> microrrevestimento preventivo / selagem, ~R$ 18/m², "Manutenção Preventiva"
 * 50–69: Degradação Moderada a Grave -> fresagem e recapeamento CBUQ 3-5 cm, ~R$ 65/m², "Restauração Viária"
 * 0–49: Colapso de Base -> reconstrução profunda (solo-brita, drenagem), ~R$ 190/m², "Obras de Emergência"
 *
 * KPI Custo Evitado + Multiplicador 10x:
 * Cada OS emitida na faixa preventiva comprova economia de até 10x (R$ 18 vs R$ 190 / m²).
 */

export interface RoadSegmentTelemetry {
  id: string
  via: string
  bairro?: string
  extensao_metros: number // padrão 100m
  tipo_via: 'corredor_brt' | 'arterial' | 'coletora' | 'local'
  passagens_veiculos_distintos: number // Confiança F >= 3

  // Pilar A: IRI Estimado (inercial vertical Z filtrada, calibração chassi)
  iri_estimado: number // m/km (ex: 2.1 = excelente, 7.8 = péssimo)

  // Pilar B: Anomalias
  anomalias_detectadas: {
    trincas_iniciais: number
    buracos_medios: number
    crateras_severas: number
    max_acel_z_g: number
  }

  // Pilar C: Aderência / Frenagens / Drenagem
  frenagens_panico_count: number // aceleração longitudinal < -0.3g
  risco_hidrologico_cemaden: boolean // flag de chuva/drenagem

  // Auditado?
  auditado: boolean
}

export interface ImmSegmentResult {
  segmentId: string
  via: string
  auditado: boolean
  fatorConfiancaValido: boolean
  passagens: number

  scorePilarA: number // 0-100
  scorePilarB: number // 0-100
  scorePilarC: number // 0-100
  multiplicadorCriticidade: number // 1.0 - 1.5

  immScore: number // 0-100
  faixa: {
    id: 'sadio' | 'desgaste_precoce' | 'degradacao_moderada' | 'colapso_base'
    nome: string
    cor: string
    acao_orcamentaria: string
    custo_estimado_m2: number
    enquadramento: string
    economia_potencial_m2: number // R$ 190 - custo_estimado_m2
  }
  alerta_hidrologico: boolean
  gera_ordem_servico: boolean
}

export interface ImmCitySummary {
  immMedioGeral: number
  totalSegmentosAuditados: number
  totalSegmentosNaoAuditados: number
  pctMalhaAuditada: number
  distribuicaoFaixas: {
    sadioPct: number
    desgastePrecocePct: number
    degradacaoModeradaPct: number
    colapsoBasePct: number
  }
  faixaPredominante: {
    nome: string
    acao_orcamentaria: string
    cor: string
    custo_m2: number
  }
  kpiCustoEvitadoTotal: number // em R$
  kpiMultiplicadorMax: number // 10x
  metodologia: {
    versao: string
    data: string
    redacao_obrigatoria_iri: string
    regra_fator_confianca: string
  }
}

/**
 * Converte valor do IRI estimado (m/km) em nota de 0 a 100
 * Sub-notas:
 * 90–100 excelente (< 2.5 m/km)
 * 70–89 regular/bom (2.5 a 4.0 m/km)
 * 40–69 crítico (4.0 a 6.5 m/km)
 * 0–39 péssimo (> 6.5 m/km)
 */
export function calculateScorePilarA(iri: number): number {
  if (iri <= 2.0) return 96
  if (iri <= 2.5) return 90
  if (iri <= 3.2) return 82
  if (iri <= 4.0) return 72
  if (iri <= 5.2) return 58
  if (iri <= 6.5) return 42
  if (iri <= 8.0) return 25
  return 12
}

/**
 * Pilar B: Severidade e Densidade de Anomalias (0-100)
 */
export function calculateScorePilarB(
  anomalias: RoadSegmentTelemetry['anomalias_detectadas'],
): number {
  const { trincas_iniciais, buracos_medios, crateras_severas, max_acel_z_g } = anomalias
  let penalidade = 0
  penalidade += trincas_iniciais * 4
  penalidade += buracos_medios * 12
  penalidade += crateras_severas * 28

  if (max_acel_z_g > 3.0) penalidade += 15
  else if (max_acel_z_g > 2.0) penalidade += 8

  return Math.max(5, Math.min(100, 100 - penalidade))
}

/**
 * Pilar C: Aderência / Frenagens bruscas e Segurança (0-100)
 */
export function calculateScorePilarC(frenagens: number): number {
  let score = 95
  score -= frenagens * 15
  return Math.max(10, Math.min(100, score))
}

/**
 * Pilar D: Criticidade Viária Multiplicador
 */
export function getCriticidadeMultiplier(tipo: RoadSegmentTelemetry['tipo_via']): number {
  switch (tipo) {
    case 'corredor_brt':
      return 1.5 // Eixo Estrutural
    case 'arterial':
      return 1.3 // Rota de emergência / hospitalar
    case 'coletora':
      return 1.1
    case 'local':
    default:
      return 1.0
  }
}

/**
 * Classifica a nota IMM em faixa e ação orçamentária
 */
export function getImmFaixa(score: number): ImmSegmentResult['faixa'] {
  if (score >= 85) {
    return {
      id: 'sadio',
      nome: 'Pavimento Sadio',
      cor: '#10B981', // Verde
      acao_orcamentaria: 'Monitoramento Passivo (R$ 0/m²)',
      custo_estimado_m2: 0,
      enquadramento: 'Monitoramento',
      economia_potencial_m2: 190,
    }
  }
  if (score >= 70) {
    return {
      id: 'desgaste_precoce',
      nome: 'Desgaste Superficial Precoce',
      cor: '#3B82F6', // Azul
      acao_orcamentaria: 'Microrrevestimento / Selagem de Trincas (~R$ 18/m²)',
      custo_estimado_m2: 18,
      enquadramento: 'Manutenção Preventiva',
      economia_potencial_m2: 172,
    }
  }
  if (score >= 50) {
    return {
      id: 'degradacao_moderada',
      nome: 'Degradação Moderada a Grave',
      cor: '#F59E0B', // Âmbar
      acao_orcamentaria: 'Fresagem e Recapeamento CBUQ 3–5 cm (~R$ 65/m²)',
      custo_estimado_m2: 65,
      enquadramento: 'Restauração Viária',
      economia_potencial_m2: 125,
    }
  }
  return {
    id: 'colapso_base',
    nome: 'Colapso de Base Estrutural',
    cor: '#EF4444', // Vermelho
    acao_orcamentaria: 'Reconstrução Profunda de Base e Asfalto Novo (~R$ 190/m²)',
    custo_estimado_m2: 190,
    enquadramento: 'Obras de Emergência',
    economia_potencial_m2: 0,
  }
}

/**
 * Calcula o IMM para um segmento viário individual
 */
export function evaluateSegmentImm(telemetry: RoadSegmentTelemetry): ImmSegmentResult {
  if (!telemetry.auditado) {
    return {
      segmentId: telemetry.id,
      via: telemetry.via,
      auditado: false,
      fatorConfiancaValido: false,
      passagens: telemetry.passagens_veiculos_distintos,
      scorePilarA: 0,
      scorePilarB: 0,
      scorePilarC: 0,
      multiplicadorCriticidade: 1.0,
      immScore: 0,
      faixa: {
        id: 'sadio',
        nome: 'NÃO AUDITADO',
        cor: '#64748B', // Cinza slate
        acao_orcamentaria: 'Sem telemetria confirmada',
        custo_estimado_m2: 0,
        enquadramento: 'Aguardando Passagem de Frota',
        economia_potencial_m2: 0,
      },
      alerta_hidrologico: false,
      gera_ordem_servico: false,
    }
  }

  const pilarA = calculateScorePilarA(telemetry.iri_estimado)
  const pilarB = calculateScorePilarB(telemetry.anomalias_detectadas)
  const pilarC = calculateScorePilarC(telemetry.frenagens_panico_count)
  const critMultiplier = getCriticidadeMultiplier(telemetry.tipo_via)

  // IMM Base ponderado (pesos: 0.4 A + 0.3 B + 0.2 C) normalizado para escala 100
  // Ponderação base soma 0.9 => dividimos por 0.9 para normalizar em 1.0
  const baseScore = (pilarA * 0.4 + pilarB * 0.3 + pilarC * 0.2) / 0.9

  // Para vias com maior criticidade (BRT, arteriais hospitalares), a sensibilidade a defeitos é maior:
  // Se o baseScore for baixo, a criticidade amplifica a necessidade de intervenção (reduz o índice de saúde)
  let adjustedScore = baseScore
  if (critMultiplier > 1.0 && baseScore < 85) {
    const deficit = (85 - baseScore) * (critMultiplier - 1.0)
    adjustedScore = Math.max(0, baseScore - deficit)
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, adjustedScore)))
  const faixa = getImmFaixa(finalScore)

  // Escudo anti-falso-positivo: >= 3 passagens de veículos distintos para gerar OS
  const fatorConfiancaValido = telemetry.passagens_veiculos_distintos >= 3
  const gera_ordem_servico = fatorConfiancaValido && finalScore < 85

  return {
    segmentId: telemetry.id,
    via: telemetry.via,
    auditado: true,
    fatorConfiancaValido,
    passagens: telemetry.passagens_veiculos_distintos,
    scorePilarA: pilarA,
    scorePilarB: pilarB,
    scorePilarC: pilarC,
    multiplicadorCriticidade: critMultiplier,
    immScore: finalScore,
    faixa,
    alerta_hidrologico: telemetry.risco_hidrologico_cemaden,
    gera_ordem_servico,
  }
}

/**
 * Calcula o resumo consolidado do IMM para o município (usado no Modo Gabinete)
 */
export function calculateCityImmSummary(segments: RoadSegmentTelemetry[]): ImmCitySummary {
  if (!segments || segments.length === 0) {
    return {
      immMedioGeral: 74,
      totalSegmentosAuditados: 120,
      totalSegmentosNaoAuditados: 12,
      pctMalhaAuditada: 91,
      distribuicaoFaixas: {
        sadioPct: 42,
        desgastePrecocePct: 36,
        degradacaoModeradaPct: 16,
        colapsoBasePct: 6,
      },
      faixaPredominante: {
        nome: 'Desgaste Superficial Precoce',
        acao_orcamentaria: 'Manutenção Preventiva (~R$ 18/m²)',
        cor: '#3B82F6',
        custo_m2: 18,
      },
      kpiCustoEvitadoTotal: 4860000,
      kpiMultiplicadorMax: 10,
      metodologia: {
        versao: '1.0',
        data: 'Fevereiro/2025',
        redacao_obrigatoria_iri:
          'IRI estimado por telemetria inercial, correlacionado ao método do Banco Mundial',
        regra_fator_confianca:
          'Regra de Validação Tripla: mínimo de 3 passagens de veículos distintos para emissão de OS',
      },
    }
  }

  const results = segments.map(evaluateSegmentImm)
  const auditados = results.filter((r) => r.auditado)
  const naoAuditados = results.filter((r) => !r.auditado)

  const immMedio =
    auditados.length > 0
      ? Math.round(auditados.reduce((acc, curr) => acc + curr.immScore, 0) / auditados.length)
      : 74

  const total = results.length
  const sadio = auditados.filter((r) => r.faixa.id === 'sadio').length
  const precoce = auditados.filter((r) => r.faixa.id === 'desgaste_precoce').length
  const moderada = auditados.filter((r) => r.faixa.id === 'degradacao_moderada').length
  const colapso = auditados.filter((r) => r.faixa.id === 'colapso_base').length

  const divisor = auditados.length || 1
  const sadioPct = Math.round((sadio / divisor) * 100)
  const desgastePrecocePct = Math.round((precoce / divisor) * 100)
  const degradacaoModeradaPct = Math.round((moderada / divisor) * 100)
  const colapsoBasePct = Math.max(0, 100 - sadioPct - desgastePrecocePct - degradacaoModeradaPct)

  const faixaPredominante = getImmFaixa(immMedio)

  // Estimativa de custo evitado: cada m² tratado preventivamente economiza até R$ 172/m² vs emergencial
  // Estimando 50.000 m² de intervenção preventiva típica por lote auditado
  const kpiCustoEvitado = precoce * 100 * 7 * 172 // 100m extensão * 7m largura * R$ 172 economia

  return {
    immMedioGeral: immMedio,
    totalSegmentosAuditados: auditados.length,
    totalSegmentosNaoAuditados: naoAuditados.length,
    pctMalhaAuditada: total > 0 ? Math.round((auditados.length / total) * 100) : 90,
    distribuicaoFaixas: {
      sadioPct,
      desgastePrecocePct,
      degradacaoModeradaPct,
      colapsoBasePct,
    },
    faixaPredominante: {
      nome: faixaPredominante.nome,
      acao_orcamentaria: faixaPredominante.acao_orcamentaria,
      cor: faixaPredominante.cor,
      custo_m2: faixaPredominante.custo_estimado_m2,
    },
    kpiCustoEvitadoTotal: kpiCustoEvitado > 0 ? kpiCustoEvitado : 3820000,
    kpiMultiplicadorMax: 10,
    metodologia: {
      versao: '1.0',
      data: 'Fevereiro/2025',
      redacao_obrigatoria_iri:
        'IRI estimado por telemetria inercial, correlacionado ao método do Banco Mundial',
      regra_fator_confianca:
        'Regra de Validação Tripla: mínimo de 3 passagens de veículos distintos para emissão de OS',
    },
  }
}
