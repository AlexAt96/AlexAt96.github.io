/* Reference extract: renderAdfStepDetailBranchMap(...) from app/src/app.js:12365-12384. */

function renderAdfStepDetailBranchMap(step) {
  const nodes = [
    renderAdfStepDetailNode("Reads from", step.sources?.length ? step.sources.map((endpoint) => [endpoint.name, endpoint.detail]) : [["No exported source", "No source dataset was exported for this activity."]], "read"),
    renderAdfStepDetailNode("Writes to", step.sinks?.length ? step.sinks.map((endpoint) => [endpoint.name, endpoint.detail]) : [["No exported sink", "No sink dataset was exported for this activity."]], "write"),
    step.targetPipeline ? renderAdfStepDetailNode("ADF pipeline call", [[step.targetPipeline, "Called from this activity"]], "call") : "",
    renderAdfStepDetailNode("Databricks / compute", step.databricks ? [
      [step.databricks.target, step.databricks.compute || "Compute not captured"],
      [step.databricks.cluster || "Cluster detail not captured", "Databricks target"],
    ] : [["No Databricks hint", "No Databricks activity hint exported for this step."]], "compute"),
    renderAdfStepDetailNode("Activity detail", [
      [step.linkedService || "No linked service captured", step.irType || "IR not captured"],
      [step.sourceFile || "ADF profiler output", "Profiler evidence"],
    ], "meta"),
  ].filter(Boolean);
  return `
    <div class="adf-step-detail-branch-map" aria-label="${escapeHtml(step.activityName)} expanded lineage nodes">
      ${nodes.join("")}
    </div>
  `;
}
