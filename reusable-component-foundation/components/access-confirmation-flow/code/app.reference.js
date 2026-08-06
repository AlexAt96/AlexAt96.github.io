/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

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

function renderKnowledgeAccessTask(phase, item, bu = getSelectedBu()) {
  const access = getKnowledgeRepoAccessForBu(bu.id);
  return `
    ${detailHeader("Knowledge base and repo access", "BU Leads provide links or supporting documents for their knowledge base and source repositories.")}
    ${renderDiscoveryTeamAccessList()}
    <form class="collection-access-form" data-business-unit-id="${escapeHtml(bu.id)}" data-section-key="${escapeHtml(item.key)}">
      <label class="form-wide">
        <span>Knowledge base or repository link</span>
        <input name="knowledgeLink" type="url" placeholder="https://..." value="${escapeHtml(access.knowledge_link || access.repository_link || "")}" />
      </label>
      <label class="form-wide">
        <span>Additional repository link</span>
        <input name="repositoryLink" type="url" placeholder="https://..." value="${escapeHtml(access.repository_link && access.repository_link !== access.knowledge_link ? access.repository_link : "")}" />
      </label>
      <label class="form-wide">
        <span>Supporting document</span>
        <input name="knowledgeDocument" type="file" accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json,.png,.jpg,.jpeg" />
      </label>
      <label class="form-wide">
        <span>Notes</span>
        <textarea name="notes" rows="4" placeholder="Any context, access caveats, or folder/repo instructions.">${escapeHtml(access.notes || "")}</textarea>
      </label>
      <label class="checkbox-field form-wide">
        <input name="shareConfirmed" type="checkbox"${access.share_confirmed ? " checked" : ""} />
        <span>I confirm this knowledge base/repository information can be shared with the discovery team.</span>
      </label>
      <label class="checkbox-field form-wide">
        <input name="currentConfirmed" type="checkbox"${access.current_confirmed ? " checked" : ""} />
        <span>I confirm this information is up to date.</span>
      </label>
      <label class="checkbox-field form-wide">
        <input name="teamAccessConfirmed" type="checkbox"${access.team_access_confirmed ? " checked" : ""} />
        <span>I confirm relevant team members have been given access.</span>
      </label>
      <div class="button-row form-wide">
        <button class="icon-button ghost collection-task-status-action" type="button" data-status="In progress"><svg><use href="#icon-save"></use></svg><span>Save progress</span></button>
        <button class="icon-button primary collection-task-status-action" type="button" data-status="Completed"><svg><use href="#icon-check"></use></svg><span>Confirm complete</span></button>
      </div>
    </form>
  `;
}

function renderAnalysisAccessAndReferenceLinks(bu) {
  const accessProducts = getCollectionMatrixProducts(bu);
  const links = getKnowledgeRepositoryLinksForBu(bu);
  return `
    <div class="analysis-support-grid">
      <section class="analysis-support-panel" id="access-coverage">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">Access coverage</p>
            <h4>Environments available to the discovery team</h4>
          </div>
          <span class="status-pill ${statusClass(getBuScreenStatus(bu.id, "environment-access-confirmation"))}">${formatStatus(getBuScreenStatus(bu.id, "environment-access-confirmation"))}</span>
        </div>
        <div class="analysis-access-stack">
          ${accessProducts.map((product) => renderAnalysisAccessProduct(product, bu)).join("")}
        </div>
      </section>
      <section class="analysis-support-panel" id="reference-links">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">BU provided links</p>
            <h4>Knowledge bases and repositories</h4>
          </div>
          <span class="status-pill ${statusClass(getBuScreenStatus(bu.id, "knowledge-base-repo-access"))}">${formatStatus(getBuScreenStatus(bu.id, "knowledge-base-repo-access"))}</span>
        </div>
        ${links.length ? `
          <div class="analysis-link-list">
            ${links.map((link) => `
              <a class="analysis-link-item" href="${escapeHtml(link.url)}" target="_blank" rel="noopener">
                <span>
                  <strong>${escapeHtml(link.label)}</strong>
                  <small>${escapeHtml(link.source)}</small>
                </span>
                <svg><use href="#icon-arrow"></use></svg>
              </a>
            `).join("")}
          </div>
        ` : `<p class="small-note">No repository or knowledge-base links have been captured for this BU yet.</p>`}
      </section>
    </div>
  `;
}

