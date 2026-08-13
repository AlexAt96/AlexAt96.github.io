/* Reference extract: sendBuTechReportSectionFeedback(...) from app/src/app.js:37161-37197. */

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
