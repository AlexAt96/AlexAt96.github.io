/* Reference extract: renderUnityCatalogBindingTable(...) from app/src/app.js:14299-14327. */

function renderUnityCatalogBindingTable(rows = [], contextLabel = "Cross-BU") {
  return `
    <section class="panel unity-catalog-binding-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Unity Catalog evidence</p>
          <h3>${escapeHtml(contextLabel)} catalog/workspace bindings</h3>
        </div>
      </div>
      ${table(
        ["BU", "Environment", "Catalog", "Type", "Owner", "Metastore", "Workspace binding", "Status", "Source evidence", "Note"],
        rows.map((row) => [
          row.businessUnitName,
          row.environmentLabel,
          row.catalogName,
          row.catalogType,
          row.owner,
          row.metastoreId || "Not captured",
          row.workspaceId || row.bindingType ? `${row.workspaceId || "Workspace not returned"}${row.bindingType ? ` / ${row.bindingType}` : ""}` : "No binding returned",
          renderUnityCatalogBindingStatus(row),
          row.sourceEvidenceHtml || row.sourceFileName || "Source evidence",
          row.note || "",
        ]),
        rows.length ? "Unity Catalog catalog/workspace binding rows parsed from uploaded Terraform and Databricks Metadata outputs." : "No Unity Catalog binding rows have been parsed yet.",
        true,
      )}
    </section>
  `;
}
