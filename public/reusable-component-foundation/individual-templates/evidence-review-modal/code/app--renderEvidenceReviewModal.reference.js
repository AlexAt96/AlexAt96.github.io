/* Reference extract: renderEvidenceReviewModal(...) from app/src/app.js:10301-10445. */

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
