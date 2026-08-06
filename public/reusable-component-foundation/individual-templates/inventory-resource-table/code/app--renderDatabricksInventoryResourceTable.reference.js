/* Reference extract: renderDatabricksInventoryResourceTable(...) from app/src/app.js:14329-14362. */

function renderDatabricksInventoryResourceTable(rows = [], contextLabel = "Cross-BU", bu = null) {
  const groups = groupDatabricksInventoryRowsByType(rows);
  const safeBuId = bu?.id || "";
  return `
    <section class="panel metadata-review-panel metadata-inventory-resource-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Metadata category</p>
          <h3>${escapeHtml(contextLabel)} Databricks inventory resources</h3>
        </div>
        <div class="metadata-review-actions">
          <span class="chip">${rows.length} row${rows.length === 1 ? "" : "s"}</span>
          <button class="icon-button ghost metadata-inventory-export" type="button" data-business-unit-id="${escapeHtml(safeBuId)}"${rows.length ? "" : " disabled"}>
            <svg><use href="#icon-download"></use></svg>
            <span>Export Excel</span>
          </button>
        </div>
      </div>
      ${groups.length ? `
        <div class="metadata-resource-tabs" role="tablist" aria-label="${escapeHtml(contextLabel)} Terraform resource types">
          ${groups.map((group, index) => `
            <button class="metadata-resource-tab${index === 0 ? " active" : ""}" type="button" role="tab" aria-selected="${index === 0 ? "true" : "false"}" data-metadata-resource-tab="${escapeHtml(group.key)}">
              <span>${escapeHtml(group.label)}</span>
              <small>${group.rows.length}</small>
            </button>
          `).join("")}
        </div>
        <div class="metadata-resource-tab-panels">
          ${groups.map((group, index) => renderDatabricksInventoryResourceTypePanel(group, index === 0)).join("")}
        </div>
      ` : table(["Terraform resource type", "Source evidence"], [], "No Databricks inventory resources have been parsed yet.", true)}
    </section>
  `;
}
