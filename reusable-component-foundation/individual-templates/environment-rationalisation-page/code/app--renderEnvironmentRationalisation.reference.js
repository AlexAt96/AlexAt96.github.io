/* Reference extract: renderEnvironmentRationalisation(...) from app/src/app.js:20781-20869. */

function renderEnvironmentRationalisation(phase, item, bu = getSelectedBu()) {
  const model = getEnvironmentRationalisationModel(bu);
  return `
    ${detailHeader("Environment rationalisation approach", `Team working input for ${bu.name} environment migration action and target environment decisions.`)}
    <form id="environmentRationalisationForm" class="environment-rationalisation-form" data-business-unit-id="${escapeHtml(bu.id)}">
      <section class="panel environment-rationalisation-intro">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Analysis task</p>
            <h3>${escapeHtml(bu.name)} environment rationalisation approach</h3>
          </div>
          <button class="icon-button primary" type="submit">
            <svg><use href="#icon-save"></use></svg>
            <span>Save rationalisation</span>
          </button>
        </div>
        <p class="small-note" id="environmentRationalisationStatus">Saving updates Section 11 of the BU tech report.</p>
      </section>
      <section class="panel environment-rationalisation-copy">
        <label>
          <span class="field-label">Editable report text</span>
          <textarea name="reportText" rows="8">${escapeHtml(model.reportText)}</textarea>
        </label>
        <label>
          <span class="field-label">Team notes</span>
          <textarea name="teamNotes" rows="4" placeholder="Optional working notes, caveats, or actions for this section.">${escapeHtml(model.teamNotes)}</textarea>
        </label>
      </section>
      ${renderProposedTopologySection(model)}
      <section class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Working table</p>
            <h3>Scope record rationalisation inputs</h3>
          </div>
          <span class="pill">${model.rows.length} environment${model.rows.length === 1 ? "" : "s"}</span>
        </div>
        ${renderExcelImportExportComponent({
          componentId: "environmentRationalisationExcel",
          title: "Rationalisation table Excel workflow",
          description: "Download the current rationalisation rows, update migration action and target environment in Excel, then upload to stage the table before saving.",
          columns: ENVIRONMENT_RATIONALISATION_TEMPLATE_COLUMNS,
        })}
        <div class="data-table-wrap">
          <table class="data-table environment-rationalisation-table">
            <caption>${model.rows.length ? "Populate migration action and target environment for each scoped environment." : "No in-scope environments are available for rationalisation yet."}</caption>
            <thead>
              <tr>
                <th>Subscription name</th>
                <th>Resource name</th>
                <th>Discovery environment</th>
                <th>Migration action</th>
                <th>Target environment</th>
              </tr>
            </thead>
            <tbody>
              ${model.rows.length ? model.rows.map((row) => `
                <tr data-rationalisation-row-key="${escapeHtml(row.rowKey)}" data-subscription-name="${escapeHtml(row.subscriptionName)}" data-resource-name="${escapeHtml(row.resourceName)}" data-discovery-environment="${escapeHtml(row.discoveryEnvironment)}">
                  <td>${escapeHtml(renderScopeSourceValue(row.subscriptionName))}</td>
                  <td>${escapeHtml(row.resourceName)}</td>
                  <td>${escapeHtml(row.discoveryEnvironment)}</td>
                  <td>
                    <select name="migrationAction:${escapeHtml(row.rowKey)}" aria-label="Migration action for ${escapeHtml(row.resourceName)}">
                      ${renderSelectOptions(ENVIRONMENT_RATIONALISATION_ACTIONS, normaliseEnvironmentRationalisationAction(row.migrationAction))}
                    </select>
                  </td>
                  <td>
                    <select name="targetEnvironment:${escapeHtml(row.rowKey)}" data-rationalisation-target-environment aria-label="Target environment for ${escapeHtml(row.resourceName)}">
                      ${renderTargetEnvironmentOptions(model.proposedEnvironmentOptions, row.targetEnvironment)}
                    </select>
                  </td>
                </tr>
              `).join("") : `<tr><td colspan="5">No in-scope environments are available for rationalisation yet.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="form-actions">
          <p class="small-note">This table feeds the Proposed Environment Rationalisation Approach section in the BU tech report.</p>
          <button class="icon-button primary" type="submit">
            <svg><use href="#icon-save"></use></svg>
            <span>Save rationalisation</span>
          </button>
        </div>
      </section>
      ${renderEnvironmentMigrationFlowSection(model)}
      ${renderProposedTopologyGuidanceSection()}
    </form>
  `;
}
