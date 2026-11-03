import React, { useState, useEffect, useRef } from 'react'
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  MapPin,
  Building2,
  CheckCircle2,
  TrendingUp,
  Filter,
  Eye,
  ArrowRight,
  Flame,
} from 'lucide-react'
import {
  calculateKineticStressIndex,
  getIecNivel,
  IEC_NIVEIS,
  IecNivelId,
  IecSegmentAggregation,
  DEMO_IEC_SEGMENTS,
} from '@/lib/diagnostics/iecEngine'
import { IecSimulator } from '@/components/IecSimulator'

interface KineticStressPanelProps {
  onOpenSimulatorInDemo?: () => void
  cityName?: string
}

export function KineticStressPanel({
  onOpenSimulatorInDemo,
  cityName = 'Curitiba / PR',
}: KineticStressPanelProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    DEMO_IEC_SEGMENTS[0].segmentoId,
  )
  const [nivelFilter, setNivelFilter] = useState<'all' | IecNivelId>('all')
  const [showSimulatorWidget, setShowSimulatorWidget] = useState<boolean>(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const segmentsLayerRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)

  const filteredSegments = DEMO_IEC_SEGMENTS.filter((seg) => {
    if (nivelFilter === 'all') return true
    return seg.iecNivel.id === nivelFilter
  })

  const selectedSegment =
    DEMO_IEC_SEGMENTS.find((s) => s.segmentoId === selectedSegmentId) || DEMO_IEC_SEGMENTS[0]

  // Contadores agregados k-anônimos
  const totalVeiculosAmostrados = DEMO_IEC_SEGMENTS.reduce(
    (acc, curr) => acc + curr.totalVeiculosAmostrados,
    0,
  )
  const contagemGeralPorNivel = DEMO_IEC_SEGMENTS.reduce(
    (acc, curr) => ({
      verde: acc.verde + curr.distribuicaoContagemPorNivel.verde,
      ciano: acc.ciano + curr.distribuicaoContagemPorNivel.ciano,
      ambar: acc.ambar + curr.distribuicaoContagemPorNivel.ambar,
      vermelho: acc.vermelho + curr.distribuicaoContagemPorNivel.vermelho,
    }),
    { verde: 0, ciano: 0, ambar: 0, vermelho: 0 },
  )

  // 1. Inicializar mapa Leaflet escuro para o mapa de calor de estresse cinemático
  useEffect(() => {
    let linkTag: HTMLLinkElement | null = null
    let scriptTag: HTMLScriptElement | null = null

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return

      const L = window.L
      const map = L.map(mapContainerRef.current, {
        center: [-25.4372, -49.2731],
        zoom: 13,
        zoomControl: false,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO & OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      heatLayerRef.current = L.layerGroup().addTo(map)
      segmentsLayerRef.current = L.layerGroup().addTo(map)

      mapInstanceRef.current = map
    }

    if (!window.L) {
      if (!document.getElementById('leaflet-css')) {
        linkTag = document.createElement('link')
        linkTag.id = 'leaflet-css'
        linkTag.rel = 'stylesheet'
        linkTag.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(linkTag)
      }

      if (!document.getElementById('leaflet-js')) {
        scriptTag = document.createElement('script')
        scriptTag.id = 'leaflet-js'
        scriptTag.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        scriptTag.async = true
        scriptTag.onload = () => {
          initMap()
        }
        document.head.appendChild(scriptTag)
      }
    } else {
      initMap()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // 2. Renderizar círculos de calor e marcadores de segmentos IEC
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = window.L
    if (!map || !L) return

    if (segmentsLayerRef.current) segmentsLayerRef.current.clearLayers()
    if (heatLayerRef.current) heatLayerRef.current.clearLayers()

    filteredSegments.forEach((seg) => {
      const isSelected = seg.segmentoId === selectedSegmentId
      const color = seg.iecNivel.corHex

      // Círculo de calor graduado baseado no IEC
      const heatRadius =
        seg.iecNivel.id === 'vermelho'
          ? 400
          : seg.iecNivel.id === 'ambar'
            ? 280
            : seg.iecNivel.id === 'ciano'
              ? 180
              : 120

      const heatOpacity =
        seg.iecNivel.id === 'vermelho' ? 0.35 : seg.iecNivel.id === 'ambar' ? 0.22 : 0.12

      const heatCircle = L.circle(seg.coordenadasCentro, {
        radius: heatRadius,
        fillColor: color,
        fillOpacity: heatOpacity,
        color: color,
        weight: 1,
        opacity: 0.5,
      })
      heatCircle.addTo(heatLayerRef.current)

      // Marcador interativo do segmento
      const markerHtml = `
        <div style="
          width: ${isSelected ? '32px' : '24px'};
          height: ${isSelected ? '32px' : '24px'};
          background: #0A1128;
          border: 2.5px solid ${color};
          border-radius: 50%;
          box-shadow: 0 0 ${isSelected ? '18px' : '10px'} ${color}90;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <span style="font-size: ${isSelected ? '11px' : '9px'}; font-weight: 900; color: ${color}; font-family: monospace;">
            ${seg.iecScore}
          </span>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-iec-marker',
        html: markerHtml,
        iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
        iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
      })

      const marker = L.marker(seg.coordenadasCentro, { icon: customIcon })

      const popupHtml = `
        <div style="font-family: -apple-system, sans-serif; font-size: 11px; color: #0F172A; min-width: 220px;">
          <div style="font-weight: 800; font-size: 12px; color: #0A1128; margin-bottom: 2px;">
            ${seg.via}
          </div>
          <div style="color: #64748B; font-size: 10px; margin-bottom: 6px;">
            ${seg.bairro} • ${seg.extensaoMetros}m
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}50; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
              IEC ${seg.iecScore}/100 • ${seg.iecNivel.nome}
            </span>
            <span style="font-family: monospace; font-size: 9.5px; color: #475569;">
              k = ${seg.totalVeiculosAmostrados} veículos
            </span>
          </div>
          <div style="font-size: 10px; color: #334155; line-height: 1.35; margin-bottom: 4px;">
            <b>Causa Provável:</b> ${seg.causaProvavelTrecho}
          </div>
          <div style="font-size: 9.5px; color: #059669; font-weight: 600;">
            Ação Municipal: ${seg.acaoRecomendadaMunicipal}
          </div>
        </div>
      `

      marker.bindPopup(popupHtml)
      marker.on('click', () => {
        setSelectedSegmentId(seg.segmentoId)
      })

      marker.addTo(segmentsLayerRef.current)
    })
  }, [filteredSegments, selectedSegmentId])

  // Centralizar mapa ao trocar de segmento
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSegment) return
    mapInstanceRef.current.setView(selectedSegment.coordenadasCentro, 14, { animate: true })
  }, [selectedSegmentId, selectedSegment])

  return (
    <div className="space-y-6 text-[#F8FAFC]">
      {/* Top Banner de Contexto e Tagline */}
      <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/15 px-2.5 py-0.5 rounded border border-[#38BDF8]/30 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>IEC • Índice de Estresse Cinemático</span>
              </span>
              <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LGPD: dado físico, não pessoal (k-anônimo)</span>
              </span>
              <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                hipótese a validar em campo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Comportamento da Condução & Risco Cinemático
            </h2>
            <p className="text-xs text-[#94A3B8] max-w-3xl leading-relaxed">
              Tagline oficial: <b>"IMV mede a via; IEC mede o comportamento sobre a via."</b> O IEC
              mede a tensão mecânica e inercial da condução (frequência e intensidade de frenagens
              bruscas, acelerações súbitas e oscilação de cruzeiro) sem biometria, sem neurodados e
              sem gravação de imagem ou voz.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setShowSimulatorWidget(!showSimulatorWidget)}
              className="px-3.5 py-2 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#38BDF8] text-xs font-bold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{showSimulatorWidget ? 'Ocultar Simulador' : 'Abrir Simulador IEC'}</span>
            </button>
          </div>
        </div>

        {/* Linha Discreta Institucional sobre Rodovias Federais e Estaduais */}
        <div className="p-3 rounded-xl bg-[#0A1128]/70 border border-[#1A2A5A] text-xs text-[#94A3B8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span>
              <b>Escopo Operacional:</b> Exclusivamente órgãos municipais de trânsito e obras.{' '}
              <span className="text-[#CBD5E1]">
                Rodovias federais e estaduais (ex.: PRF, BR-101): em estudo de conformidade.
              </span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#F59E0B] shrink-0">
            Demonstração/modelado — validação em campo pendente
          </span>
        </div>
      </div>

      {/* Widget Opcional do Simulador IEC Embutido */}
      {showSimulatorWidget && (
        <div className="animate-in fade-in duration-200">
          <IecSimulator showTitle={true} initialScenario="Normal" />
        </div>
      )}

      {/* Grid Principal: Mapa de Calor à Esquerda + Detalhamento Agregado k-Anônimo à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Mapa de Calor do IEC */}
        <div className="lg:col-span-7 bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#EF4444]" />
                <span>Mapa de Calor do IEC por Segmento</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {cityName}: Segmentos com k-anonimato garantido (≥ 3 veículos)
              </p>
            </div>

            {/* Filtros da Escala de 4 Níveis */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setNivelFilter('all')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  nivelFilter === 'all'
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                    : 'bg-[#0A1128] text-[#94A3B8] border border-[#1A2A5A]'
                }`}
              >
                Todos ({DEMO_IEC_SEGMENTS.length})
              </button>
              {(['vermelho', 'ambar', 'ciano', 'verde'] as IecNivelId[]).map((nid) => {
                const cfg = IEC_NIVEIS[nid]
                const count = DEMO_IEC_SEGMENTS.filter((s) => s.iecNivel.id === nid).length
                return (
                  <button
                    key={nid}
                    type="button"
                    onClick={() => setNivelFilter(nid)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      nivelFilter === nid
                        ? cfg.corTailwindBadge
                        : 'bg-[#0A1128] text-[#94A3B8] border border-[#1A2A5A]'
                    }`}
                  >
                    {cfg.nome.split(' ')[1] || cfg.nome} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Container do Mapa */}
          <div className="h-[460px] w-full rounded-xl overflow-hidden border border-[#1A2A5A] relative">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Legenda Flutuante da Escala Oficial */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-[#0A1128]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#1A2A5A] text-[10px] space-y-1">
              <span className="font-bold text-white block mb-0.5">Escala Oficial IEC:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[#10B981]">0–24: Condução Fluida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                <span className="text-[#06B6D4]">25–49: Condução Estável</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[#F59E0B]">50–74: Tensão Elevada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[#EF4444]">75–100: Estresse Crítico</span>
              </div>
            </div>
          </div>

          {/* Rodapé do Mapa */}
          <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>Clique nos marcadores para inspecionar o nexo causal do segmento.</span>
            <span className="font-mono text-[10px] text-[#10B981]">
              Base georreferenciada municipal
            </span>
          </div>
        </div>

        {/* Coluna Direita: Painel Analítico do Segmento Selecionado */}
        <div className="lg:col-span-5 bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
            <div>
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                Segmento em Foco
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-[260px]">
                {selectedSegment.via}
              </h3>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${selectedSegment.iecNivel.corTailwindBadge}`}
            >
              IEC {selectedSegment.iecScore} • {selectedSegment.iecNivel.nome}
            </span>
          </div>

          {/* Cards Rápidos de Metadados k-Anônimos */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[10px] text-[#94A3B8] block">Veículos Amostrados</span>
              <span className="text-base font-bold font-mono text-[#38BDF8]">
                {selectedSegment.totalVeiculosAmostrados}
              </span>
              <span className="text-[9px] text-[#10B981] block">k ≥ 3 atendido</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[10px] text-[#94A3B8] block">Extensão do Trecho</span>
              <span className="text-base font-bold font-mono text-[#F8FAFC]">
                {selectedSegment.extensaoMetros}m
              </span>
              <span className="text-[9px] text-[#94A3B8] block">{selectedSegment.bairro}</span>
            </div>
          </div>

          {/* Distribuição de Contagem por Nível (k-Anônimo do Segmento) */}
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#CBD5E1]">
                Contagem Agregada de Veículos por Nível:
              </span>
              <span className="text-[10px] font-mono text-[#10B981]">
                Total: {selectedSegment.totalVeiculosAmostrados}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="p-2 rounded bg-[#101B3A] border border-[#10B981]/30">
                <span className="text-[9px] text-[#10B981] block">Fluida</span>
                <span className="font-mono font-bold text-white">
                  {selectedSegment.distribuicaoContagemPorNivel.verde}
                </span>
              </div>
              <div className="p-2 rounded bg-[#101B3A] border border-[#06B6D4]/30">
                <span className="text-[9px] text-[#06B6D4] block">Estável</span>
                <span className="font-mono font-bold text-white">
                  {selectedSegment.distribuicaoContagemPorNivel.ciano}
                </span>
              </div>
              <div className="p-2 rounded bg-[#101B3A] border border-[#F59E0B]/30">
                <span className="text-[9px] text-[#F59E0B] block">Tensão</span>
                <span className="font-mono font-bold text-white">
                  {selectedSegment.distribuicaoContagemPorNivel.ambar}
                </span>
              </div>
              <div className="p-2 rounded bg-[#101B3A] border border-[#EF4444]/30">
                <span className="text-[9px] text-[#EF4444] block">Crítico</span>
                <span className="font-mono font-bold text-white">
                  {selectedSegment.distribuicaoContagemPorNivel.vermelho}
                </span>
              </div>
            </div>
          </div>

          {/* Leitura-Chave: Causa Provável do Trecho */}
          <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#F59E0B]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Leitura de Causa Provável da Via (Nexo Causal):</span>
            </div>
            <p className="text-[#CBD5E1] leading-relaxed">{selectedSegment.causaProvavelTrecho}</p>
            <p className="text-[11px] text-[#94A3B8] italic">
              * A concentração de múltiplos veículos sob tensão no mesmo segmento indica defeito de
              engenharia, obstáculo ou sinalização insuficiente. O IEC aponta o defeito da via,
              fechando o círculo com o IMV.
            </p>
          </div>

          {/* Ação Recomendada ao Órgão Municipal */}
          <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 space-y-1.5 text-xs text-[#CBD5E1]">
            <div className="flex items-center gap-1.5 font-bold text-[#10B981]">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Ação Recomendada ao Órgão Municipal:</span>
            </div>
            <p className="text-white leading-relaxed">{selectedSegment.acaoRecomendadaMunicipal}</p>
            <span className="text-[10px] text-[#94A3B8] block">
              Atribuição municipal (Setran/Obras/Engenharia de Tráfego)
            </span>
          </div>

          {/* Seletor Rápido de outros Segmentos */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#94A3B8] block">
              Alternar Segmentos Monitorados:
            </span>
            <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
              {DEMO_IEC_SEGMENTS.map((s) => (
                <button
                  key={s.segmentoId}
                  type="button"
                  onClick={() => setSelectedSegmentId(s.segmentoId)}
                  className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between border transition-all ${
                    s.segmentoId === selectedSegmentId
                      ? 'bg-[#0A1128] border-[#38BDF8] text-white font-bold'
                      : 'bg-[#0A1128]/50 border-[#1A2A5A] text-[#94A3B8] hover:border-[#38BDF8]/40'
                  }`}
                >
                  <span className="truncate max-w-[220px]">{s.via}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${s.iecNivel.corTailwindBadge}`}
                  >
                    IEC {s.iecScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
