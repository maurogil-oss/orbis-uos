import { useState, useEffect } from 'react'
import { Hero, CityTier } from '@/components/Hero'
import { TrustStrip } from '@/components/TrustStrip'
import { Accountability } from '@/components/Accountability'
import { Simulator } from '@/components/Simulator'
import { Benefits } from '@/components/Benefits'
import { IntegrationArchitecture } from '@/components/IntegrationArchitecture'
import { Comparison } from '@/components/Comparison'
import { HowItWorks } from '@/components/HowItWorks'
import { FAQ } from '@/components/FAQ'
import { PilotForm } from '@/components/PilotForm'
import { ExpressDiagnostic } from '@/components/ExpressDiagnostic'
import { Onda2Modules } from '@/components/Onda2Modules'
import { ContactSection } from '@/components/ContactSection'
import { getPlatformLiveMetrics, PlatformLiveMetrics } from '@/services/liveMetrics'

export default function Index() {
  // Estado central do porte de cidade: 'pequena' (padrão estratégico acordado)
  const [selectedTier, setSelectedTier] = useState<CityTier>('pequena')
  const [liveMetrics, setLiveMetrics] = useState<PlatformLiveMetrics | null>(null)

  useEffect(() => {
    getPlatformLiveMetrics()
      .then((data) => setLiveMetrics(data))
      .catch((err) => console.warn('Erro ao carregar métricas vivas da landing:', err))
  }, [])

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section com Narrativa Clara de Gestão Pública, Seletor de Porte e CTAs por Intenção */}
      <Hero selectedTier={selectedTier} onSelectTier={setSelectedTier} liveMetrics={liveMetrics} />

      {/* 2. Trust Strip (Marquee enxuto de conformidade técnica, legal e padrões) */}
      <TrustStrip />

      {/* 3. Simulador de Frota e Quilometragem (Produto real: telemetria por smartphone vs métodos tradicionais) */}
      <Simulator selectedTier={selectedTier} onSelectTier={setSelectedTier} />

      {/* 4. Accountability: Para Quem Prestamos Contas & Sociedade Atendida */}
      <Accountability />

      {/* 5. Onda 2 por Porte: Módulos Green Light Bridge e Meio-fio & Vagas */}
      <Onda2Modules selectedTier={selectedTier} onSelectTier={setSelectedTier} />

      {/* 6. Benefícios & Pilares do Motor ORBIS DSP */}
      <Benefits />

      {/* 7. Comparativo: Modelo Convencional Reativo vs. Governança Preditiva ORBIS.UOS */}
      <Comparison />

      {/* 8. Arquitetura de Integração Aberta (ERPs públicos, GTFS, semáforos) */}
      <IntegrationArchitecture selectedTier={selectedTier} />

      {/* 9. Como Contratar (Jornada CPSI LC 182/2021 em 3 passos) */}
      <HowItWorks />

      {/* 10. FAQ (Dúvidas de Gestores e Procuradorias) */}
      <FAQ />

      {/* 11. Diagnóstico Express (Dimensionamento preliminar em 5 minutos) */}
      <ExpressDiagnostic />

      {/* 12. Manifesto de Interesse Institucional (Piloto CPSI LC 182/2021) — Conversão B2G */}
      <PilotForm />

      {/* 13. Fale Conosco — Canal Geral Institucional (Dúvidas, Imprensa, Parcerias) */}
      <ContactSection />
    </div>
  )
}
