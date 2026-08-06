/* Reference extract: renderDashboardPlanBar(...) from app/src/app.js:2196-2217. */

function renderDashboardPlanBar(bar, rowNumber) {
  const delayPercent = bar.delaySpan ? Math.round((bar.delaySpan / (bar.totalSpan || bar.span)) * 100) : 0;
  const compact = (bar.totalSpan || bar.span) <= 2;
  const phaseClass = getPlanCssToken(bar.phaseKey || "task");
  const ragStatus = normaliseProjectPlanRagStatus(bar.ragStatus);
  const ragLabel = getProjectPlanRagStatusLabel(ragStatus);
  const ragShortLabel = PROJECT_PLAN_RAG_STATUSES.find((option) => option.key === ragStatus)?.shortLabel || "";
  const stripLabel = ragStatus === "not-set" ? "" : ragShortLabel;
  const stripAriaLabel = ragStatus === "not-set" && isDoneStatus(bar.status) ? "No RAG status; done" : `RAG status: ${ragLabel}`;
  return `
    <a class="gantt-bar plan-phase-${phaseClass} ${statusClass(bar.status)} rag-${ragStatus} ${bar.delaySpan ? "delayed" : ""} ${compact ? "compact" : ""}" href="${bar.href}" draggable="false" data-plan-row-id="${escapeHtml(bar.rowId)}" data-plan-start="${escapeHtml(bar.start)}" data-plan-span="${escapeHtml(bar.span)}" data-plan-delay="${escapeHtml(bar.delaySpan)}" data-plan-rag-status="${escapeHtml(ragStatus)}" style="--plan-row: ${rowNumber}; --bar-lane: ${bar.stackIndex || 0}; --bar-progress: ${bar.progress}%; --delay-percent: ${delayPercent}%; grid-column: ${bar.start + 1} / span ${bar.totalSpan || bar.span};" title="${escapeHtml(bar.title)} - ${bar.progress}% complete. RAG status: ${escapeHtml(ragLabel)}. Double-click to open.${bar.delaySpan ? ` Delayed ${bar.delaySpan} week${bar.delaySpan === 1 ? "" : "s"}.` : ""}">
      <span class="gantt-bar-resize left" data-resize-edge="left" aria-hidden="true"></span>
      <span class="gantt-dependency-handle left" data-dependency-edge="start" title="Drag to link from task start"></span>
      <span class="gantt-rag-strip" aria-label="${escapeHtml(stripAriaLabel)}" title="${escapeHtml(stripAriaLabel)}">${escapeHtml(stripLabel)}</span>
      <span class="gantt-bar-label">${escapeHtml(compact ? getCompactPlanBarLabel(bar.label) : bar.label)}</span>
      <span class="gantt-bar-progress">${bar.progress}%</span>
      ${bar.delaySpan ? `<span class="gantt-delay-extension">+${escapeHtml(bar.delaySpan)}w</span>` : ""}
      <span class="gantt-dependency-handle right" data-dependency-edge="finish" title="Drag to link from task finish"></span>
      <span class="gantt-bar-resize right" data-resize-edge="right" aria-hidden="true"></span>
    </a>
  `;
}
