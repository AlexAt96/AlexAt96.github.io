/* Reference extract: renderEvidenceReviewRow(...) from app/src/app.js:10208-10250. */

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
