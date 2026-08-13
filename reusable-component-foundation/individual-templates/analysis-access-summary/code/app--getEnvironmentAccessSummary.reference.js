/* Reference extract: getEnvironmentAccessSummary(...) from app/src/app.js:8352-8368. */

function getEnvironmentAccessSummary(bu, env) {
  const access = getEnvironmentAccessConfirmationForRow(bu.id, env);
  const databricksConfirmed = access.databricks_access_confirmed === true;
  const azureConfirmed = access.azure_access_confirmed === true;
  const accessTest = getEnvironmentAccessTestSummary(access);
  const teamMembers = getDiscoveryTeamMembers().map((member) => member.name).join(", ") || "Discovery team";
  return {
    databricksLabel: databricksConfirmed ? "Access confirmed" : "Not confirmed",
    databricksScheme: databricksConfirmed ? "success" : "neutral",
    azureLabel: azureConfirmed ? "Access confirmed" : "Not confirmed",
    azureScheme: azureConfirmed ? "success" : "neutral",
    testLabel: accessTest.label,
    testScheme: accessTest.scheme,
    testedMeta: accessTest.meta,
    teamMembers,
  };
}
