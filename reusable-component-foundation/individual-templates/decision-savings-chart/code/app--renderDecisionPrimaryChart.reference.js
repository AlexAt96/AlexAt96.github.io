/* Reference extract: renderDecisionPrimaryChart(...) from app/src/app.js:27293-27303. */

function renderDecisionPrimaryChart(scenario, chartType = "progression", chartMode = "programme", buId = "") {
  if (chartType === "waterfall") {
    if (chartMode === "bu") {
      const selectedBu = getDecisionSelectedWaterfallBu(scenario, buId);
      if (!selectedBu) return `<div class="empty-state compact"><strong>No BU waterfall available.</strong><span>Mark at least one product as Migrate.</span></div>`;
      return renderDecisionWaterfallChart(selectedBu, { stacked: false });
    }
    return renderDecisionWaterfallChart(scenario, { stacked: true });
  }
  return renderDecisionSavingsChartSvg(scenario.points, scenario.buSeries, chartMode);
}
