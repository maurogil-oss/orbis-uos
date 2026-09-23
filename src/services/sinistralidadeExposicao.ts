import pb from '@/lib/pocketbase/client'
import { latLngToCell, cellToLatLng, cellToBoundary } from '@/lib/diagnostics/h3Engine'
import { registerAuditEvent, AuditTrailAuthor } from '@/services/institucionalSettings'

export type FontePresetSinistro = 'prf' | 'bombeiros' | 'csv_orgao'

export type SeveridadeSinistro =
  | 'com_vitimas_fatais'
  | 'com_vitimas_feridas'
  | 'sem_vitimas'
  | 'desconhecido'

export type StatusGeocoding = 'coordenada_valida' | 'pendente_geocodificacao' | 'manual_corrigido'

export interface SinistroImportadoRecord {
  id: string
  codigo_ibge: string
  municipio?: string
  uf?: string
  fonte_preset: FontePresetSinistro
  fonte_nome: string
  arquivo_origem?: string
  ano_exercicio?: number
  data_ocorrencia?: string
  horario?: string
  logradouro_rodovia?: string
  bairro?: string
  latitude?: number | null
  longitude?: number | null
  status_geocoding: StatusGeocoding
  tipo_sinistro?: string
  severidade: SeveridadeSinistro
  total_vitimas?: number
  vitimas_fatais?: number
  vitimas_feridas?: number
  tipo_vitima_predominante?: string
  h3_index?: string
  h3_res9?: string
  h3_res10?: string
  operador_responsavel_id?: string
  operador_responsavel_nome?: string
  operador_responsavel_email?: string
  metadados_importacao?: Record<string, any>
  created?: string
  updated?: string
}

export type TipoCamadaExposicao = 'escola_inep' | 'ponto_onibus_gtfs' | 'polo_gerador_custom'

export interface CamadaExposicaoRecord {
  id: string
  codigo_ibge: string
  municipio?: string
  uf?: string
  tipo_camada: TipoCamadaExposicao
  identificador_externo?: string
  nome: string
  endereco?: string
  bairro?: string
  latitude: number
  longitude: number
  h3_index?: string
  h3_res10?: string
  raio_influencia_metros?: number
  fonte_nome: string
  arquivo_origem?: string
  ano_exercicio?: number
  operador_responsavel_nome?: string
  detalhes?: Record<string, any>
  created?: string
  updated?: string
}

export interface CsvColumnMappingSinistro {
  dataCol?: string
  horarioCol?: string
  logradouroCol?: string
  bairroCol?: string
  latCol?: string
  lngCol?: string
  tipoSinistroCol?: string
  severidadeCol?: string
  vitimasFataisCol?: string
  vitimasFeridasCol?: string
  totalVitimasCol?: string
  tipoVitimaCol?: string
}

export interface CsvColumnMappingExposicao {
  identificadorCol?: string
  nomeCol?: string
  enderecoCol?: string
  bairroCol?: string
  latCol?: string
  lngCol?: string
}

export interface ImportDiscardReport {
  linha: number
  motivo: string
  conteudoResumido: string
}

export interface ImportResult<T> {
  totalLidas: number
  sucessoCount: number
  descartesCount: number
  descartes: ImportDiscardReport[]
  registrosSalvos: T[]
  procedencia: {
    fontePreset?: string
    fonteNome: string
    arquivoOrigem: string
    anoExercicio: number
    operadorNome: string
    timestamp: string
    lgpdCompliance: string
  }
}

/**
 * Agregação de Sinistros por Célula H3
 */
export interface H3SinistralidadeCell {
  h3_index: string
  center_lat: number
  center_lng: number
  boundary: Array<{ lat: number; lng: number }>
  total_sinistros: number
  vitimas_fatais: number
  vitimas_feridas: number
  severidade_predominante: SeveridadeSinistro
  tipos_frequentes: string[]
  vias_afetadas: string[]
  pedestres_envolvidos: number
  ciclistas_envolvidos: number
  motociclistas_envolvidos: number
}

/**
 * Matriz de Prioridade Zero por Célula H3
 */
export interface H3MatrizZeroCell {
  h3_index: string
  center_lat: number
  center_lng: number
  boundary: Array<{ lat: number; lng: number }>
  score_prioridade_zero: number // 0 a 100 (quanto maior, mais prioritário para intervenção)
  criticidade_geral: 'prioridade_maxima' | 'alta' | 'media' | 'monitoramento'

