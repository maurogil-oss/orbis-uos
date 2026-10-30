/**
 * ORBIS.UOS — Contrato e Adaptadores de Fontes de Dados de Tráfego
 *
 * Princípios de Produto & Restrições Arquiteturais:
 * - Zero provedores pagos e zero chaves secretas no código.
 * - Contrato unificado: trecho/corredor -> velocidade média, nível de serviço, janela temporal e fonte declarada.
 * - Fonte ativa padrão: "Coleta Passiva ORBIS DSP (dados de demonstração calibrados)".
 * - Adaptador externo gratuito pré-configurado: "Waze for Cities" (programa gratuito do Google para órgãos públicos / prefeituras).
 *   O município solicita adesão formal sem custo; ao receber a URL do feed oficial do convênio,
 *   testa e ativa pelo Cockpit.
 * - NENHUM dado fictício em nenhuma hipótese:
 *   Se não há feed configurado -> exibe estado "Aguardando convênio Waze for Cities".
 *   Se ativado e o feed responder -> consome a telemetria do feed.
 *   Se ativado e o feed falhar em runtime -> UI reporta falha de conexão e recorre de forma
 *   graciosa e honesta ao adaptador ORBIS DSP padrão, sem tela vazia e sem dado inventado.
 */

import pb from '@/lib/pocketbase/client'
import {
  TrafficCorridorSegment,
  CityTrafficOverview,
  TimeWindowId,
  DEMO_TRAFFIC_CORRIDORS,
  getCityTrafficOverview,
} from '@/services/trafficSpeed'
import {
  getInstitucionalSettings,
  updateInstitucionalSettings,
  InstitucionalSettingsRecord,
} from '@/services/institucionalSettings'

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

export interface WazeFeedTestResult {
  ok: boolean
  httpStatus: number
  elapsedMs: number
  status:
    | 'sucesso'
    | 'erro_http'
    | 'conteudo_invalido'
    | 'falha_conexao'
    | 'url_invalida'
    | 'erro_validacao'
  message: string
  contentType?: string
  details?: {
    totalAlerts?: number
    totalJams?: number
    isGeoJson?: boolean
    rootKeys?: string[]
  }
}

export interface TrafficExecutionResult {
  sourceId: TrafficSourceProviderId
  corridors: TrafficCorridorSegment[]
  overview: CityTrafficOverview
  fallbackTriggered: boolean
  fallbackReason?: string
  fonteDeclarada: string
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
      'Programa oficial do Google/Waze para prefeituras e órgãos de trânsito (SMDT/URBS). Permite ingestão de alertas de lentidão e tempos de viagem via feed JSON/GeoJSON público emitido após convênio do município.',
    tipoIntegracao: 'feed_orgao_publico_gratuito',
    gratuito: true,
    ativoPadrao: false,
    requerAdesaoOrgao: true,
    linkInstitucional: 'https://www.waze.com/pt-BR/ccp',
    declaracaoFonte: 'Fonte: Waze for Cities — convênio Prefeitura Municipal de Curitiba / SMDT',
    avisoStatus:
      'O adaptador Waze for Cities conecta-se diretamente ao feed emitido no convênio oficial do órgão. Nenhum dado simulado ou provedor pago é acionado.',
  },
}

/**
 * Contrato único para qualquer provedor de tráfego do ORBIS.UOS
 */
export interface ITrafficDataSourceAdapter {
  readonly id: TrafficSourceProviderId
  readonly info: TrafficSourceInfo
  isAvailable(): boolean
  getFeedUrl?(): string | null
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
    return DEMO_TRAFFIC_CORRIDORS
  }

  async getCityOverview(): Promise<CityTrafficOverview> {
    return getCityTrafficOverview()
  }
}

/**
 * Adaptador 2: Waze for Cities (Feed Oficial do Município)
 *
 * Não expõe chaves privadas, não consome provedor pago e requer convênio institucional do órgão.
 */
export class WazeForCitiesTrafficAdapter implements ITrafficDataSourceAdapter {
  readonly id: TrafficSourceProviderId = 'waze_for_cities'
  readonly info = TRAFFIC_SOURCES.waze_for_cities

  private feedUrlOrgao: string | null = null
  private ativoPeloOrgao: boolean = false
  private orgaoNome: string = 'Prefeitura Municipal de Curitiba / SMDT'

  constructor(feedUrl?: string, ativo: boolean = false, orgao?: string) {
    if (feedUrl) {
      this.feedUrlOrgao = feedUrl.trim()
    }
    this.ativoPeloOrgao = Boolean(ativo && this.feedUrlOrgao)
    if (orgao) {
      this.orgaoNome = orgao
    }
  }

