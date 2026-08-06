/* Reference extract: getBuTechReportTaskUrl(...) from app/src/app.js:23107-23119. */

function getBuTechReportTaskUrl(sectionKey, businessUnitId) {
  if (sectionKey === "bu-tech-report-input") return "";
  if (sectionKey === "ucd-findings-sign-off") return withReturnToCurrentPage(`${phaseUrl("ucd", businessUnitId)}#ucd-summary-document`);
  if (["interview-summary-input", "ucd-themes-by-bu", "migration-posture-summary", "rice-confidence-score-input", "ucd-recommendation-input"].includes(sectionKey)) {
    return withReturnToCurrentPage(documentUrl("ucd", sectionKey, businessUnitId));
  }
  const href = sectionKey === "workspace-environment-scope"
    ? getInitiationDocumentUrl(sectionKey, businessUnitId)
    : ["indicative-cost-analysis-report", "outstanding-decisions-log", "waf-baseline-report"].includes(sectionKey)
      ? documentUrl("outputs", sectionKey, businessUnitId)
      : documentUrl("team-analysis", sectionKey, businessUnitId);
  return withReturnToCurrentPage(href);
}
