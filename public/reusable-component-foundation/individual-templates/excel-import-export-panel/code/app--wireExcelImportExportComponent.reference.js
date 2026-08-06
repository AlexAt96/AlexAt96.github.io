/* Reference extract: wireExcelImportExportComponent(...) from app/src/app.js:35077-35103. */

function wireExcelImportExportComponent({ componentId, download, parseFile, emptyMessage, onRows, errorPrefix }) {
  const status = document.querySelector(`#${componentId}Status`);
  document.querySelector(`#${componentId}DownloadTemplate`)?.addEventListener("click", () => {
    download();
  });
  document.querySelector(`#${componentId}Upload`)?.addEventListener("change", async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (status) status.textContent = `Reading ${file.name}...`;
    try {
      const rows = await parseFile(file);
      if (!rows.length) {
        if (status) status.textContent = emptyMessage;
        showAppAlert(emptyMessage);
        return;
      }
      onRows(rows, file);
    } catch (error) {
      const message = `${errorPrefix}: ${error.message || error}`;
      if (status) status.textContent = `Import failed: ${error.message || error}`;
      showAppAlert(message);
    } finally {
      input.value = "";
    }
  });
}
