/* Reference extract: wireQuestionnaireAnswerWizard(...) from app/src/app.js:39120-39155. */

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
