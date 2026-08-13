/* Reference extract: renderDocumentFeedbackSection(...) from app/src/app.js:4245-4254. */

function renderDocumentFeedbackSection(bu, phase, item) {
  const feedback = getOpenTaskFeedback(bu.id, item.key);
  if (!feedback) return "";
  return renderFeedbackSection([buildFeedbackItemFromScreen({
    screen: getBuScreenInstance(bu.id, item.key),
    phaseKey: phase.key,
    section: item,
    bu,
  })]);
}
