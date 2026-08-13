/* Reference extract: renderCollectionEvidenceMatrix(...) from app/src/app.js:8162-8187. */

function renderCollectionEvidenceMatrix(phase, bu) {
  const products = getCollectionMatrixProducts(bu);
  const overallProgress = getCollectionProductsEvidenceProgress(products, bu);
  return `
    <section class="panel collection-matrix-panel" id="collection-completeness">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Collection completeness</p>
          <h3>Environment evidence matrix</h3>
        </div>
        <span class="pill">${products.length} Databricks product${products.length === 1 ? "" : "s"}</span>
      </div>
      <p class="small-note">Rows are grouped by Databricks Product. Expand a product and each evidence category to see detailed completion by environment.</p>
      <div class="collection-overall-progress">
        <div>
          <p class="eyebrow">Overall evidence status</p>
          <strong>${formatEvidenceProgressPercent(overallProgress.complete, overallProgress.total)} complete</strong>
        </div>
        ${renderCollectionEvidenceProgressBar(overallProgress, "large")}
      </div>
      <div class="collection-matrix-stack">
        ${products.map((product) => renderCollectionProductMatrix(product, bu, false)).join("")}
      </div>
    </section>
  `;
}
