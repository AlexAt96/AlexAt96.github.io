/* Reference extract: renderMetadataAttributeDetails(...) from app/src/app.js:13989-14005. */

function renderMetadataAttributeDetails(attributes = {}, title = "Captured attributes") {
  const entries = Object.entries(attributes)
    .filter(([key, value]) => !["rest_inventory_source_file"].includes(key) && value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) return "";
  return `
    <details class="metadata-attribute-details" data-page-state-disabled="true">
      <summary>${escapeHtml(title)} (${entries.length})</summary>
      <dl>
        ${entries.map(([key, value]) => `
          <dt>${escapeHtml(formatMetadataAttributeLabel(key))}</dt>
          <dd>${escapeHtml(formatMetadataAttributeValue(value))}</dd>
        `).join("")}
      </dl>
    </details>
  `;
}
