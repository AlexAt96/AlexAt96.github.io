/* Reference extract: createEvidenceReviewArtifact(...) from app/src/app.js:10626-10642. */

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
