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
      badge: 'SDK Edge & Consumo 1,2–1,8%/h',
      question: 'Por que o SDK Edge consome tão pouca bateria (1,2–1,8% por hora)?',
      answer:
        'Porque todo o processamento espectral (janelamento Hanning + FFT Radix-2 de aceleração vertical Z) acontece localmente no smartphone, isolando a banda relevante de 1 a 20 Hz e descartando 99,8% do ruído em repouso. O dispositivo não faz streaming pesado de dados brutos; apenas transmite a assinatura do evento (poucos bytes) no instante exato da anomalia. Um turno de 8 horas consome entre 10% e 15% de bateria.',
    },
    {
      id: 'item-2',
      badge: 'Arquitetura por Porte de Cidade',
      question: 'Qual a diferença entre a contratação para Cidade Pequena, Média e Grande?',
      answer:
        'Para Cidades Pequenas (até ~50k hab.), oferecemos pacote único e fechado com telemetria na frota existente, mapa de asfalto, one-page do prefeito e dossiê pronto, com IA pré-calibrada "modo cidade pequena" (sem thresholds complexos para o cliente calibrar). Para Cidades Médias (~50k–300k), adiciona-se Central 156+ preditiva, gestão de OS e insumos semafóricos do Green Light Bridge (Onda 2). Para Cidades Grandes (300k+), camada de KPIs por corredor, padrão ISO 37120/37122/37125 e dados para financiamentos internacionais (BID/BNDES).',
    },
    {
      id: 'item-3',
      badge: 'Proteção no TCE & Artigo 320 CTB',
      question: 'Como o Dossiê TCE em 1 clique assegura o custeio via Fundo Municipal de Multas?',
      answer:
        'O Artigo 320 do Código de Trânsito Brasileiro determina expressamente que a receita de multas seja aplicada exclusivamente em sinalização, engenharia de tráfego, policiamento e fiscalização. O ORBIS.UOS gera no cockpit o Dossiê TCE pré-formatado com nexo causal georreferenciado e carimbo criptográfico, comprovando aos auditores que o monitoramento inercial e a correção preventiva da via constituem estrita engenharia viária de proteção à vida.',
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
                  <span className="text-xs uppercase tracking-wider text-[#3B82F6] bg-[#0A1128] px-2.5 py-1 rounded-md border border-[#1A2A5A] shrink-0 w-fit font-semibold">
                    {faq.category}
                  </span>{' '}
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
