/* Reference extract: renderDatabricksInventoryResourceTypePanel(...) from app/src/app.js:14375-14394. */

function renderDatabricksInventoryResourceTypePanel(group, active = false) {
  const columns = getDatabricksInventoryAttributeColumns(group.rows);
  const headers = ["BU", "Environment", "Source", "Terraform resource type", "Terraform name", "Owner / creator", "External ID", ...columns.map(formatMetadataAttributeLabel), "Source evidence"];
  const tableRows = group.rows.map((row) => [
    row.businessUnitName,
    row.environmentLabel,
    row.sourceGroup || row.sourceFileName || "Terraform",
    row.resourceType,
    row.displayName,
    row.owner || row.creator || "Not captured",
    row.importId,
    ...columns.map((column) => formatMetadataAttributeValue(row.attributes?.[column])),
    row.sourceEvidenceHtml,
  ]);
  return `
    <div class="metadata-resource-tab-panel${active ? " active" : ""}" role="tabpanel" data-metadata-resource-panel="${escapeHtml(group.key)}"${active ? "" : " hidden"}>
      ${table(headers, tableRows, `${group.rows.length} ${group.label} row${group.rows.length === 1 ? "" : "s"} with captured attributes expanded as columns.`, true)}
    </div>
  `;
}
