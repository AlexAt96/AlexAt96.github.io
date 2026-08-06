/* Reference extract: renderDecisionAccountingBars(...) from app/src/app.js:27780-27786. */

function renderDecisionAccountingBars(scenario) {
  return [
    ["Initial migration cost", -scenario.migrationCost],
    ["Five-year gross saving", scenario.fiveYearSavings],
    ["Net five-year saving", scenario.netSavings],
  ].map(([label, value]) => renderDecisionAccountingBar(label, value, scenario)).join("");
}
