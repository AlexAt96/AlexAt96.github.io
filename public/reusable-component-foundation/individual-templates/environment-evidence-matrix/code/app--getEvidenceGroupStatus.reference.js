/* Reference extract: getEvidenceGroupStatus(...) from app/src/app.js:9012-9016. */

function getEvidenceGroupStatus(items) {
  if (items.every((item) => item.status === "complete")) return "complete";
  if (items.some((item) => item.status === "complete" || item.status === "in-progress")) return "in-progress";
  return "missing";
}
