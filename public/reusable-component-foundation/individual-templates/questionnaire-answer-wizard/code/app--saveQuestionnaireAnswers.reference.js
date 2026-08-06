/* Reference extract: saveQuestionnaireAnswers(...) from app/src/app.js:39175-39199. */

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
