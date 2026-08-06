/* Reference extract: renderEnvironmentTaskList(...) from app/src/app.js:9024-9033. */

function renderEnvironmentTaskList(phase, item, bu = getSelectedBu()) {
  return `
    ${detailHeader("Environment-specific task list", "Each required script is run on the relevant Databricks instance or environment.")}
    ${table(
      ["BU", "Environment", "Sizing", "Terraform and DBx metadata", "ADF profile", "Data dictionary"],
      getContextBusinessUnits(bu).flatMap((rowBu) => rowBu.environments.map((env) => [rowBu.name, env, "Uploaded", "Uploaded", env.includes("dev") ? "Draft" : "Uploaded", "Not started"])),
      "Environment task status.",
    )}
  `;
}
