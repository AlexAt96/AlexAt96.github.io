/* Reference extract: renderProposedTopologyTable(...) from app/src/app.js:20942-20973. */

function renderProposedTopologyTable(type, title, headings, rowHtml, templateColumns = []) {
  const componentId = `proposedTopology${type[0].toUpperCase()}${type.slice(1)}Excel`;
  return `
    <section class="proposed-topology-table-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${escapeHtml(type)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
        <button class="icon-button ghost compact topology-add-row" type="button" data-topology-type="${escapeHtml(type)}" title="Add ${escapeHtml(type)} row">
          <svg><use href="#icon-plus"></use></svg>
        </button>
      </div>
      ${renderExcelImportExportComponent({
        componentId,
        title: `${title} Excel workflow`,
        description: "Download the table, update rows in Excel, then upload it here to stage the table before saving.",
        columns: templateColumns,
      })}
      <div class="data-table-wrap">
        <table class="data-table proposed-topology-table" data-topology-table="${escapeHtml(type)}">
          <thead>
            <tr>${headings.map((heading) => `<th>${escapeHtml(heading)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rowHtml.join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
