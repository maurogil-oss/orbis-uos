import { useState, useEffect } from 'react'
import { Hero, CityTier } from '@/components/Hero'
import { TrustStrip } from '@/components/TrustStrip'
import { Simulator } from '@/components/Simulator'
import { HowItWorks } from '@/components/HowItWorks'
import { PilotForm } from '@/components/PilotForm'
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
    <main id="main-content" className="w-full flex flex-col">
      {/* 1. Hero com seletor de porte (Pequena/Média/Grande) e legenda dinâmica de frota recomendada/escopo */}
      <Hero selectedTier={selectedTier} onSelectTier={setSelectedTier} liveMetrics={liveMetrics} />

      {/* 2. TrustStrip (Conformidade legal, técnica e padrões de governança) */}
      <TrustStrip />

      {/* 3. Simulador de Frota e Quilometragem (intocado em modelo e textos, com botão de Diagnóstico Express) */}
      <Simulator selectedTier={selectedTier} onSelectTier={setSelectedTier} />

      {/* 4. Como Contratar (Jornada CPSI LC 182/2021 em passos para procuradorias e gestores) */}
      <HowItWorks />

      {/* 5. Manifesto de Interesse como ÚNICO formulário de conversão da home (com bloco de contato geral integrado) */}
      <PilotForm />

      {/* 6. Rodapé é renderizado no Layout padrão da aplicação (src/components/Layout.tsx) */}
    </main>
  )
}
