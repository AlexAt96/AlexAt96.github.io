/* Reference extract: renderAdfPipelineTouchpointSvg(...) from app/src/app.js:12624-12688. */

function renderAdfPipelineTouchpointSvg(graph) {
  const width = 1500;
  const height = 820;
  const cx = 750;
  const cy = 405;
  const environmentNodes = [...graph.nodes.values()].filter((node) => node.kind === "environment").sort((a, b) => a.label.localeCompare(b.label));
  const pipelineNodes = [...graph.nodes.values()].filter((node) => node.kind === "pipeline").sort((a, b) => a.label.localeCompare(b.label));
  const touchpointNodes = [...graph.nodes.values()].filter((node) => !["hub", "environment", "pipeline"].includes(node.kind)).sort((a, b) => b.pipelines.size - a.pipelines.size || a.label.localeCompare(b.label));
  const points = new Map([["hub:adf", { x: cx, y: cy }]]);
  environmentNodes.forEach((node, index) => {
    const angle = (-90 + (360 / Math.max(1, environmentNodes.length)) * index) * Math.PI / 180;
    points.set(node.key, { x: cx + Math.cos(angle) * 150, y: cy + Math.sin(angle) * 150, angle });
  });
  pipelineNodes.forEach((node, index) => {
    const incomingEnvironmentEdge = graph.edges.find((edge) => edge.to === node.key && edge.type === "pipeline" && graph.nodes.get(edge.from)?.kind === "environment");
    const environmentPoint = incomingEnvironmentEdge ? points.get(incomingEnvironmentEdge.from) : null;
    const baseAngle = environmentPoint?.angle ?? (-90 + (360 / Math.max(1, pipelineNodes.length)) * index) * Math.PI / 180;
    const siblingCount = pipelineNodes.filter((pipelineNode) => graph.edges.some((edge) => edge.from === incomingEnvironmentEdge?.from && edge.to === pipelineNode.key)).length || pipelineNodes.length;
    const siblingIndex = pipelineNodes.slice(0, index).filter((pipelineNode) => graph.edges.some((edge) => edge.from === incomingEnvironmentEdge?.from && edge.to === pipelineNode.key)).length;
    const spread = siblingCount > 1 ? (siblingIndex - ((siblingCount - 1) / 2)) * 0.18 : 0;
    const angle = baseAngle + spread;
    points.set(node.key, { x: cx + Math.cos(angle) * 250, y: cy + Math.sin(angle) * 250, angle });
  });
  touchpointNodes.forEach((node, index) => {
    const pipelineKey = adfLineageKey("pipeline", [...node.pipelines][0] || node.label);
    const base = points.get(pipelineKey) || { angle: (-90 + index * 18) * Math.PI / 180 };
    const ring = node.pipelines.size > 1 ? 345 : 330 + ((index % 3) * 58);
    const offset = ((index % 5) - 2) * 0.08;
    const angle = (base.angle ?? 0) + offset;
    points.set(node.key, { x: cx + Math.cos(angle) * ring, y: cy + Math.sin(angle) * ring });
  });
  const defs = graph.groups.map((group) => `
    <marker id="adfTouchpointArrow-${escapeHtml(slugifyDiagramId(group.type))}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${escapeHtml(group.color)}"></path>
    </marker>
  `).join("");
  const edges = graph.edges.map((edge) => {
    const from = points.get(edge.from);
    const to = points.get(edge.to);
    if (!from || !to) return "";
    const path = `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - 18}, ${to.x} ${to.y}`;
    return `<path class="source-consumer-template-edge adf-touchpoint-template-edge ${edge.type === "pipeline" ? "return" : ""}" data-connection-type="${escapeHtml(edge.type)}" data-node-a="${escapeHtml(edge.from)}" data-node-b="${escapeHtml(edge.to)}" data-edge-label="${escapeHtml(edge.label)}" d="${path}" style="--connection-color:${escapeHtml(edge.color)}" marker-end="url(#adfTouchpointArrow-${escapeHtml(slugifyDiagramId(edge.type))})"></path>`;
  }).join("");
  const nodes = [...graph.nodes.values()].map((node) => {
    const point = points.get(node.key);
    if (!point) return "";
    const radius = node.kind === "hub" ? 76 : node.kind === "environment" ? 54 : node.kind === "pipeline" ? 58 : node.pipelines.size > 1 ? 54 : 46;
    return `
      <g class="source-consumer-template-node adf-touchpoint-template-node ${["environment", "pipeline"].includes(node.kind) ? "environment-node" : "system-node"} lane-${escapeHtml(node.kind)}" data-node-key="${escapeHtml(node.key)}" data-node-label="${escapeHtml(node.label)}" data-node-sublabel="${escapeHtml(node.sublabel || "")}" data-node-kind="${escapeHtml(node.kind)}" transform="translate(${point.x} ${point.y})" tabindex="0" role="button" aria-label="${escapeHtml(node.label)}">
        <circle class="node-halo" r="${radius + 10}"></circle>
        <circle class="node-core" r="${radius}"></circle>
        <text class="node-label" y="-4">${escapeHtml(truncateDiagramLabel(node.label, node.kind === "hub" ? 18 : 20))}</text>
        <text class="node-count" y="17">${escapeHtml(node.kind === "hub" ? "start" : node.pipelines?.size > 1 ? `${node.pipelines.size} pipelines` : truncateDiagramLabel(node.sublabel || node.kind, 22))}</text>
      </g>
    `;
  }).join("");
  return `
    <svg class="source-consumer-template-map adf-touchpoint-template-map" viewBox="0 0 ${width} ${height}" role="img" aria-label="ADF pipeline touchpoint explorer">
      <defs>${defs}</defs>
      <rect class="zone-fill" x="40" y="40" width="${width - 80}" height="${height - 80}" rx="28"></rect>
      ${edges}
      ${nodes}
    </svg>
  `;
}
