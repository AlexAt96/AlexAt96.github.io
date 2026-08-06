/* Reference extract: renderEnvironmentAccessTestControls(...) from app/src/app.js:8379-8396. */

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
