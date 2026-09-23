import { useEffect, useRef, useState } from 'react'
import {
  Hexagon,
  Flame,
  AlertTriangle,
  Layers,
  GraduationCap,
  Bus,
  ShieldCheck,
  Info,
  Maximize2,
  Filter,
} from 'lucide-react'
import {
  H3SinistralidadeCell,
  H3MatrizZeroCell,
  SinistroImportadoRecord,
  CamadaExposicaoRecord,
} from '@/services/sinistralidadeExposicao'

interface SinistralidadeH3MapProps {
  sinistroCells: H3SinistralidadeCell[]
  matrizCells?: H3MatrizZeroCell[]
  rawSinistros?: SinistroImportadoRecord[]
  rawExposicoes?: CamadaExposicaoRecord[]
  mode?: 'sinistros' | 'matriz_zero'
  onSelectCell?: (cell: H3SinistralidadeCell | H3MatrizZeroCell | null) => void
  selectedH3Index?: string | null
  height?: string
}

export function SinistralidadeH3Map({
  sinistroCells,
  matrizCells = [],
  rawSinistros = [],
  rawExposicoes = [],
  mode = 'sinistros',
  onSelectCell,
  selectedH3Index,
  height = '520px',
}: SinistralidadeH3MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const layerGroupRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)

  const [activeMode, setActiveMode] = useState<'sinistros' | 'matriz_zero'>(mode)
  const [severityFilter, setSeverityFilter] = useState<'todos' | 'fatais' | 'feridos'>('todos')
  const [showMarkers, setShowMarkers] = useState<boolean>(true)
  const [selectedCell, setSelectedCell] = useState<any>(null)

  useEffect(() => {
    setActiveMode(mode)
  }, [mode])

  // Inicialização do Leaflet com Tile CDN OpenStreetMap CartoDB DarkMatter
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initMap = () => {
      const L = (window as any).L
      if (!L || mapInstanceRef.current) return

      // Centro padrão em Curitiba
      const map = L.map(mapContainerRef.current, {
        center: [-25.4372, -49.2731],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      layerGroupRef.current = L.layerGroup().addTo(map)
      markersLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    if (!(window as any).L) {
      let linkTag = document.getElementById('leaflet-css') as HTMLLinkElement
      if (!linkTag) {
        linkTag = document.createElement('link')
        linkTag.id = 'leaflet-css'
        linkTag.rel = 'stylesheet'
        linkTag.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(linkTag)
      }

      let scriptTag = document.getElementById('leaflet-js') as HTMLScriptElement
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.id = 'leaflet-js'
        scriptTag.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        scriptTag.async = true
        scriptTag.onload = () => {
          initMap()
        }
        document.head.appendChild(scriptTag)
      } else {
        scriptTag.addEventListener('load', initMap)
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

  // Renderização das células H3
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = (window as any).L
    if (!map || !L || !layerGroupRef.current || !markersLayerRef.current) return

    layerGroupRef.current.clearLayers()
    markersLayerRef.current.clearLayers()

    if (activeMode === 'sinistros') {
      // Filtrar células por severidade
      const filteredCells = sinistroCells.filter((c) => {
        if (severityFilter === 'fatais') return c.vitimas_fatais > 0
        if (severityFilter === 'feridos') return c.vitimas_feridas > 0
        return true
      })

      filteredCells.forEach((cell) => {
        const isSelected =
          selectedH3Index === cell.h3_index || selectedCell?.h3_index === cell.h3_index
        let fillColor = '#3B82F6'
        let strokeColor = '#2563EB'
        let fillOpacity = 0.45

        if (cell.vitimas_fatais > 0) {
          fillColor = '#EF4444'
          strokeColor = '#DC2626'
          fillOpacity = 0.65
        } else if (cell.vitimas_feridas > 0) {
          fillColor = '#F97316'
          strokeColor = '#EA580C'
          fillOpacity = 0.55
        } else {
          fillColor = '#FBBF24'
          strokeColor = '#D97706'
          fillOpacity = 0.4
        }

        const latLngs = cell.boundary.map((pt) => [pt.lat, pt.lng])
        const polygon = L.polygon(latLngs, {
          color: isSelected ? '#FFFFFF' : strokeColor,
          weight: isSelected ? 3 : 1.5,
          fillColor,
          fillOpacity: isSelected ? 0.8 : fillOpacity,
        })

        const popupContent = `
          <div style="font-family: Inter, sans-serif; font-size: 11px; min-width: 210px; color: #0F172A; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-family: monospace; color: #1E3A8A; font-size: 11px;">${cell.h3_index}</strong>
              <span style="font-size: 9px; font-weight: bold; background: ${cell.vitimas_fatais > 0 ? '#EF4444' : '#F97316'}; color: white; padding: 2px 6px; border-radius: 4px;">
                ${cell.vitimas_fatais > 0 ? 'ÓBITO REGISTRADO' : 'COM FERIDOS'}
              </span>
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #1E293B; margin-top: 4px;">
              ${cell.total_sinistros} sinistro(s) catalogado(s)
            </div>
            <div style="font-size: 10px; color: #475569; margin-top: 2px;">
              • Óbitos fatais: <b style="color: #EF4444;">${cell.vitimas_fatais}</b><br/>
              • Vítimas com ferimentos: <b style="color: #EA580C;">${cell.vitimas_feridas}</b><br/>
              • Pedestres: <b>${cell.pedestres_envolvidos}</b> | Ciclistas: <b>${cell.ciclistas_envolvidos}</b> | Motos: <b>${cell.motociclistas_envolvidos}</b>
            </div>
            ${
              cell.vias_afetadas.length > 0
                ? `<div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #E2E8F0; font-size: 9px; color: #64748B;">
                     Via: <b>${cell.vias_afetadas.slice(0, 2).join(', ')}</b>
                   </div>`
                : ''
            }
          </div>
        `
        polygon.bindPopup(popupContent)

        polygon.on('click', () => {
          setSelectedCell(cell)
          if (onSelectCell) onSelectCell(cell)
        })

        polygon.addTo(layerGroupRef.current)
      })

      // Marcadores pontuais de escolas e paradas de ônibus para contexto visual
      if (showMarkers) {
        rawExposicoes.forEach((exp) => {
          const isEscola = exp.tipo_camada === 'escola_inep'
          const iconHtml = isEscola
            ? `<div style="background: #10B981; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 11px;">🎓</div>`
            : `<div style="background: #3B82F6; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 10px;">🚌</div>`

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-h3-marker',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          })

          const marker = L.marker([exp.latitude, exp.longitude], { icon: customIcon })
          marker.bindPopup(`
            <div style="font-family: Inter, sans-serif; font-size: 11px; color: #0F172A;">
              <b style="color: ${isEscola ? '#059669' : '#2563EB'};">${isEscola ? 'Escola (INEP)' : 'Parada de Ônibus (GTFS)'}</b><br/>
              <b>${exp.nome}</b><br/>
              <span style="font-size: 10px; color: #64748B;">${exp.endereco || ''}</span>
            </div>
          `)
          marker.addTo(markersLayerRef.current)
        })
      }
    } else {
      // Modo: MATRIZ DE PRIORIDADE ZERO
      matrizCells.forEach((cell) => {
        const isSelected =
          selectedH3Index === cell.h3_index || selectedCell?.h3_index === cell.h3_index
        let fillColor = '#10B981'
        let strokeColor = '#059669'
        let fillOpacity = 0.45

        if (cell.criticidade_geral === 'prioridade_maxima') {
          fillColor = '#EF4444'
          strokeColor = '#DC2626'
          fillOpacity = 0.75
        } else if (cell.criticidade_geral === 'alta') {
          fillColor = '#F97316'
          strokeColor = '#EA580C'
          fillOpacity = 0.6
        } else if (cell.criticidade_geral === 'media') {
          fillColor = '#FBBF24'
          strokeColor = '#D97706'
          fillOpacity = 0.5
        } else {
          fillColor = '#3B82F6'
          strokeColor = '#2563EB'
          fillOpacity = 0.35
        }

        const latLngs = cell.boundary.map((pt) => [pt.lat, pt.lng])
        const polygon = L.polygon(latLngs, {
          color: isSelected ? '#FFFFFF' : strokeColor,
          weight: isSelected ? 3 : 1.5,
          fillColor,
          fillOpacity: isSelected ? 0.85 : fillOpacity,
        })

        const popupContent = `
          <div style="font-family: Inter, sans-serif; font-size: 11px; min-width: 240px; color: #0F172A; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-family: monospace; color: #1E3A8A; font-size: 11px;">${cell.h3_index}</strong>
              <span style="font-size: 9px; font-weight: bold; background: ${fillColor}; color: white; padding: 2px 6px; border-radius: 4px;">
                PRIORIDADE ${cell.score_prioridade_zero}/100
              </span>
            </div>
            <div style="font-size: 11px; font-weight: 800; color: #1E293B; margin-top: 4px;">
              ${cell.acao_sugerida}
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #475569; border-top: 1px solid #E2E8F0; padding-top: 4px;">
              • <b>Sinistros:</b> ${cell.fator_sinistralidade.total_sinistros} (${cell.fator_sinistralidade.fatais} mortos / ${cell.fator_sinistralidade.feridos} feridos)<br/>
              • <b>Exposição:</b> ${cell.fator_exposicao.escolas_count} escola(s) + ${cell.fator_exposicao.pontos_onibus_count} parada(s) de ônibus<br/>
              • <b>Pavimento (IMV):</b> ${cell.fator_pavimento.tem_dado ? `${cell.fator_pavimento.score_imv} pts` : '<span style="color: #94A3B8; font-style: italic;">Sem telemetria registrada</span>'}
            </div>
            <div style="margin-top: 4px; font-size: 9px; color: #64748B;">
              Procedência: <b>${cell.fator_sinistralidade.procedencia}</b>
            </div>
          </div>
        `
        polygon.bindPopup(popupContent)

        polygon.on('click', () => {
          setSelectedCell(cell)
          if (onSelectCell) onSelectCell(cell)
        })

        polygon.addTo(layerGroupRef.current)
      })
    }
  }, [
    activeMode,
    sinistroCells,
    matrizCells,
    severityFilter,
    showMarkers,
    rawExposicoes,
    selectedH3Index,
    selectedCell,
    onSelectCell,
  ])

  return (
    <div className="space-y-3">
      {/* Barra de Controles do Mapa */}
      <div className="p-3.5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Alternador de Modo de Exibição */}
          <div className="inline-flex rounded-xl bg-[#0A1128] p-1 border border-[#1A2A5A] font-semibold">
            <button
              type="button"
              onClick={() => setActiveMode('sinistros')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMode === 'sinistros'
                  ? 'bg-[#EF4444] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Mancha de Sinistros H3</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('matriz_zero')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMode === 'matriz_zero'
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matriz de Prioridade Zero</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeMode === 'sinistros' && (
            <div className="flex items-center gap-1.5 bg-[#0A1128] px-2.5 py-1 rounded-xl border border-[#1A2A5A]">
              <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-[#94A3B8] text-[11px]">Severidade:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="bg-transparent text-[#F8FAFC] text-xs focus:outline-none"
              >
                <option value="todos">Todos os sinistros ({sinistroCells.length} células)</option>
                <option value="fatais">Apenas Óbitos Fatais</option>
                <option value="feridos">Com Vítimas Feridas</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMarkers(!showMarkers)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              showMarkers
                ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Escolas & Pontos GTFS</span>
          </button>
        </div>
      </div>

      {/* Canvas do Mapa */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-[#1A2A5A] bg-[#070D1F] shadow-2xl"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Badge Flutuante de Governança H3 */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1128]/95 backdrop-blur-md border border-[#EF4444]/50 text-xs font-semibold text-[#F8FAFC] shadow-lg">
            <Hexagon className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>
              {activeMode === 'sinistros'
                ? 'Grade H3 Res 9 • Ocorrências Ancoradas'
                : 'Matriz Zero • Cruzamento Pavimento × Sinistros × Exposição'}
            </span>
          </div>
          <span className="text-[10px] text-[#94A3B8] bg-[#0A1128]/90 backdrop-blur-sm px-2 py-0.5 rounded border border-[#1A2A5A]/60 w-fit">
            Anonimização e k-anonimato territorial ativo (LGPD Art. 12)
          </span>
        </div>

        {/* Legenda Dinâmica */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#0A1128]/95 backdrop-blur-md border border-[#1A2A5A] rounded-xl p-3 text-[11px] text-[#CBD5E1] shadow-xl space-y-1.5 max-w-[280px]">
          <div className="font-bold text-xs text-[#F8FAFC] pb-1 border-b border-[#1A2A5A] flex items-center justify-between">
            <span>{activeMode === 'sinistros' ? 'Severidade do Trecho' : 'Prioridade Zero'}</span>
            <span className="font-mono text-[10px] text-[#3B82F6]">H3 ~174m</span>
          </div>

          {activeMode === 'sinistros' ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#EF4444]" />
                <span>Sinistro com Vítima Fatal (Óbito)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#F97316]" />
                <span>Sinistro com Vítimas Feridas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#FBBF24]" />
                <span>Colisão sem Vítima (Dano Material)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#EF4444]" />
                <span>Prioridade Máxima (Score &gt; 75 ou Óbito)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#F97316]" />
                <span>Alta Prioridade (Score 50–74)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#FBBF24]" />
                <span>Média Prioridade (Score 30–49)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#3B82F6]" />
                <span>Monitoramento Preventivo (&lt; 30)</span>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-1 border-t border-[#1A2A5A]/60 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Escola (INEP)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              Ponto GTFS
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
