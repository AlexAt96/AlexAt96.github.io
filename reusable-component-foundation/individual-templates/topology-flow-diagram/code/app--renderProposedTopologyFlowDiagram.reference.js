/* Reference extract: renderProposedTopologyFlowDiagram(...) from app/src/app.js:21000-21285. */

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
