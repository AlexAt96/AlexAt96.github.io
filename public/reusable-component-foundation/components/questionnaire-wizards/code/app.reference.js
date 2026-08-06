/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderWizard({ id, formId, titleId, eyebrow, title, description = "", dataAttributes = {}, hiddenFields = [], steps = [], submitLabel = "Submit" }) {
  const dataAttributeText = Object.entries(dataAttributes)
    .map(([key, value]) => `data-${key}="${escapeHtml(value)}"`)
    .join(" ");
  const hiddenFieldText = hiddenFields
    .map((field) => `<input type="hidden" name="${escapeHtml(field.name)}" value="${escapeHtml(field.value || "")}" />`)
    .join("");
  return `
    <div class="wizard-overlay" id="${escapeHtml(id)}" hidden>
      <section class="wizard-panel" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(titleId)}">
        <div class="wizard-header">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h3 id="${escapeHtml(titleId)}">${escapeHtml(title)}</h3>
            ${description ? `<p class="small-note">${escapeHtml(description)}</p>` : ""}
          </div>
          <button class="icon-only wizard-close" type="button" title="Close wizard"><svg><use href="#icon-x"></use></svg></button>
        </div>
        <form class="wizard-form" id="${escapeHtml(formId)}" ${dataAttributeText} data-wizard-total-steps="${steps.length}">
          ${hiddenFieldText}
          <div class="wizard-stepper" aria-label="Wizard steps">
            ${steps.map((step, index) => `<button class="wizard-step-tab ${index === 0 ? "active" : ""}" type="button" data-wizard-step="${index + 1}">${index + 1}. ${escapeHtml(step.label)}</button>`).join("")}
          </div>
          ${steps.map((step, index) => `
            <div class="wizard-step ${index === 0 ? "active" : ""}" data-wizard-panel="${index + 1}">
              <h4>${escapeHtml(step.heading || step.label)}</h4>
              ${step.body || ""}
            </div>
          `).join("")}
          <div class="wizard-footer">
            <button class="icon-button ghost wizard-prev" type="button"><svg><use href="#icon-arrow-left"></use></svg><span>Back</span></button>
            <button class="icon-button ghost wizard-next" type="button"><svg><use href="#icon-arrow"></use></svg><span>Next</span></button>
            <button class="icon-button primary wizard-submit" type="submit"><svg><use href="#icon-upload"></use></svg><span>${escapeHtml(submitLabel)}</span></button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderQuestionnaireResponse(phase, item, bu = getSelectedBu()) {
  const activeBu = bu || businessUnits[0];
  const scopeRows = getScopeRecordsForBu(activeBu).filter((row) => row.inScope !== false);
  const products = getDatabricksProductsForBu(activeBu);
  const buWideResponse = getQuestionnaireResponse(activeBu.id, "bu-wide");
  return `
    ${detailHeader("Questionnaire response", "BU leads answer discovery questions directly in the tool and can save progress before submitting.")}
    <section class="questionnaire-page">
      <details class="panel questionnaire-section-card" data-questionnaire-section-key="${escapeHtml(getQuestionnaireSectionKey(activeBu.id, "section-1"))}"${isQuestionnaireSectionOpen(activeBu.id, "section-1", false) ? " open" : ""}>
        <summary class="questionnaire-section-summary">
          <span class="disclosure-icon contributor-disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
          <div>
            <p class="eyebrow">Section 1</p>
            <h3>Databricks product definitions</h3>
            <p class="small-note">Group in-scope environments that support the same logical Databricks product or capability.</p>
          </div>
          <span class="status-pill ${products.length ? "completed" : "not-started"}">${products.length ? `${products.length} products defined` : "Not started"}</span>
        </summary>
        <div class="questionnaire-section-body">
          <p class="small-note">A Databricks Product is a logical product or capability delivered using Databricks that may span multiple environments, such as Dev, Test, Pre-prod, and Prod workspaces.</p>
          <div class="questionnaire-product-summary">
            ${scopeRows.length ? scopeRows.map((row) => `
              <div class="questionnaire-product-summary-row">
                <span><strong>${escapeHtml(row.environmentName || row.environmentType || "Environment")}</strong><small>${escapeHtml(row.workspaceName || row.workspaceId || "No workspace name")}</small></span>
                ${renderDataProductSelect(row, products)}
              </div>
            `).join("") : `<p class="small-note">No in-scope environments are available for this BU yet.</p>`}
          </div>
        </div>
      </details>

      <details class="panel questionnaire-section-card" data-questionnaire-section-key="${escapeHtml(getQuestionnaireSectionKey(activeBu.id, "section-2"))}"${isQuestionnaireSectionOpen(activeBu.id, "section-2", false) ? " open" : ""}>
        <summary class="questionnaire-section-summary">
          <span class="disclosure-icon contributor-disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
          <div>
            <p class="eyebrow">Section 2</p>
            <h3>BU-wide questions</h3>
            <p class="small-note">Capture BU-wide Databricks strategy, workspace structure, constraints, and stakeholders.</p>
          </div>
          <span class="status-pill ${statusClass(buWideResponse?.status || "Not started")}">${escapeHtml(buWideResponse?.status || "Not started")}</span>
        </summary>
        <div class="questionnaire-section-body">
          <div class="button-row">
            <button class="icon-button primary questionnaire-answer-launch" type="button" data-wizard-id="buWideQuestionnaireWizard" data-section-type="bu-wide">
              <svg><use href="#icon-arrow"></use></svg>
              <span>Launch questionnaire</span>
            </button>
            <button class="icon-button ghost questionnaire-view-answers" type="button" data-section-type="bu-wide" data-wizard-id="buWideQuestionnaireWizard" data-title="${escapeHtml(activeBu.name)} BU-wide answers">
              <svg><use href="#icon-file"></use></svg>
              <span>View/edit</span>
            </button>
          </div>
        </div>
      </details>

      <details class="panel questionnaire-section-card" data-questionnaire-section-key="${escapeHtml(getQuestionnaireSectionKey(activeBu.id, "section-3"))}"${isQuestionnaireSectionOpen(activeBu.id, "section-3", false) ? " open" : ""}>
        <summary class="questionnaire-section-summary">
          <span class="disclosure-icon contributor-disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
          <div>
            <p class="eyebrow">Section 3</p>
            <h3>Per Databricks product questions</h3>
            <p class="small-note">Answer once per Databricks Product and call out environment differences where relevant.</p>
          </div>
          <span class="status-pill ${products.length ? "in-progress" : "not-started"}">${products.length ? `${products.length} products` : "Locked"}</span>
        </summary>
        <div class="questionnaire-section-body">
          ${products.length ? `
            <div class="questionnaire-product-grid">
              ${products.map((product) => {
                const response = getQuestionnaireResponse(activeBu.id, "product", product.productId);
                return `
                  <div class="questionnaire-product-card">
                    <div>
                      <strong>${escapeHtml(product.productName)}</strong>
                      <small>${escapeHtml(product.environments.join(", "))}</small>
                    </div>
                    <span class="status-pill ${statusClass(response?.status || "Not started")}">${escapeHtml(response?.status || "Not started")}</span>
                    <div class="questionnaire-product-actions">
                      <button class="icon-button primary questionnaire-answer-launch" type="button" data-wizard-id="productQuestionnaireWizard" data-section-type="product" data-product-id="${escapeHtml(product.productId)}" data-product-name="${escapeHtml(product.productName)}">
                        <svg><use href="#icon-arrow"></use></svg>
                        <span>Launch questionnaire</span>
                      </button>
                      <button class="icon-button ghost questionnaire-view-answers" type="button" data-section-type="product" data-wizard-id="productQuestionnaireWizard" data-product-id="${escapeHtml(product.productId)}" data-product-name="${escapeHtml(product.productName)}" data-title="${escapeHtml(product.productName)} answers">
                        <svg><use href="#icon-file"></use></svg>
                        <span>View/edit</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `
            <div class="empty-state-inline">
              <p class="small-note">Define Databricks Products in Section 1 before completing product-level questionnaires.</p>
            </div>
          `}
        </div>
      </details>
    </section>
    ${renderDataProductModal(activeBu, scopeRows)}
    ${renderQuestionnaireAnswerWizard({
      id: "buWideQuestionnaireWizard",
      formId: "buWideQuestionnaireForm",
      titleId: "buWideQuestionnaireTitle",
      eyebrow: "BU-wide questionnaire",
      title: `${activeBu.name} BU-wide questions`,
      businessUnitId: activeBu.id,
      sectionType: "bu-wide",
      questions: BU_WIDE_QUESTIONNAIRE,
    })}
    ${renderQuestionnaireAnswerWizard({
      id: "productQuestionnaireWizard",
      formId: "productQuestionnaireForm",
      titleId: "productQuestionnaireTitle",
      eyebrow: "Product questionnaire",
      title: "Databricks product questions",
      businessUnitId: activeBu.id,
      sectionType: "product",
      questions: PRODUCT_QUESTIONNAIRE,
    })}
    ${renderQuestionnaireAnswersModal(activeBu.id)}
  `;
}

function renderQuestionnaireAnswerWizard({ id, formId, titleId, eyebrow, title, businessUnitId, sectionType, questions }) {
  return `
    <div class="wizard-overlay" id="${escapeHtml(id)}" hidden>
      <section class="wizard-panel questionnaire-wizard-panel" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(titleId)}">
        <div class="wizard-header">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h3 id="${escapeHtml(titleId)}">${escapeHtml(title)}</h3>
            <p class="small-note questionnaire-product-context" hidden></p>
          </div>
          <button class="icon-only wizard-close" type="button" title="Close wizard"><svg><use href="#icon-x"></use></svg></button>
        </div>
        <form class="wizard-form questionnaire-answer-form" id="${escapeHtml(formId)}" data-business-unit-id="${escapeHtml(businessUnitId)}" data-section-type="${escapeHtml(sectionType)}" data-wizard-title="${escapeHtml(title)}" data-wizard-total-steps="${questions.length}">
          <input type="hidden" name="productId" value="" />
          <input type="hidden" name="productName" value="" />
          <div class="wizard-stepper" aria-label="Questionnaire questions">
            ${questions.map((question, index) => `<button class="wizard-step-tab ${index === 0 ? "active" : ""}" type="button" data-wizard-step="${index + 1}">${escapeHtml(question.number)}. ${escapeHtml(question.title)}</button>`).join("")}
          </div>
          ${questions.map((question, index) => `
            <div class="wizard-step ${index === 0 ? "active" : ""}" data-wizard-panel="${index + 1}" data-question-id="${escapeHtml(question.id)}">
              <h4>${escapeHtml(question.number)}. ${escapeHtml(question.title)}</h4>
              <p class="small-note">${escapeHtml(question.prompt)}</p>
              <div class="questionnaire-answer-grid">
                ${question.inputs.map((input) => `
                  <label>
                    <span>${escapeHtml(input.key)}. ${escapeHtml(input.label)}</span>
                    <textarea name="answer-${escapeHtml(question.id)}-${escapeHtml(input.key)}" rows="5" placeholder="Optional free text"></textarea>
                  </label>
                `).join("")}
              </div>
            </div>
          `).join("")}
          <div class="wizard-footer">
            <button class="icon-button ghost wizard-prev" type="button"><svg><use href="#icon-arrow-left"></use></svg><span>Back</span></button>
            <button class="icon-button ghost wizard-next" type="button"><svg><use href="#icon-arrow"></use></svg><span>Next</span></button>
            <button class="icon-button ghost questionnaire-save-progress" type="button"><svg><use href="#icon-save"></use></svg><span>Save progress</span></button>
            <button class="icon-button primary wizard-submit" type="submit"><svg><use href="#icon-check"></use></svg><span>Submit answers</span></button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderQuestionnaireAnswersModal(businessUnitId) {
  return `
    <div class="wizard-overlay" id="questionnaireAnswersModal" hidden>
      <section class="wizard-panel questionnaire-answer-view-panel" role="dialog" aria-modal="true" aria-labelledby="questionnaireAnswersModalTitle">
        <div class="wizard-header">
          <div>
            <p class="eyebrow">Questionnaire answers</p>
            <h3 id="questionnaireAnswersModalTitle">Answers</h3>
            <p class="small-note" id="questionnaireAnswersModalMeta"></p>
          </div>
          <button class="icon-only wizard-close" type="button" title="Close answers"><svg><use href="#icon-x"></use></svg></button>
        </div>
        <div class="questionnaire-answer-view-body" id="questionnaireAnswersModalBody"></div>
        <div class="wizard-footer questionnaire-answer-view-footer">
          <button class="icon-button ghost questionnaire-answers-close" type="button"><svg><use href="#icon-x"></use></svg><span>Close</span></button>
          <button class="icon-button primary questionnaire-answers-edit" type="button" data-business-unit-id="${escapeHtml(businessUnitId)}">
            <svg><use href="#icon-edit"></use></svg>
            <span>Edit answers</span>
          </button>
        </div>
      </section>
    </div>
  `;
}

