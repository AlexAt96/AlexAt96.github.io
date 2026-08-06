/* Reference extract: renderTerraformExporterWizard(...) from app/src/app.js:9419-9514. */

function renderTerraformExporterWizard(bu, firstRow = {}) {
  const environmentOptions = getTerraformExporterRows(bu)
    .map((row) => `<option value="${escapeHtml(row.environmentName)}" data-environment-id="${escapeHtml(row.environmentId)}" data-workspace-id="${escapeHtml(row.workspaceId)}" data-workspace-name="${escapeHtml(row.workspaceName)}">${escapeHtml(row.environmentName)} / ${escapeHtml(row.workspaceName || row.workspaceId)}</option>`)
    .join("");
  return renderWizard({
    id: "terraformExporterWizard",
    formId: "terraformExporterWizardForm",
    titleId: "terraformWizardTitle",
    eyebrow: "Terraform and Databricks Metadata wizard",
    title: "Run Terraform and metadata collection",
    description: "Export Terraform metadata, upload it, complete the metadata checks, then run the Databricks catalogue runbook for the selected environment.",
    dataAttributes: { "business-unit-id": bu.id },
    hiddenFields: [
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
        `,
      },
      {
        label: "Prepare access",
        body: `
          <ul class="wizard-checklist">
            <li>Confirm workspace admin permissions or an approved service principal.</li>
            <li>Confirm Terraform and the Databricks Terraform provider are available.</li>
            <li>Confirm the exporter and catalogue runbook are being run against the selected Databricks workspace.</li>
          </ul>
        `,
      },
      {
        label: "Export Terraform",
        heading: "Download and run Terraform exporter",
        body: `
          <div class="button-row">
            <a class="icon-button ghost" href="downloads/scripts/databricks-terraform-exporter.ps1" download>
              <svg><use href="#icon-download"></use></svg>
              <span>Download Terraform exporter script</span>
            </a>
          </div>
          <div class="runbook-code">.\\databricks-terraform-exporter.ps1 -Profile &lt;workspace-profile&gt; -OutputDirectory .\\terraform-export</div>
          <p class="script-confirmation-text">Export Terraform for every in-scope environment and upload the generated evidence before continuing.</p>
        `,
      },
      {
        label: "Upload Terraform",
        body: `
          <label>
            <span>Terraform output files</span>
            <input name="terraformFiles" type="file" multiple accept=".zip,.tf,.tfvars,.json,.xlsx,.xls,.csv,.txt,.log" />
          </label>
          <p class="small-note">Files are tagged as Terraform and Databricks Metadata against the selected BU environment and workspace.</p>
          <p class="script-confirmation-text">This upload should represent the Terraform export evidence for the selected environment.</p>
        `,
      },
      {
        label: "Metadata steps",
        heading: "Complete metadata checks",
        body: `
          <ul class="wizard-checklist script-confirmation-text">
            <li>Validate exported Terraform resources against the workspace scope.</li>
            <li>Identify any resources that need manual review before migration assessment.</li>
            <li>Capture any missing metadata or known exporter limitations.</li>
          </ul>
        `,
      },
      {
        label: "Catalogue runbook",
        heading: "Run Databricks catalogue runbook",
        body: `
          <div class="button-row">
            <a class="icon-button ghost" href="downloads/scripts/extraction_of_catalogs.dbc" download>
              <svg><use href="#icon-download"></use></svg>
              <span>Download catalogue notebook</span>
            </a>
          </div>
          <p class="script-confirmation-text">Run the catalogue runbook on every in-scope environment after Terraform evidence has been uploaded.</p>
          <p class="small-note">The catalogue output is treated as part of the Terraform and Databricks Metadata evidence set for this task.</p>
        `,
      },
      {
        label: "Save evidence",
        heading: "Save to BU document register",
        body: `<p class="small-note">Saving stores the uploaded files, tags the environment and document type, updates the upload register, and records a source register entry.</p>`,
      },
    ],
  });
}
