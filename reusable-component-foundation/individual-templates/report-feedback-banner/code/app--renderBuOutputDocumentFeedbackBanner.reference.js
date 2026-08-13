/* Reference extract: renderBuOutputDocumentFeedbackBanner(...) from app/src/app.js:24369-24398. */

function renderBuOutputDocumentFeedbackBanner(phase, item, bu, options = {}) {
  const definition = getBuOutputDocumentDefinitionForPage(phase.key, item.key);
  if (!definition || !bu?.id) return "";
  const review = getBuOutputDocumentReviewState(bu.id, definition.key);
  if (!["Feedback requested", "Feedback implemented"].includes(review.status) || !review.feedback) return "";
  const showMarkDone = options.showMarkDone && review.status === "Feedback requested";
  return `
    <section class="panel bu-output-feedback-banner" aria-label="BU output document feedback">
      <div>
        <p class="eyebrow">${escapeHtml(review.status)}</p>
        <h3>${escapeHtml(definition.title)}</h3>
        <p>${escapeHtml(review.feedback)}</p>
        ${review.implementationNote ? `<div class="bu-output-implementation-note"><strong>What was done:</strong> ${escapeHtml(review.implementationNote)}</div>` : ""}
        ${review.updatedAt ? `<small>Updated ${escapeHtml(formatDateTime(review.updatedAt))}</small>` : ""}
      </div>
      <div class="bu-output-feedback-actions">
        ${showMarkDone ? `
          <button class="icon-button primary bu-output-feedback-done" type="button" data-business-unit-id="${escapeHtml(bu.id)}" data-document-key="${escapeHtml(definition.key)}">
            <svg><use href="#icon-check"></use></svg>
            <span>What has been done</span>
          </button>
        ` : ""}
        <a class="icon-button ghost" href="${documentUrl("outputs", "per-bu-outputs", bu.id)}">
          <svg><use href="#icon-arrow-left"></use></svg>
          <span>Back to BU outputs</span>
        </a>
      </div>
    </section>
  `;
}
