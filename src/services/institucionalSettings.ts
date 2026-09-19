import pb from '@/lib/pocketbase/client'

export interface AuditTrailAuthor {
  id: string
  email: string
  name: string
  role: 'admin' | 'operador' | 'system'
}

export interface AuditTrailEvent {
  id: string
  event: string
  author: AuditTrailAuthor
  details: Record<string, any>
  compliance?: string
  timestamp: string
}

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
  audit_trail?: AuditTrailEvent[] | string
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
/**
 * Registra um evento com autoria na trilha de auditoria de institucional_settings
 */
export async function registerAuditEvent(params: {
  codigoIbge?: string
  event: string
  author: AuditTrailAuthor
  details: Record<string, any>
  compliance?: string
}): Promise<void> {
  const cleanIbge = (params.codigoIbge || '4106902').replace(/\D/g, '')
  if (!pb.authStore.isValid) return

  try {
    const settings = await pb
      .collection('institucional_settings')
      .getFirstListItem(`codigo_ibge = "${cleanIbge}"`)

    let trail: AuditTrailEvent[] = []
    const raw = settings.audit_trail
    if (Array.isArray(raw)) {
      trail = raw
    } else if (typeof raw === 'string' && raw.trim()) {
      try {
        trail = JSON.parse(raw)
      } catch (_) {
        trail = []
      }
    }

    const newEvent: AuditTrailEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      event: params.event,
      author: params.author,
      details: params.details,
      compliance: params.compliance,
      timestamp: new Date().toISOString(),
    }

    trail.unshift(newEvent)
    if (trail.length > 50) {
      trail = trail.slice(0, 50)
    }

    await pb.collection('institucional_settings').update(settings.id, {
      audit_trail: JSON.stringify(trail),
    })
  } catch (err) {
    console.warn('Não foi possível gravar evento na trilha de auditoria:', err)
  }
}

/**
 * Dispara purga manual de telemetria bruta com mais de 180 dias
 */
export async function triggerTelemetryPurge(): Promise<{
  success: boolean
  message: string
  cutoff_date: string
  total_purged: number
  purged_segment_readings: number
  purged_field_sessions: number
}> {
  return await pb.send('/backend/v1/telemetry/purge', {
    method: 'POST',
  })
}

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
