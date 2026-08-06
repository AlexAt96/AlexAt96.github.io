/* Reference extract: renderDecisionRiceSequencingPanel(...) from app/src/app.js:27596-27616. */

function renderDecisionRiceSequencingPanel(models, scenario) {
  return `
    <section class="panel decision-rice-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">RICE sequencing</p>
          <h3>Migration priority by selected scenario</h3>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table decision-rice-table">
          <caption>Scenario-driven RICE migration sequencing.</caption>
          <thead><tr><th>Sequence</th><th>Business Unit</th><th>RICE</th><th>Reach</th><th>Impact</th><th>Confidence</th><th>Effort</th><th>Why this position</th></tr></thead>
          <tbody data-decision-rice-body>
            ${renderDecisionRiceRows(models, scenario)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
