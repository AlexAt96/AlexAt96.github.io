/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderMetadataReview(phase, item, bu = getSelectedBu()) {
  const contextLabel = bu ? bu.name : "Cross-BU";
  const model = getMetadataReviewModel(bu);
  return `
    ${detailHeader("Metadata review", `Structured review of parsed Databricks and Unity Catalog metadata for ${contextLabel}. This page separates raw metadata evidence from source/consumer and external connection mapping.`)}
    ${renderMetadataReviewDisclosure({
      eyebrow: "Databricks metadata",
      title: `${contextLabel} Terraform and Unity Catalog metadata`,
      summary: `${model.summary.inventoryRowCount} inventory rows / ${model.summary.bindingRowCount} catalog binding rows / ${model.summary.grantRowCount} grant rows`,
      content: `
        ${renderDatabricksMetadataOverview(model)}
        ${renderMetadataReviewStats(model, contextLabel)}
        ${renderUnityCatalogBindingTable(model.bindingRows, contextLabel)}
        ${renderDatabricksInventoryResourceTable(model.inventoryRows, contextLabel, bu)}
        ${renderDatabricksExternalLocationMetadataTable(model.externalLocationRows, contextLabel)}
        ${renderDatabricksUcGrantTable(model.grantRows, contextLabel)}
      `,
    })}
    ${renderMetadataReviewDisclosure({
      eyebrow: "ADF metadata",
      title: `${contextLabel} ADF profiler metadata`,
      summary: `${model.adfSummaryRows.length} environment rows / ${model.adfActivityRows.length} activity rows`,
      content: `
        ${renderAdfMetadataOverview(model)}
        ${renderAdfMetadataReviewTables(model, contextLabel)}
      `,
    })}
    ${renderMetadataReviewDisclosure({
      eyebrow: "Data dictionary metadata",
      title: `${contextLabel} data dictionary metadata`,
      summary: `${model.dictionaryRows.length} dictionary columns`,
      content: `
        ${renderDictionaryMetadataOverview(model)}
        ${renderDatabricksDictionaryMetadataTable(model.dictionaryRows, contextLabel)}
      `,
    })}
    ${renderMetadataReviewDisclosure({
      eyebrow: "Sizing metadata",
      title: `${contextLabel} sizing and storage metadata`,
      summary: `${model.sizingRows.length} sizing rows / ${model.storagePathRows.length} storage paths`,
      content: `
        ${renderSizingMetadataOverview(model)}
        ${renderDatabricksTableSizingMetadataTable(model.sizingRows, contextLabel)}
        ${renderDatabricksStoragePathMetadataTable(model.storagePathRows, contextLabel)}
      `,
    })}
  `;
}

const ADVANCED_DISCOVERY_OUTPUT_TABS = [
  { key: "adf-profiler", label: "ADF profiler", shortLabel: "ADF" },
  { key: "terraform-metadata", label: "Terraform and Databricks metadata", shortLabel: "Metadata" },
  { key: "sizing", label: "Sizing", shortLabel: "Sizing" },
];

function getMetadataReviewModel(bu = null) {
  const adfRows = getAdfMetadataReviewRows(bu);
  const model = {
    bindingRows: getUnityCatalogBindingRows(bu),
    inventoryRows: getDatabricksInventoryResourceRows(bu),
    externalLocationRows: getDatabricksExternalLocationRows(bu),
    grantRows: getDatabricksUcGrantRows(bu),
    sizingRows: getDatabricksTableSizingRows(bu),
    dictionaryRows: getDatabricksDictionaryRows(bu),
    storagePathRows: getDatabricksStoragePathRows(bu),
    adfSummaryRows: adfRows.summaryRows,
    adfActivityRows: adfRows.activityRows,
    adfLineage: getAdfLineageModel(bu),
  };
  model.summary = getMetadataReviewSummary(model);
  return model;
}

function getMetadataReviewSummary(model = {}) {
  const bindingRows = model.bindingRows || [];
  const inventoryRows = model.inventoryRows || [];
  const externalLocationRows = model.externalLocationRows || [];
  const grantRows = model.grantRows || [];
  const sizingRows = model.sizingRows || [];
  const dictionaryRows = model.dictionaryRows || [];
  const storagePathRows = model.storagePathRows || [];
  const allRows = [
    ...bindingRows,
    ...inventoryRows,
    ...externalLocationRows,
    ...grantRows,
    ...sizingRows,
    ...dictionaryRows,
    ...storagePathRows,
  ];
  const bindingSummary = getUnityCatalogBindingSummary(bindingRows);
  const sourceFiles = new Set(allRows.map((row) => normaliseImportHeader(row.sourceFileName)).filter(Boolean));
  return {
    catalogCount: bindingSummary.catalogCount,
    bindingRowCount: bindingRows.length,
    inventoryRowCount: inventoryRows.length,
    externalLocationCount: externalLocationRows.length,
    grantRowCount: grantRows.length,
    broadGrantCount: grantRows.filter((row) => row.broadAccess).length,
    sizingRowCount: sizingRows.length,
    tableSizeTb: sizingRows.reduce((total, row) => total + Number(row.dataSizeTb || 0), 0),
    dictionaryColumnCount: dictionaryRows.length,
    storagePathCount: storagePathRows.length,
    sourceFileCount: sourceFiles.size,
  };
}

