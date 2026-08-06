/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

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

function renderSourceConsumerDependencyDiagram(rows = [], bu = getSelectedBu()) {
  return `
    <section class="source-consumer-diagram-panel" aria-label="Interactive source and consumer dependency diagram">
      <div class="source-consumer-diagram-heading">
        <div>
          <p class="eyebrow">Interactive diagram</p>
          <h4>Environment dependencies</h4>
        </div>
        <div class="source-consumer-diagram-actions">
          <button class="icon-button ghost source-consumer-diagram-reset" type="button">
            <svg><use href="#icon-x"></use></svg>
            <span>Clear focus</span>
          </button>
        </div>
      </div>
      <div class="source-consumer-diagram" id="sourceConsumerDiagram" data-business-unit-id="${escapeHtml(bu?.id || "")}">
        ${renderSourceConsumerDependencyDiagramContent(rows, bu)}
      </div>
    </section>
  `;
}

function renderSourceConsumerDependencyDiagramContent(rows = [], bu = getSelectedBu()) {
  const graph = buildSourceConsumerDependencyGraph(rows, bu);
  if (!graph.edges.length) {
    return `
      <div class="empty-state compact">
        <strong>No dependencies to draw yet.</strong>
        <span>Add source or consumer rows in the tracker table to populate the diagram.</span>
      </div>
    `;
  }
  return renderSourceConsumerDependencyVisualiser(graph, bu);
}

function renderProgramTopologyDiagram(model, activeTab) {
  const diagram = activeTab === "environment-consolidation"
    ? `<div class="environment-migration-flow-diagram program-topology-diagram">${renderEnvironmentMigrationFlowDiagram(model.rationalisationRows, model.topology.environments)}</div>`
    : activeTab === "cicd-pipeline-topology"
      ? `<div class="proposed-topology-flow-diagram program-topology-diagram">${renderProposedTopologyFlowDiagram(model.topology.environments)}</div>`
      : `<div class="proposed-topology-structure-diagram program-topology-diagram">${renderProposedTopologyStructureDiagram(model.topology)}</div>`;
  return `
    <section class="panel program-topology-diagram-panel">
      <div class="program-topology-chart-context">
        ${renderProgramTopologyKey(activeTab)}
      </div>
      ${diagram}
    </section>
  `;
}

