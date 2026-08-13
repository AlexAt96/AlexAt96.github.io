/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderPhaseDashboardViewToggle(activeView) {
  return `
    <div class="phase-view-toggle" role="group" aria-label="Phase task board view">
      <button class="phase-view-option ${activeView === "kanban" ? "active" : ""}" type="button" data-phase-dashboard-view="kanban" aria-pressed="${activeView === "kanban" ? "true" : "false"}">Kanban</button>
      <button class="phase-view-option ${activeView === "list" ? "active" : ""}" type="button" data-phase-dashboard-view="list" aria-pressed="${activeView === "list" ? "true" : "false"}">List</button>
    </div>
  `;
}

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

function renderPhaseSectionList(phase, buId = "", activeView = "kanban", groups = getPhaseContributorGroups(phase), activeOwnerFilter = "all") {
  return `
    <div class="phase-dashboard-views view-${escapeHtml(activeView)}">
      <div class="phase-dashboard-view phase-dashboard-kanban" data-phase-dashboard-panel="kanban">
        ${renderPhaseCombinedKanbanBoard(phase, groups, buId, activeOwnerFilter)}
      </div>
      <div class="phase-dashboard-view phase-dashboard-list" data-phase-dashboard-panel="list">
        <div class="role-section-list">
          ${groups.map((group) => renderPhaseContributorListGroup(phase, group, buId)).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderPhaseCombinedKanbanBoard(phase, groups, buId = "", activeOwnerFilter = "all") {
  const items = getPhaseContributorTasks(phase, groups, activeOwnerFilter);
  return `
    <div class="contributor-kanban-board phase-combined-kanban-board">
      ${PHASE_KANBAN_COLUMNS.map((column) => renderContributorKanbanColumn(phase, items, column, buId, { showOwner: activeOwnerFilter === "all" })).join("")}
    </div>
  `;
}

function renderContributorKanbanColumn(phase, items, column, buId = "", options = {}) {
  const columnItems = items.filter((item) => column.statuses.includes(getSectionKanbanStatus(item)));
  return `
    <section class="contributor-status-column ${escapeHtml(column.key)}" data-kanban-column="${escapeHtml(column.key)}">
      <div class="status-column-heading">
        <span>${escapeHtml(column.label)}</span>
        <span class="pill">${columnItems.length}</span>
      </div>
      <div class="contributor-screen-list">
        ${columnItems.length ? columnItems.map((item) => renderSectionLink(phase, item, buId, { ownerLabel: item.owner || "", kanban: true })).join("") : `<p class="empty-column-note">No tasks</p>`}
      </div>
    </section>
  `;
}

function getSectionKanbanStatus(item) {
  if (item.blank) return "not-started";
  const status = toStatusKey(item.status);
  if (["completed", "done"].includes(status)) return "done";
  if (["in-review", "review"].includes(status)) return "in-review";
  if (["in-progress", "draft"].includes(status)) return "in-progress";
  if (status === "blocked") return "blocked";
  return "not-started";
}

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

function moveKanbanCardToStatusColumn(card, status) {
  const board = card.closest(".contributor-kanban-board");
  if (!board) return;
  const statusKey = getSectionKanbanStatus({ status });
  const targetColumn = PHASE_KANBAN_COLUMNS.find((column) => column.statuses.includes(statusKey));
  const targetList = targetColumn ? board.querySelector(`[data-kanban-column="${targetColumn.key}"] .contributor-screen-list`) : null;
  if (!targetList) return;
  const sourceList = card.closest(".contributor-screen-list");
  targetList.querySelector(".empty-column-note")?.remove();
  targetList.appendChild(card);
  ensureKanbanListPlaceholder(sourceList);
  refreshKanbanColumnCounts(board);
}

function refreshKanbanColumnCounts(board) {
  board.querySelectorAll(".contributor-status-column").forEach((column) => {
    const count = column.querySelectorAll(".kanban-task-card").length;
    const countPill = column.querySelector(".status-column-heading .pill");
    if (countPill) countPill.textContent = String(count);
  });
}
