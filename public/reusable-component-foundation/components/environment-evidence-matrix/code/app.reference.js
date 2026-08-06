/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderCollectionDashboard(phase, item, bu = getSelectedBu()) {
  return `
    ${detailHeader("BU extraction dashboard", "BU leads can see their required tasks, uploads, and questionnaire response status.")}
    <div class="button-row page-action-row">
      <a class="icon-button primary" href="${documentUrl("bu-data-collection", "upload-register", bu.id)}">
        <svg><use href="#icon-arrow"></use></svg>
        <span>Open upload register</span>
      </a>
    </div>
    ${table(
      ["BU", "Environments", "Uploads expected", "Uploads received", "Questionnaire"],
      getContextBusinessUnits(bu).map((rowBu) => [
        rowBu.name,
        rowBu.environments.length,
        calcText(5 * rowBu.environments.length, "Uploads expected = five upload types per in-scope environment: sizing, Terraform, ADF profile, data dictionary, architecture diagram."),
        calcText(Math.max(2, rowBu.environments.length * 3), "Uploads received = three received uploads per environment with a minimum of two for seeded workspace data."),
        "Draft",
      ]),
      "BU extraction dashboard.",
      true,
    )}
  `;
}

function renderCollectionEvidenceMatrix(phase, bu) {
  const products = getCollectionMatrixProducts(bu);
  const overallProgress = getCollectionProductsEvidenceProgress(products, bu);
  return `
    <section class="panel collection-matrix-panel" id="collection-completeness">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Collection completeness</p>
          <h3>Environment evidence matrix</h3>
        </div>
        <span class="pill">${products.length} Databricks product${products.length === 1 ? "" : "s"}</span>
      </div>
      <p class="small-note">Rows are grouped by Databricks Product. Expand a product and each evidence category to see detailed completion by environment.</p>
      <div class="collection-overall-progress">
        <div>
          <p class="eyebrow">Overall evidence status</p>
          <strong>${formatEvidenceProgressPercent(overallProgress.complete, overallProgress.total)} complete</strong>
        </div>
        ${renderCollectionEvidenceProgressBar(overallProgress, "large")}
      </div>
      <div class="collection-matrix-stack">
        ${products.map((product) => renderCollectionProductMatrix(product, bu, false)).join("")}
      </div>
    </section>
  `;
}

function getCollectionProductEvidenceProgress(product, bu) {
  const counts = { complete: 0, inProgress: 0, missing: 0, total: 0 };
  product.environments.forEach((env) => {
    getCollectionEvidenceGroups(bu, env).forEach((group) => {
      group.items.forEach((item) => {
        counts.total += 1;
        if (item.status === "complete") counts.complete += 1;
        else if (item.status === "in-progress") counts.inProgress += 1;
        else counts.missing += 1;
      });
    });
  });
  return counts;
}

function getCollectionProductsEvidenceProgress(products, bu) {
  return products.reduce(
    (total, product) => {
      const progress = getCollectionProductEvidenceProgress(product, bu);
      total.complete += progress.complete;
      total.inProgress += progress.inProgress;
      total.missing += progress.missing;
      total.total += progress.total;
      return total;
    },
    { complete: 0, inProgress: 0, missing: 0, total: 0 },
  );
}

function renderCollectionEvidenceProgressBar(progress, size = "") {
  const total = progress.total || 1;
  const completePct = (progress.complete / total) * 100;
  const inProgressPct = (progress.inProgress / total) * 100;
  const missingPct = (progress.missing / total) * 100;
  const label = `${progress.complete} done, ${progress.inProgress} in progress, ${progress.missing} not done`;
  return `
    <span class="collection-progress-summary ${escapeHtml(size)}" aria-label="${escapeHtml(label)}">
      <span class="collection-progress-bar" aria-hidden="true">
        <span class="collection-progress-segment complete" style="width: ${completePct}%"></span>
        <span class="collection-progress-segment in-progress" style="width: ${inProgressPct}%"></span>
        <span class="collection-progress-segment missing" style="width: ${missingPct}%"></span>
      </span>
      <span class="collection-progress-legend">
        <span><i class="legend-dot complete"></i>Done ${formatEvidenceProgressPercent(progress.complete, total)}</span>
        <span><i class="legend-dot in-progress"></i>In progress ${formatEvidenceProgressPercent(progress.inProgress, total)}</span>
        <span><i class="legend-dot missing"></i>Not done ${formatEvidenceProgressPercent(progress.missing, total)}</span>
      </span>
    </span>
  `;
}

function getCollectionEvidenceGroups(bu, env) {
  const scriptItems = [
    { key: "terraform-exporter-output", label: "Terraform and DBx metadata" },
    { key: "sizing-output", label: "Sizing output" },
    { key: "adf-profile-output", label: "ADF profiler" },
    { key: "data-dictionary-output", label: "Data dictionary" },
  ]
    .filter((script) => isScriptOutputRequiredForEnvironment(script.key, env))
    .map((script) => ({
      label: script.label,
      status: getScriptEvidenceStatus(bu.id, script.key, env),
    }));
  return [
    {
      label: "Architecture",
      items: ARCHITECTURE_DIAGRAM_TYPES.map((type) => ({
        label: type,
        status: getArchitectureEvidenceStatus(bu.id, env, type),
      })),
    },
    {
      label: "Qualitative data",
      items: [
        { label: "Data product definitions", status: env.databricksProductName ? "complete" : "missing" },
        { label: "BU-wide questionnaire", status: getQuestionnaireEvidenceStatus(bu.id, "bu-wide") },
        { label: "Product questionnaire", status: getQuestionnaireEvidenceStatus(bu.id, "product", env.databricksProductId) },
      ],
    },
    {
      label: "Scripts",
      items: scriptItems,
    },
  ];
}

function getEvidenceGroupStatus(items) {
  if (items.every((item) => item.status === "complete")) return "complete";
  if (items.some((item) => item.status === "complete" || item.status === "in-progress")) return "in-progress";
  return "missing";
}

function renderEvidenceStatusIcon(status) {
  const icon = status === "complete" ? "icon-check" : status === "in-progress" ? "icon-hourglass" : "icon-x";
  const label = status === "complete" ? "Complete" : status === "in-progress" ? "In progress" : "Missing";
  return `<span class="evidence-status-icon ${escapeHtml(status)}" title="${label}"><svg><use href="#${icon}"></use></svg></span>`;
}

function renderEnvironmentTaskList(phase, item, bu = getSelectedBu()) {
  return `
    ${detailHeader("Environment-specific task list", "Each required script is run on the relevant Databricks instance or environment.")}
    ${table(
      ["BU", "Environment", "Sizing", "Terraform and DBx metadata", "ADF profile", "Data dictionary"],
      getContextBusinessUnits(bu).flatMap((rowBu) => rowBu.environments.map((env) => [rowBu.name, env, "Uploaded", "Uploaded", env.includes("dev") ? "Draft" : "Uploaded", "Not started"])),
      "Environment task status.",
    )}
  `;
}
