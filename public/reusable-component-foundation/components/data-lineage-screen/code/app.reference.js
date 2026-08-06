/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function getAdfLineageModel(bu) {
  const rowsForBu = (tableName) => (serverWorkspace?.[tableName] || [])
    .filter((row) => !bu || row.business_unit_id === bu.id);
  const lineage = {
    profileRuns: rowsForBu("adf_profile_runs"),
    activities: rowsForBu("adf_activity_details"),
    dependencies: rowsForBu("adf_activity_dependencies"),
    copyFlows: rowsForBu("adf_copy_flows"),
    datasets: rowsForBu("adf_datasets"),
    linkedServices: rowsForBu("adf_linked_services"),
    databases: rowsForBu("adf_database_instances"),
    tableReferences: rowsForBu("adf_table_references"),
    triggers: rowsForBu("adf_triggers"),
    pipelineRuns: rowsForBu("adf_pipeline_runs"),
    dataflows: rowsForBu("adf_dataflows"),
    databricksActivities: rowsForBu("adf_databricks_activities"),
  };
  const nodes = new Map();
  const edges = [];
  const addNode = (key, node) => {
    if (!key) return null;
    if (!nodes.has(key)) nodes.set(key, { key, lane: "activity", kind: "activity", label: key, sublabel: "", weight: 0, evidence: [], ...node });
    const existing = nodes.get(key);
    existing.weight += Number(node.weight || 1);
    if (node.evidence) existing.evidence = [...new Set([...(existing.evidence || []), node.evidence].filter(Boolean))];
    return existing;
  };
  const addEdge = (from, to, edge = {}) => {
    if (!from || !to || from === to) return;
    edges.push({ from, to, label: edge.label || "", kind: edge.kind || "observed", weight: Number(edge.weight || 1), evidence: edge.evidence || "" });
  };
  const datasetByName = new Map();
  lineage.datasets.forEach((row) => {
    const datasetName = cleanLineageLabel(row.dataset_name);
    if (!datasetName) return;
    const datasetKey = adfLineageKey("dataset", datasetName);
    datasetByName.set(normaliseImportHeader(datasetName), datasetKey);
    addNode(datasetKey, {
      lane: "service",
      kind: "dataset",
      label: datasetName,
      sublabel: row.dataset_type || row.linked_service_name || "Dataset",
      evidence: row.source_file_name,
    });
    if (row.linked_service_name) {
      const serviceKey = adfLineageKey("linked-service", row.linked_service_name);
      addNode(serviceKey, {
        lane: "service",
        kind: "linked-service",
        label: row.linked_service_name,
        sublabel: "Linked service",
        evidence: row.source_file_name,
      });
      addEdge(datasetKey, serviceKey, { label: "uses", evidence: row.source_file_name });
    }
  });
  lineage.linkedServices.forEach((row) => {
    const serviceName = cleanLineageLabel(row.linked_service_name);
    if (!serviceName) return;
    addNode(adfLineageKey("linked-service", serviceName), {
      lane: "service",
      kind: "linked-service",
      label: serviceName,
      sublabel: row.linked_service_type || row.connect_via || "Linked service",
      evidence: row.source_file_name,
    });
  });
  lineage.databases.forEach((row) => {
    const serviceName = cleanLineageLabel(row.linked_service_name);
    const databaseLabel = [row.server, row.database_name].filter(Boolean).join(" / ") || row.database_name || row.server || "Database";
    const databaseKey = adfLineageKey("database", databaseLabel);
    addNode(databaseKey, {
      lane: "data",
      kind: "database",
      label: databaseLabel,
      sublabel: row.database_type || "Database instance",
      evidence: row.source_file_name,
    });
    if (serviceName) {
      const serviceKey = adfLineageKey("linked-service", serviceName);
      addNode(serviceKey, { lane: "service", kind: "linked-service", label: serviceName, sublabel: "Linked service", evidence: row.source_file_name });
      addEdge(serviceKey, databaseKey, { label: "connects", evidence: row.source_file_name });
    }
  });
  lineage.tableReferences.forEach((row) => {
    const tableLabel = [row.schema_name, row.table_name].filter(Boolean).join(".") || row.table_name || row.dataset_name || "Table";
    const tableKey = adfLineageKey("table", tableLabel);
    addNode(tableKey, {
      lane: "data",
      kind: "table",
      label: tableLabel,
      sublabel: row.dataset_type || "Table reference",
      evidence: row.source_file_name,
    });
    const datasetKey = datasetByName.get(normaliseImportHeader(row.dataset_name)) || adfLineageKey("dataset", row.dataset_name);
    if (row.dataset_name) {
      addNode(datasetKey, { lane: "service", kind: "dataset", label: row.dataset_name, sublabel: "Dataset", evidence: row.source_file_name });
      addEdge(datasetKey, tableKey, { label: "points at", evidence: row.source_file_name });
    }
    if (row.linked_service_name) {
      const serviceKey = adfLineageKey("linked-service", row.linked_service_name);
      addNode(serviceKey, { lane: "service", kind: "linked-service", label: row.linked_service_name, sublabel: "Linked service", evidence: row.source_file_name });
      addEdge(serviceKey, tableKey, { label: "references", evidence: row.source_file_name });
    }
  });
  lineage.activities.forEach((row) => {
    const pipelineKey = adfLineageKey("pipeline", row.pipeline_name || "Pipeline");
    const activityKey = adfActivityNodeKey(row);
    addNode(pipelineKey, {
      lane: "pipeline",
      kind: "pipeline",
      label: row.pipeline_name || "Pipeline",
      sublabel: getAdfLineageEnvironmentLabel(bu, row),
      evidence: row.source_file_name,
    });
    addNode(activityKey, {
      lane: "activity",
      kind: getAdfActivityNodeKind(row.activity_type),
      label: row.activity_name || row.activity_type || "Activity",
      sublabel: row.activity_type || "Activity",
      weight: Math.max(1, Number(row.complexity_factor || 1)),
      evidence: row.source_file_name,
    });
    addEdge(pipelineKey, activityKey, { label: row.activity_type || "contains", evidence: row.source_file_name });
    if (row.linked_service) {
      const serviceKey = adfLineageKey("linked-service", row.linked_service);
      addNode(serviceKey, { lane: "service", kind: "linked-service", label: row.linked_service, sublabel: "Linked service", evidence: row.source_file_name });
      addEdge(activityKey, serviceKey, { label: "uses", evidence: row.source_file_name });
    }
    if (isDatabricksActivityType(row.activity_type)) {
      const databricksDetail = findAdfDatabricksActivity(lineage.databricksActivities, row);
      const databricksLabel = databricksDetail?.notebook_path || (databricksDetail?.job_id ? `Job ${databricksDetail.job_id}` : row.linked_service || "Databricks target");
      const databricksSublabel = [
        databricksDetail?.compute_type_inferred,
        databricksDetail?.existing_cluster_id || databricksDetail?.new_cluster_version || databricksDetail?.instance_pool_id,
      ].filter(Boolean).join(" / ") || "Notebook/job internals not inspected";
      const databricksKey = adfLineageKey("databricks", databricksLabel);
      addNode(databricksKey, {
        lane: "service",
        kind: "databricks",
        label: databricksLabel,
        sublabel: databricksSublabel,
        evidence: databricksDetail?.source_file_name || row.source_file_name,
      });
      addEdge(activityKey, databricksKey, { label: "invokes", evidence: row.source_file_name });
    }
  });
  lineage.databricksActivities.forEach((row) => {
    const activityKey = adfLineageKey("activity", [row.pipeline_name, row.activity_name].filter(Boolean).join(":"));
    const targetLabel = row.notebook_path || (row.job_id ? `Job ${row.job_id}` : row.linked_service_name || "Databricks target");
    const targetKey = adfLineageKey("databricks", targetLabel);
    addNode(activityKey, {
      lane: "activity",
      kind: "databricks",
      label: row.activity_name || row.activity_type || "Databricks activity",
      sublabel: row.pipeline_name || row.activity_type || "Activity",
      evidence: row.source_file_name,
    });
    addNode(targetKey, {
      lane: "service",
      kind: "databricks",
      label: targetLabel,
      sublabel: row.compute_type_inferred || row.existing_cluster_id || row.new_cluster_version || "Notebook/job internals not inspected",
      evidence: row.source_file_name,
    });
    addEdge(activityKey, targetKey, { label: row.job_id ? "job" : "notebook", evidence: row.source_file_name });
  });
  lineage.dependencies.forEach((row) => {
    const from = adfLineageKey("activity", [row.pipeline_name, row.depends_on_activity_name].filter(Boolean).join(":"));
    const to = adfLineageKey("activity", [row.pipeline_name, row.activity_name].filter(Boolean).join(":"));
    addNode(from, { lane: "activity", kind: "activity", label: row.depends_on_activity_name || "Dependency", sublabel: row.pipeline_name || "Activity dependency", evidence: row.source_file_name });
    addNode(to, { lane: "activity", kind: "activity", label: row.activity_name || "Activity", sublabel: row.pipeline_name || "Activity", evidence: row.source_file_name });
    addEdge(from, to, { label: "depends on", kind: "dependency", evidence: row.source_file_name });
  });
  lineage.copyFlows.forEach((row) => {
    const activityKey = adfLineageKey("activity", [row.pipeline_name, row.activity_name].filter(Boolean).join(":"));
    addNode(activityKey, { lane: "activity", kind: "copy", label: row.activity_name || "Copy activity", sublabel: row.pipeline_name || "Copy", evidence: row.source_file_name });
    const sourceKey = addAdfFlowEndpoint(addNode, row.source_dataset, row.source_connector, "source", row.source_linked_service, row.source_file_name);
    const sinkKey = addAdfFlowEndpoint(addNode, row.sink_dataset, row.sink_connector, "sink", row.sink_linked_service, row.source_file_name);
    if (sourceKey) addEdge(sourceKey, activityKey, { label: "reads", evidence: row.source_file_name, weight: row.rows_read || 1 });
    if (sinkKey) addEdge(activityKey, sinkKey, { label: "writes", evidence: row.source_file_name, weight: row.rows_copied || 1 });
  });
  lineage.triggers.forEach((row) => {
    const triggerKey = adfLineageKey("trigger", row.trigger_name || "Trigger");
    addNode(triggerKey, { lane: "trigger", kind: "trigger", label: row.trigger_name || "Trigger", sublabel: row.trigger_type || row.runtime_state || "Trigger", evidence: row.source_file_name });
    parseAdfLineageListValue(row.pipelines_json).forEach((pipelineName) => {
      const pipelineKey = adfLineageKey("pipeline", pipelineName);
      addNode(pipelineKey, { lane: "pipeline", kind: "pipeline", label: pipelineName, sublabel: "Triggered pipeline", evidence: row.source_file_name });
      addEdge(triggerKey, pipelineKey, { label: row.runtime_state || "triggers", evidence: row.source_file_name });
    });
  });
  lineage.dataflows.forEach((row) => {
    const dataflowKey = adfLineageKey("dataflow", row.dataflow_name || "Data flow");
    addNode(dataflowKey, { lane: "activity", kind: "dataflow", label: row.dataflow_name || "Data flow", sublabel: `${formatNumber(row.transformation_count || 0)} transformations`, evidence: row.source_file_name });
    parseAdfLineageListValue(row.pipelines_using_it).forEach((pipelineName) => {
      const pipelineKey = adfLineageKey("pipeline", pipelineName);
      addNode(pipelineKey, { lane: "pipeline", kind: "pipeline", label: pipelineName, sublabel: "Pipeline", evidence: row.source_file_name });
      addEdge(pipelineKey, dataflowKey, { label: "uses", evidence: row.source_file_name });
    });
  });
  if (!nodes.size) addAdfActivityFallbackLineage(bu, addNode, addEdge);
  const allNodes = [...nodes.values()].sort((a, b) =>
    ADF_LINEAGE_LANES.findIndex((lane) => lane.key === a.lane) - ADF_LINEAGE_LANES.findIndex((lane) => lane.key === b.lane)
    || b.weight - a.weight
    || a.label.localeCompare(b.label)
  );
  const visibleKeys = new Set(allNodes.slice(0, ADF_LINEAGE_NODE_LIMIT).map((node) => node.key));
  const visibleNodes = allNodes.filter((node) => visibleKeys.has(node.key));
  const visibleEdges = dedupeAdfLineageEdges(edges)
    .filter((edge) => visibleKeys.has(edge.from) && visibleKeys.has(edge.to))
    .slice(0, ADF_LINEAGE_NODE_LIMIT * 2);
  const pipelineNames = new Set([...lineage.activities, ...lineage.copyFlows, ...lineage.pipelineRuns].map((row) => row.pipeline_name).filter(Boolean));
  const model = {
    ...lineage,
    nodes: visibleNodes,
    edges: visibleEdges,
    hiddenNodeCount: Math.max(0, allNodes.length - visibleNodes.length),
    hasDetailedLineage: Object.values(lineage).some((rows) => Array.isArray(rows) && rows.length > 0),
    pipelineCount: pipelineNames.size,
    activityCount: lineage.activities.length || getAdfActivityRowsForBu(bu).reduce((total, row) => total + Number(row.activityCount || 0), 0),
    databaseCount: lineage.databases.length,
    tableReferenceCount: lineage.tableReferences.length,
    caveats: getAdfLineageCaveats(lineage),
  };
  model.pipelineFlows = getAdfPipelineStepFlows(model);
  model.touchpoints = getAdfLineageTouchpoints(model);
  return model;
}

