import pb from '@/lib/pocketbase/client'
import { registerAuditEvent, AuditTrailAuthor } from './institucionalSettings'

export interface ApiKeyRecord {
  id: string
  consumidor_nome: string
  consumidor_orgao: string
  consumidor_contato?: string
  key_prefix: string
  key_hash: string
  escopo: 'somente_leitura'
  status: 'ativa' | 'revogada'
  rate_limit_rpm: number
  criado_por_id?: string
  criado_por_nome?: string
  criado_por_email?: string
  revogado_em?: string
  revogado_por_id?: string
  revogado_por_nome?: string
  motivo_revogacao?: string
  ultimo_uso_em?: string
  total_requisicoes?: number
  created: string
  updated: string
}

export interface CreateApiKeyPayload {
  consumidor_nome: string
  consumidor_orgao: string
  consumidor_contato?: string
  rate_limit_rpm?: number
}

export interface CreatedApiKeyResult {
  record: ApiKeyRecord
  rawKey: string // Exibida APENAS uma vez no momento da criação
}

/**
 * Computa o hash SHA-256 no browser para armazenamento seguro da chave de API
 */
export async function computeSha256Hex(plainText: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plainText)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Gera uma string aleatória criptograficamente segura para a chave
 */
function generateRandomHex(length: number): string {
  const bytes = new Uint8Array(length / 2)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Lista todas as chaves de API cadastradas (requer autenticação de admin)
 */
export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  try {
    const records = await pb.collection('api_keys').getFullList<ApiKeyRecord>({
      sort: '-created',
    })
    return records
  } catch (err) {
    console.warn('Erro ao listar api_keys:', err)
    return []
  }
}

/**
 * Cria uma nova chave de API para um consumidor / órgão integrador.
 * Apenas o hash da chave é persistido no banco; a chave em texto claro é retornada uma única vez.
 * Dispara evento API_KEY_CREATED na trilha de auditoria com autoria do administrador.
 */
export async function createApiKey(
  payload: CreateApiKeyPayload,
  author: AuditTrailAuthor,
  codigoIbge: string = '4106902',
): Promise<CreatedApiKeyResult> {
  // 1. Gerar token com prefixo institucional único
  const randomSuffix = generateRandomHex(32)
  const rawKey = `orbis_live_${randomSuffix}`
  const keyHash = await computeSha256Hex(rawKey)
  const keyPrefix = `orbis_live_${rawKey.substring(11, 15)}...${rawKey.substring(rawKey.length - 4)}`

  // 2. Persistir no PocketBase (apenas o hash da chave é salvo, nunca a chave em claro)
  const record = await pb.collection('api_keys').create<ApiKeyRecord>({
    consumidor_nome: payload.consumidor_nome.trim(),
    consumidor_orgao: payload.consumidor_orgao.trim(),
    consumidor_contato: payload.consumidor_contato?.trim() || '',
    key_prefix: keyPrefix,
    key_hash: keyHash,
    escopo: 'somente_leitura',
    status: 'ativa',
    rate_limit_rpm: payload.rate_limit_rpm || 60,
    criado_por_id: author.id,
    criado_por_nome: author.name,
    criado_por_email: author.email,
    total_requisicoes: 0,
  })

  // 3. Registrar na trilha de auditoria formal (Art. 27 LC 182/2021)
  await registerAuditEvent({
    codigoIbge,
    event: 'API_KEY_CREATED',
    author,
    details: {
      key_id: record.id,
      consumidor_nome: record.consumidor_nome,
      consumidor_orgao: record.consumidor_orgao,
      key_prefix: record.key_prefix,
      escopo: record.escopo,
      rate_limit_rpm: record.rate_limit_rpm,
      hash_armazenado: true,
      k_anonymity_enforced: true,
    },
    compliance: 'Art. 27 LC 182/2021 & Art. 12 LGPD (k-anonimato H3 k ≥ 3)',
  })

  return {
    record,
    rawKey,
  }
}

/**
 * Revoga uma chave de API existente.
 * Registra o evento API_KEY_REVOKED na trilha de auditoria com autoria nominal do admin.
 */
export async function revokeApiKey(params: {
  keyId: string
  motivo?: string
  author: AuditTrailAuthor
  codigoIbge?: string
}): Promise<ApiKeyRecord> {
  const { keyId, motivo, author, codigoIbge = '4106902' } = params

  const updatedRecord = await pb.collection('api_keys').update<ApiKeyRecord>(keyId, {
    status: 'revogada',
    revogado_em: new Date().toISOString(),
    revogado_por_id: author.id,
    revogado_por_nome: author.name,
    motivo_revogacao: motivo || 'Revogação administrativa manual solicitada pelo gestor.',
  })

  await registerAuditEvent({
    codigoIbge,
    event: 'API_KEY_REVOKED',
    author,
    details: {
      key_id: updatedRecord.id,
      consumidor_nome: updatedRecord.consumidor_nome,
      consumidor_orgao: updatedRecord.consumidor_orgao,
      key_prefix: updatedRecord.key_prefix,
      motivo: updatedRecord.motivo_revogacao,
      revogado_em: updatedRecord.revogado_em,
    },
    compliance: 'Art. 27 LC 182/2021 & Governança de Acessos B2G',
  })

  return updatedRecord
}
