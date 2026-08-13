/* Reference extract: renderPhaseFeedbackSection(...) from app/src/app.js:4256-4260. */

function renderPhaseFeedbackSection(phase, bu = null) {
  const feedbackItems = getOpenFeedbackItemsForPhase(phase, bu);
  if (!feedbackItems.length) return "";
  return renderFeedbackSection(feedbackItems);
}
