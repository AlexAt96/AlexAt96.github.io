/* Reference extract: getAdfLineageModel(...) from app/src/app.js:11543-11770. */

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
