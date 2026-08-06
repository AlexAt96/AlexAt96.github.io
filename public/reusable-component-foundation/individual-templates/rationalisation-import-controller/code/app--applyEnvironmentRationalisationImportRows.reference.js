/* Reference extract: applyEnvironmentRationalisationImportRows(...) from app/src/app.js:36850-36873. */

function applyEnvironmentRationalisationImportRows(form, importedRows) {
  const environmentOptions = getProposedTopologyEnvironmentOptionsFromForm(form);
  const byRowKey = new Map(importedRows.filter((row) => row.rowKey).map((row) => [row.rowKey, row]));
  const bySource = new Map(importedRows.map((row) => [
    normaliseKey([row.subscriptionName, row.resourceName, row.discoveryEnvironment].join("-")),
    row,
  ]));
  let updated = 0;
  form.querySelectorAll("[data-rationalisation-row-key]").forEach((tableRow) => {
    const rowKey = tableRow.dataset.rationalisationRowKey || "";
    const sourceKey = normaliseKey([tableRow.dataset.subscriptionName || "", tableRow.dataset.resourceName || "", tableRow.dataset.discoveryEnvironment || ""].join("-"));
    const imported = byRowKey.get(rowKey) || bySource.get(sourceKey);
    if (!imported) return;
    const action = form.elements[`migrationAction:${rowKey}`];
    if (action) action.value = normaliseEnvironmentRationalisationAction(imported.migrationAction);
    const target = form.elements[`targetEnvironment:${rowKey}`];
    if (target) {
      target.innerHTML = renderTargetEnvironmentOptions(environmentOptions, imported.targetEnvironment || "Team to populate");
      target.value = imported.targetEnvironment || "Team to populate";
    }
    updated += 1;
  });
  return updated;
}
