/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function getAdfPipelineStepFlows(lineage = {}) {
  const pipelineNames = new Set([
    ...(lineage.activities || []).map((row) => row.pipeline_name),
    ...(lineage.copyFlows || []).map((row) => row.pipeline_name),
    ...(lineage.databricksActivities || []).map((row) => row.pipeline_name),
  ].filter(Boolean));
  return [...pipelineNames].sort((a, b) => a.localeCompare(b)).map((pipelineName) => {
    const activities = (lineage.activities || []).filter((row) => row.pipeline_name === pipelineName);
    const environmentSource = activities[0]
      || (lineage.copyFlows || []).find((row) => row.pipeline_name === pipelineName)
      || (lineage.databricksActivities || []).find((row) => row.pipeline_name === pipelineName)
      || {};
    const activityNames = new Set(activities.map((row) => row.activity_name).filter(Boolean));
    (lineage.copyFlows || [])
      .filter((row) => row.pipeline_name === pipelineName && row.activity_name && !activityNames.has(row.activity_name))
      .forEach((row) => {
        activities.push({
          pipeline_name: pipelineName,
          activity_name: row.activity_name,
          activity_type: "Copy",
          linked_service: row.source_linked_service || row.sink_linked_service || "",
          ir_type: row.ir_type_used || "",
          source_file_name: row.source_file_name,
          depends_on_json: "[]",
        });
        activityNames.add(row.activity_name);
      });
    (lineage.databricksActivities || [])
      .filter((row) => row.pipeline_name === pipelineName && row.activity_name && !activityNames.has(row.activity_name))
      .forEach((row) => {
        activities.push({
          pipeline_name: pipelineName,
          activity_name: row.activity_name,
          activity_type: row.activity_type || "Databricks",
          linked_service: row.linked_service_name || "",
          ir_type: "",
          source_file_name: row.source_file_name,
          depends_on_json: "[]",
        });
        activityNames.add(row.activity_name);
      });
    const dependencies = (lineage.dependencies || []).filter((row) => row.pipeline_name === pipelineName);
    const ordered = orderAdfPipelineActivities(activities, dependencies);
    const levels = getAdfActivityDependencyLevels(ordered, dependencies);
    const laneCounters = new Map();
    return {
      pipelineName,
      environmentId: environmentSource.environment_id || "",
      workspaceId: environmentSource.workspace_id || "",
      environmentLabel: getEnvironmentLabel(environmentSource.environment_id, environmentSource.workspace_id),
      triggers: (lineage.triggers || []).filter((trigger) => parseAdfLineageListValue(trigger.pipelines_json).includes(pipelineName)),
      steps: ordered.map((activity) => {
        const level = levels.get(normaliseImportHeader(activity.activity_name)) || 0;
        const lane = laneCounters.get(level) || 0;
        laneCounters.set(level, lane + 1);
        return createAdfPipelineStep(activity, lineage, level, lane);
      }),
    };
  }).filter((flow) => flow.steps.length);
}

function orderAdfPipelineActivities(activities = [], dependencies = []) {
  const byName = new Map(activities.map((row, index) => [normaliseImportHeader(row.activity_name || `activity-${index}`), { ...row, __index: index }]));
  const incoming = new Map([...byName.keys()].map((key) => [key, new Set()]));
  const outgoing = new Map([...byName.keys()].map((key) => [key, new Set()]));
  dependencies.forEach((row) => {
    const from = normaliseImportHeader(row.depends_on_activity_name);
    const to = normaliseImportHeader(row.activity_name);
    if (!incoming.has(to) || !outgoing.has(from)) return;
    incoming.get(to).add(from);
    outgoing.get(from).add(to);
  });
  activities.forEach((row) => {
    const to = normaliseImportHeader(row.activity_name);
    parseAdfLineageListValue(row.depends_on_json).forEach((dependencyName) => {
      const from = normaliseImportHeader(dependencyName);
      if (!incoming.has(to) || !outgoing.has(from)) return;
      incoming.get(to).add(from);
      outgoing.get(from).add(to);
    });
  });
  const ready = [...incoming.entries()].filter(([, deps]) => deps.size === 0).map(([key]) => key);
  const result = [];
  while (ready.length) {
    const key = ready.sort((a, b) => (byName.get(a)?.__index || 0) - (byName.get(b)?.__index || 0)).shift();
    result.push(byName.get(key));
    (outgoing.get(key) || new Set()).forEach((next) => {
      incoming.get(next).delete(key);
      if (incoming.get(next).size === 0 && !result.some((row) => normaliseImportHeader(row.activity_name) === next) && !ready.includes(next)) ready.push(next);
    });
  }
  const emitted = new Set(result.map((row) => normaliseImportHeader(row.activity_name)));
  activities.forEach((row, index) => {
    if (!emitted.has(normaliseImportHeader(row.activity_name))) result.push({ ...row, __index: index });
  });
  return result;
}

