/* Reference extract: renderEnvironmentMigrationFlowDiagram(...) from app/src/app.js:21287-21491. */

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
