import pb from '@/lib/pocketbase/client'

export interface ConnectorPrfRecord {
  id: string
  codigo_ibge: string
  municipio?: string
  uf?: string
  endpoint_url: string
  exercicios?: number[]
  brs_alvo?: string[]
  status: 'pronto' | 'sincronizando' | 'sucesso' | 'erro_conexao' | 'degradado'
  ultima_sincronizacao?: string
  total_importados?: number
  total_descartados?: number
  detalhes_execucao?: {
    endpoint_consultado?: string
    modo_degradado?: boolean
    motivo_degradado?: string | null
    exercicios_consultados?: number[]
    rodovias_filtradas?: string[]
    dry_run?: boolean
    total_lidos_api?: number
    total_persistidos?: number
    total_descartes?: number
    saneamento_lgpd?: string
    [key: string]: any
  }
  operador_id?: string
  operador_nome?: string
  operador_email?: string
  created?: string
  updated?: string
}

export interface SyncPrfParams {
  codigo_ibge?: string
  municipio?: string
  uf?: string
  exercicios?: number[]
  brs?: string[]
  dry_run?: boolean
}

export interface PrfSyncResponse {
  success: boolean
  degraded: boolean
  degraded_reason?: string | null
  message: string
  endpoint_consultado: string
  dry_run: boolean
  exercicios_consultados: number[]
  rodovias_monitoradas: string[]
  municipio: string
  codigo_ibge: string
  total_lidos: number
  total_importados: number
  total_descartados: number
  descartes: Array<{
    linha: number
    identificador?: string
    motivo: string
    resumo?: string
  }>
  amostra_importados: any[]
  procedencia: {
    fonte: string
    endpoint: string
    operador_nome: string
    operador_email: string
    timestamp: string
    lgpd_compliance: string
  }
}

/**
 * Consulta a configuração e último status do conector PRF
 */
export async function getConnectorPrfStatus(
  codigoIbge: string = '4106902',
): Promise<ConnectorPrfRecord | null> {
  const cleanIbge = codigoIbge.replace(/\D/g, '')
  try {
    const record = await pb
      .collection('connectors_prf')
      .getFirstListItem<ConnectorPrfRecord>(`codigo_ibge = "${cleanIbge}"`)
    return record
  } catch (_) {
    return null
  }
}

/**
 * Dispara a sincronização resiliente com a API de Dados Abertos da PRF
 * via backend hook `/backend/v1/connectors/prf/sync`
 */
export async function syncPrfApiData(params: SyncPrfParams = {}): Promise<PrfSyncResponse> {
  const payload = {
    codigo_ibge: params.codigo_ibge || '4106902',
    municipio: params.municipio || 'Curitiba',
    uf: params.uf || 'PR',
    exercicios: params.exercicios || [2024, 2023],
    brs: params.brs || ['116', '277', '376', '476'],
    dry_run: params.dry_run === true,
  }

  const response = await pb.send<PrfSyncResponse>('/backend/v1/connectors/prf/sync', {
    method: 'POST',
    body: payload,
  })

  return response
}
