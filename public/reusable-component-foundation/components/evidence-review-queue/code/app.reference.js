/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderEvidenceReview(phase, item, bu = getSelectedBu()) {
  const documents = getEvidenceReviewDocumentsForBu(bu);
  const reviewedCount = documents.filter((document) => document.review.status === "Reviewed").length;
  const questionsCount = documents.filter((document) => document.review.status === "Questions").length;
  const f2fCount = documents.filter((document) => document.review.faceToFaceRequired).length;
  return `
    ${detailHeader("Evidence review", "Review BU uploads, capture questions, and flag items that need a follow-up conversation.")}
    <section class="panel evidence-review-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Document-level review</p>
          <h3>${escapeHtml(bu.name)} evidence register</h3>
        </div>
        <div class="evidence-review-summary">
          <span class="status-pill completed">${reviewedCount}/${documents.length} reviewed</span>
          <span class="status-pill in-review">${questionsCount} question${questionsCount === 1 ? "" : "s"}</span>
          <span class="status-pill ${f2fCount ? "in-progress" : "not-started"}">${f2fCount} face-to-face</span>
        </div>
      </div>
      ${documents.length ? `
        <form id="evidenceReviewForm" data-business-unit-id="${escapeHtml(bu.id)}">
          <div class="data-table-wrap evidence-review-table-wrap">
            <table class="data-table evidence-review-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Applicable environments</th>
                  <th>Review status</th>
                  <th>BU answer</th>
                  <th>Open / download</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                ${documents.map((document) => renderEvidenceReviewRow(document)).join("")}
              </tbody>
            </table>
          </div>
          <div class="form-actions evidence-review-actions">
            <p class="small-note" id="evidenceReviewSaveStatus">Open a row to capture review notes, questions, or discussion needs.</p>
            <button class="icon-button primary evidence-review-submit" type="submit" hidden>
              <svg><use href="#icon-save"></use></svg>
              <span>Save evidence review</span>
            </button>
          </div>
        </form>
        ${renderEvidenceReviewModal()}
      ` : `
        <div class="empty-state">
          <strong>No evidence ready for review yet.</strong>
          <span>Upload ${escapeHtml(bu.name)} documents in Collection and they will appear here.</span>
        </div>
      `}
    </section>
  `;
}

function renderEvidenceReviewRow(document) {
  return `
    <tr class="evidence-review-row" data-review-item-id="${escapeHtml(document.reviewItemId || document.uploadVersionId || document.artifactId || "")}" data-upload-version-id="${escapeHtml(document.uploadVersionId || "")}" data-artifact-id="${escapeHtml(document.artifactId || "")}" data-artifact-type="${escapeHtml(document.artifactType || "")}" data-assessment-id="${escapeHtml(document.assessmentId || "")}">
      <td class="evidence-review-document-cell">
        <strong>${escapeHtml(document.documentType)}</strong>
        ${document.meta ? `<small>${escapeHtml(document.meta)}</small>` : ""}
      </td>
      <td>
        <div class="evidence-review-environment-list">
          ${document.environments.map((environment) => `
            <span class="evidence-review-environment-pill" title="${escapeHtml(environment.meta || environment.label)}">${renderEnvironmentPillLabel(environment)}</span>
          `).join("")}
        </div>
      </td>
      <td>
        <span class="status-pill ${evidenceReviewStatusClass(document.review.status)}" data-review-status-label>${escapeHtml(document.review.status)}</span>
        ${renderEvidenceReviewFollowUpSummary(document.review)}
      </td>
      <td class="evidence-review-bu-answer-cell">
        ${renderEvidenceReviewBuAnswer(document.review)}
      </td>
      <td class="analysis-document-actions">
        ${document.viewUrl ? `<a class="icon-only architecture-doc-action" href="${escapeHtml(document.viewUrl)}" target="_blank" rel="noopener" title="View document" aria-label="View ${escapeHtml(document.documentType)}"><svg><use href="#icon-eye"></use></svg></a>` : ""}
        ${document.downloadUrl ? `<a class="icon-only architecture-doc-action" href="${escapeHtml(document.downloadUrl)}" download title="Download document" aria-label="Download ${escapeHtml(document.documentType)}"><svg><use href="#icon-download"></use></svg></a>` : ""}
      </td>
      <td>
        <button class="icon-only architecture-doc-action evidence-review-open" type="button" title="Review document" aria-label="Review ${escapeHtml(document.documentType)}">
          <svg><use href="#icon-edit"></use></svg>
        </button>
      </td>
      <td hidden>
        <input type="hidden" name="documentType" value="${escapeHtml(document.documentType)}" />
        <input type="hidden" name="artifactType" value="${escapeHtml(document.artifactType || "")}" />
        <input type="hidden" name="comments" value="${escapeHtml(document.review.comments)}" />
        <input type="hidden" name="followUpQuestions" value="${escapeHtml(document.review.followUpQuestions)}" />
        <input type="hidden" name="faceToFaceRequired" value="${document.review.faceToFaceRequired ? "true" : "false"}" />
        <input type="hidden" name="followUpStatus" value="${escapeHtml(document.review.followUpStatus)}" />
        <input type="hidden" name="followUpAnswer" value="${escapeHtml(document.review.followUpAnswer)}" />
        <input type="hidden" name="status" value="${escapeHtml(document.review.status)}" />
      </td>
    </tr>
  `;
}