function renderProposedTopologyFlowDiagram(environments = []) {
  const rows = environments
    .map((row) => ({
      environmentName: String(row.environmentName || row.environment_name || "").trim(),
      workspaceCount: row.workspaceCount ?? row.workspace_count ?? "",
      nextPromotionEnvironments: normaliseEnvironmentList(row.nextPromotionEnvironments || row.next_promotion_environments || row.nextPromotionEnvironment || row.next_promotion_environment || []),
      codeBackfillEnvironments: normaliseEnvironmentList(row.codeBackfillEnvironments || row.code_backfill_environments || []),
    }))
    .filter((row) => row.environmentName);
  if (!rows.length) {
    return `<div class="empty-state compact"><strong>No proposed environments yet.</strong><span>Add target environments above to render the promotion and backfill flow.</span></div>`;
  }

  const names = new Set();
  rows.forEach((row) => {
    names.add(row.environmentName);
    row.nextPromotionEnvironments.forEach((name) => names.add(name));
    row.codeBackfillEnvironments.forEach((name) => names.add(name));
  });
  const rowByName = new Map(rows.map((row) => [row.environmentName, row]));
  const promotionEdges = rows.flatMap((row) =>
    row.nextPromotionEnvironments
      .filter((target) => target && target !== row.environmentName)
      .map((target) => ({ from: row.environmentName, to: target })),
  );
  const backfillEdges = rows.flatMap((row) =>
    row.codeBackfillEnvironments
      .filter((target) => target && target !== row.environmentName)
      .map((target) => ({ from: row.environmentName, to: target })),
  );
  const allEdges = [
    ...promotionEdges.map((edge) => ({ ...edge, mode: "promotion", label: "promote" })),
    ...backfillEdges.map((edge) => ({ ...edge, mode: "backfill", label: "backfill" })),
  ];
  const nodeStats = [...names].reduce((stats, name) => {
    stats[name] = { in: 0, out: 0, connected: new Set() };
    return stats;
  }, {});
  allEdges.forEach((edge) => {
    nodeStats[edge.from] ||= { in: 0, out: 0, connected: new Set() };
    nodeStats[edge.to] ||= { in: 0, out: 0, connected: new Set() };
    nodeStats[edge.from].out += 1;
    nodeStats[edge.to].in += 1;
    nodeStats[edge.from].connected.add(edge.to);
    nodeStats[edge.to].connected.add(edge.from);
  });

  const priority = (name) => {
    const key = String(name || "").toLowerCase();
    if (key.includes("dev")) return 1;
    if (key.includes("test") || key.includes("tst")) return 2;
    if (key.includes("disc") || key.includes("sandbox")) return 3;
    if (key.includes("prod")) return 4;
    return 5;
  };
  const depths = Object.fromEntries([...names].map((name) => [name, 0]));
  for (let pass = 0; pass < names.size; pass += 1) {
    promotionEdges.forEach((edge) => {
      depths[edge.to] = Math.max(depths[edge.to] || 0, Math.min((depths[edge.from] || 0) + 1, names.size - 1));
    });
  }
  const promotionLinked = new Set(promotionEdges.flatMap((edge) => [edge.from, edge.to]));
  [...names].forEach((name) => {
    if (promotionLinked.has(name)) return;
    const neighbourDepths = allEdges
      .filter((edge) => edge.from === name || edge.to === name)
      .map((edge) => depths[edge.from === name ? edge.to : edge.from] || 0);
    if (neighbourDepths.length) {
      depths[name] = Math.round(neighbourDepths.reduce((sum, depth) => sum + depth, 0) / neighbourDepths.length);
    }
  });
  const sortedNames = [...names].sort((a, b) =>
    (depths[a] - depths[b]) ||
    getTopologyBusinessUnitLabel(a).localeCompare(getTopologyBusinessUnitLabel(b)) ||
    (priority(a) - priority(b)) ||
    ((nodeStats[b]?.connected.size || 0) - (nodeStats[a]?.connected.size || 0)) ||
    a.localeCompare(b),
  );
  const paletteByName = new Map(sortedNames.map((name, index) => [name, getTopologyEnvironmentPalette(name, index)]));
  const promotionColor = "var(--topology-promotion)";
  const backfillColor = "var(--topology-backfill)";
  const baseNodeWidth = 188;
  const baseNodeHeight = 88;
  const nodeSlotWidth = baseNodeWidth + 20;
  const siblingGap = 22;
  const columnPaddingX = 30;
  const columnGap = 76;
  const rowGap = 148;
  const startX = 100;
  const startY = 178;
  const columnTopPadding = 58;
  const columnBottomPadding = 46;
  const stageOrder = (name) => {
    const key = getTopologyItemDisplayName(name).toLowerCase();
    if (key.includes("disc") || key.includes("sandbox") || key.includes("non-production") || key.includes("non production")) return 0;
    if (key.includes("dev")) return 1;
    if (key.includes("test") || key.includes("tst") || key.includes("integration")) return 2;
    if (key.includes("pre-prod") || key.includes("pre production") || key.includes("preproduction")) return 3;
    if (key.includes("prod") || key.includes("reporting") || key.includes("bi")) return 4;
    return 5;
  };
  const businessUnitNames = [...new Set(sortedNames.map((name) => getTopologyBusinessUnitLabel(name)))];
  const namesByBusinessUnit = sortedNames.reduce((groups, name) => {
    const label = getTopologyBusinessUnitLabel(name);
    groups[label] ||= [];
    groups[label].push(name);
    return groups;
  }, {});
  const nodes = {};
  const businessUnitColumns = [];
  const stageGroupsByBusinessUnit = new Map(businessUnitNames.map((label) => {
    const groups = (namesByBusinessUnit[label] || []).reduce((stageGroups, name) => {
      const stage = stageOrder(name);
      stageGroups[stage] ||= [];
      stageGroups[stage].push(name);
      return stageGroups;
    }, {});
    Object.values(groups).forEach((group) => group.sort((a, b) => (depths[a] - depths[b]) || (priority(a) - priority(b)) || a.localeCompare(b)));
    return [label, groups];
  }));
  const maxStage = Math.max(...businessUnitNames.flatMap((label) => Object.keys(stageGroupsByBusinessUnit.get(label) || {}).map(Number)), 0);
  const columnWidthsByBusinessUnit = new Map(businessUnitNames.map((label) => {
    const maxSiblingCount = Math.max(...Object.values(stageGroupsByBusinessUnit.get(label) || {}).map((group) => group.length), 1);
    return [label, maxSiblingCount * nodeSlotWidth + Math.max(0, maxSiblingCount - 1) * siblingGap];
  }));
  const totalColumnWidth = businessUnitNames.reduce((sum, label, index) => sum + columnWidthsByBusinessUnit.get(label) + columnPaddingX * 2 + (index > 0 ? columnGap : 0), 0);
  const width = Math.max(980, startX + totalColumnWidth + 70);
  const height = Math.max(560, startY + maxStage * rowGap + baseNodeHeight + 136);
  let columnCursorX = startX;
  businessUnitNames.forEach((label, bandIndex) => {
    const stageGroups = stageGroupsByBusinessUnit.get(label) || {};
    const contentWidth = columnWidthsByBusinessUnit.get(label) || baseNodeWidth;
    const columnX = columnCursorX + columnPaddingX;
    const columnHeight = columnTopPadding + maxStage * rowGap + baseNodeHeight + columnBottomPadding;
    const column = {
      label,
      id: topologyNodeDomId("flow-bu", label),
      x: Math.max(0, columnCursorX),
      y: startY - columnTopPadding,
      width: contentWidth + columnPaddingX * 2,
      height: columnHeight,
      color: getTopologyDynamicPalette(bandIndex + 2).accent,
      backfillX: columnCursorX + contentWidth + columnPaddingX + 26,
    };
    businessUnitColumns.push(column);
    Object.entries(stageGroups).forEach(([stageKey, group]) => {
      const groupWidth = group.length * nodeSlotWidth + Math.max(0, group.length - 1) * siblingGap;
      const groupStartX = columnX + (contentWidth - groupWidth) / 2;
      group.forEach((name, index) => {
        const degree = nodeStats[name]?.connected.size || 0;
        const nodeWidth = baseNodeWidth + Math.min(20, degree * 4);
        const nodeHeight = baseNodeHeight + Math.min(10, degree * 2);
        nodes[name] = {
          name,
          id: topologyNodeDomId("flow", name),
          x: groupStartX + index * (nodeSlotWidth + siblingGap),
          y: startY + Number(stageKey) * rowGap,
          width: nodeWidth,
          height: nodeHeight,
          groupLabel: label,
        };
      });
    });
    columnCursorX += column.width + columnGap;
  });
  const businessUnitColumnByLabel = new Map(businessUnitColumns.map((column) => [column.label, column]));
  const businessUnitContainers = businessUnitColumns;
  const reciprocalKeys = new Set(allEdges.map((edge) => `${edge.from}->${edge.to}`));
  const edgePath = (edge, index) => {
    const source = nodes[edge.from];
    const target = nodes[edge.to];
    if (!source || !target) return "";
    const sameBusinessUnit = getTopologyBusinessUnitLabel(edge.from) === getTopologyBusinessUnitLabel(edge.to);
    const sourceX = sameBusinessUnit ? source.x + source.width / 2 : source.x + source.width;
    const targetX = sameBusinessUnit ? target.x + target.width / 2 : target.x;
    const sourceY = edge.mode === "promotion" && sameBusinessUnit ? source.y + source.height : source.y + source.height / 2;
    const targetY = edge.mode === "promotion" && sameBusinessUnit ? target.y : target.y + target.height / 2;
    const isBidirectional = reciprocalKeys.has(`${edge.to}->${edge.from}`);
    if (edge.mode === "promotion") {
      if (sameBusinessUnit) {
        const midY = (sourceY + targetY) / 2;
        return `M ${sourceX} ${sourceY} V ${midY} H ${targetX} V ${targetY}`;
      }
      const midX = (sourceX + targetX) / 2;
      return `M ${sourceX} ${sourceY} H ${midX} V ${targetY} H ${targetX}`;
    }
    if (sameBusinessUnit) {
      const column = businessUnitColumnByLabel.get(getTopologyBusinessUnitLabel(edge.from));
      const routeX = (column?.backfillX || (source.x + source.width + 36)) + (isBidirectional ? 14 : 0);
      const sourceSideX = source.x + source.width;
      const sourceSideY = source.y + source.height / 2;
      const targetSideX = target.x + target.width;
      const targetSideY = target.y + target.height / 2;
      return `M ${sourceSideX} ${sourceSideY} H ${routeX} V ${targetSideY} H ${targetSideX}`;
    }
    const midX = (sourceX + targetX) / 2;
    return `M ${sourceX} ${sourceY} H ${midX} V ${targetY} H ${targetX}`;
  };
  const edgeLabel = (edge, index) => {
    const source = nodes[edge.from];
    const target = nodes[edge.to];
    if (!source || !target) return null;
    return {
      x: (source.x + source.width / 2 + target.x + target.width / 2) / 2,
      y: (source.y + source.height / 2 + target.y + target.height / 2) / 2 - 8 - (index % 2) * 6,
      width: edge.mode === "promotion" ? 68 : 64,
      text: edge.label,
    };
  };
  const renderEdgeLabel = (label, className) => `
    <g class="topology-flow-edge-label ${className}" transform="translate(${label.x} ${label.y})">
      <rect x="${-label.width / 2}" y="-15" width="${label.width}" height="22" rx="8"></rect>
      <text y="1" text-anchor="middle">${escapeHtml(label.text)}</text>
    </g>
  `;
  const environmentLegend = getTopologyEnvironmentLegendItems(sortedNames);
  const connectionTotal = allEdges.length;
  const connectedEnvironmentCount = sortedNames.filter((name) => (nodeStats[name]?.connected.size || 0) > 0).length;

  return `
    <div class="topology-canvas-summary">
      <strong>${sortedNames.length}</strong><span>environments</span>
      <strong>${connectionTotal}</strong><span>connections</span>
      <strong>${connectedEnvironmentCount}</strong><span>connected</span>
    </div>
    <div class="topology-canvas-legend">
      <div class="legend-group"><b>Lines</b>
        <span><i class="legend-line promotion"></i>Promotion line</span>
        <span><i class="legend-line backfill"></i>Backfill line</span>
      </div>
      <div class="legend-group"><b>Environment colours</b>
        ${environmentLegend.map((item) => `<span><i class="legend-swatch" style="background: ${item.color}"></i>${escapeHtml(item.label)}</span>`).join("")}
      </div>
      <div class="legend-group"><b>State</b>
        <span><i class="legend-swatch focused"></i>Focused item</span>
      </div>
    </div>
    ${renderTopologySelectionPanel()}
    <svg class="topology-flow-svg topology-interactive-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Proposed topology CI/CD promotion and code backfill diagram">
      <defs>
        <marker id="topology-flow-promotion-arrow" markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
          <path d="M0.5,0.5 L4.7,2.5 L0.5,4.5" fill="none" stroke="${promotionColor}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
        </marker>
        <marker id="topology-flow-backfill-arrow" markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
          <path d="M0.5,0.5 L4.7,2.5 L0.5,4.5" fill="none" stroke="${backfillColor}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
        </marker>
      </defs>
      <g class="topology-bu-containers">
        ${renderTopologyBusinessUnitContainers(businessUnitContainers, "flow")}
      </g>
      <g class="topology-flow-edges">
          ${allEdges.map((edge, index) => {
            const linkColor = edge.mode === "promotion" ? promotionColor : backfillColor;
            const markerId = edge.mode === "promotion" ? "topology-flow-promotion-arrow" : "topology-flow-backfill-arrow";
            return `<path d="${edgePath(edge, index)}" class="topology-flow-edge ${edge.mode}" data-topology-link data-source="${escapeHtml(topologyNodeDomId("flow", edge.from))}" data-target="${escapeHtml(topologyNodeDomId("flow", edge.to))}" style="--link-color: ${linkColor}" marker-end="url(#${markerId})"><title>${escapeHtml(edge.from)} ${escapeHtml(edge.label)} ${escapeHtml(edge.to)}</title></path>`;
          }).join("")}
      </g>
      <g class="topology-flow-edge-labels">
          ${allEdges.map((edge, index) => edgeLabel(edge, index)).filter(Boolean).map((label, index) => renderEdgeLabel(label, allEdges[index]?.mode === "promotion" ? "promotion-label" : "backfill-label")).join("")}
      </g>
      <g class="topology-flow-nodes">
          ${Object.values(nodes).map((node) => {
          const row = rowByName.get(node.name) || {};
          const workspaceText = row.workspaceCount !== "" && row.workspaceCount !== undefined ? `${row.workspaceCount} workspace${Number(row.workspaceCount) === 1 ? "" : "s"}` : "";
          const displayName = getTopologyItemDisplayName(node.name);
          const groupLabel = getTopologyBusinessUnitLabel(node.name);
          const titleLines = wrapTopologyLabel(displayName, 23, 2);
          const palette = paletteByName.get(node.name) || getTopologyEnvironmentPalette(node.name);
          const stats = nodeStats[node.name] || { in: 0, out: 0, connected: new Set() };
          const detail = `${groupLabel} - ${workspaceText || "Workspace count not set"} - ${stats.in} inbound / ${stats.out} outbound`;
          return `
            <g class="topology-flow-node" data-topology-node data-node-id="${escapeHtml(node.id)}" data-topology-title="${escapeHtml(displayName)}" data-topology-detail="${escapeHtml(detail)}" transform="translate(${node.x} ${node.y})" style="--node-fill: ${palette.fill}; --node-stroke: ${palette.stroke}; --node-accent: ${palette.accent};">
              <rect width="${node.width}" height="${node.height}" rx="8"></rect>
              <text class="node-title" x="${node.width / 2}" y="${titleLines.length > 1 ? 21 : 27}" text-anchor="middle">
                ${titleLines.map((line, lineIndex) => `<tspan x="${node.width / 2}" dy="${lineIndex === 0 ? 0 : 15}">${escapeHtml(line)}</tspan>`).join("")}
              </text>
              ${workspaceText ? `<text class="node-subtitle" x="${node.width / 2}" y="${titleLines.length > 1 ? 54 : 45}" text-anchor="middle">${escapeHtml(truncateText(workspaceText, 26))}</text>` : ""}
              <text class="node-count" x="${node.width / 2 - 28}" y="${node.height - 16}" text-anchor="middle">IN ${stats.in}</text>
              <text class="node-count" x="${node.width / 2 + 30}" y="${node.height - 16}" text-anchor="middle">OUT ${stats.out}</text>
            </g>
          `;
          }).join("")}
      </g>
    </svg>
  `;
}

