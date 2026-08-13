/* Reference extract: renderPhaseStatusModelTable(...) from app/src/app.js:7994-8016. */

function renderPhaseStatusModelTable() {
  const rows = getPhaseStatusModelRows();
  return `
    <div class="form-wide setup-table-field edit-data-component status-model-component" data-component="phase-status-model-table">
      <div class="field-label-row">
        <span>Phase workflow statuses</span>
        <button class="icon-button ghost" id="phaseStatusModelRowsAddRow" type="button">
          <svg><use href="#icon-arrow"></use></svg>
          <span>Add status</span>
        </button>
      </div>
      <div class="data-table-wrap setup-bu-table-wrap">
        <table class="data-table setup-bu-table metadata-edit-table phase-status-model-table">
          <thead><tr><th>Status</th><th>Reference key</th><th>Workflow role</th><th>Colour scheme</th><th>Preview</th><th></th></tr></thead>
          <tbody id="phaseStatusModelRows">
            ${rows.map((row, index) => `<tr class="phase-status-row">${renderPhaseStatusModelEditCells(row, index)}</tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="small-note">The preview uses the same status pill component as the phase task boards and status toggles.</p>
    </div>
  `;
}
