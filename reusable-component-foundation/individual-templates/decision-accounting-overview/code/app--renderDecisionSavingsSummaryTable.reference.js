/* Reference extract: renderDecisionSavingsSummaryTable(...) from app/src/app.js:27829-27842. */

function renderDecisionSavingsSummaryTable(models, scenario) {
  return `
    ${detailHeader("Savings summary", "Finance-facing summary of selected migration economics with links to the cost analysis detail.")}
    <div class="data-table-wrap">
      <table class="data-table decision-savings-summary-table">
        <caption>Savings summary by business unit.</caption>
        <thead><tr><th>Business Unit</th><th>Products migrating</th><th>Migration cost</th><th>Five-year gross</th><th>Net five-year</th><th>Payback</th><th>Detail</th></tr></thead>
        <tbody data-decision-savings-body>
          ${renderDecisionSavingsSummaryRows(models, scenario)}
        </tbody>
      </table>
    </div>
  `;
}
