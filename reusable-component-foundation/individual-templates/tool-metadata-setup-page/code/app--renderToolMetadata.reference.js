/* Reference extract: renderToolMetadata(...) from app/src/app.js:7651-7712. */

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
