/* Reference extract: renderPhaseDashboardOwnerFilter(...) from app/src/app.js:3319-3337. */

function renderPhaseDashboardOwnerFilter(phase, buId = "", ownerFilters = [], activeOwnerFilter = "all") {
  if (!ownerFilters.length) return "";
  const allCount = ownerFilters.reduce((total, filter) => total + filter.count, 0);
  const options = [
    { key: "all", label: "All", count: allCount },
    ...ownerFilters,
  ];
  return `
    <nav class="phase-return-bu-switcher phase-owner-filter" aria-label="Task owner filter">
      <div class="phase-return-bu-options">
        ${options.map((option) => `
          <a class="phase-return-bu-chip ${activeOwnerFilter === option.key ? "active" : ""}" href="${escapeHtml(phaseOwnerFilterUrl(phase, buId, option.key))}" aria-current="${activeOwnerFilter === option.key ? "true" : "false"}">
            ${escapeHtml(option.label)}
          </a>
        `).join("")}
      </div>
    </nav>
  `;
}
