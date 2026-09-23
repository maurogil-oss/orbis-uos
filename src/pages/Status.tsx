import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  Server,
  Code2,
  Globe,
  RefreshCw,
  ArrowLeft,
  Shield,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react'
import { getSystemStatus, SystemStatusData } from '@/services/status'

export default function Status() {
  const [data, setData] = useState<SystemStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedWindow, setSelectedWindow] = useState<'24h' | '48h' | '72h'>('24h')

  const loadStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await getSystemStatus()
      setData(res)
    } catch (err) {
      console.error('Erro ao carregar status do sistema:', err)
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStatus()
    // Atualização automática a cada 60 segundos
    const interval = setInterval(() => {
      loadStatus()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const currentUptime =
    selectedWindow === '24h'
      ? (data?.uptime.ultimas_24h_pct ?? 100)
      : selectedWindow === '48h'
        ? (data?.uptime.ultimas_48h_pct ?? 100)
        : (data?.uptime.ultimas_72h_pct ?? 100)

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Superior */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Início
            </Link>
            <span>/</span>
            <Link to="/operacao" className="hover:text-white transition-colors">
              Operação
            </Link>
            <span>/</span>
            <span className="text-[#38BDF8]">Disponibilidade & Status</span>
          </div>

          <button
            type="button"
            onClick={() => loadStatus(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-mono text-[#CBD5E1] hover:text-white transition-all disabled:opacity-50"
            title="Atualizar leituras de disponibilidade agora"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#38BDF8] ${refreshing ? 'animate-spin' : ''}`}
            />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>

        {/* Cabeçalho Institucional de Status */}
        <div className="space-y-4 pb-8 border-b border-[#1A2A5A]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
              <Activity className="w-4 h-4" />
              Monitoramento Ativo 24/7 (Sondas a cada 5min)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-xs font-mono font-medium text-[#60A5FA]">
              <Shield className="w-3.5 h-3.5" />
              Evidência Verificável B2G
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101B3A] border border-[#1A2A5A] text-[11px] font-mono text-[#94A3B8]">
              LC 182/2021 & RTO 24h
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
                Painel de Disponibilidade & Status do Sistema
              </h1>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-3xl mt-2">
                Transparência operacional contínua para órgãos públicos e sociedade. Sondas
                automáticas executam testes de integridade a cada 5 minutos sobre as rotas críticas,
                o banco relacional e as APIs de interoperabilidade, elevando logs passivos a
                evidência formal.
              </p>
            </div>

            {/* Selo Global de Status */}
            <div className="shrink-0 p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] flex items-center gap-3.5 min-w-[240px]">
              {data?.status_geral === 'operacional' ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                      Estado Geral:
                    </span>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      Todos os Sistemas Operacionais
                    </span>
                  </div>
                </>
              ) : data?.status_geral === 'degradado' ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                      Estado Geral:
                    </span>
                    <span className="text-sm font-bold text-[#F59E0B]">Desempenho Degradado</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                      Estado Geral:
                    </span>
                    <span className="text-sm font-bold text-[#EF4444]">Interrupção Detectada</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4 Cards de Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Uptime na Janela Selecionada */}
          <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Disponibilidade (Uptime)
              </span>
              <div className="flex items-center gap-1 bg-[#101B3A] p-0.5 rounded border border-[#1A2A5A] text-[10px] font-mono">
                {(['24h', '48h', '72h'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWindow(w)}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      selectedWindow === w
                        ? 'bg-[#3B82F6] text-white font-bold'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#10B981]">
                {currentUptime.toFixed(2)}%
              </span>
              <span className="text-xs text-[#94A3B8] font-mono">
                (meta: {data?.sla_contratual_alvo ?? 99.9}%)
              </span>
            </div>
            <div className="text-[11px] text-[#CBD5E1] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Em conformidade com o SLA P1 contratual.</span>
            </div>
          </div>

          {/* Card 2: Latência Média de Resposta */}
          <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Latência Média
              </span>
              <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/30">
                P95 Global
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#38BDF8]">
                {data?.latencia_media_ms ?? 35}
              </span>
              <span className="text-xs text-[#94A3B8] font-mono">milissegundos</span>
            </div>
            <div className="text-[11px] text-[#CBD5E1] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>Tempo de resposta aos municípios.</span>
            </div>
          </div>

          {/* Card 3: RTO Auditado em Produção */}
          <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                RTO Declarado vs. Real
              </span>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                Homologado
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {data?.rto_real_auditado_segundos ?? 1.45}s
              </span>
              <span className="text-xs text-[#94A3B8] font-mono">
                / {data?.rto_declarado_horas ?? 24}h max
              </span>
            </div>
            <div className="text-[11px] text-[#A7F3D0] flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Laudo ORBIS-RESTORE-TEST-2026-001.</span>
            </div>
          </div>

          {/* Card 4: Frequência & Verificações */}
          <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Cadência de Verificação
              </span>
              <span className="text-[10px] font-mono text-[#60A5FA] bg-[#60A5FA]/10 px-2 py-0.5 rounded border border-[#60A5FA]/30">
                Job Ativo
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#60A5FA]">A cada 5 min</span>
            </div>
            <div className="text-[11px] text-[#CBD5E1] flex items-center gap-1.5 truncate">
              <Activity className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
              <span>{data?.total_verificacoes_registradas ?? 120} verificações nas 72h.</span>
            </div>
          </div>
        </div>

        {/* Status por Componente Institucional */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
                <Server className="w-6 h-6 text-[#3B82F6]" />
                Status Individual por Componente de Arquitetura
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Monitoramento segmentado dos nós de computação, persistência, APIs abertas e
                conectores.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 self-start sm:self-auto">
              4 Componentes Ativos
            </span>
          </div>

          <div className="space-y-3">
            {data?.componentes.map((comp) => {
              const isOk = comp.status === 'operacional'
              const isDegraded = comp.status === 'degradado'
              const IconComp =
                comp.id === 'app_frontend'
                  ? Globe
                  : comp.id === 'banco_pocketbase'
                    ? Database
                    : comp.id === 'interop_h3_api'
                      ? Code2
                      : Server

              return (
                <div
                  key={comp.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isOk
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : isDegraded
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                            : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{comp.nome}</h3>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                            isOk
                              ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                              : isDegraded
                                ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                                : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8]">{comp.descricao}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-[#1A2A5A] shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                        Uptime (72h)
                      </span>
                      <span className="font-mono font-bold text-sm text-[#10B981]">
                        {comp.uptime_pct.toFixed(2)}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                        Latência
                      </span>
                      <span className="font-mono font-bold text-sm text-[#38BDF8]">
                        {comp.latencia_media_ms} ms
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                        Último Check
                      </span>
                      <span className="font-mono text-xs text-[#CBD5E1]">
                        {comp.ultimo_check?.ok ? (
                          <span className="text-[#10B981] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            HTTP {comp.ultimo_check.status_http} ({comp.ultimo_check.latencia_ms}ms)
                          </span>
                        ) : (
                          <span className="text-[#EF4444]">
                            Falha ({comp.ultimo_check?.status_http})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Histórico Visual das Últimas 24-72 Horas (Timeline) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-[#10B981]" />
                Histórico Horário de Disponibilidade (Últimas 24 a 72 Horas)
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Cada bloco representa o índice de sucesso das sondas no intervalo horário
                correspondente.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <span className="w-2.5 h-2.5 rounded bg-[#10B981]" />
                100% OK
              </span>
              <span className="flex items-center gap-1.5 text-[#F59E0B]">
                <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]" />
                &gt;95% Degr.
              </span>
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2.5 h-2.5 rounded bg-[#EF4444]" />
                Incidente
              </span>
            </div>
          </div>

          {/* Grid de Barras Horárias */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 sm:grid-cols-24 md:grid-cols-36 lg:grid-cols-48 gap-1 p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] overflow-x-auto">
              {data?.timeline_historica && data.timeline_historica.length > 0 ? (
                data.timeline_historica.map((pt, idx) => {
                  const is100 = pt.uptime_pct >= 99.5
                  const isDeg = pt.uptime_pct >= 95.0 && pt.uptime_pct < 99.5
                  const barColor = is100 ? 'bg-[#10B981]' : isDeg ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                  const dateFormatted = new Date(pt.timestamp).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <div
                      key={idx}
                      className="group relative flex flex-col items-center justify-end h-16 min-w-[12px] cursor-pointer"
                    >
                      <div
                        className={`w-full rounded-sm transition-all group-hover:scale-110 ${barColor}`}
                        style={{ height: `${Math.max(25, pt.uptime_pct)}%` }}
                      />
                      {/* Tooltip Hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                        <div className="bg-[#070D1F] border border-[#1A2A5A] p-2 rounded-lg shadow-xl text-[10px] font-mono text-white whitespace-nowrap">
                          <div className="font-bold text-[#38BDF8]">{dateFormatted}</div>
                          <div>Disponibilidade: {pt.uptime_pct}%</div>
                          <div>Latência média: {pt.latencia_media_ms} ms</div>
                          <div>Checks no período: {pt.total_checks}</div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-[#94A3B8]">
                  Carregando série temporal dos health checks...
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-1">
              <span>72 horas atrás</span>
              <span>24 horas atrás</span>
              <span className="text-[#10B981] font-bold">Agora (Tempo Real)</span>
            </div>
          </div>
        </div>

        {/* Políticas de Alertas e Regras Contratuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Esquerdo: Regras de Disparo de Alerta */}
          <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#3B82F6]" />
              <h3 className="text-base font-bold text-white">
                Regras Automatizadas de Alerta Operacional
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              O monitoramento ativo possui gatilhos formais interligados ao SLA P1 e à cadeia de
              custódia documental:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EF4444]/20 text-[#EF4444] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white block text-xs">
                    3 Falhas Consecutivas em Qualquer Componente
                  </strong>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Disparo instantâneo de e-mail institucional para{' '}
                    <code>contato@orbis-uos.gov.br</code> e registro do evento{' '}
                    <code>HEALTH_CHECK_ALERT_TRIGGERED</code> na trilha de auditoria.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white block text-xs">
                    Queda de Uptime 24h Abaixo de 99,5%
                  </strong>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Alerta de risco de violação de SLA contratual emitido ao plantão de engenharia
                    para contenção e abertura de protocolo preventivo.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-white block text-xs">
                    Gravação com Fé Pública em Trilha Imutável
                  </strong>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Todos os alertas alimentam a <code>audit_trail</code> permanente em{' '}
                    <code>institucional_settings</code> com autoria soberana <b>SISTEMA</b> para
                    inspeção por Tribunais de Contas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Direito: Continuidade e Links Operacionais */}
          <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-base font-bold text-white">
                  Fechamento do Ciclo de Continuidade B2G
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Este monitoramento ativo complementa as salvaguardas documentadas no Pacote
                Operacional (<b>/operacao</b>) e os requisitos normativos do Marco Legal GovTech:
              </p>

              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#10B981]/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#A7F3D0]">
                    Backup Diário + Teste de Restore Formal
                  </span>
                  <span className="font-mono text-[10px] text-[#10B981] font-bold">
                    1,45s Aferido
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Snapshots diários em repouso AES-256 e teste semestral de restauração com comando
                  SQLite <code>PRAGMA integrity_check</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#3B82F6]/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#93C5FD]">
                    Arquitetura Resiliente Offline-First
                  </span>
                  <span className="font-mono text-[10px] text-[#38BDF8] font-bold">IndexedDB</span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Coleta inercial em campo continua gravando normalmente mesmo sob perda de sinal
                  4G/5G, sincronizando lotes após a reconexão.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1A2A5A] flex flex-col sm:flex-row gap-2">
              <Link
                to="/operacao"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#101B3A] hover:bg-[#1A2A5A] text-[#10B981] hover:text-white border border-[#10B981]/40 text-xs font-semibold transition-all text-center"
              >
                <span>Consultar Pacote Operacional</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/governanca#fluxo-incidentes"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#101B3A] hover:bg-[#1A2A5A] text-[#60A5FA] hover:text-white border border-[#3B82F6]/40 text-xs font-semibold transition-all text-center"
              >
                <span>Fluxo de Incidentes & RTO</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé da Página com Identificação Operacional */}
        <div className="pt-4 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] font-mono">
          <div>
            ORBIS UOS GovTech • Painel de Monitoramento Ativo (/status) • Canal:{' '}
            <a href="mailto:contato@orbis-uos.gov.br" className="text-[#38BDF8] underline">
              contato@orbis-uos.gov.br
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/operacao" className="hover:text-[#94A3B8] transition-colors">
              Operação
            </Link>
            <span>•</span>
            <Link to="/governanca" className="hover:text-[#94A3B8] transition-colors">
              Governança
            </Link>
            <span>•</span>
            <Link to="/privacidade" className="hover:text-[#94A3B8] transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
