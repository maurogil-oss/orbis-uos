import pb from '@/lib/pocketbase/client'

export type VeiculoTipoCalibracao =
  | 'onibus'
  | 'viatura'
  | 'caminhao'
  | 'ambulancia'
  | 'outros'
  | 'pedestre'
  | 'ciclista'
  | 'motociclista'

export type ModoMobilidadeColeta = 'veiculo_frota' | 'pedestre' | 'ciclista' | 'motociclista'

export interface VeiculoTipoOption {
  id: VeiculoTipoCalibracao
  label: string
  sublabel: string
  icone: string // identificador de ícone visual
  baselineK: number // Fator K padrão teórico fixo
  descricaoDinamica: string // ex: chassi pesado, suspensão rígida, suspensão mista
  suspensaoTipo: string
  modoCategoria: ModoMobilidadeColeta
  indiceAlvo: 'IMV' | 'IMA'
  bandaFftHz: { min: number; max: number; label: string }
  trataViesDesvio: boolean
  dicaOperador: string
}

export const VEICULO_TIPOS_CONFIG: Record<VeiculoTipoCalibracao, VeiculoTipoOption> = {
  onibus: {
    id: 'onibus',
    label: 'Ônibus Urbano / BRT',
    sublabel: 'Chassi pesado / suspensão a ar ou feixe duplo',
    icone: 'bus',
    baselineK: 1.15,
    descricaoDinamica:
      'Alta massa inercial, atenua microfissuras e amplifica oscilações de baixa frequência.',
    suspensaoTipo: 'Pneumática / Feixe Misto',
    modoCategoria: 'veiculo_frota',
    indiceAlvo: 'IMV',
    bandaFftHz: { min: 1.0, max: 20.0, label: '1–20 Hz' },
    trataViesDesvio: false,
    dicaOperador: 'Fixar no suporte firme do painel do veículo.',
  },
  viatura: {
    id: 'viatura',
    label: 'Viatura Policial / Guarda',
    sublabel: 'Sedan / SUV médio com suspensão rígida reforçada',
    icone: 'shield',
    baselineK: 0.9,
    descricaoDinamica:
      'Chassi leve e suspensão esportiva/reforçada, capta impactos de alta frequência com nitidez.',
    suspensaoTipo: 'Independente McPherson Reforçada',
    modoCategoria: 'veiculo_frota',
    indiceAlvo: 'IMV',
    bandaFftHz: { min: 1.0, max: 20.0, label: '1–20 Hz' },
    trataViesDesvio: false,
    dicaOperador: 'Fixar no suporte veicular no para-brisa ou painel.',
  },
  caminhao: {
    id: 'caminhao',
    label: 'Caminhão de Coleta / Obras',
    sublabel: 'Eixo rígido pesado / feixe de molas',
    icone: 'truck',
    baselineK: 1.35,
    descricaoDinamica:
      'Rigidez torsional severa com carga variável, resposta vertical com picos elevados.',
    suspensaoTipo: 'Eixo Rígido com Feixe de Molas',
    modoCategoria: 'veiculo_frota',
    indiceAlvo: 'IMV',
    bandaFftHz: { min: 1.0, max: 20.0, label: '1–20 Hz' },
    trataViesDesvio: false,
    dicaOperador: 'Fixar no painel da cabine do caminhão.',
  },
  ambulancia: {
    id: 'ambulancia',
    label: 'Ambulância / SAMU',
    sublabel: 'Furgão / chassi adaptado com suspensão intermediária',
    icone: 'ambulance',
    baselineK: 1.05,
    descricaoDinamica:
      'Acomodação calibrada para transporte de pacientes, resposta inercial balanceada.',
    suspensaoTipo: 'Mista Estabilizada',
    modoCategoria: 'veiculo_frota',
    indiceAlvo: 'IMV',
    bandaFftHz: { min: 1.0, max: 20.0, label: '1–20 Hz' },
    trataViesDesvio: false,
    dicaOperador: 'Fixar no painel frontal da viatura de resgate.',
  },
  outros: {
    id: 'outros',
    label: 'Outros Veículos Oficiais',
    sublabel: 'Veículos leves e utilitários de fiscalização',
    icone: 'car',
    baselineK: 1.0,
    descricaoDinamica: 'Padrão neutro de referência unitária para frotas institucionais diversas.',
    suspensaoTipo: 'Convencional',
    modoCategoria: 'veiculo_frota',
    indiceAlvo: 'IMV',
    bandaFftHz: { min: 1.0, max: 20.0, label: '1–20 Hz' },
    trataViesDesvio: false,
    dicaOperador: 'Fixar no suporte do veículo leve oficial.',
  },

  // Onda 3: Modos de Mobilidade Ativa (Alimenta o IMA)
  pedestre: {
    id: 'pedestre',
    label: 'Pedestre (Calçadas)',
    sublabel: 'Caminhada urbana / rotas a pé e passeios públicos',
    icone: 'footprints',
    baselineK: 0.75, // Passo humano amortece aceleração de impacto direto; K < 1.0 normaliza a leitura
    descricaoDinamica:
      'Cadência biomecânica do passo humano (0.8–3.5 Hz). Detecta degraus, desníveis de ladrilho, buracos e rampas.',
    suspensaoTipo: 'Biomecânica Humana (Passo)',
    modoCategoria: 'pedestre',
    indiceAlvo: 'IMA',
    bandaFftHz: { min: 0.8, max: 3.5, label: '0.8–3.5 Hz (Banda do Passo)' },
    trataViesDesvio: true,
    dicaOperador: 'LGPD: Celular seguro no bolso, bolsa ou mão durante a caminhada na calçada.',
  },
  ciclista: {
    id: 'ciclista',
    label: 'Ciclista (Ciclovias)',
    sublabel: 'Bicicleta / ciclofaixas e micromobilidade',
    icone: 'bike',
    baselineK: 1.45, // Garfo rígido sem amortecedor amplifica impactos diretos; K > 1.0 equaliza a severidade
    descricaoDinamica:
      'Alta rigidez sem suspensão mecânica, sensível a fissuras transversais, sarjetas e tampas de bueiro.',
    suspensaoTipo: 'Garfo Rígido / Pneu de Pressão',
    modoCategoria: 'ciclista',
    indiceAlvo: 'IMA',
    bandaFftHz: { min: 2.0, max: 12.0, label: '2–12 Hz (Micromobilidade)' },
    trataViesDesvio: false,
    dicaOperador: 'LGPD: Celular no suporte do guidão ou no bolso do ciclista.',
  },
  motociclista: {
    id: 'motociclista',
    label: 'Motociclista (Pistas)',
    sublabel: 'Duas rodas motorizadas / alta densidade e desvio',
    icone: 'motorcycle',
    baselineK: 1.25, // Amortecedor de 2 rodas com inclinação lateral e rolagem
    descricaoDinamica:
      'Alta frequência de rolagem com desvio dinâmico de buracos. Complemento de densidade viária e acessibilidade.',
    suspensaoTipo: 'Garfo Telescópico Dianteiro / Monoshock',
    modoCategoria: 'motociclista',
    indiceAlvo: 'IMA',
    bandaFftHz: { min: 3.0, max: 22.0, label: '3–22 Hz (Duas Rodas)' },
    trataViesDesvio: true,
    dicaOperador: 'LGPD: Celular no suporte da moto ou na jaqueta com zíper.',
  },
}

