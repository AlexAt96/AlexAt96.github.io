/* Reference extract: getScriptRunCommand(...) from app/src/app.js:9597-9602. */

function getScriptRunCommand(sectionKey) {
  if (sectionKey === "sizing-output") return "Import table-sizing-report.dbc into the production Databricks workspace, run the sizing notebook, then export the generated sizing output.";
  if (sectionKey === "adf-profile-output") return "Extract adf-profiler-main.zip, run the profiler against the production ADF estate, then collect the generated workbook/output.";
  if (sectionKey === "data-dictionary-output") return "Import generate_inventory_excel.dbc into the production Databricks workspace, run the inventory notebook, then export the generated data dictionary output.";
  return "Run the approved script and collect the generated output.";
}
