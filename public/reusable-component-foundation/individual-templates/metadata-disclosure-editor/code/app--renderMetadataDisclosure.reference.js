/* Reference extract: renderMetadataDisclosure(...) from app/src/app.js:7714-7741. */

function renderMetadataDisclosure({ sectionKey, eyebrow, title, summary, meta, status, content, saveButtonId, saveLabel }) {
  return `
    <details class="metadata-section metadata-disclosure">
      <summary>
        <span class="disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
        <span class="disclosure-copy">
          <span class="eyebrow">${escapeHtml(eyebrow)}</span>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(summary)}</small>
        </span>
        <span class="disclosure-meta">
          <span class="status-pill ${statusClass(status)}">${escapeHtml(formatStatus(status))}</span>
          <span class="chip">${escapeHtml(meta)}</span>
        </span>
      </summary>
      <div class="metadata-disclosure-body">
        ${renderProgrammeScreenStatusControls(sectionKey, status)}
        ${content}
        <div class="button-row metadata-section-actions">
          <button class="icon-button primary metadata-section-save" id="${escapeHtml(saveButtonId)}" type="button">
            <svg><use href="#icon-save"></use></svg>
            <span>${escapeHtml(saveLabel)}</span>
          </button>
        </div>
      </div>
    </details>
  `;
}
