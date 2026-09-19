import {
  VeiculoTipoCalibracao,
  VEICULO_TIPOS_CONFIG,
  CalibracaoResultadoPorTipo,
  FatorKCalibrationRecord,
  FieldSessionRecord,
} from '@/services/fatorKCalibration'
import { RoadSegmentRecord, SegmentReadingRecord } from '@/services/roadSegments'

/**
 * Normaliza strings livres para uma das 5 chaves canônicas de tipo de veículo
 */
export function normalizeVeiculoTipo(input?: string): VeiculoTipoCalibracao {
  if (!input) return 'onibus'
  const str = input.toLowerCase()

  // Onda 3 — Modos de Mobilidade Ativa
  if (
    str.includes('pedestre') ||
    str.includes('caminhada') ||
    str.includes('calcada') ||
    str.includes('calçada') ||
    str.includes('a pé') ||
    str.includes('passeio')
  ) {
    return 'pedestre'
  }
  if (
    str.includes('ciclista') ||
    str.includes('bicicleta') ||
    str.includes('bike') ||
    str.includes('ciclovia') ||
    str.includes('ciclofaixa')
  ) {
    return 'ciclista'
  }
  if (
    str.includes('motociclista') ||
    str.includes('moto') ||
    str.includes('motocicleta') ||
    str.includes('duas rodas')
  ) {
    return 'motociclista'
  }

  // Frotas Veiculares (Onda 1)
  if (
    str.includes('onibus') ||
    str.includes('ônibus') ||
    str.includes('brt') ||
    str.includes('ligeirinho')
  ) {
    return 'onibus'
  }
  if (
    str.includes('viatura') ||
    str.includes('guarda') ||
    str.includes('policia') ||
    str.includes('polícia')
  ) {
    return 'viatura'
  }
  if (
    str.includes('caminhao') ||
    str.includes('caminhão') ||
    str.includes('coleta') ||
    str.includes('cacamba') ||
    str.includes('caçamba')
  ) {
    return 'caminhao'
  }
  if (
    str.includes('ambulancia') ||
    str.includes('ambulância') ||
    str.includes('samu') ||
    str.includes('resgate')
  ) {
    return 'ambulancia'
  }
  return 'outros'
}

/**
 * Processa a calibração de todos os tipos de veículos a partir dos dados reais:
 * 1. Segmentos validados pelo Escudo Anti-Falso-Positivo (Fator de Confiança F >= 3)
 * 2. Leituras de janela agrupadas por segmento e tipo de veículo
 * 3. Sessões de campo concluídas
 * 4. Configurações de auditoria ativas
 */
