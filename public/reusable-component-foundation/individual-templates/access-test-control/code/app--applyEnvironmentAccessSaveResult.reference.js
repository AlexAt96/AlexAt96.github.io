/* Reference extract: applyEnvironmentAccessSaveResult(...) from app/src/app.js:40193-40202. */

function applyEnvironmentAccessSaveResult(businessUnitId, result = {}) {
  if (!serverWorkspace) return;
  if (Array.isArray(result.records)) {
    serverWorkspace.environment_access_confirmations = [
      ...(serverWorkspace.environment_access_confirmations || []).filter((row) => row.business_unit_id !== businessUnitId),
      ...result.records,
    ];
  }
  applyScreenStatusSaveResult(result);
}
