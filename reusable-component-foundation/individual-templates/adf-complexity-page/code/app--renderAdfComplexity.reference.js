/* Reference extract: renderAdfComplexity(...) from app/src/app.js:11396-11496. */

function renderAdfComplexity(phase, item, bu = getSelectedBu()) {
  if (!bu) return renderCrossBuAdfLandscape();
  const model = getAdfComplexityModel(bu);
  return `
    ${detailHeader("ADF complexity analysis", "Activity count times complexity factor creates activity complexity. Environment total is the sum across all activity types.")}
    <section class="panel adf-complexity-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Production summary</p>
          <h3>${escapeHtml(bu.name)} ADF complexity calculation</h3>
        </div>
        <div class="adf-summary-total">
          <span class="status-pill ${statusClassNameForAdfBand(model.totalBand)}">${escapeHtml(model.totalBand)}</span>
          <strong>${formatNumber(model.totalComplexity)}</strong>
          <small>Total complexity</small>
        </div>
      </div>
      <div class="adf-summary-cards">
        <div><span>Selected environments</span><strong>${model.selectedRows.length}</strong></div>
        <div><span>Pipelines</span><strong>${formatNumber(model.totalPipelines)}</strong></div>
        <div><span>Activities</span><strong>${formatNumber(model.totalActivities)}</strong></div>
      </div>
      ${renderBuAdfComplexityCharts(bu, model)}
      ${renderAdfLineageExplorer(bu, model.lineage)}
      <div class="data-table-wrap">
        <table class="data-table adf-summary-table">
          <thead><tr><th>Environment</th><th>Workspace</th><th>Pipelines</th><th>Activities</th><th>Total complexity</th><th>Band</th></tr></thead>
          <tbody>
            ${model.selectedRows.length ? model.selectedRows.map((row) => `
              <tr>
                <td><strong>${escapeHtml(row.environmentName || "Environment")}</strong><small>${escapeHtml(row.environmentType || "")}</small></td>
                <td>${escapeHtml(row.workspaceName || row.workspaceId || "")}</td>
                <td>${formatNumber(row.summary.pipelineCount)}</td>
                <td>${formatNumber(row.summary.activityCount)}</td>
                <td>${calcText(formatNumber(row.summary.complexityScore), "Environment total = sum of activity count x activity complexity factor from the parsed ADF profiler output.", documentUrl("bu-data-collection", "adf-profile-output", bu.id))}</td>
                <td><span class="status-pill ${statusClassNameForAdfBand(row.summary.band)}">${escapeHtml(row.summary.band)}</span></td>
              </tr>
            `).join("") : `
              <tr><td colspan="6">No environments selected for the production summary yet.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel adf-complexity-panel">
      <form id="adfComplexityScopeForm" data-business-unit-id="${escapeHtml(bu.id)}">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Production scope</p>
            <h3>Select environments included in the summary</h3>
          </div>
          <button class="icon-button primary" type="submit">
            <svg><use href="#icon-save"></use></svg>
            <span>Save selection</span>
          </button>
        </div>
        <p class="small-note" id="adfComplexityScopeStatus">Select the ADF environments the team member wants counted as production summary evidence.</p>
        <div class="adf-environment-selection-grid">
          ${model.scopeRows.map((row) => `
            <label class="adf-environment-select-card">
              <input class="adf-environment-scope-row" type="checkbox" data-environment-id="${escapeHtml(row.environmentId)}" data-workspace-id="${escapeHtml(row.workspaceId)}"${row.selected ? " checked" : ""}>
              <span>
                <strong>${escapeHtml(row.environmentName || "Environment")}</strong>
                <small>${escapeHtml([row.environmentType, row.workspaceName || row.workspaceId].filter(Boolean).join(" / "))}</small>
              </span>
              <b>${row.productionLike ? "Production candidate" : "Optional"}</b>
            </label>
          `).join("")}
        </div>
      </form>
    </section>
    <section class="panel adf-complexity-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">ADF profiler extraction</p>
          <h3>Activity types by environment</h3>
        </div>
        <span class="status-pill ${model.activityRows.length ? "completed" : "not-started"}">${model.activityRows.length} activity rows</span>
      </div>
      <div class="data-table-wrap">
        <table class="data-table adf-activity-table">
          <thead><tr><th>Environment</th><th>Activity type</th><th>Activity count</th><th>Complexity factor</th><th>Complexity</th><th>Source file</th></tr></thead>
          <tbody>
            ${model.activityRows.length ? model.activityRows.map((row) => `
              <tr>
                <td><strong>${escapeHtml(row.environmentName)}</strong><small>${escapeHtml(row.workspaceName || "")}</small></td>
                <td>${escapeHtml(row.activityType)}</td>
                <td>${formatNumber(row.activityCount)}</td>
                <td>${formatNumber(row.complexityFactor)}</td>
                <td>${formatNumber(row.complexityScore)}</td>
                <td>${escapeHtml(row.sourceFileName || "ADF profiler output")}</td>
              </tr>
            `).join("") : `
              <tr><td colspan="6">No parsed ADF profiler activity rows yet. Upload an ADF profiler CSV, JSON, or text output from the Collection phase.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