function renderEvidenceReviewFollowUpSummary(review = {}) {
  const status = review.followUpStatus || "More info needed";
  if (review.status === "Reviewed" || status === "Confirmed") return "";
  if (!review.followUpQuestions && !review.faceToFaceRequired && !cleanFollowUpAnswerForClient(review.followUpAnswer)) return "";
  return `
    <div class="evidence-review-follow-up-summary">
      <span class="status-pill ${followUpStatusClass(status)}">${escapeHtml(status)}</span>
    </div>
  `;
}

function renderEvidenceReviewBuAnswer(review = {}) {
  const answer = cleanFollowUpAnswerForClient(review.followUpAnswer);
  if (answer) {
    return `
      <div class="evidence-review-bu-answer">
        <span class="field-label">BU answer</span>
        <p>${escapeHtml(answer)}</p>
      </div>
    `;
  }
  if (review.followUpQuestions || review.faceToFaceRequired) {
    return `
      <div class="evidence-review-bu-answer pending">
        <span class="field-label">BU answer</span>
        <p>Waiting for BU answer.</p>
      </div>
    `;
  }
  return `<span class="muted evidence-review-no-answer">No BU answer needed.</span>`;
}

function renderEvidenceReviewModal() {
  return `
    <div class="wizard-overlay evidence-review-modal" id="evidenceReviewModal" hidden>
      <section class="wizard-panel evidence-review-modal-panel" role="dialog" aria-modal="true" aria-labelledby="evidenceReviewModalTitle">
        <div class="wizard-header">
          <div>
            <p class="eyebrow">Evidence review</p>
            <h3 id="evidenceReviewModalTitle">Review evidence</h3>
            <p class="small-note" id="evidenceReviewModalMeta"></p>
          </div>
          <button class="icon-only evidence-review-modal-close" type="button" title="Close review"><svg><use href="#icon-x"></use></svg></button>
        </div>
        <form class="wizard-form evidence-review-modal-form" id="evidenceReviewModalForm">
          <input type="hidden" name="uploadVersionId" />
          <div class="evidence-review-modal-body">
            <section class="evidence-review-artifact-preview" data-evidence-review-preview hidden></section>
            <div class="evidence-review-modal-grid">
              <label>
                <span>Comments</span>
                <textarea name="comments" rows="7" placeholder="Add review notes, evidence quality comments, or assumptions."></textarea>
              </label>
              <label>
                <span>Follow-up questions</span>
                <textarea name="followUpQuestions" rows="7" placeholder="Add questions for the BU or delivery team."></textarea>
              </label>
              <section class="evidence-review-discussion-card">
                <div>
                  <span class="field-label">Face-to-face discussion</span>
                  <p class="small-note">Use this when written follow-up is not enough.</p>
                </div>
                <label class="checkbox-field">
                  <input type="checkbox" name="faceToFaceRequired" />
                  <span>Face-to-face discussion required</span>
                </label>
              </section>
              <section class="evidence-review-discussion-card evidence-review-follow-up-feedback">
                <div>
                  <span class="field-label">BU follow-up outcome</span>
                  <p class="small-note">Answers from BU Follow-up Notes appear here.</p>
                </div>
                <div class="evidence-review-follow-up-feedback-body">
                  <span class="status-pill not-started" data-follow-up-status-display>More info needed</span>
                  <p data-follow-up-answer-display>No BU answer yet.</p>
                </div>
              </section>
            </div>
          </div>
          <div class="wizard-footer evidence-review-modal-footer">
            <label class="evidence-review-modal-status">
              <span>Status</span>
              <select name="status">
                ${EVIDENCE_REVIEW_STATUSES.map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join("")}
              </select>
            </label>
            <div class="evidence-review-modal-actions">
              <button class="icon-button ghost evidence-review-modal-close-action" type="button"><svg><use href="#icon-x"></use></svg><span>Cancel</span></button>
              <button class="icon-button primary" type="submit"><svg><use href="#icon-save"></use></svg><span>Save review</span></button>
            </div>
          </div>
        </form>
      </section>
    </div>
  `;
}