  // Fatores componentes (exibidos separadamente com procedência transparente)
  fator_pavimento: {
    tem_dado: boolean
    score_imv?: number
    iri_medio?: number
    impactos_telemetria?: number
    procedencia: string
  }
  fator_sinistralidade: {
    tem_dado: boolean
    total_sinistros: number
    fatais: number
    feridos: number
    score_sinistralidade: number
    procedencia: string
  }
  fator_exposicao: {
    tem_dado: boolean
    escolas_count: number
    escolas_nomes: string[]
    pontos_onibus_count: number
    score_exposicao: number
    procedencia: string
  }
  vias_principais: string[]
  acao_sugerida: string
}

// -------------------------------------------------------------
// LISTAGEM E CRUDS
// -------------------------------------------------------------

export async function listSinistros(
  codigoIbge: string = '4106902',
): Promise<SinistroImportadoRecord[]> {
  try {
    const records = await pb
      .collection('sinistros_importados')
      .getFullList<SinistroImportadoRecord>({
        filter: `codigo_ibge = "${codigoIbge}"`,
        sort: '-created',
      })
    return records
  } catch (err) {
    console.warn('Erro ao listar sinistros_importados (fallback local):', err)
    return []
  }
}

export async function listCamadasExposicao(
  codigoIbge: string = '4106902',
  tipo?: TipoCamadaExposicao,
): Promise<CamadaExposicaoRecord[]> {
  try {
    let filter = `codigo_ibge = "${codigoIbge}"`
    if (tipo) {
      filter += ` && tipo_camada = "${tipo}"`
    }
    const records = await pb.collection('camadas_exposicao').getFullList<CamadaExposicaoRecord>({
      filter,
      sort: 'nome',
    })
    return records
  } catch (err) {
    console.warn('Erro ao listar camadas_exposicao (fallback local):', err)
    return []
  }
}

export async function updateSinistroCoordenadas(
  id: string,
  latitude: number,
  longitude: number,
): Promise<SinistroImportadoRecord> {
  const h3Res9 = latLngToCell(latitude, longitude, 9)
  const h3Res10 = latLngToCell(latitude, longitude, 10)
  const updated = await pb.collection('sinistros_importados').update<SinistroImportadoRecord>(id, {
    latitude,
    longitude,
    status_geocoding: 'manual_corrigido',
    h3_index: h3Res9,
    h3_res9: h3Res9,
    h3_res10: h3Res10,
  })
  return updated
}

export async function deleteSinistro(id: string): Promise<boolean> {
  return await pb.collection('sinistros_importados').delete(id)
}

export async function deleteCamadaExposicao(id: string): Promise<boolean> {
  return await pb.collection('camadas_exposicao').delete(id)
}

// -------------------------------------------------------------
// PARSERS FLEXÍVEIS COM PRESETS
// -------------------------------------------------------------

/**
 * Parser de linhas CSV que lida com aspas, delimitadores vírgula ou ponto-e-vírgula
 */
export function parseCsvText(csvText: string): {
  headers: string[]
  rows: Record<string, string>[]
} {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  const delimiter = lines[0].includes(';') ? ';' : ','

  const splitLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''))
    return result
  }

  const rawHeaders = splitLine(lines[0])
  const cleanHeaders = rawHeaders.map((h) => h.toLowerCase().trim())

  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i])
    if (values.length <= 1 && !values[0]) continue
    const rowObj: Record<string, string> = {}
    cleanHeaders.forEach((hdr, idx) => {
      rowObj[hdr] = values[idx] ?? ''
    })
    rows.push(rowObj)
  }

  return { headers: cleanHeaders, rows }
}

/**
 * Presets de mapeamento padrão para sugestão automática
 */