function getAdfActivityDependencyLevels(activities = [], dependencies = []) {
  const names = new Set(activities.map((row) => normaliseImportHeader(row.activity_name)).filter(Boolean));
  const depsByTarget = new Map([...names].map((name) => [name, new Set()]));
  dependencies.forEach((row) => {
    const source = normaliseImportHeader(row.depends_on_activity_name);
    const target = normaliseImportHeader(row.activity_name);
    if (names.has(source) && names.has(target)) depsByTarget.get(target).add(source);
  });
  activities.forEach((row) => {
    const target = normaliseImportHeader(row.activity_name);
    parseAdfLineageListValue(row.depends_on_json).forEach((dependencyName) => {
      const source = normaliseImportHeader(dependencyName);
      if (names.has(source) && names.has(target)) depsByTarget.get(target).add(source);
    });
  });
  const levels = new Map();
  const resolve = (name, stack = new Set()) => {
    if (levels.has(name)) return levels.get(name);
    if (stack.has(name)) return 0;
    stack.add(name);
    const deps = [...(depsByTarget.get(name) || new Set())];
    const level = deps.length ? Math.max(...deps.map((dep) => resolve(dep, stack))) + 1 : 0;
    stack.delete(name);
    levels.set(name, level);
    return level;
  };
  names.forEach((name) => resolve(name));
  return levels;
}

function createAdfPipelineStep(activity = {}, lineage = {}, level = 0, branchLane = 0) {
  const copyFlows = (lineage.copyFlows || []).filter((row) =>
    row.pipeline_name === activity.pipeline_name &&
    normaliseImportHeader(row.activity_name) === normaliseImportHeader(activity.activity_name)
  );
  const databricks = findAdfDatabricksActivity(lineage.databricksActivities || [], activity);
  const sources = copyFlows.flatMap((row) => createAdfStepEndpoint(row.source_dataset, row.source_connector, row.source_linked_service, row.rows_read, "read"));
  const sinks = copyFlows.flatMap((row) => createAdfStepEndpoint(row.sink_dataset, row.sink_connector, row.sink_linked_service, row.rows_copied, "copied"));
  const dependsOn = [
    ...parseAdfLineageListValue(activity.depends_on_json),
    ...(lineage.dependencies || [])
      .filter((row) => row.pipeline_name === activity.pipeline_name && normaliseImportHeader(row.activity_name) === normaliseImportHeader(activity.activity_name))
      .map((row) => row.depends_on_activity_name),
  ].filter(Boolean);
  return {
    pipelineName: activity.pipeline_name || "",
    activityName: activity.activity_name || activity.activity_type || "Activity",
    activityType: activity.activity_type || "Activity",
    kind: getAdfActivityNodeKind(activity.activity_type),
    actionLabel: getAdfPipelineStepActionLabel(activity, copyFlows, databricks),
    linkedService: activity.linked_service || databricks?.linked_service_name || "",
    irType: activity.ir_type || copyFlows.find((row) => row.ir_type_used)?.ir_type_used || "",
    sourceFile: activity.source_file_name || databricks?.source_file_name || "",
    targetPipeline: activity.target_pipeline || "",
    level,
    branchLane,
    dependsOn: [...new Set(dependsOn)],
    sources,
    sinks,
    databricks: databricks ? {
      target: databricks.notebook_path || (databricks.job_id ? `Job ${databricks.job_id}` : databricks.linked_service_name || "Databricks target"),
      compute: databricks.compute_type_inferred,
      cluster: databricks.existing_cluster_id || databricks.instance_pool_id || databricks.new_cluster_version,
    } : null,
  };
}

function renderAdfPipelineStepExplorer(lineage = {}) {
  const flows = lineage.pipelineFlows || [];
  if (!flows.length) {
    return `<div class="empty-state compact"><strong>No pipeline steps yet.</strong><span>Upload detailed ADF profiler output to show trigger, activity, read, write, and Databricks notebook steps.</span></div>`;
  }
  const selectedPipeline = getSelectedAdfPipelineFlow(flows);
  return `
    <div class="adf-pipeline-step-shell">
      ${renderAdfPipelineSelector(flows, selectedPipeline)}
      ${renderAdfPipelineStory(selectedPipeline, flows)}
    </div>
  `;
}

