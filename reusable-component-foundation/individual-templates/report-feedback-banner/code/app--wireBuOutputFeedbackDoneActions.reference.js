/* Reference extract: wireBuOutputFeedbackDoneActions(...) from app/src/app.js:32573-32583. */

function wireBuOutputFeedbackDoneActions() {
  document.querySelectorAll(".bu-output-feedback-done").forEach((button) => {
    button.addEventListener("click", () => {
      const businessUnitId = button.dataset.businessUnitId || "";
      const documentKey = button.dataset.documentKey || "";
      if (!businessUnitId || !documentKey) return;
      const definition = BU_OUTPUT_DOCUMENTS.find((item) => item.key === documentKey);
      openBuOutputImplementationDialog({ businessUnitId, documentKey, definition });
    });
  });
}