function renderAdfLineageExplorer(bu, lineage = getAdfLineageModel(bu)) {
  const caveatText = lineage.caveats.join(" ");
  const activeView = queryParam("lineageView") === "map" ? "map" : "steps";
  const mapLinkClass = `adf-open-lineage-explorer ${activeView === "map" ? "active" : ""}`;
  return `
    <section class="adf-lineage-panel" aria-label="ADF lineage explorer">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Lineage MVP</p>
          <h3>${escapeHtml(bu?.name || "Cross-BU")} ADF pipeline lineage</h3>
        </div>
        <span class="status-pill ${lineage.hasDetailedLineage ? "in-progress" : "not-started"}">${lineage.hasDetailedLineage ? "Profiler detail" : "Activity fallback"}</span>
      </div>
      <nav class="adf-lineage-view-toggle" aria-label="ADF lineage view">
        <a class="${activeView === "steps" ? "active" : ""}" href="${escapeHtml(getAdfLineageViewHref("steps"))}">Pipeline steps</a>
        <a class="${mapLinkClass}" href="${escapeHtml(getAdfLineageViewHref("map"))}" data-open-adf-lineage-explorer="true">Touchpoint explorer</a>
      </nav>
      <div class="adf-lineage-summary">
        <div><span>Pipelines</span><strong>${formatNumber(lineage.pipelineCount)}</strong></div>
        <div><span>Activities</span><strong>${formatNumber(lineage.activityCount)}</strong></div>
        <div><span>Copy flows</span><strong>${formatNumber(lineage.copyFlows.length)}</strong></div>
        <div><span>Tables</span><strong>${formatNumber(lineage.tableReferenceCount)}</strong></div>
        <div><span>Databases</span><strong>${formatNumber(lineage.databaseCount)}</strong></div>
      </div>
      ${activeView === "map" ? renderAdfLineageExplorerLaunch(lineage) : renderAdfPipelineStepExplorer(lineage)}
      <div class="adf-lineage-notes">
        <span>${escapeHtml(caveatText)}</span>
        ${lineage.hiddenNodeCount ? `<span>${formatNumber(lineage.hiddenNodeCount)} lower-weight nodes are hidden in this MVP view.</span>` : ""}
      </div>
    </section>
  `;
}

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