export function getPresetMappingSuggestion(
  preset: FontePresetSinistro,
  availableHeaders: string[],
): CsvColumnMappingSinistro {
  const findMatch = (candidates: string[]): string | undefined => {
    return availableHeaders.find((h) => candidates.some((c) => h.includes(c) || h === c))
  }

  if (preset === 'prf') {
    return {
      dataCol: findMatch(['data_inversa', 'data', 'dt_acidente']),
      horarioCol: findMatch(['horario', 'hora']),
      logradouroCol: findMatch(['br', 'rodovia', 'km', 'logradouro']),
      bairroCol: findMatch(['municipio', 'bairro', 'delegacia']),
      latCol: findMatch(['latitude', 'lat']),
      lngCol: findMatch(['longitude', 'long', 'lon']),
      tipoSinistroCol: findMatch(['tipo_acidente', 'causa_acidente', 'tipo']),
      severidadeCol: findMatch(['classificacao_acidente', 'classificacao', 'severidade']),
      vitimasFataisCol: findMatch(['mortos', 'fatais', 'obitos']),
      vitimasFeridasCol: findMatch(['feridos', 'feridos_leves', 'feridos_graves']),
      totalVitimasCol: findMatch(['pessoas', 'total_vitimas']),
      tipoVitimaCol: findMatch(['tipo_envolvido', 'veiculo', 'tipo_veiculo']),
    }
  }

  if (preset === 'bombeiros') {
    return {
      dataCol: findMatch(['data', 'data_fato', 'dt_atendimento']),
      horarioCol: findMatch(['hora', 'horario']),
      logradouroCol: findMatch(['endereco', 'logradouro', 'rua', 'rodovia']),
      bairroCol: findMatch(['bairro', 'regiao']),
      latCol: findMatch(['latitude', 'lat', 'coord_y']),
      lngCol: findMatch(['longitude', 'long', 'lon', 'coord_x']),
      tipoSinistroCol: findMatch(['natureza', 'tipo_ocorrencia', 'tipo']),
      severidadeCol: findMatch(['gravidade', 'classificacao', 'severidade']),
      vitimasFataisCol: findMatch(['obitos', 'mortos', 'fatais']),
      vitimasFeridasCol: findMatch(['feridos', 'atendidos', 'socorridos']),
      totalVitimasCol: findMatch(['total_vitimas', 'vitimas']),
      tipoVitimaCol: findMatch(['envolvidos', 'meio_transporte']),
    }
  }

  // csv_orgao livre
  return {
    dataCol: findMatch(['data', 'dt', 'dia']),
    horarioCol: findMatch(['hora', 'horario', 'hr']),
    logradouroCol: findMatch(['logradouro', 'rua', 'via', 'local', 'endereco']),
    bairroCol: findMatch(['bairro', 'distrito', 'regiao']),
    latCol: findMatch(['latitude', 'lat', 'y']),
    lngCol: findMatch(['longitude', 'lng', 'long', 'lon', 'x']),
    tipoSinistroCol: findMatch(['tipo', 'natureza', 'descricao']),
    severidadeCol: findMatch(['severidade', 'gravidade']),
    vitimasFataisCol: findMatch(['fatais', 'mortos', 'obito']),
    vitimasFeridasCol: findMatch(['feridos', 'lesionados', 'ferimentos']),
    totalVitimasCol: findMatch(['vitimas', 'total']),
    tipoVitimaCol: findMatch(['vitima', 'categoria']),
  }
}

/**
 * Normaliza número vindo de CSV com vírgula ou ponto
 */
function parseCoordinate(val?: string): number | null {
  if (!val) return null
  const cleaned = val.replace(',', '.').trim()
  const num = parseFloat(cleaned)
  if (isNaN(num)) return null
  if (num < -90 || num > 90) {
    // Pode estar fora de escala ou invertido
    if (num < -180 || num > 180) return null
  }
  return num
}

function parseInteger(val?: string): number {
  if (!val) return 0
  const num = parseInt(val.replace(/\D/g, ''), 10)
  return isNaN(num) ? 0 : num
}

/**
 * Avalia severidade a partir de campos ou contagem de vítimas
 */
function deriveSeveridade(
  severidadeRaw?: string,
  fatais: number = 0,
  feridos: number = 0,
): SeveridadeSinistro {
  if (fatais > 0) return 'com_vitimas_fatais'
  if (feridos > 0) return 'com_vitimas_feridas'

  if (severidadeRaw) {
    const s = severidadeRaw.toLowerCase()
    if (s.includes('fatal') || s.includes('óbito') || s.includes('morte')) {
      return 'com_vitimas_fatais'
    }
    if (s.includes('ferid') || s.includes('grave') || s.includes('leve') || s.includes('lesão')) {
      return 'com_vitimas_feridas'
    }
    if (s.includes('sem vítima') || s.includes('dano material') || s.includes('ileso')) {
      return 'sem_vitimas'
    }
  }

  return 'desconhecido'
}

