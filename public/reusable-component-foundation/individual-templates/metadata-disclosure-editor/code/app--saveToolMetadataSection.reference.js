/* Reference extract: saveToolMetadataSection(...) from app/src/app.js:35417-35435. */

async function saveToolMetadataSection({ button, endpoint, payload, sectionKey, currentStatus, errorPrefix }) {
  if (!SERVER_MODE) {
    showAppAlert("Run the local server to save tool metadata, then open http://127.0.0.1:4317/.");
    return;
  }
  if (button) button.disabled = true;
  try {
    await apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await markToolMetadataSectionInProgress(sectionKey, currentStatus);
    reloadApp();
  } catch (error) {
    showAppAlert(`${errorPrefix}: ${error.message || error}`);
  } finally {
    if (button) button.disabled = false;
  }
}
