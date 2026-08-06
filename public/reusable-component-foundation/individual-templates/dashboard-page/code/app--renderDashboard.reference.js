/* Reference extract: renderDashboard(...) from app/src/app.js:1786-1809. */

function renderDashboard() {
  const activeTab = queryParam("tab") === "plan" ? "plan" : "statistics";
  const dashboardModel = getDiscoveryDashboardModel();
  return `
    <section class="dashboard-title">
      <div>
        <p class="eyebrow">Azure Databricks to AWS</p>
        <h2>Discovery dashboard</h2>
      </div>
      <div class="phase-jump">
        <a class="icon-button ghost" href="input-centre.html">
          <svg><use href="#icon-file"></use></svg>
          <span>Source register</span>
        </a>
        <a class="icon-button primary" href="${phaseUrl(dashboardModel.nextPhaseKey, dashboardModel.nextBuId)}">
          <svg><use href="#icon-arrow"></use></svg>
          <span>Open next action</span>
        </a>
      </div>
    </section>
    ${renderDashboardTabs(activeTab)}
    ${activeTab === "plan" ? renderDashboardPlanTab() : renderDashboardStatisticsTab(dashboardModel)}
  `;
}