const EVIDENCE_REVIEW_STATUSES = ["Not reviewed", "Reviewed", "Questions"];
const BU_FOLLOW_UP_STATUSES = ["Confirmed", "Further investigation needed", "More info needed"];
const BU_SIZE_BANDS = [
  { band: "Extra Small", score: 1, dataTb: 0.25, tables: 100, definition: "<0.25 TB of data or <100 tables", className: "size-xs" },
  { band: "Small", score: 2, dataTb: 0.25, tables: 100, definition: ">0.25 TB of data or >100 tables", className: "size-small" },
  { band: "Medium", score: 3, dataTb: 0.5, tables: 500, definition: ">0.5 TB of data or >500 tables", className: "size-medium" },
  { band: "Large", score: 4, dataTb: 10, tables: 2000, definition: ">10 TB of data or >2,000 tables", className: "size-large" },
  { band: "Extra Large", score: 5, dataTb: 15, tables: 2500, definition: ">15 TB of data or >2,500 tables", className: "size-xl" },
];
const BU_COMPLEXITY_BANDS = [
  { band: "Very Low", score: 1, min: 0, max: 0, definition: "0 complexity points", className: "size-xs" },
  { band: "Low", score: 2, min: 1, max: 3, definition: "1-3 complexity points", className: "size-small" },
  { band: "Medium", score: 3, min: 4, max: 7, definition: "4-7 complexity points", className: "size-medium" },
  { band: "High", score: 4, min: 8, max: 10, definition: "8-10 complexity points", className: "size-large" },
  { band: "Very High", score: 5, min: 11, max: Infinity, definition: "11+ complexity points", className: "size-xl" },
];
const BU_COMPLEXITY_FACTORS = [
  {
    key: "complexGovernance",
    label: "Complex governance",
    field: "buComplexGovernance",
    options: [
      { label: "No", value: "no", score: 0 },
      { label: "Yes", value: "yes", score: 1 },
    ],
  },
  {
    key: "highDataCriticality",
    label: "High data criticality and availability requirements",
    field: "buHighDataCriticality",
    options: [
      { label: "No", value: "no", score: 0 },
      { label: "Yes", value: "yes", score: 2 },
    ],
  },
  {
    key: "uniqueTooling",
    label: "Extensive unique tooling in use",
    field: "buUniqueTooling",
    options: [
      { label: "Small number of tooling", value: "small", score: 1 },
      { label: "Higher number of tooling", value: "higher", score: 2 },
    ],
  },
  {
    key: "highRefactorEffort",
    label: "High refactor effort required",
    field: "buHighRefactorEffort",
    options: [
      { label: "No", value: "no", score: 0 },
      { label: "Yes", value: "yes", score: 2 },
    ],
  },
  {
    key: "piData",
    label: "PI data",
    field: "buPiData",
    options: [
      { label: "No", value: "no", score: 0 },
      { label: "Yes", value: "yes", score: 2 },
    ],
  },
];
const MATURITY_SCORE_OPTIONS = [
  { label: "Adhoc", value: "Adhoc", score: 1 },
  { label: "Started", value: "Started", score: 2 },
  { label: "In Place", value: "In Place", score: 3 },
  { label: "Exceptional", value: "Exceptional", score: 4 },
  { label: "Best practice", value: "Best practice", score: 5 },
];
const MATURITY_ASSESSMENT_DOMAINS = [
  { key: "architecture", domain: "Architecture", guidance: "Dev/Test/Prod, Workspace Strategy" },
  { key: "security-identity", domain: "Security & identity", guidance: "RBAC, IAM integration, secrets, key management" },
  { key: "governance-data-controls", domain: "Governance & data controls", guidance: "Unity Catalog, permissions, lineage, audit" },
  { key: "operations-monitoring", domain: "Operations & monitoring", guidance: "Logs, alerts, incident handling" },
  { key: "cost-management", domain: "Cost management", guidance: "Tagging, budgets, cluster policies, chargeback" },
  { key: "iac-maturity", domain: "IaC maturity", guidance: "Terraform, modules, pipelines, state" },
  { key: "databricks-object-management", domain: "Databricks object management", guidance: "Jobs, clusters, policies, permissions as code" },
  { key: "resilience-dr", domain: "Resilience & DR", guidance: "Backup, RPO/RTO, recovery testing" },
];

