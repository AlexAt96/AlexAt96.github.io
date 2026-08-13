/* Reference extract: renderBuTechReportInput(...) from app/src/app.js:22817-22843. */

function renderBuTechReportInput(phase, item, bu = getSelectedBu()) {
  const model = getBuTechReportModel(bu);
  return `
    ${detailHeader("Review & Finalise BU Report", `Engagement Lead working screen for the ${bu.name} technical report.`)}
    <form id="buTechReportForm" class="bu-tech-report-form" data-business-unit-id="${escapeHtml(bu.id)}">
      <section class="panel bu-tech-report-intro">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Analysis task</p>
            <h3>Review & Finalise ${escapeHtml(bu.name)} BU Report</h3>
          </div>
          <button class="icon-button primary" type="submit">
            <svg><use href="#icon-save"></use></svg>
            <span>Save report draft</span>
          </button>
        </div>
        <p class="small-note" id="buTechReportStatus">Each section is pre-populated from the report template and discovery data where available. Review, edit, and finalise the narrative before saving.</p>
        <div class="bu-tech-report-kpis">
          ${model.kpis.map((kpi) => `<div><span>${escapeHtml(kpi.label)}</span><strong>${dataText(kpi.value, kpi.tooltip || kpi.note, kpi.href || "")}</strong><small>${escapeHtml(kpi.note)}</small></div>`).join("")}
        </div>
      </section>
      <section class="bu-tech-report-sections">
        ${model.sections.map((section, index) => renderBuTechReportInputSection(section, index)).join("")}
      </section>
    </form>
  `;
}
