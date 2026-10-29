import React, { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Clock,
  Gauge,
  TrendingUp,
  MapPin,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react'
import { NearMissEvent, NearMissReplayPoint } from '@/services/nearMisses'

interface NearMissReplayModalProps {
  event: NearMissEvent | null
  isOpen: boolean
  onClose: () => void
}

export function NearMissReplayModal({ event, isOpen, onClose }: NearMissReplayModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0)

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false)
      setCurrentFrameIdx(0)
      return
    }
    // Quando abre, começa no quadro 0
    setCurrentFrameIdx(0)
    setIsPlaying(true)
  }, [isOpen, event])

  useEffect(() => {
    if (!isPlaying || !event || !event.replayPoints.length) return

    const timer = setInterval(() => {
      setCurrentFrameIdx((prev) => {
        if (prev >= event.replayPoints.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 700)

    return () => clearInterval(timer)
  }, [isPlaying, event])

  if (!isOpen || !event) return null

  const points = event.replayPoints || []
  const currentPoint: NearMissReplayPoint = points[currentFrameIdx] || {
    offsetMs: 0,
    latitude: event.latitude,
    longitude: event.longitude,
    speedKmh: event.velocidadeFinalKmh,
    decelG: event.decelMaxG,
  }

  const severityColor =
    event.severidade === 'critica' ? '#EF4444' : event.severidade === 'alta' ? '#F97316' : '#FBBF24'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="replay-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-[#0A1128] border border-[#1A2A5A] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full animate-ping shrink-0"
              style={{ backgroundColor: severityColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2 py-0.5 rounded border border-[#3B82F6]/30 font-bold">
                  Motor ORBIS DSP • Replay Físico
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]">ID: {event.id}</span>
              </div>
              <h3 id="replay-modal-title" className="text-base font-bold text-[#F8FAFC] mt-0.5">
                {event.via}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de replay"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#101B3A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narração de Acessibilidade & Tendência */}
        <div
          className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1 text-xs text-[#CBD5E1]"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-[#F8FAFC] font-semibold">
            <TrendingUp className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>Tendência & Narração da Análise:</span>
          </div>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">{event.tendenciaDescricao}</p>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#94A3B8]">
            <span>
              Corredor: <b className="text-white">{event.corredor}</b>
            </span>
            <span>•</span>
            <span>
              Variação:{' '}
              <b className={event.tendenciaMensalPct > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                {event.tendenciaMensalPct > 0
                  ? `+${event.tendenciaMensalPct}%`
                  : `${event.tendenciaMensalPct}%`}
              </b>
            </span>
            <span>•</span>
            <span className="text-[#38BDF8]">k-anonimato H3 Res 9</span>
          </div>
        </div>

        {/* Visualizador de Telemetria Dinâmica (Quadro a Quadro) */}
        <div className="p-5 rounded-xl bg-[#070D1F] border border-[#1A2A5A] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[#94A3B8] uppercase">
              Quadro {currentFrameIdx + 1} de {points.length} • Offset{' '}
              <b className="text-white">
                {currentPoint.offsetMs > 0 ? `+${currentPoint.offsetMs}` : currentPoint.offsetMs} ms
              </b>
            </span>
            <span
              className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${severityColor}20`,
                color: severityColor,
                border: `1px solid ${severityColor}40`,
              }}
            >
              Severidade {event.severidade}
            </span>
          </div>

          {/* Cards de Métricas do Ponto Instantâneo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-center">
              <span className="text-[10px] text-[#94A3B8] block">Velocidade Instantânea</span>
              <span className="text-2xl font-black font-mono text-[#60A5FA]">
                {currentPoint.speedKmh} <span className="text-xs font-normal">km/h</span>
              </span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                Inicial: {event.velocidadeInicialKmh} → Final: {event.velocidadeFinalKmh}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-center">
              <span className="text-[10px] text-[#94A3B8] block">Desaceleração (G)</span>
              <span
                className="text-2xl font-black font-mono"
                style={{ color: currentPoint.decelG < -0.5 ? '#EF4444' : '#FBBF24' }}
              >
                {currentPoint.decelG.toFixed(2)} <span className="text-xs font-normal">g</span>
              </span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                Pico: {event.decelMaxG.toFixed(2)}g
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-center">
              <span className="text-[10px] text-[#94A3B8] block">Duração Frenagem</span>
              <span className="text-2xl font-black font-mono text-[#10B981]">
                {event.tempoDesaceleracaoSegundos} <span className="text-xs font-normal">s</span>
              </span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                Período: {event.periodoDia.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Barra de Progresso Temporal do Replay */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
              <span>Início da desaceleração</span>
              <span className="text-[#EF4444] font-bold">Ponto de Conflito</span>
              <span>Retomada / Parada</span>
            </div>
            <div className="w-full bg-[#1A2A5A] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3B82F6] via-[#EF4444] to-[#10B981] transition-all duration-300"
                style={{
                  width: `${((currentFrameIdx + 1) / points.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Trajetória Geográfica Instantânea */}
          <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-[11px] font-mono text-[#94A3B8] flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-white font-semibold">Coordenada Replay:</span>{' '}
              {currentPoint.latitude.toFixed(5)}, {currentPoint.longitude.toFixed(5)}
            </div>
            <div className="text-[#38BDF8]">
              H3: {event.h3Index} (Resolução {event.h3Resolution})
            </div>
          </div>
        </div>

        {/* Controles de Playback (44px touch targets) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1A2A5A]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pausar animação de replay' : 'Executar animação de replay'}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] flex items-center gap-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {currentFrameIdx >= points.length - 1
                      ? 'Replay Novamente'
                      : 'Reproduzir Replay'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false)
                setCurrentFrameIdx(0)
              }}
              aria-label="Reiniciar replay do início"
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>LGPD por desenho • Telemetria sem identificação de condutores</span>
          </div>
        </div>
      </div>
    </div>
  )
}