function renderAdfPipelineSelector(flows = [], selectedPipeline = flows[0]) {
  return `
    <div class="adf-pipeline-selector-row">
      <label>
        <span>Pipeline</span>
        <select class="adf-pipeline-selector" aria-label="Select ADF pipeline">
          ${flows.map((flow) => `<option value="${escapeHtml(flow.pipelineName)}"${flow === selectedPipeline ? " selected" : ""}>${escapeHtml(flow.pipelineName)}</option>`).join("")}
        </select>
      </label>
      <div class="adf-pipeline-selector-metrics">
        <span>${formatNumber(flows.length)} pipeline${flows.length === 1 ? "" : "s"}</span>
        <span>${formatNumber(selectedPipeline?.steps?.length || 0)} visible step${selectedPipeline?.steps?.length === 1 ? "" : "s"}</span>
      </div>
    </div>
  `;
}

function renderAdfPipelineStory(pipeline, flows = []) {
  if (!pipeline) return "";
  const stepGroups = getAdfPipelineStepLevelGroups(pipeline.steps);
  const maxParallel = Math.max(1, ...stepGroups.map((steps) => steps.length));
  const triggerLabel = pipeline.triggers.length ? pipeline.triggers.map((trigger) => trigger.trigger_name).join(", ") : "Manual or upstream start";
  const triggerDetail = pipeline.triggers.length ? pipeline.triggers.map((trigger) => trigger.trigger_type || trigger.runtime_state).filter(Boolean).join(" / ") : "No trigger row exported for this pipeline.";
  let stepCounter = 0;
  const callCount = pipeline.steps.filter((step) => step.targetPipeline).length;
  return `
    <article class="adf-pipeline-story is-primary">
      <header>
        <div>
          <p class="eyebrow">Pipeline branch graph</p>
          <h4>${escapeHtml(pipeline.pipelineName)}</h4>
        </div>
        <span class="chip">${formatNumber(pipeline.steps.length)} step${pipeline.steps.length === 1 ? "" : "s"}${callCount ? ` / ${formatNumber(callCount)} ADF call${callCount === 1 ? "" : "s"}` : ""}</span>
      </header>
      <div class="adf-pipeline-graph-shell">
        <section class="adf-pipeline-graph-main">
          <div class="adf-pipeline-graph-head">
            <span>Graph</span>
            <span>Activity</span>
            <span>Action</span>
            <span>I/O</span>
            <span>Depends</span>
            <span>Runtime</span>
          </div>
          <div class="adf-pipeline-start" style="--max-parallel:${maxParallel};">
            <span class="adf-git-lane adf-git-lane-start" aria-hidden="true">
              ${renderAdfPipelineLaneSvg(0, { parallelCount: 1, nextParallelCount: stepGroups[0]?.length || 1 })}
              <b>Start</b>
            </span>
            <span class="adf-row-message">
              <strong>${escapeHtml(triggerLabel)}</strong>
              <small>${escapeHtml(triggerDetail)}</small>
            </span>
            <span class="adf-row-chip">Trigger</span>
            <span class="adf-row-io"><b>${formatNumber(pipeline.steps.length)} ${pipeline.steps.length === 1 ? "activity" : "activities"}</b></span>
            <span class="adf-row-deps">Entry point</span>
            <span class="adf-row-runtime">${escapeHtml(pipeline.triggers.length ? "ADF trigger export" : "Not exported")}</span>
          </div>
          <ol class="adf-pipeline-step-list" style="--max-parallel:${maxParallel};">
            ${stepGroups.map((steps, levelIndex) => `
              <li class="adf-pipeline-level ${steps.length > 1 ? "is-parallel-level" : "is-linear-level"}" data-level="${levelIndex}" data-parallel-count="${steps.length}" style="--parallel-count:${steps.length}; --parallel-width:${Math.min(56, Math.max(20, (steps.length - 1) * 18 + 20))}px;">
                <div class="adf-pipeline-level-label">
                  <span>${levelIndex + 1}</span>
                  <strong>${steps.length > 1 ? "Parallel" : "Step"}</strong>
                </div>
                <div class="adf-pipeline-level-steps">
                  ${steps.map((step) => {
                    const rowIndex = stepCounter++;
                    return renderAdfPipelineStep(step, rowIndex, {
                      isLast: rowIndex === pipeline.steps.length - 1,
                      parallelCount: steps.length,
                      previousParallelCount: stepGroups[levelIndex - 1]?.length || 1,
                      nextParallelCount: stepGroups[levelIndex + 1]?.length || 1,
                    });
                  }).join("")}
                </div>
              </li>
            `).join("")}
          </ol>
        </section>
      </div>
    </article>
  `;
}

