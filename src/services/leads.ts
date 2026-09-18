import pb from '@/lib/pocketbase/client'

export interface CreateLeadPayload {
  nome: string
  email: string
  cargo: string
  orgao: string
  porte: 'Municipal' | 'Estadual' | 'Federal'
  telefone?: string
}

export interface LeadRecord extends CreateLeadPayload {
  id: string
  created: string
  updated: string
}

export async function createLead(payload: CreateLeadPayload): Promise<LeadRecord> {
  const record = await pb.collection('leads').create<LeadRecord>(payload)
  return record
}

export async function listLeads(): Promise<LeadRecord[]> {
  try {
    const records = await pb.collection('leads').getFullList<LeadRecord>({
      sort: '-created',
    })
    return records
  } catch (err) {
    console.warn('Falha ao listar manifestos/leads:', err)
    return []
  }
}