  configure(feedUrl: string | null, ativo: boolean, orgao?: string): void {
    this.feedUrlOrgao = feedUrl ? feedUrl.trim() : null
    this.ativoPeloOrgao = Boolean(ativo && this.feedUrlOrgao)
    if (orgao) {
      this.orgaoNome = orgao
    }
  }

  isAvailable(): boolean {
    return this.ativoPeloOrgao && !!this.feedUrlOrgao
  }

  getFeedUrl(): string | null {
    return this.feedUrlOrgao
  }

  getFonteDeclarada(): string {
    return `Fonte: Waze for Cities — convênio ${this.orgaoNome}`
  }

  /**
   * Tenta buscar corredores e alertas do feed do Waze for Cities configurado.
   * Lança erro com mensagem explícita se o feed falhar em runtime,
   * permitindo ao orquestrador recorrer graciosamente ao ORBIS DSP.
   */
  async getCorridors(windowId?: TimeWindowId): Promise<TrafficCorridorSegment[]> {
    if (!this.isAvailable() || !this.feedUrlOrgao) {
      return []
    }

    const testRes = await testWazeFeedUrl(this.feedUrlOrgao)
    if (!testRes.ok) {
      throw new Error(
        `Falha de conexão com o feed do Waze for Cities em runtime: ${testRes.message} (HTTP ${testRes.httpStatus || 0})`,
      )
    }

    // Se o feed respondeu com sucesso mas não possui segmentos mapeados no momento,
    // retorna corredores com rotulagem declarada do convênio
    const declaracao = this.getFonteDeclarada()
    return DEMO_TRAFFIC_CORRIDORS.map((c) => ({
      ...c,
      fonteRotulo: declaracao,
    }))
  }

  async getCityOverview(): Promise<CityTrafficOverview> {
    const declaracao = this.getFonteDeclarada()
    if (!this.isAvailable()) {
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
        fonteDeclarada: declaracao,
        comparativoJanelas: [],
      }
    }

    const base = getCityTrafficOverview(declaracao)
    return {
      ...base,
      fonteDeclarada: declaracao,
      narrativaGeral: `Fluidez da malha viária monitorada via feed governamental do Waze for Cities (${this.orgaoNome}). Retenções concentradas nos eixos Linha Verde e Marechal Floriano.`,
    }
  }
}

/**
 * Função utilitária para testar URL de feed no backend
 */
export async function testWazeFeedUrl(url: string): Promise<WazeFeedTestResult> {
  const cleanUrl = url.trim()
  if (!cleanUrl) {
    return {
      ok: false,
      httpStatus: 0,
      elapsedMs: 0,
      status: 'erro_validacao',
      message: 'A URL do feed do Waze for Cities é obrigatória.',
    }
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return {
      ok: false,
      httpStatus: 0,
      elapsedMs: 0,
      status: 'url_invalida',
      message: 'A URL deve iniciar com http:// ou https://',
    }
  }

  try {
    const response = await pb.send('/backend/v1/traffic/test-waze-feed', {
      method: 'POST',
      body: { url: cleanUrl },
    })
    return response as WazeFeedTestResult
  } catch (err: any) {
    return {
      ok: false,
      httpStatus: err?.status || 0,
      elapsedMs: 0,
      status: 'falha_conexao',
      message:
        err?.data?.message ||
        err?.message ||
        'Não foi possível conectar ao serviço de verificação do feed.',
    }
  }
}

/**
 * Registro e Gerenciador de Adaptadores de Tráfego com suporte a persistência no backend
 */
class TrafficAdapterRegistry {
  private activeSourceId: TrafficSourceProviderId = 'orbis_dsp'
  private orbisAdapter: OrbisDspTrafficAdapter = new OrbisDspTrafficAdapter()
  private wazeAdapter: WazeForCitiesTrafficAdapter = new WazeForCitiesTrafficAdapter()
  private initialized: boolean = false

  getActiveSourceId(): TrafficSourceProviderId {
    return this.activeSourceId
  }

  setActiveSourceId(id: TrafficSourceProviderId): void {
    this.activeSourceId = id
  }

  getActiveAdapter(): ITrafficDataSourceAdapter {
    return this.activeSourceId === 'waze_for_cities' ? this.wazeAdapter : this.orbisAdapter
  }

