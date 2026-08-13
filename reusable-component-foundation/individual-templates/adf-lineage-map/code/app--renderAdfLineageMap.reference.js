/* Reference extract: renderAdfLineageMap(...) from app/src/app.js:12690-12737. */

function renderAdfLineageMap(lineage = {}) {
  if (!lineage.nodes?.length) {
    return `<div class="empty-state compact"><strong>No ADF lineage nodes yet.</strong><span>Upload detailed ADF profiler outputs to populate triggers, pipelines, activities, datasets, linked services, databases, and tables.</span></div>`;
  }
  const layout = getAdfLineageLayout(lineage.nodes);
  const width = 1120;
  const height = Math.max(330, layout.height);
  const edges = (lineage.edges || []).map((edge) => {
    const from = layout.points.get(edge.from);
    const to = layout.points.get(edge.to);
    if (!from || !to) return "";
    const mid = Math.max(16, Math.abs(to.x - from.x) * 0.45);
    const path = `M ${from.x + 74} ${from.y} C ${from.x + mid} ${from.y}, ${to.x - mid} ${to.y}, ${to.x - 74} ${to.y}`;
    return `
      <path class="adf-lineage-edge is-${escapeHtml(edge.kind || "observed")}" d="${path}" marker-end="url(#adfLineageArrow)"></path>
      ${edge.label ? `<text class="adf-lineage-edge-label" x="${(from.x + to.x) / 2}" y="${((from.y + to.y) / 2) - 7}">${escapeHtml(truncateDiagramLabel(edge.label, 20))}</text>` : ""}
    `;
  }).join("");
  const nodes = lineage.nodes.map((node) => {
    const point = layout.points.get(node.key);
    if (!point) return "";
    return `
      <g class="adf-lineage-node is-${escapeHtml(node.kind)}" transform="translate(${point.x} ${point.y})" tabindex="0" role="button" aria-label="${escapeHtml(`${node.label} ${node.sublabel || ""}`)}">
        <rect x="-74" y="-28" width="148" height="56" rx="8"></rect>
        <text class="adf-lineage-node-label" y="-5">${escapeHtml(truncateDiagramLabel(node.label, 24))}</text>
        <text class="adf-lineage-node-sublabel" y="15">${escapeHtml(truncateDiagramLabel(node.sublabel || humaniseAdfLineageKind(node.kind), 25))}</text>
      </g>
    `;
  }).join("");
  const lanes = ADF_LINEAGE_LANES.map((lane) => `
    <text class="adf-lineage-lane-label" x="${lane.x}" y="32">${escapeHtml(lane.label)}</text>
    <line class="adf-lineage-lane-line" x1="${lane.x}" y1="54" x2="${lane.x}" y2="${height - 28}"></line>
  `).join("");
  return `
    <div class="adf-lineage-map-wrap">
      <svg class="adf-lineage-map" viewBox="0 0 ${width} ${height}" role="img" aria-label="ADF lineage dependency map">
        <defs>
          <marker id="adfLineageArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 10 5 L 0 10 z"></path>
          </marker>
        </defs>
        ${lanes}
        ${edges}
        ${nodes}
      </svg>
    </div>
  `;
}
