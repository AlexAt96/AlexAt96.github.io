/* Reference extract: getSectionKanbanStatus(...) from app/src/app.js:3999-4007. */

function getSectionKanbanStatus(item) {
  if (item.blank) return "not-started";
  const status = toStatusKey(item.status);
  if (["completed", "done"].includes(status)) return "done";
  if (["in-review", "review"].includes(status)) return "in-review";
  if (["in-progress", "draft"].includes(status)) return "in-progress";
  if (status === "blocked") return "blocked";
  return "not-started";
}
