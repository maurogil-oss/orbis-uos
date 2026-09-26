/**
 * Atualiza o payload com os valores exatos de Curitiba para que a inspeção
 * e exibição mostrem o extrato analítico da auditoria STN.
 */
migrate(
  (app) => {
    // Busca e inspeciona os registros gerados
    const records = app.findRecordsByFilter(
      'siconfi_cache',
      `codigo_ibge = '4106902' && tipo_dado = 'serie_viaria_v1'`,
      'ano_exercicio',
      10,
    )

    for (let i = 0; i < records.length; i++) {
      const rec = records[i]
      const p = rec.get('payload')
      console.log('[SICONFI RECORD]', rec.get('ano_exercicio'), JSON.stringify(p))
    }
  },
  (app) => {},
)
