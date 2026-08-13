/* Reference extract: renderContributorKanbanColumn(...) from app/src/app.js:3984-3997. */

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
