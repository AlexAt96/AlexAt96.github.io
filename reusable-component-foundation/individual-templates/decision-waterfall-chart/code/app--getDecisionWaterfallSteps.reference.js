/* Reference extract: getDecisionWaterfallSteps(...) from app/src/app.js:27436-27448. */

function getDecisionWaterfallSteps(scenario) {
  const yearOneTwo = Number(scenario.yearOneTwoSavings || 0);
  const yearThreeFive = Number(scenario.yearThreeFiveSavings || 0);
  return [
    { label: "Migration cost", value: -Number(scenario.migrationCost || 0), kind: "cost" },
    { label: "Year 1", value: yearOneTwo, kind: "saving" },
    { label: "Year 2", value: yearOneTwo, kind: "saving" },
    { label: "Year 3", value: yearThreeFive, kind: "saving" },
    { label: "Year 4", value: yearThreeFive, kind: "saving" },
    { label: "Year 5", value: yearThreeFive, kind: "saving" },
    { label: "Net", value: Number(scenario.netSavings || 0), kind: "net" },
  ];
}
