/**
 * ORBIS.UOS — Boletim IEC & Comunicação Institucional Pública
 *
 * Modelo de dados e cenários demonstrativos com dados sintéticos plausíveis
 * para a camada pública de alertas do IEC (Índice de Estresse Cinemático).
 *
 * Princípios Fundamentais:
 * - 100% Municipal (Corredores urbanos, zonas escolares, vias coletoras/arteriais).
 * - Rodovias federais e estaduais: Não operar; registrar apenas como "em estudo de conformidade".
 * - LGPD: dado físico, não pessoal (agregado k-anônimo k >= 3, sem placa, sem condutor, sem veículo individual).
 * - Motor ORBIS DSP: copy pública sem expor FFT, bandas ou detalhe interno.
 * - Honestidade Tipada: Fato, Hipótese a Validar em Campo, Projeção/Estimativa.
 * - Rótulo claro e obrigatório: "Demonstração com dados sintéticos".
 * - Mensagem unificadora de mobilidade & saúde: sair antes não é só chegar mais cedo,
 *   é dirigir melhor (menos frenagem brusca, menor estresse cardiovascular, condução mais fluida).
 */

import {
  IEC_NIVEIS,
  IecNivelConfig,
  IecNivelId,
  calculateKineticStressIndex,
} from '@/lib/diagnostics/iecEngine'

export interface BoletimIecCidade {
  dataReferencia: string // ex: "24 de Março de 2026"
  diaSemana: string // ex: "Terça-feira"
  municipio: string // ex: "Curitiba / PR"
  ibge: string // "4106902"
  indiceAgregadoIec: number // 0 a 100
  nivelPredominante: IecNivelConfig
  comparacaoOntem: {
    diferencaPontos: number // ex: -4 (melhora) ou +6 (piora)
    tendencia: 'melhora' | 'estavel' | 'atencao'
    textoExplicativo: string
  }
  distribuicaoPercentual: {
    fluidaVerde: number // %
    estavelCiano: number // %
    tensaoAmbar: number // %
    criticaVermelho: number // %
  }
  totalQuilometrosAferidos: number
  totalVeiculosAgregadosK: number
  janelasCriticasDoDia: JanelaCriticaIec[]
}

export interface JanelaCriticaIec {
  id: string
  corredor: string
  bairro: string
  horarioInicio: string
  horarioFim: string
  nivel: IecNivelConfig
  iecScore: number
  kAnonimo: number
  motivoFisico: string
  orientacaoCondutor: string
  ordemServicoOrgao: string
}

export interface AlertaZonaEscolar {
  id: string
  nomeEscola: string
  tipoUnidade:
    | 'Escola Municipal'
    | 'Colégio Estadual'
    | 'Escola Infantil / Creche'
    | 'Complexo Educacional'
  bairro: string
  viaAcesso: string
  horarioCriticoEntrada: string // ex: "07h15 – 08h00"
  horarioCriticoSaida: string // ex: "11h45 – 12h30 e 17h15 – 18h00"
  iecScorePico: number
  nivel: IecNivelConfig
  kAnonimoAmostrado: number // >= 3
  diagnosticoEngenharia: string // Quase sempre causa de engenharia (visibilidade, faixa, desenho de via)
  ordemServicoSugerida: {
    numeroOs: string
    prioridade: 'Alta' | 'Urgente' | 'Emergencial'
    descricao: string
    prazoExecucaoDias: number
  }
  recomendacaoCondutor: string
}

export interface ZonaPicoGanhoTempo {
  id: string
  corredor: string
  bairro: string
  janelaPicoRecorrente: string // ex: "17h30 – 18h20"
  iecPicoScore: number
  nivelPico: IecNivelConfig
  ganhoSaindo5MinAntes: {
    minutosChegadaMaisCedo: number // ex: 7 min
    reducaoFrenagensPercent: number // ex: 38%
    reducaoIecPontos: number // ex: 18 pontos
  }
  ganhoSaindo10MinAntes: {
    minutosChegadaMaisCedo: number // ex: 14 min
    reducaoFrenagensPercent: number // ex: 62%
    reducaoIecPontos: number // ex: 29 pontos
  }
  explicacaoFisica: string
  mensagemComportamental: string
}

export interface CanalComunicacaoConfig {
  id: string
  nomeCanal: string
  subtitulo: string
  icone: string
  formato: string
  exemploTextoPronto: string
  enquadramentoInstitucional: string
}

export interface ReleaseImprensaTemplate {
  titulo: string
  subtitulo: string
  lead: string
  citacaoPortavozPadrao: string
  dadosTabelaTexto: string
  rodapeInstitucionalLgpd: string
}