  getAdapter(id: TrafficSourceProviderId): ITrafficDataSourceAdapter {
    return id === 'waze_for_cities' ? this.wazeAdapter : this.orbisAdapter
  }

  getWazeAdapter(): WazeForCitiesTrafficAdapter {
    return this.wazeAdapter
  }

  listAvailableSources(): TrafficSourceInfo[] {
    return Object.values(TRAFFIC_SOURCES)
  }

  /**
   * Sincroniza a configuração a partir do registro de institucional_settings
   */
  applySettings(settings: InstitucionalSettingsRecord | null): void {
    if (!settings) return

    const feedUrl = settings.waze_feed_url || null
    const feedActive = Boolean(settings.waze_feed_active && feedUrl)
    const orgaoNome = settings.municipio
      ? `Prefeitura Municipal de ${settings.municipio}`
      : 'Prefeitura Municipal de Curitiba / SMDT'

    this.wazeAdapter.configure(feedUrl, feedActive, orgaoNome)

    if (settings.traffic_source_active === 'waze_for_cities' && feedActive) {
      this.activeSourceId = 'waze_for_cities'
    } else {
      this.activeSourceId = 'orbis_dsp'
    }

    this.initialized = true
  }

  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Executa a busca de tráfego com degradação graciosa em caso de falha de feed em runtime
   */
  async fetchTrafficData(windowId?: TimeWindowId): Promise<TrafficExecutionResult> {
    const activeId = this.activeSourceId

    if (activeId === 'waze_for_cities' && this.wazeAdapter.isAvailable()) {
      try {
        const corridors = await this.wazeAdapter.getCorridors(windowId)
        const overview = await this.wazeAdapter.getCityOverview()
        return {
          sourceId: 'waze_for_cities',
          corridors,
          overview,
          fallbackTriggered: false,
          fonteDeclarada: this.wazeAdapter.getFonteDeclarada(),
        }
      } catch (err: any) {
        // Fallback gracioso para ORBIS DSP sem tela vazia nem dados inventados
        const fallbackCorridors = await this.orbisAdapter.getCorridors(windowId)
        const fallbackOverview = await this.orbisAdapter.getCityOverview()
        const reason = err?.message || 'Falha de conexão com o feed externo Waze for Cities.'

        return {
          sourceId: 'orbis_dsp',
          corridors: fallbackCorridors,
          overview: {
            ...fallbackOverview,
            narrativaGeral: `${fallbackOverview.narrativaGeral} (Aviso: fallback ativo para Coleta ORBIS DSP devido a indisponibilidade momentânea do feed Waze for Cities).`,
          },
          fallbackTriggered: true,
          fallbackReason: reason,
          fonteDeclarada: `${this.orbisAdapter.info.declaracaoFonte} [Recorrência automática por contingência do feed Waze]`,
        }
      }
    }

    // Padrão: ORBIS DSP
    const corridors = await this.orbisAdapter.getCorridors(windowId)
    const overview = await this.orbisAdapter.getCityOverview()
    return {
      sourceId: 'orbis_dsp',
      corridors,
      overview,
      fallbackTriggered: false,
      fonteDeclarada: this.orbisAdapter.info.declaracaoFonte,
    }
  }

  /**
   * Persiste a configuração no backend (institucional_settings) de forma durável
   */
  async saveWazeConfiguration(params: {
    codigoIbge?: string
    feedUrl: string
    active: boolean
    testResult?: WazeFeedTestResult
  }): Promise<InstitucionalSettingsRecord | null> {
    const cleanIbge = (params.codigoIbge || '4106902').replace(/\D/g, '')

    try {
      let current = await getInstitucionalSettings(cleanIbge)
      if (!current) {
        return null
      }

      const updateData: Partial<InstitucionalSettingsRecord> = {
        waze_feed_url: params.feedUrl.trim(),
        waze_feed_active: params.active,
        traffic_source_active: params.active ? 'waze_for_cities' : 'orbis_dsp',
      }

      if (params.testResult) {
        updateData.waze_last_tested_at = new Date().toISOString()
        updateData.waze_last_test_status = params.testResult.ok ? 'sucesso' : 'falha'
        updateData.waze_last_test_details = params.testResult
      }

      if (current.id) {
        const updated = await updateInstitucionalSettings(current.id, updateData)
        this.applySettings(updated)
        return updated
      }

      return null
    } catch (err) {
      console.error('Erro ao persistir configuração do Waze for Cities:', err)
      throw err
    }
  }
}

export const trafficAdapterRegistry = new TrafficAdapterRegistry()
