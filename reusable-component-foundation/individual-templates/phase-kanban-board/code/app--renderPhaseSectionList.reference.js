/* Reference extract: renderPhaseSectionList(...) from app/src/app.js:3381-3394. */

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
