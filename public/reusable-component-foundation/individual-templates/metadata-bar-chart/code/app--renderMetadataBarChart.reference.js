/* Reference extract: renderMetadataBarChart(...) from app/src/app.js:14231-14255. */

function renderMetadataBarChart(title = "Metadata distribution", rows = []) {
  const cleanRows = rows.filter((row) => Number(row.value || 0) > 0);
  const max = Math.max(...cleanRows.map((row) => Number(row.value || 0)), 1);
  return `
    <div class="metadata-chart-panel">
      <div class="metadata-chart-heading">
        <p class="eyebrow">Graph</p>
        <h4>${escapeHtml(title)}</h4>
      </div>
      <div class="bar-list metadata-bar-chart">
        ${cleanRows.length ? cleanRows.map((row) => {
          const value = Number(row.value || 0);
          const width = Math.max(4, Math.round((value / max) * 100));
          return `
            <div class="bar-row metadata-bar-row">
              <span>${escapeHtml(row.label)}</span>
              <span class="bar-track"><span class="bar-fill" style="width:${width}%"></span></span>
              <strong>${escapeHtml(`${formatNumber(value)}${row.suffix || ""}`)}</strong>
            </div>
          `;
        }).join("") : `<p class="small-note">No rows available for this chart yet.</p>`}
      </div>
    </div>
  `;
}