function wireQuestionnaireAnswerWizard({ wizardId, formId, launchSelector, questions }) {
  const controller = wireWizardActions({
    wizardId,
    formId,
    launchSelector,
    onLaunch: ({ button, form, wizard }) => {
      form.dataset.sectionType = button.dataset.sectionType || form.dataset.sectionType || "";
      form.querySelector('input[name="productId"]').value = button.dataset.productId || "";
      form.querySelector('input[name="productName"]').value = button.dataset.productName || "";
      const title = wizard.querySelector("h3");
      const context = wizard.querySelector(".questionnaire-product-context");
      if (button.dataset.productName) {
        if (title) title.textContent = `${button.dataset.productName} questions`;
        if (context) {
          context.hidden = false;
          context.textContent = "All answers are optional. Save progress to return later, or submit when ready.";
        }
      } else {
        if (title) title.textContent = form.dataset.wizardTitle || "Questionnaire";
        if (context) {
          context.hidden = false;
          context.textContent = "All answers are optional. Save progress to return later, or submit when ready.";
        }
      }
      populateQuestionnaireAnswers(form, questions);
    },
    onSubmit: async ({ form }) => {
      await saveQuestionnaireAnswers(form, questions, true);
    },
  });
  if (!controller) return;
  const { form } = controller;
  form.querySelector(".questionnaire-save-progress")?.addEventListener("click", async () => {
    await saveQuestionnaireAnswers(form, questions, false);
  });
}