function buildAdfPipelineTouchpointGraph(lineage = {}) {
  const typeColors = {
    environment: "#22d3ee",
    pipeline: "#38bdf8",
    "adf-call": "#ec4899",
    sequence: "#0ea5e9",
    activity: "#60a5fa",
    copy: "#34d399",
    transform: "#f472b6",
    dataflow: "#f472b6",
    "stored-procedure": "#f59e0b",
    dataset: "#a78bfa",
    table: "#f0b429",
    database: "#fb7185",
    databricks: "#fb923c",
    "linked-service": "#24d18f",
  };
  const nodes = new Map();
  const edges = [];
  const groupsByType = new Map();
  const addNode = (key, node) => {
    if (!nodes.has(key)) nodes.set(key, { key, ...node, pipelines: new Set(node.pipelineName ? [node.pipelineName] : []) });
    const existing = nodes.get(key);
    if (node.pipelineName) existing.pipelines.add(node.pipelineName);
    return existing;
  };
  const addEdge = (from, to, type, pipelineName, label = "", order = 0) => {
    const color = typeColors[type] || "#94a3b8";
    if (!groupsByType.has(type)) groupsByType.set(type, { type, color, edges: [] });
    const edge = {
      id: `adf-touchpoint-edge-${edges.length}`,
      from,
      to,
      type,
      pipelineName,
      label,
      color,
      order,
    };
    edges.push(edge);
    groupsByType.get(type).edges.push(edge);
  };
  addNode("hub:adf", { label: "ADF estate", sublabel: "Pipeline start", kind: "hub" });
  (lineage.pipelineFlows || []).forEach((pipeline, pipelineIndex) => {
    const environmentLabel = pipeline.environmentLabel || getEnvironmentLabel(pipeline.environmentId, pipeline.workspaceId) || "ADF environment";
    const environmentKey = adfLineageKey("environment", `${environmentLabel}-${pipeline.environmentId || pipeline.workspaceId || ""}`);
    addNode(environmentKey, { label: environmentLabel, sublabel: "ADF environment start", kind: "environment", role: "environment", environmentId: pipeline.environmentId || "", workspaceId: pipeline.workspaceId || "", order: pipelineIndex });
    addEdge("hub:adf", environmentKey, "environment", pipeline.pipelineName, "environment", pipelineIndex);
    const pipelineKey = adfLineageKey("pipeline", pipeline.pipelineName);
    addNode(pipelineKey, { label: pipeline.pipelineName, sublabel: `${formatNumber(pipeline.steps.length)} steps`, kind: "pipeline", role: "pipeline", pipelineName: pipeline.pipelineName, order: pipelineIndex });
    addEdge(environmentKey, pipelineKey, "pipeline", pipeline.pipelineName, "starts", pipelineIndex);
    const groupedSteps = getAdfPipelineStepLevelGroups(pipeline.steps);
    let previousActivityKeys = [pipelineKey];
    let stepOrder = 0;
    groupedSteps.forEach((steps) => {
      const currentActivityKeys = [];
      steps.forEach((step) => {
        const activityKey = getAdfPipelineActivityNodeKey({ pipelineName: pipeline.pipelineName, activityName: step.activityName });
        const activityKind = step.kind || "activity";
        addNode(activityKey, {
          label: step.activityName,
          sublabel: `Step ${stepOrder + 1} / ${step.activityType || step.actionLabel || "ADF activity"}`,
          kind: activityKind,
          role: "activity",
          pipelineName: pipeline.pipelineName,
          activityType: step.activityType || "",
          actionLabel: step.actionLabel || "",
          order: stepOrder,
        });
        previousActivityKeys.forEach((previousActivityKey) => {
          addEdge(previousActivityKey, activityKey, "sequence", pipeline.pipelineName, `step ${stepOrder + 1}`, stepOrder);
        });
        currentActivityKeys.push(activityKey);
        [...(step.sources || []), ...(step.sinks || [])].forEach((endpoint, endpointIndex) => {
          const kind = /sql|table|delta|lake|storage/i.test(endpoint.name) ? "table" : "dataset";
          const key = adfLineageKey(kind, endpoint.name);
          addNode(key, { label: endpoint.name, sublabel: endpoint.detail, kind, role: "touchpoint", pipelineName: pipeline.pipelineName, order: endpointIndex });
          addEdge(activityKey, key, kind, pipeline.pipelineName, step.sources?.includes(endpoint) ? "reads" : "writes", endpointIndex + 100);
        });
        if (step.databricks?.target) {
          const key = adfLineageKey("databricks", step.databricks.target);
          addNode(key, { label: step.databricks.target, sublabel: step.databricks.compute || "Databricks", kind: "databricks", role: "touchpoint", pipelineName: pipeline.pipelineName, order: stepOrder });
          addEdge(activityKey, key, "databricks", pipeline.pipelineName, "runs", 180);
        }
        if (step.linkedService) {
          const key = adfLineageKey("linked-service", step.linkedService);
          addNode(key, { label: step.linkedService, sublabel: "Linked service", kind: "linked-service", role: "touchpoint", pipelineName: pipeline.pipelineName, order: stepOrder });
          addEdge(activityKey, key, "linked-service", pipeline.pipelineName, "uses", 220);
        }
        if (step.targetPipeline) {
          const key = adfLineageKey("pipeline", step.targetPipeline);
          addNode(key, { label: step.targetPipeline, sublabel: "Called pipeline", kind: "pipeline", role: "pipeline", pipelineName: step.targetPipeline, order: stepOrder });
          addEdge(activityKey, key, "adf-call", pipeline.pipelineName, "ADF pipeline call", 260);
        }
        stepOrder += 1;
      });
      previousActivityKeys = currentActivityKeys;
    });
  });
  const groups = [...groupsByType.values()].sort((a, b) => a.type.localeCompare(b.type));
  const touchpointCount = [...nodes.values()].filter((node) => !["hub", "environment", "pipeline", "activity", "copy", "transform", "databricks"].includes(node.kind) || node.kind === "databricks").length;
  const sharedCount = [...nodes.values()].filter((node) => !["hub", "environment"].includes(node.kind) && node.pipelines?.size > 1).length;
  return { nodes, edges, groups, pipelineCount: (lineage.pipelineFlows || []).length, touchpointCount, sharedCount };
}

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