function renderAnalysisAccessProduct(product, bu) {
  return `
    <details class="analysis-access-product" data-page-state-key="analysis-access:${escapeHtml(bu.id)}:${escapeHtml(product.productId || product.productName)}">
      <summary>
        <span class="disclosure-icon contributor-disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
        <span><strong>${escapeHtml(product.productName)}</strong><small>${product.environments.length} environment${product.environments.length === 1 ? "" : "s"}</small></span>
      </summary>
      <div class="analysis-access-table-wrap">
        <table class="data-table analysis-access-table">
          <thead><tr><th>Environment</th><th>Workspace</th><th>Databricks</th><th>Azure</th><th>Team members</th><th>Access test</th></tr></thead>
          <tbody>
            ${product.environments.map((env) => {
              const access = getEnvironmentAccessSummary(bu, env);
              return `
                <tr>
                  <td><strong>${escapeHtml(env.environmentName || env.environmentType || "Environment")}</strong><small>${escapeHtml(env.environmentType || "")}</small></td>
                  <td>${escapeHtml(env.workspaceName || env.workspaceId || "")}</td>
                  <td>${renderStatusPill(access.databricksLabel, access.databricksScheme)}</td>
                  <td>${renderStatusPill(access.azureLabel, access.azureScheme)}</td>
                  <td>${escapeHtml(access.teamMembers)}</td>
                  <td>${renderEnvironmentAccessTestControls(bu, env, access)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </details>
  `;
}

function getEnvironmentAccessSummary(bu, env) {
  const access = getEnvironmentAccessConfirmationForRow(bu.id, env);
  const databricksConfirmed = access.databricks_access_confirmed === true;
  const azureConfirmed = access.azure_access_confirmed === true;
  const accessTest = getEnvironmentAccessTestSummary(access);
  const teamMembers = getDiscoveryTeamMembers().map((member) => member.name).join(", ") || "Discovery team";
  return {
    databricksLabel: databricksConfirmed ? "Access confirmed" : "Not confirmed",
    databricksScheme: databricksConfirmed ? "success" : "neutral",
    azureLabel: azureConfirmed ? "Access confirmed" : "Not confirmed",
    azureScheme: azureConfirmed ? "success" : "neutral",
    testLabel: accessTest.label,
    testScheme: accessTest.scheme,
    testedMeta: accessTest.meta,
    teamMembers,
  };
}

function getEnvironmentAccessTestSummary(access = {}) {
  const status = String(access.access_test_status || "").trim();
  return {
    label: status || "Not tested",
    scheme: status === "Working" ? "success" : status === "Issue" ? "danger" : "neutral",
    meta: access.access_tested_at ? `${normaliseDateInputValue(access.access_tested_at)}${access.access_tested_by ? ` / ${access.access_tested_by}` : ""}` : "",
  };
}

function renderEnvironmentAccessTestControls(bu, env, access) {
  return `
    <div class="analysis-access-test-cell">
      ${renderStatusPill(access.testLabel, access.testScheme)}
      ${access.testedMeta ? `<small>${escapeHtml(access.testedMeta)}</small>` : ""}
      <span class="analysis-access-test-actions">
        <button class="icon-button ghost compact analysis-access-test-action" type="button" data-business-unit-id="${escapeHtml(bu.id)}" data-environment-id="${escapeHtml(env.environmentId || "")}" data-workspace-id="${escapeHtml(env.workspaceId || "")}" data-status="Working" title="Confirm access works">
          <svg><use href="#icon-check"></use></svg>
          <span>Works</span>
        </button>
        <button class="icon-button ghost compact analysis-access-test-action" type="button" data-business-unit-id="${escapeHtml(bu.id)}" data-environment-id="${escapeHtml(env.environmentId || "")}" data-workspace-id="${escapeHtml(env.workspaceId || "")}" data-status="Issue" title="Mark access issue">
          <svg><use href="#icon-x"></use></svg>
          <span>Issue</span>
        </button>
      </span>
    </div>
  `;
}

async function saveCollectionAccessForm(form, status, button) {
  if (!form) return;
  if (!SERVER_MODE) {
    showAppAlert("Run the local server to save collection access details, then open http://127.0.0.1:4317/.");
    return;
  }
  const businessUnitId = form.dataset.businessUnitId || "";
  const sectionKey = form.dataset.sectionKey || "";
  const saveStatus = form.querySelector("#environmentAccessSaveStatus");
  if (button) button.disabled = true;
  try {
    if (sectionKey === "knowledge-base-repo-access") {
      await apiRequest(`/api/business-units/${encodeURIComponent(businessUnitId)}/knowledge-access`, {
        method: "PUT",
        body: JSON.stringify(await getKnowledgeAccessPayload(form, status)),
      });
    } else if (sectionKey === "environment-access-confirmation") {
      const result = await apiRequest(`/api/business-units/${encodeURIComponent(businessUnitId)}/environment-access`, {
        method: "PUT",
        body: JSON.stringify(getEnvironmentAccessPayload(form, status)),
      });
      applyEnvironmentAccessSaveResult(businessUnitId, result);
      if (saveStatus) {
        const savedAt = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        saveStatus.textContent = `${formatStatus(status)} saved at ${savedAt}.`;
      }
      return;
    } else {
      await apiRequest(`/api/business-units/${encodeURIComponent(businessUnitId)}/screens/${encodeURIComponent(sectionKey)}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    }
    reloadAppAfterStatusUpdate(status, button, { skipCompletionEffect: sectionKey === "environment-access-confirmation" });
  } catch (error) {
    showAppAlert(`The collection access details could not be saved: ${error.message || error}`);
  } finally {
    if (button) button.disabled = false;
  }
}

function applyEnvironmentAccessSaveResult(businessUnitId, result = {}) {
  if (!serverWorkspace) return;
  if (Array.isArray(result.records)) {
    serverWorkspace.environment_access_confirmations = [
      ...(serverWorkspace.environment_access_confirmations || []).filter((row) => row.business_unit_id !== businessUnitId),
      ...result.records,
    ];
  }
  applyScreenStatusSaveResult(result);
}
