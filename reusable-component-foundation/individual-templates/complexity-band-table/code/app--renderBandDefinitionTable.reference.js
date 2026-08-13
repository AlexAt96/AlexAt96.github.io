/* Reference extract: renderBandDefinitionTable(...) from app/src/app.js:11010-11028. */

function renderBandDefinitionTable(title, rows) {
  return `
    <div class="data-table-wrap bu-sizing-definition-wrap">
      <table class="data-table bu-sizing-definition-table">
        <caption>${escapeHtml(title)}</caption>
        <thead><tr><th>Band</th>${rows.some((row) => row.score) ? "<th>Score</th>" : ""}<th>Definition</th></tr></thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td class="bu-sizing-band-cell ${escapeHtml(row.className)}">${escapeHtml(row.band)}</td>
              ${rows.some((item) => item.score) ? `<td>${escapeHtml(row.score)}</td>` : ""}
              <td>${escapeHtml(row.definition)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
