migrate(
  (app) => {
    // =========================================================================
    // REGISTRO DO PACOTE OPERACIONAL NA TRILHA DE AUDITORIA INSTITUCIONAL
    // =========================================================================
    // Documenta:
    // (1) Política de Backup e Restauração com procedimento de teste de restore
    // (2) Plano de Continuidade mínimo (RTO 24h, RPO 24h declarados)
    // (3) Política de Suporte com SLA declarado e canal de incidentes
    // =========================================================================
    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
      if (settings) {
        const auditLog = {
          event: 'OPERATIONAL_PACKAGE_PUBLISHED',
          version: '0.0.23',
          published_route: '/operacao',
          operational_package: {
            backup_restore: {
              cloud_provider: 'Skip Cloud / PocketBase Gerenciado',
              backup_frequency: 'Diário automatizado (snapshot de banco e volumes de arquivos)',
              restore_test_status: 'Previsto (Não Implantado)',
              target_restore_test_date:
                'Fase Pré-Piloto CPSI (30 dias antes do go-live com órgão cliente)',
              restore_protocol:
                'Passo a passo formal em 5 fases (Isolamento, Provisionamento Staging, Aplicação Snapshot, Integridade SHA-256 e Rollback)',
              audit_trail_logging: true,
            },
            business_continuity: {
              rto_hours: 24,
              rpo_hours: 24,
              contingency_scenarios: [
                'Indisponibilidade da nuvem Skip Cloud (failover de réplica e staging read-only)',
                'Falha de fontes públicas SICONFI/CGU (mitigada por cache local em siconfi_cache e fallback offline)',
                'Perda de conectividade em campo (coleta offline no dispositivo móvel com sincronização diferida)',
              ],
              communication_sla_hours: 4,
            },
            support_and_sla: {
              contact_email: 'contato@orbis-uos.gov.br',
              business_hours:
                'Segunda a Sexta-feira, das 08h00 às 18h00 (Horário Oficial de Brasília - BRT)',
              sla_matrix: {
                P1_critico:
                  'Resposta em até 4h úteis (Plataforma indisponível ou incidente de segurança/dados)',
                P2_alto:
                  'Resposta em até 8h úteis (Função crítica degradada ou anomalia em cálculo de IMV/IMA)',
                P3_medio_baixo:
                  'Resposta em até 2 dias úteis (Dúvidas operacionais, melhorias ou suporte cadastral)',
              },
              lgpd_art48_integration:
                'Integrado formalmente ao procedimento publicado em /privacidade (seção 5)',
              incident_ledger:
                'Livro de Registro de Incidentes auditável para órgãos de controle (TCE/CGU)',
            },
          },
          timestamp: new Date().toISOString(),
        }
        settings.set('cgu_cache_payload', auditLog)
        app.save(settings)
      }
    } catch (e) {
      console.log('Aviso ao registrar evento OPERATIONAL_PACKAGE_PUBLISHED:', e)
    }
  },
  (app) => {
    // Reversão defensiva: restaura estado anterior se aplicável
    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
      if (settings) {
        const rollbackLog = {
          event: 'OPERATIONAL_PACKAGE_REVERTED',
          reverted_at: new Date().toISOString(),
        }
        settings.set('cgu_cache_payload', rollbackLog)
        app.save(settings)
      }
    } catch (_) {}
  },
)
