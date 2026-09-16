migrate(
  (app) => {
    // 1. Seed auth admin user maurog1@hotmail.com
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'maurog1@hotmail.com')
    } catch (_) {
      const userRecord = new Record(users)
      userRecord.setEmail('maurog1@hotmail.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Mauro G.')
      app.save(userRecord)
    }

    // 2. Seed 3 sample realistic leads
    const leadsCol = app.findCollectionByNameOrId('leads')
    const sampleLeads = [
      {
        nome: 'Ana Souza',
        email: 'ana.souza@curitiba.pr.gov.br',
        cargo: 'Secretária de Administração',
        orgao: 'Prefeitura Municipal de Curitiba',
        porte: 'Municipal',
        telefone: '(41) 98765-4321',
      },
      {
        nome: 'Carlos Eduardo Mendes',
        email: 'carlos.mendes@fazenda.sp.gov.br',
        cargo: 'Diretor de Planejamento e Orçamento',
        orgao: 'Secretaria da Fazenda de São Paulo',
        porte: 'Estadual',
        telefone: '(11) 99123-4567',
      },
      {
        nome: 'Mariana Albuquerque',
        email: 'mariana.albuquerque@gestao.gov.br',
        cargo: 'Coordenadora-Geral de Modernização',
        orgao: 'Ministério da Gestão e Inovação',
        porte: 'Federal',
        telefone: '(61) 98456-7890',
      },
    ]

    for (let i = 0; i < sampleLeads.length; i++) {
      const item = sampleLeads[i]
      try {
        app.findFirstRecordByData('leads', 'email', item.email)
      } catch (_) {
        const leadRecord = new Record(leadsCol)
        leadRecord.set('nome', item.nome)
        leadRecord.set('email', item.email)
        leadRecord.set('cargo', item.cargo)
        leadRecord.set('orgao', item.orgao)
        leadRecord.set('porte', item.porte)
        leadRecord.set('telefone', item.telefone)
        app.save(leadRecord)
      }
    }
  },
  (app) => {
    // Revert seeded sample leads
    const sampleEmails = [
      'ana.souza@curitiba.pr.gov.br',
      'carlos.mendes@fazenda.sp.gov.br',
      'mariana.albuquerque@gestao.gov.br',
    ]
    for (let i = 0; i < sampleEmails.length; i++) {
      try {
        const rec = app.findFirstRecordByData('leads', 'email', sampleEmails[i])
        app.delete(rec)
      } catch (_) {}
    }
  },
)
