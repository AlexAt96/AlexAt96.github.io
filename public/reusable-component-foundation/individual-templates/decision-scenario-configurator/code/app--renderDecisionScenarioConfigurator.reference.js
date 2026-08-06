/* Reference extract: renderDecisionScenarioConfigurator(...) from app/src/app.js:27663-27678. */

function renderDecisionScenarioConfigurator(models) {
  return `
    <details class="panel decision-config-panel" id="decision-scenario-config" open data-page-state-disabled="true">
      <summary class="decision-config-summary">
        <div>
          <p class="eyebrow">Scenario configurator</p>
          <h3>Migration scenario</h3>
        </div>
        <svg><use href="#icon-arrow"></use></svg>
      </summary>
      <div class="decision-config-list">
        ${models.map(renderDecisionScenarioBu).join("")}
      </div>
    </details>
  `;
}
