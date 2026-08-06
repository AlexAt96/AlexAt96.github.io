/* Reference extract: renderDecisionPage(...) from app/src/app.js:4407-4438. */

function renderDecisionPage() {
  const models = getDecisionBuModels();
  const scenario = getDecisionScenarioSummary(models);
  return `
    ${renderBreadcrumbs([
      ["Dashboard", "index.html"],
      ["Decision", "decision.html"],
    ])}
    <section class="dashboard-title decision-page-title">
      <div>
        <p class="eyebrow">Executive decision</p>
        <h2>Databricks migration decision cockpit</h2>
      </div>
      <div class="phase-jump">
        <span class="pill warm">Sponsor playback</span>
      </div>
    </section>
    <section class="decision-executive-shell" data-decision-scenario>
      <div class="decision-main-stack">
        ${renderDecisionCgiRecommendationPanel(models, scenario)}
        ${renderDecisionExecutiveSummary(models, scenario)}
        ${renderDecisionAccountingOverview(models, scenario)}
        ${renderDecisionRiceSequencingPanel(models, scenario)}
        <section class="panel">${renderDecisionSavingsSummaryTable(models, scenario)}</section>
      </div>
      ${renderDecisionScenarioConfigurator(models)}
    </section>
    <section class="panel">${renderDecisionTableSection(models, scenario)}</section>
    ${renderDecisionArtifactHub(models)}
    <section class="panel">${renderSponsorApproval()}</section>
  `;
}
