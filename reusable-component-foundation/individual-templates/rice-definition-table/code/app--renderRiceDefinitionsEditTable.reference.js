/* Reference extract: renderRiceDefinitionsEditTable(...) from app/src/app.js:7917-7935. */

function renderRiceDefinitionsEditTable(id) {
  const rows = getRiceMetricDefinitionRows();
  return `
    <div class="form-wide setup-table-field edit-data-component fixed-edit-data-component" data-component="fixed-rice-definition-table">
      <div class="field-label-row">
        <span>Fixed RICE metric definitions</span>
        <span class="small-note">Rows and owners are fixed. Effort is calculated and locked.</span>
      </div>
      <div class="data-table-wrap setup-bu-table-wrap">
        <table class="data-table setup-bu-table metadata-edit-table rice-definition-table">
          <thead><tr><th>Metric</th><th>Owner</th><th>Definition</th><th>Unit / measurement</th><th>Input source / logic</th></tr></thead>
          <tbody id="${escapeHtml(id)}">
            ${rows.map((row, index) => `<tr class="rice-definition-row ${row.locked ? "locked" : ""}">${renderRiceDefinitionEditCells(row, index)}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
