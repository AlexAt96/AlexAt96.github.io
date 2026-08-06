/* Reference extract: renderDecisionAccountingOverview(...) from app/src/app.js:27750-27778. */

function renderDecisionAccountingOverview(models, scenario) {
  const maxNetSaving = Math.max(...models.map((item) => Math.abs(item.cost.netSavings)), 1);
  return `
    <section class="decision-accounting-grid">
      <article class="panel decision-accounting-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Accounting view</p>
            <h3>Cost, saving and payback summary</h3>
          </div>
        </div>
        <div class="decision-accounting-bars" data-decision-accounting-bars>
          ${renderDecisionAccountingBars(scenario)}
        </div>
      </article>
      <article class="panel decision-accounting-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">BU economics</p>
            <h3>Net saving by business unit</h3>
          </div>
        </div>
        <div class="decision-bu-economics" data-decision-bu-economics>
          ${models.map((model) => renderDecisionBuEconomicRow(model, maxNetSaving)).join("")}
        </div>
      </article>
    </section>
  `;
}