export interface FatorKCalibrationRecord {
  id?: string
  codigo_ibge: string
  veiculo_tipo: VeiculoTipoCalibracao
  valor_baseline: number
  valor_calibrado_sugerido: number
  valor_aplicado: number
  status_aplicacao: 'baseline' | 'calibrado_ativo' | 'customizado'
  amostras_sessoes: number
  amostras_segmentos: number
  km_acumulado: number
  confiabilidade_status: 'insuficiente' | 'moderada' | 'alta'
  metodologia_detalhes?: {
    metodo: 'razao_segmentos_compartilhados' | 'media_absoluta_rms' | 'baseline_puro'
    fator_confianca_minimo: number
    segmentos_compartilhados_count: number
    rms_medio_tipo: number
    rms_medio_baseline: number
    dif_percentual: number
    data_calculo: string
  }
  auditoria_usuario?: string
  auditoria_data?: string
  auditoria_historico?: Array<{
    data: string
    usuario: string
    valor_anterior: number
    valor_novo: number
    motivo: string
  }>
  created?: string
  updated?: string
}

export type AgentTaxonomyCode =
  | 'VEICULO_FROTA'
  | 'ONIBUS_FROTA'
  | 'MOTOCICLISTA'
  | 'CICLISTA'
  | 'PEDESTRE'
  | 'PASSAGEIRO_ONIBUS'
  | 'OUTRO'

