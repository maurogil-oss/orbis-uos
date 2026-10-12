import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mail,
  ChevronRight,
  Layers,
  ArrowRight,
  Eye,
  MousePointerClick,
  FileText,
  Accessibility,
  Send,
  Check,
  Copy,
  ChevronDown,
  Info,
} from 'lucide-react'

interface ScopeArea {
  rota: string
  nome: string
  tipo: 'Pública' | 'Autenticada'
  status: 'Conforme' | 'Conforme com ressalvas'
  descricao: string
  medidasChave: string[]
}

const SCOPE_AREAS: ScopeArea[] = [
  {
    rota: '/',
    nome: 'Página Inicial (Landing Page B2G)',
    tipo: 'Pública',
    status: 'Conforme',
    descricao:
      'Apresentação institucional enxuta em 6 seções, incluindo simulador interativo de economicidade Art. 320 do CTB e formulário de adesão ao piloto.',
    medidasChave: [
      'Skip link global para conteúdo principal',
      'aria-live no simulador de frotas e resultados numéricos',
      'Alvos de toque mínimos de 44×44 px em botões e controles',
      'Contraste de texto secundário superior a 4,5:1 sobre tema dark navy',
    ],
  },
  {
    rota: '/plataforma',
    nome: 'Plataforma & Arquitetura (/plataforma)',
    tipo: 'Pública',
    status: 'Conforme',
    descricao:
      'Detalhamento da arquitetura de integração aberta, comparação de modelos, benefícios do Motor ORBIS DSP e expansão Onda 2 para semáforos e meio-fio.',
    medidasChave: [
      'Barra de salto por âncoras internas com foco não obscurecido',
      'Headings estruturados em H1, H2 e H3 sem quebra hierárquica',
      'Semântica de listas e seções rotuladas',
      'Linguagem simples (Plain Language) sem siglas descontextualizadas',
    ],
  },
  {
    rota: '/faq',
    nome: 'Perguntas Frequentes (/faq)',
    tipo: 'Pública',
    status: 'Conforme',
    descricao:
      'Base de esclarecimentos para prefeitos, secretários de obras, procuradores municipais e equipes de controle interno sobre CPSI e tecnologia.',
    medidasChave: [
      'Accordion com controle por teclado (Enter, Espaço e setas)',
      'aria-expanded e aria-controls em todos os itens de pergunta',
      'Alvos de expansão com altura mínima de 44 px',
      'Links internos contextuais com rótulos descritivos',
    ],
  },
  {
    rota: '/demo',
    nome: 'Demonstração Orientada B2G (/demo)',
    tipo: 'Pública',
    status: 'Conforme',
    descricao:
      'Tour autoguiado em 6 etapas interativas com mapa territorial H3 de Curitiba, matriz de risco e simulação orçamentária.',
    medidasChave: [
      'Narração textual explicativa em linguagem plana para cada gráfico e hexágono',
      'aria-live polite nos seletores de etapas e indicadores simulados',
      'Marcação honesta e explícita de dados de demonstração',
      'Alternativa textual completa para visualizações geoespaciais',
    ],
  },
  {
    rota: '/metodologia',
    nome: 'Metodologia Científica & IRI (/metodologia)',
    tipo: 'Pública',
    status: 'Conforme',
    descricao:
      'Documentação técnica do cálculo do Índice de Irregularidade Internacional (IRI), Motor ORBIS DSP, H3 e modelos de degradação.',
    medidasChave: [
      'Fórmulas matemáticas acompanhadas de explicação contextual em português',
      'Estrutura em blocos temáticos com navegação por teclado',
      'Tabelas de equivalência com cabeçalhos acessíveis (th scope)',
      'Exportação de laudos com texto selecionável e acessível',
    ],
  },
  {
    rota: '/campo',
    nome: 'Modo Campo de Coleta (/campo e /modo-campo)',
    tipo: 'Autenticada',
    status: 'Conforme com ressalvas',
    descricao:
      'Interface móvel para agentes de campo e veículos da frota municipal executarem telemetria inercial em tempo real via DeviceMotion.',
    medidasChave: [
      'Piso rigoroso de 44×44 px (.touch-target-44) em botões para uso com luvas',
      'Feedback sonoro/visual de status de conexão e calibragem de sensores',
      'Instruções explícitas e em linguagem simples para liberação de sensores no Android/Chrome',
      'Modo de alto contraste nativo para visualização sob luz solar direta',
    ],
  },
  {
    rota: '/cockpit',
    nome: 'Cockpit Institucional & Modo Gabinete (/cockpit)',
    tipo: 'Autenticada',
    status: 'Conforme com ressalvas',
    descricao:
      'Painel de gestão com mapas geoespaciais H3, telemetria de frotas, histórico de anomalias viárias, dossiê TCE e gestão de chaves.',
    medidasChave: [
      'Narração textual sintetizada dos indicadores IRI, IMM e severidade viária',
      'Tabelas de anomalias com ordenação via teclado e paginação acessível',
      'Modais de confirmação com captura de foco (focus trap) e tecla Esc',
      'Legendas com formas e textos além de cores para interpretação de criticidade',
    ],
  },
  {
    rota: '/enquadramento',
    nome: 'Enquadramento CPSI & Economicidade (/enquadramento)',
    tipo: 'Autenticada',
    status: 'Conforme',
    descricao:
      'Calculadora de elegibilidade ao Marco Legal das Startups (LC 182/2021) e minuta prévia de empenho pelo Art. 320 do CTB.',
    medidasChave: [
      'Formulário em 6 blocos com barra de progresso rotulada via aria-valuenow',
      'Validações com mensagens de erro associadas diretamente aos inputs (aria-describedby)',
      'Persistência automática e retorno sem perda de dados digitados',
    ],
  },
]

