/* Reference extract: wireEvidenceReviewActions(...) from app/src/app.js:35961-36090. */

function wireEvidenceReviewActions() {
  const form = document.querySelector("#evidenceReviewForm");
  if (!form) return;
  const saveStatus = form.querySelector("#evidenceReviewSaveStatus");
  const modal = document.querySelector("#evidenceReviewModal");
  const modalForm = document.querySelector("#evidenceReviewModalForm");
  let activeRow = null;
  if (modalForm) modalForm.noValidate = true;
  const updateStatusPill = (row, status) => {
    const pill = row?.querySelector("[data-review-status-label]");
    if (!pill) return;
    pill.className = `status-pill ${evidenceReviewStatusClass(status)}`;
    pill.textContent = status;
  };
  const closeModal = () => {
    if (modal) closeAccessibleModal(modal);
    activeRow = null;
  };
  const saveEvidenceReviews = async (button) => {
    if (!SERVER_MODE) {
      if (saveStatus) saveStatus.textContent = "Run the local server to save evidence reviews.";
      showAppAlert("Run the local server to save evidence reviews.");
      return false;
    }
    const submitButton = button || form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (saveStatus) saveStatus.textContent = "Saving evidence review...";
    const reviews = Array.from(form.querySelectorAll(".evidence-review-row")).map((row) => ({
      reviewItemId: row.dataset.reviewItemId || "",
      uploadVersionId: row.dataset.uploadVersionId || "",
      artifactId: row.dataset.artifactId || "",
      artifactType: row.dataset.artifactType || row.querySelector('input[name="artifactType"]')?.value || "",
      documentType: row.querySelector('input[name="documentType"]')?.value || "",
      comments: row.querySelector('input[name="comments"]')?.value.trim() || "",
      followUpQuestions: row.querySelector('input[name="followUpQuestions"]')?.value.trim() || "",
      faceToFaceRequired: row.querySelector('input[name="faceToFaceRequired"]')?.value === "true",
      followUpStatus: row.querySelector('input[name="followUpStatus"]')?.value || "More info needed",
      followUpAnswer: row.querySelector('input[name="followUpAnswer"]')?.value || "",
      status: row.querySelector('input[name="status"]')?.value || "Not reviewed",
    }));
    try {
      const result = await apiRequest(`/api/business-units/${encodeURIComponent(form.dataset.businessUnitId)}/evidence-review`, {
        method: "PUT",
        body: JSON.stringify({ reviews }),
      });
      serverWorkspace.evidence_review_items = result.records || [];
      if (result.screen) {
        const screens = serverWorkspace.screen_instances || [];
        const index = screens.findIndex((screen) => screen.screen_instance_id === result.screen.screen_instance_id);
        if (index >= 0) screens[index] = result.screen;
        else screens.push(result.screen);
        serverWorkspace.screen_instances = screens;
      }
      if (saveStatus) saveStatus.textContent = `Saved ${reviews.length} evidence review row${reviews.length === 1 ? "" : "s"}.`;
      showAppToast("Evidence review saved", {
        detail: `${reviews.length} review row${reviews.length === 1 ? "" : "s"} saved.`,
        tone: "success",
      });
      return true;
    } catch (error) {
      const message = `The evidence review could not be saved: ${formatApiError(error)}`;
      if (saveStatus) saveStatus.textContent = message;
      showAppAlert(message);
      return false;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };
  form.querySelectorAll(".evidence-review-open").forEach((button) => {
    button.addEventListener("click", () => {
      activeRow = button.closest(".evidence-review-row");
      if (!activeRow || !modal || !modalForm) return;
      const documentType = activeRow.querySelector('input[name="documentType"]')?.value || "Evidence";
      modalForm.elements.uploadVersionId.value = activeRow.dataset.uploadVersionId || "";
      modalForm.elements.comments.value = activeRow.querySelector('input[name="comments"]')?.value || "";
      modalForm.elements.followUpQuestions.value = activeRow.querySelector('input[name="followUpQuestions"]')?.value || "";
      modalForm.elements.faceToFaceRequired.checked = activeRow.querySelector('input[name="faceToFaceRequired"]')?.value === "true";
      modalForm.elements.status.value = activeRow.querySelector('input[name="status"]')?.value || "Not reviewed";
      const followUpStatus = activeRow.querySelector('input[name="followUpStatus"]')?.value || "More info needed";
      const followUpAnswer = activeRow.querySelector('input[name="followUpAnswer"]')?.value || "";
      const followUpStatusDisplay = modal.querySelector("[data-follow-up-status-display]");
      if (followUpStatusDisplay) {
        followUpStatusDisplay.className = `status-pill ${followUpStatusClass(followUpStatus)}`;
        followUpStatusDisplay.textContent = followUpStatus;
      }
      const followUpAnswerDisplay = modal.querySelector("[data-follow-up-answer-display]");
      if (followUpAnswerDisplay) followUpAnswerDisplay.textContent = cleanFollowUpAnswerForClient(followUpAnswer) || "No BU answer yet.";
      const title = modal.querySelector("#evidenceReviewModalTitle");
      if (title) title.textContent = documentType;
      const meta = modal.querySelector("#evidenceReviewModalMeta");
      if (meta) meta.textContent = activeRow.querySelector(".evidence-review-environment-list")?.textContent.trim() || "Evidence review item";
      const preview = modal.querySelector("[data-evidence-review-preview]");
      if (preview) {
        preview.innerHTML = "";
        preview.hidden = true;
      }
      openAccessibleModal(modal, { initialFocusSelector: 'textarea[name="comments"]', onRequestClose: closeModal });
    });
  });
  modal?.querySelectorAll(".evidence-review-modal-close, .evidence-review-modal-close-action").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modalForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!activeRow) return;
    const validation = validateEvidenceReviewModalForm(modalForm);
    if (!applyInlineValidationResult(modalForm, validation, "Review the highlighted evidence review fields before saving.")) {
      return;
    }
    const nextStatus = modalForm.elements.status.value;
    activeRow.querySelector('input[name="comments"]').value = modalForm.elements.comments.value;
    activeRow.querySelector('input[name="followUpQuestions"]').value = modalForm.elements.followUpQuestions.value;
    activeRow.querySelector('input[name="faceToFaceRequired"]').value = modalForm.elements.faceToFaceRequired.checked ? "true" : "false";
    activeRow.querySelector('input[name="status"]').value = nextStatus;
    if (nextStatus === "Reviewed") {
      const followUpStatusInput = activeRow.querySelector('input[name="followUpStatus"]');
      if (followUpStatusInput) followUpStatusInput.value = "Confirmed";
    }
    updateStatusPill(activeRow, nextStatus);
    const saved = await saveEvidenceReviews(event.submitter);
    if (saved) closeModal();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveEvidenceReviews(event.submitter);
  });
}
