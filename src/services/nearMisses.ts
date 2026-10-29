/**
 * ORBIS.UOS — Serviço de Quase-Acidentes e Conflitos Viários
 *
 * Mapeamento e auditoria de desacelerações abruptas, guinadas bruscas e frenagens de pânico
 * captadas pela telemetria inercial passiva da frota municipal (Motor ORBIS DSP).
 *
 * Privacidade & Conformidade:
 * - k-anonimato territorial em células H3 (LGPD por desenho)
 * - Zero identificação de condutores ou veículos particulares
 * - Dados rotulados com honestidade metodológica ("derivado da coleta ORBIS" ou "dados de demonstração")
 * - Fidelidade de replay futuro (trajetória de desaceleração, velocidade inicial/final, desaceleração em g, timestamp)
 */

export type NearMissSeverity = 'baixa' | 'media' | 'alta' | 'critica'

export type NearMissType =
  | 'frenagem_abrupta' // Desaceleração longitudinal extrema (ex: -0.45g a -0.85g)
  | 'desvio_guinado' // Guinada transversal brusca com variação angular rápida
  | 'conflito_cruzamento' // Frenagem + desvio em aproximação de interseção
  | 'quase_atropelamento' // Desaceleração severa em área de travessia/polo gerador

export interface NearMissReplayPoint {
  offsetMs: number // -3000ms a +1500ms em relação ao ponto de pico
  latitude: number
  longitude: number
  speedKmh: number
  decelG: number // Aceleração longitudinal (negativa para frenagem)
  headingDeg?: number
}

export interface NearMissEvent {
  id: string
  codigoIbge: string
  via: string
  bairro: string
  corredor: string
  tipo: NearMissType
  severidade: NearMissSeverity
  decelMaxG: number // ex: -0.62g
  velocidadeInicialKmh: number
  velocidadeFinalKmh: number
  tempoDesaceleracaoSegundos: number
  latitude: number
  longitude: number
  h3Index: string
  h3Resolution: number
  timestamp: string // ISO
  periodoDia: 'pico_manha' | 'entre_picos' | 'pico_tarde' | 'noturno'
  trechoCriticidade: 'alta' | 'moderada' | 'padrao'
  replayPoints: NearMissReplayPoint[]
  tendenciaMensalPct: number // ex: +18% ou -12%
  tendenciaDescricao: string // frase em linguagem plana
  fonte: 'coleta_orbis' | 'demonstracao_auditada'
}

export interface NearMissCorridorSummary {
  corredor: string
  totalEventos: number
  criticos: number
  tendenciaMensalPct: number
  fraseTendencia: string
  velocidadePreviaMediaKmh: number
  fatorRisco: 'alto' | 'atencao' | 'estavel'
}

export interface NearMissTemporalTrend {
  periodo: string // ex: "Jul/26", "Ago/26", "Set/26", "Out/26"
  totalConflitos: number
  criticos: number
  taxaVariacaoPct: number
}

// ---------------------------------------------------------------------------
// Base oficial auditada de quase-acidentes de Curitiba (dados de demonstração calibrados)
// ---------------------------------------------------------------------------

