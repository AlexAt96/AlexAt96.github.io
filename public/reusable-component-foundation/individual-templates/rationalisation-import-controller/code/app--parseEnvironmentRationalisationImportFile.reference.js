/* Reference extract: parseEnvironmentRationalisationImportFile(...) from app/src/app.js:40573-40575. */

async function parseEnvironmentRationalisationImportFile(file) {
  return tableRowsToEnvironmentRationalisationRows(await parseImportTableRowsFromFile(file));
}
