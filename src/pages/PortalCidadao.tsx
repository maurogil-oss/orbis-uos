import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Info,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react'
import { listRoadEvents, RoadEventRecord } from '@/services/roadEvents'
import {
  getInstitucionalSettings,
  InstitucionalSettingsRecord,
} from '@/services/institucionalSettings'

export default function PortalCidadao() {
  const [settings, setSettings] = useState<InstitucionalSettingsRecord | null>(null)
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true)
  const [events, setEvents] = useState<RoadEventRecord[]>([])
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true)

  // Filtros de busca pública pelo cidadão
  const [searchVia, setSearchVia] = useState<string>('')
  const [selectedBairro, setSelectedBairro] = useState<string>('todos')
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')

  useEffect(() => {
    // 1. Carregar configurações da cidade (Curitiba - 4106902)
    getInstitucionalSettings('4106902')
      .then((cfg) => {
        setSettings(cfg)
      })
      .catch((err) => console.warn('Erro ao carregar configurações institucionais:', err))
      .finally(() => setLoadingSettings(false))

    // 2. Carregar eventos viários
    listRoadEvents()
      .then((data) => setEvents(data))
      .catch((err) => console.warn('Erro ao listar eventos:', err))
      .finally(() => setLoadingEvents(false))
  }, [])

  const bairrosList = Array.from(
    new Set(events.map((e) => e.bairro).filter(Boolean) as string[]),
  ).sort()

  const filteredEvents = events.filter((e) => {
    if (selectedBairro !== 'todos' && e.bairro !== selectedBairro) return false
    if (selectedStatus !== 'todos' && e.status !== selectedStatus) return false
    if (searchVia.trim()) {
      const q = searchVia.toLowerCase()
      const matchVia = e.via.toLowerCase().includes(q)
      const matchBairro = (e.bairro || '').toLowerCase().includes(q)
      if (!matchVia && !matchBairro) return false
    }
    return true
  })

  // Tradução cidadã dos estágios operacionais
  const getCitizenStatusInfo = (status: string) => {
    switch (status) {
      case 'detectado':
        return {
          label: 'Defeito Identificado',
          step: 1,
          color: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/40',
          desc: 'Identificado pela frota pública em circulação passiva diária.',
        }
      case 'triagem':
        return {
          label: 'Na Fila de Engenharia',
          step: 2,
          color: 'text-[#60A5FA] bg-[#3B82F6]/15 border-[#3B82F6]/40',
          desc: 'Classificado segundo a Matriz de Prioridade Zero e fluxo da via.',
        }
      case 'os_emitida':
        return {
          label: 'Ordem de Reparo Emitida',
          step: 3,
          color: 'text-[#818CF8] bg-[#818CF8]/15 border-[#818CF8]/40',
          desc: 'Programação oficial enviada à equipe técnica de manutenção asfáltica.',
        }
      case 'reparado':
        return {
          label: 'Via Reparada',
          step: 4,
          color: 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40',
          desc: 'Reparo executado e validado em campo pelas novas passagens da frota.',
        }
      default:
        return {
          label: 'Em Acompanhamento',
          step: 1,
          color: 'text-[#CBD5E1] bg-[#101B3A] border-[#1A2A5A]',
          desc: 'Registro sob monitoramento da gestão de mobilidade.',
        }
    }
  }

  // Se estiver carregando configurações institucionais
  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-[#070D1F] flex items-center justify-center p-4">
        <div className="text-sm text-[#94A3B8] flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-[#3B82F6]" />
          Carregando portal de transparência municipal...
        </div>
      </div>
    )
  }

  // Se o portal público NÃO estiver ativado pela administração municipal
  const portalAtivo = settings?.portal_publico_ativo === true

  if (!portalAtivo) {
    return (
      <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] flex flex-col justify-between pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-xl w-full mx-auto text-center space-y-6 my-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] text-[#94A3B8] shadow-xl">
            <Lock className="w-8 h-8 text-[#94A3B8]" />
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase bg-[#101B3A] text-[#94A3B8] px-3 py-1 rounded-full border border-[#1A2A5A] font-semibold">
              Portal do Cidadão • {settings?.municipio || 'Curitiba'} / {settings?.uf || 'PR'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              O portal de acompanhamento não está ativado nesta cidade.
            </h1>
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-md mx-auto">
              A publicação externa do acompanhamento de reparos viários é uma decisão soberana e
              opcional da administração municipal, prevista como compromisso de transparência ativa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A]/70 border border-[#1A2A5A] text-left text-xs text-[#CBD5E1] space-y-2">
            <div className="flex items-center gap-2 text-[#60A5FA] font-bold">
              <Building2 className="w-4 h-4" />
              <span>Informação aos Gestores Públicos</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              O gestor municipal pode ativar este canal público a qualquer momento através do painel
              de configurações do <b>Modo Gabinete</b>, formalizando o compromisso de prestação de
              contas direta com os munícipes.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#F8FAFC] transition-colors"
            >
              Voltar à Página Inicial
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all shadow-md shadow-[#3B82F6]/30 flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Acesso Institucional da Prefeitura</span>
            </Link>
          </div>
        </div>

        <div className="text-center text-[10px] text-[#64748B] pt-8">
          ORBIS.UOS • Governança Urbana Soberana • O gestor decide; o sistema documenta.
        </div>
      </div>
    )
  }

  // SE O PORTAL ESTIVER ATIVADO: Visualização completa do cidadão
  const reparadosCount = events.filter((e) => e.status === 'reparado').length
  const osCount = events.filter((e) => e.status === 'os_emitida').length
  const naFilaCount = events.filter(
    (e) => e.status === 'triagem' || e.status === 'detectado',
  ).length

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Banner Institucional do Cidadão */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#101B3A] via-[#12224A] to-[#101B3A] border border-[#10B981]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-xs font-bold text-[#10B981]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Portal da Transparência Ativa • Cidade Aberta</span>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]">
                {settings.municipio} / {settings.uf} • Código IBGE {settings.codigo_ibge}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#F8FAFC]">
                Acompanhamento Público de Reparos Viários
              </h1>
              <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-3xl mt-2 leading-relaxed">
                {settings.portal_mensagem_institucional ||
                  'Consulte com total clareza a situação do asfalto, os trechos identificados e o andamento das ordens de serviço emitidas pela administração municipal para o seu bairro.'}
              </p>
            </div>

            {/* Compromisso de Accountability em destaque */}
            <div className="p-3.5 rounded-xl bg-[#0A1128]/80 border border-[#1A2A5A] text-xs text-[#94A3B8] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#60A5FA] shrink-0" />
              <span>
                <b>Compromisso de Gestão Pública Responsável:</b> A prioridade dos reparos segue
                estritamente critérios técnicos de engenharia (aferidos passivamente pelos veículos
                de transporte público), sem favorecimento eleitoreiro.
              </span>
            </div>
          </div>
        </div>

        {/* 3 Cartões de Síntese Cidadã */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
            <span className="text-xs text-[#94A3B8] block">Vias Já Reparadas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#10B981]">{reparadosCount}</span>
              <span className="text-xs font-medium text-[#10B981]">trechos concluídos</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Intervenções asfálticas finalizadas com validação física do pavimento.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#3B82F6]/40 space-y-1">
            <span className="text-xs text-[#94A3B8] block">Ordens de Reparo Emitidas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#60A5FA]">{osCount}</span>
              <span className="text-xs font-medium text-[#60A5FA]">em execução / agendadas</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Equipes de obras acionadas com cronograma de recapeamento ou tapa-buraco estrutural.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
            <span className="text-xs text-[#94A3B8] block">Em Triagem e Fila Técnica</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-[#F59E0B]">{naFilaCount}</span>
              <span className="text-xs font-medium text-[#F59E0B]">pontos monitorados</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Aguardando janela operacional conforme classificação da Matriz de Prioridade Zero.
            </p>
          </div>
        </div>

        {/* Barra de Busca e Filtros para o Munícipe */}
        <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchVia}
                onChange={(e) => setSearchVia(e.target.value)}
                placeholder="Busque pelo nome da sua rua, avenida ou praça..."
                className="w-full bg-[#0A1128] border border-[#1A2A5A] focus:border-[#10B981] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <span>Bairro:</span>
                <select
                  value={selectedBairro}
                  onChange={(e) => setSelectedBairro(e.target.value)}
                  className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#10B981]"
                >
                  <option value="todos">Todos os bairros</option>
                  {bairrosList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <span>Situação:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#10B981]"
                >
                  <option value="todos">Todas as situações</option>
                  <option value="reparado">Reparado</option>
                  <option value="os_emitida">Ordem Emitida</option>
                  <option value="triagem">Na Fila</option>
                  <option value="detectado">Identificado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#94A3B8] flex items-center justify-between pt-1">
            <span>
              Exibindo <b>{filteredEvents.length}</b> vias monitoradas
            </span>
            <span className="italic">
              Atualização automática sincronizada com os ônibus em operação
            </span>
          </div>
        </div>

        {/* Lista de Vias com Linha de Tempo Visual do Reparo */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] text-center text-xs text-[#94A3B8] space-y-2">
              <MapPin className="w-6 h-6 mx-auto text-[#94A3B8]" />
              <p>Nenhuma via encontrada para o termo pesquisado.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchVia('')
                  setSelectedBairro('todos')
                  setSelectedStatus('todos')
                }}
                className="text-xs text-[#10B981] hover:underline font-semibold"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const info = getCitizenStatusInfo(ev.status)
              return (
                <div
                  key={ev.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6]/60 transition-all shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
                        <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC]">{ev.via}</h3>
                      </div>
                      <div className="text-xs text-[#94A3B8] pl-6 flex items-center gap-2">
                        <span>
                          Bairro: <b>{ev.bairro || 'Curitiba'}</b>
                        </span>
                        <span>•</span>
                        <span>
                          Tipo de irregularidade: <b>{ev.tipo.toUpperCase()}</b>
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${info.color} inline-flex items-center gap-1.5`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {info.label}
                      </span>
                    </div>
                  </div>

                  {/* Linha de Progresso Cidadão de 4 Fases */}
                  <div className="pt-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-[#94A3B8]">
                      <div
                        className={`p-2 rounded-lg border transition-all ${
                          info.step >= 1
                            ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#60A5FA]'
                            : 'bg-[#0A1128] border-[#1A2A5A]'
                        }`}
                      >
                        1. Detectado
                      </div>
                      <div
                        className={`p-2 rounded-lg border transition-all ${
                          info.step >= 2
                            ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#60A5FA]'
                            : 'bg-[#0A1128] border-[#1A2A5A]'
                        }`}
                      >
                        2. Na Fila
                      </div>
                      <div
                        className={`p-2 rounded-lg border transition-all ${
                          info.step >= 3
                            ? 'bg-[#818CF8]/20 border-[#818CF8] text-[#818CF8]'
                            : 'bg-[#0A1128] border-[#1A2A5A]'
                        }`}
                      >
                        3. OS Emitida
                      </div>
                      <div
                        className={`p-2 rounded-lg border transition-all ${
                          info.step >= 4
                            ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                            : 'bg-[#0A1128] border-[#1A2A5A]'
                        }`}
                      >
                        4. Reparado
                      </div>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-2 italic">{info.desc}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé de Governança */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] text-center space-y-2">
          <p className="text-xs text-[#CBD5E1]">
            Deseja entender como o município calcula a saúde do asfalto e a priorização das obras?
          </p>
          <Link
            to="/metodologia"
            className="inline-flex items-center gap-1.5 text-xs text-[#3B82F6] hover:text-[#60A5FA] font-bold underline"
          >
            <span>Conheça a Metodologia Científica e o Índice de Mobilidade Municipal (IMM)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
