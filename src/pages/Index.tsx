import { Hero } from '@/components/Hero'
import { TrustStrip } from '@/components/TrustStrip'
import { Simulator } from '@/components/Simulator'
import { Benefits } from '@/components/Benefits'
import { HowItWorks } from '@/components/HowItWorks'
import { PilotForm } from '@/components/PilotForm'

export default function Index() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Trust Strip (Marquee) */}
      <TrustStrip />

      {/* 3. Simulator (Core centerpiece) */}
      <Simulator />

      {/* 4. Benefits (3 pillars) */}
      <Benefits />

      {/* 5. How It Works (Timeline) */}
      <HowItWorks />

      {/* 6. Pilot Form (Lead capture) */}
      <PilotForm />
    </div>
  )
}
