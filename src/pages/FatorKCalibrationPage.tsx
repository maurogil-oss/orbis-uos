import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  SlidersHorizontal,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Layers,
  History,
  TrendingUp,
  Activity,
  Car,
  Bus,
  Shield,
  Truck,
  Ambulance,
  BookOpen,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  VeiculoTipoCalibracao,
  VEICULO_TIPOS_CONFIG,
  CalibracaoResultadoPorTipo,
  getFatorKCalibrations,
  listFieldSessions,
  applyFatorKCalibration,
  restoreAllFatorKToBaseline,
  FatorKCalibrationRecord,
  FieldSessionRecord,
} from '@/services/fatorKCalibration'
import { listRoadSegments, RoadSegmentRecord, SegmentReadingRecord } from '@/services/roadSegments'
import { computeFatorKCalibration } from '@/lib/diagnostics/fatorKEngine'
import { RealCollectorModal } from '@/components/RealCollectorModal'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import { Footprints, Bike } from 'lucide-react'

export default function FatorKCalibrationPage() {
  const { user } = useAuth()
  const codigoIbge = '4106902' // Curitiba como polo de referência

  // Dados carregados
  const [loading, setLoading] = useState<boolean>(true)
  const [roadSegments, setRoadSegments] = useState<RoadSegmentRecord[]>([])
  const [readings, setReadings] = useState<SegmentReadingRecord[]>([])
  const [sessions, setSessions] = useState<FieldSessionRecord[]>([])
  const [savedCalibrations, setSavedCalibrations] = useState<FatorKCalibrationRecord[]>([])

  // UI state
  const [selectedTipo, setSelectedTipo] = useState<VeiculoTipoCalibracao>('onibus')
  const [isApplying, setIsApplying] = useState<string | null>(null)
  const [isRestoringAll, setIsRestoringAll] = useState<boolean>(false)
  const [showRealCollectorModal, setShowRealCollectorModal] = useState<boolean>(false)
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false)

  // Carregar dados de banco
  const loadData = async () => {
    setLoading(true)
    try {
      const [segmentsData, sessionsData, calibData] = await Promise.all([
        listRoadSegments(codigoIbge),
        listFieldSessions(codigoIbge),
        getFatorKCalibrations(codigoIbge),
      ])

      // Buscar leituras de janela agregadas (Edge FFT)
      let readingsData: SegmentReadingRecord[] = []
      try {
        readingsData = await pb.collection('segment_readings').getFullList<SegmentReadingRecord>({
          filter: `codigo_ibge = '${codigoIbge}'`,
          sort: '-created',
        })
      } catch (err) {
        console.warn('Erro ao carregar segment_readings:', err)
      }

      setRoadSegments(segmentsData)
      setSessions(sessionsData)
      setSavedCalibrations(calibData)
      setReadings(readingsData)
    } catch (err) {
      console.error('Erro ao carregar dados de calibração:', err)
      toast({
        title: 'Falha ao carregar dados de calibração',
        description: 'Verifique a conexão com o servidor.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Processar calibração em tempo real a partir dos dados do banco
  const resultadosCalibrados = useMemo(() => {
    return computeFatorKCalibration({
      roadSegments,
      readings,
      sessions,
      savedCalibrations,
    })
  }, [roadSegments, readings, sessions, savedCalibrations])

  const totalSessoes = sessions.length
  const totalSegmentosAuditados = roadSegments.length
  const totalSegmentosValidados = roadSegments.filter(
    (s) => s.fator_confianca_valido || s.passagens_veiculos_distintos >= 3,
  ).length
  const totalKmGeral = Number(
    sessions.reduce((acc, s) => acc + (s.distancia_metros || 0) / 1000, 0).toFixed(1),
  )

  const tipoSelecionadoData = resultadosCalibrados[selectedTipo]

  // Handler para aplicar calibração de um tipo específico
  const handleApplySingle = async (tipo: VeiculoTipoCalibracao) => {
    const item = resultadosCalibrados[tipo]
    if (!item) return

    setIsApplying(tipo)
    try {
      await applyFatorKCalibration({
        codigoIbge,
        veiculoTipo: tipo,
        valorAplicar: item.calibradoSugerido,
        status: 'calibrado_ativo',
        usuarioNome: user?.name || 'Engenheiro de Tráfego / Cockpit',
        motivo: `Aplicação da calibração real sugerida (${item.calibradoSugerido.toFixed(2)}) via dados de campo.`,
        resultadoCalibrado: item,
      })

      await loadData()
      toast({
        title: `Calibração aplicada para ${item.config.label}!`,
        description: `O Motor IMM agora utiliza K = ${item.calibradoSugerido.toFixed(2)} (diferença de ${item.diferencaPercentual > 0 ? '+' : ''}${item.diferencaPercentual}% do padrão).`,
      })
    } catch (err: any) {
      console.error('Erro ao aplicar calibração:', err)
      toast({
        title: 'Erro ao aplicar calibração',
        description: err?.message || 'Falha na gravação do registro.',
        variant: 'destructive',
      })
    } finally {
      setIsApplying(null)
    }
  }

  // Handler para aplicar calibração em lote de todos os tipos com dados suficientes
  const handleApplyAllCalibrated = async () => {
    setIsApplying('all')
    try {
      const tipos: VeiculoTipoCalibracao[] = [
        'onibus',
        'viatura',
        'caminhao',
        'ambulancia',
        'outros',
      ]
      let count = 0
      for (const t of tipos) {
        const item = resultadosCalibrados[t]
        await applyFatorKCalibration({
          codigoIbge,
          veiculoTipo: t,
          valorAplicar: item.calibradoSugerido,
          status: item.calibradoSugerido !== item.baselineK ? 'calibrado_ativo' : 'baseline',
          usuarioNome: user?.name || 'Servidor Institucional',
          motivo: 'Aplicação global de calibração empírica por tipo de veículo.',
          resultadoCalibrado: item,
        })
        count++
      }

      await loadData()
      toast({
        title: 'Calibração Global Aplicada!',
        description: `${count} perfis de veículos foram atualizados na configuração do Motor IMM.`,
      })
    } catch (err: any) {
      console.error('Erro na aplicação global:', err)
      toast({
        title: 'Erro na aplicação global',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsApplying(null)
    }
  }

  // Handler para restaurar baseline de fábrica
  const handleRestoreBaselines = async () => {
    if (
      !confirm(
        'Deseja realmente restaurar todos os tipos de veículos para os valores baseline teóricos (valores padrão fixos)? O Motor IMM voltará a usar as constantes pré-definidas.',
      )
    ) {
      return
    }

    setIsRestoringAll(true)
    try {
      await restoreAllFatorKToBaseline(codigoIbge, user?.name || 'Administrador Cockpit')
      await loadData()
      toast({
        title: 'Padrões Restaurados!',
        description: 'Todos os tipos de veículos voltaram aos valores teóricos baseline.',
      })
    } catch (err: any) {
      console.error('Erro ao restaurar baseline:', err)
      toast({
        title: 'Falha ao restaurar padrões',
        description: err?.message || 'Verifique sua conexão.',
        variant: 'destructive',
      })
    } finally {
      setIsRestoringAll(false)
    }
  }

  // Obter ícone correspondente
  const renderIcon = (tipo: VeiculoTipoCalibracao, className: string = 'w-5 h-5') => {
    switch (tipo) {
      case 'onibus':
        return <Bus className={className} />
      case 'viatura':
        return <Shield className={className} />
      case 'caminhao':
        return <Truck className={className} />
      case 'ambulancia':
        return <Ambulance className={className} />
      case 'pedestre':
        return <Footprints className={className} />
      case 'ciclista':
        return <Bike className={className} />
      case 'motociclista':
        return <Car className={className} />
      case 'outros':
      default:
        return <Car className={className} />
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
              <Link
                to="/cockpit"
                className="hover:text-white transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Cockpit
              </Link>
              <span>/</span>
              <span className="text-[#3B82F6]">Calibração Real do Fator K</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <SlidersHorizontal className="w-7 h-7 text-[#3B82F6]" />
                Calibração Real do Fator K por Veículo & Modo Ativo
              </h1>
              <span className="text-[11px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-semibold">
                Onda 3 • IMV + IMA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-3xl leading-relaxed">
              Ajuste empírico da resposta inercial e espectral da frota pública e dos modos de
              mobilidade ativa (pedestre, ciclista, motocicleta) sobre trechos auditados com{' '}
              <b className="text-[#CBD5E1]">Fator de Confiança F ≥ 3 passagens</b>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              type="button"
              onClick={() => setShowRealCollectorModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-md shadow-[#10B981]/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Nova Coleta de Campo</span>
            </button>

            <button
              type="button"
              onClick={handleRestoreBaselines}
              disabled={isRestoringAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#EF4444]/60 flex items-center gap-1.5 transition-colors"
              title="Restaurar todos os tipos para o valor padrão de fábrica"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 text-[#EF4444] ${isRestoringAll ? 'animate-spin' : ''}`}
              />
              <span>Restaurar Padrões</span>
            </button>

            <button
              type="button"
              onClick={handleApplyAllCalibrated}
              disabled={isApplying === 'all'}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isApplying === 'all' ? 'Gravando...' : 'Aplicar Tudo ao IMM'}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats of Field Calibration Data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Sessões de Campo Real</span>
              <Smartphone className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#F8FAFC]">{totalSessoes}</div>
            <span className="text-[10px] text-[#94A3B8]">Capturadas via DeviceMotion + FFT</span>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Distância Coletada</span>
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#10B981]">
              {totalKmGeral} <span className="text-sm font-semibold text-[#CBD5E1]">km</span>
            </div>
            <span className="text-[10px] text-[#94A3B8]">Na malha viária municipal</span>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Segmentos com F ≥ 3</span>
              <ShieldCheck className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#60A5FA]">
              {totalSegmentosValidados}{' '}
              <span className="text-xs text-[#94A3B8]">/ {totalSegmentosAuditados}</span>
            </div>
            <span className="text-[10px] text-[#94A3B8]">Escudo anti-falso-positivo atendido</span>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Janelas FFT de 100m</span>
              <Layers className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#F59E0B]">{readings.length}</div>
            <span className="text-[10px] text-[#94A3B8]">Leituras inerciais registradas</span>
          </div>
        </div>

        {/* Transparency Banner: Metodologia Declarada */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#0A1128] to-[#101B3A] border border-[#3B82F6]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F8FAFC] text-sm">
                  Metodologia Declarada e Auditável do Fator K (v1.1)
                </span>
                <span className="text-[9px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30 font-bold">
                  Transparência de Cálculo
                </span>
              </div>
              <p className="text-[#CBD5E1] text-xs leading-relaxed max-w-3xl">
                O Fator K calibra a resposta de cada chassi para que a estimativa de IRI reflita o
                asfalto real, e não a rigidez da suspensão. A matemática compara a aceleração RMS e
                picos dos tipos sobre <b>segmentos comuns compartilhados</b> com validação tripla
                (Fator de Confiança F ≥ 3). Na ausência de sobreposição direta, aplica{' '}
                <b>fallback transparente</b> baseado na resposta inercial absoluta do lote.
              </p>
            </div>
          </div>

          <Link
            to="/metodologia"
            className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#60A5FA] bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>Ver Metodologia Pública</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>

        {/* Category Tabs: Frotas Veiculares (IMV) & Modos de Mobilidade Ativa (IMA - Onda 3) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            <span>Frota Veicular Institucional • Sub-índice IMV</span>
            <span className="font-mono text-[10px] text-[#60A5FA]">Banda Geral 1–20 Hz</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(
              ['onibus', 'viatura', 'caminhao', 'ambulancia', 'outros'] as VeiculoTipoCalibracao[]
            ).map((tipoKey) => {
              const data = resultadosCalibrados[tipoKey]
              if (!data) return null
              const isSelected = selectedTipo === tipoKey
              const isApplied = data.statusAplicacao === 'calibrado_ativo'
              return (
                <button
                  key={tipoKey}
                  type="button"
                  onClick={() => setSelectedTipo(tipoKey)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-[#101B3A] border-[#3B82F6] shadow-lg shadow-[#3B82F6]/15 ring-1 ring-[#3B82F6]'
                      : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#3B82F6]/50 hover:bg-[#101B3A]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-[#101B3A] border border-[#1A2A5A] text-[#94A3B8] group-hover:text-white'
                      }`}
                    >
                      {renderIcon(tipoKey, 'w-4 h-4')}
                    </div>

                    {isApplied ? (
                      <span className="text-[9px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/40 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-[#94A3B8] bg-[#101B3A] px-1.5 py-0.5 rounded border border-[#1A2A5A]">
                        Baseline
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs sm:text-sm text-[#F8FAFC] truncate">
                    {data.config.label.split('/')[0]}
                  </div>

                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#1A2A5A]/60 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">Atual:</span>
                      <span className="font-bold text-[#F8FAFC]">{data.aplicadoK.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#94A3B8] block">Sugerido:</span>
                      <span
                        className={`font-bold ${
                          data.calibradoSugerido !== data.baselineK
                            ? 'text-[#10B981]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        {data.calibradoSugerido.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-[#94A3B8] flex items-center justify-between">
                    <span>{data.amostras.sessoes} sessões</span>
                    <span
                      className={
                        data.confiabilidade.status === 'alta'
                          ? 'text-[#10B981] font-semibold'
                          : data.confiabilidade.status === 'moderada'
                            ? 'text-[#F59E0B]'
                            : 'text-[#64748B]'
                      }
                    >
                      {data.confiabilidade.status.toUpperCase()}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#10B981] pt-2">
            <span>Onda 3 • Mobilidade Ativa & Acessibilidade • Sub-índice IMA</span>
            <span className="font-mono text-[10px] text-[#A7F3D0]">
              Bandas Espectrais Dedicadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['pedestre', 'ciclista', 'motociclista'] as VeiculoTipoCalibracao[]).map(
              (tipoKey) => {
                const data = resultadosCalibrados[tipoKey]
                if (!data) return null
                const isSelected = selectedTipo === tipoKey
                const isApplied = data.statusAplicacao === 'calibrado_ativo'
                return (
                  <button
                    key={tipoKey}
                    type="button"
                    onClick={() => setSelectedTipo(tipoKey)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#101B3A] border-[#10B981] shadow-lg shadow-[#10B981]/15 ring-1 ring-[#10B981]'
                        : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#10B981]/50 hover:bg-[#101B3A]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#10B981] text-white'
                            : 'bg-[#101B3A] border border-[#1A2A5A] text-[#10B981] group-hover:text-white'
                        }`}
                      >
                        {renderIcon(tipoKey, 'w-4 h-4')}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-[#CBD5E1] bg-[#101B3A] px-1.5 py-0.5 rounded border border-[#1A2A5A]">
                          {data.config.bandaFftHz.label}
                        </span>
                        {isApplied ? (
                          <span className="text-[9px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/40 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-[#94A3B8] bg-[#101B3A] px-1.5 py-0.5 rounded border border-[#1A2A5A]">
                            Baseline
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-bold text-xs sm:text-sm text-[#F8FAFC]">
                      {data.config.label}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                      {data.config.sublabel}
                    </div>

                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#1A2A5A]/60 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] block">Atual:</span>
                        <span className="font-bold text-[#F8FAFC]">
                          {data.aplicadoK.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#94A3B8] block">Sugerido:</span>
                        <span
                          className={`font-bold ${
                            data.calibradoSugerido !== data.baselineK
                              ? 'text-[#10B981]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          {data.calibradoSugerido.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-[#94A3B8] flex items-center justify-between">
                      <span>{data.amostras.sessoes} sessões de campo</span>
                      <span
                        className={
                          data.confiabilidade.status === 'alta'
                            ? 'text-[#10B981] font-semibold'
                            : data.confiabilidade.status === 'moderada'
                              ? 'text-[#F59E0B]'
                              : 'text-[#64748B]'
                        }
                      >
                        {data.confiabilidade.status.toUpperCase()}
                      </span>
                    </div>
                  </button>
                )
              },
            )}
          </div>
        </div>

        {/* Selected Category Deep Dive Panel */}
        {tipoSelecionadoData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Calibration Metrics, Baseline vs Calibrated & Method */}
            <div className="lg:col-span-8 space-y-5">
              {/* Main Calibration Card */}
              <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A2A5A]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6]">
                      {renderIcon(tipoSelecionadoData.tipo, 'w-6 h-6')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">
                          {tipoSelecionadoData.config.label}
                        </h2>
                        {tipoSelecionadoData.statusAplicacao === 'calibrado_ativo' && (
                          <span className="text-[10px] font-mono bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-bold">
                            CALIBRAÇÃO APLICADA AO IMM
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {tipoSelecionadoData.config.sublabel} • Suspensão:{' '}
                        <b className="text-[#CBD5E1]">{tipoSelecionadoData.config.suspensaoTipo}</b>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplySingle(tipoSelecionadoData.tipo)}
                      disabled={isApplying === tipoSelecionadoData.tipo}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-md shadow-[#10B981]/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isApplying === tipoSelecionadoData.tipo
                          ? 'Gravando...'
                          : 'Aplicar ao Motor IMM'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Comparative Big Numbers: Baseline vs Sugerido vs Aplicado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Baseline Fixo */}
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold block">
                      1. Baseline Teórico Fixo
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-[#94A3B8]">
                      {tipoSelecionadoData.baselineK.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-[#64748B] block">
                      Constante de projeto de fábrica
                    </span>
                  </div>

                  {/* Calibrado Sugerido */}
                  <div className="p-4 rounded-xl bg-[#0A1128] border-2 border-[#3B82F6] text-center space-y-1 relative shadow-lg shadow-[#3B82F6]/10">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full">
                      Derivado do Campo Real
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#60A5FA] font-bold block pt-1">
                      2. Calibrado Sugerido
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-[#38BDF8]">
                      {tipoSelecionadoData.calibradoSugerido.toFixed(2)}
                    </div>
                    <span className="text-[11px] font-mono font-semibold block">
                      {tipoSelecionadoData.diferencaPercentual === 0 ? (
                        <span className="text-[#94A3B8]">Igual ao baseline (0.0%)</span>
                      ) : tipoSelecionadoData.diferencaPercentual > 0 ? (
                        <span className="text-[#F59E0B]">
                          +{tipoSelecionadoData.diferencaPercentual}% vs baseline
                        </span>
                      ) : (
                        <span className="text-[#10B981]">
                          {tipoSelecionadoData.diferencaPercentual}% vs baseline
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Valor Efetivamente Aplicado ao IMM */}
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#10B981]/50 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] font-bold block">
                      3. Valor em Uso no IMM
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-[#10B981]">
                      {tipoSelecionadoData.aplicadoK.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-[#CBD5E1] block">
                      {tipoSelecionadoData.statusAplicacao === 'calibrado_ativo'
                        ? 'Calibração empírica ativa'
                        : 'Utilizando baseline padrão'}
                    </span>
                  </div>
                </div>

                {/* Método de Cálculo Declarado */}
                <div className="p-4 rounded-xl bg-[#070D1F] border border-[#1A2A5A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                      Método Matemático & Banda FFT do Modo:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30">
                        Banda: {tipoSelecionadoData.config.bandaFftHz.label}
                      </span>
                      <span className="text-[10px] font-mono bg-[#3B82F6]/15 text-[#60A5FA] px-2 py-0.5 rounded border border-[#3B82F6]/30">
                        {tipoSelecionadoData.metodologia.metodoUtilizado ===
                        'razao_segmentos_compartilhados'
                          ? 'Razão de Segmentos Compartilhados'
                          : tipoSelecionadoData.metodologia.metodoUtilizado === 'media_absoluta_rms'
                            ? 'Média Absoluta RMS (Fallback)'
                            : 'Baseline Teórico'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {tipoSelecionadoData.metodologia.descricaoMetodo}
                  </p>
                  {tipoSelecionadoData.config.trataViesDesvio && (
                    <div className="text-[11px] text-[#FBBF24] bg-[#F59E0B]/10 p-2 rounded border border-[#F59E0B]/30">
                      <b>Tratamento Estatístico de Viés de Desvio:</b> Para pedestres e
                      motociclistas, o contorno de poças e buracos gera oscilações angulares
                      laterais que são somadas como anomalias indiretas na calibração, evitando
                      subavaliação do trecho.
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono text-[#94A3B8] border-t border-[#1A2A5A]/50">
                    <span>
                      RMS Médio Vertical:{' '}
                      <b className="text-[#F8FAFC]">{tipoSelecionadoData.metodologia.rmsMedio}g</b>
                    </span>
                    <span>•</span>
                    <span>
                      IRI Médio Estimado:{' '}
                      <b className="text-[#10B981]">
                        {tipoSelecionadoData.metodologia.iriEstimadoMedio} m/km
                      </b>
                    </span>
                    <span>•</span>
                    <span>
                      Segmentos Validados Cruzados:{' '}
                      <b className="text-[#38BDF8]">
                        {tipoSelecionadoData.metodologia.segmentosCompartilhadosCount}
                      </b>
                    </span>
                  </div>
                </div>
                {/* Status da Confiabilidade da Amostra */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3.5 text-xs ${
                    tipoSelecionadoData.confiabilidade.status === 'alta'
                      ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#A7F3D0]'
                      : tipoSelecionadoData.confiabilidade.status === 'moderada'
                        ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#FDE68A]'
                        : 'bg-[#101B3A] border-[#EF4444]/40 text-[#CBD5E1]'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {tipoSelecionadoData.confiabilidade.status === 'alta' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#F8FAFC]">
                        Status de Confiabilidade:{' '}
                        <span className="uppercase font-mono">
                          {tipoSelecionadoData.confiabilidade.status}
                        </span>
                      </span>
                      <span className="font-mono text-[11px] text-[#94A3B8]">
                        Progresso: {tipoSelecionadoData.confiabilidade.percentualProgresso}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      {tipoSelecionadoData.confiabilidade.motivo}
                    </p>

                    {/* Barra de progresso para a meta */}
                    <div className="w-full bg-[#0A1128] rounded-full h-2 overflow-hidden border border-[#1A2A5A] mt-2">
                      <div
                        className={`h-full transition-all duration-300 ${
                          tipoSelecionadoData.confiabilidade.status === 'alta'
                            ? 'bg-[#10B981]'
                            : tipoSelecionadoData.confiabilidade.status === 'moderada'
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#3B82F6]'
                        }`}
                        style={{
                          width: `${Math.max(5, tipoSelecionadoData.confiabilidade.percentualProgresso)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Empty State Honesto se não houver amostragem */}
                {tipoSelecionadoData.amostras.sessoes === 0 && (
                  <div className="p-5 rounded-xl bg-[#0A1128] border-2 border-dashed border-[#1A2A5A] text-center space-y-3">
                    <Smartphone className="w-8 h-8 text-[#3B82F6] mx-auto opacity-70" />
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-sm font-bold text-[#F8FAFC]">
                        Nenhuma sessão de campo com {tipoSelecionadoData.config.label}
                      </h3>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        Para calcular a calibração empírica real desta categoria, realize as
                        primeiras coletas de campo fixando o smartphone no suporte do painel deste
                        veículo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRealCollectorModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/25 transition-all"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>
                        Iniciar Primeira Coleta Real com {tipoSelecionadoData.config.label}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Amostra, Trilha de Auditoria & Impacto no IMM */}
            <div className="lg:col-span-4 space-y-5">
              {/* Amostra Disponível da Categoria */}
              <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Amostra de Campo Coletada
                  </span>
                  <span className="text-[10px] font-mono text-[#60A5FA]">
                    {tipoSelecionadoData.config.label.split('/')[0]}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between">
                    <span className="text-[#94A3B8]">Sessões de Campo:</span>
                    <span className="font-mono font-bold text-[#F8FAFC]">
                      {tipoSelecionadoData.amostras.sessoes} sessões
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between">
                    <span className="text-[#94A3B8]">Segmentos com F ≥ 3:</span>
                    <span className="font-mono font-bold text-[#10B981]">
                      {tipoSelecionadoData.amostras.segmentosValidados} trechos
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between">
                    <span className="text-[#94A3B8]">Janelas FFT Processadas:</span>
                    <span className="font-mono font-bold text-[#38BDF8]">
                      {tipoSelecionadoData.amostras.janelasTotal} janelas (100m)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between">
                    <span className="text-[#94A3B8]">Distância Acumulada:</span>
                    <span className="font-mono font-bold text-[#F59E0B]">
                      {tipoSelecionadoData.amostras.kmAcumulado} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Trilha de Auditoria Institucional */}
              <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#10B981]" />
                    Trilha de Auditoria & Responsável
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(true)}
                    className="text-[10px] text-[#3B82F6] hover:text-[#60A5FA] underline font-medium"
                  >
                    Histórico
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1">
                    <span className="text-[10px] text-[#94A3B8] block">
                      Última Aplicação Oficial:
                    </span>
                    <span className="font-bold text-[#F8FAFC] block">
                      {tipoSelecionadoData.auditoria?.usuario || 'Padrão Inicial de Sistema'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] block font-mono">
                      {tipoSelecionadoData.auditoria?.data
                        ? new Date(tipoSelecionadoData.auditoria.data).toLocaleString('pt-BR')
                        : 'Sem alterações registradas'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-[11px] text-[#CBD5E1] leading-relaxed">
                    <b>Validade perante Tribunais de Contas:</b> Todo ajuste manual ou empírico do
                    Fator K é carimbado com usuário, timestamp UTC e hash da sessão, impedindo
                    manipulação arbitrária de notas do IMM.
                  </div>
                </div>
              </div>

              {/* Impacto Direto no Motor IMM */}
              <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#3B82F6]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#60A5FA]">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Efeito Direto no Cálculo do IMM</span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Ao clicar em <b>"Aplicar ao Motor IMM"</b>, todas as fórmulas de cálculo do Pilar
                  A (IRI inercial) e da matriz de intervenção passam a ponderar a aceleração deste
                  veículo pelo novo fator K ({tipoSelecionadoData.calibradoSugerido.toFixed(2)}).
                </p>
                <div className="text-[10px] font-mono text-[#94A3B8] pt-1 border-t border-[#1A2A5A]">
                  Enquanto não aplicado, o valor calibrado permanece como sugestão visível sem
                  impactar o Modo Gabinete.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Auditoria Completa */}
        {showAuditModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Trilha de Auditoria • {tipoSelecionadoData?.config.label}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="text-[#94A3B8] hover:text-white text-xs px-2 py-1 rounded bg-[#0A1128]"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {tipoSelecionadoData?.auditoria?.historico &&
                tipoSelecionadoData.auditoria.historico.length > 0 ? (
                  tipoSelecionadoData.auditoria.historico.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F8FAFC]">{h.usuario}</span>
                        <span className="font-mono text-[10px] text-[#94A3B8]">
                          {new Date(h.data).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-[#94A3B8]">De: {h.valor_anterior.toFixed(2)}</span>
                        <span>→</span>
                        <span className="text-[#10B981] font-bold">
                          Para: {h.valor_novo.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1">{h.motivo}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-[#0A1128] text-center text-xs text-[#94A3B8]">
                    Nenhum registro prévio de alteração nesta categoria.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Coleta Real */}
        <RealCollectorModal
          isOpen={showRealCollectorModal}
          onClose={() => {
            setShowRealCollectorModal(false)
            loadData()
          }}
        />
      </div>
    </div>
  )
}