async function saveQuestionnaireAnswers(form, questions, submitted) {
  if (!SERVER_MODE) {
    showAppAlert("Run the local server to save questionnaire answers, then open http://127.0.0.1:4317/.");
    return;
  }
  const actionButton = submitted ? form.querySelector(".wizard-submit") : form.querySelector(".questionnaire-save-progress");
  if (actionButton) actionButton.disabled = true;
  try {
    await apiRequest(`/api/business-units/${encodeURIComponent(form.dataset.businessUnitId)}/questionnaire/responses`, {
      method: "PUT",
      body: JSON.stringify({
        sectionType: form.dataset.sectionType || "",
        productId: form.querySelector('input[name="productId"]')?.value || "",
        productName: form.querySelector('input[name="productName"]')?.value || "",
        submitted,
        answers: getQuestionnaireAnswerPayload(form, questions),
      }),
    });
    reloadApp();
  } catch (error) {
    showAppAlert(`The questionnaire answers could not be saved: ${error.message || error}`);
  } finally {
    if (actionButton) actionButton.disabled = false;
  }
}

function renderTerraformExporterWizard(bu, firstRow = {}) {
  const environmentOptions = getTerraformExporterRows(bu)
    .map((row) => `<option value="${escapeHtml(row.environmentName)}" data-environment-id="${escapeHtml(row.environmentId)}" data-workspace-id="${escapeHtml(row.workspaceId)}" data-workspace-name="${escapeHtml(row.workspaceName)}">${escapeHtml(row.environmentName)} / ${escapeHtml(row.workspaceName || row.workspaceId)}</option>`)
    .join("");
  return renderWizard({
    id: "terraformExporterWizard",
    formId: "terraformExporterWizardForm",
    titleId: "terraformWizardTitle",
    eyebrow: "Terraform and Databricks Metadata wizard",
    title: "Run Terraform and metadata collection",
    description: "Export Terraform metadata, upload it, complete the metadata checks, then run the Databricks catalogue runbook for the selected environment.",
    dataAttributes: { "business-unit-id": bu.id },
    hiddenFields: [
      { name: "environmentId", value: firstRow.environmentId || "" },
      { name: "workspaceId", value: firstRow.workspaceId || "" },
      { name: "workspaceName", value: firstRow.workspaceName || "" },
    ],
    submitLabel: "Upload evidence",
    steps: [
      {
        label: "Select environment",
        body: `
          <label>
            <span>Environment</span>
            <select name="environmentName">${environmentOptions}</select>
          </label>
        `,
      },
      {
        label: "Prepare access",
        body: `
          <ul class="wizard-checklist">
            <li>Confirm workspace admin permissions or an approved service principal.</li>
            <li>Confirm Terraform and the Databricks Terraform provider are available.</li>
            <li>Confirm the exporter and catalogue runbook are being run against the selected Databricks workspace.</li>
          </ul>
        `,
      },
      {
        label: "Export Terraform",
        heading: "Download and run Terraform exporter",
        body: `
          <div class="button-row">
            <a class="icon-button ghost" href="downloads/scripts/databricks-terraform-exporter.ps1" download>
              <svg><use href="#icon-download"></use></svg>
              <span>Download Terraform exporter script</span>
            </a>
          </div>
          <div class="runbook-code">.\\databricks-terraform-exporter.ps1 -Profile &lt;workspace-profile&gt; -OutputDirectory .\\terraform-export</div>
          <p class="script-confirmation-text">Export Terraform for every in-scope environment and upload the generated evidence before continuing.</p>
        `,
      },
      {
        label: "Upload Terraform",
        body: `
          <label>
            <span>Terraform output files</span>
            <input name="terraformFiles" type="file" multiple accept=".zip,.tf,.tfvars,.json,.xlsx,.xls,.csv,.txt,.log" />
          </label>
          <p class="small-note">Files are tagged as Terraform and Databricks Metadata against the selected BU environment and workspace.</p>
          <p class="script-confirmation-text">This upload should represent the Terraform export evidence for the selected environment.</p>
        `,
      },
      {
        label: "Metadata steps",
        heading: "Complete metadata checks",
        body: `
          <ul class="wizard-checklist script-confirmation-text">
            <li>Validate exported Terraform resources against the workspace scope.</li>
            <li>Identify any resources that need manual review before migration assessment.</li>
            <li>Capture any missing metadata or known exporter limitations.</li>
          </ul>
        `,
      },
      {
        label: "Catalogue runbook",
        heading: "Run Databricks catalogue runbook",
        body: `
          <div class="button-row">
            <a class="icon-button ghost" href="downloads/scripts/extraction_of_catalogs.dbc" download>
              <svg><use href="#icon-download"></use></svg>
              <span>Download catalogue notebook</span>
            </a>
          </div>
          <p class="script-confirmation-text">Run the catalogue runbook on every in-scope environment after Terraform evidence has been uploaded.</p>
          <p class="small-note">The catalogue output is treated as part of the Terraform and Databricks Metadata evidence set for this task.</p>
        `,
      },
      {
        label: "Save evidence",
        heading: "Save to BU document register",
        body: `<p class="small-note">Saving stores the uploaded files, tags the environment and document type, updates the upload register, and records a source register entry.</p>`,
      },
    ],
  });
}

