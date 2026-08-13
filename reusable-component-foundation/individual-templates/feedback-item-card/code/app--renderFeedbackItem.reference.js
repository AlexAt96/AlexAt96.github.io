/* Reference extract: renderFeedbackItem(...) from app/src/app.js:4280-4300. */

function renderFeedbackItem(item) {
  const meta = [
    item.businessUnitName,
    item.createdAt ? `Sent ${formatDateTime(item.createdAt)}` : "Open",
    item.sourceSectionTitle ? `From ${item.sourceSectionTitle}` : "",
  ].filter(Boolean).join(" / ");
  return `
    <article class="feedback-item">
      <div>
        <span class="status-pill in-progress">In progress</span>
        <h4>${escapeHtml(item.taskTitle || "Task feedback")}</h4>
        <p>${escapeHtml(item.comment || "")}</p>
        <small>${escapeHtml(meta)}</small>
      </div>
      <a class="icon-button ghost" href="${escapeHtml(item.href)}">
        <svg><use href="#icon-arrow"></use></svg>
        <span>Open task</span>
      </a>
    </article>
  `;
}
