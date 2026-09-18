migrate(
  (app) => {
    // 1. Coleção express_diagnostics (Diagnóstico Express curto ~10 campos)
    const expressCollection = new Collection({
      name: 'express_diagnostics',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: null,
      fields: [
        { name: 'municipio', type: 'text', required: true },
        { name: 'uf', type: 'text', required: true },
        { name: 'populacao_ibge', type: 'number', required: true },
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'responsavel_nome', type: 'text', required: true },
        { name: 'responsavel_cargo', type: 'text', required: true },
        { name: 'email_oficial', type: 'text', required: true },
        { name: 'telefone', type: 'text' },
        {
          name: 'status_municipalizacao',
          type: 'select',
          required: true,
          values: ['proprio_estruturado', 'em_processo', 'nao_municipalizado'],
          maxSelect: 1,
        },
        { name: 'frota_onibus', type: 'number' },
        { name: 'frota_caminhoes_coleta', type: 'number' },
        { name: 'frota_viaturas', type: 'number' },
        { name: 'orcamento_anual_pavimentacao', type: 'number' },
        { name: 'score_provisorio', type: 'number' },
        { name: 'faixa_provisoria', type: 'text' },
        { name: 'veiculos_sensor_sugeridos', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_express_codigo_ibge ON express_diagnostics (codigo_ibge)',
        'CREATE INDEX idx_express_created ON express_diagnostics (created DESC)',
      ],
    })
    app.save(expressCollection)

    // 2. Coleção enquadramentos (Formulário completo com 6 blocos e auto-save)
    const enquadramentosCollection = new Collection({
      name: 'enquadramentos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: null,
      fields: [
        { name: 'protocolo', type: 'text', required: true },
        { name: 'municipio', type: 'text', required: true },
        { name: 'uf', type: 'text', required: true },
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'cnpj_municipio', type: 'text' },
        { name: 'porte', type: 'text' }, // pequena, media, grande
        { name: 'bloco1_data', type: 'json' },
        { name: 'bloco2_data', type: 'json' },
        { name: 'bloco3_data', type: 'json' },
        { name: 'bloco4_data', type: 'json' },
        { name: 'bloco5_data', type: 'json' },
        { name: 'bloco6_data', type: 'json' },
        { name: 'score_total', type: 'number' },
        { name: 'score_b1', type: 'number' },
        { name: 'score_b2', type: 'number' },
        { name: 'score_b3', type: 'number' },
        { name: 'score_b4', type: 'number' },
        { name: 'score_b5', type: 'number' },
        { name: 'score_b6', type: 'number' },
        { name: 'classificacao', type: 'text' },
        { name: 'flags', type: 'json' },
        { name: 'saidas_automaticas', type: 'json' },
        { name: 'hash_sha256', type: 'text' },
        { name: 'status_preenchimento', type: 'text' }, // rascunho, concluido
        { name: 'ultimo_bloco_salvo', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_enquadramentos_protocolo ON enquadramentos (protocolo)',
        'CREATE INDEX idx_enquadramentos_ibge ON enquadramentos (codigo_ibge)',
        'CREATE INDEX idx_enquadramentos_created ON enquadramentos (created DESC)',
      ],
    })
    app.save(enquadramentosCollection)

    // 3. Coleção siconfi_cache (Cache das consultas federais por IBGE)
    const siconfiCacheCollection = new Collection({
      name: 'siconfi_cache',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: null,
      fields: [
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'ano_exercicio', type: 'number', required: true },
        { name: 'tipo_dado', type: 'text', required: true }, // despesas_funcoes, receitas_transferencias
        { name: 'payload', type: 'json', required: true },
        { name: 'fonte', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_siconfi_ibge_ano ON siconfi_cache (codigo_ibge, ano_exercicio)'],
    })
    app.save(siconfiCacheCollection)
  },
  (app) => {
    try {
      const c1 = app.findCollectionByNameOrId('express_diagnostics')
      app.delete(c1)
    } catch (_) {}
    try {
      const c2 = app.findCollectionByNameOrId('enquadramentos')
      app.delete(c2)
    } catch (_) {}
    try {
      const c3 = app.findCollectionByNameOrId('siconfi_cache')
      app.delete(c3)
    } catch (_) {}
  },
)
