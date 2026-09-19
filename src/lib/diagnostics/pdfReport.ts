/**
 * Utilitário de Criptografia SHA-256 e Exportação PDF do Enquadramento
 * O hash de integridade garante o selo de fé pública e integridade do documento.
 */

export async function computeSha256(data: string | object): Promise<string> {
  const content = typeof data === 'string' ? data : JSON.stringify(data)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateIntegrityProtocol(municipio: string, uf: string): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  const ufCode = uf.toUpperCase().slice(0, 2)
  return `ORBIS-${ufCode}-${dateStr}-${randomSuffix}`
}

/**
 * Sanitiza strings para interpolação segura em templates HTML/PDF,
 * prevenindo injeção de tags ou scripts maliciosos (XSS / HTML injection).
 */
export function sanitizeHtml(input: unknown): string {
  if (input === null || input === undefined) return ''
  const str = String(input)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
