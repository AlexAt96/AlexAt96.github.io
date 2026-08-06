/* Reference extract: renderExternalLocationDependencyMap(...) from app/src/app.js:14789-14872. */

function renderExternalLocationDependencyMap(graph) {
  const visualEdges = graph.edges.flatMap((edge, index) => {
    const directions = edge.direction === "both" ? ["inbound", "outbound"] : [edge.direction];
    return directions.map((direction) => ({
      ...edge,
      visualId: `${edge.id}-${direction}-${index}`,
      visualDirection: direction,
    }));
  });
  const inboundExternalKeys = new Set(visualEdges.filter((edge) => edge.visualDirection === "inbound").map((edge) => edge.externalKey));
  const outboundExternalKeys = new Set(visualEdges.filter((edge) => edge.visualDirection === "outbound").map((edge) => edge.externalKey));
  const inboundExternals = Array.from(graph.externals.values()).filter((node) => inboundExternalKeys.has(node.key));
  const outboundExternals = Array.from(graph.externals.values()).filter((node) => outboundExternalKeys.has(node.key));
  const environments = Array.from(graph.environments.values());
  const width = 1500;
  const laneLeft = 250;
  const laneMiddle = 750;
  const laneRight = 1250;
  const height = Math.max(740, 280 + Math.max(inboundExternals.length, environments.length, outboundExternals.length) * 96);
  const positions = new Map();
  const placeColumn = (items, x, top, bottom) => {
    const available = Math.max(1, bottom - top);
    const gap = available / (items.length + 1);
    items.forEach((node, index) => {
      const point = { x, y: Math.round(top + gap * (index + 1)) };
      positions.set(`${node.key}:${x}`, point);
      if (x === 660) positions.set(node.key, point);
    });
  };
  placeColumn(inboundExternals, laneLeft, 150, height - 190);
  placeColumn(environments, laneMiddle, 145, height - 150);
  placeColumn(outboundExternals, laneRight, 150, height - 190);
  const groupByType = new Map(graph.groups.map((group) => [group.type, group]));
  const markerMarkup = graph.groups.map((group) => `
    <marker id="externalArrow-${escapeHtml(slugifyDiagramId(group.type))}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${escapeHtml(group.color)}"></path>
    </marker>
  `).join("");
  const edgeMarkup = visualEdges.map((edge, index) => {
    const group = groupByType.get(edge.type) || { color: "#94a3b8" };
    const envPoint = positions.get(edge.environmentKey) || { x: laneMiddle, y: 180 + index * 56 };
    const externalX = edge.visualDirection === "outbound" ? laneRight : laneLeft;
    const externalPoint = positions.get(`${edge.externalKey}:${externalX}`) || { x: externalX, y: envPoint.y };
    const from = edge.visualDirection === "outbound" ? envPoint : externalPoint;
    const to = edge.visualDirection === "outbound" ? externalPoint : envPoint;
    const curve = Math.max(90, Math.abs(to.x - from.x) * 0.38);
    const path = `M ${from.x} ${from.y} C ${from.x + (from.x < to.x ? curve : -curve)} ${from.y}, ${to.x + (from.x < to.x ? -curve : curve)} ${to.y}, ${to.x} ${to.y}`;
    const labelX = Math.round((from.x + to.x) / 2);
    const labelY = Math.round((from.y + to.y) / 2) - 12 - (index % 3) * 12;
    return `
      <path class="external-location-edge ${edge.direction === "both" ? "is-two-way" : ""}" data-connection-type="${escapeHtml(edge.type)}" data-node-a="${escapeHtml(edge.externalKey)}" data-node-b="${escapeHtml(edge.environmentKey)}" data-edge-label="${escapeHtml(edge.rawDirection || edge.sourceDocumentType || edge.type)}" data-source-document="${escapeHtml(edge.sourceDocumentType || "")}" data-validation-status="${escapeHtml(edge.validationStatus || "")}" d="${path}" style="--connection-color:${escapeHtml(group.color)}" marker-end="url(#externalArrow-${escapeHtml(slugifyDiagramId(edge.type))})"></path>
      <text class="external-location-edge-label" data-connection-type="${escapeHtml(edge.type)}" data-node-a="${escapeHtml(edge.externalKey)}" data-node-b="${escapeHtml(edge.environmentKey)}" data-edge-label="${escapeHtml(edge.rawDirection || edge.sourceDocumentType || edge.type)}" data-source-document="${escapeHtml(edge.sourceDocumentType || "")}" data-validation-status="${escapeHtml(edge.validationStatus || "")}" x="${labelX}" y="${labelY}">${escapeHtml(truncateDiagramLabel(edge.rawDirection || edge.sourceDocumentType, 34))}</text>
    `;
  }).join("");
  const renderNode = (node, lane, x) => {
    const point = positions.get(x === 660 ? node.key : `${node.key}:${x}`);
    if (!point) return "";
    return `
      <g class="external-location-node is-${escapeHtml(lane)}" data-node-key="${escapeHtml(node.key)}" data-node-label="${escapeHtml(node.label)}" data-node-sublabel="${escapeHtml(node.sublabel)}" data-node-kind="${escapeHtml(lane)}" transform="translate(${point.x} ${point.y})" tabindex="0" role="button" aria-label="${escapeHtml(node.label)}">
        <rect x="-94" y="-31" width="188" height="62" rx="8"></rect>
        <text class="external-location-node-label" y="-5">${escapeHtml(truncateDiagramLabel(node.label, 29))}</text>
        <text class="external-location-node-sublabel" y="16">${escapeHtml(truncateDiagramLabel(node.sublabel, 30))}</text>
      </g>
    `;
  };
  return {
    visualEdgeCount: visualEdges.length,
    svg: `
      <svg class="external-location-map" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Cross-BU external location map">
        <defs>${markerMarkup}</defs>
        <rect class="external-location-zone-fill" x="46" y="100" width="${width - 92}" height="${height - 170}" rx="18"></rect>
        <line class="external-location-zone-divider" x1="500" y1="125" x2="500" y2="${height - 95}"></line>
        <line class="external-location-zone-divider" x1="1000" y1="125" x2="1000" y2="${height - 95}"></line>
        <text class="external-location-column-label" x="${laneLeft}" y="124">Inbound external locations</text>
        <text class="external-location-column-label" x="${laneMiddle}" y="124">BU environments</text>
        <text class="external-location-column-label" x="${laneRight}" y="124">Outbound external locations</text>
        ${edgeMarkup}
        ${inboundExternals.map((node) => renderNode(node, "source", laneLeft)).join("")}
        ${environments.map((node) => renderNode(node, "environment", laneMiddle)).join("")}
        ${outboundExternals.map((node) => renderNode(node, "target", laneRight)).join("")}
      </svg>
    `,
  };
}
