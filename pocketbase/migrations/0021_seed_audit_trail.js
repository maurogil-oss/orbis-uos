migrate(
  (app) => {
    // =========================================================================
    // SEED DA TRILHA DE AUDITORIA EM institucional_settings
    // =========================================================================
    try {
      const curitibaSettings = app.findFirstRecordByData(
        'institucional_settings',
        'codigo_ibge',
        '4106902',
      )
      if (curitibaSettings) {
        const now = new Date()
        const initialTrail = [
          {
            id: 'evt_' + now.getTime() + '_roles',
            event: 'ROLE_BASED_ACCOUNTS_IMPLEMENTED',
            author: {
              id: 'system_migration_0021',
              email: 'sistema@orbis.gov.br',
              name: 'SISTEMA',
              role: 'system',
            },
            details: {
              description:
                'Implementação de contas individuais com papéis RBAC (admin e operador) e bloqueio formal de auto-registro público.',
              roles_matrix: {
                admin:
                  'Acesso total, gestão de contas de agentes do órgão, auditoria e configurações.',
                operador:
                  'Acesso à coleta de campo, cockpit técnico e visualizações; sem gestão de usuários.',
              },
              public_signup_blocked: true,
              users_seeded: [
                'institucional@orbis.gov.br (admin)',
                'operador@orbis.gov.br (operador)',
              ],
            },
            compliance: 'Art. 27 LC 182/2021 & Princípio do Menor Privilégio LGPD',
            timestamp: now.toISOString(),
          },
          {
            id: 'evt_' + (now.getTime() - 1000) + '_terms',
            event: 'TERMS_OF_USE_PUBLISHED',
            author: {
              id: 'system_migration_0021',
              email: 'sistema@orbis.gov.br',
              name: 'SISTEMA',
              role: 'system',
            },
            details: {
              description:
                'Publicação formal dos Termos de Uso do ORBIS UOS em /termos, com protocolo, hash SHA-256 e exportação em PDF homologado.',
              route: '/termos',
              controller: 'ORBIS UOS GovTech',
              data_ownership:
                'Dados pertencem soberanamente ao órgão contratante em formato aberto GeoJSON/PDF',
            },
            compliance: 'Lei 13.709/2018 (LGPD) & Marco Legal das Startups (LC 182/2021)',
            timestamp: new Date(now.getTime() - 1000).toISOString(),
          },
          {
            id: 'evt_' + (now.getTime() - 2000) + '_purge_job',
            event: 'TELEMETRY_PURGE_JOB_INITIALIZED',
            author: {
              id: 'system_cron',
              email: 'sistema@orbis.gov.br',
              name: 'SISTEMA (Cron)',
              role: 'system',
            },
            details: {
              description:
                'Rotina diária automatizada de purga de telemetria bruta com mais de 180 dias inicializada (03h30 BRT / cronAdd telemetry_purge_180d).',
              retention_days: 180,
              collections_monitored: ['segment_readings', 'field_sessions'],
              preserved: 'Índices agregados por segmento (road_segments / IMV e IMA)',
            },
            compliance: 'Política de Privacidade / LGPD Art. 16 (Retenção Estrita 180d)',
            timestamp: new Date(now.getTime() - 2000).toISOString(),
          },
        ]

        curitibaSettings.set('audit_trail', JSON.stringify(initialTrail))
        app.save(curitibaSettings)
      }
    } catch (e) {
      console.log('Aviso ao inicializar audit_trail na migração 0021:', e)
    }
  },
  (app) => {
    try {
      const curitibaSettings = app.findFirstRecordByData(
        'institucional_settings',
        'codigo_ibge',
        '4106902',
      )
      if (curitibaSettings) {
        curitibaSettings.set('audit_trail', null)
        app.save(curitibaSettings)
      }
    } catch (_) {}
  },
)
