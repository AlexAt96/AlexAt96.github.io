/* Reference extract: renderBuTechReportSectionEditableContent(...) from app/src/app.js:23131-23170. */

function renderBuTechReportSectionEditableContent(section, bodyId) {
  if (section.key === "executive-summary") {
    return renderBuTechReportExecutiveSummaryEditor(section);
  }
  if (section.layout === "data-commentary" || section.layout === "full-width-data-commentary" || section.layout === "sizing" || section.layout === "statistics") {
    const fullWidthClass = section.layout === "full-width-data-commentary" ? " full-width" : "";
    return `
      <div class="bu-tech-report-data-commentary-layout${fullWidthClass}">
        <div class="bu-tech-report-data-pane">${section.supplement || ""}</div>
        <label class="bu-tech-report-commentary-box">
          <span class="field-label">Engagement Lead commentary</span>
          <textarea id="${escapeHtml(bodyId)}" name="section:${escapeHtml(section.key)}:body">${escapeHtml(section.body || "")}</textarea>
        </label>
      </div>
      ${section.notesEnabled === false ? "" : `
        <label>
          <span class="field-label">Team notes</span>
          <textarea name="section:${escapeHtml(section.key)}:notes" placeholder="Optional working notes, caveats, or actions for this section.">${escapeHtml(section.notes || "")}</textarea>
        </label>
      `}
      ${section.links || ""}
    `;
  }
  return `
    ${section.editableBody === false ? "" : `
      <label>
        <span class="field-label">Editable report text</span>
        <textarea id="${escapeHtml(bodyId)}" name="section:${escapeHtml(section.key)}:body">${escapeHtml(section.body || "")}</textarea>
      </label>
    `}
    ${section.supplement || ""}
    ${section.links || ""}
    ${section.notesEnabled === false ? "" : `
      <label>
        <span class="field-label">Team notes</span>
        <textarea name="section:${escapeHtml(section.key)}:notes" placeholder="Optional working notes, caveats, or actions for this section.">${escapeHtml(section.notes || "")}</textarea>
      </label>
    `}
  `;
}
