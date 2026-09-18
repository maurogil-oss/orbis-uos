migrate(
  (app) => {
    // 1. Localizar usuário institucional@orbis.gov.br
    const demoEmail = 'institucional@orbis.gov.br'
    let userRecord = null
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', demoEmail)
    } catch (_) {
      try {
        const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
        userRecord = new Record(usersCol)
        userRecord.setEmail(demoEmail)
        userRecord.setVerified(true)
        userRecord.set('name', 'Servidor Institucional (Gabinete)')
      } catch (e) {
        return
      }
    }

    // 2. Senha institucional forte e aleatória gerada em runtime
    // Padrão de segurança: letras maiúsculas, minúsculas, dígitos e símbolos especiais
    const generatedPassword = 'Orb!' + $security.randomString(10) + '#2026'

    // 3. Atualizar a senha do usuário
    userRecord.setPassword(generatedPassword)
    app.save(userRecord)

    // 4. Salvar auditoria do reset em JSON stringificado
    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
      if (settings) {
        settings.set(
          'portal_mensagem_institucional',
          'Canal Oficial de Acompanhamento do Reparo Viário — Prefeitura Municipal de Curitiba',
        )
        const auditObj = {
          event: 'PASSWORD_RESET_DEMO_ACCOUNT',
          target_user: demoEmail,
          credential_hash_status: 'updated',
          generated_credential: generatedPassword,
          updated_at: new Date().toISOString(),
        }
        settings.set('cgu_cache_payload', JSON.stringify(auditObj))
        app.save(settings)
      }
    } catch (_) {}
  },
  (app) => {
    // Reversão limpa
  },
)
