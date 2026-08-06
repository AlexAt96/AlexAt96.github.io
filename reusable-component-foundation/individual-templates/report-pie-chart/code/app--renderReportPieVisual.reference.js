/* Reference extract: renderReportPieVisual(...) from app/src/app.js:7114-7159. */

function renderReportPieVisual({ eyebrow = "Visual summary", title = "Distribution", rows = [], totalLabel = "Total", emptyMessage = "No data captured yet.", variant = "" } = {}) {
  const chartRows = rows.filter((row) => Number(row.value || 0) > 0);
  const total = chartRows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  if (!chartRows.length || total <= 0) {
    return `<section class="dbu-chart-panel report-chart-panel"><div class="empty-state compact"><strong>${escapeHtml(emptyMessage)}</strong></div></section>`;
  }
  let running = 0;
  const slices = chartRows.map((row, index) => {
    const start = running;
    const end = running + (Number(row.value || 0) / total) * 100;
    running = end;
    return renderReportPieSlice({ ...row, color: row.color || getReportChartColor(index) }, start, end, total);
  }).join("");
  return `
    <section class="dbu-chart-panel report-chart-panel report-pie-panel ${variant ? `report-pie-${escapeHtml(variant)}` : ""}">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="dbu-pie-layout report-pie-layout">
        <svg class="dbu-pie-chart" viewBox="0 0 220 220" role="img" aria-label="${escapeHtml(title)}">
          <circle cx="110" cy="110" r="82" class="dbu-pie-track"></circle>
          ${slices}
          <circle cx="110" cy="110" r="48" class="dbu-pie-core"></circle>
          <text x="110" y="104" class="dbu-pie-core-label">${escapeHtml(totalLabel)}</text>
          <text x="110" y="126" class="dbu-pie-core-value">${escapeHtml(formatNumber(total))}</text>
        </svg>
        <div class="dbu-pie-legend report-chart-legend">
          ${chartRows.map((row, index) => {
            const color = row.color || getReportChartColor(index);
            const pct = total > 0 ? roundPercent((Number(row.value || 0) / total) * 100) : 0;
            return `
              <div class="dbu-legend-row report-legend-row"${row.buId ? ` data-dbu-bu="${escapeHtml(row.buId)}"` : ""}>
                <span class="dbu-legend-swatch" style="--dbu-color: ${escapeHtml(color)}"></span>
                <span>${escapeHtml(row.label)}</span>
                <strong>${formatNumber(row.value)} (${pct}%)</strong>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </section>
  `;
}
