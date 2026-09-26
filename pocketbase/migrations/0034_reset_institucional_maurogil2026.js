migrate(
  (app) => {
    // =========================================================================
    // MIGRAÇÃO 0034: DEFINIR SENHA INSTITUCIONAL PARA maurogil2026
    // =========================================================================
    // Usuário: institucional@orbis-uos.com.br
    // Utiliza os métodos nativos do PocketBase (setPassword) garantindo que
    // apenas o hash bcrypt seja armazenado no banco de dados.
    // =========================================================================

    const targetEmail = 'institucional@orbis-uos.com.br'
    let userRecord = null

    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', targetEmail)
    } catch (_) {
      try {
        const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
        userRecord = new Record(usersCol)
        userRecord.setEmail(targetEmail)
        userRecord.setVerified(true)
        userRecord.set('name', 'Servidor Institucional (Gabinete)')
        userRecord.set('role', 'admin')
        userRecord.set('status', 'ativo')
        userRecord.set('cargo', 'Gestor / Administrador de Gabinete')
        userRecord.set('orgao', 'Prefeitura Municipal')
      } catch (err) {
        console.log('[0034] Erro ao localizar ou instanciar usuário:', err)
        return
      }
    }

    // Definir a senha solicitada (PocketBase gera o hash bcrypt internamente)
    // A senha não é persistida em texto puro em nenhum campo ou registro de auditoria
    const pwd = 'maurogil2026'
    userRecord.setPassword(pwd)
    userRecord.setVerified(true)
    userRecord.set('status', 'ativo')
    app.save(userRecord)

    console.log(
      `[0034] Senha do usuário ${targetEmail} atualizada com hash PocketBase com sucesso.`,
    )

    // Registrar na trilha de auditoria de institucional_settings de forma segura (sem salvar a senha)
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

        const now = new Date()
        const novoEvento = {
          id: 'evt_' + now.getTime() + '_reset_senha_institucional',
          event: 'REDEFINICAO_SENHA_INSTITUCIONAL',
          author: {
            id: 'system_migration_0034',
            email: 'sistema@orbis-uos.com.br',
            name: 'SISTEMA (Migração 0034 - Credencial Institucional)',
            role: 'system',
          },
          details: {
            description:
              'Redefinição administrativa da credencial de acesso institucional do Gabinete.',
            target_user: targetEmail,
            metodo: 'PocketBase setPassword (bcrypt hash)',
            status: 'concluido',
          },
          compliance: 'Art. 6º LGPD e Marco Legal das Startups (LC 182/2021)',
          timestamp: now.toISOString(),
        }

        trail.unshift(novoEvento)
        if (trail.length > 60) {
          trail = trail.slice(0, 60)
        }

        settings.set('audit_trail', JSON.stringify(trail))
        app.save(settings)
      }
    } catch (auditErr) {
      console.log('[0034] Aviso ao registrar auditoria em institucional_settings:', auditErr)
    }
  },
  (app) => {
    // Reversão limpa
  },
)