function renderEnvironmentMigrationFlowDiagram(rationalisationRows = [], proposedEnvironments = []) {
  const sourceRows = rationalisationRows
    .map((row, index) => {
      const action = normaliseEnvironmentRationalisationAction(row.migrationAction || row.migration_action || "");
      const currentName = String(row.resourceName || row.resource_name || row.discoveryEnvironment || row.discovery_environment || row.rowKey || row.row_key || "").trim();
      const discoveryEnvironment = String(row.discoveryEnvironment || row.discovery_environment || "").trim();
      const targetEnvironment = getEnvironmentMigrationTargetLabel(action, row.targetEnvironment || row.target_environment || "", discoveryEnvironment);
      return {
        index,
        rowKey: row.rowKey || row.row_key || `row-${index + 1}`,
        currentName,
        discoveryEnvironment,
        action,
        targetEnvironment,
      };
    })
    .filter((row) => row.currentName);
  if (!sourceRows.length) {
    return `<div class="empty-state compact"><strong>No rationalisation rows yet.</strong><span>Add in-scope environments and target decisions to render the migration flow.</span></div>`;
  }

  const mappableSourceRows = sourceRows.filter((row) => getEnvironmentMigrationActionClass(row.action) !== "undecided");
  const proposedNames = (proposedEnvironments || [])
    .map((row) => String(row.environmentName || row.environment_name || "").trim())
    .filter(Boolean);
  const targetNames = [...new Set([
    ...mappableSourceRows.map((row) => row.targetEnvironment).filter(Boolean),
    ...proposedNames.filter((name) => mappableSourceRows.some((row) => row.targetEnvironment === name)),
  ])];
  const targetStats = new Map(targetNames.map((name) => [name, { incoming: 0, actions: new Map() }]));
  mappableSourceRows.forEach((row) => {
    const stats = targetStats.get(row.targetEnvironment) || { incoming: 0, actions: new Map() };
    stats.incoming += 1;
    stats.actions.set(row.action, (stats.actions.get(row.action) || 0) + 1);
    targetStats.set(row.targetEnvironment, stats);
  });

  const currentNodeWidth = 286;
  const targetNodeWidth = 236;
  const nodeHeight = 84;
  const yGap = 130;
  const businessUnitGap = 74;
  const startX = 110;
  const targetX = 690;
  const startY = 124;
  const width = 1040;
  const targetPalette = new Map(targetNames.map((name, index) => [name, getTopologyEnvironmentPalette(name, index)]));
  let sourceCursorY = startY;
  let previousSourceBusinessUnit = "";
  const sourceNodes = sourceRows.map((row, index) => {
    const businessUnitLabel = getTopologyBusinessUnitLabel(row.currentName);
    if (index > 0 && businessUnitLabel !== previousSourceBusinessUnit) sourceCursorY += businessUnitGap;
    const node = {
      ...row,
      id: topologyNodeDomId("migration-current", row.rowKey || row.currentName),
      x: startX,
      y: sourceCursorY,
      width: currentNodeWidth,
      height: nodeHeight,
      groupLabel: businessUnitLabel,
    };
    sourceCursorY += yGap;
    previousSourceBusinessUnit = businessUnitLabel;
    return node;
  });
  const targetNodes = targetNames.map((name, index) => {
    const stats = targetStats.get(name) || { incoming: 0, actions: new Map() };
    const incomingSources = sourceNodes.filter((source) => source.targetEnvironment === name);
    const alignedY = incomingSources.length
      ? Math.min(...incomingSources.map((source) => source.y))
      : startY + index * yGap;
    return {
      name,
      id: topologyNodeDomId("migration-target", name),
      x: targetX,
      y: alignedY,
      width: targetNodeWidth,
      height: nodeHeight,
      groupLabel: getTopologyBusinessUnitLabel(name),
      incoming: stats.incoming,
      actions: stats.actions,
    };
  });
  const maxNodeBottom = Math.max(
    ...sourceNodes.map((node) => node.y + node.height),
    ...targetNodes.map((node) => node.y + node.height),
    startY + nodeHeight,
  );
  const height = Math.max(360, maxNodeBottom + 150);
  const sourceContainers = buildTopologyBusinessUnitContainers(sourceNodes, { prefix: "migration-source-bu", paddingX: 18, paddingY: 44 });
  const targetContainers = buildTopologyBusinessUnitContainers(targetNodes, { prefix: "migration-target-bu", paddingX: 18, paddingY: 44 });
  const targetByName = new Map(targetNodes.map((node) => [node.name, node]));
  const edges = sourceNodes.map((source, index) => {
    if (getEnvironmentMigrationActionClass(source.action) === "undecided") return null;
    const target = targetByName.get(source.targetEnvironment);
    const actionClass = getEnvironmentMigrationActionClass(source.action);
    const palette = targetPalette.get(source.targetEnvironment) || getTopologyEnvironmentPalette(source.targetEnvironment, index);
    return { source, target, actionClass, action: source.action, color: getEnvironmentMigrationActionColor(actionClass, palette.accent) };
  }).filter((edge) => edge?.target);
  const edgePath = (edge, index) => {
    const sourceX = edge.source.x + edge.source.width;
    const sourceY = edge.source.y + edge.source.height / 2;
    const targetXPos = edge.target.x;
    const targetY = edge.target.y + edge.target.height / 2;
    const curve = 128 + (index % 3) * 18;
    return `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetXPos - curve} ${targetY}, ${targetXPos} ${targetY}`;
  };
  const markerIds = [...new Set(edges.map((edge) => edge.color))].map((color, index) => ({ color, id: `environment-migration-arrow-${index}` }));
  const markerByColor = new Map(markerIds.map((item) => [item.color, item.id]));
  const actionCounts = sourceRows.reduce((counts, row) => {
    counts[row.action] = (counts[row.action] || 0) + 1;
    return counts;
  }, {});
  const mergeCount = sourceRows.filter((row) => {
    const stats = targetStats.get(row.targetEnvironment);
    return row.action === "Merge" || (stats?.incoming || 0) > 1;
  }).length;
  const environmentLegend = getTopologyEnvironmentLegendItems([
    ...sourceRows.map((row) => row.discoveryEnvironment || row.currentName),
    ...targetNames,
  ]);

  return `
    <div class="topology-canvas-summary">
      <strong>${sourceRows.length}</strong><span>current</span>
      <strong>${targetNames.length}</strong><span>future</span>
      <strong>${mergeCount}</strong><span>merge mapped</span>
    </div>
    <div class="topology-canvas-legend">
      <div class="legend-group"><b>Actions</b>
        <span><i class="legend-line migration-migrate"></i>Migrate</span>
        <span><i class="legend-line migration-merge"></i>Merge</span>
        <span><i class="legend-line migration-decommission"></i>Decommission</span>
        <span><i class="legend-line migration-retain"></i>Retain</span>
        <span><i class="legend-line migration-repoint"></i>Repoint</span>
        <span><i class="legend-line migration-undecided"></i>Decision required</span>
      </div>
      <div class="legend-group"><b>Environment colours</b>
        ${environmentLegend.map((item) => `<span><i class="legend-swatch" style="background: ${item.color}"></i>${escapeHtml(item.label)}</span>`).join("")}
      </div>
      <div class="legend-group"><b>State</b>
        <span><i class="legend-swatch focused"></i>Focused item</span>
      </div>
    </div>
    ${renderTopologySelectionPanel()}
    <svg class="environment-migration-svg topology-interactive-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Current to future environment migration flow diagram">
      <defs>
        ${markerIds.map((marker) => `
          <marker id="${marker.id}" markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
            <path d="M0.5,0.5 L4.7,2.5 L0.5,4.5" fill="none" stroke="${marker.color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
          </marker>
        `).join("")}
      </defs>
      <g class="environment-migration-columns">
        <text x="${startX}" y="74">Current state</text>
        <text x="${targetX}" y="74">Future state</text>
        <line x1="${startX + currentNodeWidth + 72}" y1="88" x2="${startX + currentNodeWidth + 72}" y2="${height - 62}"></line>
      </g>
      <g class="topology-bu-containers environment-migration-source-containers">
        ${renderTopologyBusinessUnitContainers(sourceContainers, "migration-source")}
      </g>
      <g class="topology-bu-containers environment-migration-target-containers">
        ${renderTopologyBusinessUnitContainers(targetContainers, "migration-target")}
      </g>
      <g class="environment-migration-edges">
        ${edges.map((edge, index) => `
          <path d="${edgePath(edge, index)}" class="environment-migration-edge ${edge.actionClass}" data-topology-link data-source="${escapeHtml(edge.source.id)}" data-target="${escapeHtml(edge.target.id)}" style="--link-color: ${edge.color}" marker-end="url(#${markerByColor.get(edge.color)})">
            <title>${escapeHtml(edge.source.currentName)} ${escapeHtml(edge.action)} to ${escapeHtml(edge.target.name)}</title>
          </path>
        `).join("")}
      </g>
      <g class="environment-migration-nodes current">
        ${sourceNodes.map((node, index) => {
          const palette = getTopologyEnvironmentPalette(node.discoveryEnvironment || node.currentName, index);
          const displayName = getTopologyItemDisplayName(node.currentName);
          const detail = `${node.groupLabel || getTopologyBusinessUnitLabel(node.currentName)} - ${node.discoveryEnvironment || "Current environment"} - ${node.action}`;
          return `
            <g class="environment-migration-node current" data-topology-node data-node-id="${escapeHtml(node.id)}" data-topology-title="${escapeHtml(displayName)}" data-topology-detail="${escapeHtml(detail)}" transform="translate(${node.x} ${node.y})" style="--node-fill: ${palette.fill}; --node-stroke: ${palette.stroke}; --node-accent: ${palette.accent};">
              <rect width="${node.width}" height="${node.height}" rx="8"></rect>
              <text class="node-title" x="16" y="27">${escapeHtml(truncateText(displayName, 30))}</text>
              <text class="node-subtitle" x="16" y="49">${escapeHtml(truncateText(node.discoveryEnvironment || "Current environment", 34))}</text>
              <text class="node-count" x="16" y="70">${escapeHtml(truncateText(node.action, 28))}</text>
            </g>
          `;
        }).join("")}
      </g>
      <g class="environment-migration-nodes target">
        ${targetNodes.map((node, index) => {
          const palette = targetPalette.get(node.name) || getTopologyEnvironmentPalette(node.name, index);
          const actionSummary = [...node.actions.entries()].map(([action, count]) => `${count} ${action}`).join(", ");
          const displayName = getTopologyItemDisplayName(node.name);
          const detail = `${node.groupLabel || getTopologyBusinessUnitLabel(node.name)} - ${node.incoming} incoming - ${actionSummary || "No mapped rows"}`;
          return `
            <g class="environment-migration-node target" data-topology-node data-node-id="${escapeHtml(node.id)}" data-topology-title="${escapeHtml(displayName)}" data-topology-detail="${escapeHtml(detail)}" transform="translate(${node.x} ${node.y})" style="--node-fill: ${palette.fill}; --node-stroke: ${palette.stroke}; --node-accent: ${palette.accent};">
              <rect width="${node.width}" height="${node.height}" rx="8"></rect>
              <text class="node-title" x="${node.width / 2}" y="27" text-anchor="middle">${escapeHtml(truncateText(displayName, 24))}</text>
              <text class="node-subtitle" x="${node.width / 2}" y="49" text-anchor="middle">${escapeHtml(node.incoming)} incoming</text>
              <text class="node-count" x="${node.width / 2}" y="70" text-anchor="middle">${escapeHtml(truncateText(actionSummary || "No mapped rows", 26))}</text>
            </g>
          `;
        }).join("")}
      </g>
    </svg>
  `;
}

