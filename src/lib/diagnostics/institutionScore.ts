/**
 * Motor do Diagnóstico Institucional (0–100) — ORBIS.UOS
 * Metodologia declarada Versão 1.0 (2025)
 *
 * Pesos validados:
 * B1 (Identificação & Governança): 10% (10 pts)
 * B2 (Malha Viária): 20% (20 pts)
 * B3 (Frota-Sensor Zero CAPEX): 25% (25 pts)
 * B4 (Capacidade Financeira Art. 320 CTB): 20% (20 pts)
 * B5 (Variáveis PNATRANS): 10% (10 pts)
 * B6 (Variáveis Visão Zero): 15% (15 pts)
 *
 * Princípios:
 * 1. O índice mede capacidade de gestão, nunca gravidade do problema.
 * 2. "Não sei" não zera — pontua mínimo e aciona flag de assistência.
 * 3. Município não municipalizado recebe piso neutro de 2 pts no B4.
 * 4. Cidade pequena não é punida pelo tamanho da frota (cortes específicos por porte).
 */

export type CityPorte = 'pequena' | 'media' | 'grande'

export interface Bloco1Data {
  municipio: string
  uf: string
  populacao_ibge: number
  codigo_ibge: string
  cnpj_municipio?: string
  prefeito_nome?: string
  secretario_mobilidade_nome?: string
  secretario_mobilidade_email?: string
  secretario_mobilidade_whatsapp?: string
  secretario_obras_nome?: string
  secretario_obras_email?: string
  secretario_obras_whatsapp?: string
  secretario_financas_nome?: string
  secretario_financas_email?: string
  secretario_financas_whatsapp?: string
  status_municipalizacao: 'proprio_estruturado' | 'em_processo' | 'nao_municipalizado'
  nome_orgao_gestor?: string
  estrutura_secretarial?: 'completa' | 'obras_financas' | 'apenas_uma' | 'acumulacao_total'
}

export interface Bloco2Data {
  extensao_total_km: number
  pavimentada_cbuq_km: number
  pavimentada_cbuq_pct?: number
  alvenaria_paralelepipedo_km: number
  alvenaria_paralelepipedo_pct?: number
  solo_natural_saibro_km: number
  solo_natural_saibro_pct?: number
  malha_cicloviaria_km: number
  orcamento_anual_pavimentacao: number
  modelo_auditoria:
    | 'perfilometro_periodico'
    | 'vistorias_manuais'
    | 'reativo_156'
    | 'sem_metodologia'
  pontos_criticos_drenagem_qtd: number
}

export interface Bloco3Data {
  onibus_total: number
  onibus_operacao: 'propria' | 'concessionaria'
  onibus_empresas?: string
  onibus_terminais_bordo: 'sim' | 'parcial' | 'nao'
  coleta_caminhoes_diarios: number
  coleta_operacao: 'propria' | 'terceirizada'
  coleta_previsao_contratual_telemetria: boolean
  guarda_municipal_viaturas: number
  fiscais_transito_viaturas: number
  ambulancias_samu: number
  cobertura_territorial_estimada?: number // %
}

export interface Bloco4Data {
  fundo_transito_ativo_conta_especifica: boolean
  arrecadacao_anual_multas_faixa:
    | 'acima_referencia'
    | 'media_referencia'
    | 'baixa_referencia'
    | 'muito_baixa'
    | 'nao_sabe'
  arrecadacao_anual_multas_valor?: number
  saldo_caixa_vinculado_art320?: number
  pct_aplicado_engenharia_sinalizacao: number // e.g. 55 para 55%
  situacao_tce: 'aprovado_sem_ressalvas' | 'em_analise' | 'apontamento_ressalva'
}

export interface Bloco5Data {
  sinistros_ultimo_ano: number
  obitos_ultimo_ano: number
  feridos_graves_hospitalizados: number
  distribuicao_modal: {
    pct_motos: number
    pct_pedestres: number
    pct_ciclistas: number
    pct_auto: number
    pct_coletivo_caminhoes: number
    conhecida: boolean
    parcial: boolean
  }
  meta_reducao_pactuada: 'sim' | 'em_elaboracao' | 'nao'
  meta_reducao_pct?: number
  fontes_registro: {
    bopm_sinesp: boolean
    guarda_municipal: boolean
    samu_siate: boolean
    sim_datasus: boolean
    comite_vida_transito: boolean
  }
}

