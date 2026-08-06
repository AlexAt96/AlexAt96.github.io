/* Reference extract: renderProposedTopologyStructureDiagram(...) from app/src/app.js:21537-21891. */

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
