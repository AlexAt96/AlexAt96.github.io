/* Reference extract: renderAdfLineageExplorer(...) from app/src/app.js:11983-12014. */

function renderAdfLineageExplorer(bu, lineage = getAdfLineageModel(bu)) {
  const caveatText = lineage.caveats.join(" ");
  const activeView = queryParam("lineageView") === "map" ? "map" : "steps";
  const mapLinkClass = `adf-open-lineage-explorer ${activeView === "map" ? "active" : ""}`;
  return `
    <section class="adf-lineage-panel" aria-label="ADF lineage explorer">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Lineage MVP</p>
          <h3>${escapeHtml(bu?.name || "Cross-BU")} ADF pipeline lineage</h3>
        </div>
        <span class="status-pill ${lineage.hasDetailedLineage ? "in-progress" : "not-started"}">${lineage.hasDetailedLineage ? "Profiler detail" : "Activity fallback"}</span>
      </div>
      <nav class="adf-lineage-view-toggle" aria-label="ADF lineage view">
        <a class="${activeView === "steps" ? "active" : ""}" href="${escapeHtml(getAdfLineageViewHref("steps"))}">Pipeline steps</a>
        <a class="${mapLinkClass}" href="${escapeHtml(getAdfLineageViewHref("map"))}" data-open-adf-lineage-explorer="true">Touchpoint explorer</a>
      </nav>
      <div class="adf-lineage-summary">
        <div><span>Pipelines</span><strong>${formatNumber(lineage.pipelineCount)}</strong></div>
        <div><span>Activities</span><strong>${formatNumber(lineage.activityCount)}</strong></div>
        <div><span>Copy flows</span><strong>${formatNumber(lineage.copyFlows.length)}</strong></div>
        <div><span>Tables</span><strong>${formatNumber(lineage.tableReferenceCount)}</strong></div>
        <div><span>Databases</span><strong>${formatNumber(lineage.databaseCount)}</strong></div>
      </div>
      ${activeView === "map" ? renderAdfLineageExplorerLaunch(lineage) : renderAdfPipelineStepExplorer(lineage)}
      <div class="adf-lineage-notes">
        <span>${escapeHtml(caveatText)}</span>
        ${lineage.hiddenNodeCount ? `<span>${formatNumber(lineage.hiddenNodeCount)} lower-weight nodes are hidden in this MVP view.</span>` : ""}
      </div>
    </section>
  `;
}
