import React, { useState, useEffect } from 'react'
import {
  X,
  FileCheck2,
  Users,
  Zap,
  Phone,
  Mail,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { listLeads, LeadRecord } from '@/services/leads'
import { listExpressDiagnostics, ExpressDiagnosticRecord } from '@/services/expressDiagnostic'

interface ManifestosInstitucionaisModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ManifestosInstitucionaisModal({
  isOpen,
  onClose,
}: ManifestosInstitucionaisModalProps) {
  const [activeTab, setActiveTab] = useState<'manifestos' | 'express'>('manifestos')
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [expressList, setExpressList] = useState<ExpressDiagnosticRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [leadsData, expressData] = await Promise.all([listLeads(), listExpressDiagnostics()])
      setLeads(leadsData)
      setExpressList(expressData)
    } catch (err) {
      console.warn('Erro ao carregar manifestos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#1A2A5A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-bold">
                Área Comercial & Institucional
              </span>
              <span className="text-xs text-[#94A3B8]">Avisos Automáticos Server-Side Ativos</span>
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mt-1 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#3B82F6]" />
              Manifestos de Interesse & Diagnósticos Capturados
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
              title="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-[#1A2A5A] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('manifestos')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'manifestos'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manifestos de Interesse ({leads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('express')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'express'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Diagnósticos Express ({expressList.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#94A3B8]">
              Carregando registros de manifestos...
            </div>
          ) : activeTab === 'manifestos' ? (
            leads.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#94A3B8]">
                Nenhum manifesto de interesse registrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6]/50 transition-colors space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F8FAFC]">{l.nome}</span>
                        <span className="text-xs text-[#94A3B8]">({l.cargo})</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">
                          {l.porte}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(l.created).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-xs text-[#CBD5E1]">
                      <b className="text-[#94A3B8]">Órgão:</b> {l.orgao}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#94A3B8] pt-1 border-t border-[#1A2A5A]/60">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span className="text-[#60A5FA] font-mono">{l.email}</span>
                      </div>
                      {l.telefone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#10B981]" />
                          <span className="font-mono text-[#F8FAFC]">{l.telefone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : expressList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#94A3B8]">
              Nenhum diagnóstico express realizado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {expressList.map((e) => (
                <div
                  key={e.id}
                  className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#10B981]/50 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#F8FAFC]">
                        {e.municipio} / {e.uf}
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        ({e.populacao_ibge?.toLocaleString('pt-BR')} hab. • IBGE: {e.codigo_ibge})
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                        Score: {e.score_provisorio}/100
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(e.created).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="text-xs text-[#CBD5E1]">
                    <b className="text-[#94A3B8]">Responsável:</b> {e.responsavel_nome} (
                    {e.responsavel_cargo}) • <b className="text-[#94A3B8]">E-mail:</b>{' '}
                    <span className="text-[#60A5FA] font-mono">{e.email_oficial}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#94A3B8] pt-1 border-t border-[#1A2A5A]/60">
                    <div>
                      <span>Ônibus:</span> <b className="text-[#F8FAFC]">{e.frota_onibus}</b>
                    </div>
                    <div>
                      <span>Coleta:</span>{' '}
                      <b className="text-[#F8FAFC]">{e.frota_caminhoes_coleta}</b>
                    </div>
                    <div>
                      <span>Viaturas:</span> <b className="text-[#F8FAFC]">{e.frota_viaturas}</b>
                    </div>
                    <div>
                      <span>Sensores Sugeridos:</span>{' '}
                      <b className="text-[#10B981]">{e.veiculos_sensor_sugeridos}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1A2A5A] bg-[#0A1128]/50 flex items-center justify-between text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>
              Gatilho server-side ativo: a cada novo registro, um e-mail comercial é disparado
              automaticamente para a equipe ORBIS.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1A2A5A] hover:bg-[#2563EB]/20 text-[#F8FAFC] font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