function renderProposedTopologyStructureDiagram(topology = {}) {
  const environments = (Array.isArray(topology.environments) ? topology.environments : [])
    .map((row) => ({
      environmentName: String(row.environmentName || row.environment_name || "").trim(),
      workspaceCount: row.workspaceCount ?? row.workspace_count ?? "",
      workspacePattern: String(row.workspacePattern || row.workspace_pattern || "").trim(),
    }))
    .filter((row) => row.environmentName);
  const catalogs = (Array.isArray(topology.catalogs) ? topology.catalogs : Array.isArray(topology.catalogues) ? topology.catalogues : [])
    .map((row) => ({
      catalogName: String(row.catalogName || row.catalog_name || row.catalogueName || row.catalogue_name || "").trim(),
      environmentName: String(row.environmentName || row.environment_name || "").trim(),
      ownerGroup: String(row.ownerGroup || row.owner_group || "").trim(),
    }))
    .filter((row) => row.catalogName || row.environmentName || row.ownerGroup);
  const groups = (Array.isArray(topology.groups) ? topology.groups : [])
    .map((row) => ({
      groupName: String(row.groupName || row.group_name || "").trim(),
      environmentNames: normaliseEnvironmentList(row.environmentNames || row.environment_names || row.environmentName || row.environment_name || []),
      entitlementLevel: String(row.entitlementLevel || row.entitlement_level || "").trim(),
    }))
    .filter((row) => row.groupName || row.environmentNames.length || row.entitlementLevel);
  const environmentNames = [...new Set([
    ...environments.map((row) => row.environmentName),
    ...catalogs.map((row) => row.environmentName).filter(Boolean),
    ...groups.flatMap((row) => row.environmentNames),
  ])];
  if (!environmentNames.length) {
    return `<div class="empty-state compact"><strong>No topology rows yet.</strong><span>Add environments, catalogs, and groups to render the account topology.</span></div>`;
  }

  const environmentByName = new Map(environments.map((row) => [row.environmentName, row]));
  const paletteByEnvironment = new Map(environmentNames.map((name, index) => [name, getTopologyEnvironmentPalette(name, index)]));
  const catalogByEnvironment = environmentNames.reduce((map, name) => {
    map[name] = catalogs.filter((row) => row.environmentName === name);
    return map;
  }, {});
  const groupByName = new Map();
  groups.forEach((group) => {
    if (!group.groupName) return;
    const current = groupByName.get(group.groupName) || {
      groupName: group.groupName,
      environmentNames: new Set(),
      entitlementLevel: group.entitlementLevel,
    };
    group.environmentNames.forEach((name) => current.environmentNames.add(name));
    if (!current.entitlementLevel && group.entitlementLevel) current.entitlementLevel = group.entitlementLevel;
    groupByName.set(group.groupName, current);
  });
  const uniqueGroups = [...groupByName.values()].map((group) => ({
    ...group,
    environmentNames: [...group.environmentNames],
  }));

  const x = {
    account: 40,
    metastore: 346,
    lane: 170,
    catalog: 372,
    workspace: 675,
    group: 970,
  };
  const sizes = {
    topNodeWidth: 210,
    topNodeHeight: 34,
    laneWidth: 740,
    catalogNodeWidth: 180,
    catalogNodeHeight: 36,
    workspaceNodeWidth: 180,
    workspaceNodeHeight: 42,
    groupNodeWidth: 210,
    groupNodeHeight: 48,
  };
  const top = 122;
  const gap = 28;
  const businessUnitGap = 58;
  const laneLayouts = [];
  let cursorY = top;
  let previousLaneBusinessUnit = "";
  const workspaceNodes = [];
  environmentNames.forEach((environmentName, environmentIndex) => {
    const laneBusinessUnit = getTopologyBusinessUnitLabel(environmentName);
    if (environmentIndex > 0 && laneBusinessUnit !== previousLaneBusinessUnit) cursorY += businessUnitGap;
    const environment = environmentByName.get(environmentName) || { environmentName, workspaceCount: "", workspacePattern: "" };
    const rawWorkspaceCount = Number.parseInt(environment.workspaceCount, 10);
    const workspaceCount = Math.max(1, Math.min(Number.isFinite(rawWorkspaceCount) && rawWorkspaceCount > 0 ? rawWorkspaceCount : 1, 3));
    const catalogRows = catalogByEnvironment[environmentName] || [];
    const laneItemCount = Math.max(catalogRows.length, workspaceCount, 1);
    const laneHeight = Math.max(112, 54 + laneItemCount * 32);
    const lane = { environmentName, y: cursorY, height: laneHeight, workspaceCount, catalogRows, workspacePattern: environment.workspacePattern, groupLabel: laneBusinessUnit };
    laneLayouts.push(lane);
    for (let index = 0; index < workspaceCount; index += 1) {
      const workspaceY = lane.y + 38 + index * Math.max(36, (lane.height - 70) / Math.max(workspaceCount, 1));
      const workspaceId = topologyNodeDomId("workspace", `${environmentName}-${index + 1}`);
      const environmentDisplayName = getTopologyItemDisplayName(environmentName);
      workspaceNodes.push({
        id: workspaceId,
        environmentName,
        label: workspaceCount === 1 ? `BU_${truncateText(environmentDisplayName, 14)}` : `BU_${truncateText(environmentDisplayName, 11)}_${index + 1}`,
        x: x.workspace,
        y: workspaceY,
        width: sizes.workspaceNodeWidth,
        height: sizes.workspaceNodeHeight,
      });
    }
    cursorY += laneHeight + gap;
    previousLaneBusinessUnit = laneBusinessUnit;
  });
  const envCenterY = new Map(laneLayouts.map((lane) => [lane.environmentName, lane.y + lane.height / 2]));
  const catalogGroups = new Map();
  catalogs.forEach((catalog, index) => {
    const key = catalog.catalogName ? normaliseKey(catalog.catalogName) : `${normaliseKey(catalog.environmentName)}-${index}`;
    const entry = catalogGroups.get(key) || {
      catalogName: catalog.catalogName || "Catalog",
      ownerGroup: catalog.ownerGroup || "",
      environmentNames: new Set(),
      purposes: new Set(),
    };
    if (catalog.environmentName) entry.environmentNames.add(catalog.environmentName);
    if (catalog.ownerGroup && !entry.ownerGroup) entry.ownerGroup = catalog.ownerGroup;
    if (catalog.purpose) entry.purposes.add(catalog.purpose);
    catalogGroups.set(key, entry);
  });
  const catalogNodes = [...catalogGroups.values()]
    .map((catalog, index) => {
      const environmentList = [...catalog.environmentNames];
      const targetYs = environmentList.map((name) => envCenterY.get(name)).filter((value) => Number.isFinite(value));
      const preferredCenterY = targetYs.length
        ? targetYs.reduce((sum, value) => sum + value, 0) / targetYs.length
        : top + 58 + index * (sizes.catalogNodeHeight + 12);
      return {
        ...catalog,
        environmentNames: environmentList,
        shared: environmentList.length > 1,
        id: topologyNodeDomId("catalog", catalog.catalogName || `catalog-${index + 1}`),
        x: x.catalog,
        y: preferredCenterY - sizes.catalogNodeHeight / 2,
        width: sizes.catalogNodeWidth,
        height: sizes.catalogNodeHeight,
      };
    })
    .sort((a, b) => a.y - b.y);
  const catalogSpacing = sizes.catalogNodeHeight + 10;
  catalogNodes.forEach((catalog, index) => {
    const previous = catalogNodes[index - 1];
    const minY = previous ? previous.y + catalogSpacing : top + 24;
    catalog.y = Math.max(catalog.y, minY);
  });
  const minHeight = cursorY + 38;
  const groupSpacing = sizes.groupNodeHeight + 18;
  const height = Math.max(minHeight, top + Math.max(uniqueGroups.length, 1) * groupSpacing + 80);
  const groupNodes = uniqueGroups
    .map((group, index) => {
      const targetYs = group.environmentNames
        .flatMap((name) => workspaceNodes.filter((workspace) => workspace.environmentName === name).map((workspace) => workspace.y + workspace.height / 2))
        .concat(group.environmentNames.map((name) => envCenterY.get(name)).filter((value) => Number.isFinite(value)));
      const preferredCenterY = targetYs.length
        ? targetYs.reduce((sum, value) => sum + value, 0) / targetYs.length
        : top + 40 + index * groupSpacing;
      return {
        ...group,
        id: topologyNodeDomId("group", group.groupName || `group-${index + 1}`),
        x: x.group,
        y: preferredCenterY - sizes.groupNodeHeight / 2,
        width: sizes.groupNodeWidth,
        height: sizes.groupNodeHeight,
      };
    })
    .sort((a, b) => a.y - b.y);
  const groupMinY = top + 18;
  const groupMaxY = height - sizes.groupNodeHeight - 34;
  groupNodes.forEach((group, index) => {
    const previous = groupNodes[index - 1];
    const minY = previous ? previous.y + groupSpacing : groupMinY;
    group.y = Math.max(group.y, minY);
  });
  for (let index = groupNodes.length - 1; index >= 0; index -= 1) {
    const next = groupNodes[index + 1];
    const maxY = next ? next.y - groupSpacing : groupMaxY;
    groupNodes[index].y = Math.min(groupNodes[index].y, maxY);
  }
  groupNodes.forEach((group, index) => {
    const previous = groupNodes[index - 1];
    const minY = previous ? previous.y + groupSpacing : groupMinY;
    group.y = Math.max(Math.min(group.y, groupMaxY), minY);
  });
  const structureContainers = buildTopologyBusinessUnitContainers(laneLayouts.map((lane) => ({
    name: lane.environmentName,
    groupLabel: lane.groupLabel,
    x: x.lane - 24,
    y: lane.y,
    width: x.workspace + sizes.workspaceNodeWidth - x.lane + 52,
    height: lane.height,
  })), { prefix: "structure-bu", paddingX: 8, paddingY: 34 });

  const width = 1220;
  const curvePath = (x1, y1, x2, y2) => {
    const bend = Math.max(42, Math.abs(x2 - x1) / 2);
    return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
  };
  const catalogLinks = catalogNodes.flatMap((catalog) =>
    workspaceNodes
      .filter((workspace) => catalog.environmentNames.includes(workspace.environmentName))
      .map((workspace) => ({
        d: curvePath(catalog.x + catalog.width, catalog.y + catalog.height / 2, workspace.x, workspace.y + workspace.height / 2),
        title: `${catalog.catalogName} connects to ${workspace.label}`,
        source: catalog.id,
        target: workspace.id,
        color: catalog.shared ? "var(--topology-catalog)" : paletteByEnvironment.get(workspace.environmentName)?.accent || "var(--topology-link)",
      })),
  );
  const groupLinks = groupNodes.flatMap((group) =>
    group.environmentNames.flatMap((environmentName) =>
      workspaceNodes
        .filter((workspace) => workspace.environmentName === environmentName)
        .map((workspace) => ({
          d: curvePath(workspace.x + workspace.width, workspace.y + workspace.height / 2, group.x, group.y + group.height / 2),
          title: `${workspace.label} connects to ${group.groupName}`,
          source: workspace.id,
          target: group.id,
          color: paletteByEnvironment.get(workspace.environmentName)?.accent || "var(--topology-link)",
        })),
    ),
  );
  const markers = [...new Set([...catalogLinks, ...groupLinks].map((link) => link.color))].map((color, index) => `
    <marker id="topology-structure-arrow-${index}" markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
      <path d="M0.5,0.5 L4.7,2.5 L0.5,4.5" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
    </marker>
  `).join("");
  const markerByColor = new Map([...new Set([...catalogLinks, ...groupLinks].map((link) => link.color))].map((color, index) => [color, `topology-structure-arrow-${index}`]));
  const connectionCount = catalogLinks.length + groupLinks.length;
  const environmentLegend = getTopologyEnvironmentLegendItems(environmentNames);

  return `
    <div class="topology-canvas-summary">
      <strong>${environmentNames.length}</strong><span>envs</span>
      <strong>${catalogNodes.length}</strong><span>catalogs</span>
      <strong>${workspaceNodes.length}</strong><span>workspaces</span>
      <strong>${groupNodes.length}</strong><span>groups</span>
    </div>
    <div class="topology-canvas-legend">
      <div class="legend-group"><b>Nodes</b>
        <span><i class="legend-swatch catalog"></i>Catalog</span>
        <span><i class="legend-swatch workspace"></i>Workspace</span>
        <span><i class="legend-swatch group"></i>Group</span>
      </div>
      <div class="legend-group"><b>Relationships</b>
        <span><i class="legend-line catalog-workspace"></i>Catalog to workspace (environment colour)</span>
        <span><i class="legend-line workspace-group"></i>Workspace to group (environment colour)</span>
        <span><i class="legend-line environment-lane"></i>Environment lane</span>
        <span><i class="legend-swatch link"></i>${connectionCount} total links</span>
      </div>
      <div class="legend-group"><b>Environment colours</b>
        ${environmentLegend.map((item) => `<span><i class="legend-swatch" style="background: ${item.color}"></i>${escapeHtml(item.label)}</span>`).join("")}
      </div>
      <div class="legend-group"><b>State</b>
        <span><i class="legend-swatch focused"></i>Focused item</span>
      </div>
    </div>
    ${renderTopologySelectionPanel()}
    <svg class="topology-structure-svg topology-interactive-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Proposed account topology diagram showing environments, catalogs, workspaces, and groups">
      <defs>${markers}</defs>
      <g class="topology-structure-top">
          <g class="topology-structure-node account" data-topology-node data-node-id="structure-account" data-topology-title="Databricks Account" data-topology-detail="Programme-level Databricks account container for the target estate.">
            <rect x="${x.account}" y="24" width="${sizes.topNodeWidth}" height="${sizes.topNodeHeight}" rx="5"></rect>
            <text x="${x.account + sizes.topNodeWidth / 2}" y="46" text-anchor="middle">Databricks Account</text>
          </g>
          <path d="${curvePath(x.account + sizes.topNodeWidth, 41, x.metastore, 41)}" class="topology-structure-link account" data-topology-link data-source="structure-account" data-target="structure-metastore"></path>
          <g class="topology-structure-node metastore" data-topology-node data-node-id="structure-metastore" data-topology-title="Metastore" data-topology-detail="Shared metastore context for catalogs and workspace access.">
            <rect x="${x.metastore}" y="24" width="122" height="${sizes.topNodeHeight}" rx="5"></rect>
            <text x="${x.metastore + 61}" y="46" text-anchor="middle">Metastore</text>
          </g>
          <path d="M ${x.metastore + 61} 58 L ${x.metastore + 61} 94" class="topology-structure-link account" data-topology-link data-source="structure-metastore" data-target="structure-catalog-column"></path>
      </g>
      <g class="topology-structure-columns">
          <g data-topology-node data-node-id="structure-catalog-column" data-topology-title="Catalogs" data-topology-detail="${formatNumber(catalogNodes.length)} catalog node${catalogNodes.length === 1 ? "" : "s"} across the programme topology.">
            <rect x="${x.catalog - 18}" y="90" width="${sizes.catalogNodeWidth + 36}" height="${height - 108}" rx="8"></rect>
            <text x="${x.catalog + sizes.catalogNodeWidth / 2}" y="116" text-anchor="middle">Catalogs</text>
          </g>
          <g data-topology-node data-node-id="structure-workspace-column" data-topology-title="Workspaces" data-topology-detail="${formatNumber(workspaceNodes.length)} target workspace node${workspaceNodes.length === 1 ? "" : "s"} across the programme topology.">
            <rect x="${x.workspace - 18}" y="90" width="${sizes.workspaceNodeWidth + 36}" height="${height - 108}" rx="8"></rect>
            <text x="${x.workspace + sizes.workspaceNodeWidth / 2}" y="116" text-anchor="middle">Workspaces</text>
          </g>
          <g data-topology-node data-node-id="structure-group-column" data-topology-title="Groups" data-topology-detail="${formatNumber(groupNodes.length)} access group node${groupNodes.length === 1 ? "" : "s"} across the programme topology.">
            <rect x="${x.group - 18}" y="90" width="${sizes.groupNodeWidth + 36}" height="${height - 108}" rx="8"></rect>
            <text x="${x.group + sizes.groupNodeWidth / 2}" y="116" text-anchor="middle">Groups</text>
          </g>
      </g>
      <g class="topology-bu-containers topology-structure-bu-containers">
        ${renderTopologyBusinessUnitContainers(structureContainers, "structure")}
      </g>
      <g class="topology-structure-lanes">
          ${laneLayouts.map((lane) => {
            const palette = paletteByEnvironment.get(lane.environmentName) || getTopologyEnvironmentPalette(lane.environmentName);
            const displayName = getTopologyItemDisplayName(lane.environmentName);
            const titleLines = wrapTopologyLabel(displayName, 32, 2);
            const detail = `${lane.groupLabel || getTopologyBusinessUnitLabel(lane.environmentName)} - ${lane.workspaceCount} workspace${lane.workspaceCount === 1 ? "" : "s"} - ${lane.catalogRows.length} catalog row${lane.catalogRows.length === 1 ? "" : "s"}`;
            const titleY = lane.y + lane.height / 2 - (lane.workspacePattern ? 12 : titleLines.length > 1 ? 8 : 0);
            return `
              <g class="topology-structure-lane" data-topology-node data-node-id="${escapeHtml(topologyNodeDomId("environment", lane.environmentName))}" data-topology-title="${escapeHtml(displayName)}" data-topology-detail="${escapeHtml(detail)}" style="--node-fill: ${palette.fill}; --node-stroke: ${palette.stroke}; --node-accent: ${palette.accent};">
                <rect x="${x.lane}" y="${lane.y}" width="${sizes.laneWidth}" height="${lane.height}" rx="8"></rect>
                <text class="lane-title" x="${x.lane + 26}" y="${titleY}">
                  ${titleLines.map((line, lineIndex) => `<tspan x="${x.lane + 26}" dy="${lineIndex === 0 ? 0 : 15}">${escapeHtml(line)}</tspan>`).join("")}
                </text>
                ${lane.workspacePattern ? `<text class="lane-subtitle" x="${x.lane + 26}" y="${lane.y + lane.height / 2 + 18}">${escapeHtml(truncateText(lane.workspacePattern, 28))}</text>` : ""}
              </g>
            `;
          }).join("")}
      </g>
      <g class="topology-structure-links">
          ${catalogLinks.map((link) => `<path d="${link.d}" class="topology-structure-link catalog-workspace" data-topology-link data-source="${escapeHtml(link.source)}" data-target="${escapeHtml(link.target)}" style="--link-color: ${link.color}" marker-end="url(#${markerByColor.get(link.color)})"><title>${escapeHtml(link.title)}</title></path>`).join("")}
          ${groupLinks.map((link) => `<path d="${link.d}" class="topology-structure-link workspace-group" data-topology-link data-source="${escapeHtml(link.source)}" data-target="${escapeHtml(link.target)}" style="--link-color: ${link.color}" marker-end="url(#${markerByColor.get(link.color)})"><title>${escapeHtml(link.title)}</title></path>`).join("")}
      </g>
      <g class="topology-structure-catalogs">
          ${catalogNodes.map((catalog) => {
            const palette = catalog.shared
              ? { fill: "var(--topology-node-neutral-fill)", stroke: "var(--topology-catalog)", accent: "var(--topology-catalog)" }
              : paletteByEnvironment.get(catalog.environmentNames[0]) || getTopologyEnvironmentPalette(catalog.environmentNames[0]);
            return `
              <g class="topology-structure-node catalog${catalog.shared ? " shared" : ""}" data-topology-node data-node-id="${escapeHtml(catalog.id)}" data-topology-title="${escapeHtml(getTopologyItemDisplayName(catalog.catalogName || "Catalog"))}" data-topology-detail="${escapeHtml(`${catalog.shared ? "Shared catalog" : "Catalog"} - ${catalog.environmentNames.length} environment${catalog.environmentNames.length === 1 ? "" : "s"}${catalog.ownerGroup ? ` - ${catalog.ownerGroup}` : ""}`)}" transform="translate(${catalog.x} ${catalog.y})" style="--node-fill: var(--topology-node-neutral-fill); --node-stroke: ${palette.accent}; --node-accent: ${palette.accent};">
                <rect width="${catalog.width}" height="${catalog.height}" rx="5"></rect>
                <text x="${catalog.width / 2}" y="${catalog.shared ? 14 : 22}" text-anchor="middle">${escapeHtml(truncateText(getTopologyItemDisplayName(catalog.catalogName || "Catalog"), 24))}</text>
                ${catalog.shared ? `<text class="node-subtitle" x="${catalog.width / 2}" y="29" text-anchor="middle">${catalog.environmentNames.length} environments</text>` : ""}
              </g>
            `;
          }).join("")}
      </g>
      <g class="topology-structure-workspaces">
          ${workspaceNodes.map((workspace, index) => {
            const palette = paletteByEnvironment.get(workspace.environmentName) || getTopologyEnvironmentPalette(workspace.environmentName, index);
            const environmentDisplayName = getTopologyItemDisplayName(workspace.environmentName);
            return `
              <g class="topology-structure-node workspace" data-topology-node data-node-id="${escapeHtml(workspace.id)}" data-topology-title="${escapeHtml(workspace.label)}" data-topology-detail="${escapeHtml(`${getTopologyBusinessUnitLabel(workspace.environmentName)} - ${environmentDisplayName}`)}" transform="translate(${workspace.x} ${workspace.y})" style="--node-fill: ${palette.fill}; --node-stroke: ${palette.stroke}; --node-accent: ${palette.accent};">
                <rect width="${workspace.width}" height="${workspace.height}" rx="8"></rect>
                <text x="${workspace.width / 2}" y="25" text-anchor="middle">${escapeHtml(truncateText(workspace.label, 22))}</text>
              </g>
            `;
          }).join("")}
      </g>
      <g class="topology-structure-groups">
          ${groupNodes.map((group, index) => {
            const palette = getTopologyDynamicPalette(index + 7);
            const detail = `${group.environmentNames.length} environment${group.environmentNames.length === 1 ? "" : "s"}${group.entitlementLevel ? ` - ${group.entitlementLevel}` : ""}${group.accessPurpose ? ` - ${group.accessPurpose}` : ""}`;
            return `
              <g class="topology-structure-node group" data-topology-node data-node-id="${escapeHtml(group.id)}" data-topology-title="${escapeHtml(getTopologyItemDisplayName(group.groupName || "Group"))}" data-topology-detail="${escapeHtml(detail)}" transform="translate(${group.x} ${group.y})" style="--node-fill: ${palette.fill}; --node-stroke: ${palette.stroke}; --node-accent: ${palette.accent};">
                <rect width="${group.width}" height="${group.height}" rx="7"></rect>
                <text x="${group.width / 2}" y="${group.entitlementLevel ? 18 : 29}" text-anchor="middle">${escapeHtml(truncateText(getTopologyItemDisplayName(group.groupName || "Group"), 22))}</text>
                ${group.entitlementLevel ? `<text class="node-subtitle" x="${group.width / 2}" y="38" text-anchor="middle">${escapeHtml(truncateText(group.entitlementLevel, 20))}</text>` : ""}
              </g>
            `;
          }).join("")}
      </g>
    </svg>
  `;
}