function renderMetadataReviewStats(model, contextLabel = "Cross-BU") {
  const summary = model.summary || getMetadataReviewSummary(model);
  return `
    <section class="dbu-kpi-grid metadata-review-stats" aria-label="${escapeHtml(contextLabel)} metadata review statistics">
      ${factCard("UC catalogs", summary.catalogCount, `${summary.bindingRowCount} binding row${summary.bindingRowCount === 1 ? "" : "s"}`, "Source: parsed Unity Catalog binding extracts.")}
      ${factCard("Inventory resources", summary.inventoryRowCount, "Terraform resource rows", "Source: parsed Databricks Terraform exporter output.")}
      ${factCard("External locations", summary.externalLocationCount, `${summary.storagePathCount} storage path${summary.storagePathCount === 1 ? "" : "s"}`, "Source: parsed external location and storage metadata.")}
      ${factCard("UC grants", summary.grantRowCount, `${summary.broadGrantCount} broad access flag${summary.broadGrantCount === 1 ? "" : "s"}`, "Source: parsed Unity Catalog grants.")}
      ${factCard("Table sizing", summary.sizingRowCount, `${formatNumber(summary.tableSizeTb)} TB`, "Source: parsed table sizing output.")}
      ${factCard("Dictionary columns", summary.dictionaryColumnCount, `${summary.sourceFileCount} source file${summary.sourceFileCount === 1 ? "" : "s"}`, "Source: parsed data dictionary output.")}
    </section>
  `;
}

function renderDatabricksMetadataOverview(model = {}) {
  const inventoryRows = model.inventoryRows || [];
  const resourceTypeCount = new Set(inventoryRows.map((row) => row.resourceType).filter(Boolean)).size;
  const ownerCount = new Set(inventoryRows.map((row) => row.owner || row.creator).filter(Boolean)).size;
  const chartRows = getTopCountRows(inventoryRows, (row) => row.resourceType || "Unknown resource", 8);
  return renderMetadataSectionOverview({
    title: "Databricks metadata headlines",
    stats: [
      ["Inventory rows", formatNumber(inventoryRows.length), `${formatNumber(resourceTypeCount)} Terraform resource types`],
      ["External locations", formatNumber((model.externalLocationRows || []).length), "Normalised storage endpoints"],
      ["UC grants", formatNumber((model.grantRows || []).length), `${formatNumber((model.grantRows || []).filter((row) => row.broadAccess).length)} broad access flag${(model.grantRows || []).filter((row) => row.broadAccess).length === 1 ? "" : "s"}`],
      ["Owners / creators", formatNumber(ownerCount), "Captured from resource metadata"],
    ],
    chartTitle: "Top Terraform resource types",
    chartRows,
  });
}

function renderAdfMetadataOverview(model = {}) {
  const summaryRows = model.adfSummaryRows || [];
  const activityRows = model.adfActivityRows || [];
  const totalActivities = activityRows.reduce((total, row) => total + Number(row.activityCount || 0), 0);
  const totalComplexity = activityRows.reduce((total, row) => total + Number(row.complexityScore || 0), 0);
  const selectedRows = summaryRows.filter((row) => row.selected);
  return renderMetadataSectionOverview({
    title: "ADF metadata headlines",
    stats: [
      ["Environment rows", formatNumber(summaryRows.length), `${formatNumber(selectedRows.length)} included in summary`],
      ["Activity rows", formatNumber(activityRows.length), "Parsed profiler rows"],
      ["Activities", formatNumber(totalActivities), "Total activity count"],
      ["Complexity", formatNumber(totalComplexity), "Activity count x factor"],
    ],
    chartTitle: "ADF activities by type",
    chartRows: getTopSumRows(activityRows, (row) => row.activityType || "Activity", (row) => row.activityCount, 8),
  });
}

function renderDictionaryMetadataOverview(model = {}) {
  const rows = model.dictionaryRows || [];
  const tableCount = new Set(rows.map((row) => [row.catalog, row.schema, row.tableName].filter(Boolean).join(".")).filter(Boolean)).size;
  const dataTypeCount = new Set(rows.map((row) => row.dataType).filter(Boolean)).size;
  const nullableCount = rows.filter((row) => /^yes|true|y$/i.test(String(row.nullable || ""))).length;
  return renderMetadataSectionOverview({
    title: "Data dictionary headlines",
    stats: [
      ["Dictionary columns", formatNumber(rows.length), `${formatNumber(tableCount)} table${tableCount === 1 ? "" : "s"}`],
      ["Data types", formatNumber(dataTypeCount), "Distinct captured types"],
      ["Nullable columns", formatNumber(nullableCount), `${rows.length ? Math.round((nullableCount / rows.length) * 100) : 0}% of columns`],
      ["Source formats", formatNumber(new Set(rows.map((row) => row.sourceFormat).filter(Boolean)).size), "Distinct formats"],
    ],
    chartTitle: "Columns by data type",
    chartRows: getTopCountRows(rows, (row) => row.dataType || "Not captured", 8),
  });
}

