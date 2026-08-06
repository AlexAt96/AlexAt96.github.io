/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

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

function renderMiniTable(caption, headers, rows) {
  return table(headers, rows, caption);
}

function renderInputTraceabilityTable(entries) {
  if (!entries.length) {
    return `<div class="empty-state"><strong>No matching source records.</strong><span>Adjust the filters or add an offline source from the form.</span></div>`;
  }
  return `
    <div class="data-table-wrap">
      <table class="data-table input-table">
        <caption>Source and evidence traceability register. Attached file links ${SERVER_MODE ? "download the stored local upload version" : "download the embedded localStorage data URL"}.</caption>
        <thead>
          <tr>
            <th>Business Unit</th>
            <th>Source record</th>
            <th>Category</th>
            <th>Source / method</th>
            <th>Owner/contact</th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Downstream output</th>
            <th>Used for</th>
            <th>Gaps / notes</th>
            <th>Supporting files</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(renderInputTraceabilityRow).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderMetadataTableSection(title, contextLabel, headers, rows, caption) {
  return `
    <section class="panel metadata-review-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Metadata category</p>
          <h3>${escapeHtml(contextLabel)} ${escapeHtml(title)}</h3>
        </div>
        <span class="chip">${rows.length} row${rows.length === 1 ? "" : "s"}</span>
      </div>
      ${table(headers, rows, caption, true)}
    </section>
  `;
}

function renderDataDictionaryTableSection(title, headers, rows, caption, className = "") {
  return `
    <section class="panel metadata-review-panel data-dictionary-table-panel ${escapeHtml(className)}">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Data dictionary insight</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
        <span class="chip">${rows.length} row${rows.length === 1 ? "" : "s"}</span>
      </div>
      ${table(headers, rows, caption, true)}
    </section>
  `;
}

function copyEditableTableRow(button) {
  const row = button.closest("tr");
  if (!row) return;
  const clone = row.cloneNode(true);
  const sourceFields = Array.from(row.querySelectorAll("input, select, textarea"));
  const cloneFields = Array.from(clone.querySelectorAll("input, select, textarea"));
  sourceFields.forEach((field, index) => {
    const copyField = cloneFields[index];
    if (!copyField) return;
    if (field.type === "checkbox" || field.type === "radio") {
      copyField.checked = field.checked;
      return;
    }
    copyField.value = field.value;
  });
  clone.querySelectorAll('input[type="hidden"], input[name="businessUnitId"], input[name="stakeholderId"], input[name="environmentId"]').forEach((input) => {
    input.value = "";
  });
  row.insertAdjacentElement("afterend", clone);
}

function wireMetadataTableActions(selector, renderEmptyCells) {
  const rowsElement = document.querySelector(selector);
  if (!rowsElement) return;
  const addButton = document.querySelector(`#${rowsElement.id}AddRow`) || document.querySelector("#addAdfFactorRow");
  addButton?.addEventListener("click", () => {
    const rowClass = rowsElement.querySelector("tr")?.className || (rowsElement.id.includes("adf") ? "adf-factor-row" : "rice-definition-row");
    rowsElement.insertAdjacentHTML("beforeend", `<tr class="${escapeHtml(rowClass)}">${renderEmptyCells()}</tr>`);
  });
  rowsElement.addEventListener("click", (event) => {
    const copyButton = event.target.closest(".copy-table-row");
    if (copyButton) {
      copyEditableTableRow(copyButton);
      return;
    }
    const removeButton = event.target.closest(".remove-metadata-row");
    if (!removeButton) return;
    const rows = rowsElement.querySelectorAll("tr");
    if (rows.length <= 1) {
      rows[0]?.querySelectorAll("input, textarea").forEach((field) => {
        field.value = field.type === "number" ? "0" : "";
      });
      return;
    }
    removeButton.closest("tr")?.remove();
  });
}

async function parseImportTableRowsFromFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const lowerName = String(file.name || "").toLowerCase();
  if (lowerName.endsWith(".csv")) return parseCsvRows(decodeBytes(bytes));
  if (looksLikeZip(bytes)) return parseXlsxRows(bytes);
  const text = decodeBytes(bytes);
  return /<table|<html|<tr/i.test(text) ? parseHtmlTableRows(text) : parseCsvRows(text);
}
