/**
 * Módulos da Onda 2 por Porte: Cidade Média (50.000 a 300.000 habitantes)
 *
 * 1. Green Light Bridge: Otimização de sinais/semáforos (onda verde) baseada na
 *    telemetria passiva da frota-sensor (ônibus, viaturas, caminhões de coleta - CPSI).
 *    Foco: economia de combustível, redução de paradas arteriais e custo evitado.
 *
 * 2. Meio-fio & Vagas (Gestão de estacionamento/faixa amarela): Auditoria passiva
 *    de meio-fio (vagas irregulares, faixa amarela bloqueada, calçadas e vagas de idoso/PCD).
 *    Foco: Zero CAPEX, zonas escolares/hospitalares (Visão Zero Bloco 6) e regularização.
 */

export interface GreenLightBridgeMetrics {
  id: 'green_light_bridge'
  nome: 'Green Light Bridge'
  subtitulo: 'Sincronismo Semafórico & Onda Verde Adaptativa'
  status: 'disponivel' | 'ativo' | 'em_calibracao'
  porteRecomendado: 'media'
  corredoresMonitorados: number
  semaforosAuditados: number
  tempoCicloPerdidoSegundos: number // Tempo médio de ciclo perdido por km
  paradasPorKm: number
  atrasoAcumuladoHorasAno: number
  potencialReducaoViagemPct: number
  economiaCombustivelLitrosAno: number
  custoEvitadoFrotaPublicaAnual: number
  corredoresPrioritarios: Array<{
    nome: string
    extensaoKm: number
    semaforos: number
    atrasoMedioMin: number
    statusOndaVerde: 'otimizada' | 'calibrando' | 'critico'
    reducaoPotencialPct: number
  }>
  enquadreInstitucional: {
    baseLegal: string
    beneficioCustoEvitado: string
    zeroCapexJustificativa: string
  }
}

export interface MeioFioVagasMetrics {
  id: 'meio_fio_vagas'
  nome: 'Meio-fio & Vagas (Auditoria de Estacionamento)'
  subtitulo: 'Detecção Passiva de Faixa Amarela, Vagas Especiais & Calçadas'
  status: 'disponivel' | 'ativo' | 'em_calibracao'
  porteRecomendado: 'media'
  kmMeioFioAuditado: number
  eventosEstacionamentoIrregularMes: number
  bloqueiosFaixaAmarelaMes: number
  conflitosVagasIdosoPcdMes: number
  zonasCriticasMapeadas: Array<{
    nome: string
    tipo: 'escolar' | 'hospitalar' | 'comercial_central'
    taxaOcupacaoIrregularPct: number
    riscoVisaoZero: 'alto' | 'critico' | 'moderado'
    vagasAuditadas: number
  }>
  potencialArrecadacaoRegularizacaoAnual: number
  custoEvitadoAcidentesAnual: number
  enquadreInstitucional: {
    baseLegal: string
    beneficioZeladoria: string
    zeroCapexJustificativa: string
  }
}

export interface Onda2CidadeMediaData {
  porte: 'media'
  populacaoBase: number
  veiculosSensorAtivos: number
  greenLightBridge: GreenLightBridgeMetrics
  meioFioVagas: MeioFioVagasMetrics
}

/**
 * Gera métricas determinísticas e plausíveis para a cidade média
 * com base na população ou parâmetros do Enquadramento/IMM.
 */
