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
  Check,
  Power,
  Sliders,
} from 'lucide-react'
import {
  getOnda2CidadeMediaMetrics,
  GreenLightBridgeMetrics,
  MeioFioVagasMetrics,
} from '@/services/onda2Modules'

interface Onda2CockpitCardProps {
  populacao?: number
  frotaAtiva?: number
  defaultModule?: 'green_light' | 'meio_fio'
}

export function Onda2CockpitCard({
  populacao = 140000,
  frotaAtiva = 18,
  defaultModule = 'green_light',
}: Onda2CockpitCardProps) {
  const [activeTab, setActiveTab] = useState<'green_light' | 'meio_fio'>(defaultModule)
  const [greenLightEnabled, setGreenLightEnabled] = useState<boolean>(true)
  const [meioFioEnabled, setMeioFioEnabled] = useState<boolean>(true)
  const [selectedCorredor, setSelectedCorredor] = useState<number>(0)

  const data = getOnda2CidadeMediaMetrics(populacao, frotaAtiva)
  const glb: GreenLightBridgeMetrics = data.greenLightBridge
  const mfv: MeioFioVagasMetrics = data.meioFioVagas

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#3B82F6]/50 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header do Card Onda 2 no Cockpit */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2.5 py-0.5 rounded border border-[#3B82F6]/40 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              Onda 2 • Cidade Média (50k a 300k hab.)
            </span>
            <span className="text-xs text-[#94A3B8]">Módulos Ativáveis no Cockpit</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1">
            Green Light Bridge & Meio-fio & Vagas
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Módulos integrados de sincronismo semafórico arterial e auditoria de meio-fio via
            telemetria passiva Zero CAPEX.
          </p>
        </div>

        {/* Status de ativação dos módulos */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setGreenLightEnabled(!greenLightEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              greenLightEnabled
                ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 shadow-sm'
                : 'bg-[#101B3A] text-[#94A3B8] border-[#1A2A5A]'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Green Light: {greenLightEnabled ? 'Ativo' : 'Pausado'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMeioFioEnabled(!meioFioEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              meioFioEnabled
                ? 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/40 shadow-sm'
                : 'bg-[#101B3A] text-[#94A3B8] border-[#1A2A5A]'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Meio-fio: {meioFioEnabled ? 'Ativo' : 'Pausado'}</span>
          </button>
        </div>
      </div>

      {/* Seletor de abas dos 2 módulos */}
      <div className="flex items-center gap-2 border-b border-[#1A2A5A] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('green_light')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'green_light'
              ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30'
              : 'bg-[#101B3A] text-[#94A3B8] hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Green Light Bridge (Onda Verde & Semáforos)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('meio_fio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'meio_fio'
              ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30'
              : 'bg-[#101B3A] text-[#94A3B8] hover:text-white'
          }`}
        >
          <ParkingCircle className="w-3.5 h-3.5" />
          <span>Meio-fio & Vagas (Auditoria de Estacionamento)</span>
        </button>
      </div>

      {/* ABA 1: GREEN LIGHT BRIDGE */}
      {activeTab === 'green_light' && (
        <div className="space-y-5 animate-fade-in">
          {/* 4 KPIs de Decisão Executiva */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Corredores Monitorados</span>
                <Zap className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#F8FAFC]">
                {glb.corredoresMonitorados} eixos
              </div>
              <span className="text-[10px] text-[#94A3B8]">
                {glb.semaforosAuditados} semáforos integrados
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Tempo de Ciclo Perdido</span>
                <Clock className="w-4 h-4 text-[#EF4444]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#EF4444]">
                {glb.tempoCicloPerdidoSegundos}s / ciclo
              </div>
              <span className="text-[10px] text-[#94A3B8]">{glb.paradasPorKm} paradas por km</span>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Atraso Acumulado</span>
                <Activity className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#F59E0B]">
                {glb.atrasoAcumuladoHorasAno.toLocaleString('pt-BR')} h
              </div>
              <span className="text-[10px] text-[#94A3B8]">Perdidas na malha arterial/ano</span>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/40">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Custo Evitado (Frota)</span>
                <Fuel className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#10B981]">
                {formatBRL(glb.custoEvitadoFrotaPublicaAnual)}
              </div>
              <span className="text-[10px] text-[#10B981]/90">
                {glb.economiaCombustivelLitrosAno.toLocaleString('pt-BR')}L diesel economizados
              </span>
            </div>
          </div>

          {/* Seletor e Detalhes dos Corredores Arteriais */}
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
                Eixos Arteriais Monitorados pela Frota-Sensor
              </span>
              <span className="text-[#94A3B8] text-[11px]">
                Redução de tempo de viagem: <b>até -{glb.potencialReducaoViagemPct}%</b>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {glb.corredoresPrioritarios.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCorredor(idx)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                    selectedCorredor === idx
                      ? 'bg-[#0A1128] border-[#3B82F6] ring-1 ring-[#3B82F6]/50'
                      : 'bg-[#0A1128]/70 border-[#1A2A5A] hover:border-[#3B82F6]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#F8FAFC] truncate max-w-[160px]">
                      {c.nome}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
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

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#94A3B8]">
                    <div>
                      <span>Extensão:</span> <b className="text-[#F8FAFC]">{c.extensaoKm} km</b>
                    </div>
                    <div>
                      <span>Semáforos:</span> <b className="text-[#F8FAFC]">{c.semaforos}</b>
                    </div>
                    <div>
                      <span>Atraso:</span> <b className="text-[#F59E0B]">{c.atrasoMedioMin} min</b>
                    </div>
                    <div>
                      <span>Ganho:</span>{' '}
                      <b className="text-[#10B981]">-{c.reducaoPotencialPct}%</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enquadre Institucional de Custo Evitado */}
          <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] text-xs text-[#94A3B8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F8FAFC] block">
                  Enquadre no Art. 320 do CTB (Engenharia Semafórica) & Custo Evitado
                </span>
                <span>
                  O módulo utiliza a telemetria inercial dos ônibus e caminhões já em circulação
                  para detectar ondas de retenção arterial, dispensando laços indutivos no asfalto e
                  novos sensores.
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#60A5FA] shrink-0 bg-[#0A1128] px-2.5 py-1 rounded border border-[#1A2A5A]">
              Zero CAPEX
            </span>
          </div>
        </div>
      )}

      {/* ABA 2: MEIO-FIO & VAGAS */}
      {activeTab === 'meio_fio' && (
        <div className="space-y-5 animate-fade-in">
          {/* 4 KPIs de Decisão Executiva */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Meio-fio Auditado</span>
                <MapPin className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#F8FAFC]">
                {mfv.kmMeioFioAuditado} km
              </div>
              <span className="text-[10px] text-[#94A3B8]">Varredura passiva contínua</span>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#EF4444]/40">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Paradas Irregulares</span>
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#EF4444]">
                {mfv.eventosEstacionamentoIrregularMes}/mês
              </div>
              <span className="text-[10px] text-[#EF4444]/90">Fora de vaga demarcada</span>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#F59E0B]/40">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Faixa Amarela Bloqueada</span>
                <Flame className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#F59E0B]">
                {mfv.bloqueiosFaixaAmarelaMes}/mês
              </div>
              <span className="text-[10px] text-[#F59E0B]/90">Estrangulamento viário arterial</span>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#3B82F6]/40">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Vagas Idoso / PCD</span>
                <Car className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#3B82F6]">
                {mfv.conflitosVagasIdosoPcdMes}/mês
              </div>
              <span className="text-[10px] text-[#CBD5E1]">Alertas de ocupação indevida</span>
            </div>
          </div>

          {/* Zonas Críticas Mapeadas (Cruzamento Visão Zero Bloco 6) */}
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
                Zonas Críticas Mapeadas (Entorno Escolar & Hospitalar — Visão Zero)
              </span>
              <span className="text-[#10B981] font-bold text-[11px]">
                Potencial Regularização: {formatBRL(mfv.potencialArrecadacaoRegularizacaoAnual)}/ano
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mfv.zonasCriticasMapeadas.map((z, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#F8FAFC] truncate max-w-[170px]">
                      {z.nome}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
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

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#94A3B8]">
                    <div>
                      <span>Vagas Auditadas:</span>{' '}
                      <b className="text-[#F8FAFC]">{z.vagasAuditadas}</b>
                    </div>
                    <div>
                      <span>Ocupação Irreg.:</span>{' '}
                      <b className="text-[#EF4444]">{z.taxaOcupacaoIrregularPct}%</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enquadre Institucional de Meio-fio */}
          <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] text-xs text-[#94A3B8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F8FAFC] block">
                  Auditoria Passiva Zero CAPEX para Fiscalização & Zeladoria
                </span>
                <span>
                  O caminhão de coleta e as viaturas municipais mapeiam os pontos crônicos de fila
                  dupla e bloqueio sem requerer instalação de câmeras de reconhecimento de placas
                  (LPR).
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#10B981] shrink-0 bg-[#0A1128] px-2.5 py-1 rounded border border-[#1A2A5A]">
              100% LGPD
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
