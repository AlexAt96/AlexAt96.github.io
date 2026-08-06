/* Reference extract: renderExcelImportExportComponent(...) from app/src/app.js:6035-6057. */

function renderExcelImportExportComponent({ componentId, title, description, columns, uploadDisabled = false }) {
  return `
    <div class="form-wide import-panel excel-import-export-component" data-component="excel-import-export" data-component-id="${escapeHtml(componentId)}">
      <div>
        <span class="eyebrow">Excel import</span>
        <h4>${escapeHtml(title)}</h4>
        <p class="small-note">${escapeHtml(description)}</p>
      </div>
      <div class="import-actions">
        <button class="icon-button ghost" id="${escapeHtml(componentId)}DownloadTemplate" type="button">
          <svg><use href="#icon-download"></use></svg>
          <span>Download template</span>
        </button>
        <label class="icon-button ghost ${uploadDisabled ? "disabled" : ""}" for="${escapeHtml(componentId)}Upload" title="${uploadDisabled ? "Reopen this screen before uploading DBU usage." : "Upload Excel"}">
          <svg><use href="#icon-upload"></use></svg>
          <span>Upload Excel</span>
        </label>
        <input class="file-input-hidden" id="${escapeHtml(componentId)}Upload" type="file" accept=".xlsx,.xls,.html,.htm,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"${uploadDisabled ? " disabled" : ""} />
      </div>
      <p class="small-note import-status" id="${escapeHtml(componentId)}Status">Template columns: ${columns.map(escapeHtml).join(", ")}. Uploading a file only stages rows in this form; press the page Save button to store them.</p>
    </div>
  `;
}