export function computeFatorKCalibration(params: {
  roadSegments: RoadSegmentRecord[]
  readings: SegmentReadingRecord[]
  sessions: FieldSessionRecord[]
  savedCalibrations: FatorKCalibrationRecord[]
}): Record<VeiculoTipoCalibracao, CalibracaoResultadoPorTipo> {
  const { roadSegments, readings, sessions, savedCalibrations } = params

  const tipos = Object.keys(VEICULO_TIPOS_CONFIG) as VeiculoTipoCalibracao[]

  // Mapa de segmentos validados (F >= 3 passagens)
  const validatedSegmentIds = new Set(
    roadSegments
      .filter((s) => s.fator_confianca_valido || s.passagens_veiculos_distintos >= 3)
      .map((s) => s.segmento_id),
  )

  // Agrupar leituras por segmento e por tipo normalizado de veículo
  const readingsBySegmentAndType = new Map<
    string,
    Map<VeiculoTipoCalibracao, SegmentReadingRecord[]>
  >()
  // E leituras gerais por tipo
  const readingsByType = new Map<VeiculoTipoCalibracao, SegmentReadingRecord[]>()
  tipos.forEach((t) => readingsByType.set(t, []))

  readings.forEach((r) => {
    const tipo = normalizeVeiculoTipo(r.veiculo_tipo)
    const list = readingsByType.get(tipo) || []
    list.push(r)
    readingsByType.set(tipo, list)

    if (!readingsBySegmentAndType.has(r.segmento_id)) {
      readingsBySegmentAndType.set(r.segmento_id, new Map())
    }
    const segMap = readingsBySegmentAndType.get(r.segmento_id)!
    if (!segMap.has(tipo)) {
      segMap.set(tipo, [])
    }
    segMap.get(tipo)!.push(r)
  })

  // Agrupar sessões por tipo
  const sessionsByType = new Map<VeiculoTipoCalibracao, FieldSessionRecord[]>()
  tipos.forEach((t) => sessionsByType.set(t, []))
  sessions.forEach((s) => {
    const tipo = normalizeVeiculoTipo(s.veiculo_tipo)
    const list = sessionsByType.get(tipo) || []
    list.push(s)
    sessionsByType.set(tipo, list)
  })

  // Média global de RMS sobre segmentos validados para servir de âncora neutra
  const allValidatedReadings = readings.filter(
    (r) => validatedSegmentIds.has(r.segmento_id) && (r.rms_vertical || 0) > 0,
  )
  const globalValidatedAvgRms =
    allValidatedReadings.length > 0
      ? allValidatedReadings.reduce((sum, r) => sum + (r.rms_vertical || 0.15), 0) /
        allValidatedReadings.length
      : 0.18

  const result = {} as Record<VeiculoTipoCalibracao, CalibracaoResultadoPorTipo>

  tipos.forEach((tipo) => {
    const config = VEICULO_TIPOS_CONFIG[tipo]
    const saved = savedCalibrations.find((c) => c.veiculo_tipo === tipo)
    const tipoReadings = readingsByType.get(tipo) || []
    const tipoSessions = sessionsByType.get(tipo) || []

    // Segmentos com leituras deste tipo
    const segmentsWithThisType = new Set(tipoReadings.map((r) => r.segmento_id))
    // Segmentos validados (F >= 3) onde este tipo passou
    const validatedWithThisType = Array.from(segmentsWithThisType).filter((segId) =>
      validatedSegmentIds.has(segId),
    )

    // Distância acumulada nas sessões (ou estimada das leituras de 100m)
    let kmAcumulado = tipoSessions.reduce((acc, s) => acc + (s.distancia_metros || 0) / 1000, 0)
    if (kmAcumulado === 0 && tipoReadings.length > 0) {
      kmAcumulado = tipoReadings.length * 0.1 // 100m por leitura agregada
    }
    kmAcumulado = Number(kmAcumulado.toFixed(1))

    const sessoesCount = tipoSessions.length
    const janelasCount = tipoReadings.length
    const segmentosValidadosCount = validatedWithThisType.length

    // Encontrar segmentos compartilhados: trechos validados (F >= 3) onde este tipo E outros tipos passaram
    const sharedSegments: string[] = []
    const ratiosShared: number[] = []

    validatedWithThisType.forEach((segId) => {
      const segMap = readingsBySegmentAndType.get(segId)
      if (!segMap) return

      const thisTypeReadings = segMap.get(tipo) || []
      const thisTypeRms =
        thisTypeReadings.length > 0
          ? thisTypeReadings.reduce((s, r) => s + (r.rms_vertical || 0), 0) /
            thisTypeReadings.length
          : 0

      // Média dos outros tipos neste mesmo segmento
      const otherReadings: SegmentReadingRecord[] = []
      segMap.forEach((rList, otherTipo) => {
        if (otherTipo !== tipo) {
          otherReadings.push(...rList)
        }
      })

      if (thisTypeRms > 0 && otherReadings.length > 0) {
        const otherAvgRms =
          otherReadings.reduce((s, r) => s + (r.rms_vertical || 0), 0) / otherReadings.length
        if (otherAvgRms > 0) {
          sharedSegments.push(segId)
          // Razão: se este tipo vibra mais que os outros para o mesmo defeito, ratio > 1.0
          ratiosShared.push(thisTypeRms / otherAvgRms)
        }
      }
    })

    // RMS médio deste tipo
    const validRmsList = tipoReadings
      .filter((r) => validatedSegmentIds.has(r.segmento_id) && (r.rms_vertical || 0) > 0)
      .map((r) => r.rms_vertical!)
    const avgRmsTipo =
      validRmsList.length > 0
        ? validRmsList.reduce((a, b) => a + b, 0) / validRmsList.length
        : tipoReadings.length > 0
          ? tipoReadings.reduce((a, r) => a + (r.rms_vertical || 0.15), 0) / tipoReadings.length
          : 0.18

    // IRI médio deste tipo
    const validIriList = tipoReadings
      .filter((r) => (r.iri_janela || 0) > 0)
      .map((r) => r.iri_janela!)
    const avgIriTipo =
      validIriList.length > 0 ? validIriList.reduce((a, b) => a + b, 0) / validIriList.length : 3.2

    // Determinar método e Fator K calibrado sugerido
    let metodoUtilizado: 'razao_segmentos_compartilhados' | 'media_absoluta_rms' | 'baseline_puro' =
      'baseline_puro'
    let descricaoMetodo = ''
    let calibradoSugerido = config.baselineK

    // Para modos ativos (pedestre/ciclista/moto), o baseline possui faixas específicas
    const minBound = config.modoCategoria === 'pedestre' ? 0.5 : 0.6
    const maxBound = config.modoCategoria === 'ciclista' ? 2.1 : 1.9

    if (sharedSegments.length >= 2 && ratiosShared.length >= 2) {
      metodoUtilizado = 'razao_segmentos_compartilhados'
      const avgRatio = ratiosShared.reduce((a, b) => a + b, 0) / ratiosShared.length
      const rawCalib = config.baselineK * (0.6 + 0.4 * avgRatio)
      calibradoSugerido = Number(Math.max(minBound, Math.min(maxBound, rawCalib)).toFixed(2))
      descricaoMetodo = `Razão empírica em ${sharedSegments.length} segmento(s) compartilhado(s) de 100m com Fator de Confiança F ≥ 3 (razão média observada: ${avgRatio.toFixed(2)}x).`
    } else if (tipoReadings.length >= 3 && avgRmsTipo > 0) {
      metodoUtilizado = 'media_absoluta_rms'
      const ratioGlobal = avgRmsTipo / (globalValidatedAvgRms || 0.18)
      const rawCalib = config.baselineK * (0.75 + 0.25 * ratioGlobal)
      calibradoSugerido = Number(Math.max(minBound, Math.min(maxBound, rawCalib)).toFixed(2))
      descricaoMetodo = `Média inercial absoluta das janelas de campo (${avgRmsTipo.toFixed(2)}g RMS) vs referência de malha (${globalValidatedAvgRms.toFixed(2)}g RMS), com fallback sem cruzamento direto.`
    } else {
      metodoUtilizado = 'baseline_puro'
      calibradoSugerido = config.baselineK
      descricaoMetodo = `Sem amostragem de campo suficiente. Mantendo baseline de engenharia teórica (${config.baselineK.toFixed(2)}).`
    }

    // Diferença percentual entre baseline e calibrado
    const difPct = Number(
      (((calibradoSugerido - config.baselineK) / config.baselineK) * 100).toFixed(1),
    )

    // Avaliar status de confiabilidade
    // Limiar recomendado: mínimo de 5 sessões OU 50 km acumulados
    const MIN_SESSOES = 5
    const MIN_KM = 50
    const progressoSessoes = Math.min(100, (sessoesCount / MIN_SESSOES) * 100)
    const progressoKm = Math.min(100, (kmAcumulado / MIN_KM) * 100)
    const percentualProgresso = Math.round(Math.max(progressoSessoes, progressoKm))

    let confiabilidadeStatus: 'insuficiente' | 'moderada' | 'alta' = 'insuficiente'
    let confiabilidadeMotivo = ''

    if (sessoesCount >= MIN_SESSOES || kmAcumulado >= MIN_KM) {
      confiabilidadeStatus = 'alta'
      confiabilidadeMotivo = `Amostra robusta confirmada: ${sessoesCount} sessões e ${kmAcumulado} km percorridos, atendendo o limiar do produto (mínimo de ${MIN_SESSOES} sessões ou ${MIN_KM} km).`
    } else if (sessoesCount >= 2 || kmAcumulado >= 15) {
      confiabilidadeStatus = 'moderada'
      confiabilidadeMotivo = `Amostra em consolidação: ${sessoesCount}/${MIN_SESSOES} sessões e ${kmAcumulado}/${MIN_KM} km. Sugestão aplicável com aviso de calibração preliminar.`
    } else {
      confiabilidadeStatus = 'insuficiente'
      confiabilidadeMotivo = `Amostra insuficiente: mínimo recomendado de ${MIN_SESSOES} sessões de campo ou ${MIN_KM} km rodados por tipo de veículo (atual: ${sessoesCount} sessões / ${kmAcumulado} km).`
    }

    // Status de aplicação persistido
    const statusAplicacao = saved?.status_aplicacao || 'baseline'
    const aplicadoK = saved ? saved.valor_aplicado : config.baselineK

    result[tipo] = {
      tipo,
      config,
      baselineK: config.baselineK,
      calibradoSugerido,
      aplicadoK,
      statusAplicacao,
      diferencaPercentual: difPct,
      amostras: {
        sessoes: sessoesCount,
        segmentosValidados: segmentosValidadosCount,
        janelasTotal: janelasCount,
        kmAcumulado,
      },
      confiabilidade: {
        status: confiabilidadeStatus,
        motivo: confiabilidadeMotivo,
        percentualProgresso,
      },
      metodologia: {
        metodoUtilizado,
        descricaoMetodo,
        segmentosCompartilhadosCount: sharedSegments.length,
        rmsMedio: Number(avgRmsTipo.toFixed(3)),
        iriEstimadoMedio: Number(avgIriTipo.toFixed(2)),
      },
      auditoria: saved?.auditoria_historico
        ? {
            usuario: saved.auditoria_usuario,
            data: saved.auditoria_data,
            historico: saved.auditoria_historico,
          }
        : undefined,
      recordId: saved?.id,
    }
  })

  return result
}
