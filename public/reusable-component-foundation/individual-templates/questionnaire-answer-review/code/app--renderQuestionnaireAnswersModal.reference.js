/* Reference extract: renderQuestionnaireAnswersModal(...) from app/src/app.js:10119-10142. */

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
