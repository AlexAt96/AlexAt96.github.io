/* Reference extract: renderAdfPipelineSelector(...) from app/src/app.js:12086-12101. */

function renderAdfPipelineSelector(flows = [], selectedPipeline = flows[0]) {
  return `
    <div class="adf-pipeline-selector-row">
      <label>
        <span>Pipeline</span>
        <select class="adf-pipeline-selector" aria-label="Select ADF pipeline">
          ${flows.map((flow) => `<option value="${escapeHtml(flow.pipelineName)}"${flow === selectedPipeline ? " selected" : ""}>${escapeHtml(flow.pipelineName)}</option>`).join("")}
        </select>
      </label>
      <div class="adf-pipeline-selector-metrics">
        <span>${formatNumber(flows.length)} pipeline${flows.length === 1 ? "" : "s"}</span>
        <span>${formatNumber(selectedPipeline?.steps?.length || 0)} visible step${selectedPipeline?.steps?.length === 1 ? "" : "s"}</span>
      </div>
    </div>
  `;
}
