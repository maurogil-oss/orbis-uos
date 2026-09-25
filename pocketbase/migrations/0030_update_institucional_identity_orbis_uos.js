migrate(
  (app) => {
    // =========================================================================
    // MIGRAÇÃO 0030: ATUALIZAÇÃO DA IDENTIDADE INSTITUCIONAL PARA @orbis-uos.com.br
    // =========================================================================
    // 1. Atualizar e-mails das contas de demonstração e gestão na collection 'users'
    //    Preservando dados de terceiros / usuários reais como maurog1@hotmail.com.
    // =========================================================================

    const targetUsers = [
      {
        oldEmail: 'institucional@orbis.gov.br',
        newEmail: 'institucional@orbis-uos.com.br',
        name: 'Servidor Institucional (Gabinete)',
        role: 'admin',
      },
      {
        oldEmail: 'operador@orbis.gov.br',
        newEmail: 'operador@orbis-uos.com.br',
        name: 'Operador de Campo (Fiscalização)',
        role: 'operador',
      },
    ]

    for (let i = 0; i < targetUsers.length; i++) {
      const item = targetUsers[i]
      try {
        const userRec = app.findAuthRecordByEmail('_pb_users_auth_', item.oldEmail)
        userRec.setEmail(item.newEmail)
        userRec.setVerified(true)
        if (!userRec.get('name')) {
          userRec.set('name', item.name)
        }
        app.save(userRec)
        console.log(`[0030] Usuário atualizado de ${item.oldEmail} para ${item.newEmail}`)
      } catch (_) {
        // Se já foi atualizado ou não existe com e-mail antigo, verificar se já existe com o novo
        try {
          app.findAuthRecordByEmail('_pb_users_auth_', item.newEmail)
          console.log(`[0030] Usuário já possui e-mail ${item.newEmail}`)
        } catch (notFound) {
          console.log(`[0030] Usuário ${item.oldEmail} não encontrado para renomear`)
        }
      }
    }

    // =========================================================================
    // 2. Atualizar registros em 'api_keys' que tenham criado_por_email antigo
    // =========================================================================
    try {
      app
        .db()
        .newQuery(
          "UPDATE api_keys SET criado_por_email = 'sistema@orbis-uos.com.br' WHERE criado_por_email = 'sistema@orbis.gov.br' OR criado_por_email LIKE '%@orbis.gov.br'",
        )
        .execute()
    } catch (errKey) {
      console.log('[0030] Aviso ao atualizar api_keys:', errKey)
    }

    // =========================================================================
    // 3. Atualizar registros em 'sinistros_importados' que tenham operador_responsavel_email com domínio antigo da Orbis
    //    (Mantendo INTACTOS os e-mails de fontes oficiais como @cbm.pr.gov.br, @curitiba.pr.gov.br, @hotmail.com)
    // =========================================================================
    try {
      app
        .db()
        .newQuery(
          "UPDATE sinistros_importados SET operador_responsavel_email = 'operador@orbis-uos.com.br' WHERE operador_responsavel_email = 'operador@orbis.gov.br'",
        )
        .execute()
    } catch (errSin) {
      console.log('[0030] Aviso ao atualizar sinistros_importados:', errSin)
    }

    // =========================================================================
    // 4. Atualizar 'connectors_prf' que tenham operador_email com domínio antigo da Orbis
    // =========================================================================
    try {
      app
        .db()
        .newQuery(
          "UPDATE connectors_prf SET operador_email = 'operador@orbis-uos.com.br' WHERE operador_email = 'operador@orbis.gov.br'",
        )
        .execute()
    } catch (errConn) {
      console.log('[0030] Aviso ao atualizar connectors_prf:', errConn)
    }

    // =========================================================================
    // 5. Atualizar trilha de auditoria e gravar o evento ATUALIZACAO_IDENTIDADE_INSTITUCIONAL
    //    na collection 'institucional_settings'
    // =========================================================================
    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
      if (settings) {
        let trail = []
        try {
          const raw = settings.get('audit_trail')
          if (Array.isArray(raw)) {
            trail = raw
          } else if (typeof raw === 'string' && raw.trim()) {
            trail = JSON.parse(raw)
          }
        } catch (_) {
          trail = []
        }

        // Sanitizar eventos antigos substituindo domínios antigos da Orbis no histórico de auditoria
        for (let t = 0; t < trail.length; t++) {
          const ev = trail[t]
          if (ev.author && typeof ev.author.email === 'string') {
            if (ev.author.email === 'sistema@orbis.gov.br') {
              ev.author.email = 'sistema@orbis-uos.com.br'
            } else if (ev.author.email.endsWith('@orbis.gov.br')) {
              ev.author.email = ev.author.email.replace('@orbis.gov.br', '@orbis-uos.com.br')
            }
          }
          if (ev.details) {
            if (Array.isArray(ev.details.alert_channels)) {
              ev.details.alert_channels = ev.details.alert_channels.map((c) =>
                typeof c === 'string' && c.includes('@orbis-uos.gov.br')
                  ? c.replace('@orbis-uos.gov.br', '@orbis-uos.com.br')
                  : c,
              )
            }
            if (Array.isArray(ev.details.users_seeded)) {
              ev.details.users_seeded = ev.details.users_seeded.map((u) =>
                typeof u === 'string' && u.includes('@orbis.gov.br')
                  ? u.replace('@orbis.gov.br', '@orbis-uos.com.br')
                  : u,
              )
            }
          }
        }

        const now = new Date()
        const novoEvento = {
          id: 'evt_' + now.getTime() + '_identidade_orbis_uos',
          event: 'ATUALIZACAO_IDENTIDADE_INSTITUCIONAL',
          author: {
            id: 'system_migration_0030',
            email: 'sistema@orbis-uos.com.br',
            name: 'SISTEMA (Migração 0030 - Domínio Oficial)',
            role: 'system',
          },
          details: {
            description:
              'Atualização formal de todas as identidades institucionais, e-mails de demonstração e canais de notificação para o domínio oficial @orbis-uos.com.br (www.orbis-uos.com.br).',
            dominio_oficial: 'orbis-uos.com.br',
            canais_atualizados: {
              contato: 'contato@orbis-uos.com.br',
              privacidade_dpo: 'privacidade@orbis-uos.com.br',
              comercial: 'comercial@orbis-uos.com.br',
              demo_admin: 'institucional@orbis-uos.com.br',
              demo_operador: 'operador@orbis-uos.com.br',
              sistema: 'sistema@orbis-uos.com.br',
            },
            fontes_oficiais_intactas: [
              'dadosabertos.prf.gov.br',
              'siconfi.tesouro.gov.br',
              'portaldatransparencia.gov.br',
              'curitiba.pr.gov.br',
              'cbm.pr.gov.br',
            ],
            contas_migradas: [
              'institucional@orbis.gov.br -> institucional@orbis-uos.com.br',
              'operador@orbis.gov.br -> operador@orbis-uos.com.br',
            ],
          },
          compliance: 'Art. 6º, VI (Transparência) e Art. 27 LC 182/2021 CPSI',
          timestamp: now.toISOString(),
        }

        trail.unshift(novoEvento)
        if (trail.length > 60) {
          trail = trail.slice(0, 60)
        }

        settings.set('audit_trail', JSON.stringify(trail))
        app.save(settings)
        console.log(
          '[0030] Evento ATUALIZACAO_IDENTIDADE_INSTITUCIONAL registrado na trilha de auditoria',
        )
      }
    } catch (auditErr) {
      console.log('[0030] Aviso ao registrar evento em institucional_settings:', auditErr)
    }
  },
  (app) => {
    // Reversão defensiva: reverter e-mails de volta caso necessário
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'institucional@orbis-uos.com.br')
      admin.setEmail('institucional@orbis.gov.br')
      app.save(admin)
    } catch (_) {}

    try {
      const op = app.findAuthRecordByEmail('_pb_users_auth_', 'operador@orbis-uos.com.br')
      op.setEmail('operador@orbis.gov.br')
      app.save(op)
    } catch (_) {}
  },
)
