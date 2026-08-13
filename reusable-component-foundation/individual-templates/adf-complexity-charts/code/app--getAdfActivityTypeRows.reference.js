/* Reference extract: getAdfActivityTypeRows(...) from app/src/app.js:12864-12880. */

function getAdfActivityTypeRows(activityRows = []) {
  const grouped = new Map();
  activityRows.forEach((row) => {
    const label = row.activityType || "Activity";
    if (!grouped.has(label)) grouped.set(label, { label, value: 0, activityCount: 0 });
    const group = grouped.get(label);
    group.value += Number(row.complexityScore || 0);
    group.activityCount += Number(row.activityCount || 0);
  });
  return [...grouped.values()]
    .map((row, index) => ({
      ...row,
      color: getReportChartColor(index),
      detail: `${formatNumber(row.activityCount)} activit${row.activityCount === 1 ? "y" : "ies"}`,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}
