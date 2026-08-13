/* Reference extract: moveKanbanCardToStatusColumn(...) from app/src/app.js:35309-35321. */

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
