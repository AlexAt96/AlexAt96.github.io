/* Reference extract: renderDecisionWaterfallChart(...) from app/src/app.js:27450-27521. */

function renderDecisionWaterfallChart(scenario, options = {}) {
  const steps = getDecisionWaterfallSteps(scenario);
  const width = 760;
  const height = 390;
  const left = 82;
  const right = 34;
  const top = 38;
  const bottom = 66;
  const stacked = Boolean(options.stacked);
  const stackedContributions = stacked
    ? Object.values(scenario.buContributions || {}).filter((item) => item.selectedProducts > 0)
    : [];
  let running = 0;
  const bars = steps.map((step, index) => {
    const start = step.kind === "net" ? 0 : running;
    const end = step.kind === "net" ? step.value : running + step.value;
    if (step.kind !== "net") running = end;
    return { ...step, index, start, end };
  });
  const values = [
    ...bars.flatMap((bar) => [bar.start, bar.end, 0]),
    ...getDecisionWaterfallStackedScaleValues(bars, stackedContributions),
  ];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = maxValue - minValue || 1;
  const yTicks = getDecisionChartTicks(minValue, maxValue);
  const xStep = (width - left - right) / bars.length;
  const barWidth = Math.min(64, xStep * 0.62);
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
    <svg class="decision-savings-chart decision-waterfall-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Five-year migration payback waterfall">
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
      ${bars.map((bar) => {
        const x = left + bar.index * xStep + (xStep - barWidth) / 2;
        const y = Math.min(yFor(bar.start), yFor(bar.end));
        const h = Math.max(3, Math.abs(yFor(bar.start) - yFor(bar.end)));
        const tone = bar.kind === "cost" || bar.value < 0 ? "cost" : bar.kind === "net" ? "net" : "saving";
        const fill = tone === "cost" ? "#e31937" : tone === "net" ? "#285d9e" : "#247348";
        const stackedSegments = stackedContributions.length > 1 && bar.kind === "saving"
          ? renderDecisionWaterfallStackedSegments(bar, stackedContributions, x, barWidth, yFor)
          : "";
        return `
          <g class="decision-waterfall-bar ${tone}">
            ${stackedSegments || `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6" fill="${fill}"></rect>`}
            <text x="${x + barWidth / 2}" y="${height - 25}" text-anchor="middle" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(bar.label.replace("Year ", "Y"))}</text>
            <text x="${x + barWidth / 2}" y="${Math.max(16, y - 8)}" text-anchor="middle" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(formatAxis(bar.value))}</text>
          </g>
        `;
      }).join("")}
    </svg>
  `;
}
