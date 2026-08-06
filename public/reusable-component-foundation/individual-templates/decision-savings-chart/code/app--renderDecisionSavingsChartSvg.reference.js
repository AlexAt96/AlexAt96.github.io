/* Reference extract: renderDecisionSavingsChartSvg(...) from app/src/app.js:27327-27400. */

function renderDecisionSavingsChartSvg(points = [], buSeries = [], mode = "programme") {
  if (!points.length) return `<div class="empty-state compact"><strong>No savings selected.</strong><span>Mark at least one business unit or product as Migrate.</span></div>`;
  const width = 760;
  const height = 390;
  const left = 82;
  const right = 34;
  const top = 38;
  const bottom = 62;
  const series = mode === "bu" && buSeries.length
    ? buSeries.map((item, index) => ({
      label: item.buName,
      points: item.points || [],
      color: getDecisionSeriesColor(index),
    }))
    : [{ label: "Programme", points, color: "#247348" }];
  const values = series.flatMap((item) => item.points.map((point) => Number(point.value || 0)));
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const span = maxValue - minValue || 1;
  const yTicks = getDecisionChartTicks(minValue, maxValue);
  const xLabels = points.length ? points : [{ label: "Start" }, ...[1, 2, 3, 4, 5].map((year) => ({ label: `Year ${year}` }))];
  const xFor = (index) => left + ((width - left - right) * index) / Math.max(1, xLabels.length - 1);
  const yFor = (value) => top + ((maxValue - value) / span) * (height - top - bottom);
  const zeroY = yFor(0);
  const formatAxis = (value) => {
    const abs = Math.abs(value);
    const prefix = value < 0 ? "-" : "";
    if (abs >= 1000000) return `${prefix}GBP ${formatNumber(Math.round(abs / 100000) / 10)}m`;
    if (abs >= 1000) return `${prefix}GBP ${formatNumber(Math.round(abs / 1000))}k`;
    return `${prefix}${formatCurrency(abs)}`;
  };
  return `
    <svg class="decision-savings-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Net savings progression over five years">
      ${yTicks.map((tick) => {
        const y = yFor(tick);
        return `
          <g class="decision-chart-gridline">
            <line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#d7dce4" stroke-width="1"></line>
            <text x="${left - 12}" y="${y + 4}" text-anchor="end" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(formatAxis(tick))}</text>
          </g>
        `;
      }).join("")}
      <line class="decision-chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#a5acb0" stroke-width="1.2"></line>
      <line class="decision-chart-axis" x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#a5acb0" stroke-width="1.2"></line>
      <line class="decision-chart-zero" x1="${left}" y1="${zeroY}" x2="${width - right}" y2="${zeroY}" stroke="#1f2933" stroke-width="1.4" stroke-dasharray="6 5" opacity="0.48"></line>
      ${series.map((item) => {
        const path = item.points.map((point, index) => `${xFor(index)},${yFor(point.value)}`).join(" ");
        return `<polyline class="decision-chart-line" style="--series-color: ${escapeHtml(item.color)}" points="${path}" fill="none" stroke="${escapeHtml(item.color)}" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.4"></polyline>`;
      }).join("")}
      ${series.map((item) => item.points.map((point, index) => {
        const x = xFor(index);
        const y = yFor(point.value);
        return `
          <g class="decision-chart-point" style="--series-color: ${escapeHtml(item.color)}">
            <circle cx="${x}" cy="${y}" r="4.8" fill="#ffffff" stroke="${escapeHtml(item.color)}" stroke-width="2.6"></circle>
          </g>
        `;
      }).join("")).join("")}
      ${xLabels.map((point, index) => `
        <text class="decision-chart-x-label" x="${xFor(index)}" y="${height - 20}" text-anchor="middle" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(point.label.replace("Year ", "Y"))}</text>
      `).join("")}
      ${mode === "bu" && series.length ? `
        <g class="decision-chart-legend">
          ${series.map((item, index) => `
            <g transform="translate(${left + index * 142}, ${top - 12})">
              <circle cx="0" cy="0" r="4" style="fill: ${escapeHtml(item.color)}"></circle>
              <text x="9" y="4" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(item.label)}</text>
            </g>
          `).join("")}
        </g>
      ` : ""}
    </svg>
  `;
}
