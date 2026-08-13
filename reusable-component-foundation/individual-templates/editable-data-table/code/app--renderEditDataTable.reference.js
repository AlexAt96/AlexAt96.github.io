/* Reference extract: renderEditDataTable(...) from app/src/app.js:6013-6033. */

function renderEditDataTable({ id, rowClass, tableClass = "", addButtonId, addLabel, columns, rows }) {
  return `
    <div class="form-wide setup-table-field edit-data-component" data-component="edit-data-table">
      <div class="field-label-row">
        <span>Editable data table</span>
        <button class="icon-button ghost" id="${escapeHtml(addButtonId)}" type="button">
          <svg><use href="#icon-arrow"></use></svg>
          <span>${escapeHtml(addLabel)}</span>
        </button>
      </div>
      <div class="data-table-wrap setup-bu-table-wrap">
        <table class="data-table setup-bu-table ${escapeHtml(tableClass)}">
          <thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
          <tbody id="${escapeHtml(id)}">
            ${rows.map((cells) => `<tr class="${escapeHtml(rowClass)}">${cells}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
