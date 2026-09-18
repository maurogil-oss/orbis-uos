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
      {/* 1. Hero Section com Narrativa de Gestão Pública, Responsabilidade e Dados Vivos */}
      <Hero selectedTier={selectedTier} onSelectTier={setSelectedTier} liveMetrics={liveMetrics} />

      {/* 2. Trust Strip (Marquee com respaldo institucional e órgãos) */}
      <TrustStrip />

      {/* 3. Nova Seção de Accountability: Para Quem Prestamos Contas & Sociedade Atendida */}
      <Accountability />

      {/* 4. Simulator com Nova Moldura Institucional (Recursos Recuperados & Orçamento) */}
      <Simulator selectedTier={selectedTier} onSelectTier={setSelectedTier} />

      {/* 5. Onda 2 por Porte: Módulos Green Light Bridge e Meio-fio & Vagas para Cidade Média */}
      <Onda2Modules selectedTier={selectedTier} onSelectTier={setSelectedTier} />

      {/* 6. Benefits (4 pilares estendidos: SDK Edge FFT, Green Light, Art. 320 CTB, LGPD) */}
      <Benefits />

      {/* 7. Arquitetura de Integração Aberta (ERPs públicos, Green Light Bridge, GTFS, Semáforos) */}
      <IntegrationArchitecture selectedTier={selectedTier} />

      {/* 7. Comparativo (Modelo Convencional Reativo vs. ORBIS.UOS Governança Preditiva) */}
      <Comparison />

      {/* 8. Como Contratar (Jornada CPSI LC 182/2021 em 3 passos) */}
      <HowItWorks />

      {/* 9. FAQ (Dúvidas dos Gestores, Secretários e Procuradorias) */}
      <FAQ />

      {/* 10. Diagnóstico Express (Pré-diagnóstico Provisório e dimensionamento CPSI) */}
      <ExpressDiagnostic />

      {/* 11. Manifesto de Interesse Institucional (Piloto CPSI LC 182/2021) */}
      <PilotForm />
    </div>
  )
}