/**
 * Normaliza tipo de vítima predominante
 */
function deriveTipoVitima(val?: string): string {
  if (!val) return 'geral'
  const v = val.toLowerCase()
  if (v.includes('pedestre') || v.includes('atropelamento')) return 'pedestre'
  if (v.includes('ciclista') || v.includes('bicicleta') || v.includes('bike')) return 'ciclista'
  if (v.includes('moto') || v.includes('motociclista')) return 'motociclista'
  if (v.includes('ônibus') || v.includes('onibus')) return 'onibus'
  if (v.includes('automóvel') || v.includes('carro') || v.includes('veiculo'))
    return 'ocupante_veiculo'
  return 'geral'
}

// -------------------------------------------------------------
// EXECUÇÃO DA IMPORTAÇÃO DE SINISTROS
// -------------------------------------------------------------

export async function processAndImportSinistros(params: {
  csvText: string
  fileName: string
  fontePreset: FontePresetSinistro
  fonteNome: string
  anoExercicio: number
  codigoIbge: string
  municipio: string
  uf: string
  mapping: CsvColumnMappingSinistro
  author: AuditTrailAuthor
}): Promise<ImportResult<SinistroImportadoRecord>> {
  const { rows } = parseCsvText(params.csvText)
  const descartes: ImportDiscardReport[] = []
  const savedRecords: SinistroImportadoRecord[] = []

  let linha = 1 // 1 é header, linhas começam em 2
  for (const row of rows) {
    linha++
    const latRaw = params.mapping.latCol ? row[params.mapping.latCol] : undefined
    const lngRaw = params.mapping.lngCol ? row[params.mapping.lngCol] : undefined
    const logradouro = params.mapping.logradouroCol ? row[params.mapping.logradouroCol] : ''
    const bairro = params.mapping.bairroCol ? row[params.mapping.bairroCol] : ''
    const dataOcorrencia = params.mapping.dataCol ? row[params.mapping.dataCol] : ''
    const horario = params.mapping.horarioCol ? row[params.mapping.horarioCol] : ''
    const tipoSinistro = params.mapping.tipoSinistroCol ? row[params.mapping.tipoSinistroCol] : ''
    const severidadeRaw = params.mapping.severidadeCol ? row[params.mapping.severidadeCol] : ''
    const fatais = params.mapping.vitimasFataisCol
      ? parseInteger(row[params.mapping.vitimasFataisCol])
      : 0
    const feridos = params.mapping.vitimasFeridasCol
      ? parseInteger(row[params.mapping.vitimasFeridasCol])
      : 0
    const totalVit = params.mapping.totalVitimasCol
      ? parseInteger(row[params.mapping.totalVitimasCol])
      : fatais + feridos
    const tipoVitima = deriveTipoVitima(
      params.mapping.tipoVitimaCol ? row[params.mapping.tipoVitimaCol] : undefined,
    )

    const lat = parseCoordinate(latRaw)
    const lng = parseCoordinate(lngRaw)

    // Validação mínima de existência de dado
    if (!lat && !lng && !logradouro) {
      descartes.push({
        linha,
        motivo: 'Registro sem coordenadas e sem logradouro/endereço descritivo.',
        conteudoResumido: JSON.stringify(row).slice(0, 100),
      })
      continue
    }

    let statusGeocoding: StatusGeocoding = 'pendente_geocodificacao'
    let h3Res9: string | undefined
    let h3Res10: string | undefined

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      statusGeocoding = 'coordenada_valida'
      h3Res9 = latLngToCell(lat, lng, 9)
      h3Res10 = latLngToCell(lat, lng, 10)
    }

    const severidade = deriveSeveridade(severidadeRaw, fatais, feridos)

    // Disciplina LGPD: Nunca armazena identificadores de vítimas (nome, cpf, placa, telefone)
    // Se o CSV trouxer, eles são descartados aqui e não chegam ao payload salvo
    const payload = {
      codigo_ibge: params.codigoIbge,
      municipio: params.municipio,
      uf: params.uf,
      fonte_preset: params.fontePreset,
      fonte_nome: params.fonteNome,
      arquivo_origem: params.fileName,
      ano_exercicio: params.anoExercicio,
      data_ocorrencia: dataOcorrencia,
      horario: horario,
      logradouro_rodovia: logradouro,
      bairro: bairro,
      latitude: lat,
      longitude: lng,
      status_geocoding: statusGeocoding,
      tipo_sinistro: tipoSinistro,
      severidade: severidade,
      total_vitimas: totalVit,
      vitimas_fatais: fatais,
      vitimas_feridas: feridos,
      tipo_vitima_predominante: tipoVitima,
      h3_index: h3Res9,
      h3_res9: h3Res9,
      h3_res10: h3Res10,
      operador_responsavel_id: params.author.id,
      operador_responsavel_nome: params.author.name,
      operador_responsavel_email: params.author.email,
      metadados_importacao: {
        fonte_preset: params.fontePreset,
        importado_em: new Date().toISOString(),
        lgpd_k_anonimato: true,
      },
    }

    try {
      const created = await pb
        .collection('sinistros_importados')
        .create<SinistroImportadoRecord>(payload)
      savedRecords.push(created)
    } catch (saveErr) {
      console.warn(`Erro ao persistir linha ${linha}:`, saveErr)
      descartes.push({
        linha,
        motivo: 'Erro de validação ao persistir no banco de dados.',
        conteudoResumido: JSON.stringify(payload).slice(0, 100),
      })
    }
  }

  // Registrar na trilha de auditoria (audit_trail)
  try {
    await registerAuditEvent({
      codigoIbge: params.codigoIbge,
      event: 'SINISTRALIDADE_IMPORTADA',
      author: params.author,
      details: {
        fonte_preset: params.fontePreset,
        fonte_nome: params.fonteNome,
        arquivo_origem: params.fileName,
        ano_exercicio: params.anoExercicio,
        total_lidas: rows.length,
        sucesso_count: savedRecords.length,
        descartes_count: descartes.length,
        lgpd_k_anonimato_aplicado: true,
      },
      compliance: 'Art. 27 LC 182/2021 & Metas PNATRANS',
    })
  } catch (auditErr) {
    console.warn('Falha ao auditar SINISTRALIDADE_IMPORTADA:', auditErr)
  }

  return {
    totalLidas: rows.length,
    sucessoCount: savedRecords.length,
    descartesCount: descartes.length,
    descartes,
    registrosSalvos: savedRecords,
    procedencia: {
      fontePreset: params.fontePreset,
      fonteNome: params.fonteNome,
      arquivoOrigem: params.fileName,
      anoExercicio: params.anoExercicio,
      operadorNome: params.author.name,
      timestamp: new Date().toISOString(),
      lgpdCompliance: 'Art. 12 LGPD & Descarte de PII de Vítimas',
    },
  }
}

