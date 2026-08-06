/* Reference extract: renderExternalLocationDiagram(...) from app/src/app.js:14636-14720. */

function renderExternalLocationDiagram(rows = [], bu = getSelectedBu()) {
  const graph = buildExternalLocationGraph(rows);
  if (!graph.edges.length) {
    return `
      <div class="empty-state compact">
        <strong>No external locations found yet.</strong>
        <span>Upload Terraform and Databricks Metadata catalogue exports or data dictionary outputs for BU environments to populate this cross-BU map.</span>
      </div>
    `;
  }
  const map = renderExternalLocationDependencyMap(graph);
  return `
    <div class="external-location-template-shell">
      <div class="external-location-template-topbar">
        <section class="external-location-template-brand" aria-label="External connection visualiser title">
          <div class="external-location-template-brand-mark">EL</div>
          <h4>External Location Link Visualiser</h4>
        </section>
        <section class="external-location-template-toolbar">
          <span>${graph.businessUnits.size} BU${graph.businessUnits.size === 1 ? "" : "s"}</span>
          <span>${graph.environments.size} environment${graph.environments.size === 1 ? "" : "s"}</span>
          <span>${graph.externals.size} external location${graph.externals.size === 1 ? "" : "s"}</span>
          <span>${map.visualEdgeCount} visual links</span>
        </section>
      </div>
      <div class="external-location-template-canvas">
        <div class="diagram-explore-overlay" data-diagram-explore-overlay>
          <button class="icon-button primary external-location-explore" type="button">
            <svg><use href="#icon-arrow"></use></svg>
            <span>Explore</span>
          </button>
        </div>
        <div class="external-location-template-pan-controls" aria-label="Diagram zoom controls">
          <button class="icon-only external-location-zoom-out" type="button" title="Zoom out" aria-label="Zoom out">
            <svg><use href="#icon-minus"></use></svg>
          </button>
          <button class="icon-only external-location-zoom-reset" type="button" title="Reset zoom" aria-label="Reset zoom">
            <svg><use href="#icon-reset"></use></svg>
          </button>
          <button class="icon-only external-location-zoom-in" type="button" title="Zoom in" aria-label="Zoom in">
            <svg><use href="#icon-plus"></use></svg>
          </button>
        </div>
        <div class="external-location-template-pan-viewport" data-pan-x="0" data-pan-y="0" data-scale="1">
          <div class="external-location-template-pan-stage">
            ${map.svg}
          </div>
        </div>
      </div>
      <div class="external-location-template-panels">
        <aside class="external-location-template-glass external-location-template-info">
          <h5>${escapeHtml(bu?.name || "Cross-BU")} external links</h5>
          <p>Inbound, outbound, and two-way external locations are shown together. Select a bubble to see its connected locations, environments, evidence, and validation state.</p>
          <div class="external-location-template-metrics">
            <span>${graph.groups.length} connection types</span>
            <span>${graph.edges.length} records</span>
            <span>${map.visualEdgeCount} plotted links</span>
          </div>
          <div class="diagram-node-detail" data-external-location-detail-panel>
            <strong>Select a bubble</strong>
            <span>Node details and linked records will appear here.</span>
          </div>
        </aside>
        <aside class="external-location-template-glass external-location-template-legend">
          <div class="external-location-template-panel-title">
            <span>Connection types</span>
            <button class="icon-button ghost compact external-location-map-reset" type="button" title="Clear external location filters" aria-label="Clear external location filters">
              <svg><use href="#icon-x"></use></svg>
              <span>Clear</span>
            </button>
          </div>
          <div class="external-location-type-pills" role="list" aria-label="Connection type filters">
            ${graph.groups.map((group) => `
              <button class="external-location-type-pill" type="button" data-connection-type="${escapeHtml(group.type)}" style="--connection-color:${escapeHtml(group.color)}">
                <span class="swatch" aria-hidden="true"></span>
                <span>${escapeHtml(group.type)}</span>
                <b>${group.edges.length}</b>
              </button>
            `).join("")}
          </div>
        </aside>
      </div>
    </div>
  `;
}
