migrate(
  (app) => {
    const collection = new Collection({
      name: 'leads',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'cargo', type: 'text', required: true },
        { name: 'orgao', type: 'text', required: true },
        {
          name: 'porte',
          type: 'select',
          required: true,
          values: ['Municipal', 'Estadual', 'Federal'],
          maxSelect: 1,
        },
        { name: 'telefone', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_leads_email ON leads (email)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('leads')
    app.delete(collection)
  },
)
