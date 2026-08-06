/* Reference extract: renderMetadataTableSection(...) from app/src/app.js:14589-14602. */

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
