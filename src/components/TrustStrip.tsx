import React from 'react'
import { Building2 } from 'lucide-react'

export function TrustStrip() {
  const trustItems = [
    'Compatível com SICONFI',
    'Conforme PNATRANS & CONTRAN',
    'Art. 320 do CTB (Fundo de Multas)',
    'Marco Legal CPSI (LC 182/21)',
    'Zero CAPEX • Frota Existente',
    '100% LGPD • Sem Imagens nem Placas',
    'Metodologia Pública Auditável',
    'Interoperabilidade GTFS & GeoJSON',
    'Dossiê para Tribunal de Contas (TCE)',
    'Processamento via Motor ORBIS DSP',
  ]

  // Double the list to create a seamless infinite loop
  const displayList = [...trustItems, ...trustItems]

  return (
    <section
      className="relative w-full bg-[#080E22] border-y border-[#1A2A5A]/60 py-4 overflow-hidden"
      aria-label="Conformidade técnica, legal e padrões institucionais"
    >
      {/* Edge gradient masks for subtle fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#080E22] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#080E22] to-transparent z-10 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 mb-2 flex items-center justify-center">
        <span className="text-xs font-semibold text-[#CBD5E1] flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#38BDF8]" />
          Conformidade legal, padrões abertos e integridade técnica institucional
        </span>
      </div>

      <div className="overflow-hidden">
        <div className="animate-marquee flex items-center gap-8 sm:gap-12 py-1">
          {displayList.map((inst, index) => (
            <div
              key={`${inst}-${index}`}
              className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors whitespace-nowrap cursor-default px-3 py-1 rounded bg-[#101B3A]/40 border border-[#1A2A5A]/40"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              <span>{inst}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
