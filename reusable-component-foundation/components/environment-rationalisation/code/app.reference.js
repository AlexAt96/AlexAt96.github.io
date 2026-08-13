/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderEnvironmentRationalisation(phase, item, bu = getSelectedBu()) {
  const model = getEnvironmentRationalisationModel(bu);
  return `
    ${detailHeader("Environment rationalisation approach", `Team working input for ${bu.name} environment migration action and target environment decisions.`)}
    <form id="environmentRationalisationForm" class="environment-rationalisation-form" data-business-unit-id="${escapeHtml(bu.id)}">
      <section class="panel environment-rationalisation-intro">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Analysis task</p>
            <h3>${escapeHtml(bu.name)} environment rationalisation approach</h3>
          </div>
          <button class="icon-button primary" type="submit">
            <svg><use href="#icon-save"></use></svg>
            <span>Save rationalisation</span>
          </button>
        </div>
        <p class="small-note" id="environmentRationalisationStatus">Saving updates Section 11 of the BU tech report.</p>
      </section>
      <section class="panel environment-rationalisation-copy">
        <label>
          <span class="field-label">Editable report text</span>
          <textarea name="reportText" rows="8">${escapeHtml(model.reportText)}</textarea>
        </label>
        <label>
          <span class="field-label">Team notes</span>
          <textarea name="teamNotes" rows="4" placeholder="Optional working notes, caveats, or actions for this section.">${escapeHtml(model.teamNotes)}</textarea>
        </label>
      </section>
      ${renderProposedTopologySection(model)}
      <section class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Working table</p>
            <h3>Scope record rationalisation inputs</h3>
          </div>
          <span class="pill">${model.rows.length} environment${model.rows.length === 1 ? "" : "s"}</span>
        </div>
        ${renderExcelImportExportComponent({
          componentId: "environmentRationalisationExcel",
          title: "Rationalisation table Excel workflow",
          description: "Download the current rationalisation rows, update migration action and target environment in Excel, then upload to stage the table before saving.",
          columns: ENVIRONMENT_RATIONALISATION_TEMPLATE_COLUMNS,
        })}
        <div class="data-table-wrap">
          <table class="data-table environment-rationalisation-table">
            <caption>${model.rows.length ? "Populate migration action and target environment for each scoped environment." : "No in-scope environments are available for rationalisation yet."}</caption>
            <thead>
              <tr>
                <th>Subscription name</th>
                <th>Resource name</th>
                <th>Discovery environment</th>
                <th>Migration action</th>
                <th>Target environment</th>
              </tr>
            </thead>
            <tbody>
              ${model.rows.length ? model.rows.map((row) => `
                <tr data-rationalisation-row-key="${escapeHtml(row.rowKey)}" data-subscription-name="${escapeHtml(row.subscriptionName)}" data-resource-name="${escapeHtml(row.resourceName)}" data-discovery-environment="${escapeHtml(row.discoveryEnvironment)}">
                  <td>${escapeHtml(renderScopeSourceValue(row.subscriptionName))}</td>
                  <td>${escapeHtml(row.resourceName)}</td>
                  <td>${escapeHtml(row.discoveryEnvironment)}</td>
                  <td>
                    <select name="migrationAction:${escapeHtml(row.rowKey)}" aria-label="Migration action for ${escapeHtml(row.resourceName)}">
                      ${renderSelectOptions(ENVIRONMENT_RATIONALISATION_ACTIONS, normaliseEnvironmentRationalisationAction(row.migrationAction))}
                    </select>
                  </td>
                  <td>
                    <select name="targetEnvironment:${escapeHtml(row.rowKey)}" data-rationalisation-target-environment aria-label="Target environment for ${escapeHtml(row.resourceName)}">
                      ${renderTargetEnvironmentOptions(model.proposedEnvironmentOptions, row.targetEnvironment)}
                    </select>
                  </td>
                </tr>
              `).join("") : `<tr><td colspan="5">No in-scope environments are available for rationalisation yet.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="form-actions">
          <p class="small-note">This table feeds the Proposed Environment Rationalisation Approach section in the BU tech report.</p>
          <button class="icon-button primary" type="submit">
            <svg><use href="#icon-save"></use></svg>
            <span>Save rationalisation</span>
          </button>
        </div>
      </section>
      ${renderEnvironmentMigrationFlowSection(model)}
      ${renderProposedTopologyGuidanceSection()}
    </form>
  `;
}

function renderProposedTopologyTable(type, title, headings, rowHtml, templateColumns = []) {
  const componentId = `proposedTopology${type[0].toUpperCase()}${type.slice(1)}Excel`;
  return `
    <section class="proposed-topology-table-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${escapeHtml(type)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
        <button class="icon-button ghost compact topology-add-row" type="button" data-topology-type="${escapeHtml(type)}" title="Add ${escapeHtml(type)} row">
          <svg><use href="#icon-plus"></use></svg>
        </button>
      </div>
      ${renderExcelImportExportComponent({
        componentId,
        title: `${title} Excel workflow`,
        description: "Download the table, update rows in Excel, then upload it here to stage the table before saving.",
        columns: templateColumns,
      })}
      <div class="data-table-wrap">
        <table class="data-table proposed-topology-table" data-topology-table="${escapeHtml(type)}">
          <thead>
            <tr>${headings.map((heading) => `<th>${escapeHtml(heading)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rowHtml.join("")}
          </tbody>
        </table>
      </div>
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

function getEnvironmentRationalisationModel(bu) {
  const screen = getBuScreenInstance(bu.id, "proposed-environment-rationalisation");
  const saved = screen?.environment_rationalisation && typeof screen.environment_rationalisation === "object" ? screen.environment_rationalisation : {};
  const tableRows = Array.isArray(serverWorkspace?.environment_rationalisation_inputs)
    ? serverWorkspace.environment_rationalisation_inputs.filter((row) => row.business_unit_id === bu.id)
    : [];
  const proposedTopology = getProposedTopologyModel(bu, saved.proposedTopology || saved.proposed_topology || {});
  const proposedEnvironmentOptions = proposedTopology.environments.map((row) => row.environmentName).filter(Boolean);
  const sourceSavedRows = tableRows.length ? tableRows : (Array.isArray(saved.rows) ? saved.rows : []);
  const savedRows = new Map(sourceSavedRows.map((row) => [row.rowKey || row.row_key || "", row]));
  const savedRowsByResource = new Map();
  const savedRowsByDiscoveryEnvironment = new Map();
  sourceSavedRows.forEach((row) => {
    const resourceName = String(row.resourceName || row.resource_name || "").trim();
    const discoveryEnvironment = String(row.discoveryEnvironment || row.discovery_environment || "").trim();
    const resourceKey = resourceName ? normaliseKey(resourceName) : "";
    const discoveryKey = discoveryEnvironment ? normaliseKey(discoveryEnvironment) : "";
    if (resourceKey && !savedRowsByResource.has(resourceKey)) savedRowsByResource.set(resourceKey, row);
    if (discoveryKey && !savedRowsByDiscoveryEnvironment.has(discoveryKey)) savedRowsByDiscoveryEnvironment.set(discoveryKey, row);
  });
  const savedSummary = tableRows.find((row) => row.report_text || row.reportText || row.team_notes || row.teamNotes) || {};
  const scopeRows = getScopeRecordsForBu(bu).filter((row) => row.inScope !== false);
  const rows = scopeRows.map((row, index) => {
    const rowKey = getEnvironmentRationalisationRowKey(row, index);
    const resourceKey = normaliseKey(row.workspaceName || row.workspaceId || row.environmentName || "");
    const discoveryKey = normaliseKey(row.environmentName || row.environmentType || "");
    const savedRow = savedRows.get(rowKey)
      || savedRowsByResource.get(resourceKey)
      || savedRowsByDiscoveryEnvironment.get(discoveryKey)
      || {};
    return {
      rowKey,
      subscriptionName: row.subscriptionName || "",
      resourceName: row.workspaceName || row.workspaceId || row.environmentName || "",
      discoveryEnvironment: row.environmentName || row.environmentType || "",
      migrationAction: savedRow.migrationAction || savedRow.migration_action || "Team to populate",
      targetEnvironment: savedRow.targetEnvironment || savedRow.target_environment || "Team to populate",
    };
  });
  return {
    hasSaved: tableRows.length > 0 || Boolean(screen?.environment_rationalisation),
    reportText: savedSummary.report_text || savedSummary.reportText || saved.reportText || saved.report_text || "Below is an initial view of how environments may be rationalised and where they may be merged. This should be developed further as part of the detailed design phase.\n\nTeam to populate the migration action and target environment for each environment.",
    teamNotes: savedSummary.team_notes || savedSummary.teamNotes || saved.teamNotes || saved.team_notes || "",
    proposedTopology,
    proposedEnvironmentOptions,
    rows,
  };
}

function normaliseEnvironmentRationalisationAction(value) {
  return ENVIRONMENT_RATIONALISATION_ACTIONS.includes(value) ? value : "Team to populate";
}

function wireEnvironmentRationalisationActions() {
  const form = document.querySelector("#environmentRationalisationForm");
  if (!form) return;
  if (isReadonlyDocumentView() && !form.querySelector("input, select, textarea")) {
    wireInteractiveTopologyCanvases(form);
    return;
  }
  const status = form.querySelector("#environmentRationalisationStatus");
  refreshProposedTopologyEnvironmentSelects(form);
  refreshProposedTopologyDiagrams(form);
  wireExcelImportExportComponent({
    componentId: "proposedTopologyEnvironmentExcel",
    download: () => downloadProposedTopologyExcelTemplate(form, "environment"),
    parseFile: parseProposedTopologyEnvironmentImportFile,
    emptyMessage: "The proposed environment Excel import did not contain any environment rows.",
    onRows: (rows) => {
      replaceProposedTopologyRows(form, "environment", rows);
      refreshProposedTopologyDiagrams(form);
      const importStatus = document.querySelector("#proposedTopologyEnvironmentExcelStatus");
      if (importStatus) importStatus.textContent = `Imported ${rows.length} proposed environment row${rows.length === 1 ? "" : "s"}. Press Save rationalisation to persist.`;
    },
    errorPrefix: "The proposed environment Excel import could not be read",
  });
  wireExcelImportExportComponent({
    componentId: "proposedTopologyCatalogExcel",
    download: () => downloadProposedTopologyExcelTemplate(form, "catalog"),
    parseFile: parseProposedTopologyCatalogImportFile,
    emptyMessage: "The proposed catalog Excel import did not contain any catalog rows.",
    onRows: (rows) => {
      replaceProposedTopologyRows(form, "catalog", rows);
      refreshProposedTopologyDiagrams(form);
      const importStatus = document.querySelector("#proposedTopologyCatalogExcelStatus");
      if (importStatus) importStatus.textContent = `Imported ${rows.length} catalog row${rows.length === 1 ? "" : "s"}. Press Save rationalisation to persist.`;
    },
    errorPrefix: "The proposed catalog Excel import could not be read",
  });
  wireExcelImportExportComponent({
    componentId: "proposedTopologyGroupExcel",
    download: () => downloadProposedTopologyExcelTemplate(form, "group"),
    parseFile: parseProposedTopologyGroupImportFile,
    emptyMessage: "The proposed group Excel import did not contain any group rows.",
    onRows: (rows) => {
      replaceProposedTopologyRows(form, "group", rows);
      refreshProposedTopologyDiagrams(form);
      const importStatus = document.querySelector("#proposedTopologyGroupExcelStatus");
      if (importStatus) importStatus.textContent = `Imported ${rows.length} group row${rows.length === 1 ? "" : "s"}. Press Save rationalisation to persist.`;
    },
    errorPrefix: "The proposed group Excel import could not be read",
  });
  wireExcelImportExportComponent({
    componentId: "environmentRationalisationExcel",
    download: () => downloadEnvironmentRationalisationExcelTemplate(form),
    parseFile: parseEnvironmentRationalisationImportFile,
    emptyMessage: "The rationalisation Excel import did not contain any matching rows.",
    onRows: (rows) => {
      const updated = applyEnvironmentRationalisationImportRows(form, rows);
      refreshProposedTopologyDiagrams(form);
      const importStatus = document.querySelector("#environmentRationalisationExcelStatus");
      if (importStatus) importStatus.textContent = `Updated ${updated} rationalisation row${updated === 1 ? "" : "s"} from Excel. Press Save rationalisation to persist.`;
    },
    errorPrefix: "The rationalisation Excel import could not be read",
  });
  form.addEventListener("click", (event) => {
    const addButton = event.target.closest(".topology-add-row");
    if (addButton) {
      const type = addButton.dataset.topologyType || "";
      const tbody = form.querySelector(`[data-topology-table="${cssEscape(type)}"] tbody`);
      if (!tbody) return;
      if (type === "environment") tbody.insertAdjacentHTML("beforeend", renderProposedTopologyEnvironmentRow({}, getProposedTopologyEnvironmentOptionsFromForm(form)));
      if (type === "catalog") tbody.insertAdjacentHTML("beforeend", renderProposedTopologyCatalogRow({}, getProposedTopologyEnvironmentOptionsFromForm(form)));
      if (type === "group") tbody.insertAdjacentHTML("beforeend", renderProposedTopologyGroupRow({}, getProposedTopologyEnvironmentOptionsFromForm(form)));
      refreshProposedTopologyEnvironmentSelects(form);
      refreshProposedTopologyDiagrams(form);
      if (status) status.textContent = "Topology row added. Save to persist these values.";
      return;
    }
    const clearButton = event.target.closest(".topology-clear-select");
    if (clearButton) {
      const row = clearButton.closest("[data-topology-row]");
      const selectName = clearButton.dataset.clearSelectName || "";
      const select = row?.querySelector(`select[name="${cssEscape(selectName)}"]`);
      if (select) {
        Array.from(select.options).forEach((option) => {
          option.selected = false;
        });
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (status) status.textContent = "Topology environment selections cleared. Save to persist the change.";
      return;
    }
    const removeButton = event.target.closest(".topology-remove-row");
    if (removeButton) {
      const row = removeButton.closest("[data-topology-row]");
      row?.remove();
      refreshProposedTopologyEnvironmentSelects(form);
      refreshProposedTopologyDiagrams(form);
      if (status) status.textContent = "Topology row removed. Save to persist the change.";
    }
  });
  form.addEventListener("input", (event) => {
    if (event.target?.name === "topologyEnvironmentName") refreshProposedTopologyEnvironmentSelects(form);
    if (event.target?.closest("[data-topology-row]")) refreshProposedTopologyDiagrams(form);
  });
  form.addEventListener("change", (event) => {
    if (event.target?.closest("[data-topology-row]")) refreshProposedTopologyDiagrams(form);
    if (event.target?.closest("[data-rationalisation-row-key]")) refreshProposedTopologyDiagrams(form);
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!SERVER_MODE) {
      if (status) status.textContent = "Run the local server to save environment rationalisation.";
      return;
    }
    const buttons = form.querySelectorAll('button[type="submit"]');
    buttons.forEach((button) => button.disabled = true);
    if (status) status.textContent = "Saving environment rationalisation...";
    const rows = Array.from(form.querySelectorAll("[data-rationalisation-row-key]")).map((row) => {
      const rowKey = row.dataset.rationalisationRowKey || "";
      return {
        rowKey,
        subscriptionName: row.dataset.subscriptionName || "",
        resourceName: row.dataset.resourceName || "",
        discoveryEnvironment: row.dataset.discoveryEnvironment || "",
        migrationAction: form.elements[`migrationAction:${rowKey}`]?.value || "Team to populate",
        targetEnvironment: form.elements[`targetEnvironment:${rowKey}`]?.value || "",
      };
    });
    try {
      const result = await apiRequest(`/api/business-units/${encodeURIComponent(form.dataset.businessUnitId)}/environment-rationalisation`, {
        method: "PUT",
        body: JSON.stringify({
          reportText: form.elements.reportText?.value || "",
          teamNotes: form.elements.teamNotes?.value || "",
          proposedTopology: getProposedTopologyPayload(form),
          rows,
        }),
      });
      if (result.screen) {
        const screens = serverWorkspace.screen_instances || [];
        const index = screens.findIndex((screen) => screen.screen_instance_id === result.screen.screen_instance_id);
        if (index >= 0) screens[index] = result.screen;
        else screens.push(result.screen);
        serverWorkspace.screen_instances = screens;
      }
      if (Array.isArray(result.records)) {
        serverWorkspace.environment_rationalisation_inputs = [
          ...(serverWorkspace.environment_rationalisation_inputs || []).filter((row) => row.business_unit_id !== form.dataset.businessUnitId),
          ...result.records,
        ];
      }
      if (Array.isArray(result.topologyRecords)) {
        serverWorkspace.proposed_topology_inputs = [
          ...(serverWorkspace.proposed_topology_inputs || []).filter((row) => row.business_unit_id !== form.dataset.businessUnitId),
          ...result.topologyRecords,
        ];
      }
      if (status) status.textContent = "Environment rationalisation saved.";
      reloadAppAfterStatusUpdate(result.screen?.status || "In progress", event.submitter || buttons[0]);
    } catch (error) {
      if (status) status.textContent = `The environment rationalisation could not be saved: ${formatApiError(error)}`;
    } finally {
      buttons.forEach((button) => button.disabled = false);
    }
  });
}

function refreshProposedTopologyDiagrams(form) {
  refreshProposedTopologyFlowDiagram(form);
  refreshProposedTopologyStructureDiagram(form);
  refreshEnvironmentMigrationFlowDiagram(form);
  wireInteractiveTopologyCanvases(form);
}

async function parseEnvironmentRationalisationImportFile(file) {
  return tableRowsToEnvironmentRationalisationRows(await parseImportTableRowsFromFile(file));
}