export interface FieldSessionRecord {
  id: string
  session_code: string
  codigo_ibge: string
  veiculo_tipo: string
  veiculo_id?: string
  linha_frota?: string
  modo_coleta?: ModoMobilidadeColeta
  indice_alvo?: 'IMV' | 'IMA'
  agent_code?: AgentTaxonomyCode
  desvios_detectados?: number
  banda_fft_min_hz?: number
  banda_fft_max_hz?: number
  via_inicial?: string
  bairro?: string
  duracao_ms: number
  distancia_metros: number
  janelas_processadas: number
  impactos_detectados: number
  segmentos_cobertos: string[]
  iri_medio: number
  pico_g: number
  operador_nome?: string
  created?: string
  updated?: string
}
export interface CalibracaoResultadoPorTipo {
  tipo: VeiculoTipoCalibracao
  config: VeiculoTipoOption
  baselineK: number
  calibradoSugerido: number
  aplicadoK: number
  statusAplicacao: 'baseline' | 'calibrado_ativo' | 'customizado'
  diferencaPercentual: number // % ex: +6.5% ou -4.2%
  amostras: {
    sessoes: number
    segmentosValidados: number
    janelasTotal: number
    kmAcumulado: number
  }
  confiabilidade: {
    status: 'insuficiente' | 'moderada' | 'alta'
    motivo: string
    percentualProgresso: number // 0-100% até atingir limiar ideal
  }
  metodologia: {
    metodoUtilizado: 'razao_segmentos_compartilhados' | 'media_absoluta_rms' | 'baseline_puro'
    descricaoMetodo: string
    segmentosCompartilhadosCount: number
    rmsMedio: number
    iriEstimadoMedio: number
  }
  auditoria?: {
    usuario?: string
    data?: string
    historico?: Array<{
      data: string
      usuario: string
      valor_anterior: number
      valor_novo: number
      motivo: string
    }>
  }
  recordId?: string
}

/**
 * Salva ou atualiza uma sessão de campo concluída
 */
export async function createFieldSession(
  payload: Omit<FieldSessionRecord, 'id' | 'created' | 'updated'>,
): Promise<FieldSessionRecord> {
  const record = await pb.collection('field_sessions').create<FieldSessionRecord>(payload)
  return record
}

/**
 * Lista todas as sessões de campo registradas
 */
export async function listFieldSessions(
  codigoIbge: string = '4106902',
): Promise<FieldSessionRecord[]> {
  try {
    const records = await pb.collection('field_sessions').getFullList<FieldSessionRecord>({
      filter: `codigo_ibge = '${codigoIbge}'`,
      sort: '-created',
    })
    return records
  } catch (err) {
    console.warn('Erro ao listar field_sessions:', err)
    return []
  }
}

/**
 * Busca os registros de calibração persistidos para o município
 */
export async function getFatorKCalibrations(
  codigoIbge: string = '4106902',
): Promise<FatorKCalibrationRecord[]> {
  try {
    const records = await pb
      .collection('fator_k_calibrations')
      .getFullList<FatorKCalibrationRecord>({
        filter: `codigo_ibge = '${codigoIbge}'`,
        sort: 'veiculo_tipo',
      })
    return records
  } catch (err) {
    console.warn('Erro ao listar fator_k_calibrations:', err)
    return []
  }
}

/**
 * Aplica a calibração de um tipo específico de veículo ou global
 */
