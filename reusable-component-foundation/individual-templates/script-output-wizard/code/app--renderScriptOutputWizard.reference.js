/* Reference extract: renderScriptOutputWizard(...) from app/src/app.js:9516-9595. */

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