function renderScriptOutputWizard(bu, item, firstRow = {}) {
  const runbook = getCollectionRunbookStep(item.key);
  const config = getScriptOutputConfig(item.key);
  const rows = getScriptOutputRows(bu, item.key);
  const environmentOptions = rows
    .map((row) => `<option value="${escapeHtml(row.environmentName)}" data-environment-id="${escapeHtml(row.environmentId)}" data-workspace-id="${escapeHtml(row.workspaceId)}" data-workspace-name="${escapeHtml(row.workspaceName)}">${escapeHtml(row.environmentName)} / ${escapeHtml(row.workspaceName || row.workspaceId)}</option>`)
    .join("");
  const scriptDownloads = (runbook?.scriptFiles || [{ label: "Download script", path: runbook?.scriptPath || "" }])
    .map((file) => `
      <a class="icon-button ghost" href="${escapeHtml(file.path)}" download>
        <svg><use href="#icon-download"></use></svg>
        <span>${escapeHtml(file.label)}</span>
      </a>
    `)
    .join("");
  return renderWizard({
    id: "scriptOutputWizard",
    formId: "scriptOutputWizardForm",
    titleId: "scriptOutputWizardTitle",
    eyebrow: `${item.title} wizard`,
    title: `Run and upload ${item.title}`,
    description: "Download the approved artifact, run it for the selected production environment, then upload the generated evidence files.",
    dataAttributes: { "business-unit-id": bu.id, "section-key": item.key },
    hiddenFields: [
      { name: "sectionKey", value: item.key },
      { name: "environmentId", value: firstRow.environmentId || "" },
      { name: "workspaceId", value: firstRow.workspaceId || "" },
      { name: "workspaceName", value: firstRow.workspaceName || "" },
    ],
    submitLabel: "Upload evidence",
    steps: [
      {
        label: "Select environment",
        body: `
          <label>
            <span>Environment</span>
            <select name="environmentName">${environmentOptions}</select>
          </label>
          <p class="script-confirmation-text">${escapeHtml(runbook?.environmentRule || "Check the correct environment before running.")}</p>
        `,
      },
      {
        label: "Prepare access",
        body: `
          <div class="script-rule-banner">
            <strong>${escapeHtml(runbook?.environmentRule || "Environment rule")}</strong>
            <span>${escapeHtml(runbook?.prerequisiteText || "Check the prerequisites for this script.")}</span>
          </div>
          <p class="script-confirmation-text">${escapeHtml(runbook?.reads || "Check access and prerequisites before running.")}</p>
        `,
      },
      {
        label: "Download and run script",
        heading: `Download and run ${runbook?.scriptName || item.title}`,
        body: `
          <div class="button-row script-download-actions">
            ${scriptDownloads}
          </div>
          <div class="runbook-code">${escapeHtml(getScriptRunCommand(item.key))}</div>
          <p class="script-confirmation-text">${escapeHtml(runbook?.instructions || "Check the run instructions.")}</p>
        `,
      },
      {
        label: "Attach outputs",
        body: `
          <label>
            <span>Output files</span>
            <input name="scriptOutputFiles" type="file" multiple accept=".zip,.dbc,.xlsx,.xls,.csv,.json,.txt,.log,.xml" />
          </label>
          <p class="small-note">Files are tagged as ${escapeHtml(config.documentType)} against the selected BU production environment and workspace.</p>
        `,
      },
      {
        label: "Save evidence",
        heading: "Save to BU document register",
        body: `<p class="small-note">Saving stores the files, tags the environment and document type, updates the upload register, and records a source register entry.</p>`,
      },
    ],
  });
}

