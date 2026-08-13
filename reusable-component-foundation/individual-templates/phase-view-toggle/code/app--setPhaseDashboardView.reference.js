/* Reference extract: setPhaseDashboardView(...) from app/src/app.js:3953-3970. */

function setPhaseDashboardView(view) {
  const nextView = view === "list" ? "list" : "kanban";
  window.localStorage.setItem(PHASE_DASHBOARD_VIEW_STORAGE_KEY, nextView);
  document.querySelectorAll(".phase-dashboard-views").forEach((container) => {
    container.classList.toggle("view-list", nextView === "list");
    container.classList.toggle("view-kanban", nextView === "kanban");
  });
  document.querySelectorAll(".phase-task-board").forEach((container) => {
    container.classList.toggle("view-list", nextView === "list");
    container.classList.toggle("view-kanban", nextView === "kanban");
  });
  document.querySelectorAll(".phase-view-option").forEach((button) => {
    const active = button.dataset.phaseDashboardView === nextView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  updatePhaseBoardStickyMasks();
}
