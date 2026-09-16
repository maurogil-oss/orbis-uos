import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react'

export function FAQ() {
  const faqs = [
    {
      id: 'item-1',
      badge: 'Zero CAPEX & Hardware Passivo',
      question:
        'A prefeitura precisa comprar câmeras, radares ou furar as vias para instalar sensores físicos?',
      answer:
        'Não. A arquitetura da Orbis UOS é 100% Zero CAPEX e opera no modelo Software como Serviço (SaaS). A captação de dados inerciais é realizada pela frota pública já em circulação (ônibus do transporte coletivo, caminhões de coleta de resíduos e viaturas municipais) através de sensores embarcados em smartphones convencionais fixados nos veículos. Não há nenhuma necessidade de obras civis, postes dedicados, câmeras ópticas ou caixas pretas proprietárias na via pública.',
    },
    {
      id: 'item-2',
      badge: 'Marco Legal Startups (LC 182/2021)',
      question:
        'Como funciona a contratação do Piloto de 90 dias via CPSI sem a demora das licitações tradicionais?',
      answer:
        'O Contrato Público para Solução Inovadora (CPSI), instituído pela Lei Complementar nº 182/2021 (Marco Legal das Startups), foi criado especificamente para permitir que a administração pública teste e valide tecnologias antes de contratações de escala. O processo é simplificado, ágil (em média 2 a 3 semanas) e possui escopo pré-definido com teto de até 90 dias e baixo valor financeiro, sem risco de questionamento pelo erário.',
    },
    {
      id: 'item-3',
      badge: 'Proteção no TCE & Artigo 320 CTB',
      question:
        'O Tribunal de Contas (TCE) aprova o custeio da plataforma com receitas do Fundo Municipal de Multas?',
      answer:
        'Sim, com segurança total. O Artigo 320 do Código de Trânsito Brasileiro determina expressamente que a receita de multas deve ser aplicada exclusivamente em sinalização, engenharia de tráfego, de campo, policiamento e fiscalização. Como a Orbis gera auditoria asfáltica, rugosidade métrica (IRI) e otimização semafórica (engenharia viária), fornecemos dossiês técnicos com carimbo de integridade e nexo causal georreferenciado 100% aderentes às exigências dos Tribunais de Contas estaduais e Procuradorias.',
    },
    {
      id: 'item-4',
      badge: '100% LGPD & Anonimização',
      question:
        'Como a plataforma garante conformidade com a LGPD e o Ministério Público sem captar dados pessoais?',
      answer:
        'Por privacidade por design, o sistema não utiliza câmeras de rua, não fotografa motoristas, não lê placas de trânsito e não armazena biometria facial de pedestres. A telemetria capta estritamente dados físicos mecânicos do pavimento: acelerações inerciais no eixo vertical (Z), atrito, frequência vibracional e coordenadas geográficas das anomalias da pista. Não há coleta nem retenção de dados pessoais identificáveis.',
    },
    {
      id: 'item-5',
      badge: 'Resultados em 7 Dias',
      question:
        'Em quanto tempo a Secretaria de Obras e Mobilidade começa a receber os mapas de calor e relatórios?',
      answer:
        'A partir da instalação dos smartphones nos primeiros veículos da frota municipal (processo que leva menos de 48 horas), os dados começam a fluir para o cockpit em nuvem no mesmo dia. Em até 7 dias úteis de circulação regular, o algoritmo do gêmeo digital já consolida o mapa preliminar de rugosidade IRI e o ranking de prioridades para recapeamento preventivo.',
    },
  ]

  const scrollToPilot = () => {
    const el = document.getElementById('piloto')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-24 relative bg-[#070D1F] border-t border-[#1A2A5A]/50">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
            <HelpCircle className="w-3.5 h-3.5" />
            Dúvidas Estratégicas Frequentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Perguntas dos Prefeitos, Secretários & Procuradores
          </h2>
          <p className="text-base text-[#94A3B8]">
            Esclarecimentos diretos sobre aspectos técnicos, operacionais inerciais e conformidade
            jurídica da contratação pública.
          </p>
        </div>

        {/* Accordion List */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border border-[#1A2A5A] rounded-2xl bg-[#101B3A] px-6 py-2 shadow-lg shadow-black/10 data-[state=open]:border-[#3B82F6]/60 transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pr-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] bg-[#0A1128] px-2.5 py-1 rounded-md border border-[#1A2A5A] shrink-0 w-fit">
                    {faq.badge}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">
                    {faq.question}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 text-sm text-[#94A3B8] leading-relaxed border-t border-[#1A2A5A]/60 mt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Bottom Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#101B3A]/60 border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#F8FAFC] flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Deseja receber a minuta do Termo de Referência CPSI para análise da PGM?
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Fornecemos minuta técnica, justificativa legal e modelos de enquadramento ao Art. 320
              do CTB prontos para procuradorias municipais.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToPilot}
            className="shrink-0 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 transition-all flex items-center gap-1.5"
          >
            Solicitar Minuta Jurídica
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
