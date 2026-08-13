/* Reference extract: renderMetadataSectionOverview(...) from app/src/app.js:14214-14229. */

function renderMetadataSectionOverview({ title, stats = [], chartTitle, chartRows = [] }) {
  return `
    <section class="metadata-section-overview" aria-label="${escapeHtml(title)}">
      <div class="metadata-headline-grid">
        ${stats.map(([label, value, detail]) => `
          <article class="fact-card metadata-headline-stat">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value))}</strong>
            <small>${escapeHtml(detail || "")}</small>
          </article>
        `).join("")}
      </div>
      ${renderMetadataBarChart(chartTitle, chartRows)}
    </section>
  `;
}
