/* Reference extract: refreshKanbanColumnCounts(...) from app/src/app.js:35331-35337. */

function refreshKanbanColumnCounts(board) {
  board.querySelectorAll(".contributor-status-column").forEach((column) => {
    const count = column.querySelectorAll(".kanban-task-card").length;
    const countPill = column.querySelector(".status-column-heading .pill");
    if (countPill) countPill.textContent = String(count);
  });
}
