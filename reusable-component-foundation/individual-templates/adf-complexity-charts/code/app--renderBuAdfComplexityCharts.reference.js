/* Reference extract: renderBuAdfComplexityCharts(...) from app/src/app.js:12882-12909. */

function renderBuAdfComplexityCharts(bu, model = getAdfComplexityModel(bu)) {
  const environmentRows = (model.selectedRows || []).map((row, index) => ({
    label: row.environmentName || row.workspaceName || `Environment ${index + 1}`,
    value: row.summary?.complexityScore || 0,
    detail: `${formatNumber(row.summary?.activityCount || 0)} activities / ${row.summary?.band || "Not banded"}`,
    color: getReportChartColor(index),
  }));
  const activityTypeRows = getAdfActivityTypeRows(getSelectedAdfActivityRows(model));
  return `
    <div class="report-visual-board adf-report-visual-board">
      ${renderReportPieVisual({
        eyebrow: "Complexity share",
        title: `${bu.name} ADF complexity by environment`,
        rows: environmentRows,
        totalLabel: "Complexity",
        emptyMessage: "No selected ADF environments are available for charting.",
      })}
      ${renderReportPieVisual({
        eyebrow: "Activity type",
        title: "ADF activity complexity by type",
        rows: activityTypeRows,
        totalLabel: "Complexity",
        variant: "feature",
        emptyMessage: "No parsed ADF activity types are available for charting.",
      })}
    </div>
  `;
}