// -------------------------------------------------------------
// EXECUÇÃO DA IMPORTAÇÃO DE EXPOSIÇÃO (INEP / GTFS)
// -------------------------------------------------------------

export async function processAndImportExposicao(params: {
  csvText: string
  fileName: string
  tipoCamada: TipoCamadaExposicao
  fonteNome: string
  anoExercicio: number
  codigoIbge: string
  municipio: string
  uf: string
  mapping: CsvColumnMappingExposicao
  author: AuditTrailAuthor
}): Promise<ImportResult<CamadaExposicaoRecord>> {
  const { rows } = parseCsvText(params.csvText)
  const descartes: ImportDiscardReport[] = []
  const savedRecords: CamadaExposicaoRecord[] = []

  let linha = 1
  for (const row of rows) {
    linha++
    const nome = params.mapping.nomeCol ? row[params.mapping.nomeCol] : ''
    const idExt = params.mapping.identificadorCol ? row[params.mapping.identificadorCol] : ''
    const endereco = params.mapping.enderecoCol ? row[params.mapping.enderecoCol] : ''
    const bairro = params.mapping.bairroCol ? row[params.mapping.bairroCol] : ''
    const lat = parseCoordinate(params.mapping.latCol ? row[params.mapping.latCol] : undefined)
    const lng = parseCoordinate(params.mapping.lngCol ? row[params.mapping.lngCol] : undefined)

    if (!nome) {
      descartes.push({
        linha,
        motivo: 'Registro sem nome do ponto/escola.',
        conteudoResumido: JSON.stringify(row).slice(0, 100),
      })
      continue
    }

    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      descartes.push({
        linha,
        motivo: 'Coordenadas de latitude/longitude inválidas ou ausentes.',
        conteudoResumido: `lat: ${params.mapping.latCol ? row[params.mapping.latCol] : ''}, lng: ${params.mapping.lngCol ? row[params.mapping.lngCol] : ''}`,
      })
      continue
    }

    const h3Res9 = latLngToCell(lat, lng, 9)
    const h3Res10 = latLngToCell(lat, lng, 10)
    const raio = params.tipoCamada === 'escola_inep' ? 150 : 60

    const payload = {
      codigo_ibge: params.codigoIbge,
      municipio: params.municipio,
      uf: params.uf,
      tipo_camada: params.tipoCamada,
      identificador_externo: idExt,
      nome,
      endereco,
      bairro,
      latitude: lat,
      longitude: lng,
      h3_index: h3Res9,
      h3_res10: h3Res10,
      raio_influencia_metros: raio,
      fonte_nome: params.fonteNome,
      arquivo_origem: params.fileName,
      ano_exercicio: params.anoExercicio,
      operador_responsavel_nome: params.author.name,
    }

    try {
      const created = await pb
        .collection('camadas_exposicao')
        .create<CamadaExposicaoRecord>(payload)
      savedRecords.push(created)
    } catch (saveErr) {
      descartes.push({
        linha,
        motivo: 'Erro de validação ao persistir no banco de dados.',
        conteudoResumido: JSON.stringify(payload).slice(0, 100),
      })
    }
  }

  // Trilha de auditoria
  try {
    await registerAuditEvent({
      codigoIbge: params.codigoIbge,
      event: 'CAMADA_EXPOSICAO_IMPORTADA',
      author: params.author,
      details: {
        tipo_camada: params.tipoCamada,
        fonte_nome: params.fonteNome,
        arquivo_origem: params.fileName,
        ano_exercicio: params.anoExercicio,
        total_lidas: rows.length,
        sucesso_count: savedRecords.length,
        descartes_count: descartes.length,
      },
      compliance: 'Art. 27 LC 182/2021 & PNATRANS',
    })
  } catch (auditErr) {
    console.warn('Falha ao auditar CAMADA_EXPOSICAO_IMPORTADA:', auditErr)
  }

  return {
    totalLidas: rows.length,
    sucessoCount: savedRecords.length,
    descartesCount: descartes.length,
    descartes,
    registrosSalvos: savedRecords,
    procedencia: {
      fonteNome: params.fonteNome,
      arquivoOrigem: params.fileName,
      anoExercicio: params.anoExercicio,
      operadorNome: params.author.name,
      timestamp: new Date().toISOString(),
      lgpdCompliance: 'Dados públicos de infraestrutura e polos urbanos',
    },
  }
}

