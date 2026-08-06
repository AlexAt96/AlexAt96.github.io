/* Reference extract: getMetadataReviewModel(...) from app/src/app.js:14018-14034. */

function getMetadataReviewModel(bu = null) {
  const adfRows = getAdfMetadataReviewRows(bu);
  const model = {
    bindingRows: getUnityCatalogBindingRows(bu),
    inventoryRows: getDatabricksInventoryResourceRows(bu),
    externalLocationRows: getDatabricksExternalLocationRows(bu),
    grantRows: getDatabricksUcGrantRows(bu),
    sizingRows: getDatabricksTableSizingRows(bu),
    dictionaryRows: getDatabricksDictionaryRows(bu),
    storagePathRows: getDatabricksStoragePathRows(bu),
    adfSummaryRows: adfRows.summaryRows,
    adfActivityRows: adfRows.activityRows,
    adfLineage: getAdfLineageModel(bu),
  };
  model.summary = getMetadataReviewSummary(model);
  return model;
}
