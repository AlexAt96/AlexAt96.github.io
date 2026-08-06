/* Reference extract: renderReportBarVisual(...) from app/src/app.js:7170-7205. */

function renderReportBarVisual({ eyebrow = "Visual summary", title = "Distribution", rows = [], valueSuffix = "", emptyMessage = "No data captured yet.", maxRows = 8 } = {}) {
  const chartRows = rows.filter((row) => Number(row.value || 0) > 0).slice(0, maxRows);
  const maxValue = Math.max(1, ...chartRows.map((row) => Number(row.value || 0)));
  if (!chartRows.length) {
    return `<section class="dbu-chart-panel report-chart-panel"><div class="empty-state compact"><strong>${escapeHtml(emptyMessage)}</strong></div></section>`;
  }
  return `
    <section class="dbu-chart-panel report-chart-panel report-bar-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="report-bar-list">
        ${chartRows.map((row, index) => {
          const value = Number(row.value || 0);
          const width = Math.max(4, Math.round((value / maxValue) * 100));
          const color = row.color || getReportChartColor(index);
          return `
            <div class="report-bar-row"${row.buId ? ` data-dbu-bu="${escapeHtml(row.buId)}"` : ""}>
              <span class="report-bar-label">
                <strong>${escapeHtml(row.label)}</strong>
                ${row.detail ? `<small>${escapeHtml(row.detail)}</small>` : ""}
              </span>
              <span class="report-bar-track" aria-label="${escapeHtml(`${row.label}: ${formatNumber(value)}${valueSuffix}`)}">
                <i style="width: ${width}%; --report-bar-color: ${escapeHtml(color)}"></i>
              </span>
              <strong>${formatNumber(value)}${escapeHtml(valueSuffix)}</strong>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}
