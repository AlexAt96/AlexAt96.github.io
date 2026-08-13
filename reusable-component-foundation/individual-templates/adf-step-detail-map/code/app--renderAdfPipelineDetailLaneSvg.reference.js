/* Reference extract: renderAdfPipelineDetailLaneSvg(...) from app/src/app.js:12280-12308. */

function renderAdfPipelineDetailLaneSvg(branchLane = 0, options = {}) {
  const laneColors = ["#0ea5e9", "#24d18f", "#ff1744", "#00d9ff", "#f59e0b", "#ec4899"];
  const mainX = 34;
  const laneGap = 18;
  const height = 240;
  const selectedX = mainX + (Math.max(0, Number(branchLane || 0)) * laneGap);
  const detailX = 96;
  const bleed = 6;
  const activeLaneCount = Math.max(
    1,
    Number(options.parallelCount || 1),
    Number(options.previousParallelCount || 1),
    Number(options.nextParallelCount || 1),
    branchLane + 1,
  );
  const paths = [];
  for (let lane = 0; lane < activeLaneCount; lane += 1) {
    const x = mainX + (lane * laneGap);
    const color = laneColors[lane] || laneColors[laneColors.length - 1];
    const laneTop = lane === branchLane ? -bleed : 0;
    paths.push(`<path class="detail-flow-line" d="M ${x} ${laneTop} L ${x} ${height + bleed}" style="--lane-color:${color}"></path>`);
  }
  paths.push(`<path class="detail-branch-line" d="M ${selectedX} ${-bleed} C ${selectedX} 18, ${detailX} 18, ${detailX} 34 L ${detailX} ${height - 34} C ${detailX} ${height - 18}, ${selectedX} ${height - 18}, ${selectedX} ${height + bleed}" style="--lane-color:#ec4899"></path>`);
  return `
    <svg class="adf-pipeline-detail-lanes" viewBox="0 0 116 ${height}" preserveAspectRatio="none" focusable="false" aria-hidden="true">
      ${paths.join("")}
    </svg>
  `;
}
