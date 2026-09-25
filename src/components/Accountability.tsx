import React from 'react'
import {
  Users,
  ShieldCheck,
  Newspaper,
  CheckCircle2,
  FileCheck2,
  HeartHandshake,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  SearchCheck,
  Building,
  HelpCircle,
} from 'lucide-react'

export function Accountability() {
  const scrollToManifesto = () => {
    const el = document.getElementById('manifesto') || document.getElementById('piloto')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const audiences = [
    {
      id: 'cidadao',
      icon: Users,
      badge: 'Transparência Ativa',
      title: 'O Cidadão',
      subtitle: 'Acompanha o reparo da sua rua com dignidade e previsibilidade',
      accent: '#10B981',
      description:
        'A zeladoria deixa de ser uma promessa abstrata ou protocolo esquecido. O cidadão visualiza intervenções reais, entende a priorização técnica da prefeitura e vê os recursos dos seus impostos retornando em asfalto trafegável, calçadas acessíveis e vias seguras.',
      points: [
        'Portal aberto com consulta direta da situação das vias e ordens de serviço',
        'Previsibilidade técnica para intervenções na porta de residências e comércios',
        'Menos desgastes e prejuízos com suspensão de veículos, bicicletas e transporte coletivo',
      ],
      quote:
        '“O cidadão não quer discursos: quer saber quando o buraco na sua rua será corrigido com qualidade duradoura.”',
    },
    {
      id: 'controle',
      icon: ShieldCheck,
      badge: 'Integridade Pública & Cortes de Contas',
      title: 'O Controle',
      subtitle: 'Dossiês auditáveis com hash de integridade, TCE, MP e Controladorias',
      accent: '#3B82F6',
      description:
        'O sistema se oferece ativamente para ser fiscalizado. Cada quilômetro monitorado gera um registro inalterável com carimbo de tempo, nexo causal georreferenciado e comprovação estrita de destinação orçamentária no Art. 320 do CTB e LRF.',
      points: [
        'Exportação de Dossiê TCE em um clique com hash SHA-256 e assinatura digital',
        'Nexo causal indiscutível entre a arrecadação de trânsito e as obras de segurança viária',
        'Proteção integral contra glosas, apontamentos por prevaricação ou compras emergenciais infladas',
      ],
      quote:
        '“O gestor decide; o sistema documenta. Total tranquilidade para o prefeito, o secretário e a procuradoria jurídica.”',
    },
    {
      id: 'imprensa',
      icon: Newspaper,
      badge: 'Dados Verificáveis',
      title: 'A Imprensa & Sociedade Civil',
      subtitle: 'Dados públicos abertos, auditáveis e cientificamente embasados',
      accent: '#818CF8',
      description:
        'Fim da disputa de narrativas sobre a qualidade do pavimento. Indicadores calculados segundo métodos consagrados de engenharia de transportes (IRI, FFT de aceleração vertical) e metodologia pública auditável.',
      points: [
        'Métricas públicas mensuráveis sem distorções de comunicação partidária',
        'Painéis de interesse público para acompanhamento de metas municipais e do PPA',
        'Redução drástica de requerimentos via Lei de Acesso à Informação (LAI) por antecipação de dados',
      ],
      quote:
        '“Informação pública de qualidade combate boatos e comprova com fatos onde o recurso público foi empenhado.”',
    },
  ]

  const societyOutcomes = [
    {
      icon: HeartHandshake,
      title: 'Vias Seguras para Pedestres e Ciclistas',
      description:
        'Pavimento nivelado e sinalização visível reduzem quedas de idosos, acidentes com ciclistas e colisões decorrentes de desvios repentinos de buracos.',
    },
    {
      icon: Clock,
      title: 'Menos Tempo Parado no Trânsito',
      description:
        'Com asfalto contínuo e sincronismo semafórico, linhas de ônibus mantêm a regularidade e os trabalhadores retornam mais cedo para suas famílias.',
    },
    {
      icon: ShieldAlert,
      title: 'Socorro e Serviços Essenciais sem Obstáculos',
      description:
        'Ambulâncias do SAMU, viaturas de polícia e caminhões de bombeiros trafegam com rapidez e segurança até bairros periféricos e vias arteriais.',
    },
    {
      icon: Building,
      title: 'Recurso Público Aplicado Onde Mais Precisa',
      description:
        'Critério puramente técnico que destina asfalto por índice de severidade e fluxo de pessoas, erradicando o favorecimento eleitoreiro de vias.',
    },
  ]

  return (
    <section
      id="prestacao-contas"
      className="py-24 relative bg-[#070D1F] border-t border-[#1A2A5A]/50 scroll-mt-20"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#3B82F6]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#10B981]">
            <SearchCheck className="w-3.5 h-3.5" />
            Accountability & Gestão Pública Responsável
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Para Quem Prestamos Contas
          </h2>

          <p className="text-base text-[#94A3B8] leading-relaxed">
            Uma plataforma de governança urbana não existe para fechar contratos de TI: existe para
            proteger o erário, resguardar o gestor e transformar a vida da população. O ORBIS.UOS se
            oferece expressamente para ser fiscalizado.
          </p>
        </div>

        {/* 3 Columns: Cidadão, Controle, Imprensa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {audiences.map((aud) => {
            const Icon = aud.icon
            return (
              <div
                key={aud.id}
                className="p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6]/60 transition-all duration-200 flex flex-col justify-between shadow-xl shadow-black/30"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: `${aud.accent}15`,
                        borderColor: `${aud.accent}35`,
                        color: aud.accent,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className="text-xs uppercase tracking-wider px-2.5 py-1 rounded border font-semibold"
                      style={{
                        backgroundColor: '#0A1128',
                        borderColor: '#1A2A5A',
                        color: aud.accent,
                      }}
                    >
                      {aud.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#F8FAFC] tracking-tight mb-1">
                    {aud.title}
                  </h3>
                  <p className="text-xs font-medium text-[#60A5FA] mb-4">{aud.subtitle}</p>

                  <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">{aud.description}</p>

                  <div className="space-y-2.5 pt-4 border-t border-[#1A2A5A]">
                    {aud.points.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#CBD5E1]">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: aud.accent }}
                        />
                        <span className="leading-snug">{pt}</span>
                      </div>
                    ))}
                  </div>

                  {aud.id === 'cidadao' && (
                    <div className="mt-4 pt-3 border-t border-[#1A2A5A]/60">
                      <a
                        href="/cidadao"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] hover:underline"
                      >
                        <span>Acessar Portal de Acompanhamento do Cidadão</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#1A2A5A]/60">
                  <blockquote className="text-xs italic text-[#94A3B8]/90 leading-relaxed bg-[#0A1128] p-3 rounded-xl border border-[#1A2A5A]/50">
                    {aud.quote}
                  </blockquote>
                </div>
              </div>
            )
          })}
        </div>

        {/* DIMENSÃO: SOCIEDADE ATENDIDA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#101B3A] via-[#0E1838] to-[#101B3A] border-2 border-[#10B981]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-3xl mb-10 space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
              <HeartHandshake className="w-3.5 h-3.5" />
              Resultado Social & Cidadania
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Sociedade Atendida: O Impacto Real na Vida de Quem Circula
            </h3>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Tecnologia pública só faz sentido quando melhora o cotidiano do cidadão que acorda
              cedo para trabalhar. A substituição do tapa-buraco eleitoreiro pela auditoria técnica
              devolve dignidade urbana a todos os bairros do município.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {societyOutcomes.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0A1128]/80 border border-[#1A2A5A] hover:border-[#10B981]/50 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-[#F8FAFC] tracking-tight leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8] relative z-10">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#10B981]" />
              <span>
                Validação técnica contínua com metodologias consagradas de engenharia de pavimentos
                e normas públicas de infraestrutura.
              </span>
            </div>
            <button
              type="button"
              onClick={scrollToManifesto}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] hover:text-[#34D399] transition-colors"
            >
              <span>Submeter Manifesto de Interesse Institucional</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
