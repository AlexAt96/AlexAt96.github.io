/* Reference extract: renderAdvancedDiscoveryPieChart(...) from app/src/app.js:13235-13275. */

function renderAdvancedDiscoveryPieChart({ eyebrow, title, rows = [], centreLabel = "Total" }) {
  const chartRows = getAdvancedDiscoveryChartRows(rows);
  if (!chartRows.length) return renderAdvancedDiscoveryEmptyChart(title);
  let running = 0;
  const slices = chartRows.map((row) => {
    const start = running;
    const end = running + row.percent;
    running = end;
    return renderAdvancedDiscoveryPieSlice(row, start, end);
  }).join("");
  const total = chartRows.reduce((sum, row) => sum + row.value, 0);
  const suffix = chartRows.find((row) => row.suffix)?.suffix || "";
  return `
    <section class="dbu-chart-panel advanced-discovery-chart-panel advanced-discovery-pie-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="dbu-pie-layout advanced-discovery-pie-layout">
        <svg class="dbu-pie-chart" viewBox="0 0 220 220" role="img" aria-label="${escapeHtml(title)}">
          <circle cx="110" cy="110" r="82" class="dbu-pie-track"></circle>
          ${slices}
          <circle cx="110" cy="110" r="48" class="dbu-pie-core"></circle>
          <text x="110" y="104" class="dbu-pie-core-label">${escapeHtml(centreLabel)}</text>
          <text x="110" y="126" class="dbu-pie-core-value">${escapeHtml(`${formatNumber(total)}${suffix}`)}</text>
        </svg>
        <div class="dbu-pie-legend advanced-discovery-legend">
          ${chartRows.map((row) => `
            <div class="dbu-legend-row advanced-discovery-legend-row">
              <span class="dbu-legend-swatch" style="--dbu-color: ${escapeHtml(row.color)}"></span>
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(formatAdvancedDiscoveryChartValue(row))}</strong>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}
