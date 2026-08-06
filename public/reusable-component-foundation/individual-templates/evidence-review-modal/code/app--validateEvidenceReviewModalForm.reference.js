/* Reference extract: validateEvidenceReviewModalForm(...) from app/src/app.js:36092-36104. */

function validateEvidenceReviewModalForm(form) {
  const errors = [];
  const status = form?.elements?.status?.value || "Not reviewed";
  const followUpQuestions = form?.elements?.followUpQuestions;
  if (status === "Questions" && !followUpQuestions?.value.trim()) {
    errors.push({ input: followUpQuestions, message: "Add the follow-up question before saving this review as Questions." });
  }
  return {
    valid: errors.length === 0,
    message: "Complete the highlighted evidence review fields before saving.",
    errors,
  };
}
