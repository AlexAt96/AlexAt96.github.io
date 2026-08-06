/* Reference extract: renderAdfStepDatabricksBlock(...) from app/src/app.js:12397-12407. */

function renderAdfStepDatabricksBlock(databricks = null) {
  return `
    <section class="adf-step-detail-card">
      <h5>Databricks / compute</h5>
      ${databricks ? `
        <p><strong>${escapeHtml(databricks.target)}</strong><small>${escapeHtml(databricks.compute || "Compute not captured")}</small></p>
        <p><span>${escapeHtml(databricks.cluster || "Cluster detail not captured")}</span></p>
      ` : `<p><span>No Databricks activity hint exported for this step.</span></p>`}
    </section>
  `;
}
