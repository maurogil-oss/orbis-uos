import pb from '@/lib/pocketbase/client'
import {
  Bloco1Data,
  Bloco2Data,
  Bloco3Data,
  Bloco4Data,
  Bloco5Data,
  Bloco6Data,
  DiagnosticResult,
  calculateDiagnosticoInstitucional,
} from '@/lib/diagnostics/institutionScore'
import {
  generateEnquadramentoSaidas,
  EnquadramentoSaidas,
} from '@/lib/diagnostics/outputsGenerator'
import { computeSha256, generateIntegrityProtocol } from '@/lib/diagnostics/pdfReport'

export interface EnquadramentoRecord {
  id?: string
  protocolo: string
  municipio: string
  uf: string
  codigo_ibge: string
  cnpj_municipio?: string
  porte: string
  bloco1_data: Partial<Bloco1Data>
  bloco2_data: Partial<Bloco2Data>
  bloco3_data: Partial<Bloco3Data>
  bloco4_data: Partial<Bloco4Data>
  bloco5_data: Partial<Bloco5Data>
  bloco6_data: Partial<Bloco6Data>
  score_total: number
  score_b1: number
  score_b2: number
  score_b3: number
  score_b4: number
  score_b5: number
  score_b6: number
  classificacao: string
  flags: any
  saidas_automaticas: EnquadramentoSaidas
  hash_sha256: string
  status_preenchimento: 'rascunho' | 'concluido'
  ultimo_bloco_salvo: number
  created?: string
  updated?: string
}

export async function saveBlocoProgress(
  protocolo: string,
  blocoIndex: number,
  blocoData: any,
  meta: { municipio: string; uf: string; codigo_ibge: string; porte?: string },
  allBlocosState: {
    b1?: Partial<Bloco1Data>
    b2?: Partial<Bloco2Data>
    b3?: Partial<Bloco3Data>
    b4?: Partial<Bloco4Data>
    b5?: Partial<Bloco5Data>
    b6?: Partial<Bloco6Data>
  },
): Promise<EnquadramentoRecord> {
  // Recalcular diagnóstico institucional em tempo real
  const diag = calculateDiagnosticoInstitucional({
    porte: (meta.porte as any) || undefined,
    b1: allBlocosState.b1,
    b2: allBlocosState.b2,
    b3: allBlocosState.b3,
    b4: allBlocosState.b4,
    b5: allBlocosState.b5,
    b6: allBlocosState.b6,
  })

  // Gerar saídas
  const saidas = generateEnquadramentoSaidas(
    allBlocosState.b1,
    allBlocosState.b2,
    allBlocosState.b3,
    allBlocosState.b4,
    allBlocosState.b5,
    allBlocosState.b6,
  )

  // Calcular hash SHA-256 preliminar
  const hash = await computeSha256({
    protocolo,
    municipio: meta.municipio,
    uf: meta.uf,
    score: diag.score_total,
    timestamp: new Date().toISOString(),
  })

  const payload: Partial<EnquadramentoRecord> = {
    protocolo,
    municipio: meta.municipio,
    uf: meta.uf,
    codigo_ibge: meta.codigo_ibge,
    porte: diag.porte_identificado,
    bloco1_data: allBlocosState.b1 || {},
    bloco2_data: allBlocosState.b2 || {},
    bloco3_data: allBlocosState.b3 || {},
    bloco4_data: allBlocosState.b4 || {},
    bloco5_data: allBlocosState.b5 || {},
    bloco6_data: allBlocosState.b6 || {},
    score_total: diag.score_total,
    score_b1: diag.score_b1,
    score_b2: diag.score_b2,
    score_b3: diag.score_b3,
    score_b4: diag.score_b4,
    score_b5: diag.score_b5,
    score_b6: diag.score_b6,
    classificacao: diag.classificacao.titulo,
    flags: diag.flags,
    saidas_automaticas: saidas,
    hash_sha256: hash,
    status_preenchimento: blocoIndex === 6 ? 'concluido' : 'rascunho',
    ultimo_bloco_salvo: blocoIndex,
  }

  // Verificar se o registro já existe pelo protocolo
  try {
    const existing = await pb
      .collection('enquadramentos')
      .getFirstListItem(`protocolo = "${protocolo}"`)
    const updated = await pb.collection('enquadramentos').update(existing.id, payload)
    return updated as unknown as EnquadramentoRecord
  } catch (_) {
    // Não existe, criar novo
    const created = await pb.collection('enquadramentos').create(payload)
    return created as unknown as EnquadramentoRecord
  }
}

export async function getEnquadramentoByProtocolo(
  protocolo: string,
): Promise<EnquadramentoRecord | null> {
  try {
    const record = await pb
      .collection('enquadramentos')
      .getFirstListItem(`protocolo = "${protocolo}"`)
    return record as unknown as EnquadramentoRecord
  } catch (_) {
    return null
  }
}
