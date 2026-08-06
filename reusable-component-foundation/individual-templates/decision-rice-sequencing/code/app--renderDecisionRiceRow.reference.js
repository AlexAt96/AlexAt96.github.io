/* Reference extract: renderDecisionRiceRow(...) from app/src/app.js:27638-27652. */

function renderDecisionRiceRow(buName, buId, rice, contribution, sequence) {
  const reason = getDecisionRiceReason(sequence, contribution);
  return `
    <tr>
      <td class="number">${sequence}</td>
      <td><a href="${documentUrl("team-analysis", "rice-scoring", buId)}">${escapeHtml(buName)}</a></td>
      <td class="number">${formatNumber(contribution.avgRice || rice.riceScore || 0)}</td>
      <td class="number">${formatNumber(rice.reachScore || 0)}</td>
      <td class="number">${formatNumber(rice.impactScore || 0)}</td>
      <td class="number">${formatNumber(rice.confidenceScore || 0)}</td>
      <td class="number">${formatNumber(rice.effortScore || 0)}</td>
      <td>${escapeHtml(reason)}</td>
    </tr>
  `;
}
