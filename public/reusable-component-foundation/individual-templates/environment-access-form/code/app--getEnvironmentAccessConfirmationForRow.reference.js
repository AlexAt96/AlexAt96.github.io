/* Reference extract: getEnvironmentAccessConfirmationForRow(...) from app/src/app.js:8427-8441. */

function getEnvironmentAccessConfirmationForRow(businessUnitId, env) {
  const confirmations = (serverWorkspace?.environment_access_confirmations || [])
    .filter((row) => row.business_unit_id === businessUnitId);
  if (env.workspaceId) {
    const workspaceMatch = confirmations.find((row) => row.workspace_id === env.workspaceId);
    if (workspaceMatch) return workspaceMatch;
  }
  if (env.environmentId) {
    const environmentOnlyMatch = confirmations.find((row) =>
      row.environment_id === env.environmentId && (!env.workspaceId || !row.workspace_id)
    );
    if (environmentOnlyMatch) return environmentOnlyMatch;
  }
  return {};
}
