/* Reference extract: renderDashboardTabs(...) from app/src/app.js:1811-1826. */

function renderDashboardTabs(activeTab) {
  const tabs = [
    { key: "statistics", label: "Statistics", href: "index.html?tab=statistics", icon: "icon-dashboard" },
    { key: "plan", label: "Plan", href: "index.html?tab=plan", icon: "icon-calendar" },
  ];
  return `
    <nav class="dashboard-tabs" aria-label="Dashboard views">
      ${tabs.map((tab) => `
        <a class="dashboard-tab ${activeTab === tab.key ? "active" : ""}" href="${tab.href}" aria-current="${activeTab === tab.key ? "page" : "false"}">
          <svg><use href="#${tab.icon}"></use></svg>
          <span>${escapeHtml(tab.label)}</span>
        </a>
      `).join("")}
    </nav>
  `;
}