function getAdfLineageLayout(nodes = []) {
  const laneGroups = new Map(ADF_LINEAGE_LANES.map((lane) => [lane.key, []]));
  nodes.forEach((node) => {
    const laneKey = laneGroups.has(node.lane) ? node.lane : "activity";
    laneGroups.get(laneKey).push(node);
  });
  const points = new Map();
  let height = 320;
  ADF_LINEAGE_LANES.forEach((lane) => {
    const laneNodes = laneGroups.get(lane.key) || [];
    const gap = 78;
    laneNodes.forEach((node, index) => {
      const y = 92 + (index * gap);
      points.set(node.key, { x: lane.x, y });
      height = Math.max(height, y + 72);
    });
  });
  return { points, height };
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

function buildExternalLocationGraph(rows = []) {
  const typeColors = ["#24d18f", "#4fb3ff", "#f0b429", "#e31937", "#9b7cff", "#63d7f6"];
  const groupsByType = new Map();
  const businessUnits = new Map();
  const environments = new Map();
  const externals = new Map();
  rows.forEach((row) => {
    const type = row.connectionType || "External connection";
    const externalKey = `external:${normaliseImportHeader(row.connectionName) || row.id}`;
    const environmentKey = getExternalEnvironmentKey(row);
    if (!groupsByType.has(type)) {
      groupsByType.set(type, {
        type,
        color: typeColors[groupsByType.size % typeColors.length],
        edges: [],
      });
    }
    businessUnits.set(row.businessUnitId || row.businessUnitName, row.businessUnitName);
    if (!externals.has(externalKey)) {
      externals.set(externalKey, {
        key: externalKey,
        label: row.connectionName,
        sublabel: row.connectionType,
      });
    }
    if (!environments.has(environmentKey)) {
      environments.set(environmentKey, {
        key: environmentKey,
        label: row.environmentLabel,
        sublabel: row.businessUnitName,
      });
    }
    groupsByType.get(type).edges.push({
      id: row.id,
      type,
      direction: normaliseExternalConnectionDirection(row.direction),
      rawDirection: row.direction || "",
      externalKey,
      environmentKey,
      external: externals.get(externalKey),
      environment: environments.get(environmentKey),
      sourceDocumentType: row.sourceDocumentType,
      validationStatus: row.validationStatus,
      evidenceText: row.evidenceText,
    });
  });
  return {
    businessUnits,
    environments,
    externals,
    edges: Array.from(groupsByType.values()).flatMap((group) => group.edges),
    groups: Array.from(groupsByType.values()).sort((a, b) => a.type.localeCompare(b.type)),
  };
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
