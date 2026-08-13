/* Reference extract: buildAdfPipelineTouchpointGraph(...) from app/src/app.js:12498-12601. */

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