export interface Bloco6Data {
  inventario_top10_georreferenciado: boolean
  zonas_velocidade_30: 'amplamente' | 'piloto' | 'nenhuma'
  velocidade_maxima_arteriais: '50' | '60' | '70_mais'
  faixas_fiscalizacao_eletronica: number
  custo_trauma_sus: {
    internacoes_mensais: number
    custo_medio_diario_uti: number
    tempo_medio_dias: number
  }
  comite_intersetorial: 'formalizado_decreto' | 'informal' | 'inexistente'
  comite_decreto_numero?: string
}

export interface DiagnosticoInput {
  porte?: CityPorte
  b1?: Partial<Bloco1Data>
  b2?: Partial<Bloco2Data>
  b3?: Partial<Bloco3Data>
  b4?: Partial<Bloco4Data>
  b5?: Partial<Bloco5Data>
  b6?: Partial<Bloco6Data>
}

export interface DiagnosticFlags {
  apontamento_tce: boolean
  barreira_juridica_telemetria: boolean
  enquadramento_estadual: boolean
  opacidade_financeira: boolean
  precisa_assistencia_dados: boolean
}

export interface DiagnosticResult {
  score_total: number
  score_b1: number
  score_b2: number
  score_b3: number
  score_b4: number
  score_b5: number
  score_b6: number
  classificacao: {
    faixa: 'pioneiro' | 'estruturada' | 'consolidacao' | 'enquadramento'
    titulo: string
    descricao: string
    cor: string
  }
  porte_identificado: CityPorte
  flags: DiagnosticFlags
  metodologia: {
    versao: string
    data_revisao: string
    base_legal: string
  }
}

/**
 * Determina o porte do município pela população IBGE:
 * Pequena: <= 50.000 hab
 * Média: 50.001 a 300.000 hab
 * Grande: > 300.000 hab
 */
export function getPorteFromPop(populacao: number): CityPorte {
  if (populacao <= 50000) return 'pequena'
  if (populacao <= 300000) return 'media'
  return 'grande'
}

