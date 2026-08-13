/* Reference extract: renderDiscoveryKpiCard(...) from app/src/app.js:1894-1903. */

function renderDiscoveryKpiCard({ label, value, detail, tooltip = "", href = "", tone = "", icon = "icon-dashboard" }) {
  return `
    <article class="dashboard-kpi ${escapeHtml(tone)}">
      <span class="dashboard-kpi-icon"><svg><use href="#${escapeHtml(icon)}"></use></svg></span>
      <span>${escapeHtml(label)}</span>
      <strong>${tooltip || href ? dataText(value, tooltip || `Source: ${label}`, href) : escapeHtml(String(value))}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}
