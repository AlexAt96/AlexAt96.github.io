/* Reference extract: launchQuestionnaireEditorFromModal(...) from app/src/app.js:39253-39265. */

function launchQuestionnaireEditorFromModal(modal, step = 1, closeModal = () => {}) {
  const sectionType = modal.dataset.sectionType || "";
  const productId = modal.dataset.productId || "";
  const selector = sectionType === "product"
    ? `.questionnaire-answer-launch[data-section-type="product"][data-product-id="${cssEscape(productId)}"]`
    : '.questionnaire-answer-launch[data-section-type="bu-wide"]';
  const launchButton = document.querySelector(selector);
  if (!launchButton) return;
  launchButton.dataset.startStep = String(step || 1);
  closeModal();
  launchButton.click();
  delete launchButton.dataset.startStep;
}
