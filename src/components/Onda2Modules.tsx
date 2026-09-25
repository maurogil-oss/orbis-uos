import React, { useState } from 'react'
import {
  Zap,
  ParkingCircle,
  Clock,
  Fuel,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  MapPin,
  Car,
  Activity,
  Flame,
} from 'lucide-react'
import { CityTier } from './Hero'
import {
  getOnda2CidadeMediaMetrics,
  GreenLightBridgeMetrics,
  MeioFioVagasMetrics,
} from '@/services/onda2Modules'

interface Onda2ModulesProps {
  selectedTier: CityTier
  onSelectTier: (tier: CityTier) => void
}

export function Onda2Modules({ selectedTier, onSelectTier }: Onda2ModulesProps) {
  const [activeModule, setActiveModule] = useState<'green_light' | 'meio_fio'>('green_light')
  const data = getOnda2CidadeMediaMetrics(140000, 18)
  const glb: GreenLightBridgeMetrics = data.greenLightBridge
  const mfv: MeioFioVagasMetrics = data.meioFioVagas

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <section
      id="onda-2"
      className="py-20 relative bg-[#070D1F] border-t border-[#1A2A5A]/50 scroll-mt-20"
    >
      {/* Glow subtle */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#3B82F6]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative">
        {/* Header da seção */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101B3A] border border-[#3B82F6]/40 text-xs font-semibold text-[#60A5FA]">
            <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Onda 2 por Porte • Destaque Cidade Média (50k–300k hab.)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Módulos de Expansão: Otimização Semafórica & Gestão de Meio-fio
          </h2>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Para cidades médias, a telemetria passiva da frota-sensor (CPSI) vai além do asfalto:
            conecta a inteligência inercial aos semáforos da malha arterial e audita o uso do
            meio-fio sem obras e sem novos equipamentos.
          </p>

          {/* Abas de Porte ou Alerta de Foco */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-xs text-[#94A3B8] font-medium">Porte selecionado:</span>
            <button
              type="button"
              onClick={() => onSelectTier('pequena')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTier === 'pequena'
                  ? 'bg-[#10B981] text-white shadow-md'
                  : 'bg-[#101B3A] text-[#94A3B8] hover:text-white'
              }`}
            >
              Pequena (&lt;50k)
            </button>
            <button
              type="button"
              onClick={() => onSelectTier('media')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTier === 'media'
                  ? 'bg-[#3B82F6] text-white shadow-md scale-105'
                  : 'bg-[#101B3A] text-[#94A3B8] hover:text-white'
              }`}
            >
              Média (50k–300k) ★
            </button>
            <button
              type="button"
              onClick={() => onSelectTier('grande')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTier === 'grande'
                  ? 'bg-[#6366F1] text-white shadow-md'
                  : 'bg-[#101B3A] text-[#94A3B8] hover:text-white'
              }`}
            >
              Grande (300k+)
            </button>
          </div>
        </div>

        {/* Card Seletor dos 2 Módulos da Onda 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => setActiveModule('green_light')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              activeModule === 'green_light'
                ? 'bg-[#101B3A] border-[#3B82F6] shadow-xl shadow-[#3B82F6]/10 ring-1 ring-[#3B82F6]/40'
                : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/40'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeModule === 'green_light'
                  ? 'bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/50'
                  : 'bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]'
              }`}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F8FAFC]">1. Green Light Bridge</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-semibold">
                  {tierLabel}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 leading-snug">
                Insumos para engenharia semafórica • Até 22% de redução de atraso
              </p>{' '}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('meio_fio')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              activeModule === 'meio_fio'
                ? 'bg-[#101B3A] border-[#10B981] shadow-xl shadow-[#10B981]/10 ring-1 ring-[#10B981]/40'
                : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#10B981]/40'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeModule === 'meio_fio'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50'
                  : 'bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]'
              }`}
            >
              <ParkingCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F8FAFC]">2. Meio-fio & Vagas</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#3B82F6]/20 text-[#60A5FA] font-semibold">
                  {tierLabel}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 leading-snug">
                Varredura passiva de meio-fio • 100% frota pública • Zero hardware extra
              </p>{' '}
            </div>
          </button>
        </div>

        {/* DETALHAMENTO DO MÓDULO 1: GREEN LIGHT BRIDGE */}
        {activeModule === 'green_light' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#101B3A] border border-[#3B82F6]/40 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2.5 py-0.5 rounded border border-[#3B82F6]/40 font-semibold">
                    Onda 2 • Mobilidade & Semáforos
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    Cidades de 50.000 a 300.000 habitantes
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1">
                  Green Light Bridge • Otimização de Sinais via Frota-Sensor
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
                  Sincronização semafórica arterial alimentada passivamente pelos ônibus e caminhões
                  de coleta que já rodam com smartphones ou rastreadores: ondas de parada e
                  aceleração Z calibram os ciclos de verde sem gastar com obras ou sensores físicos
                  de laço.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono uppercase text-[#94A3B8] block">
                  Custo Evitado Frota Pública
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#10B981]">
                  {formatBRL(glb.custoEvitadoFrotaPublicaAnual)}/ano
                </span>
                <span className="text-xs text-[#94A3B8] block">
                  em combustível e desgaste mecânico
                </span>
              </div>
            </div>

            {/* 4 Métricas Executivas do Green Light Bridge */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Corredores Monitorados</span>
                  <Zap className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#F8FAFC]">
                  {glb.corredoresMonitorados} eixos
                </div>
                <span className="text-xs text-[#94A3B8]">
                  {glb.semaforosAuditados} semáforos integrados
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Paradas por Km</span>
                  <Activity className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#F59E0B]">
                  {glb.paradasPorKm} / km
                </div>
                <span className="text-xs text-[#94A3B8]">Média arterial em pico</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Tempo de Ciclo Perdido</span>
                  <Clock className="w-4 h-4 text-[#EF4444]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#EF4444]">
                  {glb.tempoCicloPerdidoSegundos}s / ciclo
                </div>
                <span className="text-xs text-[#94A3B8]">Retenção residual evitável</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#10B981]/40">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Potencial de Redução</span>
                  <TrendingDown className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#10B981]">
                  -{glb.potencialReducaoViagemPct}%
                </div>
                <span className="text-xs text-[#10B981]/90">No tempo de viagem arterial</span>
              </div>
            </div>

            {/* Corredores Prioritários Mapeados */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
                  Corredores Arteriais Prioritários do Módulo
                </span>
                <span className="text-[#94A3B8]">Telemetria Passiva em Tempo Real</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {glb.corredoresPrioritarios.map((c, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F8FAFC] truncate max-w-[180px]">
                        {c.nome}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${
                          c.statusOndaVerde === 'otimizada'
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : c.statusOndaVerde === 'calibrando'
                              ? 'bg-[#3B82F6]/20 text-[#60A5FA]'
                              : 'bg-[#EF4444]/20 text-[#EF4444]'
                        }`}
                      >
                        {c.statusOndaVerde}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#94A3B8]">
                      <div>
                        <span>Extensão:</span>{' '}
                        <b className="text-[#F8FAFC] font-mono">{c.extensaoKm} km</b>
                      </div>
                      <div>
                        <span>Semáforos:</span>{' '}
                        <b className="text-[#F8FAFC] font-mono">{c.semaforos}</b>
                      </div>
                      <div>
                        <span>Atraso:</span>{' '}
                        <b className="text-[#F59E0B] font-mono">{c.atrasoMedioMin} min</b>
                      </div>
                      <div>
                        <span>Ganho:</span>{' '}
                        <b className="text-[#10B981] font-mono">-{c.reducaoPotencialPct}%</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enquadre Institucional & Custo Evitado */}
            <div className="p-4 rounded-xl bg-[#0A1128]/80 border border-[#1A2A5A] text-xs text-[#94A3B8] space-y-2">
              <div className="flex items-center gap-2 text-[#F8FAFC] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Enquadre Institucional & Custo Evitado (Pilar D / IMV & IMM)</span>
              </div>
              <p className="leading-relaxed">
                <b>Economia e Descarbonização:</b> {glb.enquadreInstitucional.beneficioCustoEvitado}{' '}
                <b>Zero CAPEX:</b> {glb.enquadreInstitucional.zeroCapexJustificativa}
              </p>
              <div className="text-xs text-[#60A5FA] font-medium">
                Base legal: {glb.enquadreInstitucional.baseLegal}
              </div>
            </div>
          </div>
        )}

        {/* DETALHAMENTO DO MÓDULO 2: MEIO-FIO & VAGAS */}
        {activeModule === 'meio_fio' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#101B3A] border border-[#10B981]/40 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-semibold">
                    Onda 2 • Auditoria de Meio-fio
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    Cidades de 50.000 a 300.000 habitantes
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1">
                  Meio-fio & Vagas • Gestão de Estacionamento & Faixa Amarela
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
                  Auditoria contínua de calçadas, paradas prolongadas irregulares, bloqueios de
                  faixa amarela e respeito a vagas reservadas de idoso e PCD — mapeada pelo percurso
                  natural dos caminhões de coleta e viaturas municipais.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs uppercase text-[#94A3B8] block font-semibold">
                  Potencial de Regularização
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#3B82F6]">
                  {formatBRL(mfv.potencialArrecadacaoRegularizacaoAnual)}/ano
                </span>
                <span className="text-xs text-[#94A3B8] block">em ordenamento e rotatividade</span>
              </div>
            </div>

            {/* 4 Métricas Executivas de Meio-fio */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Meio-fio Auditado</span>
                  <MapPin className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#F8FAFC]">
                  {mfv.kmMeioFioAuditado} km
                </div>
                <span className="text-xs text-[#94A3B8]">Varredura passiva contínua</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Estacionamento Irregular</span>
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#EF4444]">
                  {mfv.eventosEstacionamentoIrregularMes}/mês
                </div>
                <span className="text-xs text-[#94A3B8]">Paradas fora de demarcação</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Faixa Amarela Bloqueada</span>
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#F59E0B]">
                  {mfv.bloqueiosFaixaAmarelaMes}/mês
                </div>
                <span className="text-xs text-[#94A3B8]">Estrangulamento viário arterial</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#3B82F6]/40">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Vagas Idoso / PCD</span>
                  <Car className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#3B82F6]">
                  {mfv.conflitosVagasIdosoPcdMes}/mês
                </div>
                <span className="text-xs text-[#CBD5E1]">Alertas de invasão indevida</span>
              </div>
            </div>

            {/* Zonas Críticas Visão Zero Cruzadas (Bloco 6) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
                  Zonas Críticas Monitoradas (Cruzamento com Bloco 6 Visão Zero)
                </span>
                <span className="text-[#94A3B8]">Prevenção de Sinistros com Pedestres</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mfv.zonasCriticasMapeadas.map((z, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F8FAFC] truncate max-w-[180px]">
                        {z.nome}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${
                          z.riscoVisaoZero === 'critico'
                            ? 'bg-[#EF4444]/20 text-[#EF4444]'
                            : z.riscoVisaoZero === 'alto'
                              ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                              : 'bg-[#3B82F6]/20 text-[#60A5FA]'
                        }`}
                      >
                        {z.riscoVisaoZero}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#94A3B8]">
                      <div>
                        <span>Vagas Auditadas:</span>{' '}
                        <b className="text-[#F8FAFC] font-mono">{z.vagasAuditadas}</b>
                      </div>
                      <div>
                        <span>Ocupação Irreg.:</span>{' '}
                        <b className="text-[#EF4444] font-mono">{z.taxaOcupacaoIrregularPct}%</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enquadre Institucional & Zero CAPEX */}
            <div className="p-4 rounded-xl bg-[#0A1128]/80 border border-[#1A2A5A] text-xs text-[#94A3B8] space-y-2">
              <div className="flex items-center gap-2 text-[#F8FAFC] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Enquadre Institucional de Meio-fio & Zeladoria</span>
              </div>
              <p className="leading-relaxed">
                <b>Benefício à Gestão:</b> {mfv.enquadreInstitucional.beneficioZeladoria}{' '}
                <b>Zero CAPEX:</b> {mfv.enquadreInstitucional.zeroCapexJustificativa}
              </p>
              <div className="text-xs text-[#10B981] font-medium">
                Base legal: {mfv.enquadreInstitucional.baseLegal}
              </div>
            </div>
          </div>
        )}

        {/* Banner de Ativação no Cockpit */}
        <div className="p-4 rounded-2xl bg-[#101B3A]/60 border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
            <div>
              <span className="font-bold text-[#F8FAFC] block">
                Disponível na Seleção de Cidade Média e no Cockpit Institucional
              </span>
              <span>
                Os módulos Green Light Bridge e Meio-fio & Vagas operam integrados ao Modo Gabinete
                e ao Cockpit Técnico com filtros específicos por corredor.
              </span>
            </div>
          </div>

          <a
            href="#manifesto"
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors"
          >
            Manifestar Interesse Onda 2
          </a>
        </div>
      </div>
    </section>
  )
}