export async function applyFatorKCalibration(params: {
  codigoIbge: string
  veiculoTipo: VeiculoTipoCalibracao
  valorAplicar: number
  status: 'calibrado_ativo' | 'baseline' | 'customizado'
  usuarioNome: string
  motivo?: string
  resultadoCalibrado?: CalibracaoResultadoPorTipo
}): Promise<FatorKCalibrationRecord> {
  const { codigoIbge, veiculoTipo, valorAplicar, status, usuarioNome, motivo, resultadoCalibrado } =
    params
  const nowIso = new Date().toISOString()

  // Buscar registro existente
  let existing: FatorKCalibrationRecord | null = null
  try {
    const list = await pb
      .collection('fator_k_calibrations')
      .getList<FatorKCalibrationRecord>(1, 1, {
        filter: `codigo_ibge = '${codigoIbge}' && veiculo_tipo = '${veiculoTipo}'`,
      })
    if (list.items.length > 0) {
      existing = list.items[0]
    }
  } catch {
    /* intentionally ignored */
  }

  const config = VEICULO_TIPOS_CONFIG[veiculoTipo]
  const valorAnterior = existing ? existing.valor_aplicado : config.baselineK
  const novoHistorico = [
    ...(existing?.auditoria_historico || []),
    {
      data: nowIso,
      usuario: usuarioNome,
      valor_anterior: valorAnterior,
      valor_novo: valorAplicar,
      motivo:
        motivo ||
        (status === 'baseline'
          ? 'Restauração aos padrões de fábrica (baseline)'
          : 'Aplicação de calibração empírica de campo'),
    },
  ]

  const payload: Partial<FatorKCalibrationRecord> = {
    codigo_ibge: codigoIbge,
    veiculo_tipo: veiculoTipo,
    valor_baseline: config.baselineK,
    valor_calibrado_sugerido: resultadoCalibrado
      ? resultadoCalibrado.calibradoSugerido
      : valorAplicar,
    valor_aplicado: valorAplicar,
    status_aplicacao: status,
    amostras_sessoes: resultadoCalibrado
      ? resultadoCalibrado.amostras.sessoes
      : existing?.amostras_sessoes || 0,
    amostras_segmentos: resultadoCalibrado
      ? resultadoCalibrado.amostras.segmentosValidados
      : existing?.amostras_segmentos || 0,
    km_acumulado: resultadoCalibrado
      ? resultadoCalibrado.amostras.kmAcumulado
      : existing?.km_acumulado || 0,
    confiabilidade_status: resultadoCalibrado
      ? resultadoCalibrado.confiabilidade.status
      : existing?.confiabilidade_status || 'insuficiente',
    metodologia_detalhes: resultadoCalibrado
      ? {
          metodo: resultadoCalibrado.metodologia.metodoUtilizado,
          fator_confianca_minimo: 3,
          segmentos_compartilhados_count:
            resultadoCalibrado.metodologia.segmentosCompartilhadosCount,
          rms_medio_tipo: resultadoCalibrado.metodologia.rmsMedio,
          rms_medio_baseline: 0.18,
          dif_percentual: resultadoCalibrado.diferencaPercentual,
          data_calculo: nowIso,
        }
      : existing?.metodologia_detalhes,
    auditoria_usuario: usuarioNome,
    auditoria_data: nowIso,
    auditoria_historico: novoHistorico,
  }

  if (existing?.id) {
    const updated = await pb
      .collection('fator_k_calibrations')
      .update<FatorKCalibrationRecord>(existing.id, payload)
    return updated
  } else {
    const created = await pb
      .collection('fator_k_calibrations')
      .create<FatorKCalibrationRecord>(payload)
    return created
  }
}

/**
 * Restaura todos os valores de Fator K para o padrão baseline (1.0 ou tabela nativa)
 */
export async function restoreAllFatorKToBaseline(
  codigoIbge: string,
  usuarioNome: string,
): Promise<void> {
  const tipos = Object.keys(VEICULO_TIPOS_CONFIG) as VeiculoTipoCalibracao[]
  for (const tipo of tipos) {
    const config = VEICULO_TIPOS_CONFIG[tipo]
    await applyFatorKCalibration({
      codigoIbge,
      veiculoTipo: tipo,
      valorAplicar: config.baselineK,
      status: 'baseline',
      usuarioNome,
      motivo: 'Restauração global para valores baseline de engenharia',
    })
  }
}
