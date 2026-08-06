/* Reference extract: renderDecisionWaterfallBuContributions(...) from app/src/app.js:27577-27594. */

function renderDecisionWaterfallBuContributions(scenario) {
  const contributions = Object.values(scenario.buContributions || {}).filter((item) => item.selectedProducts > 0);
  const max = Math.max(...contributions.map((item) => Math.abs(item.netSavings)), 1);
  if (!contributions.length) return `<div class="empty-state compact"><strong>No BU contribution selected.</strong><span>Mark at least one product as Migrate.</span></div>`;
  return contributions
    .sort((a, b) => Number(b.netSavings || 0) - Number(a.netSavings || 0))
    .map((item, index) => {
      const width = Math.min(100, Math.max(4, (Math.abs(item.netSavings) / max) * 100));
      const tone = item.netSavings < 0 ? "negative" : "positive";
      return `
        <div class="decision-waterfall-bu-row ${tone}">
          <span><i style="background: ${escapeHtml(getDecisionSeriesColor(index))}"></i>${escapeHtml(item.buName)}</span>
          <b><em style="width: ${width}%"></em></b>
          <strong>${formatCurrency(item.netSavings)}</strong>
        </div>
      `;
    }).join("");
}
