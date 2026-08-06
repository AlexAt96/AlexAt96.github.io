/* Reference extract: getAdvancedDiscoveryChartRows(...) from app/src/app.js:13319-13333. */

function getAdvancedDiscoveryChartRows(rows = []) {
  const cleanRows = rows
    .map((row, index) => ({
      label: String(row.label || "Not captured"),
      value: Number(row.value || 0),
      suffix: row.suffix || "",
      color: row.color || getDbuDistributionColor(index),
    }))
    .filter((row) => row.value > 0);
  const total = cleanRows.reduce((sum, row) => sum + row.value, 0);
  return cleanRows.map((row) => ({
    ...row,
    percent: total > 0 ? (row.value / total) * 100 : 0,
  }));
}
