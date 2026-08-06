/* Reference extract: openBuOutputFeedbackDialog(...) from app/src/app.js:32721-32787. */

function openBuOutputFeedbackDialog({ businessUnitId, documentKey, definition }) {
  if (!canReviewOutputDocument(businessUnitId, documentKey)) {
    showAppToast("View only", { detail: "This role can open the document, but cannot approve or request feedback for it.", tone: "neutral" });
    return;
  }
  const bu = getBusinessUnit(businessUnitId);
  const scopeLabel = businessUnitId === "cross-bu" ? "Cross-BU output approval" : bu?.name || "Selected BU";
  const existing = getBuOutputDocumentReviewState(businessUnitId, documentKey).feedback || "";
  document.querySelector(".bu-output-feedback-modal")?.remove();
  const modal = document.createElement("div");
  modal.className = "app-modal-backdrop bu-output-feedback-modal";
  modal.innerHTML = `
    <section class="app-modal-panel bu-output-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="buOutputFeedbackTitle">
      <div class="app-modal-heading">
        <div>
          <p class="eyebrow">Request feedback</p>
          <h3 id="buOutputFeedbackTitle">${escapeHtml(definition?.title || "Output document")}</h3>
          <p>${escapeHtml(scopeLabel)} will see this feedback in the output pack and document review flow.</p>
        </div>
        <button class="icon-button ghost bu-output-feedback-close" type="button" aria-label="Close feedback dialog">
          <svg><use href="#icon-x"></use></svg>
        </button>
      </div>
      <label>
        <span class="field-label">Feedback</span>
        <textarea class="bu-output-feedback-text" rows="7" placeholder="Add concise review feedback, required changes, or questions for this output document."></textarea>
      </label>
      <div class="app-modal-actions">
        <button class="icon-button ghost bu-output-feedback-close" type="button">
          <svg><use href="#icon-x"></use></svg>
          <span>Cancel</span>
        </button>
        <button class="icon-button primary bu-output-feedback-submit" type="button">
          <svg><use href="#icon-check"></use></svg>
          <span>Request feedback</span>
        </button>
      </div>
    </section>
  `;
  const textarea = modal.querySelector(".bu-output-feedback-text");
  textarea.value = existing;
  const close = () => {
    closeAccessibleModal(modal);
    modal.remove();
    if (!hasOpenBlockingModal()) document.body.classList.remove("modal-open");
  };
  modal.querySelectorAll(".bu-output-feedback-close").forEach((button) => button.addEventListener("click", close));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  modal.querySelector(".bu-output-feedback-submit")?.addEventListener("click", async (event) => {
    const feedback = textarea.value.trim();
    if (!feedback) {
      textarea.focus();
      textarea.classList.add("invalid");
      return;
    }
    event.currentTarget.disabled = true;
    await updateBuOutputSourceTaskStatus(businessUnitId, documentKey, "In progress");
    setBuOutputDocumentReviewState(businessUnitId, documentKey, { status: "Feedback requested", feedback, implementationNote: "" });
    showAppToast("Feedback recorded", { detail: `${definition?.title || "Output document"} sent back with review feedback.` });
    close();
    reloadApp();
  });
  document.body.appendChild(modal);
  openAccessibleModal(modal, { initialFocusSelector: ".bu-output-feedback-text", onRequestClose: close });
}
