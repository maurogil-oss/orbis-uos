import React, { useState, useEffect } from 'react'
import {
  FileText,
  ShieldCheck,
  Scale,
  TrendingDown,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Building,
  Building2,
  Printer,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
} from 'lucide-react'
import { DossieJuridicoCpsi, gerarDossieJuridicoCpsi } from '@/lib/diagnostics/dossieCpsi'
import { computeSha256, sanitizeHtml } from '@/lib/diagnostics/pdfReport'
import { getSerieGastoViarioSiconfi, SiconfiSerieViariaResult } from '@/services/siconfi'

interface DossieJuridicoModalProps {
  municipio: string
  uf: string
  populacao: number
  porte: 'pequena' | 'media' | 'grande'
  extensaoKm?: number
  orcamentoPavimentacao?: number
  codigoIbge?: string
  protocolo?: string
  onClose?: () => void
}

export function DossieJuridicoModal({
  municipio,
  uf,
  populacao,
  porte,
  extensaoKm,
  orcamentoPavimentacao,
  codigoIbge = '4106902',
  protocolo,
  onClose,
}: DossieJuridicoModalProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'economicidade' | 'siconfi' | 'riscos' | 'aditivo'>(
    'economicidade',
  )
  const [hashSha256, setHashSha256] = useState<string>('')
  const [siconfiSerie, setSiconfiSerie] = useState<SiconfiSerieViariaResult | null>(null)
  const [loadingSiconfi, setLoadingSiconfi] = useState<boolean>(false)

  // Consulta SICONFI para alimentar o dossiê de economicidade com média plurianual
  useEffect(() => {
    let isMounted = true
    setLoadingSiconfi(true)
    getSerieGastoViarioSiconfi(codigoIbge, [2019, 2020, 2021, 2022, 2023])
      .then((res) => {
        if (isMounted) {
          setSiconfiSerie(res)
        }
      })
      .catch((err) => console.warn('Erro ao carregar série SICONFI no dossiê:', err))
      .finally(() => {
        if (isMounted) setLoadingSiconfi(false)
      })
    return () => {
      isMounted = false
    }
  }, [codigoIbge])

  const handleRefreshSiconfi = async () => {
    setLoadingSiconfi(true)
    try {
      const res = await getSerieGastoViarioSiconfi(codigoIbge, [2019, 2020, 2021, 2022, 2023], true)
      setSiconfiSerie(res)
    } finally {
      setLoadingSiconfi(false)
    }
  }

  const dossie: DossieJuridicoCpsi = gerarDossieJuridicoCpsi({
    municipio,
    uf,
    porte,
    populacao,
    extensaoKm,
    orcamentoPavimentacao: siconfiSerie?.mediaGastoViarioAnual || orcamentoPavimentacao,
    gastoViarioSiconfiMedia: siconfiSerie?.mediaGastoViarioAnual,
    gastoViarioSiconfiAnos: siconfiSerie?.exerciciosComDados,
    gastoViarioSiconfiTotal: siconfiSerie?.totalGastoViarioSerie,
    gastoViarioSiconfiFonte: siconfiSerie?.fonteDeclarada,
    protocolo,
  })

  React.useEffect(() => {
    computeSha256({
      dossieProtocolo: dossie.protocoloIntegridade,
      municipio,
      uf,
      data: dossie.dataEmissao,
      economia: dossie.ensaioEconomicidade.economiaDiretaAnual,
    }).then(setHashSha256)
  }, [municipio, uf, dossie.protocoloIntegridade])

  const handleCopyAditivo = () => {
    const text = `${dossie.minutaTermoAditivo.titulo}\n\n${dossie.minutaTermoAditivo.objeto}\n\n${dossie.minutaTermoAditivo.clausulaPrimeira}\n\n${dossie.minutaTermoAditivo.clausulaSegunda}\n\n${dossie.minutaTermoAditivo.clausulaTerceira}\n\nFundamentação Legal: ${dossie.minutaTermoAditivo.fundamentacaoLegal}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Dossiê Jurídico CPSI - ${sanitizeHtml(municipio)}/${sanitizeHtml(uf)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0F172A; margin: 30px; font-size: 13px; line-height: 1.5; }
            .header { border-bottom: 2px solid #0F172A; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: 800; text-transform: uppercase; color: #1E3A8A; margin: 0; }
            .box { border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; margin-bottom: 15px; }
            .highlight { background: #F1F5F9; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left; }
            th { background: #F8FAFC; }
            .hash { font-family: monospace; font-size: 10px; background: #0F172A; color: #38BDF8; padding: 8px; border-radius: 4px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Dossiê Jurídico e Parecer de Enquadramento CPSI</h1>
            <div>Marco Legal das Startups (LC 182/2021) • Lei 14.129/2021</div>
            <div>Protocolo: ${sanitizeHtml(dossie.protocoloIntegridade)} • Município: ${sanitizeHtml(municipio)}/${sanitizeHtml(uf)} • Emissão: ${sanitizeHtml(dossie.dataEmissao)}</div>
          </div>

          <div class="box">
            <b>1. ENSAIO DISPLACENTE DE ECONOMICIDADE PÚBLICA</b><br>
            Método Convencional Reativo: R$ ${dossie.ensaioEconomicidade.metodoTradicionalCustoAnual.toLocaleString('pt-BR')}/ano<br>
            Solução Inovadora ORBIS.UOS (CPSI): R$ ${dossie.ensaioEconomicidade.metodoOrbisCustoAnual.toLocaleString('pt-BR')}/ano<br>
            <b>Economia Direta Anual aos Cofres Públicos: R$ ${dossie.ensaioEconomicidade.economiaDiretaAnual.toLocaleString('pt-BR')} (${dossie.ensaioEconomicidade.economiaPercentual}% de redução)</b><br>
            Redução Estimada de Retrabalho em Pavimentação: R$ ${dossie.ensaioEconomicidade.reducaoRetrabalhoAsfaltoEstimada.toLocaleString('pt-BR')}/ano • ROI: ${dossie.ensaioEconomicidade.roiEstimadoMeses} meses.
          </div>

          <div class="box">
            <b>2. MATRIZ DE RISCO DA INOVAÇÃO (LC 182/2021, ART. 27)</b>
            <table>
              <tr><th>Categoria</th><th>Risco</th><th>Probabilidade/Impacto</th><th>Mitigação Legal e Operacional</th></tr>
              ${dossie.matrizRisco
                .map(
                  (r) =>
                    `<tr><td><b>${r.categoria}</b></td><td>${r.riscoIdentificado}</td><td>${r.probabilidade} / ${r.impacto}</td><td>${r.mitigacaoLegalOperacional}</td></tr>`,
                )
                .join('')}
            </table>
          </div>

          <div class="box">
            <b>3. MINUTA DO TERMO ADITIVO PARA CONCESSIONÁRIAS DE TRANSPORTE E COLETA</b>
            <p><b>${dossie.minutaTermoAditivo.titulo}</b></p>
            <p>${dossie.minutaTermoAditivo.clausulaPrimeira}</p>
            <p>${dossie.minutaTermoAditivo.clausulaSegunda}</p>
            <p>${dossie.minutaTermoAditivo.clausulaTerceira}</p>
            <p><small>Fundamentação: ${dossie.minutaTermoAditivo.fundamentacaoLegal}</small></p>
          </div>

          <div class="box highlight">
            <b>4. PARECER CONCLUSIVO DA PROCURADORIA</b>
            <p>${dossie.parecerConclusivo}</p>
          </div>

          <div class="hash">
            HASH SHA-256 DE AUTENTICIDADE: ${hashSha256 || 'CALCULANDO...'}
          </div>

          <div style="margin-top: 25px; padding-top: 10px; border-top: 1px solid #CBD5E1; font-size: 10px; color: #64748B; text-align: center;">
            ORBIS.UOS • Urban Operating System • Metodologia Homologada Versão 2.0 (2025) • Índices IMM (Mobilidade), IMV (Manutenção Viária) e IMA (Acessibilidade - Onda 3) • Fé Pública Digital (Lei 14.063/2020).
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 350)
    }
  }

  return (
    <div className="bg-[#0A1128] border border-[#1A2A5A] rounded-2xl p-6 sm:p-8 space-y-6 text-[#CBD5E1]">
      {/* Header do Dossiê */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2.5 py-0.5 rounded border border-[#3B82F6]/40 font-bold">
              Entrega Autônoma para Procuradoria (PGM)
            </span>
            <span className="text-xs font-mono text-[#94A3B8]">{dossie.protocoloIntegridade}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mt-1.5 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#3B82F6]" />
            Dossiê Jurídico & Parecer CPSI (LC 182/2021)
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1">
            Ensaio displacente de economicidade, análise de risco regulatório e minuta de aditivo
            para {municipio}/{uf}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#F8FAFC] flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Imprimir / PDF</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#0A1128] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#94A3B8]"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1A2A5A] gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('economicidade')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'economicidade'
              ? 'border-[#3B82F6] text-[#3B82F6]'
              : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>1. Ensaio de Economicidade</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('siconfi')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'siconfi'
              ? 'border-[#10B981] text-[#10B981]'
              : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Gasto Viário Oficial SICONFI</span>
          {siconfiSerie?.mediaGastoViarioAnual ? (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
              5 Anos
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('riscos')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'riscos'
              ? 'border-[#3B82F6] text-[#3B82F6]'
              : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>2. Relatório de Risco</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aditivo')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'aditivo'
              ? 'border-[#3B82F6] text-[#3B82F6]'
              : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>3. Minuta Termo Aditivo Concessionárias</span>
        </button>
      </div>

      {/* Tab 1: Economicidade */}
      {activeTab === 'economicidade' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] leading-relaxed">
            <span className="text-[#3B82F6] font-bold block mb-1">
              Demonstrativo de Vantajosidade (Art. 27 da LC 182/2021 & Lei 14.129/2021)
            </span>
            A contratação do piloto inovador ORBIS.UOS substitui métodos manuais esparsos e caros
            por telemetria contínua via smartphones embarcados na frota municipal, gerando redução
            de despesa pública e blindagem contra desperdício no recapeamento asfáltico.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#EF4444]/30 space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#EF4444] font-bold block">
                Custo Atual / Método Tradicional Reativo
              </span>
              <div className="text-2xl font-black font-mono text-[#F8FAFC]">
                R$ {dossie.ensaioEconomicidade.metodoTradicionalCustoAnual.toLocaleString('pt-BR')}
                <span className="text-xs text-[#94A3B8] font-normal"> / ano</span>
              </div>
              <p className="text-[#94A3B8] leading-relaxed">
                {dossie.ensaioEconomicidade.metodoTradicionalDescricao}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/40 space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#10B981] font-bold block">
                Solução Inovadora CPSI (ORBIS.UOS)
              </span>
              <div className="text-2xl font-black font-mono text-[#10B981]">
                R$ {dossie.ensaioEconomicidade.metodoOrbisCustoAnual.toLocaleString('pt-BR')}
                <span className="text-xs text-[#94A3B8] font-normal"> / piloto anual</span>
              </div>
              <p className="text-[#94A3B8] leading-relaxed">
                {dossie.ensaioEconomicidade.metodoOrbisDescricao}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[10px] text-[#94A3B8] block">Economia Direta Anual</span>
              <span className="text-lg font-bold font-mono text-[#10B981]">
                R$ {dossie.ensaioEconomicidade.economiaDiretaAnual.toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#94A3B8] block">Economia Percentual</span>
              <span className="text-lg font-bold font-mono text-[#10B981]">
                {dossie.ensaioEconomicidade.economiaPercentual}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#94A3B8] block">Tempo de Retorno (ROI)</span>
              <span className="text-lg font-bold font-mono text-[#3B82F6]">
                {dossie.ensaioEconomicidade.roiEstimadoMeses} meses
              </span>
            </div>
          </div>

          {/* Destaque do Gasto Viário SICONFI na aba de economicidade */}
          {siconfiSerie && (
            <div className="p-3.5 rounded-xl bg-[#070D1F] border border-[#10B981]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  <b>Gasto viário anual apurado no Tesouro Nacional:</b> Média de{' '}
                  <span className="font-mono text-[#10B981] font-bold">
                    R$ {(siconfiSerie.mediaGastoViarioAnual / 1000000).toFixed(1)} milhões/ano
                  </span>{' '}
                  ({siconfiSerie.qtdAnosComDados} exercícios apurados no SICONFI).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('siconfi')}
                className="text-xs font-bold text-[#60A5FA] hover:text-white shrink-0 underline decoration-dotted"
              >
                Ver série completa →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Gasto Viário Oficial SICONFI / Tesouro Nacional */}
      {activeTab === 'siconfi' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 rounded-xl bg-[#101B3A]/80 border border-[#10B981]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30 font-bold">
                  Fonte Oficial Primária
                </span>
                <span className="text-[11px] font-mono text-[#94A3B8]">
                  Ente: {municipio} (IBGE: {codigoIbge})
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                Gasto Viário Apurado (Fonte Oficial SICONFI / Tesouro Nacional)
              </h4>
              <p className="text-[#94A3B8] text-[11px] mt-0.5">
                Extração contábil automatizada das rubricas de pavimentação, conservação e
                recuperação viária da DCA e RREO.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshSiconfi}
              disabled={loadingSiconfi}
              className="px-3 py-1.5 rounded-lg bg-[#070D1F] border border-[#1A2A5A] hover:border-[#10B981] text-[#CBD5E1] hover:text-white text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingSiconfi ? 'animate-spin text-[#10B981]' : ''}`}
              />
              <span>{loadingSiconfi ? 'Consultando STN...' : 'Atualizar Dados STN'}</span>
            </button>
          </div>

          {/* Cards de Métricas Consolidadas */}
          {siconfiSerie && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
                  Média Anual de Gasto Viário
                </span>
                <div className="text-2xl font-black font-mono text-[#10B981]">
                  R$ {(siconfiSerie.mediaGastoViarioAnual / 1000000).toFixed(2)} mi
                </div>
                <span className="text-[10px] text-[#94A3B8] block">
                  Calculada sobre {siconfiSerie.qtdAnosComDados} exercícios válidos
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
                  Total Acumulado no Período
                </span>
                <div className="text-2xl font-black font-mono text-[#60A5FA]">
                  R$ {(siconfiSerie.totalGastoViarioSerie / 1000000).toFixed(1)} mi
                </div>
                <span className="text-[10px] text-[#94A3B8] block">
                  Soma dos anos {siconfiSerie.exerciciosComDados.join(', ')}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
                  Gasto Per Capita Médio
                </span>
                <div className="text-2xl font-black font-mono text-[#F59E0B]">
                  R$ {siconfiSerie.gastoPerCapitaMedio.toFixed(2)}
                </div>
                <span className="text-[10px] text-[#94A3B8] block">
                  Por habitante/ano (Pop: {siconfiSerie.populacaoReferencia.toLocaleString('pt-BR')}
                  )
                </span>
              </div>
            </div>
          )}

          {/* Tabela da Série Anual */}
          <div className="border border-[#1A2A5A] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101B3A] text-[#94A3B8] font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Exercício</th>
                  <th className="p-2.5">Gasto Viário Apurado</th>
                  <th className="p-2.5">Método de Apuração</th>
                  <th className="p-2.5">População</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A] bg-[#0A1128]">
                {siconfiSerie?.series.map((item) => (
                  <tr key={item.ano} className="hover:bg-[#101B3A]/40">
                    <td className="p-2.5 font-bold font-mono text-[#F8FAFC]">{item.ano}</td>
                    <td className="p-2.5 font-mono text-[#10B981] font-bold">
                      {item.valorGastoViario > 0
                        ? `R$ ${item.valorGastoViario.toLocaleString('pt-BR')}`
                        : '—'}
                    </td>
                    <td className="p-2.5 text-[#94A3B8]">{item.metodoApuracao}</td>
                    <td className="p-2.5 font-mono text-[#CBD5E1]">
                      {item.populacao ? item.populacao.toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                          item.status === 'disponivel'
                            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                            : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                        }`}
                      >
                        {item.status === 'disponivel' ? 'Validado STN' : 'Sem Dados'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Citação oficial de procedência e rastreabilidade */}
          <div className="p-3.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A] flex items-center justify-between gap-3 text-[11px] text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
              <span>
                <b>Procedência Oficial:</b> Dados STN / Tesouro Nacional, via API pública SICONFI,
                consultados em{' '}
                {siconfiSerie?.dataConsulta
                  ? new Date(siconfiSerie.dataConsulta).toLocaleDateString('pt-BR')
                  : new Date().toLocaleDateString('pt-BR')}
                . Taxa de requisição controlada em 1 req/s.
              </span>
            </div>
            <span className="font-mono text-[#10B981] shrink-0 hidden sm:inline">
              Fator Confiança 100%
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Matriz de Risco */}
      {activeTab === 'riscos' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <p className="text-[#94A3B8] leading-relaxed">
            Matriz de Riscos elaborada conforme os requisitos de governança do Art. 27, § 1º da LC
            182/2021, mitigando questionamentos de órgãos de controle interno e externo:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#1A2A5A] rounded-xl overflow-hidden">
              <thead className="bg-[#101B3A] text-[#94A3B8] uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-2.5">Categoria</th>
                  <th className="p-2.5">Risco Identificado</th>
                  <th className="p-2.5">Prob. / Impacto</th>
                  <th className="p-2.5">Mitigação Jurídica & Operacional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]">
                {dossie.matrizRisco.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#101B3A]/40">
                    <td className="p-2.5 font-bold text-[#F8FAFC] whitespace-nowrap">
                      {r.categoria}
                    </td>
                    <td className="p-2.5 text-[#CBD5E1]">{r.riscoIdentificado}</td>
                    <td className="p-2.5 font-mono text-[11px] whitespace-nowrap">
                      <span className="text-[#F59E0B] font-bold">{r.probabilidade}</span> /{' '}
                      <span className="text-[#3B82F6] font-bold">{r.impacto}</span>
                    </td>
                    <td className="p-2.5 text-[#94A3B8] leading-relaxed">
                      {r.mitigacaoLegalOperacional}
                      <span className="block mt-1 font-mono text-[10px] text-[#60A5FA]">
                        Amparo: {r.amparoMarcoLegal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Minuta Termo Aditivo Concessionárias */}
      {activeTab === 'aditivo' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#10B981] font-bold">
              Minuta para Concessionárias de Transporte e Coleta
            </span>
            <button
              type="button"
              onClick={handleCopyAditivo}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#F8FAFC] flex items-center gap-1.5 transition-all"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
              )}
              <span>
                {copied ? 'Copiado para Área de Transferência' : 'Copiar Texto da Minuta'}
              </span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#070D1F] border border-[#1A2A5A] font-mono text-[11px] text-[#CBD5E1] space-y-3 leading-relaxed select-all">
            <div className="font-bold text-[#3B82F6]">{dossie.minutaTermoAditivo.titulo}</div>
            <div>
              <b>OBJETO:</b> {dossie.minutaTermoAditivo.objeto}
            </div>
            <div>{dossie.minutaTermoAditivo.clausulaPrimeira}</div>
            <div>{dossie.minutaTermoAditivo.clausulaSegunda}</div>
            <div>{dossie.minutaTermoAditivo.clausulaTerceira}</div>
            <div className="text-[10px] text-[#94A3B8]">
              <b>FUNDAMENTAÇÃO:</b> {dossie.minutaTermoAditivo.fundamentacaoLegal}
            </div>
          </div>
        </div>
      )}

      {/* Hash SHA-256 e Conclusão */}
      <div className="p-3.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
          <span className="text-[#94A3B8]">
            Hash SHA-256 de Fé Pública:{' '}
            <span className="font-mono text-[#38BDF8] break-all">
              {hashSha256 || 'Calculando integridade...'}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
