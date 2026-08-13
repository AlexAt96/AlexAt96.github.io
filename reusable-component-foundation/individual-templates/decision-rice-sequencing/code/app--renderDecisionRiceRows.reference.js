/* Reference extract: renderDecisionRiceRows(...) from app/src/app.js:27618-27628. */

function renderDecisionRiceRows(models, scenario) {
  const rows = models
    .map(({ bu, rice }) => {
      const contribution = scenario.buContributions?.[bu.id] || {};
      return { bu, rice, contribution };
    })
    .filter((row) => row.contribution.selectedProducts > 0)
    .sort((a, b) => Number(b.contribution.avgRice || 0) - Number(a.contribution.avgRice || 0));
  if (!rows.length) return `<tr><td colspan="8">No business units are currently marked for migration.</td></tr>`;
  return rows.map((row, index) => renderDecisionRiceRow(row.bu.name, row.bu.id, row.rice, row.contribution, index + 1)).join("");
}
