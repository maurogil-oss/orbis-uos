import pb from '@/lib/pocketbase/client'

export type VeiculoTipoCalibracao = 'onibus' | 'viatura' | 'caminhao' | 'ambulancia' | 'outros'

export interface VeiculoTipoOption {
  id: VeiculoTipoCalibracao
  label: string
  sublabel: string
  icone: string // identificador de ícone visual
  baselineK: number // Fator K padrão teórico fixo
  descricaoDinamica: string // ex: chassi pesado, suspensão rígida, suspensão mista
  suspensaoTipo: string
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
  },
  outros: {
    id: 'outros',
    label: 'Outros Veículos Oficiais',
    sublabel: 'Veículos leves e utilitários de fiscalização',
    icone: 'car',
    baselineK: 1.0,
    descricaoDinamica: 'Padrão neutro de referência unitária para frotas institucionais diversas.',
    suspensaoTipo: 'Convencional',
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

export interface FieldSessionRecord {
  id?: string
  session_code: string
  codigo_ibge: string
  veiculo_tipo: VeiculoTipoCalibracao
  veiculo_id?: string
  linha_frota?: string
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
  const tipos: VeiculoTipoCalibracao[] = ['onibus', 'viatura', 'caminhao', 'ambulancia', 'outros']
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
