/* Reference extract: renderBuTechReportSummaryTable(...) from app/src/app.js:23221-23262. */

function renderBuTechReportSummaryTable(bu, { sizing, rice, openDecisionRows, body = "" }) {
  const fields = getBuTechReportExecutiveSummaryFields(body);
  const riceLineage = getRiceScoreLineageTooltip(bu, rice);
  return `
    <div class="data-table-wrap">
      <table class="data-table bu-tech-report-summary-table">
        <caption>Pre-populated report summary.</caption>
        <thead><tr><th>Area</th><th>Summary</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>Executive summary</strong></td>
            <td><textarea id="buTechReportExecutiveSummaryText" name="executiveSummaryText">${escapeHtml(fields.summary)}</textarea></td>
          </tr>
          <tr>
            <td><strong>Migration view</strong></td>
            <td><textarea id="buTechReportMigrationViewText" name="migrationViewText">${escapeHtml(fields.migrationView || bu.migrationPosition || "To be assessed")}</textarea></td>
          </tr>
          <tr>
            <td><strong>Key messages</strong></td>
            <td><textarea id="buTechReportKeyMessagesText" name="keyMessagesText">${escapeHtml(fields.keyMessages)}</textarea></td>
          </tr>
          <tr>
            <td>Migration complexity</td>
            <td>${calcText(`${sizing.complexityBand} (${sizing.complexityScore})`, "Source: BU sizing and complexity scoring.", documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id))}</td>
          </tr>
          <tr>
            <td>Migration volume</td>
            <td>${calcText(`${sizing.sizeBand} (${sizing.sizeScore})`, "Source: BU sizing data size and table count.", documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id))}</td>
          </tr>
          <tr>
            <td>RICE</td>
            <td>${calcText(formatNumber(rice.riceScore), riceLineage, documentUrl("team-analysis", "rice-scoring", bu.id))}</td>
          </tr>
          <tr>
            <td>Open decisions</td>
            <td><a class="report-inline-link" href="${escapeHtml(withReturnToCurrentPage(documentUrl("outputs", "outstanding-decisions-log", bu.id)))}">${openDecisionRows.length} open decision row${openDecisionRows.length === 1 ? "" : "s"}</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
