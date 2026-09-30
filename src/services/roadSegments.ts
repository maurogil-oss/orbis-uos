import pb from '@/lib/pocketbase/client'
import {
  getImmFaixa,
  calculateScorePilarA,
  calculateScorePilarB,
  calculateScorePilarC,
} from '@/lib/diagnostics/immEngine'
import { latLngToCell, getH3ResolutionForModo } from '@/lib/diagnostics/h3Engine'

export type AgentTaxonomyCode =
  | 'VEICULO_FROTA'
  | 'ONIBUS_FROTA'
  | 'MOTOCICLISTA'
  | 'CICLISTA'
  | 'PEDESTRE'
  | 'PASSAGEIRO_ONIBUS'
  | 'OUTRO'

export interface SegmentReadingRecord {
  id: string
  segmento_id: string
  codigo_ibge: string
  via: string
  bairro?: string
  veiculo_id: string
  veiculo_tipo?: string
  modo_coleta?: 'veiculo_frota' | 'pedestre' | 'ciclista' | 'motociclista'
  indice_alvo?: 'IMV' | 'IMA'
  agent_code?: AgentTaxonomyCode
  desvio_angular_taxa?: number
  rms_vertical?: number
  pico_acel_z?: number
  impactos_count?: number
  solavancos_angulares?: number
  iri_janela?: number
  velocidade_media_kmh?: number
  freq_dominante_hz?: number
  energia_banda_alvo_pct?: number
  latitude?: number
  longitude?: number
  h3_index?: string
  h3_resolution?: number
  janelas_amostradas?: number
  duracao_janela_ms?: number
  created: string
  updated: string
}

export interface CreateSegmentReadingPayload {
  segmento_id: string
  codigo_ibge: string
  via: string
  bairro?: string
  veiculo_id: string
  veiculo_tipo?: string
  modo_coleta?: 'veiculo_frota' | 'pedestre' | 'ciclista' | 'motociclista'
  indice_alvo?: 'IMV' | 'IMA'
  agent_code?: AgentTaxonomyCode
  desvio_angular_taxa?: number
  rms_vertical: number
  pico_acel_z: number
  impactos_count: number
  solavancos_angulares: number
  iri_janela: number
  velocidade_media_kmh: number
  freq_dominante_hz: number
  energia_banda_alvo_pct: number
  latitude: number
  longitude: number
  h3_index?: string
  h3_resolution?: number
  janelas_amostradas: number
  duracao_janela_ms: number
}

export interface RoadSegmentRecord {
  id: string
  segmento_id: string
  codigo_ibge: string
  via: string
  bairro?: string
  tipo_via?: 'corredor_brt' | 'arterial' | 'coletora' | 'local'
  extensao_metros: number
  passagens_veiculos_distintos: number
  veiculos_registrados: string[]
  fator_confianca_valido: boolean
  iri_estimado: number
  total_impactos: number
  pico_max_z: number
  solavancos_angulares_total: number
  score_imm: number
  faixa_imm: string
  score_ima?: number
  faixa_ima?: string
  passagens_modos_ativos?: number
  desvios_coletivos_count?: number
  latitude_centro?: number
  longitude_centro?: number
  h3_index?: string
  h3_resolution?: number
  ultima_passagem?: string
  created: string
  updated: string
}

/**
 * Cria ou calcula um ID determinístico de segmento de 100m com base na latitude e longitude.
 * Em 1 grau de latitude há aprox 111.000 metros -> 100 metros = ~0.0009 graus (~3 casas decimais ajustadas).
 */
export function computeSegmentId(lat: number, lng: number, codigoIbge: string = '4106902'): string {
  // Quantização para célula de ~100m x ~100m
  const latStep = 0.0009
  const lngStep = 0.001
  const latIndex = Math.floor(lat / latStep)
  const lngIndex = Math.floor(lng / lngStep)
  return `SEG-${codigoIbge}-${latIndex}-${lngIndex}`
}

/**
 * Persiste uma leitura de janela agregada da FFT de borda no PocketBase.
 */
