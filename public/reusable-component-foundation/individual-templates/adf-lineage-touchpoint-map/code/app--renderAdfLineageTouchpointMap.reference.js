/* Reference extract: renderAdfLineageTouchpointMap(...) from app/src/app.js:12419-12496. */

function renderAdfLineageTouchpointMap(lineage = {}) {
  const graph = buildAdfPipelineTouchpointGraph(lineage);
  if (!graph.edges.length) return renderAdfLineageMap(lineage);
  return `
    <div class="source-consumer-diagram adf-lineage-template-shell" id="adfLineageTouchpointDiagram">
      <div class="source-consumer-template-topbar">
        <section class="source-consumer-template-brand" aria-label="ADF lineage visualiser title">
          <div class="source-consumer-template-brand-mark">ADF</div>
          <h4>ADF Pipeline Touchpoint Explorer</h4>
        </section>
        <section class="source-consumer-template-toolbar">
          <span>${graph.pipelineCount} pipeline${graph.pipelineCount === 1 ? "" : "s"}</span>
          <span>${graph.touchpointCount} touchpoint${graph.touchpointCount === 1 ? "" : "s"}</span>
          <span>${graph.sharedCount} shared</span>
          <button class="icon-button primary adf-open-lineage-explorer" type="button">
            <svg><use href="#icon-arrow"></use></svg>
            <span>Open full-screen explorer</span>
          </button>
        </section>
      </div>
      <div class="source-consumer-template-canvas adf-lineage-template-canvas">
        <div class="diagram-explore-overlay" data-diagram-explore-overlay>
          <button class="icon-button primary source-consumer-explore" type="button">
            <svg><use href="#icon-arrow"></use></svg>
            <span>Explore</span>
          </button>
        </div>
        <div class="source-consumer-template-pan-controls" aria-label="Diagram zoom controls">
          <button class="icon-only source-consumer-zoom-out" type="button" title="Zoom out" aria-label="Zoom out"><svg><use href="#icon-minus"></use></svg></button>
          <button class="icon-only source-consumer-zoom-reset" type="button" title="Reset zoom" aria-label="Reset zoom"><svg><use href="#icon-reset"></use></svg></button>
          <button class="icon-only source-consumer-zoom-in" type="button" title="Zoom in" aria-label="Zoom in"><svg><use href="#icon-plus"></use></svg></button>
        </div>
        <div class="source-consumer-template-pan-viewport" data-pan-x="0" data-pan-y="0" data-scale="1">
          <div class="source-consumer-template-pan-stage">
            ${renderAdfPipelineTouchpointSvg(graph)}
          </div>
        </div>
      </div>
      <div class="source-consumer-template-panels">
        <aside class="source-consumer-template-glass source-consumer-template-info">
          <h5>Pipeline spokes</h5>
          <p>Each spoke starts at the ADF estate hub, moves to a pipeline, then out to the datasets, tables, services, notebooks, and databases that pipeline touches.</p>
          <div class="source-consumer-template-metrics">
            <span>${graph.groups.length} touchpoint types</span>
            <span>${graph.edges.length} links</span>
            <span>${graph.sharedCount} shared nodes</span>
          </div>
          <div class="diagram-node-detail" data-source-consumer-detail-panel>
            <strong>Select a bubble</strong>
            <span>Connected pipelines and touchpoints will appear here.</span>
          </div>
        </aside>
        <aside class="source-consumer-template-glass source-consumer-template-legend">
          <div class="source-consumer-template-panel-title">
            <span>Touchpoint types</span>
            <button class="icon-button ghost compact source-consumer-diagram-reset" type="button" title="Clear touchpoint filters" aria-label="Clear touchpoint filters">
              <svg><use href="#icon-x"></use></svg>
              <span>Clear</span>
            </button>
          </div>
          <div class="source-consumer-type-pills" role="list" aria-label="ADF touchpoint type filters">
            ${graph.groups.map((group) => `
              <button class="source-consumer-type-pill" type="button" data-connection-type="${escapeHtml(group.type)}" style="--connection-color:${escapeHtml(group.color)}">
                <span class="swatch" aria-hidden="true"></span>
                <span>${escapeHtml(group.type)}</span>
                <b>${group.edges.length}</b>
              </button>
            `).join("")}
          </div>
        </aside>
      </div>
      <details class="adf-lineage-technical-map" data-page-state-disabled="true">
        <summary>Show technical lane map</summary>
        ${renderAdfLineageMap(lineage)}
      </details>
    </div>
  `;
}
