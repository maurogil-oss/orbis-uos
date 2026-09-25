import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Activity, Compass } from 'lucide-react'
import { OrbisLogo } from '@/components/OrbisLogo'

export function Footer() {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', `/#${href.replace(/^#/, '')}`)
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
                <Link
                  to="/demo"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#60A5FA] font-semibold"
                >
                  <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Ver Demonstração (Tour Autoguiado)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/governanca"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#38BDF8] font-semibold"
                >
                  Governança Verificável (6 Peças B2G)
                </Link>
              </li>
              <li>
                <Link
                  to="/status"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#10B981] font-semibold"
                >
                  <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Painel de Disponibilidade & Status (/status)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/#simulador"
                  onClick={(e) => handleAnchorClick(e, '#simulador')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block"
                >
                  Simulador de Economicidade (Art. 320)
                </Link>
              </li>
              <li>
                <Link
                  to="/#prestacao-contas"
                  onClick={(e) => handleAnchorClick(e, '#prestacao-contas')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block"
                >
                  Accountability & Sociedade Atendida
                </Link>
              </li>
              <li>
                <Link
                  to="/metodologia"
                  className="hover:text-[#F8FAFC] transition-colors inline-block text-[#CBD5E1]"
                >
                  Metodologia Científica & IRI
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
                  to="/homologacao"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#10B981]"
                >
                  Laudo Dry-Run de Homologação (ORBIS-DRYRUN-2026-001)
                </Link>
              </li>
              <li>
                <Link
                  to="/implantacao"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#60A5FA]"
                >
                  Playbook de Implantação (RACI & Homologação)
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
                  to="/sandbox"
                  className="hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1.5 text-[#38BDF8]"
                >
                  Sandbox Playground & Chaves de API
                </Link>
              </li>
              <li>
                <Link
                  to="/enquadramento"
                  className="hover:text-[#F8FAFC] transition-colors inline-block text-[#60A5FA]"
                >
                  Enquadramento CPSI (LC 182/2021)
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
                <Link
                  to="/#manifesto"
                  onClick={(e) => handleAnchorClick(e, '#manifesto')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block text-[#10B981] font-semibold"
                >
                  Solicitar Piloto (Manifesto CPSI)
                </Link>
              </li>
              <li>
                <Link
                  to="/#contato"
                  onClick={(e) => handleAnchorClick(e, '#contato')}
                  className="hover:text-[#F8FAFC] transition-colors inline-block text-[#CBD5E1]"
                >
                  Fale Conosco (Contato Geral & Dúvidas)
                </Link>
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
                <div>
                  <a
                    href="mailto:contato@orbis-uos.com.br"
                    className="hover:text-[#F8FAFC] transition-colors break-all font-mono font-medium text-[#38BDF8]"
                  >
                    contato@orbis-uos.com.br
                  </a>
                  <span className="block text-xs text-[#94A3B8] mt-0.5">
                    Resposta em até 2 dias úteis (SLA P3)
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">
                  Setor Comercial Sul, Quadra 4, Bloco A, Edifício Capital, 7º Andar — Brasília, DF
                  — CEP 70304-900
                </span>
              </li>
              <li className="pt-1">
                <Link
                  to="/#contato"
                  onClick={(e) => handleAnchorClick(e, '#contato')}
                  className="text-xs text-[#60A5FA] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Ver detalhes do canal Fale Conosco</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]/80">
          <p>© {new Date().getFullYear()} Orbis UOS GovTech. Todos os direitos reservados.</p>
          <div className="text-xs text-[#94A3B8]">
            Domínio Oficial:{' '}
            <a
              href="https://www.orbis-uos.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38BDF8] hover:underline font-medium"
            >
              https://www.orbis-uos.com.br
            </a>{' '}
            • Canal:{' '}
            <a
              href="mailto:contato@orbis-uos.com.br"
              className="text-[#38BDF8] hover:underline font-medium"
            >
              contato@orbis-uos.com.br
            </a>{' '}
            • DPO:{' '}
            <a
              href="mailto:privacidade@orbis-uos.com.br"
              className="text-[#38BDF8] hover:underline font-medium"
            >
              privacidade@orbis-uos.com.br
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/demo" className="hover:text-[#F8FAFC] transition-colors text-[#60A5FA]">
              Ver Demonstração
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link
              to="/governanca"
              className="hover:text-[#F8FAFC] transition-colors text-[#38BDF8]"
            >
              Governança
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link to="/status" className="hover:text-[#F8FAFC] transition-colors text-[#10B981]">
              Status
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link to="/metodologia" className="hover:text-[#F8FAFC] transition-colors">
              Metodologia
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link to="/operacao" className="hover:text-[#F8FAFC] transition-colors text-[#10B981]">
              Pacote Operacional
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link
              to="/implantacao"
              className="hover:text-[#F8FAFC] transition-colors text-[#60A5FA]"
            >
              Playbook de Implantação
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link
              to="/homologacao"
              className="hover:text-[#F8FAFC] transition-colors text-[#10B981]"
            >
              Laudo de Homologação
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link
              to="/privacidade"
              className="hover:text-[#F8FAFC] transition-colors text-[#60A5FA]"
            >
              Política de Privacidade
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link to="/termos" className="hover:text-[#F8FAFC] transition-colors text-[#38BDF8]">
              Termos de Uso
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <Link to="/sandbox" className="hover:text-[#F8FAFC] transition-colors text-[#60A5FA]">
              Sandbox
            </Link>
          </div>
        </div>

        {/* Versão do Sistema */}
        <div className="mt-4 text-center text-xs text-[#64748B]">
          ORBIS UOS GovTech • v0.0.34 • Curitiba / PR (IBGE 4106902) • Conformidade LC 182/2021 &
          Art. 12 LGPD
        </div>
      </div>
    </footer>
  )
}
