/* Reference extract: renderMetadataReviewDisclosure(...) from app/src/app.js:14281-14297. */

function renderMetadataReviewDisclosure({ eyebrow, title, summary, content }) {
  return `
    <details class="metadata-disclosure metadata-review-disclosure" data-page-state-disabled="true">
      <summary>
        <span class="disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
        <span class="disclosure-copy">
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(eyebrow)}</small>
        </span>
        <span class="disclosure-meta"><span class="chip">${escapeHtml(summary || "Expand to review rows")}</span></span>
      </summary>
      <div class="metadata-review-disclosure-body">
        ${content}
      </div>
    </details>
  `;
}
