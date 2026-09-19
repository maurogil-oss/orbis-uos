import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Activity } from 'lucide-react'
import { OrbisLogo } from '@/components/OrbisLogo'

export function Footer() {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-[#070C1D] border-t border-[#1A2A5A] text-[#94A3B8] transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                <OrbisLogo height={34} colorMode="dark" variant="full" />
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-[#94A3B8] max-w-sm">
              Plataforma de inteligência e governança de dados para órgãos públicos. Maximizando a
              eficiência fiscal, transparência e velocidade decisória na administração pública
              brasileira.
            </p>
            <div className="pt-2 text-xs text-[#94A3B8]/80 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]" />
              Sistemas em conformidade integral com a LGPD e Marco Legal GovTech.
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-4">
              Navegação Institucional
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#prestacao-contas"
                  onClick={(e) => handleAnchorClick(e, '#prestacao-contas')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block"
                >
                  Accountability & Sociedade Atendida
                </a>
              </li>
              <li>
                <a
                  href="#simulador"
                  onClick={(e) => handleAnchorClick(e, '#simulador')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block"
                >
                  Dimensionamento do Município
                </a>
              </li>
              <li>
                <a
                  href="#beneficios"
                  onClick={(e) => handleAnchorClick(e, '#beneficios')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block"
                >
                  Pilares de Governança Pública
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  onClick={(e) => handleAnchorClick(e, '#como-funciona')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block"
                >
                  Marco Legal CPSI (LC 182/2021)
                </a>
              </li>
              <li>
                <Link
                  to="/metodologia"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#60A5FA]"
                >
                  Metodologia Homologada (v2.0)
                </Link>
              </li>
              <li>
                <Link
                  to="/operacao"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#10B981]"
                >
                  Pacote Operacional (Backups, RTO/RPO & SLA)
                </Link>
              </li>
              <li>
                <Link
                  to="/interoperabilidade"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#60A5FA]"
                >
                  API, Webhooks & Interoperabilidade CIC
                </Link>
              </li>
              <li>
                <Link
                  to="/cockpit"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#3B82F6]"
                >
                  <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                  Cockpit de Telemetria & Modo Gabinete
                </Link>
              </li>
              <li>
                <a
                  href="#manifesto"
                  onClick={(e) => handleAnchorClick(e, '#manifesto')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block text-[#10B981]"
                >
                  Manifesto de Interesse Institucional
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-4">
              Contato Institucional
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <a
                  href="mailto:contato@orbis-uos.gov.br"
                  className="hover:text-[#F8FAFC] transition-colors break-all"
                >
                  contato@orbis-uos.gov.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">
                  Setor Comercial Sul, Quadra 4, Bloco A, Edifício Capital, 7º Andar — Brasília, DF
                  — CEP 70304-900
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]/80">
          <p>© {new Date().getFullYear()} Orbis UOS GovTech. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/operacao" className="hover:text-[#F8FAFC] transition-colors text-[#10B981]">
              Pacote Operacional
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link
              to="/privacidade"
              className="hover:text-[#F8FAFC] transition-colors text-[#60A5FA]"
            >
              Política de Privacidade
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link to="/privacidade#termos" className="hover:text-[#F8FAFC] transition-colors">
              Termos & Governança LGPD
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
