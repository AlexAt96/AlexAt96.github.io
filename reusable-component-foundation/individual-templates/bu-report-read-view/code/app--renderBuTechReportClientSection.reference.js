/* Reference extract: renderBuTechReportClientSection(...) from app/src/app.js:26747-26758. */

function renderBuTechReportClientSection(section, index) {
  return `
    <article class="client-report-section" id="report-section-${escapeHtml(section.key)}">
      <header>
        <p class="eyebrow">Section ${index + 1}</p>
        <h2>${escapeHtml(section.title)}</h2>
      </header>
      ${renderClientReportBody(section.body)}
      ${section.supplement ? `<div class="client-report-supplement">${section.supplement}</div>` : ""}
    </article>
  `;
}