function renderSizingMetadataOverview(model = {}) {
  const sizingRows = model.sizingRows || [];
  const storageRows = model.storagePathRows || [];
  const totalTb = sizingRows.reduce((total, row) => total + Number(row.dataSizeTb || 0), 0);
  const fileCount = sizingRows.reduce((total, row) => total + Number(row.numFiles || 0), 0);
  return renderMetadataSectionOverview({
    title: "Sizing metadata headlines",
    stats: [
      ["Sizing rows", formatNumber(sizingRows.length), "Parsed table sizing rows"],
      ["Total size", `${formatNumber(totalTb)} TB`, "Sum of table sizes"],
      ["Files", formatNumber(fileCount), "Sum of table files"],
      ["Storage paths", formatNumber(storageRows.length), `${formatNumber(new Set(storageRows.map((row) => row.cloud).filter(Boolean)).size)} cloud value${new Set(storageRows.map((row) => row.cloud).filter(Boolean)).size === 1 ? "" : "s"}`],
    ],
    chartTitle: "Largest tables by size",
    chartRows: getTopSumRows(sizingRows, (row) => [row.catalog, row.schema, row.tableName].filter(Boolean).join(".") || "Table not captured", (row) => row.dataSizeTb, 8, " TB"),
  });
}

function renderMetadataReviewDisclosure({ eyebrow, title, summary, content }) {
  return `
    <details class="metadata-disclosure metadata-review-disclosure" data-page-state-disabled="true">
      <summary>
        <span class="disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
        <span class="disclosure-copy">
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(eyebrow)}</small>
        </span>
        <span class="disclosure-meta"><span class="chip">${escapeHtml(summary || "Expand to review rows")}</span></span>
      </summary>
      <div class="metadata-review-disclosure-body">
        ${content}
      </div>
    </details>
  `;
}

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

function renderUnityCatalogBindingTable(rows = [], contextLabel = "Cross-BU") {
  return `
    <section class="panel unity-catalog-binding-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Unity Catalog evidence</p>
          <h3>${escapeHtml(contextLabel)} catalog/workspace bindings</h3>
        </div>
      </div>
      ${table(
        ["BU", "Environment", "Catalog", "Type", "Owner", "Metastore", "Workspace binding", "Status", "Source evidence", "Note"],
        rows.map((row) => [
          row.businessUnitName,
          row.environmentLabel,
          row.catalogName,
          row.catalogType,
          row.owner,
          row.metastoreId || "Not captured",
          row.workspaceId || row.bindingType ? `${row.workspaceId || "Workspace not returned"}${row.bindingType ? ` / ${row.bindingType}` : ""}` : "No binding returned",
          renderUnityCatalogBindingStatus(row),
          row.sourceEvidenceHtml || row.sourceFileName || "Source evidence",
          row.note || "",
        ]),
        rows.length ? "Unity Catalog catalog/workspace binding rows parsed from uploaded Terraform and Databricks Metadata outputs." : "No Unity Catalog binding rows have been parsed yet.",
        true,
      )}
    </section>
  `;
}

function renderAdvancedDiscoveryMetadataTab(bu, model) {
  const contextLabel = bu.name;
  return `
    <section class="advanced-discovery-tab-panel" role="tabpanel">
      ${renderAdvancedDiscoveryInsightPanel("Terraform and Databricks metadata insights", getAdvancedDiscoveryMetadataInsights(model))}
      <div class="advanced-discovery-chart-grid">
        ${renderAdvancedDiscoveryPieChart({
          eyebrow: "Resource mix",
          title: "Terraform resource types",
          rows: getTopCountRows(model.inventoryRows || [], (row) => row.resourceType || "Resource", 8),
          centreLabel: "Resources",
        })}
        ${renderAdvancedDiscoveryDistributionChart({
          eyebrow: "Governance",
          title: "Unity Catalog grants by securable type",
          rows: getTopCountRows(model.grantRows || [], (row) => row.securableType || "Securable", 8),
        })}
      </div>
      ${renderMetadataReviewStats(model, contextLabel)}
      ${renderUnityCatalogBindingTable(model.bindingRows, contextLabel)}
      ${renderDatabricksInventoryResourceTable(model.inventoryRows, contextLabel, bu)}
      ${renderDatabricksExternalLocationMetadataTable(model.externalLocationRows, contextLabel)}
      ${renderDatabricksUcGrantTable(model.grantRows, contextLabel)}
    </section>
  `;
}
