import pb from '@/lib/pocketbase/client'

export interface CreateExpressDiagnosticPayload {
  municipio: string
  uf: string
  populacao_ibge: number
  codigo_ibge: string
  responsavel_nome: string
  responsavel_cargo: string
  email_oficial: string
  telefone?: string
  status_municipalizacao: 'proprio_estruturado' | 'em_processo' | 'nao_municipalizado'
  frota_onibus: number
  frota_caminhoes_coleta: number
  frota_viaturas: number
  orcamento_anual_pavimentacao: number
}

export interface ExpressDiagnosticRecord extends CreateExpressDiagnosticPayload {
  id: string
  score_provisorio: number
  faixa_provisoria: string
  veiculos_sensor_sugeridos: number
  created: string
  updated: string
}

export interface ExpressDiagnosticResult {
  record: ExpressDiagnosticRecord
  scoreProvisorio: number
  rotuloScore: string // "Pré-diagnóstico Provisório"
  faixaProvisoria: string
  veiculosSensorSugeridos: number
  diagnosticoResumo: string
}

export async function listExpressDiagnostics(): Promise<ExpressDiagnosticRecord[]> {
  try {
    const records = await pb
      .collection('express_diagnostics')
      .getFullList<ExpressDiagnosticRecord>({
        sort: '-created',
      })
    return records
  } catch (err) {
    console.warn('Falha ao listar express_diagnostics:', err)
    return []
  }
}

export async function submitExpressDiagnostic(
  payload: CreateExpressDiagnosticPayload,
): Promise<ExpressDiagnosticResult> {
  // Cálculo instantâneo do Pré-diagnóstico Provisório (NUNCA IMM/IMV definitivo)
  // Baseado nas regras validadas da esteira:
  let scoreProvisorio = 0

  // 1. Municipalização
  if (payload.status_municipalizacao === 'proprio_estruturado') scoreProvisorio += 25
  else if (payload.status_municipalizacao === 'em_processo') scoreProvisorio += 15
  else scoreProvisorio += 5

  // 2. Frota total
  const frotaTotal =
    (payload.frota_onibus || 0) +
    (payload.frota_caminhoes_coleta || 0) +
    (payload.frota_viaturas || 0)

  if (frotaTotal >= 50) scoreProvisorio += 30
  else if (frotaTotal >= 20) scoreProvisorio += 24
  else if (frotaTotal >= 8) scoreProvisorio += 18
  else scoreProvisorio += 10

  // 3. Orçamento de pavimentação
  if (payload.orcamento_anual_pavimentacao > 2000000) scoreProvisorio += 25
  else if (payload.orcamento_anual_pavimentacao > 500000) scoreProvisorio += 18
  else scoreProvisorio += 10

  // 4. Bônus institucional inicial
  scoreProvisorio += 15
  scoreProvisorio = Math.min(100, Math.max(10, scoreProvisorio))

  let faixaProvisoria = 'Enquadramento Necessário'
  if (scoreProvisorio >= 85) faixaProvisoria = 'Município Pioneiro'
  else if (scoreProvisorio >= 70) faixaProvisoria = 'Gestão Estruturada'
  else if (scoreProvisorio >= 50) faixaProvisoria = 'Em Consolidação'

  // Dimensionamento do piloto CPSI (veículos-sensor recomendados)
  let veiculosSugeridos = 5
  if (payload.populacao_ibge <= 50000) {
    veiculosSugeridos = Math.max(3, Math.min(8, Math.ceil(frotaTotal * 0.4)))
  } else if (payload.populacao_ibge <= 300000) {
    veiculosSugeridos = Math.max(8, Math.min(20, Math.ceil(frotaTotal * 0.3)))
  } else {
    veiculosSugeridos = Math.max(18, Math.min(50, Math.ceil(frotaTotal * 0.25)))
  }

  // Persistir no PocketBase
  const record = (await pb.collection('express_diagnostics').create({
    ...payload,
    score_provisorio: scoreProvisorio,
    faixa_provisoria: faixaProvisoria,
    veiculos_sensor_sugeridos: veiculosSugeridos,
  })) as unknown as ExpressDiagnosticRecord

  // Persistir também como lead no sistema existente para manter total sincronia comercial/institucional
  try {
    await pb.collection('leads').create({
      nome: payload.responsavel_nome,
      email: payload.email_oficial,
      cargo: payload.responsavel_cargo,
      orgao: `Prefeitura de ${payload.municipio} / ${payload.uf}`,
      porte: payload.populacao_ibge > 300000 ? 'Municipal' : 'Municipal',
      telefone: payload.telefone || '',
    })
  } catch (_) {
    // Ignora se e-mail de lead já existir
  }

  return {
    record,
    scoreProvisorio,
    rotuloScore: 'Pré-diagnóstico Provisório',
    faixaProvisoria,
    veiculosSensorSugeridos: veiculosSugeridos,
    diagnosticoResumo: `Potencial inicial identificado para ${payload.municipio} (${payload.uf}). Recomendada a realização do Enquadramento Completo de 6 blocos para emissão do relatório oficial com hash SHA-256 e minuta do Art. 320 CTB.`,
  }
}
