import pb from '@/lib/pocketbase/client'

export interface InstitucionalSettingsRecord {
  id?: string
  municipio: string
  uf: string
  codigo_ibge: string
  portal_publico_ativo?: boolean
  portal_mensagem_institucional?: string
  cgu_api_key?: string
  cgu_status?: 'chave_pendente' | 'ativo' | 'erro_chave' | 'indisponivel'
  cgu_last_sync?: string
  cgu_cache_payload?: any
  created?: string
  updated?: string
}

export interface CguSyncResult {
  status: 'chave_pendente' | 'ativo' | 'erro_chave' | 'indisponivel'
  message: string
  cgu_configured: boolean
  cgu_masked_key?: string
  data?: {
    codigo_ibge: string
    ano_referencia: number
    convenios_total: number
    convenios_urbanismo_transporte: number
    valor_total_repassado: number
    fonte: string
    consultado_em: string
    status: string
    amostra_convenios?: any[]
    aviso?: string
  }
}

/**
 * Obtém as configurações institucionais vigentes para o código IBGE
 */
export async function getInstitucionalSettings(
  codigoIbge: string = '4106902',
): Promise<InstitucionalSettingsRecord | null> {
  const cleanIbge = codigoIbge.replace(/\D/g, '')

  // Se o usuário estiver autenticado, busca da collection institucional_settings diretamente
  if (pb.authStore.isValid) {
    try {
      const record = await pb
        .collection('institucional_settings')
        .getFirstListItem(`codigo_ibge = "${cleanIbge}"`)
      return record as unknown as InstitucionalSettingsRecord
    } catch (_) {
      // continua para fallback de endpoint público
    }
  }

  // Se não autenticado (ex.: munícipe no Portal do Cidadão), consulta o endpoint público higienizado
  try {
    const publicData = await pb.send(`/backend/v1/public/portal-status?codigo_ibge=${cleanIbge}`, {
      method: 'GET',
    })
    return {
      municipio: publicData.municipio || 'Curitiba',
      uf: publicData.uf || 'PR',
      codigo_ibge: publicData.codigo_ibge || cleanIbge,
      portal_publico_ativo: publicData.portal_publico_ativo === true,
      portal_mensagem_institucional: publicData.portal_mensagem_institucional || '',
    } as InstitucionalSettingsRecord
  } catch (_) {
    return null
  }
}

/**
 * Atualiza as configurações institucionais (requer autenticação institucional)
 */
export async function updateInstitucionalSettings(
  id: string,
  data: Partial<InstitucionalSettingsRecord>,
): Promise<InstitucionalSettingsRecord> {
  const updated = await pb.collection('institucional_settings').update(id, data)
  return updated as unknown as InstitucionalSettingsRecord
}

/**
 * Aciona sincronização segura com a API do Portal da Transparência CGU via hook backend
 */
export async function syncCguPortalData(params: {
  codigo_ibge: string
  cgu_api_key?: string
  municipio?: string
  uf?: string
}): Promise<CguSyncResult> {
  try {
    const response = await pb.send('/backend/v1/cgu/sync', {
      method: 'POST',
      body: params,
    })
    return response as CguSyncResult
  } catch (err: any) {
    if (err?.status === 400 && err?.data?.status === 'erro_chave') {
      return {
        status: 'erro_chave',
        message: err.data.message || 'Chave da API CGU inválida ou não ativada.',
        cgu_configured: true,
      }
    }
    throw err
  }
}
