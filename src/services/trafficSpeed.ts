/**
 * ORBIS.UOS — Serviço de Tráfego e Velocidade Média Operacional
 *
 * Princípios de Produto:
 * - Zero chaves secretas e zero APIs externas pagas no frontend.
 * - Derivação transparente do estado da malha com base na telemetria inercial passiva da frota.
 * - Rotulagem honesta e explícita: "derivado da coleta ORBIS" e "dados de demonstração calibrados".
 * - Conformidade LGPD: k-anonimato por trecho/corredor, nenhuma identificação de veículo ou condutor.
 * - Narração textual acessível ao lado de cada métrica ("dado acessível ≠ interpretação acessível").
 */

export type TrafficStatus = 'livre' | 'atencao' | 'congestionado'

export type TimeWindowId =
  | 'pico_manha' // 07:00 – 09:00
  | 'entre_picos' // 09:00 – 17:00
  | 'pico_tarde' // 17:00 – 19:30
  | 'noturno' // 19:30 – 06:00
  | 'geral_24h'

export interface TimeWindowConfig {
  id: TimeWindowId
  label: string
  horario: string
  descricao: string
}

export const TIME_WINDOWS: TimeWindowConfig[] = [
  {
    id: 'geral_24h',
    label: 'Geral (24 horas)',
    horario: '00h00 – 23h59',
    descricao: 'Consolidado da operação diária completa',
  },
  {
    id: 'pico_manha',
    label: 'Pico Manhã',
    horario: '07h00 – 09h00',
    descricao: 'Janela de maior fluxo radial em direção ao centro e polos de emprego',
  },
  {
    id: 'entre_picos',
    label: 'Entre-Picos',
    horario: '09h00 – 17h00',
    descricao: 'Operação regular diurna de serviços e transporte coletivo',
  },
  {
    id: 'pico_tarde',
    label: 'Pico Tarde',
    horario: '17h00 – 19h30',
    descricao: 'Deslocamento de retorno residencial e eixos arteriais saturados',
  },
  {
    id: 'noturno',
    label: 'Noturno',
    horario: '19h30 – 06h00',
    descricao: 'Operação de baixa densidade, viaturas e coleta de resíduos',
  },
]

export interface TrafficCorridorSegment {
  id: string
  corredor: string
  via: string
  bairro: string
  extensaoKm: number
  velocidadeNominalKmh: number // Velocidade regulamentada da via (ex: 60 ou 50 km/h)
  velocidadeObservadaKmh: number // Velocidade média observada agora
  fatorFluidezPct: number // observada / nominal * 100
  status: TrafficStatus
  volumeVeiculosObservados: number
  tempoPercursoMedioMin: number
  deltaTempoMin: number // atraso em minutos vs percurso livre
  coordenadasLinha: [number, number][] // Pontos da linha para traçado no mapa
  pontoCentral: [number, number]
  h3Index: string
  janelasVelocidade: Record<TimeWindowId, number> // Velocidade média por janela temporal
  narrativaEstado: string
  fonteRotulo: string
}

export interface CityTrafficOverview {
  codigoIbge: string
  municipio: string
  atualizadoEm: string
  statusGeralMalha: TrafficStatus
  velocidadeMediaGeralKmh: number
  pctMalhaLivre: number
  pctMalhaAtencao: number
  pctMalhaCongestionada: number
  kmMonitoradosTempoReal: number
  narrativaGeral: string
  fonteDeclarada: string
  comparativoJanelas: {
    janelaId: TimeWindowId
    label: string
    velocidadeMediaKmh: number
    variacaoVsNominalPct: number
    corredorMaisLento: string
    corredorMaisFluido: string
  }[]
}

// ---------------------------------------------------------------------------
// Base de demonstração calibrada de Curitiba (Derivada do Gêmeo Digital ORBIS)
// ---------------------------------------------------------------------------

