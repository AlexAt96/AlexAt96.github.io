/* Reference extract: getEvidenceReviewDocumentsForBu(...) from app/src/app.js:10447-10479. */

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
