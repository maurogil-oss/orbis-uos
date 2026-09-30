import React, { useState, useEffect } from 'react'
import {
  Code,
  Play,
  Copy,
  Check,
  Shield,
  Layers,
  ArrowRight,
  Database,
  Terminal,
  ExternalLink,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'

interface SandboxQueryOption {
  id: string
  name: string
  method: 'GET' | 'POST'
  endpoint: string
  params: Record<string, string>
  description: string
  kAnonimatoFoco: string
}

export default function Sandbox() {
  const [selectedQueryId, setSelectedQueryId] = useState<string>('h3-cells')
  const [filterModo, setFilterModo] = useState<string>('')
  const [limitParam, setLimitParam] = useState<string>('12')
  const [loading, setLoading] = useState<boolean>(false)
  const [responseJson, setResponseJson] = useState<any>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null)
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false)
  const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false)

  const queryOptions: SandboxQueryOption[] = [
    {
      id: 'h3-cells',
      name: 'GeoJSON de Células Hexagonais H3 com k-Anonimato',
      method: 'GET',
      endpoint: '/backend/v1/sandbox/h3-cells',
      params: { modo: filterModo, limit: limitParam },
      description:
        'RFC 7946 Polygon por célula H3 (Res 9 veicular e Res 10 modos ativos). Demonstra o cumprimento estrito do k-anonimato (k ≥ 3): células com < 3 sessões sintéticas omitem as notas (score: null) e marcam status "nao_auditado".',
      kAnonimatoFoco:
        'Células sintéticas com k < 3 retornam imv_score: null e status: nao_auditado',
    },
    {
      id: 'imm-segments',
      name: 'Segmentos Viários Sintéticos e Notas IMV / IMM',
      method: 'GET',
      endpoint: '/backend/v1/sandbox/imm-segments',
      params: {},
      description:
        'LineString GeoJSON de segmentos de 100 metros com os 3 pilares metodológicos: Pilar A (IRI e Aceleração Z), Pilar B (Passagens de Confiança F ≥ 3) e Pilar C (Dispersão).',
      kAnonimatoFoco: 'Segmentos agregados sem expor motoristas, placas ou trajetos individuais',
    },
    {
      id: 'prioridade-zero',
      name: 'Matriz Sintética de Prioridade Zero (Asfalto × Escolas)',
      method: 'GET',
      endpoint: '/backend/v1/sandbox/prioridade-zero',
      params: {},
      description:
        'Algoritmo de priorização de intervenção viária cruzando severidade inercial com áreas de proteção escolar e histórico sintético de sinistralidade.',
      kAnonimatoFoco: 'Totalmente anonimizado e desvinculado de identificadores civis',
    },
    {
      id: 'leituras-agregadas',
      name: 'Leituras Inerciais Agregadas (Motor ORBIS DSP)',
      method: 'GET',
      endpoint: '/backend/v1/sandbox/leituras-agregadas',
      params: {},
      description:
        'Amostras sintéticas de aceleração vertical Z processadas pelo Motor ORBIS DSP embarcado, geradas por sensores de demonstração.',
      kAnonimatoFoco: 'Agregação temporal em janelas mínimas de 15 minutos',
    },
  ]

  const activeOption = queryOptions.find((o) => o.id === selectedQueryId) || queryOptions[0]

  // Montar URL da requisição
  const buildRequestUrl = () => {
    const params = new URLSearchParams()
    if (activeOption.id === 'h3-cells') {
      if (filterModo) params.set('modo', filterModo)
      if (limitParam) params.set('limit', limitParam)
    }
    const queryString = params.toString()
    return queryString ? `${activeOption.endpoint}?${queryString}` : activeOption.endpoint
  }

  // Executar consulta interativa
  const handleExecuteQuery = async () => {
    setLoading(true)
    setStatusCode(null)
    const startTime = performance.now()
    try {
      const url = buildRequestUrl()
      const data = await pb.send(url, { method: activeOption.method })
      const duration = Math.round(performance.now() - startTime)
      setResponseTimeMs(duration)
      setStatusCode(200)
      setResponseJson(data)
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime)
      setResponseTimeMs(duration)
      setStatusCode(err?.status || 500)
      setResponseJson({
        error: true,
        message: err?.message || 'Falha ao executar consulta no sandbox.',
        status: err?.status,
        data: err?.data,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleExecuteQuery()
  }, [selectedQueryId, filterModo, limitParam])

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(buildRequestUrl())
    setCopiedEndpoint(true)
    setTimeout(() => setCopiedEndpoint(false), 2000)
  }

  const handleCopyResponse = () => {
    if (!responseJson) return
    navigator.clipboard.writeText(JSON.stringify(responseJson, null, 2))
    setCopiedResponse(true)
    setTimeout(() => setCopiedResponse(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-14 sm:pt-16">
      {/* Hero Header Institucional */}
      <section className="relative pt-10 sm:pt-12 pb-14 border-b border-[#1A2A5A] bg-gradient-to-b from-[#0A1128] via-[#070D1F] to-[#070D1F]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA]">
              <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
              Ambiente de Testes Público & Homologação
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[11px] font-mono font-bold text-[#10B981]">
              <Shield className="w-3 h-3" />
              100% Dados Sintéticos (Demo)
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight max-w-3xl">
            ORBIS UOS Sandbox Playground
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] max-w-3xl mt-3 leading-relaxed">
            Ambiente público sem credencial para desenvolvedores e integradores do setor público
            explorarem as respostas GeoJSON (RFC 7946), a grade hexagonal H3 e o princípio
            inegociável do k-anonimato (k ≥ 3 sessões por hexágono).
          </p>

          {/* Cartões Informativos Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#1A2A5A]/80 text-xs">
            <div className="p-4 rounded-xl bg-[#101B3A]/70 border border-[#1A2A5A] space-y-1">
              <span className="text-[#60A5FA] font-bold block flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Dados Sintéticos e Isolados
              </span>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Nenhum dado real de telemetria pública ou frota municipal é tocado neste ambiente.
                As vias e leituras são 100% de demonstração.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A]/70 border border-[#1A2A5A] space-y-1">
              <span className="text-[#10B981] font-bold block flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                k-Anonimato Estrito (Art. 12 LGPD)
              </span>
              <p className="text-[#94A3B8] text-[10px] leading-relaxed">
                Mesmo no sandbox, células com menos de 3 sessões sintetizadas retornam notas nulas (
                <code>imv_score: null</code>) e status <code>nao_auditado</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A]/70 border border-[#1A2A5A] space-y-1">
              <span className="text-[#F59E0B] font-bold block flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Transição para Produção
              </span>
              <p className="text-[#94A3B8] text-[10px] leading-relaxed">
                Após homologar no Sandbox, solicite sua chave oficial de integrador em{' '}
                <Link to="/interoperabilidade" className="text-[#38BDF8] underline">
                  /interoperabilidade
                </Link>{' '}
                para integração com o CICC/CIC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Principal: Playground Interativo */}
      <section className="py-10 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna 1: Controles e Parâmetros (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#3B82F6]" />
                  <span>1. Escolha a Consulta de Exemplo</span>
                </h3>
                <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                  Público / Sem Login
                </span>
              </div>

              {/* Seletor de Consultas */}
              <div className="space-y-2">
                {queryOptions.map((opt) => {
                  const isSelected = opt.id === selectedQueryId
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedQueryId(opt.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#101B3A] border-[#3B82F6] shadow-md shadow-[#3B82F6]/20'
                          : 'bg-[#050914]/60 border-[#1A2A5A] hover:border-[#1A2A5A]/80 text-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`font-semibold text-xs ${
                            isSelected ? 'text-[#F8FAFC]' : 'text-[#CBD5E1]'
                          }`}
                        >
                          {opt.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[#3B82F6]/15 text-[#60A5FA]">
                          {opt.method}
                        </span>
                      </div>
                      <code className="text-[10px] font-mono text-[#64748B] block truncate">
                        {opt.endpoint}
                      </code>
                    </button>
                  )
                })}
              </div>

              {/* Descrição e Foco de k-Anonimato */}
              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs space-y-2">
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                  {activeOption.description}
                </p>
                <div className="pt-1 border-t border-[#1A2A5A]/80 flex items-start gap-1.5 text-[11px] text-[#10B981]">
                  <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <b>Blindagem k-anonimato:</b> {activeOption.kAnonimatoFoco}
                  </span>
                </div>
              </div>

              {/* Parâmetros Específicos se for H3-cells */}
              {activeOption.id === 'h3-cells' && (
                <div className="p-4 rounded-xl bg-[#050914] border border-[#1A2A5A] space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Parâmetros de Filtro Interativo:</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">
                        Modo de Transporte
                      </label>
                      <select
                        value={filterModo}
                        onChange={(e) => setFilterModo(e.target.value)}
                        className="w-full bg-[#101B3A] border border-[#1A2A5A] text-xs text-white rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#3B82F6]"
                      >
                        <option value="">Todos os modos</option>
                        <option value="veiculo_frota">Veículo / Frota (Res 9)</option>
                        <option value="ciclista">Ciclista (Res 10)</option>
                        <option value="pedestre">Pedestre (Res 10)</option>
                        <option value="motociclista">Motociclista (Res 10)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">
                        Limite de Hexágonos
                      </label>
                      <select
                        value={limitParam}
                        onChange={(e) => setLimitParam(e.target.value)}
                        className="w-full bg-[#101B3A] border border-[#1A2A5A] text-xs text-white rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#3B82F6]"
                      >
                        <option value="6">6 células</option>
                        <option value="12">12 células</option>
                        <option value="25">25 células</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Disparo */}
              <button
                type="button"
                onClick={handleExecuteQuery}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-lg shadow-[#3B82F6]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>Executar Consulta no Playground</span>
              </button>
            </div>

            {/* Como Integrar via cURL */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Exemplo cURL (Execute no seu terminal):</span>
              </h4>

              <div className="p-3 rounded-xl bg-[#050914] border border-[#1A2A5A] font-mono text-[11px] text-[#93C5FD] break-all leading-relaxed">
                <code>
                  curl -X GET &quot;{window.location.origin}
                  {buildRequestUrl()}&quot;
                </code>
              </div>

              <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                Nenhuma chave é necessária no sandbox. Em produção, adicione o cabeçalho{' '}
                <code>-H &quot;Authorization: Bearer orbis_live_...&quot;</code>.
              </p>
            </div>
          </div>

          {/* Coluna 2: Inspetor de Resposta Formatada (7 colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl bg-[#0A1128] border border-[#1A2A5A] overflow-hidden shadow-2xl">
              {/* Header do Inspetor */}
              <div className="p-4 border-b border-[#1A2A5A] bg-[#0A1128] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/40">
                    {activeOption.method}
                  </span>
                  <span className="text-xs font-mono text-white truncate max-w-xs sm:max-w-md">
                    {buildRequestUrl()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {statusCode !== null && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        statusCode === 200
                          ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                          : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                      }`}
                    >
                      HTTP {statusCode}
                    </span>
                  )}
                  {responseTimeMs !== null && (
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      {responseTimeMs} ms
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyResponse}
                    className="p-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors border border-[#1A2A5A] text-xs flex items-center gap-1"
                    title="Copiar JSON da Resposta"
                  >
                    {copiedResponse ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="text-[10px] text-[#10B981]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copiar JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Destaque Visual do k-Anonimato em Ação (se H3-cells) */}
              {activeOption.id === 'h3-cells' && responseJson?.features && (
                <div className="p-3 bg-[#0F172A] border-b border-[#1A2A5A] text-[11px] text-[#94A3B8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>
                      Auditadas (k ≥ 3): <b>{responseJson.metadata?.cells_auditadas || 0}</b>
                    </span>
                    <span className="text-[#1A2A5A]">|</span>
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    <span>
                      Não Auditadas (k &lt; 3, score null):{' '}
                      <b>{responseJson.metadata?.cells_nao_auditadas || 0}</b>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                    LGPD Blindada
                  </span>
                </div>
              )}

              {/* Corpo da Resposta em JSON Formatado */}
              <div className="relative">
                <pre className="p-4 sm:p-5 bg-[#050914] text-xs font-mono text-[#CBD5E1] overflow-x-auto max-h-[580px] leading-relaxed selection:bg-[#3B82F6]/30">
                  {loading ? (
                    <div className="flex items-center justify-center py-20 text-[#94A3B8] gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#3B82F6]" />
                      <span>Processando requisição no backend do Sandbox...</span>
                    </div>
                  ) : responseJson ? (
                    <code>{JSON.stringify(responseJson, null, 2)}</code>
                  ) : (
                    <span className="text-[#64748B]">
                      Clique em &quot;Executar Consulta&quot; para carregar a resposta.
                    </span>
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Direcionamento para Produção e Credenciamento */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#1E3A8A] border border-[#3B82F6]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pronto para homologação do primeiro órgão integrador
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Precisa conectar o Datalake ou CICC da sua cidade com dados reais?
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Consulte a documentação completa dos endpoints oficiais em <b>/interoperabilidade</b>{' '}
              e conheça o fluxo de 4 etapas: Solicitação → Emissão da Chave → Homologação →
              Produção.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/interoperabilidade"
              className="px-5 py-3 rounded-xl font-bold text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/30 flex items-center gap-2 transition-all"
            >
              <span>Ver Fluxo de Credenciamento</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
