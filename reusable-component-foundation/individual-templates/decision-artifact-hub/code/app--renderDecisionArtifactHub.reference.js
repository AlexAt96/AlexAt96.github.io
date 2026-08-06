/* Reference extract: renderDecisionArtifactHub(...) from app/src/app.js:27925-27975. */

function renderDecisionArtifactHub(models = getDecisionBuModels()) {
  const crossBuActions = [
    ["Cross BU report", "decision.html"],
    ["RICE sequencing", documentUrl("outputs", "rice-score-report")],
    ["Cost analysis", documentUrl("outputs", "indicative-cost-analysis-report")],
    ["DBU distribution", documentUrl("outputs", "databricks-resource-distribution-report")],
  ];
  return `
    <section class="panel decision-artifact-hub" id="decision-artifacts">
      ${detailHeader("Business unit artifacts", "Executive entry points first, with the full supporting artifact table underneath.")}
      <nav class="decision-artifact-tabs" aria-label="Artifact groups">
        <a href="#decision-artifact-slides">Report slides</a>
        <a href="#decision-artifact-written">Written reports</a>
        <a href="#decision-artifact-cross-bu">Cross BU outputs</a>
        <a href="#decision-artifact-detail">Detail table</a>
      </nav>
      <div class="decision-artifact-tab-grid">
        <article id="decision-artifact-slides" class="decision-artifact-tab-panel">
          <div>
            <p class="eyebrow">Slides</p>
            <h4>Report slides</h4>
          </div>
          <div class="decision-artifact-button-grid">
            ${models.map(({ bu }) => `<a class="icon-button ghost" href="${documentUrl("outputs", "bu-tech-report", bu.id)}#ppt-slide-cover"><svg><use href="#icon-file"></use></svg><span>${escapeHtml(bu.name)}</span></a>`).join("")}
          </div>
        </article>
        <article id="decision-artifact-written" class="decision-artifact-tab-panel">
          <div>
            <p class="eyebrow">Documents</p>
            <h4>Written report documents</h4>
          </div>
          <div class="decision-artifact-button-grid">
            ${models.map(({ bu }) => `<a class="icon-button ghost" href="${documentUrl("outputs", "bu-tech-report", bu.id)}#report-section-executive-summary"><svg><use href="#icon-file"></use></svg><span>${escapeHtml(bu.name)}</span></a>`).join("")}
          </div>
        </article>
        <article id="decision-artifact-cross-bu" class="decision-artifact-tab-panel">
          <div>
            <p class="eyebrow">Programme</p>
            <h4>Cross BU outputs</h4>
          </div>
          <div class="decision-artifact-button-grid">
            ${crossBuActions.map(([label, href]) => `<a class="icon-button primary" href="${href}"><svg><use href="#icon-arrow"></use></svg><span>${escapeHtml(label)}</span></a>`).join("")}
          </div>
        </article>
      </div>
      <div id="decision-artifact-detail">
        ${renderDecisionArtifactsTable(models)}
      </div>
    </section>
  `;
}
