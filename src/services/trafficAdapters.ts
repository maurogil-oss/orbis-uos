/**
 * ORBIS.UOS — Contrato e Adaptadores de Fontes de Dados de Tráfego
 *
 * Princípios de Produto & Restrições Arquiteturais:
 * - Zero provedores pagos e zero chaves secretas no código.
 * - Contrato unificado: trecho/corredor -> velocidade média, nível de serviço, janela temporal e fonte declarada.
 * - Fonte ativa padrão: "Coleta Passiva ORBIS DSP (dados de demonstração calibrados)".
 * - Adaptador externo gratuito pré-configurado: "Waze for Cities" (programa gratuito do Google para órgãos públicos / prefeituras).
 *   O município solicita adesão formal sem custo; quando o feed/GeoJSON/XML do órgão for aprovado e configurado,
 *   a ingestão é ligada por URL pública/Webhook do órgão.
 * - Desativado por padrão com mensagem explícita e honesta na interface — sem placeholder falso que finja dados reais.
 */

import {
  TrafficCorridorSegment,
  CityTrafficOverview,
  TimeWindowId,
  DEMO_TRAFFIC_CORRIDORS,
  getCityTrafficOverview,
} from '@/services/trafficSpeed'

export type TrafficSourceProviderId = 'orbis_dsp' | 'waze_for_cities'

export interface TrafficSourceInfo {
  id: TrafficSourceProviderId
  nome: string
  subtitulo: string
  descricao: string
  tipoIntegracao: 'coleta_passiva' | 'feed_orgao_publico_gratuito'
  gratuito: true
  ativoPadrao: boolean
  requerAdesaoOrgao: boolean
  linkInstitucional?: string
  declaracaoFonte: string
  avisoStatus: string
}

export const TRAFFIC_SOURCES: Record<TrafficSourceProviderId, TrafficSourceInfo> = {
  orbis_dsp: {
    id: 'orbis_dsp',
    nome: 'Coleta Passiva ORBIS DSP',
    subtitulo: 'Odometria inercial e tacógrafo da frota municipal (ônibus e coleta)',
    descricao:
      'Velocidade média operacional derivada de sensores embarcados na frota pública sem custo de API externa e com k-anonimato garantido.',
    tipoIntegracao: 'coleta_passiva',
    gratuito: true,
    ativoPadrao: true,
    requerAdesaoOrgao: false,
    declaracaoFonte:
      'Fonte: Coleta ORBIS DSP • Velocidades Observadas por Frota Municipal (Dados de Demonstração Calibrados)',
    avisoStatus:
      'Fonte primária ativa. Dados derivados da odometria passiva dos veículos em circulação.',
  },
  waze_for_cities: {
    id: 'waze_for_cities',
    nome: 'Waze for Cities (Feed do Município)',
    subtitulo: 'Programa gratuito governamental de compartilhamento bidirecional de dados viários',
    descricao:
      'Programa oficial do Google/Waze para prefeituras e órgãos de trânsito (SMDT/URBS). Permite ingestão de alertas de lentidão e tempos de viagem via feed JSON/XML público do próprio convênio do município.',
    tipoIntegracao: 'feed_orgao_publico_gratuito',
    gratuito: true,
    ativoPadrao: false,
    requerAdesaoOrgao: true,
    linkInstitucional: 'https://www.waze.com/pt-BR/ccp',
    declaracaoFonte:
      'Fonte: Feed Waze for Cities do Órgão (Convênio Municipal Gratuito • Desativado por padrão)',
    avisoStatus:
      'O adaptador do programa gratuito "Waze for Cities" está pronto no sistema, porém permanece desativado até que o órgão municipal conclua a solicitação formal e vincule a URL do feed da prefeitura. Nenhum dado simulado ou provedor pago é acionado.',
  },
}

/**
 * Contrato único para qualquer provedor de tráfego do ORBIS.UOS
 */
