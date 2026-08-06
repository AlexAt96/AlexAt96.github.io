/* Reference extract: renderEvidenceReviewFollowUpSummary(...) from app/src/app.js:10252-10261. */

function renderEvidenceReviewFollowUpSummary(review = {}) {
  const status = review.followUpStatus || "More info needed";
  if (review.status === "Reviewed" || status === "Confirmed") return "";
  if (!review.followUpQuestions && !review.faceToFaceRequired && !cleanFollowUpAnswerForClient(review.followUpAnswer)) return "";
  return `
    <div class="evidence-review-follow-up-summary">
      <span class="status-pill ${followUpStatusClass(status)}">${escapeHtml(status)}</span>
    </div>
  `;
}
