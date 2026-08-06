/* Reference extract: createAdfPipelineStep(...) from app/src/app.js:11909-11944. */

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
