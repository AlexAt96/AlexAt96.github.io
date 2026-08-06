/* Reference extract: renderTechnologyMappingPriorityTable(...) from app/src/app.js:8067-8077. */

function renderTechnologyMappingPriorityTable() {
  return renderEditDataTable({
    id: "technologyMappingPriorityRows",
    rowClass: "technology-mapping-priority-row",
    tableClass: "metadata-edit-table technology-mapping-priority-table",
    addButtonId: "technologyMappingPriorityRowsAddRow",
    addLabel: "Add priority",
    columns: ["From stack", "Suggested stack", "Priority", "Role", ""],
    rows: getTechnologyMappingPriorityRows().map((row, index) => renderTechnologyMappingPriorityEditCells(row, index)),
  });
}
