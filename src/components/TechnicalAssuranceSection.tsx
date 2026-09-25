import React from 'react'
import { ShieldCheck, BatteryCharging, Cpu, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function TechnicalAssuranceSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-12 relative bg-[#070D1F] border-y border-[#1A2A5A]/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* BANNER TÉCNICO DE CONFIANÇA E AUDITORIA INSTITUCIONAL */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#101B3A]/90 border border-[#1A2A5A] w-full flex flex-wrap items-center justify-around gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="text-[#94A3B8]">Auditoria Inercial:</span>
            <b className="text-[#10B981] font-semibold">100% LGPD (Sem imagens de pessoas)</b>
          </div>
          <div className="flex items-center gap-2.5">
            <BatteryCharging className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span className="text-[#94A3B8]">Consumo Aferido:</span>
            <b className="text-[#F8FAFC] font-semibold">1,2–1,8% / hora</b>
            <span className="text-xs text-[#94A3B8]">(Turno 8h = 10–15%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-[#60A5FA] shrink-0" />
            <span className="text-[#94A3B8]">Processamento Local:</span>
            <b className="text-[#60A5FA] font-semibold">FFT Banda 1–20 Hz na Borda</b>
          </div>
        </div>

        {/* BANNER DE TRANSIÇÃO POC / PRODUÇÃO */}
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#101B3A]/60 border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold text-[#F8FAFC] block text-xs sm:text-sm">
                Demonstração no navegador • Produção via SDK Embarcado
              </span>
              <span className="text-xs text-[#94A3B8]">
                Teste os sensores do seu celular agora no modo de demonstração via DeviceMotion; em
                produção na prefeitura, opera silencioso em segundo plano.
              </span>
            </div>
          </div>
          {isAuthenticated ? (
            <Link
              to="/cockpit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors shrink-0"
            >
              <span>Abrir Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/demo"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#60A5FA] bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/40 transition-colors shrink-0"
            >
              <span>Ver Demonstração</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
