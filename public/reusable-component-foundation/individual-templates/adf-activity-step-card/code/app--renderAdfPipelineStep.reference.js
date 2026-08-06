/* Reference extract: renderAdfPipelineStep(...) from app/src/app.js:12183-12227. */

function renderAdfPipelineStep(step, index, options = {}) {
  const readCount = step.sources?.length || 0;
  const writeCount = (step.sinks?.length || 0) + (step.targetPipeline ? 1 : 0);
  const branchLane = Math.max(0, Number(step.branchLane || 0));
  const parallelCount = Math.max(1, Number(options.parallelCount || 1));
  const laneOffset = branchLane * 18;
  const touchpointKey = getAdfPipelineActivityNodeKey(step);
  const rowClasses = [
    "adf-pipeline-step",
    `is-${step.kind}`,
    parallelCount > 1 ? "is-parallel-row" : "",
    branchLane > 0 ? "is-branch-lane" : "is-main-lane",
    options.isLast ? "is-final-step" : "",
  ].filter(Boolean).join(" ");
  return `
    <details class="${escapeHtml(rowClasses)}" data-page-state-disabled="true" data-level="${Number(step.level || 0)}" data-branch-lane="${branchLane}" data-parallel-count="${parallelCount}" style="--branch-lane:${branchLane}; --branch-offset:${laneOffset}px; --parallel-count:${parallelCount}; --dependency-level:${Number(step.level || 0)};">
      <summary class="adf-pipeline-row-summary">
        <span class="adf-git-lane" aria-hidden="true">
          ${renderAdfPipelineLaneSvg(branchLane, { ...options, parallelCount })}
          <b>${index + 1}</b>
        </span>
        <span class="adf-row-message">
          <strong>${escapeHtml(step.activityName)}</strong>
          <small>${escapeHtml(step.activityType)}${step.targetPipeline ? ` / calls ${escapeHtml(step.targetPipeline)}` : ""}</small>
        </span>
        <span class="adf-row-action-cell">
          <span class="adf-row-chip">${escapeHtml(step.actionLabel)}</span>
          <button class="icon-only ghost compact adf-open-touchpoint-node" type="button" data-open-adf-lineage-explorer="true" data-adf-focus-key="${escapeHtml(touchpointKey)}" title="Open this activity in ADF Touchpoint Explorer" aria-label="Open ${escapeHtml(step.activityName)} in ADF Touchpoint Explorer">
            <svg><use href="#icon-arrow"></use></svg>
          </button>
        </span>
        <span class="adf-row-io">
          <b>${formatNumber(readCount)} read${readCount === 1 ? "" : "s"}</b>
          <b>${formatNumber(writeCount)} write${writeCount === 1 ? "" : "s"}</b>
        </span>
        <span class="adf-row-deps">${escapeHtml(step.dependsOn.length ? step.dependsOn.join(", ") : "Start / previous level")}</span>
        <span class="adf-row-runtime">${escapeHtml([step.linkedService, step.irType].filter(Boolean).join(" / ") || "Not exported")}</span>
      </summary>
      <div class="adf-pipeline-row-detail">
        ${renderAdfPipelineDetailLaneSvg(branchLane, { ...options, parallelCount })}
        ${renderAdfStepDetailBranchMap(step)}
      </div>
    </details>
  `;
}
