/* Reference extract: renderDataDictionaryTableSection(...) from app/src/app.js:6918-6931. */

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
