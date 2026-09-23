import React, { useState } from 'react'
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Flame,
  Check,
} from 'lucide-react'
import { syncPrfApiData, PrfSyncResponse } from '@/services/connectorPrf'

interface PrfSyncModalProps {
  isOpen: boolean
  onClose: () => void
  codigoIbge?: string
  municipio?: string
  uf?: string
  onSyncCompleted: () => void
}

export function PrfSyncModal({
  isOpen,
  onClose,
  codigoIbge = '4106902',
  municipio = 'Curitiba',
  uf = 'PR',
  onSyncCompleted,
}: PrfSyncModalProps) {
  const [selectedExercicios, setSelectedExercicios] = useState<number[]>([2024, 2023])
  const [selectedBrs, setSelectedBrs] = useState<string[]>(['116', '277', '376', '476'])
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [step, setStep] = useState<'config' | 'syncing' | 'result'>('config')
  const [syncResult, setSyncResult] = useState<PrfSyncResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleExercicio = (ano: number) => {
    if (selectedExercicios.includes(ano)) {
      if (selectedExercicios.length === 1) return // não desmarcar todos
      setSelectedExercicios(selectedExercicios.filter((y) => y !== ano))
    } else {
      setSelectedExercicios([...selectedExercicios, ano].sort((a, b) => b - a))
    }
  }

  const toggleBr = (br: string) => {
    if (selectedBrs.includes(br)) {
      if (selectedBrs.length === 1) return
      setSelectedBrs(selectedBrs.filter((b) => b !== br))
    } else {
      setSelectedBrs([...selectedBrs, br])
    }
  }

  const handleExecuteSync = async (dryRun: boolean = false) => {
    setIsRunning(true)
    setErrorMessage(null)
    setStep('syncing')

    try {
      const res = await syncPrfApiData({
        codigo_ibge: codigoIbge,
        municipio,
        uf,
        exercicios: selectedExercicios,
        brs: selectedBrs,
        dry_run: dryRun,
      })

      setSyncResult(res)
      setStep('result')
      if (!dryRun) {
        onSyncCompleted()
      }
    } catch (err: any) {
      console.error('Falha ao sincronizar via conector PRF:', err)
      const msg =
        err?.data?.message ||
        err?.message ||
        'Não foi possível estabelecer conexão estável com o portal da PRF. Tente novamente.'
      setErrorMessage(msg)
      setStep('config')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0A1128] border-2 border-[#EF4444]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-6 bg-gradient-to-r from-[#101B3A] via-[#0A1128] to-[#101B3A] border-b border-[#1A2A5A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/50 flex items-center justify-center text-[#EF4444]">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#EF4444]/20 text-[#EF4444] px-2 py-0.5 rounded border border-[#EF4444]/30 font-bold">
                  Conector Governamental Direto
                </span>
                <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  LGPD Blindada
                </span>
              </div>
              <h3 className="text-lg font-black text-[#F8FAFC] mt-0.5">
                Sincronizar Sinistros Federais • API PRF
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#CBD5E1]">
          {/* Alerta de Exceção Arquitetural Acordada */}
          <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#3B82F6]/40 space-y-1">
            <div className="flex items-center gap-1.5 text-[#60A5FA] font-bold text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Exceção Arquitetural Documentada ao Fluxo Padrão</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              O produto opera por padrão com ingestão deliberada via upload no Cockpit para
              blindagem de runtime. A <b>Polícia Rodoviária Federal (dadosabertos.prf.gov.br)</b> é
              a <b>exceção justificada</b> autorizada para sincronização direta em um clique por
              possuir API REST federal estável com coordenadas de acidentes rodoviários.
            </p>
          </div>

          {/* Erro de Comunicação / Indisponibilidade */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/60 text-[#FCA5A5] space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-[#EF4444]">
                <AlertTriangle className="w-4 h-4" />
                <span>Comunicação com a API PRF Falhou</span>
              </div>
              <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleExecuteSync(false)}
                  className="px-3 py-1 rounded-lg bg-[#EF4444] text-white font-bold text-[11px] hover:bg-[#DC2626] transition-colors"
                >
                  Tentar Novamente (Retry)
                </button>
              </div>
            </div>
          )}

          {/* PASSO 1: CONFIGURAÇÃO / PREVIEW */}
          {step === 'config' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070D1F] border border-[#1A2A5A] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8]">
                    Município-Piloto Homologado
                  </span>
                  <div className="font-bold text-sm text-[#F8FAFC]">
                    {municipio} — {uf}
                  </div>
                  <span className="text-[11px] font-mono text-[#60A5FA]">
                    Código IBGE: {codigoIbge}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#070D1F] border border-[#1A2A5A] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8]">
                    Endpoint Oficial de Consulta
                  </span>
                  <div className="font-mono text-[11px] text-[#CBD5E1] truncate">
                    dadosabertos.prf.gov.br/servicos/acidentes
                  </div>
                  <span className="text-[10px] text-[#10B981] font-bold block">
                    Protocolo REST HTTPS Seguro
                  </span>
                </div>
              </div>

              {/* Exercícios (Anos) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F8FAFC]">
                  Exercícios a Sincronizar:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[2024, 2023, 2022].map((ano) => {
                    const isSelected = selectedExercicios.includes(ano)
                    return (
                      <button
                        key={ano}
                        type="button"
                        onClick={() => toggleExercicio(ano)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#F8FAFC]'
                            : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8] hover:border-[#EF4444]/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#EF4444]" />}
                        <span>Ano {ano}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Rodovias Federais na Região */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F8FAFC]">
                  Rodovias Federais Monitoradas na Região:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { br: '116', nome: 'BR-116 (Linha Verde)' },
                    { br: '277', nome: 'BR-277 (Sentido Litoral / Interior)' },
                    { br: '376', nome: 'BR-376 (Contorno Sul)' },
                    { br: '476', nome: 'BR-476 (Estrada da Ribeira / Xisto)' },
                  ].map((rod) => {
                    const isSelected = selectedBrs.includes(rod.br)
                    return (
                      <button
                        key={rod.br}
                        type="button"
                        onClick={() => toggleBr(rod.br)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#F8FAFC]'
                            : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#3B82F6]" />}
                        <span>{rod.nome}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Blindagem LGPD e Regras */}
              <div className="p-3.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Pipeline Automático de Segurança & Governança:</span>
                </div>
                <ul className="text-[11px] text-[#94A3B8] space-y-1 list-disc list-inside">
                  <li>
                    <b>Saneamento LGPD Irreversível:</b> Nomes de envolvidos, CPFs, placas de
                    veículos e contatos são eliminados antes de qualquer escrita no banco.
                  </li>
                  <li>
                    <b>Ancoragem Espacial H3:</b> Cada sinistro recebe identificadores nas
                    Resoluções 9 (~174m) e 10 (~65m).
                  </li>
                  <li>
                    <b>Procedência Declarada:</b> Fonte "API Oficial PRF", endpoint consultado,
                    exercícios e operador nominal carimbados.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* PASSO 2: SINCRONIZANDO (PROGRESSO) */}
          {step === 'syncing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#EF4444]/20 border-t-[#EF4444] animate-spin" />
                <Flame className="w-6 h-6 text-[#EF4444] absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#F8FAFC]">
                  Consultando API da PRF & Ancorando em H3...
                </h4>
                <p className="text-xs text-[#94A3B8] max-w-sm">
                  Baixando sinistros das rodovias BR-{selectedBrs.join(', BR-')}, aplicando
                  saneamento de PII e carimbando na malha de Curitiba.
                </p>
              </div>
            </div>
          )}

          {/* PASSO 3: RESULTADO DA SINCRONIZAÇÃO */}
          {step === 'result' && syncResult && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  syncResult.degraded
                    ? 'bg-[#F59E0B]/10 border-[#F59E0B]/50'
                    : 'bg-[#10B981]/10 border-[#10B981]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#F8FAFC]">
                    {syncResult.degraded ? (
                      <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    )}
                    <span>
                      {syncResult.degraded
                        ? 'Sincronização Concluída em Modo Degradado Homologado'
                        : 'Sincronização com a API da PRF Concluída!'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    {syncResult.procedencia.timestamp.slice(11, 19)} UTC
                  </span>
                </div>
                <p className="text-[11px] text-[#CBD5E1] leading-relaxed">{syncResult.message}</p>
              </div>

              {/* 3 Métricas Rápidas */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                    Registros da API
                  </span>
                  <span className="text-xl font-mono font-black text-[#F8FAFC]">
                    {syncResult.total_lidos}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#10B981]/40">
                  <span className="text-[10px] uppercase font-mono text-[#10B981] block">
                    Gravados / H3
                  </span>
                  <span className="text-xl font-mono font-black text-[#10B981]">
                    {syncResult.total_importados}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#F59E0B]/40">
                  <span className="text-[10px] uppercase font-mono text-[#F59E0B] block">
                    Descartes / Duplicados
                  </span>
                  <span className="text-xl font-mono font-black text-[#F59E0B]">
                    {syncResult.total_descartados}
                  </span>
                </div>
              </div>

              {/* Metadados de Procedência Gravados */}
              <div className="p-3.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A] text-[11px] space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Fonte Oficial:</span>
                  <span className="text-[#F8FAFC] font-semibold">
                    {syncResult.procedencia.fonte}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Endpoint Consultado:</span>
                  <span className="text-[#60A5FA] truncate max-w-[320px]">
                    {syncResult.endpoint_consultado}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Operador Responsável:</span>
                  <span className="text-[#CBD5E1]">
                    {syncResult.procedencia.operador_nome} ({syncResult.procedencia.operador_email})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Trilha de Auditoria:</span>
                  <span className="text-[#10B981]">SINISTROS_PRF_SINCRONIZADOS</span>
                </div>
              </div>

              {/* Lista de Descartes se houver */}
              {syncResult.descartes && syncResult.descartes.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-[#F59E0B] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Justificativa dos Descartes ({syncResult.descartes.length}):
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {syncResult.descartes.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A] text-[10px] text-[#94A3B8]"
                      >
                        <b className="text-[#CBD5E1]">{d.resumo || `Item ${d.linha}`}:</b>{' '}
                        {d.motivo}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 bg-[#101B3A] border-t border-[#1A2A5A] flex items-center justify-between">
          <div className="text-[11px] text-[#94A3B8] font-mono">
            {step === 'config' && 'Exceção arquitetural aprovada • PRF Dados Abertos'}
            {step === 'syncing' && 'Processando em segundo plano no servidor...'}
            {step === 'result' && 'Dados persistidos soberanamente'}
          </div>

          <div className="flex items-center gap-2">
            {step === 'config' && (
              <>
                <button
                  type="button"
                  onClick={() => handleExecuteSync(true)}
                  disabled={isRunning}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#CBD5E1] font-semibold text-xs transition-colors"
                >
                  Dry-Run (Prévia)
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteSync(false)}
                  disabled={isRunning}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white font-bold text-xs shadow-lg shadow-[#EF4444]/20 flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar Sinistros PRF</span>
                </button>
              </>
            )}

            {step === 'result' && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shadow-md transition-colors"
              >
                Concluir & Visualizar no Mapa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
