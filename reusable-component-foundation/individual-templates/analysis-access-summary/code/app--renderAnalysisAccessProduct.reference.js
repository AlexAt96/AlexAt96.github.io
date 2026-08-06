/* Reference extract: renderAnalysisAccessProduct(...) from app/src/app.js:8321-8350. */

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