// --------------------------------------------------------------------------
// DADOS SINTÉTICOS PLAUSÍVEIS COM TIPAGEM TRANSPARENTE DE DEMONSTRAÇÃO
// --------------------------------------------------------------------------

export const DADOS_DEMO_BOLETIM_IEC: BoletimIecCidade = {
  dataReferencia: '24 de Março de 2026',
  diaSemana: 'Terça-feira',
  municipio: 'Curitiba / PR',
  ibge: '4106902',
  indiceAgregadoIec: 41,
  nivelPredominante: IEC_NIVEIS.ciano, // Condução Estável (25-49)
  comparacaoOntem: {
    diferencaPontos: -3,
    tendencia: 'melhora',
    textoExplicativo:
      'Redução de 3 pontos em relação a ontem (segunda-feira: IEC 44), indicando menor frequência de desacelerações bruscas nos corredores estruturais matutinos.',
  },
  distribuicaoPercentual: {
    fluidaVerde: 34,
    estavelCiano: 41,
    tensaoAmbar: 18,
    criticaVermelho: 7,
  },
  totalQuilometrosAferidos: 482,
  totalVeiculosAgregadosK: 1240,
  janelasCriticasDoDia: [
    {
      id: 'JC-01',
      corredor: 'Av. Visconde de Guarapuava (Desembargador Motta / Brigadeiro Franco)',
      bairro: 'Batel / Centro',
      horarioInicio: '07h45',
      horarioFim: '08h40',
      nivel: IEC_NIVEIS.vermelho,
      iecScore: 78,
      kAnonimo: 48,
      motivoFisico:
        'Onda de tráfego com frenagem violenta sucessiva antes do foco semafórico de aproximação.',
      orientacaoCondutor:
        'Aumente a distância de seguimento em 2 veículos e evite acelerações bruscas entre cruzamentos.',
      ordemServicoOrgao:
        'OS-SETRAN-2026-104: Recalibrar ciclo semafórico e avançar sinalização visual a 60 metros.',
    },
    {
      id: 'JC-02',
      corredor: 'Rua Marechal Deodoro (próximo à Travessa da Lapa)',
      bairro: 'Centro',
      horarioInicio: '11h50',
      horarioFim: '12h45',
      nivel: IEC_NIVEIS.ambar,
      iecScore: 68,
      kAnonimo: 62,
      motivoFisico:
        'Conflito recorrente de embarque/desembarque e conversão à esquerda com paradas imprevistas.',
      orientacaoCondutor:
        'Planeje faixas centrais antecipadamente; reduza a velocidade preventiva para 30 km/h.',
      ordemServicoOrgao:
        'OS-ENG-2026-088: Fiscalização pontual de vaga de carga/descarga e canalização de aproximação.',
    },
    {
      id: 'JC-03',
      corredor: 'Av. Manoel Ribas (aproximação Portal Santa Felicidade)',
      bairro: 'Santa Felicidade',
      horarioInicio: '17h30',
      horarioFim: '18h35',
      nivel: IEC_NIVEIS.ambar,
      iecScore: 71,
      kAnonimo: 37,
      motivoFisico:
        'Declive acentuado combinado com redutor de velocidade físico de baixa visibilidade noturna.',
      orientacaoCondutor: 'Antecipe a desaceleração pelo freio motor antes da curva do portal.',
      ordemServicoOrgao:
        'OS-OBRAS-2026-042: Repintura retrorrefletiva de lombada e placa de advertência a 100m.',
    },
    {
      id: 'JC-04',
      corredor: 'Av. Presidente Kennedy (cruzamento com Av. República Argentina)',
      bairro: 'Portão',
      horarioInicio: '18h00',
      horarioFim: '19h10',
      nivel: IEC_NIVEIS.vermelho,
      iecScore: 76,
      kAnonimo: 53,
      motivoFisico:
        'Gargalo de conversão e fechamento de gap veicular com desaceleração média superior a 0,55g.',
      orientacaoCondutor:
        'Opte por rotas alternativas via Rua Guilherme Pugsley para evitar o entroncamento crítico.',
      ordemServicoOrgao:
        'OS-SETRAN-2026-115: Ajuste de tempo semafórico para fase de conversão e reforço de agentes de trânsito.',
    },
  ],
}

