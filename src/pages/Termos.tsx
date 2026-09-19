import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Shield,
  CheckCircle2,
  Lock,
  Download,
  ExternalLink,
  ChevronRight,
  Database,
  Building2,
  Users,
  Clock,
  KeyRound,
  FileCheck,
  Scale,
  Sparkles,
  AlertCircle,
  Share2,
} from 'lucide-react'
import { computeSha256 } from '@/lib/diagnostics/pdfReport'
import { generateTermosUsoPdf } from '@/lib/diagnostics/termosUsoPdf'

export function Termos() {
  const [protocolo, setProtocolo] = useState<string>('ORBIS-TERMS-2026-0001')
  const [hashSha256, setHashSha256] = useState<string>('')
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false)
  const [copiedHash, setCopiedHash] = useState<boolean>(false)

  useEffect(() => {
    // Gerar hash estável da versão publicada dos termos
    const initHash = async () => {
      const payload = {
        documento: 'TERMOS_DE_USO_ORBIS_UOS',
        versao: '1.0 (Pós-Workshop 4 / Onda 1)',
        controlador: 'ORBIS UOS GovTech Tecnologia B2G',
        dataPublicacao: '2026-03-30',
        marcoLegal: 'Marco Legal das Startups (LC 182/2021) & LGPD (Lei 13.709/2018)',
        propriedadeDados: 'Exclusiva do Órgão Público Contratante (GeoJSON/PDF/CSV)',
        autenticidade: 'Fé Pública Digital Art. 10 MP 2.200-2/2001',
      }
      const hash = await computeSha256(payload)
      setHashSha256(hash)
    }
    initHash()
  }, [])

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      const result = await generateTermosUsoPdf({
        versaoTermos: '1.0 (Pós-Workshop 4)',
        orgaoInteressado: 'Administração Pública Municipal',
        responsavelNome: 'Acesso Institucional Homologado',
      })

      // Abrir janela de impressão com o HTML sanitizado e formatado para A4
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(result.htmlContent)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 500)
      } else {
        alert('Por favor, permita pop-ups no navegador para visualizar e baixar o PDF dos Termos.')
      }
    } catch (err) {
      console.error('Erro ao gerar PDF dos termos:', err)
      alert('Não foi possível gerar a via em PDF no momento.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleCopyHash = () => {
    if (!hashSha256) return
    navigator.clipboard.writeText(hashSha256)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#070C1E] text-[#F8FAFC] pb-24 selection:bg-[#3B82F6]/30">
      {/* Top Banner Institucional */}
      <div className="border-b border-[#1A2A5A] bg-[#0A1128]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#38BDF8] font-semibold">Termos de Uso</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-lg border border-[#10B981]/25 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Homologado B2G • Versão 1.0</span>
            </span>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] flex items-center gap-1.5 transition-all shadow-sm shadow-[#3B82F6]/25 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Gerando...' : 'Exportar PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Header Principal */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A8A]/40 border border-[#3B82F6]/40 text-[#60A5FA] text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Marco Jurídico B2G & Condições Gerais</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Termos de Uso e Condições Gerais da Plataforma ORBIS UOS
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-3xl">
            Regulamentação jurídica do uso de telemetria inercial, diagnóstico preditivo de malha
            viária, contas individuais com papéis (admin/operador) e titularidade soberana de dados
            para a Administração Pública e seus agentes credenciados.
          </p>

          <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Controlador Tecnológico:
              </span>
              <span className="font-bold text-white">ORBIS UOS GovTech Tecnologia B2G</span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Elegibilidade:
              </span>
              <span className="font-bold text-white">Órgãos Públicos & Agentes Credenciados</span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Soberania dos Dados:
              </span>
              <span className="font-bold text-[#10B981]">Exclusiva do Município Contratante</span>
            </div>
          </div>
        </div>

        {/* Resumo dos Pilares Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Contas Individuais com Papéis</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Fim do uso compartilhado. Contas nominais com papéis definidos: <b>admin</b> (gestão
              total e auditoria) e <b>operador</b> (coleta e consultas). Auto-registro público
              bloqueado.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Soberania & Formatos Abertos</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Todos os dados viários, mapas geoespaciais e relatórios pertencem ao órgão
              contratante. Exportação contínua em GeoJSON, Shapefile, CSV e PDF sem <i>lock-in</i>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Purga Automatizada de 180 Dias</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Job agendado diário elimina irreversivelmente dados inerciais brutos com mais de 180
              dias, preservando os índices agregados de pavimentação (conforme <b>/privacidade</b>).
            </p>
          </div>
        </div>

        {/* Artigos e Cláusulas Estruturadas */}
        <div className="space-y-6">
          {/* Seção 1 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1A2A5A]">
              <span className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-bold text-white">
                Identificação do Controlador e Objeto
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                <b>1.1.</b> A plataforma <b>ORBIS UOS (Urban Operating System)</b> é desenvolvida e
                mantida pela <b>ORBIS UOS GovTech</b>, pessoa jurídica especializada no fornecimento
                de soluções tecnológicas de base científica para a Administração Pública direta e
                indireta (B2G).
              </p>
              <p>
                <b>1.2.</b> O objeto destes Termos de Uso consiste no licenciamento de direito de
                uso e prestação de serviços de inteligência viária, abrangendo a aferição inercial
                contínua por smartphones (DeviceMotion a 50 Hz), cálculo do Índice Multicritério
                Viário (IMV), indexação espacial Uber H3 em resoluções 8 a 10, e emissão de ordens
                de serviço automatizadas para zeladoria do pavimento.
              </p>
            </div>
          </section>

          {/* Seção 2 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1A2A5A]">
              <span className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-bold text-white">
                Elegibilidade, Contas Individuais e Matriz de Papéis
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                <b>2.1. Bloqueio de Auto-registro Público:</b> Por razões de segurança institucional
                e conformidade com o Art. 27 da Lei Complementar nº 182/2021 (Marco Legal das
                Startups), a criação pública e aberta de contas de usuário é permanentemente
                bloqueada.
              </p>
              <p>
                <b>2.2. Criação por Administrador:</b> Novas contas só podem ser geradas por um
                Administrador autenticado do órgão contratante, mediante designação nominal de
                matrícula, e-mail corporativo ou oficial e atribuição estrita do papel
                correspondente.
              </p>
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <span className="font-bold text-white text-xs block">
                  Matriz de Papéis (Role-Based Access Control - RBAC):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0A1128] border border-[#3B82F6]/30">
                    <span className="font-bold text-[#60A5FA] block mb-1">
                      Papel Administrador (admin):
                    </span>
                    <span className="text-[#94A3B8]">
                      Gestão de usuários do órgão (criação, ativação e desativação), acesso total ao
                      Modo Gabinete, parametrizações do município, auditoria completa e acionamento
                      de purga de dados.
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A1128] border border-[#10B981]/30">
                    <span className="font-bold text-[#10B981] block mb-1">
                      Papel Operador (operador):
                    </span>
                    <span className="text-[#94A3B8]">
                      Acesso operacional à Coleta de Campo Real, cockpit técnico de engenharia e
                      visualização de anomalias viárias. Sem acesso à gestão de contas de outros
                      agentes.
                    </span>
                  </div>
                </div>
              </div>
              <p>
                <b>2.3. Autoria Registrada:</b> Todas as ações executadas na plataforma geram evento
                imutável na Trilha de Auditoria vinculando o ID do usuário, nome, e-mail
                institucional e papel exercido no momento da operação.
              </p>
            </div>
          </section>

          {/* Seção 3 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1A2A5A]">
              <span className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-bold text-white">Uso Aceitável da Coleta em Campo</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                <b>3.1.</b> A coleta de dados cinemáticos via smartphone baseia-se na API{' '}
                <code>DeviceMotionEvent</code> do navegador, convertendo variações de aceleração e
                espectro de frequência (FFT de 16 bandas na borda) em laudos de irregularidade.
              </p>
              <p>
                <b>3.2. Compromissos Operacionais do Agente de Campo:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#94A3B8]">
                <li>
                  Fixação rígida do aparelho no suporte veicular para evitar ruídos espúrios no eixo
                  Z.
                </li>
                <li>
                  Proibição estrita de manipulação do smartphone durante a condução do veículo, em
                  estrito respeito às regras do Código de Trânsito Brasileiro (CTB).
                </li>
                <li>
                  Utilização da funcionalidade exclusivamente em rotas públicas e para os fins da
                  zeladoria municipal ou fiscalização de contratos de concessão.
                </li>
              </ul>
            </div>
          </section>

          {/* Seção 4 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1A2A5A]">
              <span className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h2 className="text-lg font-bold text-white">
                Soberania dos Dados Públicos e Não-Retenção Indevida
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                <b>4.1. Titularidade Exclusiva:</b> Todos os dados brutos ou processados, medições
                de degradação, inventário de logradouros e ordens de serviço pertencem{' '}
                <span className="text-[#10B981] font-bold">
                  de maneira soberana e exclusiva ao órgão público contratante
                </span>
                .
              </p>
              <p>
                <b>4.2. Portabilidade e Padrões Abertos:</b> O órgão tem direito de extrair
                integralmente seus dados a qualquer momento nos padrões abertos OGC/GeoJSON, CSV,
                Shapefile e relatórios assinados em PDF com hash SHA-256, vedada qualquer imposição
                de aprisionamento tecnológico (<i>vendor lock-in</i>).
              </p>
              <p>
                <b>4.3. Purga Automática de Telemetria Bruta (&gt;180 dias):</b> As leituras brutas
                inerciais em <code>segment_readings</code> e sessões de campo são expurgadas
                definitivamente pelo job diário às 03h30 BRT após 180 dias, permanecendo no banco
                apenas os índices consolidados por segmento de via (IMV e IMA) necessários à
                prestação de contas aos órgãos de controle externo (TCE e CGU).
              </p>
            </div>
          </section>

          {/* Seção 5 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1A2A5A]">
              <span className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] font-bold text-xs flex items-center justify-center">
                5
              </span>
              <h2 className="text-lg font-bold text-white">Responsabilidades das Partes</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                <b>5.1. Obrigações da ORBIS UOS GovTech:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#94A3B8]">
                <li>
                  Manter a disponibilidade e integridade do sistema segundo os SLAs do Pacote
                  Operacional.
                </li>
                <li>
                  Executar diariamente a rotina de purga e registrar o balanço na trilha de
                  auditoria.
                </li>
                <li>
                  Não utilizar nem comercializar dados públicos viários para finalidades externas.
                </li>
              </ul>
              <p>
                <b>5.2. Obrigações do Órgão Público:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#94A3B8]">
                <li>
                  Zelar pelo sigilo das senhas institucionais e desativar contas de agentes
                  desligados.
                </li>
                <li>
                  Garantir a veracidade dos dados orçamentários inseridos no Enquadramento CPSI.
                </li>
                <li>
                  Utilizar a plataforma em consonância com as normas de contratação pública
                  vigentes.
                </li>
              </ul>
            </div>
          </section>

          {/* Seção 6 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1A2A5A]">
              <span className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] font-bold text-xs flex items-center justify-center">
                6
              </span>
              <h2 className="text-lg font-bold text-white">
                Proteção de Dados Pessoais (LGPD) e Trilha de Auditoria
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                <b>6.1.</b> O tratamento de dados pessoais de agentes públicos no ORBIS UOS rege-se
                pela{' '}
                <Link to="/privacidade" className="text-[#38BDF8] hover:underline font-bold">
                  Política de Privacidade Institucional (/privacidade)
                </Link>
                , que adota como fundamento o Princípio da Necessidade e Menor Privilégio da Lei
                Federal nº 13.709/2018 (LGPD).
              </p>
              <p>
                <b>6.2.</b> A Trilha de Auditoria com Autoria Gravada assegura transparência ativa e
                atendimento aos requisitos dos Tribunais de Contas Estaduais (TCE-PR, TCE-SP e
                congêneres), registrando qualquer mutação estrutural em contas ou configurações do
                município.
              </p>
            </div>
          </section>

          {/* Seção 7 */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1A2A5A]">
              <span className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] font-bold text-xs flex items-center justify-center">
                7
              </span>
              <h2 className="text-lg font-bold text-white">Vigência, Alterações e Foro</h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              <p>
                <b>7.1.</b> Estes Termos entram em vigor na data de publicação oficial no sistema e
                permanecem aplicáveis durante toda a execução dos contratos de licença ou acordos de
                cooperação técnica firmados com o ente público.
              </p>
              <p>
                <b>7.2.</b> Eventuais atualizações normativas serão comunicadas com antecedência de
                30 dias e arquivadas com versionamento cronológico e hash SHA-256 no sistema.
              </p>
              <p>
                <b>7.3. Foro de Eleição:</b> Fica eleito o Foro da Comarca da Capital do Estado sede
                do órgão público contratante para processar e julgar qualquer litígio oriundo destes
                Termos.
              </p>
            </div>
          </section>
        </div>

        {/* Rodapé de Integridade Criptográfica SHA-256 */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#1E3A8A] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#10B981]" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Autenticidade e Fé Pública Digital do Documento
                </h4>
                <span className="text-xs text-[#94A3B8]">
                  Protocolo Oficial: <span className="font-mono text-[#CBD5E1]">{protocolo}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyHash}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#CBD5E1] transition-all flex items-center gap-1.5"
              >
                {copiedHash ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[#10B981]">Hash Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copiar Hash SHA-256</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-1.5 transition-all shadow-md shadow-[#10B981]/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Termos em PDF</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#070C1E] border border-[#1A2A5A] text-xs font-mono text-[#38BDF8] break-all leading-relaxed">
            <span className="text-[#64748B] block text-[10px] uppercase mb-0.5">
              Hash Criptográfico SHA-256 (Art. 10 MP 2.200-2/2001):
            </span>
            {hashSha256 || 'Calculando assinatura digital SHA-256...'}
          </div>

          <div className="text-[11px] text-[#94A3B8] flex flex-wrap items-center justify-between gap-2 pt-1">
            <span>
              Homologado para uso institucional • Legislação aplicável: LC 182/2021 & Lei
              13.709/2018
            </span>
            <div className="flex items-center gap-3">
              <Link to="/privacidade" className="text-[#38BDF8] hover:underline font-medium">
                Política de Privacidade
              </Link>
              <span>•</span>
              <Link to="/operacao" className="text-[#38BDF8] hover:underline font-medium">
                Pacote Operacional
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Termos
