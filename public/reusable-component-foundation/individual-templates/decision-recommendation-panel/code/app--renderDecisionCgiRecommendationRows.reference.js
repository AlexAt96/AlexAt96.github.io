/* Reference extract: renderDecisionCgiRecommendationRows(...) from app/src/app.js:27099-27113. */

function renderDecisionCgiRecommendationRows(models, scenario) {
  const modelByBu = new Map(models.map((model) => [model.bu.id, model]));
  return getDecisionRecommendationRows(models, scenario, modelByBu).map((row) => `
      <tr>
        <td class="number">${escapeHtml(row.orderLabel)}</td>
        <td><a href="${buUrl(row.contribution.buId)}">${escapeHtml(row.contribution.buName)}</a></td>
        <td><span class="chip ${recommendationClass(row.recommendation.label)}">${escapeHtml(row.recommendation.label)}</span></td>
        <td><span class="chip ${recommendationClass(row.contribution.currentScenarioLabel)}">${escapeHtml(row.contribution.currentScenarioLabel)}</span></td>
        <td class="number">${formatNumber(row.riceScore)}</td>
        <td class="number">${formatCurrency(row.costNetSavings)}</td>
        <td>${renderDecisionReadinessSignal(row.readiness)}</td>
        <td>${escapeHtml(row.recommendation.rationale || "Review cost saving, RICE score and readiness before deciding.")}</td>
      </tr>
    `).join("");
}
