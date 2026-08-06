/* Reference extract: getEvidenceReviewAppArtifactsForBu(...) from app/src/app.js:10510-10624. */

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
