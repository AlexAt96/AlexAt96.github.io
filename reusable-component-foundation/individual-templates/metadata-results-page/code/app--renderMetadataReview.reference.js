/* Reference extract: renderMetadataReview(...) from app/src/app.js:13006-13059. */

function renderMetadataReview(phase, item, bu = getSelectedBu()) {
  const contextLabel = bu ? bu.name : "Cross-BU";
  const model = getMetadataReviewModel(bu);
  return `
    ${detailHeader("Metadata review", `Structured review of parsed Databricks and Unity Catalog metadata for ${contextLabel}. This page separates raw metadata evidence from source/consumer and external connection mapping.`)}
    ${renderMetadataReviewDisclosure({
      eyebrow: "Databricks metadata",
      title: `${contextLabel} Terraform and Unity Catalog metadata`,
      summary: `${model.summary.inventoryRowCount} inventory rows / ${model.summary.bindingRowCount} catalog binding rows / ${model.summary.grantRowCount} grant rows`,
      content: `
        ${renderDatabricksMetadataOverview(model)}
        ${renderMetadataReviewStats(model, contextLabel)}
        ${renderUnityCatalogBindingTable(model.bindingRows, contextLabel)}
        ${renderDatabricksInventoryResourceTable(model.inventoryRows, contextLabel, bu)}
        ${renderDatabricksExternalLocationMetadataTable(model.externalLocationRows, contextLabel)}
        ${renderDatabricksUcGrantTable(model.grantRows, contextLabel)}
      `,
    })}
    ${renderMetadataReviewDisclosure({
      eyebrow: "ADF metadata",
      title: `${contextLabel} ADF profiler metadata`,
      summary: `${model.adfSummaryRows.length} environment rows / ${model.adfActivityRows.length} activity rows`,
      content: `
        ${renderAdfMetadataOverview(model)}
        ${renderAdfMetadataReviewTables(model, contextLabel)}
      `,
    })}
    ${renderMetadataReviewDisclosure({
      eyebrow: "Data dictionary metadata",
      title: `${contextLabel} data dictionary metadata`,
      summary: `${model.dictionaryRows.length} dictionary columns`,
      content: `
        ${renderDictionaryMetadataOverview(model)}
        ${renderDatabricksDictionaryMetadataTable(model.dictionaryRows, contextLabel)}
      `,
    })}
    ${renderMetadataReviewDisclosure({
      eyebrow: "Sizing metadata",
      title: `${contextLabel} sizing and storage metadata`,
      summary: `${model.sizingRows.length} sizing rows / ${model.storagePathRows.length} storage paths`,
      content: `
        ${renderSizingMetadataOverview(model)}
        ${renderDatabricksTableSizingMetadataTable(model.sizingRows, contextLabel)}
        ${renderDatabricksStoragePathMetadataTable(model.storagePathRows, contextLabel)}
      `,
    })}
  `;
}

const ADVANCED_DISCOVERY_OUTPUT_TABS = [
  { key: "adf-profiler", label: "ADF profiler", shortLabel: "ADF" },
  { key: "terraform-metadata", label: "Terraform and Databricks metadata", shortLabel: "Metadata" },
  { key: "sizing", label: "Sizing", shortLabel: "Sizing" },
];
