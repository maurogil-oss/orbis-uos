import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A1128] text-[#F8FAFC]">
      {/* Skip Link para acessibilidade (WCAG 2.4.1 Bypass Blocks) */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-[#3B82F6] focus:text-white focus:font-bold focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0A1128] text-xs transition-all"
      >
        Ir para o conteúdo principal
      </a>
      <Navbar />
      <main id="conteudo-principal" tabIndex={-1} className="flex-1 flex flex-col outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
