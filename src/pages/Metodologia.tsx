import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  FileCheck2,
  Scale,
  Zap,
  Download,
  Loader2,
  FileText,
  Lock,
  Hexagon,
  Server,
  Headphones,
  Database,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { generateDossieArquiteturaPdf } from '@/lib/diagnostics/dossieArquiteturaPdf'
import { generateRelatorioSegurancaPdf } from '@/lib/diagnostics/relatorioSegurancaPdf'
import { useAuth } from '@/contexts/AuthContext'

export default function Metodologia() {
  const { user } = useAuth()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isGeneratingSecPdf, setIsGeneratingSecPdf] = useState(false)
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null)
  const [lastGeneratedProtocolo, setLastGeneratedProtocolo] = useState<string | null>(null)
  const [lastGeneratedDocType, setLastGeneratedDocType] = useState<string>('Dossiê')

  const handleDownloadDossie = async () => {
    if (isGeneratingPdf || isGeneratingSecPdf) return
    setIsGeneratingPdf(true)
    try {
      const res = await generateDossieArquiteturaPdf({
        responsavelNome: user?.name || 'Acesso Público / Avaliação Externa',
        responsavelCargo: user?.email
          ? `Usuário Credenciado (${user.email})`
          : 'Acesso Público Governamental',
      })
      setLastGeneratedDocType('Dossiê de Arquitetura')
      setLastGeneratedHash(res.hash)
      setLastGeneratedProtocolo(res.protocolo)
    } catch (err) {
      console.error('Erro ao gerar Dossiê de Arquitetura:', err)
      alert(
        err instanceof Error
          ? err.message
          : 'Houve uma falha ao gerar o Dossiê de Arquitetura. Verifique se o bloqueador de pop-ups está ativo.',
      )
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleDownloadRelatorioSeguranca = async () => {
    if (isGeneratingSecPdf || isGeneratingPdf) return
    setIsGeneratingSecPdf(true)
    try {
      const res = await generateRelatorioSegurancaPdf({
        responsavelNome: user?.name || 'Acesso Público / Avaliação Institucional',
        responsavelCargo: user?.email
          ? `Servidor Institucional (${user.email})`
          : 'Acesso Institucional Governamental',
      })
      setLastGeneratedDocType('Relatório de Segurança')
      setLastGeneratedHash(res.hash)
      setLastGeneratedProtocolo(res.protocolo)
    } catch (err) {
      console.error('Erro ao gerar Relatório de Segurança:', err)
      alert(
        err instanceof Error
          ? err.message
          : 'Houve uma falha ao gerar o Relatório de Segurança. Verifique se o bloqueador de pop-ups está ativo.',
      )
    } finally {
      setIsGeneratingSecPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar à Landing
          </Link>
          <span>/</span>
          <span className="text-[#3B82F6]">Metodologia Pública</span>
        </div>

        {/* Header com Botão em Destaque */}
        <div className="space-y-4 pb-6 border-b border-[#1A2A5A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981] w-fit">
              <Calendar className="w-3.5 h-3.5" />
              Versão 2.2 Homologada • Indexação Espacial H3 & k-Anonimato Territorial • Março de
              2025
            </div>

            {/* Botões de Destaque Superior */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadRelatorioSeguranca}
                disabled={isGeneratingSecPdf || isGeneratingPdf}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] border border-[#10B981]/60 shadow-lg shadow-[#10B981]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                title="Baixar Relatório de Segurança Interno em PDF com scan de RLS, CVEs, auditoria LGPD e hash SHA-256"
              >
                {isGeneratingSecPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gerando Relatório...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-[#A7F3D0]" />
                    <span>Baixar Relatório de Segurança (PDF)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadDossie}
                disabled={isGeneratingPdf || isGeneratingSecPdf}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] border border-[#3B82F6]/60 shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                title="Baixar documento completo com capa institucional, hierarquia de índices, pilares IMV, FFT e hash SHA-256"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gerando Dossiê (PDF)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#38BDF8]" />
                    <span>Baixar Dossiê de Arquitetura (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Metodologia do Diagnóstico Institucional, do IMM e dos Sub-índices Setoriais (IMV e IMA)
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Documentação técnica pública dos princípios, algoritmos de cálculo, matrizes de
            ponderação, viés de desvio declarado, bandas espectrais FFT e grade hexagonal H3 da
            plataforma ORBIS.UOS (Versão 2.2 Homologada).
          </p>

          {/* Feedback de Geração / Hash se já emitido */}
          {lastGeneratedHash && (
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#10B981]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-[#CBD5E1]">
                  {lastGeneratedDocType} gerado com sucesso! Protocolo:{' '}
                  <strong className="text-white font-mono">{lastGeneratedProtocolo}</strong>
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#38BDF8] break-all">
                SHA-256: {lastGeneratedHash.slice(0, 20)}...{lastGeneratedHash.slice(-12)}
              </div>
            </div>
          )}
        </div>

        {/* 1. Princípios Norteadores */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#3B82F6]" />
            1. Princípios Norteadores da Metodologia
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Capacidade de Gestão, Não Gravidade do Problema:</b> O Diagnóstico Institucional
                avalia exclusivamente os instrumentos, rotinas e capacidade fiscal do município para
                solucionar a mobilidade, nunca punindo cidades por herdarem malhas viárias antigas.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Regra da Inclusão ("Não Sei" Não Zera):</b> Respostas desconhecidas pontuam no
                piso mínimo e acionam flags de assistência técnica institucional.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Regra de Justiça Relativa por Porte:</b> Cidades pequenas (até 50 mil hab.)
                possuem cortes adaptados. Perdem na quantidade absoluta de veículos mas compensam na
                alta cobertura percentual de rotas.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Piso Neutro para Não Municipalizados:</b> Municípios que ainda não
                municipalizaram o trânsito pelo Art. 24 do CTB recebem piso neutro de 2 pontos no
                Bloco 4 e flag de enquadramento estadual.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Ponderação dos 6 Blocos Institucionais */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#60A5FA]" />
            2. Ponderação do Diagnóstico Institucional (0 a 100)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 1 (10%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">
                Identificação & Órgão
              </span>
              <span className="text-[11px] text-[#94A3B8]">Art. 24 CTB, governança e tríade</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 2 (20%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">Malha Viária</span>
              <span className="text-[11px] text-[#94A3B8]">
                % pavimentada, ciclofaixas e modelo de vistoria
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#10B981] font-bold block">Bloco 3 (25%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">
                Frota-Sensor Zero CAPEX
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Ônibus, coleta, viaturas e cobertura territorial
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#F59E0B] font-bold block">Bloco 4 (20%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">
                Capacidade Art. 320 CTB
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Fundo de multas, saldo e situação no TCE
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 5 (10%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">PNATRANS</span>
              <span className="text-[11px] text-[#94A3B8]">Sinistros, óbitos/100k hab e metas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 6 (15%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">Visão Zero</span>
              <span className="text-[11px] text-[#94A3B8]">
                Zonas 30, radares e custo do trauma SUS
              </span>
            </div>
          </div>
        </div>

        {/* 3. Hierarquia dos Índices e Arquitetura de Consolidação (Versão 2.1 — Onda 3) */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#3B82F6]/50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3B82F6]" />
              3. Hierarquia dos Índices & Arquitetura de Consolidação (Versão 2.1)
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Revisão 2.1 • Março/2025
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            A Versão 2.1 integra a <b>Onda 3 — Mobilidade Ativa</b>, elevando o{' '}
            <b>IMA (Índice de Manutenção de Acessibilidade)</b> de status planejado para{' '}
            <b>sub-índice real calculado</b> por sensores em pedestres, ciclistas e motociclistas,
            preservando a integridade do <b>IMV (Índice de Manutenção Viária)</b> e consolidando o{' '}
            <b>IMM (Índice de Mobilidade do Município)</b>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* IMM */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-2 border-[#3B82F6]/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#60A5FA] text-sm">IMM</span>
                <span className="text-[10px] font-mono uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2 py-0.5 rounded font-bold">
                  Índice-Síntese
                </span>
              </div>
              <h3 className="font-bold text-[#F8FAFC] text-sm">
                Índice de Mobilidade do Município
              </h3>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                Número soberano no Modo Gabinete do Prefeito. Consolida os sub-índices ativos
                através de peso declarado e transparente.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[11px] font-mono text-[#CBD5E1]">
                <b>Ponderação Declarada:</b>
                <div className="text-[10px] text-[#A7F3D0] mt-0.5">
                  • Com IMA coletado: 70% IMV + 30% IMA
                </div>
                <div className="text-[10px] text-[#94A3B8]">
                  • Sem coleta a pé: 100% IMV (sem inventar dado)
                </div>
              </div>
            </div>

            {/* IMV */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#10B981] text-sm">IMV</span>
                <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded font-bold">
                  Sub-índice Viário
                </span>
              </div>
              <h3 className="font-bold text-[#F8FAFC] text-sm">Índice de Manutenção Viária</h3>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                Permanece <b>intocado</b>: 4 pilares inerciais (IRI estimado, anomalias, aderência e
                criticidade) com validação tripla F ≥ 3 passagens.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[11px] font-mono text-[#10B981]">
                <b>Status:</b> Operacional (Frota Veicular)
              </div>
            </div>

            {/* IMA */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-2 border-[#10B981]/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#10B981] text-sm">IMA</span>
                <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded font-bold">
                  Sub-índice Acessibilidade
                </span>
              </div>
              <h3 className="font-bold text-[#F8FAFC] text-sm">
                Índice de Manutenção de Acessibilidade
              </h3>
              <p className="text-[#CBD5E1] leading-relaxed text-[11px]">
                Coleta real por pedestres (calçadas), ciclistas (ciclovias) e motociclistas
                (pistas). Fator K próprio, banda FFT especializada e viés de desvio tratado
                estatisticamente.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[11px] font-mono text-[#10B981]">
                <b>Status:</b> Onda 3 Real (Homologado)
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#A7F3D0]">
            <b>Princípio da Honestidade Metodológica & Estado Neutro:</b> Se o município não
            realizou coleta a pé ou em ciclovia, o IMA permanece em estado neutro declarado
            ("Aguardando Campo") e o IMM consolida exclusivamente o sub-índice com dados reais (100%
            IMV). Nunca são inventados números.
          </div>
        </div>

        {/* Seção Nova: Onda 3 — Módulo Mobilidade Ativa e Bandas FFT por Modo */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border-2 border-[#10B981]/50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#10B981]" />
              Onda 3 — Módulo Mobilidade Ativa & Acessibilidade (IMA)
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Engenharia dos Modos Ativos
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              A coleta de vibração em pedestres, ciclistas e motociclistas possui física mecânica
              distinta da suspensão veicular pesada. Portanto, a metodologia estabelece{' '}
              <b>bandas espectrais FFT especializadas</b> e <b>Fatores K baselines dedicados</b>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#10B981]">
                  <span>1. Pedestre (Calçadas)</span>
                  <span className="font-mono text-[11px] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                    K = 0,75
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#60A5FA]">
                  Banda FFT: 0,8 a 3,5 Hz (Cadência do Passo)
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  O passo humano atua como filtro passa-baixa. Detecta fissuras em ladrilhos,
                  degraus, desníveis de raiz e rampas inacessíveis sem confundir o balanço normal do
                  caminhar.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#38BDF8]">
                  <span>2. Ciclista (Ciclovias)</span>
                  <span className="font-mono text-[11px] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded">
                    K = 1,45
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#60A5FA]">
                  Banda FFT: 2,0 a 12,0 Hz (Micromobilidade)
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Garfo rígido e pneus de alta pressão transmitem impactos secos diretamente ao
                  sensor. Equalizado para sarjetas transversais, tampas de bueiro desniveladas e
                  emendas de ciclovia.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#F59E0B]">
                  <span>3. Motociclista (Pistas)</span>
                  <span className="font-mono text-[11px] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">
                    K = 1,25
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#60A5FA]">
                  Banda FFT: 3,0 a 22,0 Hz (Duas Rodas)
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Suspensão telescópica dianteira e alta agilidade. Utilizado como complemento de
                  densidade de cobertura da malha, operando em sincronia com o tratamento de viés de
                  desvio.
                </p>
              </div>
            </div>

            {/* Viés de Desvio Declarado */}
            <div className="p-4 rounded-xl bg-[#070D1F] border border-[#F59E0B]/40 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F59E0B]">
                <Scale className="w-4 h-4" />
                <span>Tratamento Estatístico do Viés de Desvio Declarado</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Ao contrário de ônibus e caminhões — que trafegam em faixas fixas e passam sobre
                buracos —, <b>pedestres e motociclistas instintivamente desviam dos obstáculos</b>.
                Se processássemos apenas o impacto vertical Z direto, calçadas intransitáveis
                poderiam ser falsamente classificadas como sadias.
              </p>
              <div className="text-xs text-[#94A3B8] space-y-1 font-mono text-[11px]">
                <p>
                  • <b>Mapeamento Angular Lateral:</b> A taxa de variação giroscópica de roll (&gt;
                  32°/s) sem impacto vertical correspondente é registrada como manobra evasiva.
                </p>
                <p>
                  • <b>Padrão de Desvio Coletivo:</b> Quando 3 ou mais passagens registram manobra
                  de desvio nas mesmas coordenadas (segmento de 100m), o ponto é contabilizado como
                  anomalia indireta no Pilar B/C do IMA.
                </p>
                <p>
                  • <b>Motocicleta como Complemento:</b> A coleta em motos entra como reforço de
                  amostragem e malha, nunca como fonte exclusiva isolada para homologação de
                  calçadas.
                </p>
              </div>
            </div>

            {/* Compromisso LGPD */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#CBD5E1] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#10B981]" />
                  Compromisso LGPD na Mobilidade Ativa & Governança de Dados:
                </span>
                <Link
                  to="/privacidade"
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#38BDF8] hover:underline"
                >
                  <span>Política de Privacidade Completa</span>
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>
              <p className="text-[#94A3B8] leading-relaxed">
                A coleta a pé e de bicicleta mantém a diretriz soberana:{' '}
                <b>
                  zero câmeras, zero fotos, zero gravação de áudio e zero identificação de pessoas
                </b>
                . O celular do cidadão ou do fiscal pode ir seguro no{' '}
                <b>bolso da calça, mochila ou suporte</b>. Apenas vetores inerciais anônimos e
                geolocalização autorizada por janela temporal são transmitidos.
              </p>
              <div className="pt-2 border-t border-[#1A2A5A] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-[#A7F3D0]">
                  • Retenção estrita de 180 dias para telemetria bruta • Anonimização por design
                  (Art. 12 LGPD)
                </span>
                <Link
                  to="/privacidade"
                  className="text-[#60A5FA] hover:text-white font-semibold underline"
                >
                  Consulte os direitos do titular e canal DPO em /privacidade
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* NOVA SEÇÃO: Indexação Espacial H3 & k-Anonimato (Versão 2.2) */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#10B981]/60 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Hexagon className="w-5 h-5 text-[#10B981]" />
              Indexação Espacial H3 Nativa & k-Anonimato (Versão 2.2)
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Inovação Metodológica v2.2
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              A Versão 2.2 estabelece a{' '}
              <b>
                indexação espacial hexagonal nativa H3 (Uber Hexagonal Hierarchical Spatial Index)
              </b>{' '}
              como a camada oficial de particionamento geográfico do produto. Cada leitura inercial
              e cada segmento viário recebe sua célula H3 gravada nativamente no momento exato da
              coleta em campo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resolução 9 - Eixo Veicular */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#3B82F6]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#60A5FA]">
                    Resolução 9 — Eixo Veicular
                  </span>
                  <span className="font-mono text-[11px] bg-[#3B82F6]/20 text-[#60A5FA] px-2 py-0.5 rounded font-bold">
                    Aresta ~174 m (Área ~0,1 km²)
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Adotada para frotas pesadas, ônibus urbanos, caminhões de coleta e viaturas
                  municipais. O raio de ~174 metros corresponde com precisão ao comprimento médio de
                  quadras viárias e quarteirões urbanos consolidados nas capitais brasileiras,
                  permitindo sintetizar o <b>IMV (Índice de Manutenção Viária)</b> em blocos
                  homogêneos de asfalto sem fragmentação excessiva de dados inerciais.
                </p>
              </div>

              {/* Resolução 10 - Modos Ativos */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#34D399]">
                    Resolução 10 — Modos Ativos
                  </span>
                  <span className="font-mono text-[11px] bg-[#10B981]/20 text-[#34D399] px-2 py-0.5 rounded font-bold">
                    Aresta ~65 m (Área ~0,015 km²)
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Adotada para pedestres, ciclistas e motociclistas na coleta do{' '}
                  <b>IMA (Índice de Manutenção de Acessibilidade)</b>. A alta resolução (~65 metros
                  de aresta) isola travessias elevadas, esquinas com rampas inacessíveis, fissuras
                  em calçadas de comércio denso e descontinuidades de ciclovias, garantindo foco
                  cirúrgico aos setores de urbanismo.
                </p>
              </div>
            </div>

            {/* k-Anonimato e Blindagem LGPD */}
            <div className="p-4 rounded-xl bg-[#070D1F] border border-[#10B981]/40 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#10B981]">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span>k-Anonimato Espacial (k ≥ 3 Sessões) & Blindagem LGPD (Art. 12)</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Em respeito irrestrito à Lei Geral de Proteção de Dados (Lei Federal nº
                13.709/2018), a plataforma ORBIS.UOS adota o{' '}
                <b>k-anonimato territorial obrigatório com limiar k = 3</b>:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#94A3B8] text-[11px] pl-1">
                <li>
                  <b className="text-[#F8FAFC]">Regra de Não Publicação Protetiva:</b> Uma célula
                  hexagonal H3{' '}
                  <b>
                    só é publicada ou exibida com scores IMV/IMA se contar com pelo menos 3 sessões
                    de coleta independentes
                  </b>{' '}
                  realizadas por veículos ou coletadores distintos.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">Status Honesto "Não Auditado":</b> Células com 1 ou
                  2 passagens permanecem identificadas honestamente como{' '}
                  <b>"Aguardando Campo / Não Auditado"</b>, com suas notas estritamente ocultadas
                  (retorno nulo via API). Nenhuma nota é deduzida arbitrariamente.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">Proibição Absoluta de Trajetória Individual:</b> Em
                  nenhum momento o portal público, as APIs GeoJSON ou relatórios externos exibem
                  rotas contínuas, linhas de trajeto de munícipes ou leituras inerciais brutas
                  isoladas. O dado é matematicamente irreversível.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Motor do IMV Físico (Auditoria Inercial Contínua da Malha Viária) */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#3B82F6]/40 space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#10B981]" />
            4. Motor do IMV Físico (Auditoria Inercial Contínua da Malha Viária)
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              O IMV (Índice de Manutenção Viária) é o sub-índice físico resultante da telemetria
              embarcada nos smartphones dos motoristas da frota municipal durante 30 dias
              ininterruptos de coleta passiva.
            </p>
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs space-y-1.5 font-mono">
              <div className="text-[#60A5FA] font-bold">
                Redação Técnica Obrigatória do Banco Mundial:
              </div>
              <div className="text-[#F8FAFC]">
                "IRI estimado por telemetria inercial, correlacionado ao método do Banco Mundial"
              </div>
              <div className="text-[#94A3B8] text-[11px]">
                (Resposta vertical no eixo Z filtrada por velocidade, com calibração por Fator K de
                Chassi).
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#A7F3D0]">
              <b>Escudo Anti-Falso-Positivo (Fator de Confiança F):</b> Um defeito viário só se
              converte em Ordem de Serviço (OS) após o registro de{' '}
              <b>pelo menos 3 passagens de veículos distintos</b> no mesmo segmento de 100 metros.
              Registros solitários são descartados.
            </div>

            {/* Calibração Empírica do Fator K mantida integralmente */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-2 border-[#3B82F6]/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F8FAFC] text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  Calibração Empírica do Fator K por Tipo de Veículo
                </span>
                <span className="text-[10px] font-mono text-[#60A5FA] bg-[#3B82F6]/15 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                  Transparência de Cálculo
                </span>
              </div>
              <p className="text-[#CBD5E1] leading-relaxed">
                Cada categoria de veículo-sensor (ônibus urbano, viatura policial, caminhão de
                coleta, ambulância do SAMU ou frota leve) possui massa suspensa e curva de
                amortecimento distintas. Para assegurar que o IMV mensure exclusivamente o estado do
                pavimento — e não a dinâmica do chassi — o sistema opera calibração empírica do
                Fator K:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#94A3B8] pl-1 font-mono text-[11px]">
                <li>
                  <b className="text-[#F8FAFC]">Critério de Elegibilidade:</b> Apenas sessões e
                  janelas sobre segmentos de 100 metros com Fator de Confiança F ≥ 3 passagens
                  validadas são processadas para calibração.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">
                    Método Primário (Razão em Segmentos Compartilhados):
                  </b>{' '}
                  Compara a aceleração vertical RMS e picos FFT da categoria avaliada em relação aos
                  demais veículos que trafegaram exatamente sobre o mesmo trecho físico.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">Método Secundário (Fallback de RMS Absoluto):</b> Na
                  ausência temporária de sobreposição direta, aplica a razão da aceleração vertical
                  média do lote frente à linha de base calibrada da malha.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">Trilha de Auditoria Institucional:</b> Nenhum fator
                  K é alterado em sigilo; toda aplicação grava o responsável, data/hora, valores
                  anteriores e motivo para fiscalização dos Tribunais de Contas (TCE/CGU).
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEÇÃO NOVA: Pacote Operacional B2G (Backups, Continuidade RTO/RPO & SLAs) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border-2 border-[#10B981]/60 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#10B981]" />
              Pacote Operacional & Sustentação Contínua B2G
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Conformidade Governamental
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            A metodologia de auditoria viária e governança municipal é respaldada por um{' '}
            <b>Pacote Operacional homologado</b> que assegura aos municípios contratantes,
            secretarias de obras e órgãos de controle (TCE/CGU) a perenidade dos dados, a
            continuidade do serviço e canais ágeis de resolução de incidentes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Backup & Restore */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Database className="w-4 h-4 text-[#3B82F6]" />
                <span>1. Política de Backup & Restore</span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Snapshots diários em nuvem gerenciada Skip Cloud, criptografia AES-256 e{' '}
                <b>procedimento formal de teste de restore em 5 fases</b> com registro em trilha de
                auditoria na collection <code>institucional_settings</code>.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[10px] font-mono text-[#F59E0B]">
                Status do Teste: Previsto (Pré-Piloto CPSI)
              </div>
            </div>

            {/* Continuidade RTO/RPO */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span>2. Continuidade (RTO/RPO)</span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                <b>RTO declarado de até 24h</b> e <b>RPO de até 24h</b>. Três cenários de
                contingência mitigados: failover de nuvem, cache local para falhas de APIs federais
                (<code>siconfi_cache</code>) e coleta offline em sombras de sinal 4G/5G.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[10px] font-mono text-[#10B981]">
                RTO: 24h • RPO: 24h Declarados
              </div>
            </div>

            {/* Suporte e SLAs */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Headphones className="w-4 h-4 text-[#F59E0B]" />
                <span>3. Suporte & SLAs</span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Canal oficial <code>contato@orbis-uos.gov.br</code>, atendimento em horário
                comercial (08h às 18h BRT) e matriz de SLA: P1 em 4h úteis, P2 em 8h úteis e P3 em 2
                dias úteis. Harmonizado com o Art. 48 da LGPD em <code>/privacidade</code>.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[10px] font-mono text-[#38BDF8]">
                SLA P1: 4h • Livro de Incidentes
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-sm text-white block">
                Consulte a Documentação de Governança, Implantação e Homologação B2G:
              </span>
              <p className="text-xs text-[#94A3B8]">
                A página <b>/operacao</b> detalha o 1º Teste de Restauração executado (5 fases, RTO
                24h); a página <b>/implantacao</b> documenta a Matriz RACI e critérios de aceite; a
                página <b>/homologacao</b> apresenta o Laudo Oficial do Dry-Run pré-go-live
                (protocolo ORBIS-DRYRUN-2026-001).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                to="/operacao"
                className="px-3 py-2 rounded-xl font-bold text-xs text-white bg-[#10B981] hover:bg-[#059669] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#10B981]/20"
              >
                <span>Operação (/operacao)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/implantacao"
                className="px-3 py-2 rounded-xl font-bold text-xs text-white bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#2563EB]/20"
              >
                <span>Implantação (/implantacao)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/homologacao"
                className="px-3 py-2 rounded-xl font-bold text-xs text-white bg-[#059669] hover:bg-[#047857] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#059669]/20"
              >
                <span>Laudo Dry-Run (/homologacao)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Ações Orçamentárias e Curva de Degradação */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#F59E0B]" />
            5. Faixas de Intervenção do IMV, Custos e Economia de até 10x
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono uppercase text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]">
                <tr>
                  <th className="py-2.5 px-3">Faixa IMV</th>
                  <th className="py-2.5 px-3">Classificação do Pavimento</th>
                  <th className="py-2.5 px-3">Ação Orçamentária Recomendada</th>
                  <th className="py-2.5 px-3">Custo Médio / m²</th>
                  <th className="py-2.5 px-3">Economia vs. Emergência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]">
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#10B981]">85 a 100</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">Pavimento Sadio</td>
                  <td className="py-3 px-3 text-[#CBD5E1]">Monitoramento Passivo</td>
                  <td className="py-3 px-3 font-mono text-[#10B981]">R$ 0/m²</td>
                  <td className="py-3 px-3 text-[#10B981] font-bold">100% de prevenção</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#3B82F6]">70 a 84</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                    Desgaste Superficial Precoce
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Microrrevestimento / Selagem de Trincas
                  </td>
                  <td className="py-3 px-3 font-mono text-[#60A5FA]">~R$ 18/m²</td>
                  <td className="py-3 px-3 text-[#10B981] font-bold">Até 10x menor</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#F59E0B]">50 a 69</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                    Degradação Moderada a Grave
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">Fresagem e Recapeamento CBUQ 3-5 cm</td>
                  <td className="py-3 px-3 font-mono text-[#F59E0B]">~R$ 65/m²</td>
                  <td className="py-3 px-3 text-[#F59E0B]">Economia moderada (3x)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#EF4444]">0 a 49</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                    Colapso de Base Estrutural
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Reconstrução Profunda de Base e Asfalto
                  </td>
                  <td className="py-3 px-3 font-mono text-[#EF4444]">~R$ 190/m²</td>
                  <td className="py-3 px-3 text-[#EF4444]">Custo máximo (obra civil pesada)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* NOVA SEÇÃO: Matriz de Controles de Segurança & Governança B2G (Versão 0.0.27) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border-2 border-[#1E3A8A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#10B981]" />
              Matriz de Controles de Segurança, RBAC & Governança B2G (v0.0.29)
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Auditado & Homologado
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Em conformidade com o <b>Marco Legal das Startups (LC 182/2021, Art. 27)</b>, a{' '}
            <b>LGPD (Lei 13.709/2018)</b> e as orientações dos Tribunais de Contas (TCEs), a
            plataforma ORBIS UOS implementa uma matriz de controles ativos de segurança da
            informação, integrando papéis formais, ciclo de vida de contas e descarte programado de
            telemetria:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Controle 1: RBAC */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">1. RBAC Admin / Operador</span>
                <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded font-bold">
                  Ativo
                </span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Segregação de privilégios via API rules: <code>admin</code> gerencia contas, Modo
                Gabinete e parâmetros municipais; <code>operador</code> restringe-se à coleta
                inercial e cockpit técnico.
              </p>
            </div>

            {/* Controle 2: Auto-registro */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">2. Bloqueio de Auto-registro</span>
                <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded font-bold">
                  Ativo
                </span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Criação pública anônima bloqueada via <code>createRule</code> (exige administrador
                autenticado). Contas geradas sob matrícula e designação oficial.
              </p>
            </div>

            {/* Controle 3: Trilha com Autoria */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">3. Autoria Obrigatória</span>
                <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded font-bold">
                  Ativo
                </span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Mutação em contas, Fator K ou configurações grava evento na Trilha de Auditoria com
                ID, nome, e-mail, papel e carimbo de tempo ISO para o TCE.
              </p>
            </div>

            {/* Controle 4: Purga 180d */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">4. Purga Diária 180 Dias</span>
                <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded font-bold">
                  Cron 03h30
                </span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Job agendado <code>telemetry_purge_180d</code> elimina fisicamente telemetria bruta
                &gt;180 dias, retendo apenas médias e índices IMV/IMA consolidados.
              </p>
            </div>

            {/* Controle 5: Status de Contas */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">5. Status da Conta</span>
                <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded font-bold">
                  Ativo/Desat.
                </span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Agentes desligados têm a conta desativada sem apagar logs pretéritos. Acesso
                bloqueado em tempo real com preservação da custódia probatória.
              </p>
            </div>

            {/* Controle 6: Termos de Uso */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">6. Termos de Uso (/termos)</span>
                <span className="font-mono text-[10px] text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded font-bold">
                  Público
                </span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Cláusulas de soberania exclusiva de dados do ente público, vedação ao <i>lock-in</i>{' '}
                e exportação aberta garantidas na página dedicada.
              </p>
            </div>

            {/* Controle 7: Laudo Oficial de Dry-Run de Homologação */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-2 border-[#10B981]/50 space-y-2 md:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F8FAFC] text-sm flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#10B981]" />
                  7. Laudo Oficial de Dry-Run de Homologação (ORBIS-DRYRUN-2026-001)
                </span>
                <span className="font-mono text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded font-bold border border-[#10B981]/30">
                  Homologado com Ressalvas
                </span>
              </div>
              <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                Ensaio do primeiro go-live executado item a item contra a base real de produção
                (Skip Cloud). 5 critérios aprovados Conformes sem ressalvas (RBAC endurecido,
                k-anonimato H3 k ≥ 3, motor IMV/IMA F ≥ 3, autoria nominal na trilha de auditoria e
                restauração de backup RTO 1,45s), 1 critério Conforme com Ressalva (fila offline
                validada em simulação, aguardando túnel com frota física) e 1 critério Não
                Verificável em Ensaio (portaria discricionária de fiscais do município).
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <span className="font-mono text-[#34D399]">
                  Protocolo: ORBIS-DRYRUN-2026-001 • RTO Aferido: 1,45s • Hash SHA-256 no Laudo
                </span>
                <Link
                  to="/homologacao"
                  className="font-bold text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>Acessar Laudo Completo (/homologacao)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#3B82F6]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-sm text-white block">
                Emita o Relatório de Segurança Interno ou consulte os Termos de Uso:
              </span>
              <p className="text-xs text-[#94A3B8]">
                Documentos oficiais com hash criptográfico SHA-256 e fé pública digital para
                admissibilidade em processos de compras públicas.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/termos"
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0A1128] hover:bg-[#101B3A] border border-[#38BDF8]/50 text-[#38BDF8] flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Termos de Uso (/termos)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleDownloadRelatorioSeguranca}
                disabled={isGeneratingSecPdf || isGeneratingPdf}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#064E3B] hover:bg-[#065F46] border border-[#10B981]/50 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingSecPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#A7F3D0]" />
                    <span>Gerando Relatório...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-[#A7F3D0]" />
                    <span>Baixar Relatório (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Banner de Encerramento com CTA para Dossiê e Enquadramento */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#1A2A5A] border border-[#3B82F6]/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[11px] font-mono text-[#60A5FA] font-bold">
              <FileText className="w-3.5 h-3.5" />
              Evidência Institucional Oficial para Formulários & Editais
            </div>
            <h3 className="text-lg font-bold text-white">
              Precisa apresentar a arquitetura técnica completa para sua equipe ou órgão de
              controle?
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Baixe o Dossiê de Arquitetura em PDF com capa institucional, matrizes matemáticas dos
              4 pilares do IMV, bandas FFT dos modos ativos, catálogo de endpoints e hash
              criptográfico SHA-256.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadRelatorioSeguranca}
              disabled={isGeneratingSecPdf || isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#064E3B] hover:bg-[#065F46] border border-[#10B981]/50 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingSecPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#A7F3D0]" />
                  <span>Gerando Relatório...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-[#A7F3D0]" />
                  <span>Relatório de Segurança (PDF)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadDossie}
              disabled={isGeneratingPdf || isGeneratingSecPdf}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#3B82F6]/50 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#38BDF8]" />
                  <span>Baixar Dossiê de Arquitetura (PDF)</span>
                </>
              )}
            </button>

            <Link
              to="/enquadramento"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/25 text-center transition-all"
            >
              Iniciar Enquadramento CPSI
            </Link>
          </div>
        </div>

        {/* Botão de retorno */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <Link
            to="/"
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a página inicial
          </Link>
          <span className="text-[#64748B] font-mono text-[11px]">
            ORBIS.UOS • Metodologia v2.2 Homologada • Release v0.0.29 • 2025–2026
          </span>
        </div>
      </div>
    </div>
  )
}
