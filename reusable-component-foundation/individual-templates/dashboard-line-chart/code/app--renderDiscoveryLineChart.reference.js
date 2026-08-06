/* Reference extract: renderDiscoveryLineChart(...) from app/src/app.js:1929-1980. */

function renderDiscoveryLineChart(rows) {
  const chartWidth = 660;
  const chartHeight = 220;
  const left = 8;
  const right = 8;
  const top = 18;
  const bottom = 18;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const points = rows.map((row, index) => {
    const x = left + (rows.length <= 1 ? 0 : (plotWidth * index) / (rows.length - 1));
    const y = top + plotHeight - (Math.max(0, Math.min(100, row.progress)) / 100) * plotHeight;
    return { ...row, x, y };
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaString = `${left},${top + plotHeight} ${pointString} ${left + plotWidth},${top + plotHeight}`;
  return `
    <div class="dashboard-line-chart" aria-label="Phase percentage complete line chart">
      <div class="dashboard-chart-plot">
        <div class="dashboard-chart-y-axis" aria-hidden="true">
          ${[100, 75, 50, 25, 0].map((tick) => `<span>${tick}%</span>`).join("")}
        </div>
        <div class="dashboard-chart-main">
          <svg viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Percentage complete by phase">
            <defs>
              <linearGradient id="dashboardProgressArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#2fb6ff" stop-opacity="0.28" />
                <stop offset="100%" stop-color="#2fb6ff" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            ${[0, 25, 50, 75, 100].map((tick) => {
              const y = top + plotHeight - (tick / 100) * plotHeight;
              return `<line class="dashboard-chart-gridline" x1="${left}" y1="${y}" x2="${left + plotWidth}" y2="${y}"></line>`;
            }).join("")}
            <polygon class="dashboard-chart-area" points="${areaString}"></polygon>
            <polyline class="dashboard-chart-line" points="${pointString}"></polyline>
            ${points.map((point) => `
              <a href="${phaseUrl(point.phase.key, point.buId)}">
                <circle class="dashboard-chart-point ${escapeHtml(point.statusClass)}" cx="${point.x}" cy="${point.y}" r="6">
                  <title>${escapeHtml(point.tooltip)}</title>
                </circle>
              </a>
            `).join("")}
          </svg>
          <div class="dashboard-chart-x-axis" aria-hidden="true" style="--phase-count:${Math.max(points.length, 1)};">
            ${points.map((point) => `<span>${escapeHtml(point.phase.shortTitle || point.phase.title)}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}
