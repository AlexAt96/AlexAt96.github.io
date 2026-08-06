/* Reference extract: renderAnalysisAccessAndReferenceLinks(...) from app/src/app.js:8278-8319. */

function renderAnalysisAccessAndReferenceLinks(bu) {
  const accessProducts = getCollectionMatrixProducts(bu);
  const links = getKnowledgeRepositoryLinksForBu(bu);
  return `
    <div class="analysis-support-grid">
      <section class="analysis-support-panel" id="access-coverage">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">Access coverage</p>
            <h4>Environments available to the discovery team</h4>
          </div>
          <span class="status-pill ${statusClass(getBuScreenStatus(bu.id, "environment-access-confirmation"))}">${formatStatus(getBuScreenStatus(bu.id, "environment-access-confirmation"))}</span>
        </div>
        <div class="analysis-access-stack">
          ${accessProducts.map((product) => renderAnalysisAccessProduct(product, bu)).join("")}
        </div>
      </section>
      <section class="analysis-support-panel" id="reference-links">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">BU provided links</p>
            <h4>Knowledge bases and repositories</h4>
          </div>
          <span class="status-pill ${statusClass(getBuScreenStatus(bu.id, "knowledge-base-repo-access"))}">${formatStatus(getBuScreenStatus(bu.id, "knowledge-base-repo-access"))}</span>
        </div>
        ${links.length ? `
          <div class="analysis-link-list">
            ${links.map((link) => `
              <a class="analysis-link-item" href="${escapeHtml(link.url)}" target="_blank" rel="noopener">
                <span>
                  <strong>${escapeHtml(link.label)}</strong>
                  <small>${escapeHtml(link.source)}</small>
                </span>
                <svg><use href="#icon-arrow"></use></svg>
              </a>
            `).join("")}
          </div>
        ` : `<p class="small-note">No repository or knowledge-base links have been captured for this BU yet.</p>`}
      </section>
    </div>
  `;
}
