/* Reference extract: getBuTechReportModel(...) from app/src/app.js:22845-22892. */

function getBuTechReportModel(bu) {
  const saved = getBuTechReportSavedSections(bu.id);
  const controls = getBuTechReportSavedControls(bu.id);
  const sizing = getBuSizingAssessmentModel(bu);
  const adf = getAdfComplexityModel(bu);
  const rice = getRiceScoringModel(bu);
  const allScopeRows = getScopeRecordsForBu(bu);
  const scopeRows = allScopeRows.filter((row) => row.inScope !== false);
  const sourceConsumerRows = getSourceConsumerTrackerRowsForBu(bu);
  const techRows = getTechnologyScopeRowsForBu(bu);
  const openDecisionRows = getOpenDecisionRowsForBu(bu);
  const rationalisation = getEnvironmentRationalisationModel(bu);
  const architecture = getArchitectureProposalScopingModel(bu);
  const maturity = getMaturityAssessmentModel(bu);
  const externalRows = getExternalLocationRows(bu);
  const metadataReview = getMetadataReviewModel(bu);
  const cost = calculateCost(bu);
  const waf = getWafBaselineForBu(bu);
  const ucd = getUcdReportModel(bu);
  const sections = getBuTechReportSectionDefaults(bu, { sizing, adf, rice, scopeRows, allScopeRows, sourceConsumerRows, techRows, openDecisionRows, controls, rationalisation, architecture, maturity, externalRows, metadataReview, cost, waf, ucd })
    .map((section) => {
      const body = section.key === "environment-rationalisation" && rationalisation.hasSaved
        ? rationalisation.reportText
        : saved[section.key]?.body ?? getLegacyBuTechReportSectionBody(saved, section.key) ?? section.body;
      const notes = section.key === "environment-rationalisation" && rationalisation.hasSaved
        ? rationalisation.teamNotes
        : saved[section.key]?.notes ?? getLegacyBuTechReportSectionNotes(saved, section.key) ?? section.notes ?? "";
      return {
        ...section,
        task: section.task || BU_TECH_REPORT_REVIEW_TASKS[section.key] || { sectionKey: "bu-tech-report-input", label: "Report draft" },
        body,
        notes,
        supplement: section.key === "executive-summary"
          ? renderBuTechReportSummaryTable(bu, { sizing, rice, openDecisionRows, body })
          : section.supplement,
      };
    });
  return {
    kpis: [
      { label: "Migration complexity", value: `${sizing.complexityBand} (${sizing.complexityScore})`, note: "From BU sizing", href: documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id) },
      { label: "Migration volume", value: `${sizing.sizeBand} (${sizing.sizeScore})`, note: "From BU sizing", href: documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id) },
      { label: "ADF complexity", value: `${adf.totalBand} (${formatNumber(adf.totalComplexity)})`, note: "From ADF analysis", href: documentUrl("team-analysis", "adf-complexity-analysis", bu.id) },
      { label: "RICE", value: formatNumber(rice.riceScore), note: "From RICE scoring", href: documentUrl("team-analysis", "rice-scoring", bu.id) },
      { label: "WAF baseline", value: waf?.assessment ? `${waf.assessment.baseline_score ?? 0}/100` : "Not captured", note: "From WAF output", href: documentUrl("outputs", "waf-baseline-report", bu.id) },
    ],
    sections,
  };
}