function renderMultiDocumentUploadWizard({ id, formId, titleId, eyebrow, title, description, businessUnitId, rows, documentTypes, submitLabel, acceptedFormats }) {
  return renderWizard({
    id,
    formId,
    titleId,
    eyebrow,
    title,
    description,
    dataAttributes: { "business-unit-id": businessUnitId },
    submitLabel,
    steps: [
      {
        label: "Select environments",
        body: `
          <label class="multi-doc-select-all">
            <input class="multi-doc-select-all-input" type="checkbox" />
            <span>Select all environments</span>
          </label>
          <div class="multi-doc-environment-picker">
            ${rows.map((row) => `
              <label>
                <input class="multi-doc-environment" type="checkbox" value="${escapeHtml(row.environmentId)}" data-environment-name="${escapeHtml(row.environmentName)}" data-workspace-id="${escapeHtml(row.workspaceId)}" data-workspace-name="${escapeHtml(row.workspaceName)}" />
                <span>
                  <strong>${escapeHtml(row.environmentName)}</strong>
                  <small>${escapeHtml(row.workspaceName || row.workspaceId || "No workspace linked")}</small>
                </span>
              </label>
            `).join("")}
          </div>
        `,
      },
      {
        label: "Upload documents",
        body: `
          <div class="multi-doc-groups">
            ${renderMultiDocumentUploadGroup(documentTypes, acceptedFormats, 1)}
          </div>
          <button class="icon-button ghost multi-doc-add-group" type="button">
            <svg><use href="#icon-plus"></use></svg>
            <span>Add another document type</span>
          </button>
        `,
      },
      {
        label: "Submit",
        heading: "Submit and link documents",
        body: `<p class="small-note">Each selected file is stored once. The app links that stored document to every selected environment and tags it with the selected document type.</p>`,
      },
    ],
  });
}