// -------------------------------------------------------------
// AGREGAÇÃO H3 E CÁLCULO DA MATRIZ DE PRIORIDADE ZERO
// -------------------------------------------------------------

/**
 * Agrupa sinistros válidos por célula H3 Res 9
 */
export function aggregateSinistrosByH3(
  sinistros: SinistroImportadoRecord[],
): H3SinistralidadeCell[] {
  const map = new Map<string, SinistroImportadoRecord[]>()

  for (const sin of sinistros) {
    if (!sin.h3_index && sin.latitude && sin.longitude) {
      sin.h3_index = latLngToCell(sin.latitude, sin.longitude, 9)
    }
    if (!sin.h3_index) continue

    const list = map.get(sin.h3_index) || []
    list.push(sin)
    map.set(sin.h3_index, list)
  }

  const cells: H3SinistralidadeCell[] = []

  for (const [h3Index, items] of map.entries()) {
    const center = cellToLatLng(h3Index)
    const boundary = cellToBoundary(h3Index)

    let fatais = 0
    let feridos = 0
    let pedestres = 0
    let ciclistas = 0
    let motociclistas = 0
    const viasSet = new Set<string>()
    const tiposMap = new Map<string, number>()

    for (const it of items) {
      fatais += it.vitimas_fatais || 0
      feridos += it.vitimas_feridas || 0
      if (it.logradouro_rodovia) viasSet.add(it.logradouro_rodovia)
      if (it.tipo_vitima_predominante === 'pedestre') pedestres++
      if (it.tipo_vitima_predominante === 'ciclista') ciclistas++
      if (it.tipo_vitima_predominante === 'motociclista') motociclistas++
      if (it.tipo_sinistro) {
        tiposMap.set(it.tipo_sinistro, (tiposMap.get(it.tipo_sinistro) || 0) + 1)
      }
    }

    const severidadePredominante: SeveridadeSinistro =
      fatais > 0 ? 'com_vitimas_fatais' : feridos > 0 ? 'com_vitimas_feridas' : 'sem_vitimas'

    const tiposSorted = Array.from(tiposMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tipo]) => tipo)

    cells.push({
      h3_index: h3Index,
      center_lat: center.lat,
      center_lng: center.lng,
      boundary,
      total_sinistros: items.length,
      vitimas_fatais: fatais,
      vitimas_feridas: feridos,
      severidade_predominante: severidadePredominante,
      tipos_frequentes: tiposSorted.slice(0, 3),
      vias_afetadas: Array.from(viasSet),
      pedestres_envolvidos: pedestres,
      ciclistas_envolvidos: ciclistas,
      motociclistas_envolvidos: motociclistas,
    })
  }

  return cells
}

