import { useEffect, useRef } from 'react'
import { RoadEventRecord } from '@/services/roadEvents'
import { FleetTelemetryRecord } from '@/services/fleet'

// Leaflet types without installing external unneeded dependencies
declare global {
  interface Window {
    L: any
  }
}

interface CuritibaMapProps {
  roadEvents: RoadEventRecord[]
  fleet: FleetTelemetryRecord[]
  selectedEventId?: string | null
  onSelectEvent?: (event: RoadEventRecord) => void
  showHeatmap?: boolean
  showFleet?: boolean
  severityFilter?: string
}

export function CuritibaMap({
  roadEvents,
  fleet,
  selectedEventId,
  onSelectEvent,
  showHeatmap = true,
  showFleet = true,
  severityFilter = 'all',
}: CuritibaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const fleetLayerRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)

  // 1. Load Leaflet script & CSS dynamically if not present
  useEffect(() => {
    let linkTag: HTMLLinkElement | null = null
    let scriptTag: HTMLScriptElement | null = null

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return

      // Center on Curitiba
      const L = window.L
      const map = L.map(mapContainerRef.current, {
        center: [-25.4372, -49.2731],
        zoom: 13,
        zoomControl: false,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Dark style CartoDB/OpenStreetMap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      markersLayerRef.current = L.layerGroup().addTo(map)
      fleetLayerRef.current = L.layerGroup().addTo(map)
      heatLayerRef.current = L.layerGroup().addTo(map)

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

  // 2. Render Markers, Heatmap simulation & Fleet on map
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = window.L
    if (!map || !L) return

    // Clear previous layers
    if (markersLayerRef.current) markersLayerRef.current.clearLayers()
    if (fleetLayerRef.current) fleetLayerRef.current.clearLayers()
    if (heatLayerRef.current) heatLayerRef.current.clearLayers()

    // Filter events
    const filteredEvents = roadEvents.filter((ev) => {
      if (severityFilter === 'all') return true
      return ev.severidade === severityFilter
    })

    // Colors mapping
    const severityColors: Record<string, string> = {
      critica: '#EF4444',
      alta: '#F97316',
      media: '#FBBF24',
      baixa: '#10B981',
    }

    // A. Heat circles simulation (gradient halos on high severity spots)
    if (showHeatmap) {
      filteredEvents.forEach((ev) => {
        const radius =
          ev.severidade === 'critica'
            ? 350
            : ev.severidade === 'alta'
              ? 260
              : ev.severidade === 'media'
                ? 180
                : 120
        const color = severityColors[ev.severidade] || '#3B82F6'

        const heatCircle = L.circle([ev.latitude, ev.longitude], {
          radius: radius,
          fillColor: color,
          fillOpacity: ev.severidade === 'critica' ? 0.28 : 0.16,
          color: color,
          weight: 0.5,
          opacity: 0.4,
        })
        heatCircle.addTo(heatLayerRef.current)
      })
    }

    // B. Road Anomaly Markers
    filteredEvents.forEach((ev) => {
      const color = severityColors[ev.severidade] || '#3B82F6'
      const isSelected = selectedEventId === ev.id

      // Custom pulsing HTML marker
      const markerHtml = `
        <div style="
          width: ${isSelected ? '28px' : '20px'};
          height: ${isSelected ? '28px' : '20px'};
          background: ${color};
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
        ">
          <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%;"></div>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-road-marker',
        html: markerHtml,
        iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
        iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
      })

      const marker = L.marker([ev.latitude, ev.longitude], { icon: customIcon })

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0A1128; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px; color: #0A1128;">
            ${ev.via}
          </div>
          <div style="color: #64748B; font-size: 11px; margin-bottom: 6px;">
            ${ev.bairro || 'Curitiba'} • ${ev.tipo.toUpperCase()}
          </div>
          <div style="display: flex; gap: 4px; margin-bottom: 6px;">
            <span style="background: ${color}; color: #FFF; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${ev.severidade}
            </span>
            <span style="background: #E2E8F0; color: #1E293B; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
              IRI: ${ev.iri_score ? ev.iri_score.toFixed(1) : 'N/A'}
            </span>
          </div>
          <div style="font-size: 10px; color: #64748B;">
            Aceleração Z: <b>${ev.aceleracao_z ? ev.aceleracao_z.toFixed(2) + 'g' : 'N/A'}</b><br/>
            Detectado por: <b>${ev.linha_frota || ev.veiculo_tipo || 'Frota Urbana'}</b>
          </div>
        </div>
      `
      marker.bindPopup(popupHtml)

      marker.on('click', () => {
        if (onSelectEvent) onSelectEvent(ev)
      })

      marker.addTo(markersLayerRef.current)
    })

    // C. Fleet Vehicles layer
    if (showFleet) {
      fleet.forEach((v) => {
        const fleetHtml = `
          <div style="
            width: 26px;
            height: 26px;
            background: #101B3A;
            border: 2px solid #3B82F6;
            border-radius: 6px;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #60A5FA;
            font-weight: bold;
          ">
            🚌
          </div>
        `
        const fleetIcon = L.divIcon({
          className: 'custom-fleet-marker',
          html: fleetHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        })

        const fleetMarker = L.marker([v.latitude, v.longitude], { icon: fleetIcon })
        const fleetPopup = `
          <div style="font-family: Inter, sans-serif; font-size: 12px; color: #0A1128; min-width: 170px;">
            <div style="font-weight: 800; font-size: 13px; color: #1E3A8A;">${v.veiculo_id}</div>
            <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">${v.linha}</div>
            <div style="font-size: 10px; color: #64748B;">
              Velocidade: <b>${v.velocidade} km/h</b><br/>
              Anomalias detectadas hoje: <b>${v.anomalias_detectadas || 0}</b><br/>
              Telemetria: <b>${v.ultima_leitura || 'Ativo'}</b>
            </div>
          </div>
        `
        fleetMarker.bindPopup(fleetPopup)
        fleetMarker.addTo(fleetLayerRef.current)
      })
    }
  }, [roadEvents, fleet, selectedEventId, onSelectEvent, showHeatmap, showFleet, severityFilter])

  // 3. Pan to selected event if changed
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedEventId) return

    const selected = roadEvents.find((e) => e.id === selectedEventId)
    if (selected) {
      map.setView([selected.latitude, selected.longitude], 15, { animate: true })
    }
  }, [selectedEventId, roadEvents])

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-[#1A2A5A] bg-[#070D1F] shadow-2xl">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-10" />

      {/* Floating Header Tag */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1128]/90 backdrop-blur-md border border-[#1A2A5A] text-xs font-semibold text-[#F8FAFC] shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span>Curitiba & RMC • Gêmeo Digital Ativo</span>
        </div>
        <span className="text-[10px] text-[#94A3B8] bg-[#0A1128]/80 backdrop-blur-sm px-2 py-0.5 rounded border border-[#1A2A5A]/60 w-fit">
          Tiles OpenStreetMap / CartoDB • Zero API Paga
        </span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-[#0A1128]/90 backdrop-blur-md border border-[#1A2A5A] rounded-xl p-3 text-[11px] text-[#CBD5E1] shadow-xl space-y-1.5 pointer-events-auto">
        <div className="font-bold text-xs text-[#F8FAFC] pb-1 border-b border-[#1A2A5A] flex items-center justify-between gap-4">
          <span>Severidade do Pavimento</span>
          <span className="font-mono text-[#3B82F6]">{roadEvents.length} anomalias</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>Crítica (IRI &gt; 6.0 | Tapa-buraco URGENTE)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
          <span>Alta (IRI 5.0 - 6.0 | Microrrevestimento)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
          <span>Média (IRI 3.5 - 5.0 | Ondulação/Fissura)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Baixa (IRI &lt; 3.5 | Bom estado)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#1A2A5A]/60">
          <span className="text-xs">🚌</span>
          <span className="text-[#60A5FA]">Veículo Frota Ativa ({fleet.length} rastreados)</span>
        </div>
      </div>
    </div>
  )
}