function openAccessibleModal(modal, { initialFocusSelector = "", onRequestClose = null } = {}) {
  if (!modal) return;
  const previousFocus = document.activeElement;
  const dialog = modal.matches?.("[role='dialog'], [role='alertdialog']")
    ? modal
    : modal.querySelector?.("[role='dialog'], [role='alertdialog']");
  if (dialog) {
    if (!dialog.hasAttribute("aria-modal")) dialog.setAttribute("aria-modal", "true");
    if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");
  }
  const closeHandler = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      const state = accessibleModalState.get(modal);
      if (typeof state?.onRequestClose === "function") state.onRequestClose();
      else closeAccessibleModal(modal);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(modal);
    if (!focusable.length) {
      event.preventDefault();
      modal.focus?.();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  accessibleModalState.set(modal, { previousFocus, closeHandler, onRequestClose });
  modal.hidden = false;
  if (!modal.hasAttribute("tabindex")) modal.setAttribute("tabindex", "-1");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", closeHandler, true);
  const focusTarget = initialFocusSelector ? modal.querySelector(initialFocusSelector) : null;
  const fallbackTarget = focusTarget || getFocusableElements(modal)[0] || dialog || modal;
  window.setTimeout(() => fallbackTarget?.focus?.({ preventScroll: true }), 0);
}

function closeAccessibleModal(modal, { restoreFocus = true } = {}) {
  if (!modal) return;
  const state = accessibleModalState.get(modal);
  modal.hidden = true;
  if (state?.closeHandler) document.removeEventListener("keydown", state.closeHandler, true);
  accessibleModalState.delete(modal);
  if (!hasOpenBlockingModal()) document.body.classList.remove("modal-open");
  if (restoreFocus && state?.previousFocus?.focus) state.previousFocus.focus({ preventScroll: true });
}