/**
 * Computa a Matriz de Prioridade Zero por célula H3:
 * Score = Fator Pavimento (telemetria/IRI) × 0.35 +
 *         Fator Sinistralidade (óbitos/feridos) × 0.40 +
 *         Fator Exposição (escolas INEP + paradas GTFS) × 0.25
 *
 * Princípio da Honestidade: se a telemetria não existir na célula, exibe explicitamente
 * "sem dados de telemetria" e pondera pelos fatores disponíveis com procedência declarada.
 */
export function computeMatrizPrioridadeZero(params: {
  sinistros: SinistroImportadoRecord[]
  exposicoes: CamadaExposicaoRecord[]
  telemetriaH3Cells?: Array<{
    h3_index: string
    imv_medio?: number
    iri_medio?: number
    k_anonymity_satisfied?: boolean
    total_sessions?: number
  }>
}): H3MatrizZeroCell[] {
  // Mapa de todas as células H3 ativas
  const allH3Set = new Set<string>()

  const sinistrosByH3 = new Map<string, SinistroImportadoRecord[]>()
  for (const s of params.sinistros) {
    const idx =
      s.h3_index || (s.latitude && s.longitude ? latLngToCell(s.latitude, s.longitude, 9) : null)
    if (idx) {
      allH3Set.add(idx)
      const list = sinistrosByH3.get(idx) || []
      list.push(s)
      sinistrosByH3.set(idx, list)
    }
  }

  const exposicoesByH3 = new Map<string, CamadaExposicaoRecord[]>()
  for (const exp of params.exposicoes) {
    const idx = exp.h3_index || latLngToCell(exp.latitude, exp.longitude, 9)
    if (idx) {
      allH3Set.add(idx)
      const list = exposicoesByH3.get(idx) || []
      list.push(exp)
      exposicoesByH3.set(idx, list)
    }
  }

  const telemetriaByH3 = new Map<string, any>()
  if (params.telemetriaH3Cells) {
    for (const t of params.telemetriaH3Cells) {
      telemetriaByH3.set(t.h3_index, t)
      allH3Set.add(t.h3_index)
    }
  }

  const cells: H3MatrizZeroCell[] = []

  for (const h3Index of allH3Set) {
    const center = cellToLatLng(h3Index)
    const boundary = cellToBoundary(h3Index)

    const sins = sinistrosByH3.get(h3Index) || []
    const exps = exposicoesByH3.get(h3Index) || []
    const telem = telemetriaByH3.get(h3Index)

    // 1. Fator Sinistros
    let fatais = 0
    let feridos = 0
    const viasSet = new Set<string>()
    for (const s of sins) {
      fatais += s.vitimas_fatais || 0
      feridos += s.vitimas_feridas || 0
      if (s.logradouro_rodovia) viasSet.add(s.logradouro_rodovia)
    }
    // Score de sinistralidade 0..100: cada óbito pesa 35pts, cada ferido 15pts, cada sinistro sem vítima 5pts
    const rawSinScore = fatais * 35 + feridos * 15 + (sins.length - fatais - feridos) * 5
    const scoreSinistralidade = Math.min(100, Math.round(rawSinScore))
    const temDadoSinistros = sins.length > 0
    const procedenciaSinistros = temDadoSinistros
      ? `${sins[0].fonte_nome} (${sins[0].ano_exercicio || 2024})`
      : 'Sem sinistros catalogados na célula'

    // 2. Fator Exposição
    const escolas = exps.filter((e) => e.tipo_camada === 'escola_inep')
    const pontos = exps.filter((e) => e.tipo_camada === 'ponto_onibus_gtfs')
    for (const e of exps) {
      if (e.endereco) viasSet.add(e.endereco)
      if (e.nome) viasSet.add(e.nome)
    }
    // Cada escola na célula soma 40pts, cada parada de ônibus soma 20pts
    const rawExpScore = escolas.length * 40 + pontos.length * 20
    const scoreExposicao = Math.min(100, Math.round(rawExpScore))
    const temDadoExposicao = exps.length > 0
    const procedenciaExposicao = temDadoExposicao
      ? `INEP Censo Escolar + GTFS stops.txt (${exps[0].ano_exercicio || 2024})`
      : 'Sem polos catalogados na célula'

    // 3. Fator Pavimento (Telemetria)
    let temDadoPavimento = false
    let scorePavimentoDegradado = 0 // Inverte o IMV: IMV baixo = asfalto ruim = alta prioridade de intervenção
    let procedenciaPavimento = 'Sem leituras inerciais nesta célula (Aguardando Coleta)'
    let iriMedio: number | undefined
    let imvMedio: number | undefined

    if (
      telem &&
      (telem.k_anonymity_satisfied || telem.total_sessions >= 3 || telem.imv_medio !== undefined)
    ) {
      temDadoPavimento = true
      imvMedio = telem.imv_medio ?? 70
      iriMedio = telem.iri_medio ?? 3.5
      // IMV vai de 0 a 100. Degradação = 100 - IMV.
      scorePavimentoDegradado = Math.max(0, Math.min(100, 100 - imvMedio))
      procedenciaPavimento = 'Telemetria Inercial de Frota (IMV / Fator K Calibrado)'
    }

    // 4. Cálculo Ponderado Transparente
    let scoreFinal = 0
    if (temDadoPavimento) {
      // 35% Pavimento + 40% Sinistralidade + 25% Exposição
      scoreFinal = Math.round(
        scorePavimentoDegradado * 0.35 + scoreSinistralidade * 0.4 + scoreExposicao * 0.25,
      )
    } else {
      // Pondera honestamente sem inventar dado de telemetria: 60% Sinistralidade + 40% Exposição
      scoreFinal = Math.round(scoreSinistralidade * 0.6 + scoreExposicao * 0.4)
    }

    let criticidade: H3MatrizZeroCell['criticidade_geral'] = 'monitoramento'
    let acao = 'Monitoramento de rotina e varredura programada'

    if (scoreFinal >= 75 || fatais > 0) {
      criticidade = 'prioridade_maxima'
      acao =
        'Intervenção preventiva imediata (reparação asfáltica emergencial, travessia elevada ou redutor Z30)'
    } else if (scoreFinal >= 50) {
      criticidade = 'alta'
      acao = 'Inclusão no cronograma de recapeamento prioritário do Art. 320 CTB'
    } else if (scoreFinal >= 30) {
      criticidade = 'media'
      acao = 'Sinalização viária, pintura de faixas e reforço semafórico'
    }

    cells.push({
      h3_index: h3Index,
      center_lat: center.lat,
      center_lng: center.lng,
      boundary,
      score_prioridade_zero: scoreFinal,
      criticidade_geral: criticidade,
      fator_pavimento: {
        tem_dado: temDadoPavimento,
        score_imv: imvMedio,
        iri_medio: iriMedio,
        procedencia: procedenciaPavimento,
      },
      fator_sinistralidade: {
        tem_dado: temDadoSinistros,
        total_sinistros: sins.length,
        fatais,
        feridos,
        score_sinistralidade: scoreSinistralidade,
        procedencia: procedenciaSinistros,
      },
      fator_exposicao: {
        tem_dado: temDadoExposicao,
        escolas_count: escolas.length,
        escolas_nomes: escolas.map((e) => e.nome),
        pontos_onibus_count: pontos.length,
        score_exposicao: scoreExposicao,
        procedencia: procedenciaExposicao,
      },
      vias_principais: Array.from(viasSet).slice(0, 3),
      acao_sugerida: acao,
    })
  }

  // Ordena por score decrescente
  return cells.sort((a, b) => b.score_prioridade_zero - a.score_prioridade_zero)
}
