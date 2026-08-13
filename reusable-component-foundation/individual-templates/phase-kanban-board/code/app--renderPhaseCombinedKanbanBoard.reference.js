/* Reference extract: renderPhaseCombinedKanbanBoard(...) from app/src/app.js:3396-3403. */

function renderPhaseCombinedKanbanBoard(phase, groups, buId = "", activeOwnerFilter = "all") {
  const items = getPhaseContributorTasks(phase, groups, activeOwnerFilter);
  return `
    <div class="contributor-kanban-board phase-combined-kanban-board">
      ${PHASE_KANBAN_COLUMNS.map((column) => renderContributorKanbanColumn(phase, items, column, buId, { showOwner: activeOwnerFilter === "all" })).join("")}
    </div>
  `;
}
