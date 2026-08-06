/* Reference extract: getAdfLineageCaveats(...) from app/src/app.js:12794-12799. */

function getAdfLineageCaveats(lineage = {}) {
  const caveats = ["Discovery-level lineage only: notebook bodies, stored procedure SQL, and dynamic runtime expressions are not inspected by the current exports."];
  if (!lineage.activities?.length) caveats.push("Detailed activity rows are missing, so the map falls back to activity-count evidence.");
  if (!lineage.tableReferences?.length && !lineage.databases?.length) caveats.push("Database and table interactions require database_instances.csv and table_discovery.csv from the ADF profiler pack.");
  return caveats;
}
