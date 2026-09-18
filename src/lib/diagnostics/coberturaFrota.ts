/**
 * Utilitário de Cálculo de Cobertura da Malha por Frota x Porte — ORBIS.UOS
 * Gerenciamento de expectativas antes do piloto CPSI.
 */

export interface CoberturaMalhaResult {
  porte: 'pequena' | 'media' | 'grande'
  porteNome: string
  populacao: number
  extensaoMalhaEstimadaKm: number
  frotaPropriaDisponivel: number
  frotaTerceirizadaSemPrevisao: number
  frotaTotal: number
  kmAuditados30DiasComFrotaPropria: number
  kmAuditados30DiasComFrotaTotal: number
  percentualCoberturaDia30FrotaPropria: number // %
  percentualCoberturaDia30FrotaTotal: number // %
  veiculosNecessariosPara100Pct: number
  temViesTerceirizacao: boolean
  diasParaAuditar100PctComFrotaPropria: number
  alertaVies: string | null
  diagnosticoExpectativa: string
}

/**
 * Ratios de Malha Urbana e Produtividade Viária:
 * Pequena <= 50k hab: ~120 km de malha urbana pavimentada/mista
 * Média 50k-300k hab: ~600 km de malha urbana
 * Grande > 300k hab: ~2.000+ km de malha urbana (escala com pop)
 *
 * Produtividade típica do veículo-sensor:
 * Ônibus / Coleta urbana: percorre 90-130 km/dia em rotas repetidas.
 * Para validação com Fator de Confiança F >= 3, cada km da malha precisa de 3 passagens.
 * Logo, em 30 dias de operação útil (~26 dias úteis/turnos):
 * Capacidade líquida por veículo-sensor = ~45 a 55 km de malha auditada com repetição 3x a cada 30 dias.
 */
export function calcularProjecaoCobertura(params: {
  populacao: number
  frotaOnibus: number
  frotaColeta: number
  frotaViaturas: number
  onibusTerceirizadoSemPrevisao?: boolean
  coletaTerceirizadaSemPrevisao?: boolean
}): CoberturaMalhaResult {
  const pop = params.populacao || 35000
  let porte: 'pequena' | 'media' | 'grande' = 'pequena'
  let porteNome = 'Pequeno Porte (≤50k hab)'
  let malhaKm = 120

  if (pop > 300000) {
    porte = 'grande'
    porteNome = 'Grande Porte (>300k hab)'
    malhaKm = Math.round(Math.max(2000, (pop / 1000) * 2.8))
  } else if (pop > 50000) {
    porte = 'media'
    porteNome = 'Médio Porte (50k a 300k hab)'
    malhaKm = Math.round(Math.max(450, Math.min(1200, (pop / 1000) * 3.2)))
  } else {
    malhaKm = Math.round(Math.max(60, Math.min(250, (pop / 1000) * 3.5)))
  }

  const onibus = params.frotaOnibus || 0
  const coleta = params.frotaColeta || 0
  const viaturas = params.frotaViaturas || 0

  // Se indicado terceirizado sem previsão ou em cenário típico de cidade média
  const onibusSemPrevisao = !!params.onibusTerceirizadoSemPrevisao
  const coletaSemPrevisao = !!params.coletaTerceirizadaSemPrevisao

  let frotaPropria = viaturas
  let frotaTerceirizada = 0

  if (onibusSemPrevisao) {
    frotaTerceirizada += onibus
  } else {
    frotaPropria += onibus
  }

  if (coletaSemPrevisao) {
    frotaTerceirizada += coleta
  } else {
    frotaPropria += coleta
  }

  const frotaTotal = onibus + coleta + viaturas

  // Produtividade por veículo: ~50 km únicos de malha cobertos com F>=3 em 30 dias
  const kmPorVeiculoEm30Dias = porte === 'pequena' ? 35 : porte === 'media' ? 45 : 55

  // Veículos necessários para 100% da malha em 30 dias
  const veiculosNecessariosPara100Pct = Math.max(3, Math.ceil(malhaKm / kmPorVeiculoEm30Dias))

  const kmAuditados30DiasComFrotaPropria = Math.min(malhaKm, frotaPropria * kmPorVeiculoEm30Dias)
  const kmAuditados30DiasComFrotaTotal = Math.min(malhaKm, frotaTotal * kmPorVeiculoEm30Dias)

  const pctPropria =
    malhaKm > 0 ? Math.round((kmAuditados30DiasComFrotaPropria / malhaKm) * 100) : 0
  const pctTotal = malhaKm > 0 ? Math.round((kmAuditados30DiasComFrotaTotal / malhaKm) * 100) : 0

  const temViesTerceirizacao = frotaTerceirizada > 0 && pctPropria < 75 && pctTotal >= 70

  const diasParaAuditar100PctComFrotaPropria =
    frotaPropria > 0 ? Math.round(malhaKm / (frotaPropria * (kmPorVeiculoEm30Dias / 30))) : 999

  let alertaVies: string | null = null
  if (temViesTerceirizacao) {
    alertaVies = `Atenção: sua frota de coleta/transporte é parcialmente terceirizada sem cláusula de telemetria. Com a frota própria atual (${frotaPropria} veículos), seu índice de dia 30 cobrirá apenas ${pctPropria}% da malha (${kmAuditados30DiasComFrotaPropria} km de ${malhaKm} km). Recomendado termo aditivo de telemetria antes do início do piloto.`
  }

  let diagnosticoExpectativa = `Com a frota alocada, prevê-se auditoria de ${pctTotal}% da malha viária em 30 dias.`
  if (pctPropria < 100 && frotaTerceirizada > 0) {
    diagnosticoExpectativa = `Expectativa gerenciada: Frota própria cobre ${pctPropria}% em 30 dias. Para atingir 100%, é essencial o aditivo de telemetria com as concessionárias.`
  }

  return {
    porte,
    porteNome,
    populacao: pop,
    extensaoMalhaEstimadaKm: malhaKm,
    frotaPropriaDisponivel: frotaPropria,
    frotaTerceirizadaSemPrevisao: frotaTerceirizada,
    frotaTotal,
    kmAuditados30DiasComFrotaPropria,
    kmAuditados30DiasComFrotaTotal,
    percentualCoberturaDia30FrotaPropria: Math.min(100, pctPropria),
    percentualCoberturaDia30FrotaTotal: Math.min(100, pctTotal),
    veiculosNecessariosPara100Pct,
    temViesTerceirizacao,
    diasParaAuditar100PctComFrotaPropria,
    alertaVies,
    diagnosticoExpectativa,
  }
}
