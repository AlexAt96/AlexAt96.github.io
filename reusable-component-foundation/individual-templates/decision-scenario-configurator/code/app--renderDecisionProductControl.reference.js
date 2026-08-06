/* Reference extract: renderDecisionProductControl(...) from app/src/app.js:27699-27748. */

function renderDecisionProductControl(model, product, weight) {
  const { bu, cost, rice, defaultAction } = model;
  const weighted = {
    migrationCost: bu.migrationCost * weight,
    fiveYearSavings: cost.fiveYearSavings * weight,
    yearOneTwoSavings: cost.yearOneTwoSavings * weight,
    yearThreeFiveSavings: cost.yearThreeFiveSavings * weight,
    netSavings: (cost.fiveYearSavings - bu.migrationCost) * weight,
    riceScore: Number(rice.riceScore || 0) * weight,
    weight,
  };
  const options = ["Migrate", "Assess further", "Retain current", "No action"];
  return `
    <div class="decision-product-control">
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <small>${product.environmentCount ? `${formatNumber(product.environmentCount)} environment${product.environmentCount === 1 ? "" : "s"}` : "Product-level decision"}</small>
      </div>
      <div class="decision-product-contribution ${weighted.netSavings < 0 ? "negative" : "positive"}">
        <span>Contributed savings</span>
        <strong data-decision-product-contribution>${formatCurrency(weighted.netSavings)}</strong>
      </div>
      <select
        data-decision-product-action
        data-bu-id="${escapeHtml(bu.id)}"
        data-bu-name="${escapeHtml(bu.name)}"
        data-product-id="${escapeHtml(product.id)}"
        data-product-name="${escapeHtml(product.name)}"
        data-migration-cost="${weighted.migrationCost}"
        data-five-year-savings="${weighted.fiveYearSavings}"
        data-year-one-two-savings="${weighted.yearOneTwoSavings}"
        data-year-three-five-savings="${weighted.yearThreeFiveSavings}"
        data-net-savings="${weighted.netSavings}"
        data-rice-score="${weighted.riceScore}"
        data-rice-reach="${rice.reachScore}"
        data-rice-impact="${rice.impactScore}"
        data-rice-confidence="${rice.confidenceScore}"
        data-rice-effort="${rice.effortScore}"
        data-weight="${weighted.weight}"
        data-cgi-recommendation="${escapeHtml(model.cgiRecommendation.label)}"
        data-cgi-recommendation-tone="${escapeHtml(model.cgiRecommendation.tone)}"
        data-cgi-recommendation-rationale="${escapeHtml(model.cgiRecommendation.rationale)}"
        aria-label="Decision for ${escapeHtml(product.name)}"
        ${["No action", "Retain current"].includes(defaultAction) ? "disabled" : ""}
      >
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === defaultAction ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </div>
  `;
}
