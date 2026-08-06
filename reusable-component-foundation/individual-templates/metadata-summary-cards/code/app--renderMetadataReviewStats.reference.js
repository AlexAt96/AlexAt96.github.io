/* Reference extract: renderMetadataReviewStats(...) from app/src/app.js:14127-14139. */

function renderMetadataReviewStats(model, contextLabel = "Cross-BU") {
  const summary = model.summary || getMetadataReviewSummary(model);
  return `
    <section class="dbu-kpi-grid metadata-review-stats" aria-label="${escapeHtml(contextLabel)} metadata review statistics">
      ${factCard("UC catalogs", summary.catalogCount, `${summary.bindingRowCount} binding row${summary.bindingRowCount === 1 ? "" : "s"}`, "Source: parsed Unity Catalog binding extracts.")}
      ${factCard("Inventory resources", summary.inventoryRowCount, "Terraform resource rows", "Source: parsed Databricks Terraform exporter output.")}
      ${factCard("External locations", summary.externalLocationCount, `${summary.storagePathCount} storage path${summary.storagePathCount === 1 ? "" : "s"}`, "Source: parsed external location and storage metadata.")}
      ${factCard("UC grants", summary.grantRowCount, `${summary.broadGrantCount} broad access flag${summary.broadGrantCount === 1 ? "" : "s"}`, "Source: parsed Unity Catalog grants.")}
      ${factCard("Table sizing", summary.sizingRowCount, `${formatNumber(summary.tableSizeTb)} TB`, "Source: parsed table sizing output.")}
      ${factCard("Dictionary columns", summary.dictionaryColumnCount, `${summary.sourceFileCount} source file${summary.sourceFileCount === 1 ? "" : "s"}`, "Source: parsed data dictionary output.")}
    </section>
  `;
}
