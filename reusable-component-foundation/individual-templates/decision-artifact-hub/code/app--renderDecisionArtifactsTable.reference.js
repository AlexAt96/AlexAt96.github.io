/* Reference extract: renderDecisionArtifactsTable(...) from app/src/app.js:27977-28004. */

function renderDecisionArtifactsTable(models = getDecisionBuModels()) {
  const rows = [
    [
      "Cross BU report",
      "Cross-BU report",
      "Programme-wide recommendation, sequencing, cost and decision evidence.",
      "Programme Sponsor",
      "In review",
      `<a href="decision.html">Open cross BU report</a>`,
    ],
    ...models.flatMap(({ bu }) => BU_OUTPUT_DELIVERABLES.map((deliverable, index) => {
      const href = `${documentUrl("outputs", deliverable.outputSectionKey, bu.id)}${deliverable.outputTab ? `&tab=${encodeURIComponent(deliverable.outputTab)}` : ""}`;
      const type = deliverable.key === "bu-tech-report" ? "BU report" : "Business unit artifact";
      return [
        index === 0 ? `<span id="decision-artifacts-${escapeHtml(bu.id)}">${escapeHtml(bu.name)}</span>` : bu.name,
        type,
        deliverable.title,
        "Engagement Lead",
        bu.approval,
        `<a href="${href}">Open report</a>`,
      ];
    })),
  ];
  return `
    ${detailHeader("Decision evidence and artifacts", "All produced BU documents in one scan-friendly table, with a separate cross-BU report line for sponsor playback.")}
    ${table(["Business unit", "Artifact type", "Document", "Owner", "Status", "Link"], rows, "Decision artifacts and report links.", true)}
  `;
}
