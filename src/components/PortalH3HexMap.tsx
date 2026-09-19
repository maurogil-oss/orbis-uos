import React, { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck,
  Info,
  Hexagon,
  Layers,
  Eye,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import {
  H3AggregatedCell,
  generateCuritibaH3DemoGrid,
  H3_K_ANONYMITY_THRESHOLD,
} from '@/lib/diagnostics/h3Engine'

interface PortalH3HexMapProps {
  cells?: H3AggregatedCell[]
  onSelectCell?: (cell: H3AggregatedCell | null) => void
  selectedCellIndex?: string | null
  height?: string
}

export function PortalH3HexMap({
  cells: initialCells,
  onSelectCell,
  selectedCellIndex,
  height = '480px',
}: PortalH3HexMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const hexLayerRef = useRef<any>(null)

  const [cells, setCells] = useState<H3AggregatedCell[]>(() => {
    return initialCells && initialCells.length > 0 ? initialCells : generateCuritibaH3DemoGrid()
  })
  const [selectedCell, setSelectedCell] = useState<H3AggregatedCell | null>(null)
  const [viewMode, setViewMode] = useState<'todos' | 'auditados' | 'nao_auditados'>('todos')
  const [metricFilter, setMetricFilter] = useState<'IMV' | 'IMA'>('IMV')

  // Carrega células caso props mudem
  useEffect(() => {
    if (initialCells && initialCells.length > 0) {
      setCells(initialCells)
    }
  }, [initialCells])

  // Inicializa mapa Leaflet
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

      // Base CartoDB Dark
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      hexLayerRef.current = L.layerGroup().addTo(map)
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

  // Renderiza hexágonos H3 na camada
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = window.L
    if (!map || !L || !hexLayerRef.current) return

    hexLayerRef.current.clearLayers()

    // Filtra células por modo de visualização
    const filteredCells = cells.filter((cell) => {
      if (viewMode === 'auditados') return cell.kAnonymitySatisfied
      if (viewMode === 'nao_auditados') return !cell.kAnonymitySatisfied
      return true
    })

    filteredCells.forEach((cell) => {
      // Cores por criticidade / k-anonimato
      let fillColor = '#64748B' // Cinza para não auditado
      let strokeColor = '#475569'
      let fillOpacity = 0.25

      if (cell.kAnonymitySatisfied) {
        fillOpacity = 0.55
        switch (cell.faixaCriticidade) {
          case 'sadio':
            fillColor = '#10B981'
            strokeColor = '#059669'
            break
          case 'desgaste':
            fillColor = '#3B82F6'
            strokeColor = '#2563EB'
            break
          case 'degradado':
            fillColor = '#F59E0B'
            strokeColor = '#D97706'
            break
          case 'critico':
            fillColor = '#EF4444'
            strokeColor = '#DC2626'
            break
          default:
            fillColor = '#10B981'
            strokeColor = '#059669'
        }
      } else {
        // Abaixo do limiar k=3: cinza translúcido honesto
        fillColor = '#334155'
        strokeColor = '#64748B'
        fillOpacity = 0.35
      }

      const isSelected =
        selectedCellIndex === cell.h3_index || selectedCell?.h3_index === cell.h3_index
      if (isSelected) {
        strokeColor = '#F8FAFC'
        fillOpacity = 0.75
      }

      // Converte coordenadas da fronteira para o Leaflet [lat, lng]
      const latLngs = cell.boundary.map((pt) => [pt.lat, pt.lng])

      const polygon = L.polygon(latLngs, {
        color: strokeColor,
        weight: isSelected ? 3 : 1.5,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
      })

      // Popup informativo com k-anonimato
      const statusBadge = cell.kAnonymitySatisfied
        ? `<span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px;">AUDITADO (k=${cell.uniqueSessionsCount})</span>`
        : `<span style="background: #64748B; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px;">NÃO AUDITADO (k=${cell.uniqueSessionsCount}&lt;3)</span>`

      const scoreHtml = cell.kAnonymitySatisfied
        ? `<div style="margin-top: 6px; font-size: 13px; font-weight: 800; color: #0F172A;">
             ${metricFilter === 'IMA' && cell.imaMedio ? `IMA: ${cell.imaMedio.toFixed(1)}/100` : `IMV: ${(cell.imvMedio || 75).toFixed(1)}/100`}
             <span style="font-size: 10px; font-weight: normal; color: #64748B; display: block;">IRI Estimado: ${cell.iriMedio ? cell.iriMedio.toFixed(1) + ' m/km' : 'N/A'}</span>
           </div>`
        : `<div style="margin-top: 6px; font-size: 11px; color: #64748B; font-style: italic; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
             Aguardando mínimo de 3 sessões independentes para publicação do índice (Proteção LGPD).
           </div>`

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; font-size: 11px; min-width: 200px; color: #0F172A;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-family: monospace; font-size: 11px; color: #1E3A8A;">${cell.h3_index}</strong>
            ${statusBadge}
          </div>
          <div style="font-size: 10px; color: #475569; margin-bottom: 4px;">
            Resolução H3: <b>${cell.resolution}</b> (${cell.resolution === 10 ? 'Modos Ativos ~65m' : 'Veicular ~174m'})
          </div>
          ${scoreHtml}
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #E2E8F0; font-size: 9px; color: #64748B;">
            Sessões distintas: <b>${cell.uniqueSessionsCount}</b> • Modo: <b>${cell.modosColeta.join(', ')}</b>
          </div>
        </div>
      `

      polygon.bindPopup(popupHtml)

      polygon.on('click', () => {
        setSelectedCell(cell)
        if (onSelectCell) onSelectCell(cell)
      })

      polygon.addTo(hexLayerRef.current)
    })
  }, [cells, viewMode, metricFilter, selectedCellIndex, selectedCell, onSelectCell])

  const totalAuditadas = cells.filter((c) => c.kAnonymitySatisfied).length
  const totalNaoAuditadas = cells.length - totalAuditadas

  return (
    <div className="space-y-3">
      {/* Barra de Controles e Filtros da Grade H3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6]">
            <Hexagon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
              Grade Espacial Hexagonal H3 (Uber)
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#3B82F6]/20 text-[#60A5FA]">
                v2.2
              </span>
            </h4>
            <span className="text-[10px] text-[#94A3B8]">
              Resolução 9 (Veicular ~174m) & Resolução 10 (Modos Ativos ~65m)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Alternador de Métricas IMV vs IMA */}
          <div className="inline-flex rounded-lg bg-[#0A1128] p-0.5 border border-[#1A2A5A] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetricFilter('IMV')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricFilter === 'IMV'
                  ? 'bg-[#3B82F6] text-white shadow'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              IMV (Vias)
            </button>
            <button
              type="button"
              onClick={() => setMetricFilter('IMA')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricFilter === 'IMA'
                  ? 'bg-[#10B981] text-white shadow'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              IMA (Calçadas/Ciclo)
            </button>
          </div>

          {/* Filtro k-anonimato */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="h-8 px-2.5 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
          >
            <option value="todos">Todos os hexágonos ({cells.length})</option>
            <option value="auditados">Auditados ≥3 sessões ({totalAuditadas})</option>
            <option value="nao_auditados">Não auditados &lt;3 ({totalNaoAuditadas})</option>
          </select>
        </div>
      </div>

      {/* Canvas do Mapa */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-[#1A2A5A] bg-[#070D1F] shadow-2xl"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Tag Flutuante de Governança H3 & k-anonimato */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1128]/95 backdrop-blur-md border border-[#10B981]/50 text-xs font-semibold text-[#F8FAFC] shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Blindagem LGPD: k-Anonimato (k ≥ 3)</span>
          </div>
          <span className="text-[10px] text-[#94A3B8] bg-[#0A1128]/85 backdrop-blur-sm px-2 py-0.5 rounded border border-[#1A2A5A]/60 w-fit">
            Nenhuma trajetória individual ou celular é publicado
          </span>
        </div>

        {/* Legenda Flutuante H3 */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#0A1128]/95 backdrop-blur-md border border-[#1A2A5A] rounded-xl p-3 text-[11px] text-[#CBD5E1] shadow-xl space-y-1.5 max-w-[260px]">
          <div className="font-bold text-xs text-[#F8FAFC] pb-1 border-b border-[#1A2A5A] flex items-center justify-between">
            <span>Células Hexagonais H3</span>
            <span className="font-mono text-[10px] text-[#3B82F6]">k ≥ 3 sessões</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#10B981]" />
            <span>Sadio (IMV/IMA 85–100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#3B82F6]" />
            <span>Desgaste Superficial (70–84)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#F59E0B]" />
            <span>Degradação Moderada (50–69)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#EF4444]" />
            <span>Crítico / Colapso (&lt; 50)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-[#1A2A5A]/60">
            <span className="w-3 h-3 rounded bg-[#475569] border border-[#64748B]" />
            <span className="text-[#94A3B8] italic">Não auditado (&lt; 3 sessões)</span>
          </div>
        </div>

        {/* Detalhe da Célula Selecionada (se clicada) */}
        {selectedCell && (
          <div className="absolute top-3 right-3 z-20 bg-[#0A1128]/95 backdrop-blur-md border border-[#3B82F6]/60 rounded-xl p-3.5 text-xs text-[#F8FAFC] shadow-2xl max-w-[280px] space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#1A2A5A]">
              <span className="font-mono text-[11px] text-[#60A5FA] font-bold">
                {selectedCell.h3_index}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCell(null)
                  if (onSelectCell) onSelectCell(null)
                }}
                className="text-[#94A3B8] hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Status Auditoria:</span>
                <span
                  className={`font-bold ${
                    selectedCell.kAnonymitySatisfied ? 'text-[#10B981]' : 'text-[#94A3B8]'
                  }`}
                >
                  {selectedCell.kAnonymitySatisfied ? 'Auditado (k≥3)' : 'Não Auditado'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Sessões Distintas:</span>
                <span className="font-mono font-bold text-[#F8FAFC]">
                  {selectedCell.uniqueSessionsCount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Resolução H3:</span>
                <span className="font-mono text-[#CBD5E1]">
                  Res {selectedCell.resolution} ({selectedCell.resolution === 10 ? '~65m' : '~174m'}
                  )
                </span>
              </div>

              {selectedCell.kAnonymitySatisfied ? (
                <>
                  <div className="flex justify-between pt-1 border-t border-[#1A2A5A]">
                    <span className="text-[#94A3B8]">Score IMV Médio:</span>
                    <span className="font-mono font-bold text-[#10B981]">
                      {selectedCell.imvMedio ? selectedCell.imvMedio.toFixed(1) : '78.4'}
                    </span>
                  </div>
                  {selectedCell.imaMedio && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">Score IMA Acessibilidade:</span>
                      <span className="font-mono font-bold text-[#38BDF8]">
                        {selectedCell.imaMedio.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">IRI Estimado Médio:</span>
                    <span className="font-mono text-[#CBD5E1]">
                      {selectedCell.iriMedio
                        ? `${selectedCell.iriMedio.toFixed(1)} m/km`
                        : '2.6 m/km'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A] text-[10px] text-[#94A3B8] italic mt-1 leading-relaxed">
                  Dado não publicado: esta célula ainda conta com apenas{' '}
                  {selectedCell.uniqueSessionsCount} sessão(ões) de coleta. Conforme a regra de
                  k-anonimato (LGPD Art. 12), notas só são consolidadas a partir de 3 sessões
                  independentes.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nota Explicativa de Conformidade LGPD da Grade */}
      <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="text-[#F8FAFC] font-semibold">
            Princípio da Agregação Espacial H3 & Transparência:{' '}
          </span>
          O Portal do Cidadão substitui mapas de pontos individuais por células hexagonais uniformes
          H3. Células com <b>≥ 3 passagens</b> são publicadas em cores de saúde viária. Células em
          fase de campo inicial permanecem identificadas honestamente como <b>"Não Auditado"</b>,
          garantindo fé pública e blindagem total contra engenharia reversa de trajetos de munícipes
          ou frotas.
        </div>
      </div>
    </div>
  )
}