function renderAdfPipelineStep(step, index, options = {}) {
  const readCount = step.sources?.length || 0;
  const writeCount = (step.sinks?.length || 0) + (step.targetPipeline ? 1 : 0);
  const branchLane = Math.max(0, Number(step.branchLane || 0));
  const parallelCount = Math.max(1, Number(options.parallelCount || 1));
  const laneOffset = branchLane * 18;
  const touchpointKey = getAdfPipelineActivityNodeKey(step);
  const rowClasses = [
    "adf-pipeline-step",
    `is-${step.kind}`,
    parallelCount > 1 ? "is-parallel-row" : "",
    branchLane > 0 ? "is-branch-lane" : "is-main-lane",
    options.isLast ? "is-final-step" : "",
  ].filter(Boolean).join(" ");
  return `
    <details class="${escapeHtml(rowClasses)}" data-page-state-disabled="true" data-level="${Number(step.level || 0)}" data-branch-lane="${branchLane}" data-parallel-count="${parallelCount}" style="--branch-lane:${branchLane}; --branch-offset:${laneOffset}px; --parallel-count:${parallelCount}; --dependency-level:${Number(step.level || 0)};">
      <summary class="adf-pipeline-row-summary">
        <span class="adf-git-lane" aria-hidden="true">
          ${renderAdfPipelineLaneSvg(branchLane, { ...options, parallelCount })}
          <b>${index + 1}</b>
        </span>
        <span class="adf-row-message">
          <strong>${escapeHtml(step.activityName)}</strong>
          <small>${escapeHtml(step.activityType)}${step.targetPipeline ? ` / calls ${escapeHtml(step.targetPipeline)}` : ""}</small>
        </span>
        <span class="adf-row-action-cell">
          <span class="adf-row-chip">${escapeHtml(step.actionLabel)}</span>
          <button class="icon-only ghost compact adf-open-touchpoint-node" type="button" data-open-adf-lineage-explorer="true" data-adf-focus-key="${escapeHtml(touchpointKey)}" title="Open this activity in ADF Touchpoint Explorer" aria-label="Open ${escapeHtml(step.activityName)} in ADF Touchpoint Explorer">
            <svg><use href="#icon-arrow"></use></svg>
          </button>
        </span>
        <span class="adf-row-io">
          <b>${formatNumber(readCount)} read${readCount === 1 ? "" : "s"}</b>
          <b>${formatNumber(writeCount)} write${writeCount === 1 ? "" : "s"}</b>
        </span>
        <span class="adf-row-deps">${escapeHtml(step.dependsOn.length ? step.dependsOn.join(", ") : "Start / previous level")}</span>
        <span class="adf-row-runtime">${escapeHtml([step.linkedService, step.irType].filter(Boolean).join(" / ") || "Not exported")}</span>
      </summary>
      <div class="adf-pipeline-row-detail">
        ${renderAdfPipelineDetailLaneSvg(branchLane, { ...options, parallelCount })}
        ${renderAdfStepDetailBranchMap(step)}
      </div>
    </details>
  `;
}

