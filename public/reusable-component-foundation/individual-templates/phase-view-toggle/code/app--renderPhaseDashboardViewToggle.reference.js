/* Reference extract: renderPhaseDashboardViewToggle(...) from app/src/app.js:3310-3317. */

function renderPhaseDashboardViewToggle(activeView) {
  return `
    <div class="phase-view-toggle" role="group" aria-label="Phase task board view">
      <button class="phase-view-option ${activeView === "kanban" ? "active" : ""}" type="button" data-phase-dashboard-view="kanban" aria-pressed="${activeView === "kanban" ? "true" : "false"}">Kanban</button>
      <button class="phase-view-option ${activeView === "list" ? "active" : ""}" type="button" data-phase-dashboard-view="list" aria-pressed="${activeView === "list" ? "true" : "false"}">List</button>
    </div>
  `;
}
