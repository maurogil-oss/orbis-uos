import { Hero } from '@/components/Hero'
import { TrustStrip } from '@/components/TrustStrip'
import { Simulator } from '@/components/Simulator'
import { Benefits } from '@/components/Benefits'
import { Comparison } from '@/components/Comparison'
import { HowItWorks } from '@/components/HowItWorks'
import { FAQ } from '@/components/FAQ'
import { PilotForm } from '@/components/PilotForm'

export default function Index() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section com telemetria inercial & badges */}
      <Hero />

      {/* 2. Trust Strip (Marquee com respaldo institucional e órgãos) */}
      <TrustStrip />

      {/* 3. Simulator (Simulador instantâneo de retorno público & frota) */}
      <Simulator />

      {/* 4. Benefits (4 pilares da arquitetura de valor público Orbis UOS) */}
      <Benefits />

      {/* 5. Comparativo (Modelo Convencional Reativo vs. Orbis GovTech) */}
      <Comparison />

      {/* 6. Como Contratar (Jornada CPSI LC 182/2021 em 3 passos) */}
      <HowItWorks />

      {/* 7. FAQ (Dúvidas estratégicas frequentes dos prefeitos e secretários) */}
      <FAQ />

      {/* 8. Formulário de Adesão ao Piloto (90 dias / captação) */}
      <PilotForm />
    </div>
  )
}
