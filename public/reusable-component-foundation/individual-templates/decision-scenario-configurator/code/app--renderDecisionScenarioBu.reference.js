/* Reference extract: renderDecisionScenarioBu(...) from app/src/app.js:27680-27697. */

function renderDecisionScenarioBu(model) {
  const { bu, products, productWeight, defaultAction, cgiRecommendation } = model;
  const checked = !["No action", "Retain current"].includes(defaultAction);
  return `
    <article class="decision-config-row" data-decision-bu-row="${escapeHtml(bu.id)}">
      <label class="decision-bu-toggle">
        <input type="checkbox" data-decision-bu-toggle data-bu-id="${escapeHtml(bu.id)}" ${checked ? "checked" : ""} />
        <span>
          <strong>${escapeHtml(bu.name)}</strong>
          <small>CGI: ${escapeHtml(cgiRecommendation.label)}</small>
        </span>
      </label>
      <div class="decision-product-control-list">
        ${products.map((product) => renderDecisionProductControl(model, product, productWeight)).join("")}
      </div>
    </article>
  `;
}
