/* Reference extract: renderCollectionEvidenceProgressBar(...) from app/src/app.js:8890-8910. */

function renderCollectionEvidenceProgressBar(progress, size = "") {
  const total = progress.total || 1;
  const completePct = (progress.complete / total) * 100;
  const inProgressPct = (progress.inProgress / total) * 100;
  const missingPct = (progress.missing / total) * 100;
  const label = `${progress.complete} done, ${progress.inProgress} in progress, ${progress.missing} not done`;
  return `
    <span class="collection-progress-summary ${escapeHtml(size)}" aria-label="${escapeHtml(label)}">
      <span class="collection-progress-bar" aria-hidden="true">
        <span class="collection-progress-segment complete" style="width: ${completePct}%"></span>
        <span class="collection-progress-segment in-progress" style="width: ${inProgressPct}%"></span>
        <span class="collection-progress-segment missing" style="width: ${missingPct}%"></span>
      </span>
      <span class="collection-progress-legend">
        <span><i class="legend-dot complete"></i>Done ${formatEvidenceProgressPercent(progress.complete, total)}</span>
        <span><i class="legend-dot in-progress"></i>In progress ${formatEvidenceProgressPercent(progress.inProgress, total)}</span>
        <span><i class="legend-dot missing"></i>Not done ${formatEvidenceProgressPercent(progress.missing, total)}</span>
      </span>
    </span>
  `;
}
