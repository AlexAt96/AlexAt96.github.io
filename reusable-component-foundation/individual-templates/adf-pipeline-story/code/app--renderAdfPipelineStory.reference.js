/* Reference extract: renderAdfPipelineStory(...) from app/src/app.js:12103-12169. */

function renderAdfPipelineStory(pipeline, flows = []) {
  if (!pipeline) return "";
  const stepGroups = getAdfPipelineStepLevelGroups(pipeline.steps);
  const maxParallel = Math.max(1, ...stepGroups.map((steps) => steps.length));
  const triggerLabel = pipeline.triggers.length ? pipeline.triggers.map((trigger) => trigger.trigger_name).join(", ") : "Manual or upstream start";
  const triggerDetail = pipeline.triggers.length ? pipeline.triggers.map((trigger) => trigger.trigger_type || trigger.runtime_state).filter(Boolean).join(" / ") : "No trigger row exported for this pipeline.";
  let stepCounter = 0;
  const callCount = pipeline.steps.filter((step) => step.targetPipeline).length;
  return `
    <article class="adf-pipeline-story is-primary">
      <header>
        <div>
          <p class="eyebrow">Pipeline branch graph</p>
          <h4>${escapeHtml(pipeline.pipelineName)}</h4>
        </div>
        <span class="chip">${formatNumber(pipeline.steps.length)} step${pipeline.steps.length === 1 ? "" : "s"}${callCount ? ` / ${formatNumber(callCount)} ADF call${callCount === 1 ? "" : "s"}` : ""}</span>
      </header>
      <div class="adf-pipeline-graph-shell">
        <section class="adf-pipeline-graph-main">
          <div class="adf-pipeline-graph-head">
            <span>Graph</span>
            <span>Activity</span>
            <span>Action</span>
            <span>I/O</span>
            <span>Depends</span>
            <span>Runtime</span>
          </div>
          <div class="adf-pipeline-start" style="--max-parallel:${maxParallel};">
            <span class="adf-git-lane adf-git-lane-start" aria-hidden="true">
              ${renderAdfPipelineLaneSvg(0, { parallelCount: 1, nextParallelCount: stepGroups[0]?.length || 1 })}
              <b>Start</b>
            </span>
            <span class="adf-row-message">
              <strong>${escapeHtml(triggerLabel)}</strong>
              <small>${escapeHtml(triggerDetail)}</small>
            </span>
            <span class="adf-row-chip">Trigger</span>
            <span class="adf-row-io"><b>${formatNumber(pipeline.steps.length)} ${pipeline.steps.length === 1 ? "activity" : "activities"}</b></span>
            <span class="adf-row-deps">Entry point</span>
            <span class="adf-row-runtime">${escapeHtml(pipeline.triggers.length ? "ADF trigger export" : "Not exported")}</span>
          </div>
          <ol class="adf-pipeline-step-list" style="--max-parallel:${maxParallel};">
            ${stepGroups.map((steps, levelIndex) => `
              <li class="adf-pipeline-level ${steps.length > 1 ? "is-parallel-level" : "is-linear-level"}" data-level="${levelIndex}" data-parallel-count="${steps.length}" style="--parallel-count:${steps.length}; --parallel-width:${Math.min(56, Math.max(20, (steps.length - 1) * 18 + 20))}px;">
                <div class="adf-pipeline-level-label">
                  <span>${levelIndex + 1}</span>
                  <strong>${steps.length > 1 ? "Parallel" : "Step"}</strong>
                </div>
                <div class="adf-pipeline-level-steps">
                  ${steps.map((step) => {
                    const rowIndex = stepCounter++;
                    return renderAdfPipelineStep(step, rowIndex, {
                      isLast: rowIndex === pipeline.steps.length - 1,
                      parallelCount: steps.length,
                      previousParallelCount: stepGroups[levelIndex - 1]?.length || 1,
                      nextParallelCount: stepGroups[levelIndex + 1]?.length || 1,
                    });
                  }).join("")}
                </div>
              </li>
            `).join("")}
          </ol>
        </section>
      </div>
    </article>
  `;
}
