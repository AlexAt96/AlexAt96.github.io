/* Reference extract: renderDashboardPlanTab(...) from app/src/app.js:2115-2181. */

function renderDashboardPlanTab() {
  const model = getDashboardPlanModel();
  const hasDraftChanges = hasDashboardPlanDraftChanges();
  const statusLegend = [
    ["in-progress", "In progress"],
    ["in-review", "In review"],
    ["done", "Done"],
    ["blocked", "Blocked"],
    ["not-started", "Not started"],
  ].map(([status, label]) => `<span class="plan-legend-item ${status}"><i></i>${escapeHtml(label)}</span>`).join("");
  return `
    <section class="panel dashboard-plan-panel">
      <div class="panel-heading dashboard-plan-heading">
        <div>
          <p class="eyebrow">Engagement Lead plan</p>
          <h3>Weekly discovery plan</h3>
        </div>
        <div class="dashboard-plan-meta">
          <span class="pill">Current week ${model.currentWeek}</span>
          <button class="icon-button primary" id="saveDashboardPlanChanges" type="button"${hasDraftChanges ? "" : " disabled"} title="${hasDraftChanges ? "Save plan changes" : "No plan changes to save"}">
            <svg><use href="#icon-check"></use></svg>
            <span>Save changes</span>
          </button>
          <button class="icon-button ghost" id="undoDashboardPlanAction" type="button"${hasDashboardPlanUndo() ? "" : " disabled"} title="Undo the last plan edit">
            <svg><use href="#icon-reset"></use></svg>
            <span>Undo</span>
          </button>
          <a class="icon-button ghost" href="${documentUrl("initiation", "project-plan-setup")}">
            <svg><use href="#icon-arrow"></use></svg>
            <span>Edit project plan</span>
          </a>
        </div>
      </div>
      <div class="dashboard-plan-summary">
        ${factCard("Timeline", `${model.weekCount} weeks`, `Starts ${model.weekLabel}`)}
        ${factCard("Today", model.todayLabel, `Week ${model.currentWeek} marker`)}
        ${factCard("Projected finish", model.projectedFinishLabel, `Week ${model.projectedFinishWeek} final plan week`)}
      </div>
      <section class="plan-gantt-shell">
        <div class="plan-gantt-toolbar">
          <div class="plan-gantt-title">
            <span>Timeline board</span>
            <strong>${model.rows.length} lanes across ${model.weekCount} weeks</strong>
          </div>
          <div class="plan-status-legend" aria-label="Plan status colours">
            ${statusLegend}
          </div>
        </div>
        <div class="gantt-scroll" aria-label="Weekly Gantt plan">
          <div class="gantt-grid ${model.fitToFrame ? "fit-to-frame" : "scroll-timeline"}" style="--plan-weeks: ${model.weekCount}; --today-offset: ${model.todayOffset}px; --today-progress: ${model.todayProgress}; --plan-width: ${model.planWidth}px;">
            <svg class="gantt-dependency-lines" aria-hidden="true"></svg>
            <div class="gantt-dependency-actions" aria-label="Dependency actions"></div>
            <div class="gantt-corner">Swim lane</div>
            ${model.weeks.map((week) => `
              <div class="gantt-week-head">
                <strong>Week ${week.number}</strong>
                <span>W/C ${escapeHtml(week.label)}</span>
              </div>
            `).join("")}
            <div class="gantt-today-marker" aria-hidden="true"><span>Today</span></div>
            ${model.rows.map((row, index) => renderDashboardPlanRow(row, index + 2)).join("")}
          </div>
        </div>
      </section>
    </section>
  `;
}
