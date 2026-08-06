/* Reference extract: renderEvidenceReviewBuAnswer(...) from app/src/app.js:10263-10282. */

function renderEvidenceReviewBuAnswer(review = {}) {
  const answer = cleanFollowUpAnswerForClient(review.followUpAnswer);
  if (answer) {
    return `
      <div class="evidence-review-bu-answer">
        <span class="field-label">BU answer</span>
        <p>${escapeHtml(answer)}</p>
      </div>
    `;
  }
  if (review.followUpQuestions || review.faceToFaceRequired) {
    return `
      <div class="evidence-review-bu-answer pending">
        <span class="field-label">BU answer</span>
        <p>Waiting for BU answer.</p>
      </div>
    `;
  }
  return `<span class="muted evidence-review-no-answer">No BU answer needed.</span>`;
}
