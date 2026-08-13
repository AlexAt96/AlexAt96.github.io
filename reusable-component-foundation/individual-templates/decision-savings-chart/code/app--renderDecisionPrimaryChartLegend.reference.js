/* Reference extract: renderDecisionPrimaryChartLegend(...) from app/src/app.js:27305-27312. */

function renderDecisionPrimaryChartLegend(scenario, chartType = "progression", chartMode = "programme") {
  const needsBuLegend = chartMode === "bu" || chartType === "waterfall";
  const series = Object.values(scenario.buContributions || {}).filter((item) => item.selectedProducts > 0);
  if (!needsBuLegend || !series.length) return "";
  return series.map((item, index) => `
    <span><i style="background: ${escapeHtml(getDecisionSeriesColor(index))}"></i>${escapeHtml(item.buName)}</span>
  `).join("");
}