export function getOnda2CidadeMediaMetrics(
  populacao: number = 140000,
  frotaSensorCount: number = 18,
): Onda2CidadeMediaData {
  // Ajuste determinístico escalável para a faixa 50k-300k
  const pop = Math.max(50000, Math.min(300000, populacao))
  const escala = pop / 140000

  // 1. Green Light Bridge
  const corredoresMonitorados = Math.round(6 * escala)
  const semaforosAuditados = Math.round(54 * escala)
  const paradasPorKm = +(1.8 + 0.4 * (1 / Math.sqrt(escala))).toFixed(1)
  const tempoCicloPerdidoSegundos = Math.round(28 + 6 * escala)
  const atrasoAcumuladoHorasAno = Math.round(92000 * escala)
  const potencialReducaoViagemPct = 18 // 18% a 24% em média com sincronismo adaptativo
  const economiaCombustivelLitrosAno = Math.round(145000 * escala)
  const custoEvitadoFrotaPublicaAnual = Math.round(economiaCombustivelLitrosAno * 6.15) // R$ diesel médio

  const corredoresPrioritarios = [
    {
      nome: 'Corredor Arterial Norte-Sul (Eixo Central)',
      extensaoKm: +(7.4 * escala).toFixed(1),
      semaforos: Math.round(18 * escala),
      atrasoMedioMin: 4.8,
      statusOndaVerde: 'calibrando' as const,
      reducaoPotencialPct: 22,
    },
    {
      nome: 'Avenida Perimetral / Rota Hospitalar',
      extensaoKm: +(5.2 * escala).toFixed(1),
      semaforos: Math.round(14 * escala),
      atrasoMedioMin: 3.5,
      statusOndaVerde: 'otimizada' as const,
      reducaoPotencialPct: 19,
    },
    {
      nome: 'Eixo Comercial & Terminal Urbano',
      extensaoKm: +(6.1 * escala).toFixed(1),
      semaforos: Math.round(16 * escala),
      atrasoMedioMin: 5.6,
      statusOndaVerde: 'critico' as const,
      reducaoPotencialPct: 25,
    },
  ]

  const greenLightBridge: GreenLightBridgeMetrics = {
    id: 'green_light_bridge',
    nome: 'Green Light Bridge',
    subtitulo: 'Sincronismo Semafórico & Onda Verde Adaptativa',
    status: 'ativo',
    porteRecomendado: 'media',
    corredoresMonitorados,
    semaforosAuditados,
    tempoCicloPerdidoSegundos,
    paradasPorKm,
    atrasoAcumuladoHorasAno,
    potencialReducaoViagemPct,
    economiaCombustivelLitrosAno,
    custoEvitadoFrotaPublicaAnual,
    corredoresPrioritarios,
    enquadreInstitucional: {
      baseLegal: 'Art. 320 do CTB (Engenharia Viária) & Marco Legal da Inovação (LC 182/2021)',
      beneficioCustoEvitado: `Economia estimada de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(custoEvitadoFrotaPublicaAnual)}/ano em diesel para a frota de ônibus e serviços públicos, além de ${atrasoAcumuladoHorasAno.toLocaleString('pt-BR')} horas devolvidas à população.`,
      zeroCapexJustificativa:
        'A telemetria inercial dos ônibus e viaturas detecta as ondas de retenção e acelerações bruscas sem instalar laços indutivos no asfalto.',
    },
  }

  // 2. Meio-fio & Vagas
  const kmMeioFioAuditado = Math.round(142 * escala)
  const eventosEstacionamentoIrregularMes = Math.round(380 * escala)
  const bloqueiosFaixaAmarelaMes = Math.round(165 * escala)
  const conflitosVagasIdosoPcdMes = Math.round(48 * escala)
  const potencialArrecadacaoRegularizacaoAnual = Math.round(720000 * escala)
  const custoEvitadoAcidentesAnual = Math.round(540000 * escala)

  const zonasCriticasMapeadas = [
    {
      nome: 'Entorno do Complexo Escolar Municipal',
      tipo: 'escolar' as const,
      taxaOcupacaoIrregularPct: 34,
      riscoVisaoZero: 'critico' as const,
      vagasAuditadas: Math.round(85 * escala),
    },
    {
      nome: 'Acesso do Pronto-Socorro / Hospital Geral',
      tipo: 'hospitalar' as const,
      taxaOcupacaoIrregularPct: 22,
      riscoVisaoZero: 'alto' as const,
      vagasAuditadas: Math.round(50 * escala),
    },
    {
      nome: 'Calçadão Central & Vias Comerciais Arteriais',
      tipo: 'comercial_central' as const,
      taxaOcupacaoIrregularPct: 28,
      riscoVisaoZero: 'moderado' as const,
      vagasAuditadas: Math.round(140 * escala),
    },
  ]

  const meioFioVagas: MeioFioVagasMetrics = {
    id: 'meio_fio_vagas',
    nome: 'Meio-fio & Vagas (Auditoria de Estacionamento)',
    subtitulo: 'Detecção Passiva de Faixa Amarela, Vagas Especiais & Calçadas',
    status: 'ativo',
    porteRecomendado: 'media',
    kmMeioFioAuditado,
    eventosEstacionamentoIrregularMes,
    bloqueiosFaixaAmarelaMes,
    conflitosVagasIdosoPcdMes,
    zonasCriticasMapeadas,
    potencialArrecadacaoRegularizacaoAnual,
    custoEvitadoAcidentesAnual,
    enquadreInstitucional: {
      baseLegal: 'Art. 24 e Art. 320 do CTB c/c Plano Nacional de Redução de Mortes (PNATRANS)',
      beneficioZeladoria: `Identificação sistemática de pontos de estrangulamento por fila dupla e bloqueio de faixa amarela, liberando rotas de socorro e garantindo vagas reservadas para Idoso/PCD.`,
      zeroCapexJustificativa:
        'Caminhões de coleta e viaturas operam como sensores de meio-fio durante suas rondas diárias, sem aquisição de câmeras embarcadas caras.',
    },
  }

  return {
    porte: 'media',
    populacaoBase: pop,
    veiculosSensorAtivos: frotaSensorCount,
    greenLightBridge,
    meioFioVagas,
  }
}
