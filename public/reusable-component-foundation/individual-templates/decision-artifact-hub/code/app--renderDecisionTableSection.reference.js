/* Reference extract: renderDecisionTableSection(...) from app/src/app.js:27882-27887. */

function renderDecisionTableSection(models = getDecisionBuModels(), scenario = getDecisionScenarioSummary(models)) {
  return `
    ${detailHeader("Configured decision options by BU", "A concise executive table showing what the scenario configurator currently has in scope.")}
    ${renderDecisionTable(models, scenario)}
  `;
}
