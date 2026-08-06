/* Reference extract: renderAdfStepDetailNode(...) from app/src/app.js:12386-12395. */

function renderAdfStepDetailNode(title, rows = [], kind = "meta") {
  return `
    <section class="adf-step-detail-node is-${escapeHtml(kind)}">
      <h5>${escapeHtml(title)}</h5>
      ${rows.map(([label, detail]) => `
        <p><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></p>
      `).join("")}
    </section>
  `;
}
