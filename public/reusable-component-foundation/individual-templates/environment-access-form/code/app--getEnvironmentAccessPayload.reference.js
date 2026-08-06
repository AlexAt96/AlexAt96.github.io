/* Reference extract: getEnvironmentAccessPayload(...) from app/src/app.js:40217-40228. */

function getEnvironmentAccessPayload(form, status) {
  return {
    status,
    teamAccessConfirmed: form.querySelector('input[name="teamAccessConfirmed"]')?.checked === true,
    environments: Array.from(form.querySelectorAll(".access-confirmation-table tbody tr")).map((row) => ({
      environmentId: row.dataset.environmentId || "",
      workspaceId: row.dataset.workspaceId || "",
      databricksAccess: row.querySelector('input[name="databricksAccess"]')?.checked === true,
      azureAccess: row.querySelector('input[name="azureAccess"]')?.checked === true,
    })),
  };
}
