/* Reference extract: renderDecisionCgiRecommendationPanel(...) from app/src/app.js:27071-27097. */

function renderDecisionCgiRecommendationPanel(models, scenario) {
  const migrateCount = Object.values(scenario.buContributions || {}).filter((item) => item.currentAction === "Migrate").length;
  const discussCount = Object.values(scenario.buContributions || {}).filter((item) => item.currentAction === "Assess further").length;
  return `
    <section class="panel decision-recommendation-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">CGI migration recommendation</p>
          <h3>Recommended migration order and current scenario</h3>
        </div>
        <div class="decision-recommendation-summary">
          <span><strong data-decision-recommend-migrate-count>${formatNumber(migrateCount)}</strong> migrate</span>
          <span><strong data-decision-recommend-discuss-count>${formatNumber(discussCount)}</strong> discuss</span>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table decision-recommendation-table">
          <caption>CGI recommendation by business unit and current configured migration scenario.</caption>
          <thead><tr><th>Order</th><th>Business Unit</th><th>CGI recommendation</th><th>Current scenario</th><th>RICE</th><th>Net five-year</th><th>Confidence / appetite</th><th>Why</th></tr></thead>
          <tbody data-decision-recommendation-body>
            ${renderDecisionCgiRecommendationRows(models, scenario)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
