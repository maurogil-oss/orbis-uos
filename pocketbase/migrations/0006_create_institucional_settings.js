migrate(
  (app) => {
    // 1. Criar collection institucional_settings
    // Armazena configurações soberanas por município/instituição:
    // - portal_publico_ativo (bool, decisão opcional da administração)
    // - cgu_api_key (text, chave da API da CGU gravada no backend com segurança)
    // - cgu_status (select: pendente, ativo, erro)
    // - cgu_last_sync (text)
    // - cgu_cache_payload (json)
    // RLS: leitura pública permitida para checar portal_publico_ativo e estatísticas CGU em cache,
    // criação/atualização permitida para usuários autenticados.
    const settingsCollection = new Collection({
      name: 'institucional_settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: null,
      fields: [
        { name: 'municipio', type: 'text', required: true },
        { name: 'uf', type: 'text', required: true },
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'portal_publico_ativo', type: 'bool' }, // Opcional, nunca required em bool no PB!
        { name: 'portal_mensagem_institucional', type: 'text' },
        { name: 'cgu_api_key', type: 'text' },
        {
          name: 'cgu_status',
          type: 'select',
          values: ['chave_pendente', 'ativo', 'erro_chave', 'indisponivel'],
          maxSelect: 1,
        },
        { name: 'cgu_last_sync', type: 'text' },
        { name: 'cgu_cache_payload', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_institucional_ibge ON institucional_settings (codigo_ibge)',
      ],
    })
    app.save(settingsCollection)

    // 2. Seed inicial da configuração padrão para Curitiba (4106902)
    // Padrão: portal_publico_ativo = false (a decisão é da administração, nunca automática)
    const settingsCol = app.findCollectionByNameOrId('institucional_settings')
    try {
      app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
    } catch (_) {
      const curitibaSettings = new Record(settingsCol)
      curitibaSettings.set('municipio', 'Curitiba')
      curitibaSettings.set('uf', 'PR')
      curitibaSettings.set('codigo_ibge', '4106902')
      curitibaSettings.set('portal_publico_ativo', false)
      curitibaSettings.set(
        'portal_mensagem_institucional',
        'Canal Oficial de Acompanhamento do Reparo Viário — Prefeitura Municipal de Curitiba',
      )
      curitibaSettings.set('cgu_status', 'chave_pendente')
      curitibaSettings.set('cgu_api_key', '')
      app.save(curitibaSettings)
    }

    // 3. Seed da conta institucional de demonstração para testes de prefeitura
    // E-mail oficial: institucional@orbis.gov.br
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const demoEmail = 'institucional@orbis.gov.br'
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', demoEmail)
    } catch (_) {
      const demoUser = new Record(usersCol)
      demoUser.setEmail(demoEmail)
      demoUser.setPassword('Prefeitura@2026')
      demoUser.setVerified(true)
      demoUser.set('name', 'Servidor Institucional (Gabinete)')
      app.save(demoUser)
    }
  },
  (app) => {
    try {
      const demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'institucional@orbis.gov.br')
      app.delete(demoUser)
    } catch (_) {}
    try {
      const settings = app.findCollectionByNameOrId('institucional_settings')
      app.delete(settings)
    } catch (_) {}
  },
)
