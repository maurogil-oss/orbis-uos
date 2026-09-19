migrate(
  (app) => {
    // =========================================================================
    // 1. CAMPOS DE PAPÉIS (ROLES) E ESTRUTURAÇÃO NA COLLECTION 'users'
    // =========================================================================
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'operador'],
          maxSelect: 1,
          required: false,
        }),
      )
    }

    if (!usersCol.fields.getByName('cargo')) {
      usersCol.fields.add(
        new TextField({
          name: 'cargo',
          required: false,
        }),
      )
    }

    if (!usersCol.fields.getByName('orgao')) {
      usersCol.fields.add(
        new TextField({
          name: 'orgao',
          required: false,
        }),
      )
    }

    if (!usersCol.fields.getByName('status')) {
      usersCol.fields.add(
        new SelectField({
          name: 'status',
          values: ['ativo', 'desativado'],
          maxSelect: 1,
          required: false,
        }),
      )
    }

    // Regras de RLS de users:
    // listRule: admin vê todos os usuários ou o próprio usuário vê a si mesmo
    // viewRule: admin vê todos ou o próprio usuário vê a si mesmo
    // createRule: apenas admin autenticado pode criar contas (@request.auth.id != '' && @request.auth.role = 'admin')
    //             auto-registro público permanece ESTRITAMENTE BLOQUEADO
    // updateRule: admin pode alterar qualquer usuário ou usuário pode alterar a si mesmo
    // deleteRule: apenas admin pode excluir
    usersCol.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || id = @request.auth.id)"
    usersCol.viewRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || id = @request.auth.id)"
    usersCol.createRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    usersCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || id = @request.auth.id)"
    usersCol.deleteRule = "@request.auth.id != '' && @request.auth.role = 'admin'"

    app.save(usersCol)

    // Atualizar os usuários existentes com papel 'admin' e status 'ativo'
    try {
      app
        .db()
        .newQuery(
          "UPDATE users SET role = 'admin', status = 'ativo', cargo = 'Gestor / Administrador de Gabinete', orgao = 'Prefeitura Municipal' WHERE role IS NULL OR role = ''",
        )
        .execute()
    } catch (_) {}

    // Seed de uma conta de operador para testes e validação da separação de papéis
    const operadorEmail = 'operador@orbis.gov.br'
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', operadorEmail)
    } catch (_) {
      try {
        const opUser = new Record(usersCol)
        opUser.setEmail(operadorEmail)
        opUser.setPassword('Orb$2026!Op#Sec42')
        opUser.setVerified(true)
        opUser.set('name', 'Operador de Campo (Fiscalização)')
        opUser.set('role', 'operador')
        opUser.set('status', 'ativo')
        opUser.set('cargo', 'Agente / Fiscal de Pavimentação Viária')
        opUser.set('orgao', 'Secretaria Municipal de Obras Públicas')
        app.save(opUser)
      } catch (err) {
        console.log('Aviso ao criar usuário operador de teste:', err)
      }
    }

    // =========================================================================
    // 2. EXPANDIR TRILHA DE AUDITORIA EM institucional_settings
    // =========================================================================
    const settingsCol = app.findCollectionByNameOrId('institucional_settings')
    if (!settingsCol.fields.getByName('audit_trail')) {
      settingsCol.fields.add(
        new JSONField({
          name: 'audit_trail',
          required: false,
        }),
      )
      app.save(settingsCol)
    }

    // =========================================================================
    // 3. REGISTRAR EVENTOS NA TRILHA DE AUDITORIA (COM AUTORIA)
    // =========================================================================
    try {
      const curitibaSettings = app.findFirstRecordByData(
        'institucional_settings',
        'codigo_ibge',
        '4106902',
      )
      if (curitibaSettings) {
        let existingTrail = []
        try {
          const raw = curitibaSettings.get('audit_trail')
          if (Array.isArray(raw)) {
            existingTrail = raw
          }
        } catch (_) {
          existingTrail = []
        }

        const roleEvent = {
          id: 'evt_' + new Date().getTime() + '_roles',
          event: 'ROLE_BASED_ACCOUNTS_IMPLEMENTED',
          author: {
            id: 'system_migration_0020',
            email: 'sistema@orbis.gov.br',
            name: 'SISTEMA (Migração 0020)',
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
          timestamp: new Date().toISOString(),
        }

        const termsEvent = {
          id: 'evt_' + (new Date().getTime() + 1) + '_terms',
          event: 'TERMS_OF_USE_PUBLISHED',
          author: {
            id: 'system_migration_0020',
            email: 'sistema@orbis.gov.br',
            name: 'SISTEMA (Migração 0020)',
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
          timestamp: new Date().toISOString(),
        }

        existingTrail.unshift(termsEvent)
        existingTrail.unshift(roleEvent)

        // Limitar histórico a 50 eventos mais recentes
        if (existingTrail.length > 50) {
          existingTrail = existingTrail.slice(0, 50)
        }

        curitibaSettings.set('audit_trail', existingTrail)
        app.save(curitibaSettings)
      }
    } catch (e) {
      console.log('Aviso ao registrar eventos de auditoria:', e)
    }
  },
  (app) => {
    // Reversão defensiva
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      usersCol.createRule = null
      usersCol.listRule = 'id = @request.auth.id'
      usersCol.viewRule = 'id = @request.auth.id'
      usersCol.updateRule = 'id = @request.auth.id'
      usersCol.deleteRule = 'id = @request.auth.id'
      app.save(usersCol)
    } catch (_) {}
  },
)
