/* Reference extract: renderAdfActivityFactorsEditTable(...) from app/src/app.js:7969-7979. */

function renderAdfActivityFactorsEditTable() {
  return renderEditDataTable({
    id: "adfActivityFactorRows",
    rowClass: "adf-factor-row",
    tableClass: "metadata-edit-table adf-factor-table",
    addButtonId: "addAdfFactorRow",
    addLabel: "Add activity type",
    columns: ["Activity type", "Complexity factor", ""],
    rows: getAdfActivityFactorRows().map((row, index) => renderAdfActivityFactorEditCells(row, index)),
  });
}