export const DEMO_TRAFFIC_CORRIDORS: TrafficCorridorSegment[] = [
  {
    id: 'TRF-01',
    corredor: 'Eixo Linha Verde (BR-476)',
    via: 'Linha Verde Sul, trecho Pinheirinho–Prado Velho',
    bairro: 'Pinheirinho / Hauer',
    extensaoKm: 6.8,
    velocidadeNominalKmh: 70,
    velocidadeObservadaKmh: 32,
    fatorFluidezPct: 45.7,
    status: 'congestionado',
    volumeVeiculosObservados: 124,
    tempoPercursoMedioMin: 12.8,
    deltaTempoMin: +6.9,
    pontoCentral: [-25.485, -49.272],
    coordenadasLinha: [
      [-25.512, -49.288],
      [-25.495, -49.278],
      [-25.48, -49.268],
      [-25.465, -49.259],
    ],
    h3Index: '89a81005a9bffff',
    janelasVelocidade: {
      geral_24h: 46,
      pico_manha: 28,
      entre_picos: 54,
      pico_tarde: 32,
      noturno: 64,
    },
    narrativaEstado:
      'Congestionamento severo no sentido Norte na janela das 17h–19h (velocidade média de 32 km/h vs 70 km/h nominal). Retenção média de +7 min por veículo.',
    fonteRotulo: 'Derivado da Coleta ORBIS • Dados de Demonstração Calibrados',
  },
  {
    id: 'TRF-02',
    corredor: 'Eixo Marechal Floriano / Boqueirão',
    via: 'Av. Marechal Floriano Peixoto',
    bairro: 'Hauer / Boqueirão',
    extensaoKm: 5.2,
    velocidadeNominalKmh: 50,
    velocidadeObservadaKmh: 24,
    fatorFluidezPct: 48.0,
    status: 'congestionado',
    volumeVeiculosObservados: 98,
    tempoPercursoMedioMin: 13.0,
    deltaTempoMin: +6.8,
    pontoCentral: [-25.468, -49.255],
    coordenadasLinha: [
      [-25.442, -49.265],
      [-25.46, -49.258],
      [-25.475, -49.252],
      [-25.49, -49.248],
    ],
    h3Index: '89a81005a9bffff',
    janelasVelocidade: {
      geral_24h: 31,
      pico_manha: 22,
      entre_picos: 38,
      pico_tarde: 24,
      noturno: 45,
    },
    narrativaEstado:
      'Retenções sucessivas em cruzamentos e estações-tubo no corredor Marechal, operando a 24 km/h com atraso de +6,8 min.',
    fonteRotulo: 'Derivado da Coleta ORBIS • Dados de Demonstração Calibrados',
  },
  {
    id: 'TRF-03',
    corredor: 'Eixo Binário Central (Guarapuava / Sete)',
    via: 'Av. Visconde de Guarapuava',
    bairro: 'Centro / Batel',
    extensaoKm: 4.4,
    velocidadeNominalKmh: 50,
    velocidadeObservadaKmh: 31,
    fatorFluidezPct: 62.0,
    status: 'atencao',
    volumeVeiculosObservados: 86,
    tempoPercursoMedioMin: 8.5,
    deltaTempoMin: +3.2,
    pontoCentral: [-25.44, -49.279],
    coordenadasLinha: [
      [-25.432, -49.261],
      [-25.438, -49.273],
      [-25.442, -49.284],
      [-25.448, -49.298],
    ],
    h3Index: '89a81005a83ffff',
    janelasVelocidade: {
      geral_24h: 34,
      pico_manha: 26,
      entre_picos: 38,
      pico_tarde: 31,
      noturno: 44,
    },
    narrativaEstado:
      'Tráfego em atenção com onda semafórica estável na maior parte do trajeto, mas redução localizada na aproximação da Rua Bento Viana.',
    fonteRotulo: 'Derivado da Coleta ORBIS • Dados de Demonstração Calibrados',
  },
  {
    id: 'TRF-04',
    corredor: 'Eixo Estrutural Sul / República Argentina',
    via: 'Av. República Argentina',
    bairro: 'Água Verde / Portão',
    extensaoKm: 4.8,
    velocidadeNominalKmh: 50,
    velocidadeObservadaKmh: 36,
    fatorFluidezPct: 72.0,
    status: 'atencao',
    volumeVeiculosObservados: 74,
    tempoPercursoMedioMin: 8.0,
    deltaTempoMin: +2.2,
    pontoCentral: [-25.465, -49.292],
    coordenadasLinha: [
      [-25.448, -49.285],
      [-25.462, -49.291],
      [-25.474, -49.297],
      [-25.485, -49.301],
    ],
    h3Index: '89a81005a1bffff',
    janelasVelocidade: {
      geral_24h: 38,
      pico_manha: 30,
      entre_picos: 41,
      pico_tarde: 36,
      noturno: 46,
    },
    narrativaEstado:
      'Operação em atenção leve; canaleta exclusiva do BRT opera com velocidade fluida e tráfego geral desacelera nas conversões à direita.',
    fonteRotulo: 'Derivado da Coleta ORBIS • Dados de Demonstração Calibrados',
  },
  {
    id: 'TRF-05',
    corredor: 'Eixo Norte-Sul Cândido de Abreu',
    via: 'Av. Cândido de Abreu',
    bairro: 'Centro Cívico',
    extensaoKm: 2.1,
    velocidadeNominalKmh: 40,
    velocidadeObservadaKmh: 34,
    fatorFluidezPct: 85.0,
    status: 'livre',
    volumeVeiculosObservados: 52,
    tempoPercursoMedioMin: 3.7,
    deltaTempoMin: +0.5,
    pontoCentral: [-25.419, -49.268],
    coordenadasLinha: [
      [-25.414, -49.267],
      [-25.421, -49.269],
      [-25.428, -49.271],
    ],
    h3Index: '89a81005b6bffff',
    janelasVelocidade: {
      geral_24h: 35,
      pico_manha: 29,
      entre_picos: 36,
      pico_tarde: 34,
      noturno: 38,
    },
    narrativaEstado:
      'Tráfego livre e fluido no Centro Cívico. Média de 34 km/h próxima à velocidade máxima regulamentada da via.',
    fonteRotulo: 'Derivado da Coleta ORBIS • Dados de Demonstração Calibrados',
  },
  {
    id: 'TRF-06',
    corredor: 'Eixo Gastronômico Manoel Ribas',
    via: 'Av. Manoel Ribas',
    bairro: 'Mercês / Santa Felicidade',
    extensaoKm: 5.6,
    velocidadeNominalKmh: 50,
    velocidadeObservadaKmh: 42,
    fatorFluidezPct: 84.0,
    status: 'livre',
    volumeVeiculosObservados: 61,
    tempoPercursoMedioMin: 8.0,
    deltaTempoMin: +1.2,
    pontoCentral: [-25.412, -49.309],
    coordenadasLinha: [
      [-25.425, -49.289],
      [-25.418, -49.299],
      [-25.41, -49.312],
      [-25.405, -49.325],
    ],
    h3Index: '89a810059c3ffff',
    janelasVelocidade: {
      geral_24h: 43,
      pico_manha: 38,
      entre_picos: 44,
      pico_tarde: 42,
      noturno: 47,
    },
    narrativaEstado:
      'Fluxo predominantemente livre em todo o trecho de Santa Felicidade com velocidade média de 42 km/h.',
    fonteRotulo: 'Derivado da Coleta ORBIS • Dados de Demonstração Calibrados',
  },
]

