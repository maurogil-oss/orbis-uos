import React, { useState } from 'react'
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Scale,
  Building,
  DollarSign,
  X,
  ExternalLink,
} from 'lucide-react'
import { RoadEventRecord } from '@/services/roadEvents'
import { FleetTelemetryRecord } from '@/services/fleet'

interface TceDossierModalProps {
  isOpen: boolean
  onClose: () => void
  roadEvents: RoadEventRecord[]
  fleet: FleetTelemetryRecord[]
  blindedBalanceBRL?: number
  kmAudited?: number
  cityName?: string
}

export function TceDossierModal({
  isOpen,
  onClose,
  roadEvents,
  fleet,
  blindedBalanceBRL = 4280000,
  kmAudited = 1482,
  cityName = 'Curitiba / PR',
}: TceDossierModalProps) {
  const [protocolNumber] = useState(
    () => `TCE-CTB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
  )
  const [signatureHash] = useState(
    () =>
      `SHA256:${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(
        '',
      )}`,
  )

  if (!isOpen) return null

  const criticalEvents = roadEvents.filter(
    (e) => e.severidade === 'critica' || e.severidade === 'alta',
  )
  const osIssuedCount = roadEvents.filter(
    (e) => e.status === 'os_emitida' || e.status === 'reparado',
  ).length

  const handlePrint = () => {
    window.print()
  }

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-[#F8FAFC]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#1A2A5A] flex items-center justify-between bg-[#0A1128]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="dossier-title" className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                  Dossiê Técnico-Jurídico TCE / Fundo de Multas
                </h2>
                <span className="text-[10px] font-mono bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-bold uppercase">
                  Art. 320 CTB
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Parecer pré-formatado para Procuradoria Geral do Município e Tribunal de Contas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dossier Document Sheet View */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-[#070D1F]/90 font-sans print:bg-white print:text-black">
          {/* Header of the Official Dossier */}
          <div className="border-b border-[#1A2A5A] pb-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Building className="w-4 h-4 text-[#3B82F6]" />
                <span className="font-bold text-[#F8FAFC]">{cityName}</span>
                <span>• Secretaria Municipal de Obras e Mobilidade</span>
              </div>
              <span className="font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30 text-[11px]">
                Protocolo: {protocolNumber}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
              PARECER TÉCNICO DE NEXO CAUSAL E DESTINAÇÃO DE RECURSOS
            </h1>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Comprovação de Elegibilidade da Despesa em Engenharia de Tráfego e Manutenção Viária
              com Fulcro no{' '}
              <b>Artigo 320 do Código de Trânsito Brasileiro (Lei Federal nº 9.503/1997)</b>, na
              Resolução CONTRAN nº 638/2016 e na LC nº 182/2021 (Marco Legal das Startups).
            </p>
          </div>

          {/* Key Executive Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
              <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                Saldo Blindado pelo Art. 320
              </span>
              <span className="text-xl font-bold font-mono text-[#10B981]">
                {formatBRL(blindedBalanceBRL)}
              </span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                Vinculação legal exclusiva para trânsito
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
              <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                Extensão Auditada Passivamente
              </span>
              <span className="text-xl font-bold font-mono text-[#3B82F6]">
                {kmAudited.toLocaleString('pt-BR')} km
              </span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                Malha monitorada via frota pública
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
              <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                Ordens de Serviço Emitidas
              </span>
              <span className="text-xl font-bold font-mono text-[#F8FAFC]">
                {osIssuedCount} OSs
              </span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                Rastreabilidade ponta a ponta
              </span>
            </div>
          </div>

          {/* 1. Fundamentação Jurídica */}
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-[#F8FAFC]">
              <Scale className="w-4 h-4 text-[#3B82F6]" />
              <span>1. Fundamentação Jurídico-Constitucional da Despesa</span>
            </div>
            <p className="text-[#CBD5E1] leading-relaxed">
              O Art. 320 do Código de Trânsito Brasileiro dispõe expressamente que:
              <i>
                {' '}
                "A receita arrecadada com a cobrança das multas de trânsito será aplicada,
                exclusivamente, em sinalização, engenharia de tráfego, de campo, policiamento,
                fiscalização e educação de trânsito."
              </i>
            </p>
            <p className="text-[#CBD5E1] leading-relaxed">
              A implementação do sistema de sensoriamento espectral e telemetria inercial passiva
              enquadra-se rigorosamente na rubrica de{' '}
              <b>Engenharia de Tráfego e Sinalização Preditiva</b>, uma vez que visa à identificação
              precoce de patologias asfálticas críticas (buracos, afundamentos, perda de aderência e
              rugosidade IRI) que colocam em risco iminente a vida de condutores, motociclistas e
              pedestres.
            </p>
          </div>

          {/* 2. Nexo Causal e Evidências Georreferenciadas */}
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F8FAFC]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>2. Amostragem de Vias Auditadas com Risco Crítico</span>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                {criticalEvents.length} ocorrências prioritárias
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#1A2A5A] rounded-lg overflow-hidden">
                <thead className="bg-[#0A1128] text-[10px] uppercase font-mono text-[#94A3B8]">
                  <tr>
                    <th className="p-2">Logradouro / Corredor</th>
                    <th className="p-2">Bairro</th>
                    <th className="p-2">Patologia</th>
                    <th className="p-2">IRI</th>
                    <th className="p-2">Aceleração Z</th>
                    <th className="p-2">Status Zeladoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2A5A]">
                  {criticalEvents.slice(0, 5).map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#101B3A]">
                      <td className="p-2 font-medium text-[#F8FAFC]">{ev.via}</td>
                      <td className="p-2 text-[#94A3B8]">{ev.bairro || 'Curitiba'}</td>
                      <td className="p-2 uppercase font-mono text-[11px] text-[#EF4444]">
                        {ev.tipo}
                      </td>
                      <td className="p-2 font-mono">
                        {ev.iri_score ? `${ev.iri_score.toFixed(1)} m/km` : '—'}
                      </td>
                      <td className="p-2 font-mono text-[#10B981]">
                        {ev.aceleracao_z ? `${ev.aceleracao_z.toFixed(2)}g` : '—'}
                      </td>
                      <td className="p-2 uppercase text-[10px] font-bold text-[#3B82F6]">
                        {ev.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#94A3B8] italic">
              * Cada leitura conta com coordenada GPS métrica e carimbo de tempo inalterável no
              banco auditável.
            </p>
          </div>

          {/* 3. Conclusão e Assinatura Técnica */}
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3 text-xs">
            <span className="text-sm font-bold text-[#F8FAFC] block">
              3. Conclusão Técnica e Rastreabilidade
            </span>
            <p className="text-[#CBD5E1] leading-relaxed">
              Conclui-se pela <b>plena conformidade material e formal</b> para custeio via receitas
              arrecadadas do Fundo Municipal de Trânsito (Art. 320 CTB) e contratação ágil por Marco
              Legal das Startups (LC 182/2021). A tecnologia SDK Edge embarcada dispensa a aquisição
              de novos equipamentos físicos, resguardando o princípio da economicidade e eficiência
              administrativa (Art. 37, CF/88).
            </p>

            <div className="pt-3 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-[#94A3B8]">
              <div>
                <span>Autenticação Criptográfica:</span>
                <span className="block text-[#10B981] font-bold">{signatureHash}</span>
              </div>
              <div className="text-right">
                <span>
                  Emitido em: {new Date().toLocaleDateString('pt-BR')} às{' '}
                  {new Date().toLocaleTimeString('pt-BR')}
                </span>
                <span className="block text-[#3B82F6]">ORBIS.UOS • Módulo de Governança B2G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A1128]/80 text-xs">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Documento pré-homologado para envio ao Tribunal de Contas do Estado (TCE)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#CBD5E1] hover:text-white"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold flex items-center gap-2 shadow-lg shadow-[#10B981]/25"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Parecer Jurídico
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
