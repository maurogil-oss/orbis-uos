import React from 'react'
import { Link } from 'react-router-dom'
import {
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileText,
  SlidersHorizontal,
  Mail,
  Compass,
} from 'lucide-react'
import { FAQ } from '@/components/FAQ'

export default function FaqPage() {
  return (
    <main id="main-content" className="w-full min-h-screen bg-[#070D1F] text-[#F8FAFC]">
      {/* Skip to section anchor accessibility helper */}
      <div className="sr-only">
        <a href="#faq-conteudo">Pular para as perguntas frequentes</a>
      </div>

      {/* Header Institucional do FAQ */}
      <section className="pt-28 pb-12 relative bg-gradient-to-b from-[#0A1128] via-[#0D183A] to-[#070D1F] border-b border-[#1A2A5A]/60">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#3B82F6]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <nav
            aria-label="Trilha de navegação"
            className="flex items-center gap-2 text-xs text-[#94A3B8]"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#1A2A5A]" />
            <span className="text-[#38BDF8] font-medium">Perguntas Frequentes</span>
          </nav>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101B3A] border border-[#3B82F6]/40 text-xs font-semibold text-[#60A5FA]">
              <HelpCircle className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Base de Conhecimento e Esclarecimentos B2G</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Perguntas Frequentes (FAQ)
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl">
              Respostas diretas e fundamentadas para prefeitos, secretários de obras e mobilidade,
              procuradores municipais e equipes de controle interno sobre a contratação CPSI e a
              tecnologia inercial.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/plataforma"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Ver Arquitetura da Plataforma</span>
            </Link>
            <Link
              to="/metodologia"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Metodologia Científica & IRI</span>
            </Link>
            <Link
              to="/acessibilidade"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#10B981] text-xs font-semibold text-[#10B981] transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Declaração de Acessibilidade (e-MAG + WCAG 2.2 AA)</span>
            </Link>
            <Link
              to="/#manifesto"
              className="px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-bold text-white transition-all shadow-md shadow-[#3B82F6]/30 flex items-center gap-1.5 ml-auto"
            >
              <span>Submeter Manifesto de Interesse</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal do FAQ (Componente completo com Accordion e links) */}
      <div id="faq-conteudo" className="w-full">
        <FAQ />
      </div>

      {/* Rodapé Interno com Contato para Dúvidas Específicas */}
      <section className="py-14 bg-[#0A1128] border-t border-[#1A2A5A]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Sua dúvida não foi respondida aqui?</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
            Nossa equipe técnica e jurídica está à disposição para apoiar gabinetes municipais e
            procuradorias em sessões técnicas de esclarecimento.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:contato@orbis-uos.com.br"
              className="px-4 py-2.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-bold text-[#38BDF8] transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>contato@orbis-uos.com.br</span>
            </a>
            <Link
              to="/#manifesto"
              className="px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-bold text-white transition-all shadow-md shadow-[#3B82F6]/30 flex items-center gap-2"
            >
              <span>Solicitar Minuta CPSI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
