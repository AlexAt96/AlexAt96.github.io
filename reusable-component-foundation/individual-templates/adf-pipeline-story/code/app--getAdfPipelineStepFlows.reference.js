/* Reference extract: getAdfPipelineStepFlows(...) from app/src/app.js:11781-11840. */

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