function getEvidenceReviewDocumentsForBu(bu) {
  const reviewsByVersion = new Map((serverWorkspace?.evidence_review_items || [])
    .filter((review) => review.business_unit_id === bu.id)
    .map((review) => [review.artifact_id || review.upload_version_id, review]));
  const uploads = (serverWorkspace?.uploads || []).filter((upload) => upload.business_unit_id === bu.id);
  const byVersionId = new Map();
  uploads.forEach((upload) => {
    const version = getUploadVersionForUpload(upload);
    if (!version?.upload_version_id || byVersionId.has(version.upload_version_id) || !isEvidenceReviewUploadVisible(upload, version)) return;
    const review = reviewsByVersion.get(version.upload_version_id) || {};
    const downloadUrl = `/api/uploads/${encodeURIComponent(version.upload_version_id)}/download`;
    byVersionId.set(version.upload_version_id, {
      reviewItemId: version.upload_version_id,
      uploadVersionId: version.upload_version_id,
      artifactId: "",
      artifactType: "uploaded-document",
      uploadId: upload.upload_id || version.upload_id || "",
      documentType: upload.diagram_type || upload.document_type || version.diagram_type || version.document_type || getInputRegisterEntryForUpload(upload)?.inputCategory || "Uploaded evidence",
      fileName: version.original_file_name || "Stored document",
      meta: [normaliseDateInputValue(version.uploaded_at), version.mime_type || ""].filter(Boolean).join(" / "),
      environments: getEvidenceReviewDocumentEnvironments(upload, version, bu),
      viewUrl: `${downloadUrl}?disposition=inline`,
      downloadUrl,
      review: normaliseEvidenceReviewState(review),
    });
  });
  getEvidenceReviewAppArtifactsForBu(bu, reviewsByVersion).forEach((artifact) => {
    if (!byVersionId.has(artifact.reviewItemId)) byVersionId.set(artifact.reviewItemId, artifact);
  });
  return [...byVersionId.values()].sort((a, b) =>
    `${a.documentType} ${a.fileName}`.localeCompare(`${b.documentType} ${b.fileName}`)
  );
}

