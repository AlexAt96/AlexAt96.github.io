/* Reference extract: getCollectionEvidenceGroups(...) from app/src/app.js:8949-8982. */

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
