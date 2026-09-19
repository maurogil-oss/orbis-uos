migrate(
  (app) => {
    // =========================================================================
    // 1. HARDENING DA COLLECTION 'leads' (Proteção de Dados Pessoais / LGPD)
    // =========================================================================
    // listRule e viewRule: Apenas usuários autenticados institucionais podem listar/visualizar
    // createRule: Mantida pública ("") para permitir submissão na landing page e manifestos
    // updateRule e deleteRule: Apenas autenticados ("@request.auth.id != ''")
    const leadsCol = app.findCollectionByNameOrId('leads')
    leadsCol.listRule = "@request.auth.id != ''"
    leadsCol.viewRule = "@request.auth.id != ''"
    leadsCol.createRule = ''
    leadsCol.updateRule = "@request.auth.id != ''"
    leadsCol.deleteRule = "@request.auth.id != ''"
    app.save(leadsCol)

    // =========================================================================
    // 2. HARDENING DA COLLECTION 'users' (Bloqueio de Criação Pública / Auto-registro)
    // =========================================================================
    // createRule: null (bloqueia auto-registro público de novas contas via API)
    // listRule e viewRule: Restrito ao próprio usuário logado (id = @request.auth.id)
    // updateRule e deleteRule: Restrito ao próprio usuário logado (id = @request.auth.id)
    // Mantém login institucional existente intacto (authWithPassword usa credenciais já cadastradas)
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.createRule = null
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.updateRule = 'id = @request.auth.id'
    usersCol.deleteRule = 'id = @request.auth.id'
    app.save(usersCol)

    // =========================================================================
    // 3. REGISTRO NA TRILHA DE AUDITORIA INSTITUCIONAL
    // =========================================================================
    try {
      const curitibaSettings = app.findFirstRecordByData(
        'institucional_settings',
        'codigo_ibge',
        '4106902',
      )
      if (curitibaSettings) {
        const auditLog = {
          event: 'SECURITY_HARDENING_MIGRATION_0017',
          target_collections: ['leads', 'users'],
          leads_rules: {
            list: "@request.auth.id != ''",
            view: "@request.auth.id != ''",
            create: 'public',
            update: "@request.auth.id != ''",
            delete: "@request.auth.id != ''",
          },
          users_rules: {
            create: 'blocked_null',
            list: 'id = @request.auth.id',
            view: 'id = @request.auth.id',
            update: 'id = @request.auth.id',
            delete: 'id = @request.auth.id',
          },
          compliance: 'LGPD (Lei 13.709/2018) & Marco Legal das Startups (LC 182/2021)',
          applied_at: new Date().toISOString(),
        }
        curitibaSettings.set('cgu_cache_payload', auditLog)
        app.save(curitibaSettings)
      }
    } catch (_) {}
  },
  (app) => {
    // Reversão defensiva
    try {
      const leadsCol = app.findCollectionByNameOrId('leads')
      leadsCol.listRule = ''
      leadsCol.viewRule = ''
      app.save(leadsCol)
    } catch (_) {}

    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      usersCol.createRule = ''
      app.save(usersCol)
    } catch (_) {}
  },
)