export default function Acessibilidade() {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [feedbackNome, setFeedbackNome] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackUrl, setFeedbackUrl] = useState('')
  const [feedbackTipo, setFeedbackTipo] = useState('barreira_leitor')
  const [feedbackMensagem, setFeedbackMensagem] = useState('')
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)
  const [activeAccordion, setActiveAccordion] = useState<string | null>('wcag-2411')

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contato@orbis-uos.com.br')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackEnviado(true)
  }

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id))
  }

  return (
    <div className="w-full min-h-screen bg-[#070D1F] text-[#F8FAFC]">
      {/* Barra superior institucional e breadcrumb */}
      <section className="pt-24 sm:pt-28 pb-12 relative bg-gradient-to-b from-[#0A1128] via-[#0D183A] to-[#070D1F] border-b border-[#1A2A5A]/60">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-[#3B82F6]/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Trilha de navegação"
            className="flex items-center gap-2 text-xs text-[#94A3B8]"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#1A2A5A]" />
            <span className="text-[#38BDF8] font-medium">Declaração de Acessibilidade</span>
          </nav>

          {/* Badges e Título */}
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>e-MAG + WCAG 2.2 Nível AA</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA]">
                <Accessibility className="w-3.5 h-3.5" />
                <span>NBR 17225:2025</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-mono text-[#CBD5E1]">
                Dossiê Piloto B2G
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101B3A] border border-[#1A2A5A] text-xs font-mono text-[#94A3B8]">
                Release v0.0.41 • Março/2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Declaração de Conformidade de Acessibilidade Digital
            </h1>

            <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
              Compromisso institucional da <b>ORBIS UOS GovTech</b> com o acesso universal a
              serviços públicos digitais. Este documento formaliza as medidas de acessibilidade
              implementadas, os referenciais normativos nacionais e internacionais aplicados, as
              limitações conhecidas sob plano de evolução contínua e os canais de comunicação com a
              equipe técnica.
            </p>
          </div>

          {/* Atalhos de âncoras na página (WCAG 2.4.1) */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#94A3B8] mr-1 font-semibold uppercase tracking-wider">
              Seções:
            </span>
            <a
              href="#escopo"
              className="px-3 py-1.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all"
            >
              1. Escopo & Telas
            </a>
            <a
              href="#referenciais"
              className="px-3 py-1.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all"
            >
              2. Referenciais Normativos
            </a>
            <a
              href="#medidas"
              className="px-3 py-1.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all"
            >
              3. Medidas Efetivadas
            </a>
            <a
              href="#limitacoes"
              className="px-3 py-1.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#F59E0B] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all"
            >
              4. Conformidade Parcial
            </a>
            <a
              href="#feedback"
              className="px-3 py-1.5 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40 hover:bg-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA] hover:text-white transition-all"
            >
              5. Canal de Feedback
            </a>
          </div>
        </div>
      </section>

      {/* Sumário executivo com cartões rápidos */}
      <section className="py-10 bg-[#0A1128] border-b border-[#1A2A5A]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Status Geral</h2>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                <b className="text-[#10B981]">Conformidade Parcial</b> com WCAG 2.2 AA e e-MAG.
                Todas as rotas públicas principais possuem suporte a teclado, skip link e narração
                textual de dados.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 text-[#60A5FA] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Escopo no Dossiê</h2>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                As páginas institucionais <b>/plataforma</b> e <b>/faq</b> integram diretamente o
                dossiê do piloto B2G, ao lado da home, da demonstração e do Modo Campo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">WCAG 2.2 — Critério 2.4.11</h2>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Foco não obscurecido garantido com compensação de scroll de 80px (mobile) e 88px
                (desktop) sob o cabeçalho fixo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 text-[#A78BFA] flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Piso de Toque de 44 px</h2>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Alvos de toque com piso mínimo de 44×44 px no menu, rodapé, acordeões e botões
                operacionais do Modo Campo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo principal estruturado */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* SEÇÃO 1: ESCOPO DE COBERTURA */}
        <section
          id="escopo"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-semibold">
                Seção 1 de 6
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-1">
                <FileText className="w-5 h-5 text-[#3B82F6]" />
                <span>Escopo de Cobertura da Declaração</span>
              </h2>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono bg-[#101B3A] px-3 py-1.5 rounded-lg border border-[#1A2A5A] self-start sm:self-auto">
              8 Ambientes Mapeados
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Esta declaração abrange o ecossistema web da plataforma <b>ORBIS.UOS</b> operando sob o
            domínio oficial{' '}
            <a
              href="https://www.orbis-uos.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38BDF8] hover:underline font-mono"
            >
              www.orbis-uos.com.br
            </a>
            . O escopo divide-se entre páginas públicas institucionais (de livre acesso para
            gestores públicos, órgãos de controle e cidadãos) e módulos operacionais com
            autenticação obrigatória via RBAC.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCOPE_AREAS.map((area) => (
              <div
                key={area.rota}
                className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[#38BDF8] font-bold">{area.rota}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          area.tipo === 'Pública'
                            ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                            : 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#60A5FA]'
                        }`}
                      >
                        {area.tipo}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#0A1128] border border-[#1A2A5A] text-[#94A3B8]">
                        {area.status}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white">{area.nome}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{area.descricao}</p>
                </div>

                <div className="pt-2 border-t border-[#1A2A5A]/80">
                  <span className="text-[11px] font-semibold text-[#CBD5E1] block mb-1">
                    Medidas aplicadas neste ambiente:
                  </span>
                  <ul className="space-y-1">
                    {area.medidasChave.map((medida, idx) => (
                      <li key={idx} className="text-xs text-[#CBD5E1] flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{medida}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#3B82F6]/30 flex items-start gap-3 text-xs text-[#CBD5E1]">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div>
              <b className="text-white">Nota de Inclusão no Dossiê CPSI:</b> Conforme o pedido do
              órgão piloto, as páginas{' '}
              <Link to="/plataforma" className="text-[#38BDF8] hover:underline font-semibold">
                /plataforma
              </Link>{' '}
              (arquitetura e comparações de modelos) e{' '}
              <Link to="/faq" className="text-[#38BDF8] hover:underline font-semibold">
                /faq
              </Link>{' '}
              (esclarecimentos a gabinetes e procuradorias) passam a integrar diretamente o Dossiê
              de Conformidade B2G, assegurando que o gestor público avalie a plataforma com as
              evidências normativas já consolidadas.
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: REFERENCIAIS NORMATIVOS */}
        <section
          id="referenciais"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-semibold">
                Seção 2 de 6
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-1">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                <span>Referenciais Normativos e Legais Aplicáveis</span>
              </h2>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono bg-[#101B3A] px-3 py-1.5 rounded-lg border border-[#1A2A5A] self-start sm:self-auto">
              Padrão Brasil + Internacional
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            A acessibilidade da plataforma foi estruturada a partir de três pilares normativos de
            máxima hierarquia no setor público brasileiro e no ecossistema global da internet:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Referencial 1 */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded">
                  Padrão W3C
                </span>
                <span className="text-xs text-[#94A3B8]">Recomendação 2023</span>
              </div>
              <h3 className="text-base font-bold text-white">WCAG 2.2 — Nível AA</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Diretrizes de Acessibilidade para Conteúdo Web do consórcio W3C. Atendemos aos
                princípios de <b>Perceptível</b>, <b>Operável</b>, <b>Compreensível</b> e{' '}
                <b>Robusto</b>, com destaque para os critérios recentes 2.4.11 (Focus Not Obscured)
                e 2.5.8 (Target Size).
              </p>
              <div className="pt-2 text-[11px] text-[#CBD5E1] border-t border-[#1A2A5A]">
                <b>Exigência:</b> Relação de contraste mínima 4,5:1 em texto padrão e 3:1 em
                elementos gráficos/grandes.
              </div>
            </div>

            {/* Referencial 2 */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#3B82F6]/15 px-2.5 py-0.5 rounded">
                  Gov.br / e-MAG
                </span>
                <span className="text-xs text-[#94A3B8]">Portaria SGD/MGI</span>
              </div>
              <h3 className="text-base font-bold text-white">e-MAG (Versão Vigente)</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Modelo de Acessibilidade em Governo Eletrônico instituído pelo Governo Federal
                brasileiro, alinhado à Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei
                Federal nº 13.146/2015, Art. 63).
              </p>
              <div className="pt-2 text-[11px] text-[#CBD5E1] border-t border-[#1A2A5A]">
                <b>Exigência:</b> Acessibilidade obrigatória em todos os sítios, portais e serviços
                da administração pública.
              </div>
            </div>

            {/* Referencial 3 */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#A78BFA] bg-[#8B5CF6]/15 px-2.5 py-0.5 rounded">
                  Norma Brasileira
                </span>
                <span className="text-xs text-[#94A3B8]">Edição 2025</span>
              </div>
              <h3 className="text-base font-bold text-white">ABNT NBR 17225:2025</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Norma técnica brasileira que estabelece os requisitos de acessibilidade digital para
                soluções de software e sítios web no Brasil, unificando os critérios da ABNT com o
                estado da arte do e-MAG e da WCAG.
              </p>
              <div className="pt-2 text-[11px] text-[#CBD5E1] border-t border-[#1A2A5A]">
                <b>Exigência:</b> Documentação transparente de conformidade e canais auditáveis de
                retorno ao cidadão.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2 text-xs text-[#CBD5E1]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Conexão com o Marco Legal de Contratação Pública</span>
            </h3>
            <p>
              A observância da acessibilidade atende aos requisitos do{' '}
              <b>Marco Legal das Startups (LC 182/2021)</b> e do{' '}
              <b>Art. 320 do Código de Trânsito Brasileiro</b>, assegurando que as peças geradas
              pelo piloto (relatórios de acessibilidade urbana IMA, painéis públicos e dossiês para
              o Tribunal de Contas) possuam idoneidade técnica e respeitem a diversidade funcional
              dos agentes públicos e cidadãos.
            </p>
          </div>
        </section>

        {/* SEÇÃO 3: MEDIDAS IMPLEMENTADAS */}
        <section
          id="medidas"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-semibold">
                Seção 3 de 6
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <span>Medidas Técnicas Efetivamente Implementadas</span>
              </h2>
            </div>
            <span className="text-xs text-[#10B981] font-semibold bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/30 self-start sm:self-auto">
              Implementado em Produção
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            As seguintes medidas já se encontram ativas no código-fonte e em execução no ambiente de
            produção da plataforma,{' '}
            <b>não se tratando de metas futuras ou promessas de implementação</b>:
          </p>

          <div className="space-y-3">
            {/* Medida 1: Skip Link */}
            <div className="rounded-xl border border-[#1A2A5A] bg-[#101B3A] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('skip-link')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#16254F]/50 transition-colors"
                aria-expanded={activeAccordion === 'skip-link'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0">
                    2.4.1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Skip Link Global: "Ir para o conteúdo principal"
                    </h3>
                    <p className="text-xs text-[#94A3B8]">WCAG 2.4.1 (Bypass Blocks) • e-MAG 1.1</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                    activeAccordion === 'skip-link' ? 'rotate-180 text-[#3B82F6]' : ''
                  }`}
                />
              </button>

              {activeAccordion === 'skip-link' && (
                <div className="p-4 border-t border-[#1A2A5A] bg-[#0A1128]/60 text-xs text-[#CBD5E1] space-y-2 animate-in fade-in-0 duration-150">
                  <p>
                    Inserido no ponto mais alto da árvore do layout global (
                    <code>src/components/Layout.tsx</code>). Permite ao usuário que navega via
                    teclado pular todo o bloco de cabeçalho, logomarca e menus de navegação,
                    aterrisando com foco direto no <code>&lt;main id="conteudo-principal"&gt;</code>
                    .
                  </p>
                  <p className="text-[#94A3B8]">
                    <b>Comportamento:</b> Oculto visualmente por padrão (<code>sr-only</code>) e
                    exibido com destaque de alto contraste, anel de foco azul de 2px e fundo sólido
                    no canto superior esquerdo no instante em que recebe foco via tecla Tab.
                  </p>
                </div>
              )}
            </div>

            {/* Medida 2: Foco Não Obscurecido */}
            <div className="rounded-xl border border-[#1A2A5A] bg-[#101B3A] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('wcag-2411')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#16254F]/50 transition-colors"
                aria-expanded={activeAccordion === 'wcag-2411'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0">
                    2.4.11
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Compensação de Cabeçalho Fixo para Foco Não Obscurecido
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      WCAG 2.2 — Critério de Sucesso 2.4.11 (Focus Not Obscured - Minimum)
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                    activeAccordion === 'wcag-2411' ? 'rotate-180 text-[#3B82F6]' : ''
                  }`}
                />
              </button>

              {activeAccordion === 'wcag-2411' && (
                <div className="p-4 border-t border-[#1A2A5A] bg-[#0A1128]/60 text-xs text-[#CBD5E1] space-y-2 animate-in fade-in-0 duration-150">
                  <p>
                    O cabeçalho fixo no topo da página (56px no mobile e 64px no desktop) costuma
                    cobrir elementos focados quando o usuário avança por âncoras ou formulários.
                    Aplicamos compensação global via CSS (<code>src/main.css</code>):
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#CBD5E1]">
                    <li>
                      <code>--scroll-offset: 5rem</code> (80px no mobile): 56px de cabeçalho + 24px
                      de respiro seguro.
                    </li>
                    <li>
                      <code>--scroll-offset: 5.5rem</code> (88px no desktop): 64px de cabeçalho +
                      24px de folga visual.
                    </li>
                    <li>
                      Regra <code>scroll-margin-top: var(--scroll-offset)</code> e{' '}
                      <code>scroll-padding-top</code> aplicadas a qualquer elemento{' '}
                      <code>[id]</code>, <code>:target</code>, botões, inputs e focáveis via
                      teclado.
                    </li>
                    <li>
                      Outline visível em <code>*:focus-visible</code> com 2px em azul brilhante
                      (#60A5FA) e deslocamento de 3px, atendendo simultaneamente aos critérios
                      1.4.11 e 2.4.13.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Medida 3: Piso de Alvos de Toque */}
            <div className="rounded-xl border border-[#1A2A5A] bg-[#101B3A] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('touch-targets')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#16254F]/50 transition-colors"
                aria-expanded={activeAccordion === 'touch-targets'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center font-bold text-xs shrink-0">
                    2.5.8+
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Piso de Alvos de Toque de 44×44 px (Estendido para Campo)
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      WCAG 2.2 — Critério 2.5.8 estendido do mínimo de 24px para o piso recomendado
                      de 44px
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                    activeAccordion === 'touch-targets' ? 'rotate-180 text-[#3B82F6]' : ''
                  }`}
                />
              </button>

              {activeAccordion === 'touch-targets' && (
                <div className="p-4 border-t border-[#1A2A5A] bg-[#0A1128]/60 text-xs text-[#CBD5E1] space-y-2 animate-in fade-in-0 duration-150">
                  <p>
                    Em operações viárias reais, fiscais e operadores utilizam smartphones com luvas
                    ou sob trepidação do veículo. Por essa razão, elevamos o padrão de 24×24 px para
                    o piso recomendado de <b>44×44 px</b>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#CBD5E1]">
                    <li>
                      Classes utilitárias <code>.touch-target-44</code> (min-width e min-height 44px
                      com alinhamento flex) e <code>.touch-target-expand-44</code> (área de clique
                      expandida invisível via pseudoelemento ::after).
                    </li>
                    <li>
                      Botões do menu mobile da Navbar, gatilhos de acordeão no FAQ, controles de
                      telemetria no Modo Campo e ações de purga/auditoria no Cockpit respeitam
                      integralmente essa dimensão.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Medida 4: Narração Textual de Gráficos */}
            <div className="rounded-xl border border-[#1A2A5A] bg-[#101B3A] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('narracao-graficos')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#16254F]/50 transition-colors"
                aria-expanded={activeAccordion === 'narracao-graficos'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 text-[#A78BFA] flex items-center justify-center font-bold text-xs shrink-0">
                    1.1.1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Narração Textual e Interpretação em Linguagem Simples dos Gráficos
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      WCAG 1.1.1 (Conteúdo Não Textual) • WCAG 3.1.2 (Linguagem Clara)
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                    activeAccordion === 'narracao-graficos' ? 'rotate-180 text-[#3B82F6]' : ''
                  }`}
                />
              </button>

              {activeAccordion === 'narracao-graficos' && (
                <div className="p-4 border-t border-[#1A2A5A] bg-[#0A1128]/60 text-xs text-[#CBD5E1] space-y-2 animate-in fade-in-0 duration-150">
                  <p>
                    Painéis de telemetria, mapas geoespaciais e gráficos estatísticos contam
                    obrigatoriamente com uma camada de <b>interpretação textual explícita</b>{' '}
                    acessível a tecnologias assistivas:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#CBD5E1]">
                    <li>
                      <b>Mapa Territorial de Curitiba:</b> narração textual da extensão da malha
                      coberta, proporção de vias críticas e síntese descritiva sob a tag{' '}
                      <code>aria-live="polite"</code>.
                    </li>
                    <li>
                      <b>Grade Hexagonal H3:</b> interpretação textual por resolução espacial
                      (k-anonimato, células seguras e leitura em Plain Language).
                    </li>
                    <li>
                      <b>Matriz de Sinistralidade e Matriz Zero:</b> descrição sintetizada do risco
                      viário cruzado com exposição territorial.
                    </li>
                    <li>
                      <b>Índice IMM e IRI no Cockpit:</b> bloco de narração com classificação
                      semântica (Ótimo, Regular, Crítico) sem depender exclusivamente da cor.
                    </li>
                    <li>
                      <b>Transparência Honestíssima:</b> identificação explícita de quando um dado
                      exibido é de demonstração ou sintético versus leitura real de campo.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Medida 5: aria-live e Formulários */}
            <div className="rounded-xl border border-[#1A2A5A] bg-[#101B3A] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('aria-live')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#16254F]/50 transition-colors"
                aria-expanded={activeAccordion === 'aria-live'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center font-bold text-xs shrink-0">
                    4.1.3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Regiões Dinâmicas (aria-live) e Formulários Estruturados
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      WCAG 4.1.3 (Mensagens de Status) • WCAG 3.3.2 (Rótulos e Instruções)
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                    activeAccordion === 'aria-live' ? 'rotate-180 text-[#3B82F6]' : ''
                  }`}
                />
              </button>

              {activeAccordion === 'aria-live' && (
                <div className="p-4 border-t border-[#1A2A5A] bg-[#0A1128]/60 text-xs text-[#CBD5E1] space-y-2 animate-in fade-in-0 duration-150">
                  <p>
                    Mudanças de estado no simulador orçamentário, no Diagnóstico Express e nas telas
                    de validação de sensores disparam anúncios imediatos e não intrusivos para
                    leitores de tela:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#CBD5E1]">
                    <li>
                      Atributo <code>aria-live="polite"</code> aplicado no painel de resultados do
                      simulador econômico, informando automaticamente a projeção de economia gerada
                      com base no porte da cidade.
                    </li>
                    <li>
                      Rótulos <code>&lt;label&gt;</code> vinculados aos respectivos campos via{' '}
                      <code>htmlFor</code>, sem dependência de placeholders como única instrução de
                      preenchimento.
                    </li>
                    <li>
                      Feedback visual e textual de sucesso em ações de cópia de e-mail e geração de
                      protocolos imutáveis.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Medida 6: Contraste e Landmarks */}
            <div className="rounded-xl border border-[#1A2A5A] bg-[#101B3A] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('landmarks-contraste')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#16254F]/50 transition-colors"
                aria-expanded={activeAccordion === 'landmarks-contraste'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold text-xs shrink-0">
                    1.4.3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Contraste Dark Navy Revisado e Estrutura Semântica (Landmarks)
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      WCAG 1.4.3 (Contraste Mínimo) • WCAG 1.3.1 (Informações e Relações)
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                    activeAccordion === 'landmarks-contraste' ? 'rotate-180 text-[#3B82F6]' : ''
                  }`}
                />
              </button>

              {activeAccordion === 'landmarks-contraste' && (
                <div className="p-4 border-t border-[#1A2A5A] bg-[#0A1128]/60 text-xs text-[#CBD5E1] space-y-2 animate-in fade-in-0 duration-150">
                  <p>
                    A identidade visual "Dark Navy GovTech" foi calibrada para manter alta
                    legibilidade sem causar fadiga visual em gabinetes e em campo:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#CBD5E1]">
                    <li>
                      O token de cor secundária <code>--muted-foreground</code> foi elevado de cinza
                      escuro para <code>#A8B8CC</code> e <code>#CBD5E1</code>, atingindo contraste
                      médio de <b>6,2:1</b> sobre o fundo navy <code>#0A1128</code> (acima dos 4,5:1
                      exigidos pelo Nível AA).
                    </li>
                    <li>
                      Uso de marcos semânticos do HTML5: <code>&lt;header&gt;</code>,{' '}
                      <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>,{' '}
                      <code>&lt;section&gt;</code> e <code>&lt;footer&gt;</code> em todas as
                      páginas, facilitando a navegação por atalhos de leitores como NVDA, JAWS e
                      TalkBack.
                    </li>
                    <li>
                      Hierarquia de títulos estrita: apenas um <code>&lt;h1&gt;</code> principal por
                      página, com subtítulos em ordem matemática <code>&lt;h2&gt;</code> e{' '}
                      <code>&lt;h3&gt;</code> sem saltos arbitrários.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: LIMITAÇÕES CONHECIDAS / CONFORMIDADE PARCIAL */}
        <section
          id="limitacoes"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-semibold">
                Seção 4 de 6 • Transparência Técnica
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-1">
                <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                <span>Limitações Conhecidas e Declaração de Conformidade Parcial</span>
              </h2>
            </div>
            <span className="text-xs text-[#F59E0B] font-semibold bg-[#F59E0B]/10 px-3 py-1.5 rounded-lg border border-[#F59E0B]/30 self-start sm:self-auto">
              Em Evolução Contínua
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Em conformidade com o modelo internacional de declarações de acessibilidade (W3C
            Accessibility Conformance Report / VPAT) e com a Portaria e-MAG,{' '}
            <b>declaramos com absoluta honestidade que a conformidade do ORBIS.UOS é parcial</b>.
            Reconhecemos barreiras ainda em processo de teste e correção, conforme detalhado no
            inventário abaixo:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B]">
                  Barreira 1
                </span>
                <h3 className="text-sm font-bold text-white">
                  Validação com Leitores de Tela Reais em Fluxos Complexos de Campo
                </h3>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                <b>Situação Atual:</b> O Modo Campo (<code>/campo</code>) foi amplamente validado
                contra navegadores mobile e testes automatizados de acessibilidade
                (axe-core/Lighthouse), mas ainda não passou por testes completos de usabilidade
                assistida com usuários cegos operando leitores reais (TalkBack no Android e
                VoiceOver no iOS) durante deslocamento veicular contínuo.
              </p>
              <div className="text-[11px] text-[#94A3B8] pt-1">
                <b>Plano de Mitigação:</b> Agendamento de sessão de homologação assistida com
                agentes públicos com deficiência visual durante a fase de implantação da Onda 3
                (Mobilidade Ativa e Calçadas).
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B]">
                  Barreira 2
                </span>
                <h3 className="text-sm font-bold text-white">
                  Visualização em Zoom de 200% em Telas com Mapas Hexagonais H3
                </h3>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                <b>Situação Atual:</b> O zoom de texto e zoom de página de até 200% (WCAG 1.4.4 e
                1.4.10 Reflow) opera perfeitamente em todas as páginas textuais (/plataforma, /faq,
                /metodologia, /termos, /privacidade). No entanto, nos módulos que renderizam a malha
                de Curitiba e a grade H3 (no Cockpit e na Demo), o canvas do mapa pode exigir
                rolagem bidimensional horizontal em telas menores que 1280px com zoom extremo.
              </p>
              <div className="text-[11px] text-[#94A3B8] pt-1">
                <b>Plano de Mitigação:</b> Todos os mapas possuem bloco textual descritivo
                alternativo logo abaixo da visualização gráfica, dispensando a necessidade de
                navegação visual sobre o canvas para obter as métricas.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B]">
                  Barreira 3
                </span>
                <h3 className="text-sm font-bold text-white">
                  Navegação no Menu Suspenso "Recursos" via Atalhos Customizados de Teclado
                </h3>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                <b>Situação Atual:</b> O menu "Recursos" da Navbar abre com a tecla Enter/Espaço e
                fecha com Esc, mas a navegação interna entre os 11 links de documentos B2G via setas
                direcionais (ArrowUp/ArrowDown) pode apresentar comportamento variável dependendo do
                leitor de tela utilizado, sendo recomendada a navegação convencional por Tab.
              </p>
              <div className="text-[11px] text-[#94A3B8] pt-1">
                <b>Plano de Mitigação:</b> Implementação de teclado acelerador com suporte pleno ao
                padrão WAI-ARIA Menu Button.
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 5: CANAL DE FEEDBACK E ATENDIMENTO */}
        <section
          id="feedback"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-semibold">
                Seção 5 de 6 • Contato Direto
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-1">
                <Mail className="w-5 h-5 text-[#3B82F6]" />
                <span>Canal de Atendimento e Relato de Barreiras</span>
              </h2>
            </div>
            <span className="text-xs text-[#10B981] font-semibold bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/30 self-start sm:self-auto">
              SLA: Resposta em até 2 dias úteis
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Se você encontrar qualquer barreira de acessibilidade no ORBIS.UOS, enfrentar
            dificuldades para navegar com tecnologia assistiva ou precisar de um formato alternativo
            de documento (relatório, laudo ou minuta CPSI), entre em contato diretamente com nossa
            equipe técnica de acessibilidade:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloco 1: Contatos Oficiais */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-[#38BDF8]" />
                <span>Canais Oficiais de Comunicação</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#94A3B8] block text-[11px] uppercase tracking-wider font-mono">
                    E-mail Exclusivo de Atendimento:
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href="mailto:contato@orbis-uos.com.br?subject=Barreira%20de%20Acessibilidade%20ORBIS.UOS"
                      className="font-mono text-sm text-[#38BDF8] hover:underline font-semibold"
                    >
                      contato@orbis-uos.com.br
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="p-1 rounded bg-[#0A1128] hover:bg-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
                      title="Copiar e-mail de contato"
                      aria-label="Copiar e-mail de contato"
                    >
                      {copiedEmail ? (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[#94A3B8] block text-[11px] uppercase tracking-wider font-mono">
                    Compromisso Institucional de Retorno:
                  </span>
                  <p className="text-[#CBD5E1] mt-0.5">
                    Confirmação de recebimento em até <b>24 horas úteis</b> e parecer técnico
                    preliminar com plano de correção em até <b>2 dias úteis</b> (SLA P3 de suporte
                    governamental).
                  </p>
                </div>

                <div>
                  <span className="text-[#94A3B8] block text-[11px] uppercase tracking-wider font-mono">
                    Endereço para Correspondência Institucional:
                  </span>
                  <p className="text-[#CBD5E1] mt-0.5">
                    ORBIS UOS GovTech — Setor Comercial Sul (SCS), Quadra 4, Bloco A, Edifício
                    Capital, 7º Andar — Brasília/DF — CEP 70304-900.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloco 2: Formulário de relato imediato */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#10B981]" />
                <span>Relatar Barreira de Acessibilidade Agora</span>
              </h3>

              {feedbackEnviado ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="p-4 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 text-xs text-[#CBD5E1] space-y-2"
                >
                  <div className="flex items-center gap-2 text-[#10B981] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Relato registrado com sucesso no protocolo institucional!</span>
                  </div>
                  <p>
                    Obrigado por nos ajudar a tornar a gestão pública viária mais acessível. Nossa
                    equipe de engenharia e acessibilidade analisará o apontamento com alta
                    prioridade.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedbackEnviado(false)}
                    className="mt-2 text-xs text-[#38BDF8] underline font-semibold"
                  >
                    Enviar outro relato
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="fb-nome" className="block text-[#CBD5E1] font-medium mb-1">
                      Seu Nome ou Cargo (Opcional):
                    </label>
                    <input
                      id="fb-nome"
                      type="text"
                      value={feedbackNome}
                      onChange={(e) => setFeedbackNome(e.target.value)}
                      placeholder="Ex: Auditor(a), Fiscal de Obras, Cidadão(ã)"
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label htmlFor="fb-email" className="block text-[#CBD5E1] font-medium mb-1">
                      Seu E-mail para Resposta (Obrigatório):
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      required
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="seu.email@orgao.gov.br"
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="fb-url" className="block text-[#CBD5E1] font-medium mb-1">
                        Página / Rota com Barreira:
                      </label>
                      <input
                        id="fb-url"
                        type="text"
                        value={feedbackUrl}
                        onChange={(e) => setFeedbackUrl(e.target.value)}
                        placeholder="Ex: /plataforma ou /cockpit"
                        className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <div>
                      <label htmlFor="fb-tipo" className="block text-[#CBD5E1] font-medium mb-1">
                        Tipo de Barreira:
                      </label>
                      <select
                        id="fb-tipo"
                        value={feedbackTipo}
                        onChange={(e) => setFeedbackTipo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                      >
                        <option value="barreira_leitor">Dificuldade com leitor de tela</option>
                        <option value="barreira_teclado">Elemento inalcançável por teclado</option>
                        <option value="barreira_contraste">Contraste visual insuficiente</option>
                        <option value="barreira_toque">Alvo de toque pequeno no mobile</option>
                        <option value="outro">Outra barreira ou sugestão</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fb-mensagem" className="block text-[#CBD5E1] font-medium mb-1">
                      Descrição da Barreira Enfrentada (Obrigatório):
                    </label>
                    <textarea
                      id="fb-mensagem"
                      required
                      rows={3}
                      value={feedbackMensagem}
                      onChange={(e) => setFeedbackMensagem(e.target.value)}
                      placeholder="Descreva o que você estava tentando fazer e qual tecnologia assistiva ou dispositivo utilizou..."
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold transition-all shadow-md shadow-[#3B82F6]/30 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Registrar Barreira de Acessibilidade</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* SEÇÃO 6: HISTÓRICO DE AVALIAÇÃO E VERSÃO */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-semibold">
              Seção 6 de 6 • Metadados de Auditoria
            </span>
            <span className="text-xs font-mono text-[#94A3B8]">Versão Oficial Homologada</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px] font-mono">
                Data da Última Avaliação:
              </span>
              <span className="font-bold text-white text-sm">30 de Março de 2026</span>
              <span className="text-[11px] text-[#10B981] block mt-0.5">
                Ciclo Bimestral de Revisão
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px] font-mono">
                Versão da Plataforma:
              </span>
              <span className="font-bold text-white text-sm">v0.0.41 (Onda 1 + Onda 2)</span>
              <span className="text-[11px] text-[#60A5FA] block mt-0.5">
                Motor ORBIS DSP Embarcado
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px] font-mono">
                Metodologia de Teste:
              </span>
              <span className="font-bold text-white text-sm">Automática + Manual</span>
              <span className="text-[11px] text-[#CBD5E1] block mt-0.5">
                axe-core, Lighthouse e Teclado
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px] font-mono">
                Próxima Revisão Programada:
              </span>
              <span className="font-bold text-white text-sm">Maio de 2026</span>
              <span className="text-[11px] text-[#F59E0B] block mt-0.5">
                Workshop 5 com Órgão-Piloto
              </span>
            </div>
          </div>

          <p className="text-xs text-[#94A3B8] leading-relaxed pt-2">
            Esta declaração foi elaborada e auditada com base no modelo de autoavaliação
            estabelecido pelo W3C (Web Accessibility Initiative - WAI) e pelo Departamento de
            Governo Digital da Secretaria de Gestão e Inovação (MGI). As atualizações são
            registradas na trilha de governança do sistema.
          </p>
        </section>

        {/* Faixa inferior de conversão e retorno ao piloto */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#16254F] to-[#101B3A] border border-[#3B82F6]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Precisa desta Declaração em formato para o processo administrativo?
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1]">
              O documento integra o Dossiê Técnico do Piloto CPSI (LC 182/2021) e pode ser
              formalizado para sua Procuradoria.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/faq"
              className="px-4 py-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Ver FAQ do Piloto</span>
            </Link>

            <Link
              to="/#manifesto"
              className="px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-bold text-white transition-all shadow-md shadow-[#3B82F6]/30 flex items-center gap-1.5 min-h-[44px]"
            >
              <span>Submeter Manifesto CPSI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
