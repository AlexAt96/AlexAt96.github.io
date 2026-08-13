/* Reference extract: renderEvidenceReview(...) from app/src/app.js:10151-10206. */

function renderEvidenceReview(phase, item, bu = getSelectedBu()) {
  const documents = getEvidenceReviewDocumentsForBu(bu);
  const reviewedCount = documents.filter((document) => document.review.status === "Reviewed").length;
  const questionsCount = documents.filter((document) => document.review.status === "Questions").length;
  const f2fCount = documents.filter((document) => document.review.faceToFaceRequired).length;
  return `
    ${detailHeader("Evidence review", "Review BU uploads, capture questions, and flag items that need a follow-up conversation.")}
    <section class="panel evidence-review-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Document-level review</p>
          <h3>${escapeHtml(bu.name)} evidence register</h3>
        </div>
        <div class="evidence-review-summary">
          <span class="status-pill completed">${reviewedCount}/${documents.length} reviewed</span>
          <span class="status-pill in-review">${questionsCount} question${questionsCount === 1 ? "" : "s"}</span>
          <span class="status-pill ${f2fCount ? "in-progress" : "not-started"}">${f2fCount} face-to-face</span>
        </div>
      </div>
      ${documents.length ? `
        <form id="evidenceReviewForm" data-business-unit-id="${escapeHtml(bu.id)}">
          <div class="data-table-wrap evidence-review-table-wrap">
            <table class="data-table evidence-review-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Applicable environments</th>
                  <th>Review status</th>
                  <th>BU answer</th>
                  <th>Open / download</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                ${documents.map((document) => renderEvidenceReviewRow(document)).join("")}
              </tbody>
            </table>
          </div>
          <div class="form-actions evidence-review-actions">
            <p class="small-note" id="evidenceReviewSaveStatus">Open a row to capture review notes, questions, or discussion needs.</p>
            <button class="icon-button primary evidence-review-submit" type="submit" hidden>
              <svg><use href="#icon-save"></use></svg>
              <span>Save evidence review</span>
            </button>
          </div>
        </form>
        ${renderEvidenceReviewModal()}
      ` : `
        <div class="empty-state">
          <strong>No evidence ready for review yet.</strong>
          <span>Upload ${escapeHtml(bu.name)} documents in Collection and they will appear here.</span>
        </div>
      `}
    </section>
  `;
}