export const DADOS_DEMO_ZONAS_ESCOLARES: AlertaZonaEscolar[] = [
  {
    id: 'ESC-01',
    nomeEscola: 'Escola Municipal Papa João XXIII',
    tipoUnidade: 'Escola Municipal',
    bairro: 'Portão',
    viaAcesso: 'Rua Itatiaia com Rua Carlos Dietzsch',
    horarioCriticoEntrada: '07h15 – 08h05',
    horarioCriticoSaida: '11h45 – 12h25 e 17h10 – 17h55',
    iecScorePico: 79,
    nivel: IEC_NIVEIS.vermelho,
    kAnonimoAmostrado: 26,
    diagnosticoEngenharia:
      'Concentração de freadas a menos de 15 metros da faixa de pedestres. Análise inercial do trecho indica que a faixa está encoberta por copa de árvore e veículos param apenas ao avistar o pedestre sobre a pista.',
    ordemServicoSugerida: {
      numeroOs: 'OS-SETRAN-ESC-2026-019',
      prioridade: 'Emergencial',
      descricao:
        'Poda de livramento visual da placa R-19 (30 km/h), instalação de tachões redutores 25m antes e repintura da faixa elevada com tinta termoplástica de alta aderência.',
      prazoExecucaoDias: 3,
    },
    recomendacaoCondutor:
      'Nos horários de entrada e saída de alunos, mantenha marcha reduzida a 30 km/h antes da esquina; atenção redobrada a crianças entre veículos estacionados.',
  },
  {
    id: 'ESC-02',
    nomeEscola: 'Colégio Estadual Tiradentes',
    tipoUnidade: 'Colégio Estadual',
    bairro: 'Batel / Água Verde',
    viaAcesso: 'Av. Silva Jardim, esquina com Bento Viana',
    horarioCriticoEntrada: '07h00 – 07h45',
    horarioCriticoSaida: '12h10 – 12h50',
    iecScorePico: 67,
    nivel: IEC_NIVEIS.ambar,
    kAnonimoAmostrado: 44,
    diagnosticoEngenharia:
      'Fila dupla de embarque na pista da direita empurrando o fluxo para a faixa central com freadas de desvio brusco. Não é imperícia individual do condutor: há ausência de baia demarcada de parada rápida (Kiss & Ride).',
    ordemServicoSugerida: {
      numeroOs: 'OS-SETRAN-ESC-2026-024',
      prioridade: 'Urgente',
      descricao:
        'Demarcação de baia operacional temporária de 3 vagas para embarque de até 60 segundos nos horários escolares e reforço de fiscalização educativa.',
      prazoExecucaoDias: 5,
    },
    recomendacaoCondutor:
      'Utilize a faixa da esquerda para fluxo de passagem; não pare em fila dupla para preservar a visibilidade dos pedestres.',
  },
  {
    id: 'ESC-03',
    nomeEscola: 'CMEI Vila Sandra / Unidade Infantil',
    tipoUnidade: 'Escola Infantil / Creche',
    bairro: 'CIC Norte',
    viaAcesso: 'Rua Pedro Gusso',
    horarioCriticoEntrada: '07h30 – 08h20',
    horarioCriticoSaida: '16h45 – 17h40',
    iecScorePico: 73,
    nivel: IEC_NIVEIS.ambar,
    kAnonimoAmostrado: 19,
    diagnosticoEngenharia:
      'Via arterial com velocidade operacional incompatível com ambiente escolar (veículos transitam a ~55 km/h em descida). O estresse inercial reflete desacelerações de emergência quando famílias tentam cruzar.',
    ordemServicoSugerida: {
      numeroOs: 'OS-ENG-ESC-2026-031',
      prioridade: 'Alta',
      descricao:
        'Instalação de travessia elevada tipo lombofaixa conforme Resolução CONTRAN e painel piscante de advertência escolar operando nos horários escolares.',
      prazoExecucaoDias: 10,
    },
    recomendacaoCondutor:
      'Atenção máxima à travessia de mães com carrinhos de bebê; reduza proativamente a velocidade ao avistar a sinalização amarela da creche.',
  },
]

