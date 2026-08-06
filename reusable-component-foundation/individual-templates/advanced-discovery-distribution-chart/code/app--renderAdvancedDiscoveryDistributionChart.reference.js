/* Reference extract: renderAdvancedDiscoveryDistributionChart(...) from app/src/app.js:13277-13306. */

function renderAdvancedDiscoveryDistributionChart({ eyebrow, title, rows = [] }) {
  const chartRows = getAdvancedDiscoveryChartRows(rows);
  if (!chartRows.length) return renderAdvancedDiscoveryEmptyChart(title);
  return `
    <section class="dbu-chart-panel advanced-discovery-chart-panel advanced-discovery-distribution-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="dbu-split-list advanced-discovery-split-list">
        ${chartRows.map((row) => `
          <div class="dbu-split-row advanced-discovery-split-row">
            <span class="dbu-split-label">
              <strong>${escapeHtml(row.label)}</strong>
              <small>${escapeHtml(`${formatAdvancedDiscoveryChartPercent(row.percent)}% of visible rows`)}</small>
            </span>
            <span class="dbu-stacked-bar" aria-label="${escapeHtml(`${row.label}: ${formatAdvancedDiscoveryChartValue(row)}`)}">
              <span class="advanced-discovery-stacked-segment" style="width: ${Math.max(3, row.percent)}%; background: ${escapeHtml(row.color)}"></span>
            </span>
            <span class="dbu-split-values advanced-discovery-split-values">
              <span>${escapeHtml(formatAdvancedDiscoveryChartValue(row))}</span>
            </span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}
