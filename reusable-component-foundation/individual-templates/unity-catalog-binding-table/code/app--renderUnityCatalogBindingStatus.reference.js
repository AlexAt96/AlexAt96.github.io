/* Reference extract: renderUnityCatalogBindingStatus(...) from app/src/app.js:14604-14613. */

function renderUnityCatalogBindingStatus(row = {}) {
  const value = row.status || (row.workspaceId || row.bindingType ? "Bound" : "Unbound / unknown");
  const key = value.toLowerCase();
  const className = key.includes("fail") || key.includes("error") || key.includes("unknown") || key.includes("unbound")
    ? "blocked"
    : key.includes("read") || key.includes("bound") || key.includes("active")
      ? "completed"
      : "in-review";
  return `<span class="status-pill ${className}">${escapeHtml(value)}</span>`;
}
