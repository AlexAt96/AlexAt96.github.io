/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

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

function renderPhaseFeedbackSection(phase, bu = null) {
  const feedbackItems = getOpenFeedbackItemsForPhase(phase, bu);
  if (!feedbackItems.length) return "";
  return renderFeedbackSection(feedbackItems);
}

function renderFeedbackSection(items = []) {
  if (!items.length) return "";
  return `
    <section class="panel feedback-section" id="phase-feedback">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Feedback</p>
          <h3>Open review feedback</h3>
        </div>
        <span class="pill">${items.length} item${items.length === 1 ? "" : "s"}</span>
      </div>
      <div class="feedback-list">
        ${items.map(renderFeedbackItem).join("")}
      </div>
    </section>
  `;
}

function renderFeedbackItem(item) {
  const meta = [
    item.businessUnitName,
    item.createdAt ? `Sent ${formatDateTime(item.createdAt)}` : "Open",
    item.sourceSectionTitle ? `From ${item.sourceSectionTitle}` : "",
  ].filter(Boolean).join(" / ");
  return `
    <article class="feedback-item">
      <div>
        <span class="status-pill in-progress">In progress</span>
        <h4>${escapeHtml(item.taskTitle || "Task feedback")}</h4>
        <p>${escapeHtml(item.comment || "")}</p>
        <small>${escapeHtml(meta)}</small>
      </div>
      <a class="icon-button ghost" href="${escapeHtml(item.href)}">
        <svg><use href="#icon-arrow"></use></svg>
        <span>Open task</span>
      </a>
    </article>
  `;
}

function renderBuOutputDocumentFeedbackBanner(phase, item, bu, options = {}) {
  const definition = getBuOutputDocumentDefinitionForPage(phase.key, item.key);
  if (!definition || !bu?.id) return "";
  const review = getBuOutputDocumentReviewState(bu.id, definition.key);
  if (!["Feedback requested", "Feedback implemented"].includes(review.status) || !review.feedback) return "";
  const showMarkDone = options.showMarkDone && review.status === "Feedback requested";
  return `
    <section class="panel bu-output-feedback-banner" aria-label="BU output document feedback">
      <div>
        <p class="eyebrow">${escapeHtml(review.status)}</p>
        <h3>${escapeHtml(definition.title)}</h3>
        <p>${escapeHtml(review.feedback)}</p>
        ${review.implementationNote ? `<div class="bu-output-implementation-note"><strong>What was done:</strong> ${escapeHtml(review.implementationNote)}</div>` : ""}
        ${review.updatedAt ? `<small>Updated ${escapeHtml(formatDateTime(review.updatedAt))}</small>` : ""}
      </div>
      <div class="bu-output-feedback-actions">
        ${showMarkDone ? `
          <button class="icon-button primary bu-output-feedback-done" type="button" data-business-unit-id="${escapeHtml(bu.id)}" data-document-key="${escapeHtml(definition.key)}">
            <svg><use href="#icon-check"></use></svg>
            <span>What has been done</span>
          </button>
        ` : ""}
        <a class="icon-button ghost" href="${documentUrl("outputs", "per-bu-outputs", bu.id)}">
          <svg><use href="#icon-arrow-left"></use></svg>
          <span>Back to BU outputs</span>
        </a>
      </div>
    </section>
  `;
}

function getOpenTaskFeedback(businessUnitId, sectionKey) {
  const feedback = getBuScreenInstance(businessUnitId, sectionKey)?.review_feedback;
  if (!feedback || typeof feedback !== "object" || feedback.status !== "open" || !feedback.comment) return null;
  return feedback;
}

function getOpenFeedbackItemsForPhase(phase, bu = null) {
  const sectionKeys = new Set((phase?.sections || []).map((section) => section.key));
  if (!sectionKeys.size) return [];
  return (serverWorkspace?.screen_instances || [])
    .filter((screen) => {
      const sectionKey = screen.section_key || screen.screen_definition_id || "";
      if (!sectionKeys.has(sectionKey)) return false;
      const feedback = screen.review_feedback;
      if (!feedback || typeof feedback !== "object" || feedback.status !== "open" || !feedback.comment) return false;
      if (isBuScopedPhase(phase.key)) return screen.business_unit_id === bu?.id;
      return phase.key === "initiation" ? true : !screen.business_unit_id;
    })
    .map((screen) => buildFeedbackItemFromScreen({
      screen,
      phaseKey: phase.key,
      section: getSection(phase, screen.section_key || screen.screen_definition_id),
      bu: getBusinessUnit(screen.business_unit_id) || bu || null,
    }))
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function buildFeedbackItemFromScreen({ screen, phaseKey, section, bu }) {
  const feedback = screen?.review_feedback;
  if (!feedback || typeof feedback !== "object" || feedback.status !== "open" || !feedback.comment) return null;
  const sectionKey = screen.section_key || screen.screen_definition_id || section?.key || "";
  const businessUnitId = screen.business_unit_id || bu?.id || "";
  return {
    taskTitle: section?.title || feedback.source_section_title || sectionKey || "Task feedback",
    businessUnitName: bu?.name || businessUnitId || "",
    comment: feedback.comment || "",
    sourceSectionTitle: feedback.source_section_title || "",
    createdAt: feedback.created_at || "",
    href: getFeedbackTaskUrl(phaseKey, sectionKey, businessUnitId),
  };
}

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

async function sendBuTechReportSectionFeedback(button, comment, statusElement) {
  if (!SERVER_MODE) {
    if (statusElement) statusElement.textContent = "Run the local server to send task feedback.";
    return;
  }
  const businessUnitId = button.dataset.businessUnitId || "";
  const sectionKey = button.dataset.sectionKey || "";
  if (!businessUnitId || !sectionKey) return;
  button.disabled = true;
  if (statusElement) statusElement.textContent = "Sending feedback and moving the task back to In progress...";
  try {
    const result = await apiRequest(`/api/business-units/${encodeURIComponent(businessUnitId)}/screens/${encodeURIComponent(sectionKey)}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status: "In progress",
        feedback: {
          comment,
          sourceSectionKey: button.dataset.reportSectionKey || "",
          sourceSectionTitle: button.dataset.reportSectionTitle || "",
        },
      }),
    });
    if (result.screen) {
      const screens = serverWorkspace.screen_instances || [];
      const index = screens.findIndex((screen) => screen.screen_instance_id === result.screen.screen_instance_id);
      if (index >= 0) screens[index] = result.screen;
      else screens.push(result.screen);
      serverWorkspace.screen_instances = screens;
    }
    if (statusElement) statusElement.textContent = "Feedback sent. Refreshing section status...";
    reloadAppAfterStatusUpdate(result.screen?.status || "In progress", button);
  } catch (error) {
    if (statusElement) statusElement.textContent = `Feedback could not be sent: ${formatApiError(error)}`;
  } finally {
    button.disabled = false;
  }
}
