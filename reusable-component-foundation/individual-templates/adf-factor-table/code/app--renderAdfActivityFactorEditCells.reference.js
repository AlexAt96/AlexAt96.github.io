/* Reference extract: renderAdfActivityFactorEditCells(...) from app/src/app.js:7981-7992. */

function renderAdfActivityFactorEditCells(row = [], index = 0) {
  return `
    <td><input name="activityType" aria-label="ADF activity type ${index + 1}" value="${escapeHtml(row[0] || "")}" placeholder="e.g. Copy" /></td>
    <td><input name="complexityFactor" type="number" min="0" step="1" aria-label="ADF complexity factor ${index + 1}" value="${escapeHtml(row[1] ?? 0)}" /></td>
    <td class="row-actions-cell">
      <div class="row-actions">
        <button class="icon-button ghost copy-table-row" type="button" title="Copy ADF factor row"><svg><use href="#icon-copy"></use></svg></button>
        <button class="icon-button ghost remove-metadata-row" type="button" title="Remove ADF factor row"><svg><use href="#icon-x"></use></svg></button>
      </div>
    </td>
  `;
}