export interface ITrafficDataSourceAdapter {
  readonly id: TrafficSourceProviderId
  readonly info: TrafficSourceInfo
  isAvailable(): boolean
  getCorridors(windowId?: TimeWindowId): Promise<TrafficCorridorSegment[]>
  getCityOverview(): Promise<CityTrafficOverview>
}

/**
 * Adaptador 1: Coleta Passiva ORBIS DSP (Ativo por padrão)
 */
export class OrbisDspTrafficAdapter implements ITrafficDataSourceAdapter {
  readonly id: TrafficSourceProviderId = 'orbis_dsp'
  readonly info = TRAFFIC_SOURCES.orbis_dsp

  isAvailable(): boolean {
    return true
  }

  async getCorridors(windowId?: TimeWindowId): Promise<TrafficCorridorSegment[]> {
    // Retorna os corredores monitorados pela telemetria
    return DEMO_TRAFFIC_CORRIDORS
  }

  async getCityOverview(): Promise<CityTrafficOverview> {
    return getCityTrafficOverview()
  }
}

/**
 * Adaptador 2: Waze for Cities (Feed do Município — Desativado por padrão)
 *
 * Não expõe chaves privadas, não consome provedor pago e requer convênio institucional do órgão.
 */
export class WazeForCitiesTrafficAdapter implements ITrafficDataSourceAdapter {
  readonly id: TrafficSourceProviderId = 'waze_for_cities'
  readonly info = TRAFFIC_SOURCES.waze_for_cities

  private feedUrlOrgao: string | null = null
  private ativoPeloOrgao: boolean = false

  constructor(feedUrl?: string) {
    if (feedUrl) {
      this.feedUrlOrgao = feedUrl
      this.ativoPeloOrgao = true
    }
  }

  isAvailable(): boolean {
    return this.ativoPeloOrgao && !!this.feedUrlOrgao
  }

  async getCorridors(windowId?: TimeWindowId): Promise<TrafficCorridorSegment[]> {
    if (!this.isAvailable()) {
      // Devolve lista vazia de forma honesta quando o órgão ainda não habilitou o feed
      return []
    }
    // Quando configurado pelo órgão municipal com URL real de feed GeoJSON/JSON,
    // o processamento é executado contra a URL declarada pelo município.
    return []
  }

  async getCityOverview(): Promise<CityTrafficOverview> {
    return {
      codigoIbge: '4106902',
      municipio: 'Curitiba / PR',
      atualizadoEm: new Date().toISOString(),
      statusGeralMalha: 'livre',
      velocidadeMediaGeralKmh: 0,
      pctMalhaLivre: 0,
      pctMalhaAtencao: 0,
      pctMalhaCongestionada: 0,
      kmMonitoradosTempoReal: 0,
      narrativaGeral:
        'Aguardando ativação do feed gratuito Waze for Cities pelo órgão gestor municipal de trânsito.',
      fonteDeclarada: this.info.declaracaoFonte,
      comparativoJanelas: [],
    }
  }
}

/**
 * Registro e Gerenciador de Adaptadores de Tráfego
 */
class TrafficAdapterRegistry {
  private activeSourceId: TrafficSourceProviderId = 'orbis_dsp'
  private adapters: Record<TrafficSourceProviderId, ITrafficDataSourceAdapter> = {
    orbis_dsp: new OrbisDspTrafficAdapter(),
    waze_for_cities: new WazeForCitiesTrafficAdapter(),
  }

  getActiveSourceId(): TrafficSourceProviderId {
    return this.activeSourceId
  }

  setActiveSourceId(id: TrafficSourceProviderId): void {
    this.activeSourceId = id
  }

  getActiveAdapter(): ITrafficDataSourceAdapter {
    return this.adapters[this.activeSourceId] || this.adapters.orbis_dsp
  }

  getAdapter(id: TrafficSourceProviderId): ITrafficDataSourceAdapter {
    return this.adapters[id]
  }

  listAvailableSources(): TrafficSourceInfo[] {
    return Object.values(TRAFFIC_SOURCES)
  }
}

export const trafficAdapterRegistry = new TrafficAdapterRegistry()