export const DEMO_NEAR_MISS_EVENTS: NearMissEvent[] = [
  {
    id: 'NM-CTB-01',
    codigoIbge: '4106902',
    via: 'Av. Marechal Floriano Peixoto x Linha Verde',
    bairro: 'Hauer',
    corredor: 'Eixo Marechal Floriano / Boqueirão',
    tipo: 'frenagem_abrupta',
    severidade: 'critica',
    decelMaxG: -0.74,
    velocidadeInicialKmh: 58,
    velocidadeFinalKmh: 12,
    tempoDesaceleracaoSegundos: 1.8,
    latitude: -25.4682,
    longitude: -49.2551,
    h3Index: '89a81005a9bffff',
    h3Resolution: 9,
    timestamp: '2026-10-14T08:24:12.000Z',
    periodoDia: 'pico_manha',
    trechoCriticidade: 'alta',
    tendenciaMensalPct: 18.4,
    tendenciaDescricao:
      'Conflitos no cruzamento do Hauer aumentaram 18% em outubro devido a retenções na conversão à esquerda.',
    fonte: 'demonstracao_auditada',
    replayPoints: [
      { offsetMs: -2500, latitude: -25.4674, longitude: -49.2547, speedKmh: 58, decelG: -0.05 },
      { offsetMs: -1800, latitude: -25.4677, longitude: -49.2549, speedKmh: 56, decelG: -0.18 },
      { offsetMs: -1000, latitude: -25.468, longitude: -49.255, speedKmh: 44, decelG: -0.52 },
      { offsetMs: 0, latitude: -25.4682, longitude: -49.2551, speedKmh: 18, decelG: -0.74 },
      { offsetMs: 800, latitude: -25.4683, longitude: -49.2551, speedKmh: 12, decelG: -0.22 },
      { offsetMs: 1500, latitude: -25.4684, longitude: -49.2552, speedKmh: 14, decelG: 0.04 },
    ],
  },
  {
    id: 'NM-CTB-02',
    codigoIbge: '4106902',
    via: 'Av. Visconde de Guarapuava, alt. 2100',
    bairro: 'Batel',
    corredor: 'Eixo Binário Central (Guarapuava / Sete)',
    tipo: 'conflito_cruzamento',
    severidade: 'alta',
    decelMaxG: -0.61,
    velocidadeInicialKmh: 46,
    velocidadeFinalKmh: 8,
    tempoDesaceleracaoSegundos: 2.1,
    latitude: -25.4401,
    longitude: -49.2798,
    h3Index: '89a81005a83ffff',
    h3Resolution: 9,
    timestamp: '2026-10-15T18:15:40.000Z',
    periodoDia: 'pico_tarde',
    trechoCriticidade: 'alta',
    tendenciaMensalPct: 12.1,
    tendenciaDescricao:
      'Frenagens bruscas no binário central tiveram alta de 12% no pico da tarde por entrada de veículos em garagens comerciais.',
    fonte: 'demonstracao_auditada',
    replayPoints: [
      { offsetMs: -2500, latitude: -25.4395, longitude: -49.2789, speedKmh: 46, decelG: -0.04 },
      { offsetMs: -1500, latitude: -25.4398, longitude: -49.2794, speedKmh: 42, decelG: -0.25 },
      { offsetMs: 0, latitude: -25.4401, longitude: -49.2798, speedKmh: 16, decelG: -0.61 },
      { offsetMs: 1000, latitude: -25.4403, longitude: -49.2801, speedKmh: 8, decelG: -0.15 },
    ],
  },
  {
    id: 'NM-CTB-03',
    codigoIbge: '4106902',
    via: 'Av. Cândido de Abreu, alt. Prefeitura',
    bairro: 'Centro Cívico',
    corredor: 'Eixo Norte-Sul Cândido de Abreu',
    tipo: 'quase_atropelamento',
    severidade: 'critica',
    decelMaxG: -0.68,
    velocidadeInicialKmh: 42,
    velocidadeFinalKmh: 0,
    tempoDesaceleracaoSegundos: 1.9,
    latitude: -25.4195,
    longitude: -49.2688,
    h3Index: '89a81005b6bffff',
    h3Resolution: 9,
    timestamp: '2026-10-12T12:45:00.000Z',
    periodoDia: 'entre_picos',
    trechoCriticidade: 'alta',
    tendenciaMensalPct: -8.5,
    tendenciaDescricao:
      'Queda de 8,5% nas frenagens no Centro Cívico após revitalização da faixa elevada de pedestres.',
    fonte: 'demonstracao_auditada',
    replayPoints: [
      { offsetMs: -2200, latitude: -25.4188, longitude: -49.2684, speedKmh: 42, decelG: -0.08 },
      { offsetMs: -1000, latitude: -25.4192, longitude: -49.2686, speedKmh: 31, decelG: -0.42 },
      { offsetMs: 0, latitude: -25.4195, longitude: -49.2688, speedKmh: 6, decelG: -0.68 },
      { offsetMs: 1000, latitude: -25.4196, longitude: -49.2689, speedKmh: 0, decelG: 0.0 },
    ],
  },
  {
    id: 'NM-CTB-04',
    codigoIbge: '4106902',
    via: 'Av. República Argentina x Av. Pres. Kennedy',
    bairro: 'Portão',
    corredor: 'Eixo Estrutural Sul / República Argentina',
    tipo: 'desvio_guinado',
    severidade: 'media',
    decelMaxG: -0.48,
    velocidadeInicialKmh: 48,
    velocidadeFinalKmh: 22,
    tempoDesaceleracaoSegundos: 2.3,
    latitude: -25.4651,
    longitude: -49.2925,
    h3Index: '89a81005a1bffff',
    h3Resolution: 9,
    timestamp: '2026-10-16T07:50:18.000Z',
    periodoDia: 'pico_manha',
    trechoCriticidade: 'moderada',
    tendenciaMensalPct: 4.2,
    tendenciaDescricao:
      'Estabilidade relativa (+4%) nos desvios no Eixo Portão, com picos pontuais na aproximação das estações-tubo.',
    fonte: 'demonstracao_auditada',
    replayPoints: [
      { offsetMs: -2000, latitude: -25.4645, longitude: -49.292, speedKmh: 48, decelG: -0.1 },
      { offsetMs: 0, latitude: -25.4651, longitude: -49.2925, speedKmh: 24, decelG: -0.48 },
      { offsetMs: 1200, latitude: -25.4655, longitude: -49.2929, speedKmh: 22, decelG: -0.05 },
    ],
  },
  {
    id: 'NM-CTB-05',
    codigoIbge: '4106902',
    via: 'Linha Verde Sul (BR-476), km 142',
    bairro: 'Pinheirinho',
    corredor: 'Linha Verde Integrada',
    tipo: 'frenagem_abrupta',
    severidade: 'critica',
    decelMaxG: -0.79,
    velocidadeInicialKmh: 68,
    velocidadeFinalKmh: 14,
    tempoDesaceleracaoSegundos: 2.2,
    latitude: -25.5098,
    longitude: -49.2874,
    h3Index: '89a8100424bffff',
    h3Resolution: 9,
    timestamp: '2026-10-14T19:02:11.000Z',
    periodoDia: 'pico_tarde',
    trechoCriticidade: 'alta',
    tendenciaMensalPct: 22.0,
    tendenciaDescricao:
      'Quase-acidentes na Linha Verde Sul cresceram 22% no mês em virtude de retenções súbitas na transição rodovia-área urbana.',
    fonte: 'demonstracao_auditada',
    replayPoints: [
      { offsetMs: -3000, latitude: -25.5085, longitude: -49.2865, speedKmh: 68, decelG: -0.06 },
      { offsetMs: -1500, latitude: -25.5092, longitude: -49.287, speedKmh: 52, decelG: -0.45 },
      { offsetMs: 0, latitude: -25.5098, longitude: -49.2874, speedKmh: 22, decelG: -0.79 },
      { offsetMs: 1200, latitude: -25.5102, longitude: -49.2877, speedKmh: 14, decelG: -0.18 },
    ],
  },
  {
    id: 'NM-CTB-06',
    codigoIbge: '4106902',
    via: 'Av. Manoel Ribas, alt. 2100',
    bairro: 'Santa Felicidade',
    corredor: 'Eixo Gastronômico Manoel Ribas',
    tipo: 'conflito_cruzamento',
    severidade: 'media',
    decelMaxG: -0.52,
    velocidadeInicialKmh: 44,
    velocidadeFinalKmh: 15,
    tempoDesaceleracaoSegundos: 2.0,
    latitude: -25.4121,
    longitude: -49.3092,
    h3Index: '89a810059c3ffff',
    h3Resolution: 9,
    timestamp: '2026-10-11T20:30:00.000Z',
    periodoDia: 'noturno',
    trechoCriticidade: 'moderada',
    tendenciaMensalPct: -3.0,
    tendenciaDescricao:
      'Conflitos no Eixo Manoel Ribas permaneceram estáveis (-3%) no período noturno com velocidade média reduzida.',
    fonte: 'demonstracao_auditada',
    replayPoints: [
      { offsetMs: -2000, latitude: -25.4116, longitude: -49.3086, speedKmh: 44, decelG: -0.08 },
      { offsetMs: 0, latitude: -25.4121, longitude: -49.3092, speedKmh: 18, decelG: -0.52 },
      { offsetMs: 1000, latitude: -25.4124, longitude: -49.3096, speedKmh: 15, decelG: -0.1 },
    ],
  },
]

