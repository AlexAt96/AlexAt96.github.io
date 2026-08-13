/* Reference extract: getEnvironmentRationalisationModel(...) from app/src/app.js:21918-21965. */

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