function renderAdfPipelineLaneSvg(branchLane = 0, options = {}) {
  const laneColors = ["#0ea5e9", "#24d18f", "#ff1744", "#00d9ff", "#f59e0b", "#ec4899"];
  const mainX = 34;
  const laneGap = 18;
  const laneX = mainX + (branchLane * laneGap);
  const height = 34;
  const dotY = 17;
  const parallelCount = Math.max(1, Number(options.parallelCount || 1));
  const previousParallelCount = Math.max(1, Number(options.previousParallelCount || 1));
  const nextParallelCount = Math.max(1, Number(options.nextParallelCount || 1));
  const branchColor = laneColors[branchLane] || laneColors[laneColors.length - 1];
  const bleed = 5;
  const topY = -bleed;
  const bottomY = height + bleed;
  const mainBottomY = options.isLast ? dotY : bottomY;
  const paths = [
    `<path class="lane-line main-line" d="M ${mainX} ${topY} L ${mainX} ${mainBottomY}" style="--lane-color:${laneColors[0]}"></path>`,
  ];
  if (parallelCount > 1) {
    for (let lane = 1; lane < parallelCount; lane += 1) {
      const x = mainX + (lane * laneGap);
      const color = laneColors[lane] || laneColors[laneColors.length - 1];
      paths.push(`<path class="lane-line branch-line" d="M ${x} ${topY} L ${x} ${bottomY}" style="--lane-color:${color}"></path>`);
    }
  }
  if (previousParallelCount > 1 && parallelCount === 1 && branchLane === 0) {
    for (let lane = 1; lane < previousParallelCount; lane += 1) {
      const x = mainX + (lane * laneGap);
      const color = laneColors[lane] || laneColors[laneColors.length - 1];
      paths.push(`<path class="lane-line branch-line" d="M ${x} ${topY} L ${x} 2 C ${x} ${dotY - 6}, ${mainX} ${dotY - 6}, ${mainX} ${dotY}" style="--lane-color:${color}"></path>`);
    }
  }
  if (nextParallelCount > 1 && parallelCount === 1) {
    for (let lane = 1; lane < nextParallelCount; lane += 1) {
      const x = mainX + (lane * laneGap);
      const color = laneColors[lane] || laneColors[laneColors.length - 1];
      paths.push(`<path class="lane-line split-curve" d="M ${mainX} ${dotY} C ${mainX} ${dotY + 11}, ${x} ${dotY + 11}, ${x} ${height - 2} L ${x} ${bottomY}" style="--lane-color:${color}"></path>`);
    }
  }
  return `
    <svg class="adf-git-lane-svg" viewBox="0 0 116 ${height}" preserveAspectRatio="none" focusable="false">
      ${paths.join("")}
      <circle class="lane-dot" cx="${laneX}" cy="${dotY}" r="5.2" style="--lane-color:${branchColor}"></circle>
    </svg>
  `;
}

function renderAdfStepDetailBranchMap(step) {
  const nodes = [
    renderAdfStepDetailNode("Reads from", step.sources?.length ? step.sources.map((endpoint) => [endpoint.name, endpoint.detail]) : [["No exported source", "No source dataset was exported for this activity."]], "read"),
    renderAdfStepDetailNode("Writes to", step.sinks?.length ? step.sinks.map((endpoint) => [endpoint.name, endpoint.detail]) : [["No exported sink", "No sink dataset was exported for this activity."]], "write"),
    step.targetPipeline ? renderAdfStepDetailNode("ADF pipeline call", [[step.targetPipeline, "Called from this activity"]], "call") : "",
    renderAdfStepDetailNode("Databricks / compute", step.databricks ? [
      [step.databricks.target, step.databricks.compute || "Compute not captured"],
      [step.databricks.cluster || "Cluster detail not captured", "Databricks target"],
    ] : [["No Databricks hint", "No Databricks activity hint exported for this step."]], "compute"),
    renderAdfStepDetailNode("Activity detail", [
      [step.linkedService || "No linked service captured", step.irType || "IR not captured"],
      [step.sourceFile || "ADF profiler output", "Profiler evidence"],
    ], "meta"),
  ].filter(Boolean);
  return `
    <div class="adf-step-detail-branch-map" aria-label="${escapeHtml(step.activityName)} expanded lineage nodes">
      ${nodes.join("")}
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

function renderBuAdfComplexityCharts(bu, model = getAdfComplexityModel(bu)) {
  const environmentRows = (model.selectedRows || []).map((row, index) => ({
    label: row.environmentName || row.workspaceName || `Environment ${index + 1}`,
    value: row.summary?.complexityScore || 0,
    detail: `${formatNumber(row.summary?.activityCount || 0)} activities / ${row.summary?.band || "Not banded"}`,
    color: getReportChartColor(index),
  }));
  const activityTypeRows = getAdfActivityTypeRows(getSelectedAdfActivityRows(model));
  return `
    <div class="report-visual-board adf-report-visual-board">
      ${renderReportPieVisual({
        eyebrow: "Complexity share",
        title: `${bu.name} ADF complexity by environment`,
        rows: environmentRows,
        totalLabel: "Complexity",
        emptyMessage: "No selected ADF environments are available for charting.",
      })}
      ${renderReportPieVisual({
        eyebrow: "Activity type",
        title: "ADF activity complexity by type",
        rows: activityTypeRows,
        totalLabel: "Complexity",
        variant: "feature",
        emptyMessage: "No parsed ADF activity types are available for charting.",
      })}
    </div>
  `;
}
