/* Reference extract: renderTechnologyMappingMetadataTable(...) from app/src/app.js:8046-8065. */

function renderTechnologyMappingMetadataTable() {
  return `
    ${renderTechnologyMappingPriorityTable()}
    ${renderExcelImportExportComponent({
      componentId: "technologyMappingExcel",
      title: "Technology mapping workbook",
      description: "Download the Excel template, edit the mapping rows, then upload it here before saving metadata.",
      columns: TECHNOLOGY_MAPPING_TEMPLATE_COLUMNS,
    })}
    ${renderEditDataTable({
      id: "technologyMappingRows",
      rowClass: "technology-mapping-row",
      tableClass: "metadata-edit-table technology-mapping-table",
      addButtonId: "technologyMappingRowsAddRow",
      addLabel: "Add mapping",
      columns: [...TECHNOLOGY_MAPPING_TEMPLATE_COLUMNS, ""],
      rows: getTechnologyMappingMetadataRows().map((row, index) => renderTechnologyMappingMetadataEditCells(row, index)),
    })}
  `;
}
