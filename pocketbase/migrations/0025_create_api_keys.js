migrate(
  (app) => {
    // 1. Criar collection 'api_keys' para gestão de credenciais por consumidor
    const apiKeysCol = new Collection({
      name: 'api_keys',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'consumidor_nome', type: 'text', required: true },
        { name: 'consumidor_orgao', type: 'text', required: true },
        { name: 'consumidor_contato', type: 'text', required: false },
        { name: 'key_prefix', type: 'text', required: true },
        { name: 'key_hash', type: 'text', required: true },
        {
          name: 'escopo',
          type: 'select',
          values: ['somente_leitura'],
          maxSelect: 1,
          required: false,
        },
        {
          name: 'status',
          type: 'select',
          values: ['ativa', 'revogada'],
          maxSelect: 1,
          required: false,
        },
        { name: 'rate_limit_rpm', type: 'number', required: false },
        { name: 'criado_por_id', type: 'text', required: false },
        { name: 'criado_por_nome', type: 'text', required: false },
        { name: 'criado_por_email', type: 'text', required: false },
        { name: 'revogado_em', type: 'text', required: false },
        { name: 'revogado_por_id', type: 'text', required: false },
        { name: 'revogado_por_nome', type: 'text', required: false },
        { name: 'motivo_revogacao', type: 'text', required: false },
        { name: 'ultimo_uso_em', type: 'text', required: false },
        { name: 'total_requisicoes', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_api_keys_hash ON api_keys (key_hash)',
        'CREATE INDEX idx_api_keys_status ON api_keys (status)',
      ],
    })
    app.save(apiKeysCol)

    // 2. Seed de uma chave inicial de homologação (ex.: para o primeiro órgão integrador CICC / Urbs)
    // Chave simulada exibida uma vez: orbis_live_cicc_curitiba_homolog_8f29d10a4e7b
    const initialKeyFull = 'orbis_live_cicc_curitiba_homolog_8f29d10a4e7b'
    const initialKeyHash = $security.sha256(initialKeyFull)
    const initialPrefix = 'orbis_live_cicc_...4e7b'

    const keyRecord = new Record(apiKeysCol)
    keyRecord.set('consumidor_nome', 'Centro Integrado de Comando e Controle (CICC / CIC)')
    keyRecord.set('consumidor_orgao', 'Secretaria Municipal de Defesa Social e Trânsito')
    keyRecord.set('consumidor_contato', 'integracao.cicc@curitiba.pr.gov.br')
    keyRecord.set('key_prefix', initialPrefix)
    keyRecord.set('key_hash', initialKeyHash)
    keyRecord.set('escopo', 'somente_leitura')
    keyRecord.set('status', 'ativa')
    keyRecord.set('rate_limit_rpm', 60)
    keyRecord.set('criado_por_id', 'system_migration_0025')
    keyRecord.set('criado_por_nome', 'SISTEMA (Migração 0025)')
    keyRecord.set('criado_por_email', 'sistema@orbis.gov.br')
    keyRecord.set('total_requisicoes', 0)
    app.save(keyRecord)

    // 3. Registrar eventos na trilha de auditoria em institucional_settings (Art. 27 LC 182/2021)
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
        const auditEvent = {
          id: 'evt_' + now.getTime() + '_api_key_created_cicc',
          event: 'API_KEY_CREATED',
          author: {
            id: 'system_migration_0025',
            email: 'sistema@orbis.gov.br',
            name: 'SISTEMA (Migração 0025 - Gestão de Chaves)',
            role: 'system',
          },
          details: {
            consumidor_nome: 'Centro Integrado de Comando e Controle (CICC / CIC)',
            consumidor_orgao: 'Secretaria Municipal de Defesa Social e Trânsito',
            key_prefix: initialPrefix,
            escopo: 'somente_leitura',
            rate_limit_rpm: 60,
            motivo: 'Credenciamento pioneiro de órgão municipal no ambiente de homologação',
            hash_armazenado: true,
            k_anonymity_enforced: true,
          },
          compliance: 'Art. 27 LC 182/2021 & Art. 12 LGPD (k-anonimato H3 k ≥ 3)',
          timestamp: now.toISOString(),
        }

        trail.unshift(auditEvent)
        if (trail.length > 50) {
          trail = trail.slice(0, 50)
        }
        settings.set('audit_trail', JSON.stringify(trail))
        app.save(settings)
      }
    } catch (e) {
      console.log('Aviso ao registrar evento de API_KEY_CREATED na migração 0025:', e)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('api_keys')
      app.delete(col)
    } catch (_) {}
  },
)
