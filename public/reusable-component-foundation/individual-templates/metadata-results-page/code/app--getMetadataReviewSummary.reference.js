/* Reference extract: getMetadataReviewSummary(...) from app/src/app.js:14036-14068. */

function getMetadataReviewSummary(model = {}) {
  const bindingRows = model.bindingRows || [];
  const inventoryRows = model.inventoryRows || [];
  const externalLocationRows = model.externalLocationRows || [];
  const grantRows = model.grantRows || [];
  const sizingRows = model.sizingRows || [];
  const dictionaryRows = model.dictionaryRows || [];
  const storagePathRows = model.storagePathRows || [];
  const allRows = [
    ...bindingRows,
    ...inventoryRows,
    ...externalLocationRows,
    ...grantRows,
    ...sizingRows,
    ...dictionaryRows,
    ...storagePathRows,
  ];
  const bindingSummary = getUnityCatalogBindingSummary(bindingRows);
  const sourceFiles = new Set(allRows.map((row) => normaliseImportHeader(row.sourceFileName)).filter(Boolean));
  return {
    catalogCount: bindingSummary.catalogCount,
    bindingRowCount: bindingRows.length,
    inventoryRowCount: inventoryRows.length,
    externalLocationCount: externalLocationRows.length,
    grantRowCount: grantRows.length,
    broadGrantCount: grantRows.filter((row) => row.broadAccess).length,
    sizingRowCount: sizingRows.length,
    tableSizeTb: sizingRows.reduce((total, row) => total + Number(row.dataSizeTb || 0), 0),
    dictionaryColumnCount: dictionaryRows.length,
    storagePathCount: storagePathRows.length,
    sourceFileCount: sourceFiles.size,
  };
}
