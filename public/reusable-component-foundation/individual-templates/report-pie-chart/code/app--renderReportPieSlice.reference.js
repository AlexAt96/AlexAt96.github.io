/* Reference extract: renderReportPieSlice(...) from app/src/app.js:7161-7168. */

function renderReportPieSlice(row, startPct, endPct, total) {
  const start = polarToCartesian(110, 110, 82, percentageToAngle(startPct));
  const end = polarToCartesian(110, 110, 82, percentageToAngle(endPct));
  const largeArc = endPct - startPct > 50 ? 1 : 0;
  const path = `M 110 110 L ${start.x} ${start.y} A 82 82 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  const pct = total > 0 ? roundPercent((Number(row.value || 0) / total) * 100) : 0;
  return `<path class="dbu-pie-slice" d="${path}" fill="${escapeHtml(row.color)}"${row.buId ? ` data-dbu-bu="${escapeHtml(row.buId)}"` : ""} tabindex="0" role="img" aria-label="${escapeHtml(`${row.label}: ${formatNumber(row.value)} (${pct}%)`)}"></path>`;
}
