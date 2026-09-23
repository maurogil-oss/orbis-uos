import { useState, useMemo } from 'react'
import {
  Layers,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GraduationCap,
  Bus,
  Shield,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  ExternalLink,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import {
  FontePresetSinistro,
  TipoCamadaExposicao,
  SinistroImportadoRecord,
  CamadaExposicaoRecord,
  H3SinistralidadeCell,
  H3MatrizZeroCell,
  CsvColumnMappingSinistro,
  CsvColumnMappingExposicao,
  ImportResult,
  parseCsvText,
  getPresetMappingSuggestion,
  processAndImportSinistros,
  processAndImportExposicao,
  updateSinistroCoordenadas,
  deleteSinistro,
  deleteCamadaExposicao,
} from '@/services/sinistralidadeExposicao'
import { SinistralidadeH3Map } from '@/components/SinistralidadeH3Map'
import { AuditTrailAuthor } from '@/services/institucionalSettings'

interface CamadasDadosExternosTabProps {
  sinistros: SinistroImportadoRecord[]
  exposicoes: CamadaExposicaoRecord[]
  sinistroCells: H3SinistralidadeCell[]
  matrizCells: H3MatrizZeroCell[]
  author: AuditTrailAuthor
  onDataChanged: () => void
}

export function CamadasDadosExternosTab({
  sinistros,
  exposicoes,
  sinistroCells,
  matrizCells,
  author,
  onDataChanged,
}: CamadasDadosExternosTabProps) {
  const [subTab, setSubTab] = useState<
    | 'mapa'
    | 'import_sinistros'
    | 'import_exposicao'
    | 'tabela_sinistros'
    | 'tabela_exposicao'
    | 'matriz_zero'
  >('mapa')

  // Estado para importação de sinistros
  const [sinPreset, setSinPreset] = useState<FontePresetSinistro>('prf')
  const [sinFonteNome, setSinFonteNome] = useState<string>(
    'PRF - Acidentes Rodoviários em Trecho Urbano',
  )
  const [sinAnoExercicio, setSinAnoExercicio] = useState<number>(2024)
  const [sinCsvContent, setSinCsvContent] = useState<string>('')
  const [sinFileName, setSinFileName] = useState<string>('')
  const [sinParsedHeaders, setSinParsedHeaders] = useState<string[]>([])
  const [sinMapping, setSinMapping] = useState<CsvColumnMappingSinistro>({})
  const [sinImporting, setSinImporting] = useState<boolean>(false)
  const [sinImportResult, setSinImportResult] =
    useState<ImportResult<SinistroImportadoRecord> | null>(null)

  // Estado para importação de exposição
  const [expTipo, setExpTipo] = useState<TipoCamadaExposicao>('escola_inep')
  const [expFonteNome, setExpFonteNome] = useState<string>('INEP - Censo Escolar MEC')
  const [expAnoExercicio, setExpAnoExercicio] = useState<number>(2024)
  const [expCsvContent, setExpCsvContent] = useState<string>('')
  const [expFileName, setExpFileName] = useState<string>('')
  const [expParsedHeaders, setExpParsedHeaders] = useState<string[]>([])
  const [expMapping, setExpMapping] = useState<CsvColumnMappingExposicao>({})
  const [expImporting, setExpImporting] = useState<boolean>(false)
  const [expImportResult, setExpImportResult] =
    useState<ImportResult<CamadaExposicaoRecord> | null>(null)

  // Edição manual de geocoding para registros pendentes
  const [editingGeocodingId, setEditingGeocodingId] = useState<string | null>(null)
  const [editLat, setEditLat] = useState<string>('')
  const [editLng, setEditLng] = useState<string>('')
  const [isSavingGeocoding, setIsSavingGeocoding] = useState<boolean>(false)

  // Filtros de busca na tabela
  const [searchSinistros, setSearchSinistros] = useState<string>('')

  // Ao selecionar um preset, atualiza o nome padrão sugerido e sugestões
  const handlePresetChange = (preset: FontePresetSinistro) => {
    setSinPreset(preset)
    if (preset === 'prf') {
      setSinFonteNome('PRF - Acidentes Rodoviários em Trecho Urbano (Dados Abertos)')
    } else if (preset === 'bombeiros') {
      setSinFonteNome('Corpo de Bombeiros / SIATE - Resgate Urbano')
    } else {
      setSinFonteNome('Boletins da Guarda Municipal / SAMU / Setran')
    }

    if (sinParsedHeaders.length > 0) {
      const suggested = getPresetMappingSuggestion(preset, sinParsedHeaders)
      setSinMapping(suggested)
    }
  }

  // Manipulador de upload de arquivo CSV para sinistros
  const handleSinistroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSinFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setSinCsvContent(text)
      const { headers } = parseCsvText(text)
      setSinParsedHeaders(headers)
      const suggested = getPresetMappingSuggestion(sinPreset, headers)
      setSinMapping(suggested)
    }
    reader.readAsText(file)
  }

  // Manipulador de upload de arquivo CSV para exposição (INEP / GTFS stops.txt)
  const handleExposicaoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setExpFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setExpCsvContent(text)
      const { headers } = parseCsvText(text)
      setExpParsedHeaders(headers)

      // Sugestão de mapeamento GTFS vs INEP
      const findHeader = (candidates: string[]) =>
        headers.find((h) => candidates.some((c) => h.includes(c) || h === c))

      if (expTipo === 'ponto_onibus_gtfs' || file.name.includes('stops')) {
        setExpTipo('ponto_onibus_gtfs')
        setExpFonteNome('GTFS URBS Curitiba (stops.txt)')
        setExpMapping({
          identificadorCol: findHeader(['stop_id', 'id']),
          nomeCol: findHeader(['stop_name', 'nome', 'descricao']),
          latCol: findHeader(['stop_lat', 'lat', 'latitude']),
          lngCol: findHeader(['stop_lon', 'stop_lng', 'lon', 'lng', 'longitude']),
          enderecoCol: findHeader(['stop_desc', 'endereco']),
        })
      } else {
        setExpMapping({
          identificadorCol: findHeader(['cod_escola', 'codigo', 'inep', 'id']),
          nomeCol: findHeader(['no_entidade', 'nome_escola', 'escola', 'nome']),
          latCol: findHeader(['nu_latitude', 'latitude', 'lat']),
          lngCol: findHeader(['nu_longitude', 'longitude', 'long', 'lng']),
          enderecoCol: findHeader(['ds_endereco', 'endereco', 'logradouro']),
          bairroCol: findHeader(['no_bairro', 'bairro']),
        })
      }
    }
    reader.readAsText(file)
  }

  // Submissão do processador de sinistros
  const handleExecuteSinistrosImport = async () => {
    if (!sinCsvContent) return
    setSinImporting(true)
    try {
      const result = await processAndImportSinistros({
        csvText: sinCsvContent,
        fileName: sinFileName || 'dados_sinistros.csv',
        fontePreset: sinPreset,
        fonteNome: sinFonteNome,
        anoExercicio: sinAnoExercicio,
        codigoIbge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        mapping: sinMapping,
        author,
      })
      setSinImportResult(result)
      onDataChanged()
    } catch (err) {
      console.error('Falha ao importar sinistros:', err)
      alert('Ocorreu um erro ao processar a importação.')
    } finally {
      setSinImporting(false)
    }
  }

  // Submissão do processador de exposição
  const handleExecuteExposicaoImport = async () => {
    if (!expCsvContent) return
    setExpImporting(true)
    try {
      const result = await processAndImportExposicao({
        csvText: expCsvContent,
        fileName: expFileName || 'camada_exposicao.csv',
        tipoCamada: expTipo,
        fonteNome: expFonteNome,
        anoExercicio: expAnoExercicio,
        codigoIbge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        mapping: expMapping,
        author,
      })
      setExpImportResult(result)
      onDataChanged()
    } catch (err) {
      console.error('Falha ao importar exposição:', err)
      alert('Ocorreu um erro ao processar a camada de exposição.')
    } finally {
      setExpImporting(false)
    }
  }

  // Salvar geocodificação manual
  const handleSaveManualGeocoding = async (id: string) => {
    const lat = parseFloat(editLat)
    const lng = parseFloat(editLng)
    if (isNaN(lat) || isNaN(lng)) {
      alert('Coordenadas inválidas. Use números como -25.4372 e -49.2731.')
      return
    }

    setIsSavingGeocoding(true)
    try {
      await updateSinistroCoordenadas(id, lat, lng)
      setEditingGeocodingId(null)
      setEditLat('')
      setEditLng('')
      onDataChanged()
    } catch (err) {
      console.error('Erro ao atualizar coordenadas:', err)
      alert('Falha ao salvar coordenadas.')
    } finally {
      setIsSavingGeocoding(false)
    }
  }

  const handleDeleteSinistroItem = async (id: string) => {
    if (!confirm('Deseja excluir este registro de sinistro?')) return
    await deleteSinistro(id)
    onDataChanged()
  }

  const handleDeleteExposicaoItem = async (id: string) => {
    if (!confirm('Deseja remover este polo da camada de exposição?')) return
    await deleteCamadaExposicao(id)
    onDataChanged()
  }

  // Métricas rápidas
  const totalSinistros = sinistros.length
  const totalFatais = sinistros.reduce((acc, curr) => acc + (curr.vitimas_fatais || 0), 0)
  const totalFeridos = sinistros.reduce((acc, curr) => acc + (curr.vitimas_feridas || 0), 0)
  const pendentesGeocoding = sinistros.filter(
    (s) => s.status_geocoding === 'pendente_geocodificacao',
  ).length
  const totalEscolas = exposicoes.filter((e) => e.tipo_camada === 'escola_inep').length
  const totalPontosGtfs = exposicoes.filter((e) => e.tipo_camada === 'ponto_onibus_gtfs').length

  const filteredSinistros = useMemo(() => {
    if (!searchSinistros.trim()) return sinistros
    const q = searchSinistros.toLowerCase()
    return sinistros.filter(
      (s) =>
        (s.logradouro_rodovia || '').toLowerCase().includes(q) ||
        (s.bairro || '').toLowerCase().includes(q) ||
        (s.tipo_sinistro || '').toLowerCase().includes(q) ||
        (s.fonte_nome || '').toLowerCase().includes(q) ||
        (s.h3_index || '').toLowerCase().includes(q),
    )
  }, [sinistros, searchSinistros])

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#EF4444]/40 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase bg-[#EF4444]/20 text-[#EF4444] px-2.5 py-0.5 rounded border border-[#EF4444]/40 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Módulo Soberano de Sinistralidade & Exposição
              </span>
              <span className="text-xs text-[#94A3B8]">
                Ancoragem Espacial H3 & Procedência Auditável
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] mt-1">
              Camadas de Dados Externos • Matriz de Prioridade Zero
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-3xl leading-relaxed">
              Integração dos três datasets estratégicos da gestão urbana: <b>Sinistralidade</b>{' '}
              (PRF, Bombeiros e Boletins Municipais), <b>Escolas (INEP / Censo Escolar)</b> e{' '}
              <b>Pontos de Ônibus (GTFS)</b>. Todas as entidades são ancoradas em células hexagonais
              H3 e cruzadas diretamente com o estado inercial do asfalto (IMV/IRI).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-mono font-bold text-[#10B981]">
              <Shield className="w-3.5 h-3.5" />
              <span>LGPD: Descarte de PII</span>
            </span>
            <span className="text-xs font-mono text-[#94A3B8] bg-[#101B3A] px-2.5 py-1 rounded-xl border border-[#1A2A5A]">
              H3 Res 9 (~174m)
            </span>
          </div>
        </div>

        {/* 4 Cards de Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Sinistros Catalogados</span>
              <Flame className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#F8FAFC]">{totalSinistros}</div>
            <span className="text-[10px] text-[#EF4444] font-semibold">
              {totalFatais} óbitos • {totalFeridos} feridos
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Células H3 com Sinistros</span>
              <Layers className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#3B82F6]">
              {sinistroCells.length}
            </div>
            <span className="text-[10px] text-[#94A3B8]">
              {pendentesGeocoding > 0 ? (
                <span className="text-[#F59E0B] font-bold">
                  {pendentesGeocoding} pendente(s) de coordenadas
                </span>
              ) : (
                '100% geolocalizados'
              )}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Escolas INEP Cadastradas</span>
              <GraduationCap className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#10B981]">{totalEscolas}</div>
            <span className="text-[10px] text-[#94A3B8]">Perímetro escolar protegido</span>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Pontos de Ônibus GTFS</span>
              <Bus className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#60A5FA]">{totalPontosGtfs}</div>
            <span className="text-[10px] text-[#94A3B8]">Exposição de passageiros</span>
          </div>
        </div>

        {/* Navegação Secundária do Módulo */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1A2A5A]">
          <button
            type="button"
            onClick={() => setSubTab('mapa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'mapa'
                ? 'bg-[#EF4444] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mapa Espacial H3</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('matriz_zero')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'matriz_zero'
                ? 'bg-[#3B82F6] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cruzamento na Matriz Zero ({matrizCells.length} trechos)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('import_sinistros')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'import_sinistros'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Importar Sinistros (Presets)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('import_exposicao')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'import_exposicao'
                ? 'bg-[#10B981] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Importar Exposição (INEP / GTFS)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('tabela_sinistros')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'tabela_sinistros'
                ? 'bg-[#60A5FA] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Base de Sinistros ({sinistros.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('tabela_exposicao')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'tabela_exposicao'
                ? 'bg-[#10B981] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Base de Polos ({exposicoes.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-ABA 1: MAPA ESPACIAL H3 & MANCHA DE SINISTROS         */}
      {/* ========================================================= */}
      {subTab === 'mapa' && (
        <div className="space-y-4">
          <SinistralidadeH3Map
            sinistroCells={sinistroCells}
            matrizCells={matrizCells}
            rawSinistros={sinistros}
            rawExposicoes={exposicoes}
            mode="sinistros"
          />

          {/* Painel Lateral com Procedência Declarada das Camadas */}
          <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">
                  Procedência Declarada das Camadas em Produção
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#94A3B8]">
                Município de Curitiba (IBGE 4106902)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1">
                <span className="text-[#EF4444] font-bold block">1. Camada de Sinistralidade</span>
                <p className="text-[#CBD5E1]">
                  Fontes ativas: <b>PRF Dados Abertos, Bombeiros/SIATE e Guarda Municipal</b>
                </p>
                <span className="text-[10px] text-[#94A3B8] block">
                  Total: {totalSinistros} registros auditados • Ancoragem H3 Res 9 (~174m)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1">
                <span className="text-[#10B981] font-bold block">2. Camada Escolas (INEP)</span>
                <p className="text-[#CBD5E1]">
                  Fonte oficial: <b>INEP / Censo Escolar MEC 2024</b>
                </p>
                <span className="text-[10px] text-[#94A3B8] block">
                  Buffer protetivo: 150m ao redor do polo escolar de vulneráveis
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1">
                <span className="text-[#60A5FA] font-bold block">3. Camada Transporte (GTFS)</span>
                <p className="text-[#CBD5E1]">
                  Fonte oficial: <b>GTFS URBS Curitiba (stops.txt)</b>
                </p>
                <span className="text-[10px] text-[#94A3B8] block">
                  Buffer de pedestres: 60m nos pontos e estações tubo de maior fluxo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-ABA 2: CRUZAMENTO NA MATRIZ DE PRIORIDADE ZERO        */}
      {/* ========================================================= */}
      {subTab === 'matriz_zero' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0A1128] border-2 border-[#3B82F6]/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1A2A5A]">
              <div>
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#3B82F6]" />
                  Matriz de Prioridade Zero: Pavimento × Sinistralidade × Exposição
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Cálculo determinístico do Score de Intervenção Preventiva por célula H3. Fatores
                  exibidos separadamente com procedência transparente.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#3B82F6] bg-[#3B82F6]/15 px-3 py-1 rounded-full border border-[#3B82F6]/30">
                {matrizCells.length} Células Processadas
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#CBD5E1] space-y-1">
              <b>Fórmula do Score Ponderado:</b>
              <div className="font-mono text-[11px] text-[#60A5FA]">
                Score = 35% Pavimento Degradado (IMV/IRI) + 40% Sinistralidade (Óbitos/Feridos) +
                25% Exposição (Escolas + GTFS)
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                * <b>Princípio da Honestidade:</b> Se uma célula H3 não possuir telemetria inercial
                recente, o termo de pavimento é honestamente indicado como "Sem dados" e a
                prioridade é computada com base nos fatores conhecidos (60% Sinistros + 40%
                Exposição), sem inventar medição.
              </p>
            </div>
          </div>

          {/* Mapa no Modo Matriz Zero */}
          <SinistralidadeH3Map
            sinistroCells={sinistroCells}
            matrizCells={matrizCells}
            rawSinistros={sinistros}
            rawExposicoes={exposicoes}
            mode="matriz_zero"
          />

          {/* Tabela de Classificação da Matriz Zero */}
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Ranking de Prioridade de Intervenção por Trecho H3
                </h3>
                <span className="text-xs text-[#94A3B8]">
                  Ordenado por urgência da vida humana e risco estrutural
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase font-mono text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]/50">
                  <tr>
                    <th className="py-3 px-3">Célula H3 / Vias</th>
                    <th className="py-3 px-3 text-center">Score Prioridade</th>
                    <th className="py-3 px-3">Fator Sinistros</th>
                    <th className="py-3 px-3">Fator Exposição</th>
                    <th className="py-3 px-3">Fator Pavimento (IMV)</th>
                    <th className="py-3 px-3">Ação Orçamentária Sugerida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2A5A]/50">
                  {matrizCells.map((cell) => {
                    const badgeColor =
                      cell.criticidade_geral === 'prioridade_maxima'
                        ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                        : cell.criticidade_geral === 'alta'
                          ? 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/40'
                          : 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/40'

                    return (
                      <tr key={cell.h3_index} className="hover:bg-[#1A2A5A]/30">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#60A5FA] block">
                            {cell.h3_index}
                          </span>
                          <span className="text-[#CBD5E1] font-semibold text-[11px]">
                            {cell.vias_principais.join(', ') || 'Trecho sem denominação'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-mono font-black text-sm border ${badgeColor}`}
                          >
                            {cell.score_prioridade_zero} / 100
                          </span>
                          <span className="block text-[9px] uppercase font-mono text-[#94A3B8] mt-0.5">
                            {cell.criticidade_geral.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {cell.fator_sinistralidade.tem_dado ? (
                            <div className="space-y-0.5">
                              <span className="text-[#EF4444] font-bold block">
                                {cell.fator_sinistralidade.fatais} óbito(s) •{' '}
                                {cell.fator_sinistralidade.feridos} ferido(s)
                              </span>
                              <span className="text-[10px] text-[#94A3B8] block truncate max-w-[180px]">
                                {cell.fator_sinistralidade.procedencia}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#94A3B8] italic">Sem ocorrências</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {cell.fator_exposicao.tem_dado ? (
                            <div className="space-y-0.5">
                              <span className="text-[#10B981] font-semibold block">
                                {cell.fator_exposicao.escolas_count} escola(s) •{' '}
                                {cell.fator_exposicao.pontos_onibus_count} parada(s)
                              </span>
                              <span className="text-[10px] text-[#94A3B8] block truncate max-w-[180px]">
                                {cell.fator_exposicao.escolas_nomes.join(', ') ||
                                  cell.fator_exposicao.procedencia}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#94A3B8] italic">Sem polos próximos</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {cell.fator_pavimento.tem_dado ? (
                            <div>
                              <span className="font-mono font-bold text-[#F8FAFC]">
                                IMV: {cell.fator_pavimento.score_imv?.toFixed(1)}
                              </span>
                              <span className="block text-[10px] text-[#94A3B8]">
                                IRI: {cell.fator_pavimento.iri_medio?.toFixed(1)} m/km
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded font-mono italic">
                              Sem telemetria recente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#CBD5E1] text-[11px] leading-snug">
                          {cell.acao_sugerida}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-ABA 3: IMPORTAÇÃO DE SINISTROS COM PRESETS           */}
      {/* ========================================================= */}
      {subTab === 'import_sinistros' && (
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-6">
          <div className="pb-4 border-b border-[#1A2A5A]">
            <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#F97316]" />
              Importação Tolerante de Sinistralidade (Presets PRF, Bombeiros, CSV do Órgão)
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              O motor aceita qualquer formato tabular (CSV com delimitador vírgula ou
              ponto-e-vírgula). O operador associa as colunas aos campos do modelo com validação de
              descarte e relatório nominal.
            </p>
          </div>

          {/* Seleção do Preset */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handlePresetChange('prf')}
              className={`p-4 rounded-xl border text-left transition-all ${
                sinPreset === 'prf'
                  ? 'bg-[#EF4444]/15 border-[#EF4444] text-white shadow-lg'
                  : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#EF4444]/40'
              }`}
            >
              <span className="text-xs font-mono font-bold text-[#EF4444] uppercase block">
                Preset 1
              </span>
              <h4 className="font-bold text-sm text-[#F8FAFC] mt-0.5">PRF (Polícia Rodoviária)</h4>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Dataset aberto do Governo Federal (datatran): data, horário, km, br, latitude,
                longitude, mortos, feridos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('bombeiros')}
              className={`p-4 rounded-xl border text-left transition-all ${
                sinPreset === 'bombeiros'
                  ? 'bg-[#F97316]/15 border-[#F97316] text-white shadow-lg'
                  : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#F97316]/40'
              }`}
            >
              <span className="text-xs font-mono font-bold text-[#F97316] uppercase block">
                Preset 2
              </span>
              <h4 className="font-bold text-sm text-[#F8FAFC] mt-0.5">
                Corpo de Bombeiros (SIATE/CBMSC)
              </h4>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Atendimentos de socorro de trânsito: data, endereço, município, coordenadas,
                natureza e vítimas socorridas.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('csv_orgao')}
              className={`p-4 rounded-xl border text-left transition-all ${
                sinPreset === 'csv_orgao'
                  ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-white shadow-lg'
                  : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/40'
              }`}
            >
              <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase block">
                Preset 3
              </span>
              <h4 className="font-bold text-sm text-[#F8FAFC] mt-0.5">
                CSV do Órgão (SAMU / Guarda)
              </h4>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Formato livre municipal: mapeamento assistido de qualquer planilha ou exportação de
                BOs de trânsito.
              </p>
            </button>
          </div>

          {/* Dados de Procedência */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[#94A3B8] font-semibold mb-1">
                Nome da Fonte / Procedência
              </label>
              <input
                type="text"
                value={sinFonteNome}
                onChange={(e) => setSinFonteNome(e.target.value)}
                className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] font-semibold mb-1">
                Exercício / Ano dos Dados
              </label>
              <input
                type="number"
                value={sinAnoExercicio}
                onChange={(e) => setSinAnoExercicio(parseInt(e.target.value) || 2024)}
                className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] font-semibold mb-1">
                Operador Responsável
              </label>
              <input
                type="text"
                disabled
                value={`${author.name} (${author.email})`}
                className="w-full bg-[#0A1128]/50 border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#94A3B8]"
              />
            </div>
          </div>

          {/* Upload do Arquivo */}
          <div className="p-6 rounded-xl bg-[#0A1128] border-2 border-dashed border-[#1A2A5A] hover:border-[#3B82F6] transition-colors text-center space-y-2">
            <UploadCloud className="w-8 h-8 text-[#3B82F6] mx-auto" />
            <div className="text-xs text-[#CBD5E1]">
              <label className="text-[#3B82F6] hover:underline font-bold cursor-pointer">
                <span>Clique para selecionar o arquivo CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleSinistroFileUpload}
                  className="hidden"
                />
              </label>{' '}
              <span>ou arraste o arquivo até aqui</span>
            </div>
            <span className="text-[11px] text-[#94A3B8] block">
              {sinFileName
                ? `Arquivo selecionado: ${sinFileName}`
                : 'Formatos aceitos: CSV (.csv), texto (.txt) delimitado'}
            </span>
          </div>

          {/* Mapeamento de Colunas (se arquivo carregado) */}
          {sinParsedHeaders.length > 0 && (
            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <h4 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  Mapeamento Flexível de Colunas ({sinParsedHeaders.length} colunas detectadas no
                  CSV)
                </h4>
                <span className="text-[10px] text-[#94A3B8]">
                  Associe as colunas do seu arquivo aos campos do modelo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Coluna de Latitude</label>
                  <select
                    value={sinMapping.latCol || ''}
                    onChange={(e) => setSinMapping({ ...sinMapping, latCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Não mapeada / pendente)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Coluna de Longitude</label>
                  <select
                    value={sinMapping.lngCol || ''}
                    onChange={(e) => setSinMapping({ ...sinMapping, lngCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Não mapeada / pendente)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Logradouro / Rodovia / BR</label>
                  <select
                    value={sinMapping.logradouroCol || ''}
                    onChange={(e) =>
                      setSinMapping({ ...sinMapping, logradouroCol: e.target.value })
                    }
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione a coluna)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Bairro / Região</label>
                  <select
                    value={sinMapping.bairroCol || ''}
                    onChange={(e) => setSinMapping({ ...sinMapping, bairroCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione a coluna)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Data da Ocorrência</label>
                  <select
                    value={sinMapping.dataCol || ''}
                    onChange={(e) => setSinMapping({ ...sinMapping, dataCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione a coluna)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Horário</label>
                  <select
                    value={sinMapping.horarioCol || ''}
                    onChange={(e) => setSinMapping({ ...sinMapping, horarioCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Opcional)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Vítimas Fatais (Óbitos)</label>
                  <select
                    value={sinMapping.vitimasFataisCol || ''}
                    onChange={(e) =>
                      setSinMapping({ ...sinMapping, vitimasFataisCol: e.target.value })
                    }
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione a coluna)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Vítimas Feridas</label>
                  <select
                    value={sinMapping.vitimasFeridasCol || ''}
                    onChange={(e) =>
                      setSinMapping({ ...sinMapping, vitimasFeridasCol: e.target.value })
                    }
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione a coluna)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Tipo de Sinistro</label>
                  <select
                    value={sinMapping.tipoSinistroCol || ''}
                    onChange={(e) =>
                      setSinMapping({ ...sinMapping, tipoSinistroCol: e.target.value })
                    }
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione a coluna)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Tipo de Vítima (Modo)</label>
                  <select
                    value={sinMapping.tipoVitimaCol || ''}
                    onChange={(e) =>
                      setSinMapping({ ...sinMapping, tipoVitimaCol: e.target.value })
                    }
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Opcional: pedestre, moto...)</option>
                    {sinParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botão de Processar Importação */}
              <div className="pt-3 border-t border-[#1A2A5A] flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteSinistrosImport}
                  disabled={sinImporting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white font-bold text-xs shadow-lg shadow-[#EF4444]/20 flex items-center gap-2"
                >
                  {sinImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validando e Ancorando em H3...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Processar Arquivo & Carimbar Procedência</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Relatório de Resultados e Descartes */}
          {sinImportResult && (
            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#10B981]/50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <h4 className="text-xs font-bold text-[#F8FAFC]">
                    Relatório de Importação de Sinistralidade Concluída
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#10B981]">
                  {sinImportResult.sucessoCount} registros importados com sucesso
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  Total de linhas: <b>{sinImportResult.totalLidas}</b>
                </div>
                <div className="text-[#10B981]">
                  Registros Válidos: <b>{sinImportResult.sucessoCount}</b>
                </div>
                <div className="text-[#F59E0B]">
                  Descartes/Inconsistentes: <b>{sinImportResult.descartesCount}</b>
                </div>
              </div>

              {sinImportResult.descartes.length > 0 && (
                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-bold text-[#F59E0B] block">
                    Linhas Descartadas pelo Validador (Integridade):
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {sinImportResult.descartes.slice(0, 10).map((d, i) => (
                      <div key={i} className="text-[10px] text-[#94A3B8] bg-[#101B3A] p-2 rounded">
                        Linha {d.linha}: <b>{d.motivo}</b> • <i>{d.conteudoResumido}</i>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-ABA 4: IMPORTAÇÃO DE EXPOSIÇÃO (INEP / GTFS)          */}
      {/* ========================================================= */}
      {subTab === 'import_exposicao' && (
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-6">
          <div className="pb-4 border-b border-[#1A2A5A]">
            <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#10B981]" />
              Importação das Camadas de Exposição (Escolas INEP & Paradas GTFS)
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              Cadastre os polos geradores de viagens e concentração de vulneráveis para cruzamento
              com pavimento e manchas de sinistros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setExpTipo('escola_inep')
                setExpFonteNome('INEP - Censo Escolar MEC')
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                expTipo === 'escola_inep'
                  ? 'bg-[#10B981]/15 border-[#10B981] text-white shadow-lg'
                  : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#10B981]" />
                <span className="font-bold text-sm text-[#F8FAFC]">
                  Escolas (INEP / Censo Escolar)
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                CSV com nome da instituição, endereço, código INEP e coordenadas de
                latitude/longitude.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setExpTipo('ponto_onibus_gtfs')
                setExpFonteNome('GTFS URBS Curitiba (stops.txt)')
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                expTipo === 'ponto_onibus_gtfs'
                  ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-white shadow-lg'
                  : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-[#3B82F6]" />
                <span className="font-bold text-sm text-[#F8FAFC]">
                  Pontos de Ônibus (GTFS stops.txt)
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Arquivo padrão stops.txt do feed GTFS municipal (stop_id, stop_name, stop_lat,
                stop_lon).
              </p>
            </button>
          </div>

          <div className="p-6 rounded-xl bg-[#0A1128] border-2 border-dashed border-[#1A2A5A] hover:border-[#10B981] transition-colors text-center space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-[#10B981] mx-auto" />
            <div className="text-xs text-[#CBD5E1]">
              <label className="text-[#10B981] hover:underline font-bold cursor-pointer">
                <span>Clique para selecionar o arquivo (stops.txt ou CSV INEP)</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleExposicaoFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[11px] text-[#94A3B8] block">
              {expFileName ? `Arquivo: ${expFileName}` : 'Formatos aceitos: stops.txt ou CSV'}
            </span>
          </div>

          {expParsedHeaders.length > 0 && (
            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <h4 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  Mapeamento de Colunas de Exposição
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Nome da Escola / Parada</label>
                  <select
                    value={expMapping.nomeCol || ''}
                    onChange={(e) => setExpMapping({ ...expMapping, nomeCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione)</option>
                    {expParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Identificador Externo (ID)</label>
                  <select
                    value={expMapping.identificadorCol || ''}
                    onChange={(e) =>
                      setExpMapping({ ...expMapping, identificadorCol: e.target.value })
                    }
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Opcional: stop_id, inep_id)</option>
                    {expParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Latitude</label>
                  <select
                    value={expMapping.latCol || ''}
                    onChange={(e) => setExpMapping({ ...expMapping, latCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione)</option>
                    {expParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1">Longitude</label>
                  <select
                    value={expMapping.lngCol || ''}
                    onChange={(e) => setExpMapping({ ...expMapping, lngCol: e.target.value })}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-[#F8FAFC]"
                  >
                    <option value="">(Selecione)</option>
                    {expParsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1A2A5A] flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteExposicaoImport}
                  disabled={expImporting}
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-lg shadow-[#10B981]/20 flex items-center gap-2"
                >
                  {expImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ancorando em H3...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Salvar Camada de Exposição</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-ABA 5: TABELA DE SINISTROS & GEOCODIFICAÇÃO MANUAL    */}
      {/* ========================================================= */}
      {subTab === 'tabela_sinistros' && (
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Base Registrada de Sinistros ({filteredSinistros.length})
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Controle de procedência, auditoria de importação e saneamento de registros pendentes
                de coordenadas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar via, bairro, tipo ou célula H3..."
                  value={searchSinistros}
                  onChange={(e) => setSearchSinistros(e.target.value)}
                  className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg pl-8 pr-3 py-1.5 w-64 focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-mono text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]/50">
                <tr>
                  <th className="py-3 px-3">Via / Rodovia</th>
                  <th className="py-3 px-3">Fonte / Procedência</th>
                  <th className="py-3 px-3">Severidade</th>
                  <th className="py-3 px-3">Vítimas</th>
                  <th className="py-3 px-3">Status Coordenadas</th>
                  <th className="py-3 px-3">Célula H3</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]/50">
                {filteredSinistros.map((s) => (
                  <tr key={s.id} className="hover:bg-[#1A2A5A]/30">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#F8FAFC] block">
                        {s.logradouro_rodovia || 'Endereço não informado'}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {s.bairro || 'Curitiba'} • {s.data_ocorrencia || s.created?.slice(0, 10)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-mono text-[#CBD5E1] block">
                        {s.fonte_nome}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        Arquivo: {s.arquivo_origem || 'importacao_direta.csv'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          s.severidade === 'com_vitimas_fatais'
                            ? 'bg-[#EF4444]/20 text-[#EF4444]'
                            : s.severidade === 'com_vitimas_feridas'
                              ? 'bg-[#F97316]/20 text-[#F97316]'
                              : 'bg-[#FBBF24]/20 text-[#FBBF24]'
                        }`}
                      >
                        {s.severidade === 'com_vitimas_fatais'
                          ? 'ÓBITO'
                          : s.severidade === 'com_vitimas_feridas'
                            ? 'FERIDOS'
                            : 'SEM VÍTIMA'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#F8FAFC]">
                        {s.vitimas_fatais || 0} fatais / {s.vitimas_feridas || 0} feridos
                      </span>
                      <span className="block text-[10px] text-[#94A3B8] capitalize">
                        {s.tipo_vitima_predominante || 'Geral'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {s.status_geocoding === 'coordenada_valida' ? (
                        <span className="text-[10px] text-[#10B981] font-mono flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Coordenadas OK
                        </span>
                      ) : s.status_geocoding === 'manual_corrigido' ? (
                        <span className="text-[10px] text-[#38BDF8] font-mono flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Corrigido Manual
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#F59E0B] font-mono font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Pendente Geocoding
                          </span>
                          {editingGeocodingId === s.id ? (
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="text"
                                placeholder="Lat"
                                value={editLat}
                                onChange={(e) => setEditLat(e.target.value)}
                                className="w-16 bg-[#0A1128] border border-[#1A2A5A] rounded px-1.5 py-0.5 text-[10px]"
                              />
                              <input
                                type="text"
                                placeholder="Lng"
                                value={editLng}
                                onChange={(e) => setEditLng(e.target.value)}
                                className="w-16 bg-[#0A1128] border border-[#1A2A5A] rounded px-1.5 py-0.5 text-[10px]"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveManualGeocoding(s.id)}
                                disabled={isSavingGeocoding}
                                className="px-2 py-0.5 rounded bg-[#10B981] text-white text-[10px] font-bold"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingGeocodingId(null)}
                                className="px-1.5 py-0.5 text-[10px] text-[#94A3B8]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGeocodingId(s.id)
                                setEditLat(s.latitude ? String(s.latitude) : '-25.4372')
                                setEditLng(s.longitude ? String(s.longitude) : '-49.2731')
                              }}
                              className="text-[10px] text-[#3B82F6] hover:underline font-semibold block"
                            >
                              + Informar Lat/Lng Manual
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#60A5FA]">
                      {s.h3_index || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSinistroItem(s.id)}
                        className="text-[11px] text-[#EF4444] hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-ABA 6: TABELA DE EXPOSIÇÃO (POLOS E PARADAS)          */}
      {/* ========================================================= */}
      {subTab === 'tabela_exposicao' && (
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Polos de Exposição Cadastrados ({exposicoes.length})
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Escolas do Censo INEP e paradas do transporte coletivo GTFS
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-mono text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]/50">
                <tr>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Nome do Polo</th>
                  <th className="py-3 px-3">Endereço / Bairro</th>
                  <th className="py-3 px-3">Célula H3 Res 9</th>
                  <th className="py-3 px-3">Raio de Influência</th>
                  <th className="py-3 px-3">Fonte</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]/50">
                {exposicoes.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#1A2A5A]/30">
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          exp.tipo_camada === 'escola_inep'
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : 'bg-[#3B82F6]/20 text-[#3B82F6]'
                        }`}
                      >
                        {exp.tipo_camada === 'escola_inep' ? 'ESCOLA INEP' : 'PONTO GTFS'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                      {exp.nome}
                      {exp.identificador_externo && (
                        <span className="block text-[10px] text-[#94A3B8] font-mono">
                          ID: {exp.identificador_externo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#CBD5E1]">
                      {exp.endereco || '-'} • {exp.bairro || 'Curitiba'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#60A5FA]">{exp.h3_index || '-'}</td>
                    <td className="py-3 px-3 font-mono">{exp.raio_influencia_metros || 100}m</td>
                    <td className="py-3 px-3 text-[#94A3B8] text-[11px]">{exp.fonte_nome}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteExposicaoItem(exp.id)}
                        className="text-[11px] text-[#EF4444] hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