export function getCityTrafficOverview(fonteCustom?: string): CityTrafficOverview {
  return {
    codigoIbge: '4106902',
    municipio: 'Curitiba / PR',
    atualizadoEm: new Date().toISOString(),
    statusGeralMalha: 'atencao',
    velocidadeMediaGeralKmh: 33.2,
    pctMalhaLivre: 48,
    pctMalhaAtencao: 32,
    pctMalhaCongestionada: 20,
    kmMonitoradosTempoReal: 28.9,
    narrativaGeral:
      'Tráfego livre e estável na maior parte da malha viária (48%), com retenções concentradas nos eixos radiais Linha Verde e Marechal Floriano na janela vespertina. Velocidade média global de 33,2 km/h.',
    fonteDeclarada:
      fonteCustom ||
      'Derivado da Coleta ORBIS DSP • Velocidades Observadas por Frota Municipal (Dados de Demonstração Calibrados)',
    comparativoJanelas: [
      {
        janelaId: 'pico_manha',
        label: 'Pico Manhã (07h–09h)',
        velocidadeMediaKmh: 28.8,
        variacaoVsNominalPct: -44.2,
        corredorMaisLento: 'Eixo Marechal Floriano (22 km/h)',
        corredorMaisFluido: 'Eixo Manoel Ribas (38 km/h)',
      },
      {
        janelaId: 'entre_picos',
        label: 'Entre-Picos (09h–17h)',
        velocidadeMediaKmh: 41.8,
        variacaoVsNominalPct: -18.0,
        corredorMaisLento: 'Eixo Binário Central (38 km/h)',
        corredorMaisFluido: 'Linha Verde Sul (54 km/h)',
      },
      {
        janelaId: 'pico_tarde',
        label: 'Pico Tarde (17h–19h30)',
        velocidadeMediaKmh: 31.5,
        variacaoVsNominalPct: -38.2,
        corredorMaisLento: 'Eixo Marechal Floriano (24 km/h)',
        corredorMaisFluido: 'Eixo Manoel Ribas (42 km/h)',
      },
      {
        janelaId: 'noturno',
        label: 'Noturno (19h30–06h)',
        velocidadeMediaKmh: 47.3,
        variacaoVsNominalPct: -8.5,
        corredorMaisLento: 'Eixo Cândido de Abreu (38 km/h)',
        corredorMaisFluido: 'Linha Verde Sul (64 km/h)',
      },
    ],
  }
}

export function listTrafficCorridors(): TrafficCorridorSegment[] {
  return DEMO_TRAFFIC_CORRIDORS
}
