migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('institucional_settings')

    if (!col.fields.getByName('traffic_source_active')) {
      col.fields.add(
        new SelectField({
          name: 'traffic_source_active',
          values: ['orbis_dsp', 'waze_for_cities'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('waze_feed_url')) {
      col.fields.add(
        new TextField({
          name: 'waze_feed_url',
        }),
      )
    }

    if (!col.fields.getByName('waze_feed_active')) {
      col.fields.add(
        new BoolField({
          name: 'waze_feed_active',
        }),
      )
    }

    if (!col.fields.getByName('waze_last_tested_at')) {
      col.fields.add(
        new TextField({
          name: 'waze_last_tested_at',
        }),
      )
    }

    if (!col.fields.getByName('waze_last_test_status')) {
      col.fields.add(
        new SelectField({
          name: 'waze_last_test_status',
          values: ['nao_testado', 'sucesso', 'falha'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('waze_last_test_details')) {
      col.fields.add(
        new JSONField({
          name: 'waze_last_test_details',
          maxSize: 524288,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('institucional_settings')
    const fieldNames = [
      'traffic_source_active',
      'waze_feed_url',
      'waze_feed_active',
      'waze_last_tested_at',
      'waze_last_test_status',
      'waze_last_test_details',
    ]

    for (let i = 0; i < fieldNames.length; i++) {
      const field = col.fields.getByName(fieldNames[i])
      if (field) {
        col.fields.remove(field)
      }
    }

    app.save(col)
  },
)
