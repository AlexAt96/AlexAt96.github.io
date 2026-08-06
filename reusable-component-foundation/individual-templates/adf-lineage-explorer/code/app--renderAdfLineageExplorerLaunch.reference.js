/* Reference extract: renderAdfLineageExplorerLaunch(...) from app/src/app.js:12016-12031. */

function renderAdfLineageExplorerLaunch(lineage = {}) {
  const graph = buildAdfPipelineTouchpointGraph(lineage);
  return `
    <div class="adf-lineage-explorer-launch">
      <div>
        <p class="eyebrow">Full-screen explorer</p>
        <h4>Open the expandable ADF spoke explorer</h4>
        <span>${formatNumber(graph.pipelineCount)} pipelines / ${formatNumber(graph.touchpointCount)} touchpoints / ${formatNumber(graph.sharedCount)} shared nodes</span>
      </div>
      <button class="icon-button primary adf-open-lineage-explorer" type="button" data-open-adf-lineage-explorer="true">
        <svg><use href="#icon-arrow"></use></svg>
        <span>Open explorer</span>
      </button>
    </div>
  `;
}