function getEvidenceReviewAppArtifactsForBu(bu, reviewsById) {
  const artifacts = [];
  const buWideResponse = getQuestionnaireResponse(bu.id, "bu-wide");
  if (buWideResponse) {
    artifacts.push(createEvidenceReviewArtifact({
      artifactId: `artifact-questionnaire-${buWideResponse.questionnaire_response_id}`,
      artifactType: "questionnaire-response",
      documentType: "BU-wide questionnaire",
      meta: buWideResponse.submitted ? "Submitted questionnaire answers" : "Saved questionnaire answers",
      environments: [{ label: "BU-wide", meta: bu.name }],
      viewUrl: documentUrl("bu-data-collection", "questionnaire-response", bu.id),
      review: reviewsById.get(`artifact-questionnaire-${buWideResponse.questionnaire_response_id}`),
    }));
  }
  const wafBundle = getWafBaselineForBu(bu);
  if (wafBundle?.assessment) {
    const { assessment, findings = [], answers = [] } = wafBundle;
    const artifactId = `artifact-waf-baseline-${assessment.assessment_id}`;
    const evidenceGapCount = answers.filter((row) => row.weight > 0 && ["Low", "Unknown"].includes(row.confidence)).length;
    artifacts.push(createEvidenceReviewArtifact({
      artifactId,
      artifactType: "waf-baseline",
      documentType: "WAF Well-Architected Baseline",
      meta: [
        assessment.platform || "AWS",
        `${assessment.baseline_score ?? 0}/100 baseline`,
        `${findings.length} finding${findings.length === 1 ? "" : "s"}`,
        evidenceGapCount ? `${evidenceGapCount} evidence gap${evidenceGapCount === 1 ? "" : "s"}` : "",
      ].filter(Boolean).join(" / "),
      environments: [{
        label: assessment.environment || "BU-wide",
        meta: assessment.workload_name || bu.name,
      }],
      viewUrl: `${documentUrl("outputs", "waf-baseline-report", bu.id)}&readonly=true&returnTo=${encodeURIComponent(documentUrl("team-analysis", "evidence-review", bu.id))}`,
      assessmentId: assessment.assessment_id,
      review: reviewsById.get(artifactId),
    }));
  }
  getDatabricksProductsForBu(bu).forEach((product) => {
    artifacts.push(createEvidenceReviewArtifact({
      artifactId: `artifact-data-product-${bu.id}-${product.productId}`,
      artifactType: "databricks-product-definition",
      documentType: `Databricks product definition - ${product.productName}`,
      meta: product.productDescription || "Environment grouping captured in questionnaire section 1",
      environments: product.environments.map((label) => ({ label, meta: product.productName })),
      viewUrl: documentUrl("bu-data-collection", "questionnaire-response", bu.id),
      review: reviewsById.get(`artifact-data-product-${bu.id}-${product.productId}`),
    }));
    const response = getQuestionnaireResponse(bu.id, "product", product.productId);
    if (response) {
      artifacts.push(createEvidenceReviewArtifact({
        artifactId: `artifact-questionnaire-${response.questionnaire_response_id}`,
        artifactType: "questionnaire-response",
        documentType: `Product questionnaire - ${product.productName}`,
        meta: response.submitted ? "Submitted questionnaire answers" : "Saved questionnaire answers",
        environments: product.environments.map((label) => ({ label, meta: product.productName })),
        viewUrl: documentUrl("bu-data-collection", "questionnaire-response", bu.id),
        review: reviewsById.get(`artifact-questionnaire-${response.questionnaire_response_id}`),
      }));
    }
  });

  const knowledgeAccess = getKnowledgeRepoAccessForBu(bu.id);
  if (knowledgeAccess.knowledge_repo_access_id) {
    if (knowledgeAccess.knowledge_link) {
      artifacts.push(createEvidenceReviewArtifact({
        artifactId: `artifact-knowledge-${knowledgeAccess.knowledge_repo_access_id}-knowledge`,
        artifactType: "knowledge-base-link",
        documentType: "Knowledge base access details",
        meta: knowledgeAccess.knowledge_link,
        environments: [{ label: "BU-wide", meta: knowledgeAccess.team_access_confirmed ? "Team access confirmed" : "Team access not confirmed" }],
        viewUrl: documentUrl("bu-data-collection", "knowledge-base-repo-access", bu.id),
        review: reviewsById.get(`artifact-knowledge-${knowledgeAccess.knowledge_repo_access_id}-knowledge`),
      }));
    }
    if (knowledgeAccess.repository_link) {
      artifacts.push(createEvidenceReviewArtifact({
        artifactId: `artifact-knowledge-${knowledgeAccess.knowledge_repo_access_id}-repository`,
        artifactType: "repository-link",
        documentType: "Repository access details",
        meta: knowledgeAccess.repository_link,
        environments: [{ label: "BU-wide", meta: knowledgeAccess.team_access_confirmed ? "Team access confirmed" : "Team access not confirmed" }],
        viewUrl: documentUrl("bu-data-collection", "knowledge-base-repo-access", bu.id),
        review: reviewsById.get(`artifact-knowledge-${knowledgeAccess.knowledge_repo_access_id}-repository`),
      }));
    }
  }

  (serverWorkspace?.environment_access_confirmations || [])
    .filter((row) => row.business_unit_id === bu.id)
    .forEach((row) => {
      const scope = getScopeRecordsForBu(bu).find((env) =>
        (row.environment_id && env.environmentId === row.environment_id) || (row.workspace_id && env.workspaceId === row.workspace_id)
      ) || {};
      const artifactId = `artifact-environment-access-${row.environment_access_confirmation_id}`;
      artifacts.push(createEvidenceReviewArtifact({
        artifactId,
        artifactType: "environment-access-confirmation",
        documentType: `Environment access confirmation - ${scope.environmentName || row.environment_id || row.workspace_id || "Environment"}`,
        meta: [
          row.databricks_access_confirmed ? "Databricks access provided" : "Databricks access not provided",
          row.azure_access_confirmed ? "Azure access provided" : "Azure access not provided",
          row.access_test_status ? `Access test: ${row.access_test_status}` : "",
        ].filter(Boolean).join(" / "),
        environments: [{
          label: scope.environmentName || getEnvironmentLabel(row.environment_id, row.workspace_id),
          meta: scope.workspaceName || row.workspace_id || "",
          workspaceUrl: scope.workspaceUrl || "",
        }],
        viewUrl: documentUrl("bu-data-collection", "environment-access-confirmation", bu.id),
        review: reviewsById.get(artifactId),
      }));
    });
  return artifacts;
}

