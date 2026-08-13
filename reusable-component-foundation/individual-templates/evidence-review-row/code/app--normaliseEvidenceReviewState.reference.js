/* Reference extract: normaliseEvidenceReviewState(...) from app/src/app.js:10644-10654. */

function normaliseEvidenceReviewState(review = {}) {
  return {
    status: EVIDENCE_REVIEW_STATUSES.includes(review.status) ? review.status : "Not reviewed",
    comments: review.comments || "",
    followUpQuestions: review.follow_up_questions || review.followUpQuestions || "",
    faceToFaceRequired: review.face_to_face_required === true || review.faceToFaceRequired === true,
    followUpStatus: BU_FOLLOW_UP_STATUSES.includes(review.follow_up_status || review.followUpStatus) ? (review.follow_up_status || review.followUpStatus) : "More info needed",
    followUpAnswer: cleanFollowUpAnswerForClient(review.follow_up_answer || review.followUpAnswer || ""),
    followUpUpdatedAt: review.follow_up_updated_at || review.followUpUpdatedAt || "",
  };
}
