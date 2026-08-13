/* Reference extract: renderWizard(...) from app/src/app.js:9379-9417. */

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
