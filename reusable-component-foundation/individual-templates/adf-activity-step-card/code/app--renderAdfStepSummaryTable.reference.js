/* Reference extract: renderAdfStepSummaryTable(...) from app/src/app.js:12310-12330. */

function renderAdfStepSummaryTable(step) {
  const rows = [
    ["Action", step.actionLabel || step.activityType || "Activity"],
    ["Type", step.activityType || "Activity"],
    ["Depends", step.dependsOn.length ? step.dependsOn.join(", ") : "Previous level / start"],
    ["Runtime", [step.linkedService, step.irType].filter(Boolean).join(" / ") || "Not exported"],
  ];
  if (step.targetPipeline) rows.push(["Calls", step.targetPipeline]);
  return `
    <table class="adf-step-node-table" aria-label="${escapeHtml(step.activityName)} summary">
      <tbody>
        ${rows.map(([label, value]) => `
          <tr>
            <th>${escapeHtml(label)}</th>
            <td>${escapeHtml(value)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
