/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderToolMetadata() {
  const riceStatus = getProgrammeSectionStatus("tool-metadata-setup-rice", "not-started");
  const adfStatus = getProgrammeSectionStatus("tool-metadata-setup-adf", "not-started");
  const phaseStatusStatus = getProgrammeSectionStatus("tool-metadata-setup-status", "not-started");
  const techMappingStatus = getProgrammeSectionStatus("tool-metadata-setup-tech-mapping", "not-started");
  return `
    ${detailHeader("Tool metadata setup", "Metadata that drives calculations and status behaviour.")}
    <form id="toolMetadataForm" class="metadata-form">
      ${renderMetadataDisclosure({
        sectionKey: "tool-metadata-setup-rice",
        eyebrow: "RICE scoring",
        title: "RICE metric definitions",
        summary: "Fixed metric rows for Reach, Impact, Confidence, and calculated Effort.",
        meta: "4 fixed rows",
        status: riceStatus,
        content: renderRiceDefinitionsEditTable("toolRiceDefinitionRows"),
        saveButtonId: "saveToolRiceMetadata",
        saveLabel: "Save RICE definitions",
      })}
      ${renderMetadataDisclosure({
        sectionKey: "tool-metadata-setup-adf",
        eyebrow: "ADF metadata",
        title: "ADF activity complexity factors",
        summary: "Activity type factors used to calculate ADF migration complexity.",
        meta: `${getAdfActivityFactorRows().length} activity types`,
        status: adfStatus,
        content: renderAdfActivityFactorsEditTable(),
        saveButtonId: "saveToolAdfMetadata",
        saveLabel: "Save ADF metadata",
      })}
      ${renderMetadataDisclosure({
        sectionKey: "tool-metadata-setup-status",
        eyebrow: "Workflow metadata",
        title: "Phase status model",
        summary: "Default phase statuses preloaded when the project is created.",
        meta: `${getPhaseStatusModelRows().length} statuses`,
        status: phaseStatusStatus,
        content: renderPhaseStatusModelTable(),
        saveButtonId: "confirmToolStatusMetadata",
        saveLabel: "Confirm status model",
      })}
      ${renderMetadataDisclosure({
        sectionKey: "tool-metadata-setup-tech-mapping",
        eyebrow: "Tech mapping",
        title: "Technology mapping metadata",
        summary: "Function-level mapping across Azure, AWS, Databricks, and other tooling.",
        meta: `${getTechnologyMappingMetadataRows().filter((row) => hasTechnologyMappingMetadataContent(row)).length} mapping rows`,
        status: techMappingStatus,
        content: renderTechnologyMappingMetadataTable(),
        saveButtonId: "saveToolTechMappingMetadata",
        saveLabel: "Save tech mapping",
      })}
      <p class="small-note form-wide">Unknown ADF activity types should be added here with a complexity factor. DatabricksNotebook and DatabricksJob should remain at 0.</p>
      <div class="button-row form-wide">
        <button class="icon-button primary" type="submit">
          <svg><use href="#icon-save"></use></svg>
          <span>Save metadata setup</span>
        </button>
      </div>
    </form>
  `;
}

function renderMetadataDisclosure({ sectionKey, eyebrow, title, summary, meta, status, content, saveButtonId, saveLabel }) {
  return `
    <details class="metadata-section metadata-disclosure">
      <summary>
        <span class="disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
        <span class="disclosure-copy">
          <span class="eyebrow">${escapeHtml(eyebrow)}</span>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(summary)}</small>
        </span>
        <span class="disclosure-meta">
          <span class="status-pill ${statusClass(status)}">${escapeHtml(formatStatus(status))}</span>
          <span class="chip">${escapeHtml(meta)}</span>
        </span>
      </summary>
      <div class="metadata-disclosure-body">
        ${renderProgrammeScreenStatusControls(sectionKey, status)}
        ${content}
        <div class="button-row metadata-section-actions">
          <button class="icon-button primary metadata-section-save" id="${escapeHtml(saveButtonId)}" type="button">
            <svg><use href="#icon-save"></use></svg>
            <span>${escapeHtml(saveLabel)}</span>
          </button>
        </div>
      </div>
    </details>
  `;
}

function renderRiceDefinitionsEditTable(id) {
  const rows = getRiceMetricDefinitionRows();
  return `
    <div class="form-wide setup-table-field edit-data-component fixed-edit-data-component" data-component="fixed-rice-definition-table">
      <div class="field-label-row">
        <span>Fixed RICE metric definitions</span>
        <span class="small-note">Rows and owners are fixed. Effort is calculated and locked.</span>
      </div>
      <div class="data-table-wrap setup-bu-table-wrap">
        <table class="data-table setup-bu-table metadata-edit-table rice-definition-table">
          <thead><tr><th>Metric</th><th>Owner</th><th>Definition</th><th>Unit / measurement</th><th>Input source / logic</th></tr></thead>
          <tbody id="${escapeHtml(id)}">
            ${rows.map((row, index) => `<tr class="rice-definition-row ${row.locked ? "locked" : ""}">${renderRiceDefinitionEditCells(row, index)}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

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

function renderPhaseStatusModelTable() {
  const rows = getPhaseStatusModelRows();
  return `
    <div class="form-wide setup-table-field edit-data-component status-model-component" data-component="phase-status-model-table">
      <div class="field-label-row">
        <span>Phase workflow statuses</span>
        <button class="icon-button ghost" id="phaseStatusModelRowsAddRow" type="button">
          <svg><use href="#icon-arrow"></use></svg>
          <span>Add status</span>
        </button>
      </div>
      <div class="data-table-wrap setup-bu-table-wrap">
        <table class="data-table setup-bu-table metadata-edit-table phase-status-model-table">
          <thead><tr><th>Status</th><th>Reference key</th><th>Workflow role</th><th>Colour scheme</th><th>Preview</th><th></th></tr></thead>
          <tbody id="phaseStatusModelRows">
            ${rows.map((row, index) => `<tr class="phase-status-row">${renderPhaseStatusModelEditCells(row, index)}</tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="small-note">The preview uses the same status pill component as the phase task boards and status toggles.</p>
    </div>
  `;
}

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

async function saveToolMetadataSection({ button, endpoint, payload, sectionKey, currentStatus, errorPrefix }) {
  if (!SERVER_MODE) {
    showAppAlert("Run the local server to save tool metadata, then open http://127.0.0.1:4317/.");
    return;
  }
  if (button) button.disabled = true;
  try {
    await apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await markToolMetadataSectionInProgress(sectionKey, currentStatus);
    reloadApp();
  } catch (error) {
    showAppAlert(`${errorPrefix}: ${error.message || error}`);
  } finally {
    if (button) button.disabled = false;
  }
}
