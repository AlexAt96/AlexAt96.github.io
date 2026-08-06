/* Reference extract: renderTechnologyMappingMetadataEditCells(...) from app/src/app.js:8113-8136. */

function renderTechnologyMappingMetadataEditCells(row = {}, index = 0) {
  const aiApproved = isAiApprovedTechnologyMapping(row);
  return `
    <td>
      <input name="technologyMappingId" type="hidden" value="${escapeHtml(row.technologyMappingId || "")}" />
      <input name="mappingSourceType" type="hidden" value="${escapeHtml(row.sourceType || "")}" />
      <input name="mappingSourceAiDiagramInsightId" type="hidden" value="${escapeHtml(row.sourceAiDiagramInsightId || "")}" />
      ${aiApproved ? `<span class="status-pill in-review technology-mapping-source-flag">AI approved</span>` : ""}
      <input name="mappingFunction" aria-label="Function ${index + 1}" value="${escapeHtml(row.functionName || "")}" placeholder="e.g. Data ingestion" />
    </td>
    <td><textarea name="mappingDescription" aria-label="Description ${index + 1}" placeholder="What this function covers">${escapeHtml(row.description || "")}</textarea></td>
    <td><textarea name="mappingAzureTooling" aria-label="Azure Tooling ${index + 1}" placeholder="Azure tooling">${escapeHtml(row.azureTooling || "")}</textarea></td>
    <td><textarea name="mappingAwsTooling" aria-label="AWS Tooling ${index + 1}" placeholder="AWS tooling">${escapeHtml(row.awsTooling || "")}</textarea></td>
    <td><textarea name="mappingDatabricksTooling" aria-label="Databricks Tooling ${index + 1}" placeholder="Databricks tooling">${escapeHtml(row.databricksTooling || "")}</textarea></td>
    <td><textarea name="mappingOtherTooling" aria-label="Other tooling ${index + 1}" placeholder="Other tooling">${escapeHtml(row.otherTooling || "")}</textarea></td>
    <td><textarea name="mappingNotes" aria-label="Comments / Notes ${index + 1}" placeholder="Comments or notes">${escapeHtml(row.notes || "")}</textarea></td>
    <td class="row-actions-cell">
      <div class="row-actions">
        <button class="icon-button ghost copy-table-row" type="button" title="Copy tech mapping row"><svg><use href="#icon-copy"></use></svg></button>
        <button class="icon-button ghost remove-metadata-row" type="button" title="Remove tech mapping row"><svg><use href="#icon-x"></use></svg></button>
      </div>
    </td>
  `;
}