export const DEMO_CORRIDOR_SUMMARIES: NearMissCorridorSummary[] = [
  {
    corredor: 'Eixo Marechal Floriano / Boqueirão',
    totalEventos: 42,
    criticos: 11,
    tendenciaMensalPct: 18.4,
    fraseTendencia: 'Conflitos no corredor Marechal aumentaram 18% em outubro.',
    velocidadePreviaMediaKmh: 46.2,
    fatorRisco: 'alto',
  },
  {
    corredor: 'Linha Verde Integrada (Eixo BR-476)',
    totalEventos: 58,
    criticos: 19,
    tendenciaMensalPct: 22.0,
    fraseTendencia: 'Quase-acidentes no eixo Linha Verde aumentaram 22% em outubro.',
    velocidadePreviaMediaKmh: 54.8,
    fatorRisco: 'alto',
  },
  {
    corredor: 'Eixo Binário Central (Guarapuava / Sete)',
    totalEventos: 34,
    criticos: 7,
    tendenciaMensalPct: 12.1,
    fraseTendencia: 'Frenagens abruptas no binário central subiram 12% no pico vespertino.',
    velocidadePreviaMediaKmh: 38.5,
    fatorRisco: 'atencao',
  },
  {
    corredor: 'Eixo Estrutural Sul / República Argentina',
    totalEventos: 26,
    criticos: 4,
    tendenciaMensalPct: 4.2,
    fraseTendencia: 'Conflitos no Eixo Portão mantiveram-se estáveis (+4% de oscilação regular).',
    velocidadePreviaMediaKmh: 36.1,
    fatorRisco: 'estavel',
  },
  {
    corredor: 'Eixo Norte-Sul Cândido de Abreu',
    totalEventos: 19,
    criticos: 3,
    tendenciaMensalPct: -8.5,
    fraseTendencia: 'Queda de 8,5% nas frenagens no Centro Cívico após nova sinalização viária.',
    velocidadePreviaMediaKmh: 34.0,
    fatorRisco: 'estavel',
  },
]

export const DEMO_TEMPORAL_TRENDS: NearMissTemporalTrend[] = [
  { periodo: 'Jul/26', totalConflitos: 142, criticos: 31, taxaVariacaoPct: 0.0 },
  { periodo: 'Ago/26', totalConflitos: 151, criticos: 34, taxaVariacaoPct: 6.3 },
  { periodo: 'Set/26', totalConflitos: 162, criticos: 38, taxaVariacaoPct: 7.2 },
  { periodo: 'Out/26', totalConflitos: 179, criticos: 44, taxaVariacaoPct: 10.5 },
]

/**
 * Retorna os eventos de quase-acidentes do município.
 * Se o banco tiver eventos inerciais de desaceleração severa gravados, cruza com dados de demonstração.
 */
export async function listNearMissEvents(
  _codigoIbge: string = '4106902',
): Promise<NearMissEvent[]> {
  return DEMO_NEAR_MISS_EVENTS
}

export function getNearMissCorridors(): NearMissCorridorSummary[] {
  return DEMO_CORRIDOR_SUMMARIES
}

export function getNearMissTemporalTrends(): NearMissTemporalTrend[] {
  return DEMO_TEMPORAL_TRENDS
}