function createEvidenceReviewArtifact({ artifactId, artifactType, documentType, meta, environments, viewUrl, assessmentId, review }) {
  return {
    reviewItemId: artifactId,
    uploadVersionId: "",
    artifactId,
    artifactType,
    assessmentId: assessmentId || "",
    uploadId: "",
    documentType,
    fileName: "",
    meta,
    environments: environments?.length ? environments : [{ label: "BU-wide / unassigned", meta: "App-entered artifact" }],
    viewUrl,
    downloadUrl: "",
    review: normaliseEvidenceReviewState(review),
  };
}

function normaliseEvidenceReviewState(review = {}) {
  return {
    status: EVIDENCE_REVIEW_STATUSES.includes(review.status) ? review.status : "Not reviewed",
    comments: review.comments || "",
    followUpQuestions: review.follow_up_questions || review.followUpQuestions || "",
    faceToFaceRequired: review.face_to_face_required === true || review.faceToFaceRequired === true,
    followUpStatus: BU_FOLLOW_UP_STATUSES.includes(review.follow_up_status || review.followUpStatus) ? (review.follow_up_status || review.followUpStatus) : "More info needed",
    followUpAnswer: cleanFollowUpAnswerForClient(review.follow_up_answer || review.followUpAnswer || ""),
    followUpUpdatedAt: review.follow_up_updated_at || review.followUpUpdatedAt || "",
  };
}

