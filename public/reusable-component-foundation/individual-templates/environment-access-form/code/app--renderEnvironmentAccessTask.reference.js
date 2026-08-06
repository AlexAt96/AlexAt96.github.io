/* Reference extract: renderEnvironmentAccessTask(...) from app/src/app.js:9077-9121. */

function renderEnvironmentAccessTask(phase, item, bu = getSelectedBu()) {
  const rows = getScopeRecordsForBu(bu).filter((row) => row.inScope !== false);
  return `
    ${detailHeader("Databricks and Azure access confirmation", "BU Leads confirm access has been provided to the relevant Databricks environments and Azure workspaces.")}
    ${renderDiscoveryTeamAccessList()}
    <form class="collection-access-form" data-business-unit-id="${escapeHtml(bu.id)}" data-section-key="${escapeHtml(item.key)}">
      <div class="setup-bu-table-wrap form-wide">
        <table class="data-table setup-bu-table access-confirmation-table">
          <thead><tr><th>Environment</th><th>Workspace</th><th>Databricks access</th><th>Azure access</th><th>Access test</th></tr></thead>
          <tbody>
            ${rows.map((row) => {
              const access = getEnvironmentAccessConfirmationForRow(bu.id, row);
              const accessTest = getEnvironmentAccessTestSummary(access);
              return `
              <tr data-environment-id="${escapeHtml(row.environmentId || "")}" data-workspace-id="${escapeHtml(row.workspaceId || "")}">
                <td><strong>${escapeHtml(row.environmentName || row.environmentType || "Environment")}</strong><small>${escapeHtml(row.environmentType || "")}</small></td>
                <td>${escapeHtml(row.workspaceName || row.workspaceId || "")}</td>
                <td><label class="checkbox-field compact"><input type="checkbox" name="databricksAccess"${access.databricks_access_confirmed ? " checked" : ""} /> <span>Provided</span></label></td>
                <td><label class="checkbox-field compact"><input type="checkbox" name="azureAccess"${access.azure_access_confirmed ? " checked" : ""} /> <span>Provided</span></label></td>
                <td>
                  <span class="access-confirmation-test-cell">
                    ${renderStatusPill(accessTest.label, accessTest.scheme)}
                    ${accessTest.meta ? `<small>${escapeHtml(accessTest.meta)}</small>` : ""}
                  </span>
                </td>
              </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div class="access-confirmation-note form-wide">
        <label class="checkbox-field">
          <input name="teamAccessConfirmed" type="checkbox" />
          <span>I confirm the relevant team members have been granted access to the selected Databricks and Azure environments.</span>
        </label>
      </div>
      <p class="small-note form-wide" id="environmentAccessSaveStatus" aria-live="polite"></p>
      <div class="button-row form-wide">
        <button class="icon-button ghost collection-task-status-action" type="button" data-status="In progress"><svg><use href="#icon-save"></use></svg><span>Save progress</span></button>
        <button class="icon-button primary collection-task-status-action" type="button" data-status="Completed"><svg><use href="#icon-check"></use></svg><span>Confirm complete</span></button>
      </div>
    </form>
  `;
}