export async function createSegmentReading(
  payload: CreateSegmentReadingPayload,
): Promise<SegmentReadingRecord> {
  // Atribuição nativa da célula H3 se ainda não preenchida
  if (!payload.h3_index && payload.latitude && payload.longitude) {
    const res = getH3ResolutionForModo(payload.modo_coleta)
    payload.h3_resolution = res
    payload.h3_index = latLngToCell(payload.latitude, payload.longitude, res)
  }
  const record = await pb.collection('segment_readings').create<SegmentReadingRecord>(payload)
  return record
}

/**
 * Registra a passagem de um veículo no segmento de 100m, atualizando o Fator de Confiança (>= 3 veículos).
 */
export async function registerSegmentPassage(
  reading: CreateSegmentReadingPayload,
): Promise<RoadSegmentRecord> {
  const {
    segmento_id,
    codigo_ibge,
    via,
    bairro,
    veiculo_id,
    iri_janela,
    pico_acel_z,
    impactos_count,
    solavancos_angulares,
    latitude,
    longitude,
  } = reading

  // Procurar segmento existente
  let existing: RoadSegmentRecord | null = null
  try {
    const list = await pb.collection('road_segments').getList<RoadSegmentRecord>(1, 1, {
      filter: `segmento_id = '${segmento_id}' && codigo_ibge = '${codigo_ibge}'`,
    })
    if (list.items.length > 0) {
      existing = list.items[0]
    }
  } catch (err) {
    console.warn('Erro ao buscar road_segment:', err)
  }

  const nowIso = new Date().toISOString()

  if (!existing) {
    // Tentar criar novo segmento com a 1ª passagem.
    // Tratamento de concorrência / colisão de índice único (idx_road_segments_seg_ibge):
    // Se outra janela simultânea gravou no mesmo milissegundo, recupera o existente e atualiza.
    const veiculos = [veiculo_id]
    const passagensCount = 1
    const confiancaValida = passagensCount >= 3

    // Score IMV / IMM provisório
    const pilarA = calculateScorePilarA(iri_janela)
    const pilarB = calculateScorePilarB({
      trincas_iniciais: impactos_count > 0 ? 1 : 0,
      buracos_medios: pico_acel_z > 2.5 ? 1 : 0,
      crateras_severas: pico_acel_z > 3.8 ? 1 : 0,
      max_acel_z_g: pico_acel_z,
    })
    const pilarC = calculateScorePilarC(solavancos_angulares > 0 ? 1 : 0)
    const baseScore = Math.round((pilarA * 0.4 + pilarB * 0.3 + pilarC * 0.2) / 0.9)
    const faixa = getImmFaixa(baseScore)

    const isModoAtivo = reading.modo_coleta && reading.modo_coleta !== 'veiculo_frota'
    const desviosInit = reading.desvio_angular_taxa || 0

    // Cálculo da resolução H3 (9 para veicular, 10 para modos ativos)
    const h3Resolution = reading.h3_resolution || getH3ResolutionForModo(reading.modo_coleta)
    const h3Cell = reading.h3_index || latLngToCell(latitude, longitude, h3Resolution)

    try {
      const newRecord = await pb.collection('road_segments').create<RoadSegmentRecord>({
        segmento_id,
        codigo_ibge,
        via,
        bairro: bairro || 'Curitiba',
        tipo_via: via.toLowerCase().includes('av') ? 'arterial' : 'coletora',
        extensao_metros: 100,
        passagens_veiculos_distintos: passagensCount,
        veiculos_registrados: veiculos,
        fator_confianca_valido: confiancaValida,
        iri_estimado: Number(iri_janela.toFixed(2)),
        total_impactos: impactos_count,
        pico_max_z: Number(pico_acel_z.toFixed(2)),
        solavancos_angulares_total: solavancos_angulares,
        score_imm: baseScore,
        faixa_imm: faixa.nome,
        passagens_modos_ativos: isModoAtivo ? 1 : 0,
        desvios_coletivos_count: desviosInit,
        latitude_centro: latitude,
        longitude_centro: longitude,
        h3_index: h3Cell,
        h3_resolution: h3Resolution,
        ultima_passagem: nowIso,
      })
      return newRecord
    } catch (createErr: any) {
      // Conflito de unicidade (outra janela gravou entre o get e o create)
      console.warn(
        '[registerSegmentPassage] Conflito detectado na criação de road_segment, recuperando registro para update:',
        createErr?.message,
      )
      const list = await pb.collection('road_segments').getList<RoadSegmentRecord>(1, 1, {
        filter: `segmento_id = '${segmento_id}' && codigo_ibge = '${codigo_ibge}'`,
      })
      if (list.items.length > 0) {
        existing = list.items[0]
      } else {
        throw createErr
      }
    }
  }

  // Segmento já existe: somar veículo distinto se ainda não passou
  const veiculosSet = new Set(existing.veiculos_registrados || [])
  veiculosSet.add(veiculo_id)
  const veiculosArray = Array.from(veiculosSet)
  const passagensCount = veiculosArray.length
  const confiancaValida = passagensCount >= 3

  const isModoAtivo = reading.modo_coleta && reading.modo_coleta !== 'veiculo_frota'
  const updatedModosAtivos = isModoAtivo
    ? (existing.passagens_modos_ativos || 0) + 1
    : existing.passagens_modos_ativos || 0
  const updatedDesvios =
    (existing.desvios_coletivos_count || 0) + (reading.desvio_angular_taxa || 0)

  // Recalcular médias ponderadas
  const novoIri = Number(((existing.iri_estimado + iri_janela) / 2).toFixed(2))
  const novoPicoZ = Number(Math.max(existing.pico_max_z || 0, pico_acel_z).toFixed(2))
  const novoTotalImpactos = (existing.total_impactos || 0) + impactos_count
  const novoSolavancos = (existing.solavancos_angulares_total || 0) + solavancos_angulares

  const pilarA = calculateScorePilarA(novoIri)
  const pilarB = calculateScorePilarB({
    trincas_iniciais: novoTotalImpactos > 2 ? 2 : 1,
    buracos_medios: novoPicoZ > 2.5 ? 1 : 0,
    crateras_severas: novoPicoZ > 3.8 ? 1 : 0,
    max_acel_z_g: novoPicoZ,
  })
  const pilarC = calculateScorePilarC(novoSolavancos > 0 ? 1 : 0)
  const baseScore = Math.round((pilarA * 0.4 + pilarB * 0.3 + pilarC * 0.2) / 0.9)
  const faixa = getImmFaixa(baseScore)

  const h3Res = reading.h3_resolution || getH3ResolutionForModo(reading.modo_coleta)
  const h3Cell = existing.h3_index || reading.h3_index || latLngToCell(latitude, longitude, h3Res)

  const updatedRecord = await pb
    .collection('road_segments')
    .update<RoadSegmentRecord>(existing.id, {
      passagens_veiculos_distintos: passagensCount,
      veiculos_registrados: veiculosArray,
      fator_confianca_valido: confiancaValida,
      iri_estimado: novoIri,
      total_impactos: novoTotalImpactos,
      pico_max_z: novoPicoZ,
      solavancos_angulares_total: novoSolavancos,
      score_imm: baseScore,
      faixa_imm: faixa.nome,
      passagens_modos_ativos: updatedModosAtivos,
      desvios_coletivos_count: updatedDesvios,
      h3_index: h3Cell,
      h3_resolution: h3Res,
      ultima_passagem: nowIso,
    })

  return updatedRecord
}

/**
 * Listar segmentos de estrada com seus status de confiança
 */
export async function listRoadSegments(
  codigoIbge: string = '4106902',
): Promise<RoadSegmentRecord[]> {
  try {
    const records = await pb.collection('road_segments').getFullList<RoadSegmentRecord>({
      filter: `codigo_ibge = '${codigoIbge}'`,
      sort: '-updated',
    })
    return records
  } catch (err) {
    console.warn('Erro ao listar road_segments:', err)
    return []
  }
}
