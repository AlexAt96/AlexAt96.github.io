/* Reference extract: renderBuTechReportClientReport(...) from app/src/app.js:26707-26745. */

function renderBuTechReportClientReport(bu, model) {
  return `
    <section class="client-report-shell bu-tech-client-report" aria-label="${escapeHtml(bu.name)} technical discovery report">
      <header class="client-report-cover">
        <div>
          <p class="eyebrow">Databricks migration discovery</p>
          <h1>${escapeHtml(bu.name)} Technical Discovery Report</h1>
          <p>Client-facing summary of the discovery findings, migration proposal, technical analysis outputs, architecture evidence, dependencies and proposed rationalisation approach.</p>
        </div>
        <dl class="client-report-meta">
          <div><dt>Business unit</dt><dd>${escapeHtml(bu.name)}</dd></div>
          <div><dt>BU lead</dt><dd>${escapeHtml(bu.lead || "Not recorded")}</dd></div>
          <div><dt>Recommendation</dt><dd>${escapeHtml(bu.recommendation || "Assess")}</dd></div>
          <div><dt>Generated</dt><dd>${escapeHtml(new Date().toLocaleDateString("en-GB"))}</dd></div>
        </dl>
      </header>
      <section class="client-report-kpis" aria-label="Report key metrics">
        ${model.kpis.map((kpi) => `
          <div>
            <span>${escapeHtml(kpi.label)}</span>
            <strong>${escapeHtml(stripHtml(kpi.value))}</strong>
            <small>${escapeHtml(kpi.note || "")}</small>
          </div>
        `).join("")}
      </section>
      <nav class="client-report-toc" aria-label="Report sections">
        <h2>Report Sections</h2>
        <ol>
          ${model.sections.map((section, index) => `
            <li><a href="#report-section-${escapeHtml(section.key)}"><span>${index + 1}</span>${escapeHtml(section.title)}</a></li>
          `).join("")}
        </ol>
      </nav>
      <section class="client-report-sections">
        ${model.sections.map((section, index) => renderBuTechReportClientSection(section, index)).join("")}
      </section>
    </section>
  `;
}
