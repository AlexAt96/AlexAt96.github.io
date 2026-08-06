/* Reference extract: renderBuTechReportEvidenceLinks(...) from app/src/app.js:23397-23408. */

function renderBuTechReportEvidenceLinks(bu) {
  return `
    <div class="report-link-grid">
      ${[
        ["Evidence review", "team-analysis", "evidence-review"],
        ["BU follow-up notes", "team-analysis", "bu-follow-up-notes"],
        ["UCD Report", "ucd", "ucd-themes-by-bu"],
        ["Questionnaire", "bu-data-collection", "questionnaire-response"],
      ].map(([label, phaseKey, sectionKey]) => `<a class="section-link-card" href="${documentUrl(phaseKey, sectionKey, bu.id)}"><svg><use href="#icon-arrow"></use></svg><strong>${escapeHtml(label)}</strong><span>Open source page</span></a>`).join("")}
    </div>
  `;
}