export const DADOS_DEMO_ZONAS_PICO: ZonaPicoGanhoTempo[] = [
  {
    id: 'PICO-01',
    corredor: 'Eixo Estrutural Sul (Av. República Argentina, Água Verde → Capão Raso)',
    bairro: 'Água Verde / Portão',
    janelaPicoRecorrente: '17h30 – 18h25',
    iecPicoScore: 81,
    nivelPico: IEC_NIVEIS.vermelho,
    ganhoSaindo5MinAntes: {
      minutosChegadaMaisCedo: 8,
      reducaoFrenagensPercent: 41,
      reducaoIecPontos: 22,
    },
    ganhoSaindo10MinAntes: {
      minutosChegadaMaisCedo: 16,
      reducaoFrenagensPercent: 68,
      reducaoIecPontos: 36,
    },
    explicacaoFisica:
      'O pico se forma rapidamente às 17h35 por sincronismo de saída de polos corporativos. Sair 10 min antes permite cruzar o corredor antes do colapso de onda verde.',
    mensagemComportamental:
      'Sair 10 minutos antes não é só economizar 16 minutos de percurso: é evitar 68% das freadas bruscas, preservando freios e seu equilíbrio cardiovascular.',
  },
  {
    id: 'PICO-02',
    corredor: 'Av. Marechal Floriano Peixoto (Centro → Hauer)',
    bairro: 'Rebouças / Prado Velho',
    janelaPicoRecorrente: '18h00 – 18h50',
    iecPicoScore: 74,
    nivelPico: IEC_NIVEIS.ambar,
    ganhoSaindo5MinAntes: {
      minutosChegadaMaisCedo: 6,
      reducaoFrenagensPercent: 32,
      reducaoIecPontos: 15,
    },
    ganhoSaindo10MinAntes: {
      minutosChegadaMaisCedo: 13,
      reducaoFrenagensPercent: 54,
      reducaoIecPontos: 28,
    },
    explicacaoFisica:
      'O gargalo no viaduto da Linha Verde gera stop-and-go nervoso a partir das 18h10. Antecipar a viagem mantém a velocidade em cruzeiro estável de 42 km/h.',
    mensagemComportamental:
      'Antecipe 10 minutos e transforme uma viagem tensa com stop-and-go em uma condução fluida e confortável.',
  },
  {
    id: 'PICO-03',
    corredor: 'Eixo Norte (Av. Cândido de Abreu / Av. João Gualberto)',
    bairro: 'Centro Cívico / Cabral',
    janelaPicoRecorrente: '12h00 – 12h45 e 18h15 – 19h00',
    iecPicoScore: 69,
    nivelPico: IEC_NIVEIS.ambar,
    ganhoSaindo5MinAntes: {
      minutosChegadaMaisCedo: 5,
      reducaoFrenagensPercent: 28,
      reducaoIecPontos: 14,
    },
    ganhoSaindo10MinAntes: {
      minutosChegadaMaisCedo: 11,
      reducaoFrenagensPercent: 49,
      reducaoIecPontos: 25,
    },
    explicacaoFisica:
      'A onda de retenção atinge saturação no nó da Praça Nossa Senhora de Salette. Saindo antes da onda, o tempo semafórico atende em ciclo único.',
    mensagemComportamental:
      'Sair um pouco antes do horário de pico permite dirigir no ritmo da cidade, sem sustos nem acelerações compensatórias.',
  },
]

export const CANAIS_COMUNICACAO_ORGAO: CanalComunicacaoConfig[] = [
  {
    id: 'pmv',
    nomeCanal: 'Painéis de Mensagem Variável (PMV)',
    subtitulo: 'Avisos luminosos em pórticos e semáforos municipais',
    icone: 'monitor',
    formato: 'Texto curto de 2 a 3 linhas (máx. 45 caracteres por linha)',
    exemploTextoPronto:
      'ATENÇÃO: ALTA TENSÃO CINEMÁTICA NA GUARAPUAVA ENTRE 07H45 E 08H40.\nREDUZA VELOCIDADE • EVITE FRENAGENS BRUSCAS',
    enquadramentoInstitucional:
      'O texto é publicado pelo Órgão Municipal de Trânsito via protocolo oficial; a Orbis UOS fornece o dado inercial agregado k-anônimo que embasa a decisão.',
  },
  {
    id: 'radio',
    nomeCanal: 'Rádios de Trânsito & Boletins Horários',
    subtitulo: 'Flash jornalístico a cada 30 ou 60 minutos',
    icone: 'radio',
    formato: 'Texto narrado de 25 segundos para âncora/locutor',
    exemploTextoPronto:
      '"Boletim do Trânsito Setran/Orbis: Hoje o índice da cidade está estável em 41 pontos. Atenção especial agora na Visconde de Guarapuava com Desembargador Motta, onde os sensores registram aumento de freadas bruscas. Motoristas que puderem antecipar a saída em 10 minutos economizam cerca de 15 minutos e dirigem com muito mais tranquilidade."',
    enquadramentoInstitucional:
      'Comunicado de utilidade pública emitido pela assessoria do órgão, democratizando o dado de segurança sem custos para as emissoras.',
  },
  {
    id: 'tv-portais',
    nomeCanal: 'TVs Abertas & Portais de Notícias',
    subtitulo: 'Mapas de calor e balanços semanais de segurança viária',
    icone: 'tv',
    formato: 'Quadro visual semanal + mapas temáticos em alta definição',
    exemploTextoPronto:
      'Gráfico comparativo dos 5 pontos com maior índice de estresse cinemático na semana, acompanhado da nota técnica de engenharia com as ordens de serviço já abertas pela prefeitura.',
    enquadramentoInstitucional:
      'A prefeitura demonstra transparência ativa com dados físicos auditáveis: onde o trânsito estressa, o poder público atua com obras e sinalização.',
  },
  {
    id: 'frotas-app',
    nomeCanal: 'Aplicativo do Frotista / Motorista Parceiro',
    subtitulo: 'Feedback individual consentido diretamente ao condutor',
    icone: 'smartphone',
    formato: 'Notificação in-app pós-jornada (dado do próprio condutor)',
    exemploTextoPronto:
      '"Parabéns! Sua condução hoje teve 82% do trajeto em nível Fluido (Zen). Menos consumo de combustível, menor desgaste de freios e mais segurança para você."',
    enquadramentoInstitucional:
      'O feedback individual roda exclusivamente dentro do app contratado pela frota/usuário, com consentimento prévio do motorista. O poder público recebe apenas o agregado k-anônimo.',
  },
]

