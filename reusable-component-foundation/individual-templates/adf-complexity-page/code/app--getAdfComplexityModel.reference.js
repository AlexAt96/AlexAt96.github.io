/* Reference extract: getAdfComplexityModel(...) from app/src/app.js:11498-11541. */

function getAdfComplexityModel(bu) {
  const savedScope = (serverWorkspace?.adf_complexity_environment_scope || []).filter((row) => row.business_unit_id === bu.id);
  const hasSavedScope = savedScope.length > 0;
  const scopeRows = getScopeRecordsForBu(bu)
    .filter((row) => row.inScope !== false)
    .map((row) => {
      const saved = savedScope.find((scope) =>
        (row.environmentId && scope.environment_id === row.environmentId) ||
        (row.workspaceId && scope.workspace_id === row.workspaceId)
      );
      const productionLike = isAdfProductionCandidate(row);
      return {
        ...row,
        productionLike,
        selected: hasSavedScope ? saved?.include_in_production_summary === true : productionLike,
        summary: getAdfEnvironmentSummary(bu, row),
      };
    });
  const selectedRows = scopeRows.filter((row) => row.selected);
  const activityRows = getAdfActivityRowsForBu(bu);
  const totalPipelines = selectedRows.reduce((total, row) => total + row.summary.pipelineCount, 0);
  const totalActivities = selectedRows.reduce((total, row) => total + row.summary.activityCount, 0);
  const totalComplexity = selectedRows.reduce((total, row) => total + row.summary.complexityScore, 0);
  return {
    scopeRows,
    selectedRows,
    activityRows,
    lineage: getAdfLineageModel(bu),
    totalPipelines,
    totalActivities,
    totalComplexity,
    totalBand: getAdfBand(totalComplexity),
  };
}

const ADF_LINEAGE_NODE_LIMIT = 64;

const ADF_LINEAGE_LANES = [
  { key: "trigger", label: "Triggers", x: 115 },
  { key: "pipeline", label: "Pipelines", x: 315 },
  { key: "activity", label: "Activities", x: 535 },
  { key: "service", label: "Datasets / services", x: 770 },
  { key: "data", label: "Databases / tables", x: 1005 },
];