function wireEvidenceReviewActions() {
  const form = document.querySelector("#evidenceReviewForm");
  if (!form) return;
  const saveStatus = form.querySelector("#evidenceReviewSaveStatus");
  const modal = document.querySelector("#evidenceReviewModal");
  const modalForm = document.querySelector("#evidenceReviewModalForm");
  let activeRow = null;
  if (modalForm) modalForm.noValidate = true;
  const updateStatusPill = (row, status) => {
    const pill = row?.querySelector("[data-review-status-label]");
    if (!pill) return;
    pill.className = `status-pill ${evidenceReviewStatusClass(status)}`;
    pill.textContent = status;
  };
  const closeModal = () => {
    if (modal) closeAccessibleModal(modal);
    activeRow = null;
  };
  const saveEvidenceReviews = async (button) => {
    if (!SERVER_MODE) {
      if (saveStatus) saveStatus.textContent = "Run the local server to save evidence reviews.";
      showAppAlert("Run the local server to save evidence reviews.");
      return false;
    }
    const submitButton = button || form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (saveStatus) saveStatus.textContent = "Saving evidence review...";
    const reviews = Array.from(form.querySelectorAll(".evidence-review-row")).map((row) => ({
      reviewItemId: row.dataset.reviewItemId || "",
      uploadVersionId: row.dataset.uploadVersionId || "",
      artifactId: row.dataset.artifactId || "",
      artifactType: row.dataset.artifactType || row.querySelector('input[name="artifactType"]')?.value || "",
      documentType: row.querySelector('input[name="documentType"]')?.value || "",
      comments: row.querySelector('input[name="comments"]')?.value.trim() || "",
      followUpQuestions: row.querySelector('input[name="followUpQuestions"]')?.value.trim() || "",
      faceToFaceRequired: row.querySelector('input[name="faceToFaceRequired"]')?.value === "true",
      followUpStatus: row.querySelector('input[name="followUpStatus"]')?.value || "More info needed",
      followUpAnswer: row.querySelector('input[name="followUpAnswer"]')?.value || "",
      status: row.querySelector('input[name="status"]')?.value || "Not reviewed",
    }));
    try {
      const result = await apiRequest(`/api/business-units/${encodeURIComponent(form.dataset.businessUnitId)}/evidence-review`, {
        method: "PUT",
        body: JSON.stringify({ reviews }),
      });
      serverWorkspace.evidence_review_items = result.records || [];
      if (result.screen) {
        const screens = serverWorkspace.screen_instances || [];
        const index = screens.findIndex((screen) => screen.screen_instance_id === result.screen.screen_instance_id);
        if (index >= 0) screens[index] = result.screen;
        else screens.push(result.screen);
        serverWorkspace.screen_instances = screens;
      }
      if (saveStatus) saveStatus.textContent = `Saved ${reviews.length} evidence review row${reviews.length === 1 ? "" : "s"}.`;
      showAppToast("Evidence review saved", {
        detail: `${reviews.length} review row${reviews.length === 1 ? "" : "s"} saved.`,
        tone: "success",
      });
      return true;
    } catch (error) {
      const message = `The evidence review could not be saved: ${formatApiError(error)}`;
      if (saveStatus) saveStatus.textContent = message;
      showAppAlert(message);
      return false;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };
  form.querySelectorAll(".evidence-review-open").forEach((button) => {
    button.addEventListener("click", () => {
      activeRow = button.closest(".evidence-review-row");
      if (!activeRow || !modal || !modalForm) return;
      const documentType = activeRow.querySelector('input[name="documentType"]')?.value || "Evidence";
      modalForm.elements.uploadVersionId.value = activeRow.dataset.uploadVersionId || "";
      modalForm.elements.comments.value = activeRow.querySelector('input[name="comments"]')?.value || "";
      modalForm.elements.followUpQuestions.value = activeRow.querySelector('input[name="followUpQuestions"]')?.value || "";
      modalForm.elements.faceToFaceRequired.checked = activeRow.querySelector('input[name="faceToFaceRequired"]')?.value === "true";
      modalForm.elements.status.value = activeRow.querySelector('input[name="status"]')?.value || "Not reviewed";
      const followUpStatus = activeRow.querySelector('input[name="followUpStatus"]')?.value || "More info needed";
      const followUpAnswer = activeRow.querySelector('input[name="followUpAnswer"]')?.value || "";
      const followUpStatusDisplay = modal.querySelector("[data-follow-up-status-display]");
      if (followUpStatusDisplay) {
        followUpStatusDisplay.className = `status-pill ${followUpStatusClass(followUpStatus)}`;
        followUpStatusDisplay.textContent = followUpStatus;
      }
      const followUpAnswerDisplay = modal.querySelector("[data-follow-up-answer-display]");
      if (followUpAnswerDisplay) followUpAnswerDisplay.textContent = cleanFollowUpAnswerForClient(followUpAnswer) || "No BU answer yet.";
      const title = modal.querySelector("#evidenceReviewModalTitle");
      if (title) title.textContent = documentType;
      const meta = modal.querySelector("#evidenceReviewModalMeta");
      if (meta) meta.textContent = activeRow.querySelector(".evidence-review-environment-list")?.textContent.trim() || "Evidence review item";
      const preview = modal.querySelector("[data-evidence-review-preview]");
      if (preview) {
        preview.innerHTML = "";
        preview.hidden = true;
      }
      openAccessibleModal(modal, { initialFocusSelector: 'textarea[name="comments"]', onRequestClose: closeModal });
    });
  });
  modal?.querySelectorAll(".evidence-review-modal-close, .evidence-review-modal-close-action").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modalForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!activeRow) return;
    const validation = validateEvidenceReviewModalForm(modalForm);
    if (!applyInlineValidationResult(modalForm, validation, "Review the highlighted evidence review fields before saving.")) {
      return;
    }
    const nextStatus = modalForm.elements.status.value;
    activeRow.querySelector('input[name="comments"]').value = modalForm.elements.comments.value;
    activeRow.querySelector('input[name="followUpQuestions"]').value = modalForm.elements.followUpQuestions.value;
    activeRow.querySelector('input[name="faceToFaceRequired"]').value = modalForm.elements.faceToFaceRequired.checked ? "true" : "false";
    activeRow.querySelector('input[name="status"]').value = nextStatus;
    if (nextStatus === "Reviewed") {
      const followUpStatusInput = activeRow.querySelector('input[name="followUpStatus"]');
      if (followUpStatusInput) followUpStatusInput.value = "Confirmed";
    }
    updateStatusPill(activeRow, nextStatus);
    const saved = await saveEvidenceReviews(event.submitter);
    if (saved) closeModal();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveEvidenceReviews(event.submitter);
  });
}

function validateEvidenceReviewModalForm(form) {
  const errors = [];
  const status = form?.elements?.status?.value || "Not reviewed";
  const followUpQuestions = form?.elements?.followUpQuestions;
  if (status === "Questions" && !followUpQuestions?.value.trim()) {
    errors.push({ input: followUpQuestions, message: "Add the follow-up question before saving this review as Questions." });
  }
  return {
    valid: errors.length === 0,
    message: "Complete the highlighted evidence review fields before saving.",
    errors,
  };
}
