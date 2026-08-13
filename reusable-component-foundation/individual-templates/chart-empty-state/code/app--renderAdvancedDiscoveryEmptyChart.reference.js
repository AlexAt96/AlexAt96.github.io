/* Reference extract: renderAdvancedDiscoveryEmptyChart(...) from app/src/app.js:13308-13317. */

function renderAdvancedDiscoveryEmptyChart(title) {
  return `
    <section class="dbu-chart-panel advanced-discovery-chart-panel">
      <div class="empty-state compact">
        <strong>${escapeHtml(title)}</strong>
        <span>No rows available for this chart yet.</span>
      </div>
    </section>
  `;
}
