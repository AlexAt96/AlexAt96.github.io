/* Reference extract: renderEvidenceStatusIcon(...) from app/src/app.js:9018-9022. */

function renderEvidenceStatusIcon(status) {
  const icon = status === "complete" ? "icon-check" : status === "in-progress" ? "icon-hourglass" : "icon-x";
  const label = status === "complete" ? "Complete" : status === "in-progress" ? "In progress" : "Missing";
  return `<span class="evidence-status-icon ${escapeHtml(status)}" title="${label}"><svg><use href="#${icon}"></use></svg></span>`;
}
