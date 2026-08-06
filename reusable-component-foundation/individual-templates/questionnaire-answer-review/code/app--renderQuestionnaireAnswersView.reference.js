/* Reference extract: renderQuestionnaireAnswersView(...) from app/src/app.js:39322-39349. */

function renderQuestionnaireAnswersView(questions, answers = {}) {
  return `
    <div class="questionnaire-answer-view-list">
      ${questions.map((question, index) => `
        <section class="questionnaire-answer-view-question">
          <div class="questionnaire-answer-view-heading">
            <h4>${escapeHtml(question.number)}. ${escapeHtml(question.title)}</h4>
            <button class="icon-only questionnaire-answer-question-edit" type="button" data-question-step="${index + 1}" title="Edit this question" aria-label="Edit ${escapeHtml(question.title)}">
              <svg><use href="#icon-edit"></use></svg>
            </button>
          </div>
          <p class="small-note">${escapeHtml(question.prompt)}</p>
          <div class="questionnaire-answer-view-items">
            ${question.inputs.map((input) => {
              const value = answers?.[question.id]?.[input.key] || "";
              return `
                <article class="questionnaire-answer-view-item">
                  <strong>${escapeHtml(input.key)}. ${escapeHtml(input.label)}</strong>
                  <p>${value ? escapeHtml(value) : "<span class=\"muted\">No answer yet</span>"}</p>
                </article>
              `;
            }).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}
