/* Reference extract: renderBuTechReport(...) from app/src/app.js:24728-24762. */

function renderBuTechReport() {
  const bu = getBusinessUnit(queryParam("bu")) || businessUnits[0];
  const model = getBuTechReportModel(bu);
  const reportData = getBuTechMarkdownReportData(bu, model);
  const activeTab = getBuTechReportActiveTab();
  const printHref = appendDocumentViewParams(documentUrl("outputs", "bu-tech-report", bu.id), {
    readonly: "true",
    fullReport: queryParam("fullReport") || "true",
    returnBu: queryParam("returnBu") || bu.id,
    returnTo: queryParam("returnTo") || documentUrl("outputs", "per-bu-outputs", bu.id),
    print: "true",
  });
  return `
    ${detailHeader(`${bu.name} technical discovery report`, "Client-ready discovery output report with all generated tables, diagrams and analysis sections.")}
    ${renderBuTechReportTabs(bu, activeTab)}
    <div class="client-report-actions markdown-report-actions">
      ${activeTab === "slides" ? `
        <button class="icon-button primary download-powerpoint-report" type="button" data-business-unit-id="${escapeHtml(bu.id)}">
          <svg><use href="#icon-download"></use></svg>
          <span>Export slides</span>
        </button>
      ` : `
        <a class="icon-button primary report-export-action" href="${escapeHtml(printHref)}" target="_blank" rel="noopener">
          <svg><use href="#icon-download"></use></svg>
          <span>Export full report</span>
        </a>
        <button class="icon-button ghost download-markdown-report" type="button" data-business-unit-id="${escapeHtml(bu.id)}">
          <svg><use href="#icon-file"></use></svg>
          <span>Download Markdown</span>
        </button>
      `}
    </div>
    ${activeTab === "slides" ? renderBuTechPowerPointPreview(bu, reportData) : renderBuTechMarkdownReport(bu, reportData)}
  `;
}
