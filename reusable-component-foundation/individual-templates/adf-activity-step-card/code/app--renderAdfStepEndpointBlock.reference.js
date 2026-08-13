/* Reference extract: renderAdfStepEndpointBlock(...) from app/src/app.js:12354-12363. */

function renderAdfStepEndpointBlock(title, endpoints = []) {
  return `
    <section class="adf-step-detail-card">
      <h5>${escapeHtml(title)}</h5>
      ${endpoints.length ? endpoints.map((endpoint) => `
        <p><strong>${escapeHtml(endpoint.name)}</strong><small>${escapeHtml(endpoint.detail)}</small></p>
      `).join("") : `<p><span>No exported ${escapeHtml(title.toLowerCase())} dataset for this activity.</span></p>`}
    </section>
  `;
}