export function calculateDiagnosticoInstitucional(input: DiagnosticoInput): DiagnosticResult {
  const pop = input.b1?.populacao_ibge || 35000
  const porte: CityPorte = input.porte || getPorteFromPop(pop)

  // ----------------------------------------------------
  // BLOCO 1 (10 pts)
  // Municipalização Art. 24: próprio estruturado 6 / em processo 3 / não municipalizado 0
  // Órgão gestor nomeado: 2
  // Estrutura multi-secretarial: 2 COM CORTE POR PORTE
  // ----------------------------------------------------
  let score_b1 = 0
  const b1 = input.b1
  if (b1?.status_municipalizacao === 'proprio_estruturado') {
    score_b1 += 6
  } else if (b1?.status_municipalizacao === 'em_processo') {
    score_b1 += 3
  }

  if (b1?.nome_orgao_gestor && b1.nome_orgao_gestor.trim().length > 1) {
    score_b1 += 2
  }

  const hasMobilidade = !!b1?.secretario_mobilidade_nome?.trim()
  const hasObras = !!b1?.secretario_obras_nome?.trim()
  const hasFinancas = !!b1?.secretario_financas_nome?.trim()

  if (porte === 'pequena') {
    // Pequena: Obras + Finanças identificados = 2 (Mobilidade pode estar acumulada), apenas um = 1
    if (hasObras && hasFinancas) {
      score_b1 += 2
    } else if (hasObras || hasFinancas || hasMobilidade) {
      score_b1 += 1
    }
  } else if (porte === 'media') {
    // Média: Mobilidade/Trânsito ou órgão gestor próprio = 2, acumulação total = 1
    if (hasMobilidade || (b1?.nome_orgao_gestor && b1.nome_orgao_gestor.trim().length > 1)) {
      score_b1 += 2
    } else {
      score_b1 += 1
    }
  } else {
    // Grande: tríade completa = 2, faltando um = 1
    if (hasMobilidade && hasObras && hasFinancas) {
      score_b1 += 2
    } else if (
      (hasMobilidade && hasObras) ||
      (hasMobilidade && hasFinancas) ||
      (hasObras && hasFinancas)
    ) {
      score_b1 += 1
    }
  }
  score_b1 = Math.min(10, Math.max(0, score_b1))

  // ----------------------------------------------------
  // BLOCO 2 (20 pts)
  // % pavimentada: >=80% 6 / 50-79% 4 / 25-49% 2 / <25% 1
  // Modelo de auditoria: perfilômetro periódico 8 / vistorias manuais 5 / reativo 156 2 / sem metodologia 0
  // Orçamento por km pavimentado: >=R$15k/km 3 / R$6-15k 2 / <R$6k 1 / não informado 0
  // Malha cicloviária existente: 1
  // Pontos de drenagem mapeados: 2
  // ----------------------------------------------------
  let score_b2 = 0
  const b2 = input.b2
  const totalKm = b2?.extensao_total_km || 100
  const pavKm = (b2?.pavimentada_cbuq_km || 0) + (b2?.alvenaria_paralelepipedo_km || 0)
  const pctPav = totalKm > 0 ? (pavKm / totalKm) * 100 : 70

  if (pctPav >= 80) score_b2 += 6
  else if (pctPav >= 50) score_b2 += 4
  else if (pctPav >= 25) score_b2 += 2
  else score_b2 += 1

  if (b2?.modelo_auditoria === 'perfilometro_periodico') score_b2 += 8
  else if (b2?.modelo_auditoria === 'vistorias_manuais') score_b2 += 5
  else if (b2?.modelo_auditoria === 'reativo_156') score_b2 += 2
  else score_b2 += 0

  const orcamentoTotal = b2?.orcamento_anual_pavimentacao || 0
  if (orcamentoTotal > 0 && pavKm > 0) {
    const orcPorKm = orcamentoTotal / pavKm
    if (orcPorKm >= 15000) score_b2 += 3
    else if (orcPorKm >= 6000) score_b2 += 2
    else score_b2 += 1
  }

  if (b2?.malha_cicloviaria_km && b2.malha_cicloviaria_km > 0) score_b2 += 1
  if (b2?.pontos_criticos_drenagem_qtd && b2.pontos_criticos_drenagem_qtd > 0) score_b2 += 2
  score_b2 = Math.min(20, Math.max(0, score_b2))

  // ----------------------------------------------------
  // BLOCO 3 (25 pts)
  // Volume total frota-sensor — COM CORTE POR PORTE:
  // 8 pts: Pequena >=25 / Média >=150 / Grande >=600
  // 6 pts: 15-24 / 80-149 / 300-599
  // 4 pts: 8-14 / 30-79 / 100-299
  // 2 pts: <8 / <30 / <100
  // Terminais a bordo: sim 5 / parcial 3 / não 0
  // Autonomia: própria 4 / terceirizada com previsão contratual 3 / sem previsão 0
  // Diversidade de missões: 4 tipos 4 -> 1 tipo 1
  // Cobertura territorial potencial: COM CORTE POR PORTE:
  // 4 pts: Pequena >=90% / Média >=70% / Grande >=50%
  // 2 pts: 60-89% / 40-69% / 30-49%
  // 0 pt: <60% / <40% / <30%
  // ----------------------------------------------------
  let score_b3 = 0
  const b3 = input.b3
  const totalFrota =
    (b3?.onibus_total || 0) +
    (b3?.coleta_caminhoes_diarios || 0) +
    (b3?.guarda_municipal_viaturas || 0) +
    (b3?.fiscais_transito_viaturas || 0) +
    (b3?.ambulancias_samu || 0)

  if (porte === 'pequena') {
    if (totalFrota >= 25) score_b3 += 8
    else if (totalFrota >= 15) score_b3 += 6
    else if (totalFrota >= 8) score_b3 += 4
    else score_b3 += 2
  } else if (porte === 'media') {
    if (totalFrota >= 150) score_b3 += 8
    else if (totalFrota >= 80) score_b3 += 6
    else if (totalFrota >= 30) score_b3 += 4
    else score_b3 += 2
  } else {
    if (totalFrota >= 600) score_b3 += 8
    else if (totalFrota >= 300) score_b3 += 6
    else if (totalFrota >= 100) score_b3 += 4
    else score_b3 += 2
  }

  // Terminais a bordo
  if (b3?.onibus_terminais_bordo === 'sim') score_b3 += 5
  else if (b3?.onibus_terminais_bordo === 'parcial') score_b3 += 3
  else score_b3 += 0

  // Autonomia jurídica de telemetria
  if (b3?.coleta_operacao === 'propria' || b3?.onibus_operacao === 'propria') {
    score_b3 += 4
  } else if (b3?.coleta_previsao_contratual_telemetria) {
    score_b3 += 3
  } else {
    score_b3 += 0
  }

  // Diversidade de missões
  let missoes = 0
  if ((b3?.onibus_total || 0) > 0) missoes++
  if ((b3?.coleta_caminhoes_diarios || 0) > 0) missoes++
  if ((b3?.guarda_municipal_viaturas || 0) + (b3?.fiscais_transito_viaturas || 0) > 0) missoes++
  if ((b3?.ambulancias_samu || 0) > 0) missoes++
  score_b3 += Math.min(4, Math.max(1, missoes))

  // Cobertura territorial potencial (estimada ou inferida pelo porte/frota)
  const cob =
    b3?.cobertura_territorial_estimada ?? (porte === 'pequena' ? 92 : porte === 'media' ? 74 : 58)
  if (porte === 'pequena') {
    if (cob >= 90) score_b3 += 4
    else if (cob >= 60) score_b3 += 2
  } else if (porte === 'media') {
    if (cob >= 70) score_b3 += 4
    else if (cob >= 40) score_b3 += 2
  } else {
    if (cob >= 50) score_b3 += 4
    else if (cob >= 30) score_b3 += 2
  }
  score_b3 = Math.min(25, Math.max(0, score_b3))

  // ----------------------------------------------------
  // BLOCO 4 (20 pts)
  // Fundo ativo com conta específica: 6 / conta única 0
  // Arrecadação per capita (porte-independente): >=R$30/hab 5 / R$10-29 4 / R$3-9 2 / <R$3 1 / não sabe 1
  // % aplicado em engenharia/sinalização: >=50% 4 / 25-49% 3 / <25% 1
  // Situação TCE: aprovado sem ressalvas 3 / em análise 2 / com apontamento 0
  // Superávit vinculado informado e positivo: 2
  // REGRA DE BORDO: município NÃO municipalizado recebe piso neutro de 2 pts no B4
  // ----------------------------------------------------
  let score_b4 = 0
  const b4 = input.b4
  const isNaoMunicipalizado = b1?.status_municipalizacao === 'nao_municipalizado'

  if (isNaoMunicipalizado) {
    score_b4 = 2 // piso neutro de 2 pts
  } else {
    if (b4?.fundo_transito_ativo_conta_especifica) score_b4 += 6

    const arrecadacaoFaixa = b4?.arrecadacao_anual_multas_faixa
    const valorMultas = b4?.arrecadacao_anual_multas_valor
    if (valorMultas && pop > 0) {
      const perCapita = valorMultas / pop
      if (perCapita >= 30) score_b4 += 5
      else if (perCapita >= 10) score_b4 += 4
      else if (perCapita >= 3) score_b4 += 2
      else score_b4 += 1
    } else {
      if (arrecadacaoFaixa === 'acima_referencia') score_b4 += 5
      else if (arrecadacaoFaixa === 'media_referencia') score_b4 += 4
      else if (arrecadacaoFaixa === 'baixa_referencia') score_b4 += 2
      else score_b4 += 1 // 'muito_baixa' ou 'nao_sabe' pontua 1 (princípio: não sabe não zera)
    }

    const pctEng = b4?.pct_aplicado_engenharia_sinalizacao ?? 30
    if (pctEng >= 50) score_b4 += 4
    else if (pctEng >= 25) score_b4 += 3
    else score_b4 += 1

    if (b4?.situacao_tce === 'aprovado_sem_ressalvas') score_b4 += 3
    else if (b4?.situacao_tce === 'em_analise') score_b4 += 2
    else if (b4?.situacao_tce === 'apontamento_ressalva') score_b4 += 0
    else score_b4 += 2

    if ((b4?.saldo_caixa_vinculado_art320 || 0) > 0) score_b4 += 2
  }
  score_b4 = Math.min(20, Math.max(0, score_b4))

  // ----------------------------------------------------
  // BLOCO 5 (10 pts)
  // Fontes integradas (Vida no Trânsito ou DATASUS unificado): 4 / múltiplas sem integração 2 / única informal 1
  // Meta decenal pactuada: 3 / em elaboração 1 / não 0
  // Distribuição por modal conhecida: 2 / parcial 1
  // Óbitos com confiabilidade (taxa calculável): 1
  // ----------------------------------------------------
  let score_b5 = 0
  const b5 = input.b5
  const fontes = b5?.fontes_registro
  const fontCount = fontes ? Object.values(fontes).filter(Boolean).length : 0

  if (fontes?.comite_vida_transito || (fontes?.sim_datasus && fontCount >= 3)) {
    score_b5 += 4
  } else if (fontCount >= 2) {
    score_b5 += 2
  } else {
    score_b5 += 1
  }

  if (b5?.meta_reducao_pactuada === 'sim') score_b5 += 3
  else if (b5?.meta_reducao_pactuada === 'em_elaboracao') score_b5 += 1

  if (b5?.distribuicao_modal?.conhecida) score_b5 += 2
  else if (b5?.distribuicao_modal?.parcial) score_b5 += 1

  if (typeof b5?.obitos_ultimo_ano === 'number' && pop > 0) score_b5 += 1
  score_b5 = Math.min(10, Math.max(0, score_b5))

  // ----------------------------------------------------
  // BLOCO 6 (15 pts)
  // Inventário top 10 georreferenciado: 4 / 0
  // Zonas 30: amplas 4 / piloto 2 / nenhuma 0
  // Comitê formalizado: formalizado com decreto 4 / informal 2 / inexistente 0
  // Fiscalização eletrônica contínua COM CORTE POR PORTE:
  // 3 pts: Pequena >=2 faixas / Média >=8 / Grande >=20
  // 1 pt: 1 / 1-7 / 1-19
  // 0 pt: nenhuma
  // ----------------------------------------------------
  let score_b6 = 0
  const b6 = input.b6
  if (b6?.inventario_top10_georreferenciado) score_b6 += 4

  if (b6?.zonas_velocidade_30 === 'amplamente') score_b6 += 4
  else if (b6?.zonas_velocidade_30 === 'piloto') score_b6 += 2

  if (b6?.comite_intersetorial === 'formalizado_decreto') score_b6 += 4
  else if (b6?.comite_intersetorial === 'informal') score_b6 += 2

  const faixas = b6?.faixas_fiscalizacao_eletronica || 0
  if (porte === 'pequena') {
    if (faixas >= 2) score_b6 += 3
    else if (faixas >= 1) score_b6 += 1
  } else if (porte === 'media') {
    if (faixas >= 8) score_b6 += 3
    else if (faixas >= 1) score_b6 += 1
  } else {
    if (faixas >= 20) score_b6 += 3
    else if (faixas >= 1) score_b6 += 1
  }
  score_b6 = Math.min(15, Math.max(0, score_b6))

  const score_total = Math.round(score_b1 + score_b2 + score_b3 + score_b4 + score_b5 + score_b6)

  // Faixas de resultado
  let faixa: DiagnosticResult['classificacao']['faixa'] = 'enquadramento'
  let titulo = 'Enquadramento Necessário'
  let descricao =
    'Trilha de preparação institucional recomendada. O município possui alto potencial de captação e estruturação de fundos.'
  let cor = '#F59E0B' // amber

  if (score_total >= 85) {
    faixa = 'pioneiro'
    titulo = 'Município Pioneiro'
    descricao =
      'Elegibilidade plena para piloto CPSI imediato e posicionamento como vitrine regional de gestão orientada a dados.'
    cor = '#10B981' // emerald
  } else if (score_total >= 70) {
    faixa = 'estruturada'
    titulo = 'Gestão Estruturada'
    descricao =
      'Piloto viável com ajustes pontuais de governança intersecretarial e ativação rápida da frota-sensor.'
    cor = '#3B82F6' // blue
  } else if (score_total >= 50) {
    faixa = 'consolidacao'
    titulo = 'Em Consolidação'
    descricao =
      'Piloto técnico recomendável em paralelo ao plano de enquadramento orçamentário do Art. 320 CTB.'
    cor = '#6366F1' // indigo
  }

  // Flags transversais
  const flags: DiagnosticFlags = {
    apontamento_tce: b4?.situacao_tce === 'apontamento_ressalva',
    barreira_juridica_telemetria:
      b3?.coleta_operacao === 'terceirizada' && !b3?.coleta_previsao_contratual_telemetria,
    enquadramento_estadual: isNaoMunicipalizado,
    opacidade_financeira: b4?.arrecadacao_anual_multas_faixa === 'nao_sabe',
    precisa_assistencia_dados:
      !b5?.distribuicao_modal?.conhecida || !b6?.inventario_top10_georreferenciado,
  }

  return {
    score_total,
    score_b1,
    score_b2,
    score_b3,
    score_b4,
    score_b5,
    score_b6,
    classificacao: {
      faixa,
      titulo,
      descricao,
      cor,
    },
    porte_identificado: porte,
    flags,
    metodologia: {
      versao: '1.0',
      data_revisao: 'Fevereiro/2025',
      base_legal: 'Lei Federal 14.129/2021 (Governo Digital), LC 182/2021 (CPSI) e Art. 320 do CTB',
    },
  }
}
