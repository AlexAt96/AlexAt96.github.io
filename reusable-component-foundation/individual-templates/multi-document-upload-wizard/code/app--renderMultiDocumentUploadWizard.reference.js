/* Reference extract: renderMultiDocumentUploadWizard(...) from app/src/app.js:9761-9811. */

function renderMultiDocumentUploadWizard({ id, formId, titleId, eyebrow, title, description, businessUnitId, rows, documentTypes, submitLabel, acceptedFormats }) {
  return renderWizard({
    id,
    formId,
    titleId,
    eyebrow,
    title,
    description,
    dataAttributes: { "business-unit-id": businessUnitId },
    submitLabel,
    steps: [
      {
        label: "Select environments",
        body: `
          <label class="multi-doc-select-all">
            <input class="multi-doc-select-all-input" type="checkbox" />
            <span>Select all environments</span>
          </label>
          <div class="multi-doc-environment-picker">
            ${rows.map((row) => `
              <label>
                <input class="multi-doc-environment" type="checkbox" value="${escapeHtml(row.environmentId)}" data-environment-name="${escapeHtml(row.environmentName)}" data-workspace-id="${escapeHtml(row.workspaceId)}" data-workspace-name="${escapeHtml(row.workspaceName)}" />
                <span>
                  <strong>${escapeHtml(row.environmentName)}</strong>
                  <small>${escapeHtml(row.workspaceName || row.workspaceId || "No workspace linked")}</small>
                </span>
              </label>
            `).join("")}
          </div>
        `,
      },
      {
        label: "Upload documents",
        body: `
          <div class="multi-doc-groups">
            ${renderMultiDocumentUploadGroup(documentTypes, acceptedFormats, 1)}
          </div>
          <button class="icon-button ghost multi-doc-add-group" type="button">
            <svg><use href="#icon-plus"></use></svg>
            <span>Add another document type</span>
          </button>
        `,
      },
      {
        label: "Submit",
        heading: "Submit and link documents",
        body: `<p class="small-note">Each selected file is stored once. The app links that stored document to every selected environment and tags it with the selected document type.</p>`,
      },
    ],
  });
}
