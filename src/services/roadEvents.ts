import pb from '@/lib/pocketbase/client'

export type RoadAnomalyType = 'buraco' | 'ondulacao' | 'fissura' | 'afundamento' | 'remendo_critico'

export type RoadSeverity = 'baixa' | 'media' | 'alta' | 'critica'

export type RoadStatus = 'detectado' | 'triagem' | 'os_emitida' | 'reparado'

export type AgentTaxonomyCode =
  | 'VEICULO_FROTA'
  | 'ONIBUS_FROTA'
  | 'MOTOCICLISTA'
  | 'CICLISTA'
  | 'PEDESTRE'
  | 'PASSAGEIRO_ONIBUS'
  | 'OUTRO'

export interface RoadEventRecord {
  id: string
  via: string
  bairro?: string
  tipo: RoadAnomalyType
  severidade: RoadSeverity
  iri_score?: number
  aceleracao_z?: number
  latitude: number
  longitude: number
  velocidade_kmh?: number
  status: RoadStatus
  veiculo_tipo?: string
  linha_frota?: string
  agent_code?: AgentTaxonomyCode
  created: string
  updated: string
}

export interface CreateRoadEventPayload {
  via: string
  bairro?: string
  tipo: RoadAnomalyType
  severidade: RoadSeverity
  iri_score: number
  aceleracao_z: number
  latitude: number
  longitude: number
  h3_index?: string
  velocidade_kmh: number
  status: RoadStatus
  veiculo_tipo: string
  linha_frota: string
  agent_code?: AgentTaxonomyCode
}
export async function listRoadEvents(filter?: string): Promise<RoadEventRecord[]> {
  try {
    const records = await pb.collection('road_events').getFullList<RoadEventRecord>({
      filter: filter || '',
      sort: '-created',
    })
    return records
  } catch (err) {
    console.warn('Erro ao carregar road_events do backend:', err)
    return []
  }
}

export async function createRoadEvent(payload: CreateRoadEventPayload): Promise<RoadEventRecord> {
  const record = await pb.collection('road_events').create<RoadEventRecord>(payload)
  return record
}

export async function updateRoadEventStatus(
  id: string,
  status: RoadStatus,
): Promise<RoadEventRecord> {
  const record = await pb.collection('road_events').update<RoadEventRecord>(id, { status })
  return record
}
