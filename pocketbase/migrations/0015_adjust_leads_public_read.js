migrate(
  (app) => {
    // 1.10 leads: listRule e viewRule públicos para manifestos
    const leadsCol = app.findCollectionByNameOrId('leads')
    leadsCol.listRule = ''
    leadsCol.viewRule = ''
    leadsCol.createRule = ''
    leadsCol.updateRule = "@request.auth.id != ''"
    leadsCol.deleteRule = "@request.auth.id != ''"
    app.save(leadsCol)
  },
  (app) => {
    try {
      const leadsCol = app.findCollectionByNameOrId('leads')
      leadsCol.listRule = "@request.auth.id != ''"
      leadsCol.viewRule = "@request.auth.id != ''"
      app.save(leadsCol)
    } catch (_) {}
  },
)