export function gerarTextoReleaseImprensa(
  boletim: BoletimIecCidade,
  zonasEscolares: AlertaZonaEscolar[],
): ReleaseImprensaTemplate {
  const criticasTexto = boletim.janelasCriticasDoDia
    .map(
      (jc, idx) =>
        `${idx + 1}. ${jc.corredor} (${jc.bairro}) — das ${jc.horarioInicio} às ${jc.horarioFim} (IEC ${jc.iecScore}, ${jc.nivel.nome}). Causa sob intervenção: ${jc.ordemServicoOrgao}`,
    )
    .join('\n')

  const escolasTexto = zonasEscolares
    .map(
      (esc) =>
        `• ${esc.nomeEscola} (${esc.bairro}): Pico nos horários ${esc.horarioCriticoEntrada} e ${esc.horarioCriticoSaida}. Medida municipal aberta: ${esc.ordemServicoSugerida.numeroOs} (${esc.ordemServicoSugerida.descricao}).`,
    )
    .join('\n')

  return {
    titulo: `BOLETIM IEC: ${boletim.municipio.toUpperCase()} REGISTRA ÍNDICE ${boletim.indiceAgregadoIec}/100 (${boletim.nivelPredominante.nome.toUpperCase()}) NESTA ${boletim.diaSemana.toUpperCase()}`,
    subtitulo:
      'Monitoramento inercial da dinâmica viária identifica corredores com tensão e orienta condutores a antecipar saídas em até 10 minutos para viagens mais seguras e fluidas',
    lead: `${boletim.municipio} — Em boletim de utilidade pública emitido nesta ${boletim.diaSemana.toLowerCase()} (${boletim.dataReferencia}), o órgão municipal de trânsito informa que o Índice de Estresse Cinemático (IEC) da malha viária atingiu ${boletim.indiceAgregadoIec} pontos em uma escala de 0 a 100, classificado como ${boletim.nivelPredominante.nome}. Em relação ao dia anterior, a malha apresentou ${boletim.comparacaoOntem.tendencia === 'melhora' ? 'melhora na fluidez' : 'alta de tensão'}, com ${boletim.distribuicaoPercentual.fluidaVerde}% de condução fluida e ${boletim.distribuicaoPercentual.criticaVermelho}% de trechos com freadas bruscas recorrentes.`,
    citacaoPortavozPadrao:
      '"O Índice de Estresse Cinemático não mede o motorista, mas sim como a via responde à demanda física do deslocamento. Quando múltiplos veículos freiam bruscamente no mesmo ponto métrico, o dado físico aponta quase sempre para uma causa de engenharia — visibilidade de semáforo, redutor sem pintura ou sincronismo imperfeito. O alerta vira imediatamente ordem de serviço para a equipe de obras e, ao mesmo tempo, ajuda o cidadão a escolher horários mais tranquilos."',
    dadosTabelaTexto: `JANELAS CRÍTICAS DO DIA:\n${criticasTexto}\n\nALERTAS EM ZONAS ESCOLARES (PRIORIDADE MUNICIPAL):\n${escolasTexto}`,
    rodapeInstitucionalLgpd:
      'SELO LGPD: Dado físico inercial agregado k-anônimo (mínimo k ≥ 3 veículos). A plataforma ORBIS UOS não coleta placas, nomes, trajetos individuais ou imagens. Amparado pelo Art. 12 da Lei 13.709/2018 (LGPD). Rodovias federais e estaduais: em estudo de conformidade e não cobertas por este boletim municipal.',
  }
}
