/* Reference extract: renderQuestionnaireAnswerWizard(...) from app/src/app.js:10075-10117. */

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
