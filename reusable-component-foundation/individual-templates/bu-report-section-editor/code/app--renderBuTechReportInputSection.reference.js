/* Reference extract: renderBuTechReportInputSection(...) from app/src/app.js:23066-23105. */

function renderBuTechReportInputSection(section, index) {
  const bodyId = `buTechReportSectionBody-${section.key}`;
  const task = section.task || BU_TECH_REPORT_REVIEW_TASKS[section.key] || {};
  const bu = getSelectedBu();
  const taskSectionKey = task.sectionKey || "bu-tech-report-input";
  const taskStatus = getBuScreenStatus(bu.id, taskSectionKey);
  const openFeedback = getOpenTaskFeedback(bu.id, taskSectionKey);
  const taskUrl = getBuTechReportTaskUrl(taskSectionKey, bu.id);
  return `
    <details class="panel bu-tech-report-section" ${section.openByDefault ? "open" : ""}>
      <summary>
        <span class="disclosure-icon contributor-disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
        <span>
          <span class="eyebrow">Section ${index + 1}</span>
          <strong>${escapeHtml(section.title)}</strong>
        </span>
        <span class="bu-tech-report-review-tools" onclick="event.stopPropagation();">
          ${renderWorkflowStatusSelect({
            currentStatus: taskStatus,
            sectionKey: taskSectionKey,
            businessUnitId: bu.id,
            title: `Update ${task.label || section.title} task status for ${bu.name}.`,
          })}
          ${taskUrl ? `<a class="icon-button ghost compact bu-tech-report-open-details" href="${escapeHtml(taskUrl)}" title="Open details for ${escapeHtml(task.label || section.title)}">
            <svg><use href="#icon-arrow"></use></svg>
            <span>Open details</span>
          </a>` : ""}
          <button class="icon-button ghost bu-tech-report-feedback-action" type="button" data-business-unit-id="${escapeHtml(bu.id)}" data-section-key="${escapeHtml(taskSectionKey)}" data-report-section-key="${escapeHtml(section.key)}" data-report-section-title="${escapeHtml(section.title)}">
            <svg><use href="#icon-edit"></use></svg>
            <span>Feedback</span>
          </button>
        </span>
      </summary>
      <div class="bu-tech-report-section-body">
        ${openFeedback ? `<div class="report-review-feedback-inline"><strong>Open feedback:</strong> ${escapeHtml(openFeedback.comment)}</div>` : ""}
        ${renderBuTechReportSectionEditableContent(section, bodyId)}
      </div>
    </details>
  `;
}
