/* Reference extract: renderDashboardPlanRow(...) from app/src/app.js:2183-2194. */

function renderDashboardPlanRow(row, rowNumber) {
  const rowStyle = `--plan-row: ${rowNumber}; --lane-height: ${row.laneHeight}px;`;
  const rowTypeClass = getPlanCssToken(row.type || "business-unit");
  return `
    <div class="gantt-lane-cell plan-row-${rowTypeClass} ${row.type === "decision" ? "decision" : ""}" style="${rowStyle}">
      <strong>${escapeHtml(row.title)}</strong>
      <span>${escapeHtml(row.subtitle)}</span>
    </div>
    <div class="gantt-row-track plan-row-${rowTypeClass}" style="${rowStyle}"></div>
    ${row.bars.map((bar) => renderDashboardPlanBar(bar, rowNumber)).join("")}
  `;
}
