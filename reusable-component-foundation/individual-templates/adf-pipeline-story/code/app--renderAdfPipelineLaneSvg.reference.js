/* Reference extract: renderAdfPipelineLaneSvg(...) from app/src/app.js:12229-12274. */

function renderAdfPipelineLaneSvg(branchLane = 0, options = {}) {
  const laneColors = ["#0ea5e9", "#24d18f", "#ff1744", "#00d9ff", "#f59e0b", "#ec4899"];
  const mainX = 34;
  const laneGap = 18;
  const laneX = mainX + (branchLane * laneGap);
  const height = 34;
  const dotY = 17;
  const parallelCount = Math.max(1, Number(options.parallelCount || 1));
  const previousParallelCount = Math.max(1, Number(options.previousParallelCount || 1));
  const nextParallelCount = Math.max(1, Number(options.nextParallelCount || 1));
  const branchColor = laneColors[branchLane] || laneColors[laneColors.length - 1];
  const bleed = 5;
  const topY = -bleed;
  const bottomY = height + bleed;
  const mainBottomY = options.isLast ? dotY : bottomY;
  const paths = [
    `<path class="lane-line main-line" d="M ${mainX} ${topY} L ${mainX} ${mainBottomY}" style="--lane-color:${laneColors[0]}"></path>`,
  ];
  if (parallelCount > 1) {
    for (let lane = 1; lane < parallelCount; lane += 1) {
      const x = mainX + (lane * laneGap);
      const color = laneColors[lane] || laneColors[laneColors.length - 1];
      paths.push(`<path class="lane-line branch-line" d="M ${x} ${topY} L ${x} ${bottomY}" style="--lane-color:${color}"></path>`);
    }
  }
  if (previousParallelCount > 1 && parallelCount === 1 && branchLane === 0) {
    for (let lane = 1; lane < previousParallelCount; lane += 1) {
      const x = mainX + (lane * laneGap);
      const color = laneColors[lane] || laneColors[laneColors.length - 1];
      paths.push(`<path class="lane-line branch-line" d="M ${x} ${topY} L ${x} 2 C ${x} ${dotY - 6}, ${mainX} ${dotY - 6}, ${mainX} ${dotY}" style="--lane-color:${color}"></path>`);
    }
  }
  if (nextParallelCount > 1 && parallelCount === 1) {
    for (let lane = 1; lane < nextParallelCount; lane += 1) {
      const x = mainX + (lane * laneGap);
      const color = laneColors[lane] || laneColors[laneColors.length - 1];
      paths.push(`<path class="lane-line split-curve" d="M ${mainX} ${dotY} C ${mainX} ${dotY + 11}, ${x} ${dotY + 11}, ${x} ${height - 2} L ${x} ${bottomY}" style="--lane-color:${color}"></path>`);
    }
  }
  return `
    <svg class="adf-git-lane-svg" viewBox="0 0 116 ${height}" preserveAspectRatio="none" focusable="false">
      ${paths.join("")}
      <circle class="lane-dot" cx="${laneX}" cy="${dotY}" r="5.2" style="--lane-color:${branchColor}"></circle>
    </svg>
  `;
}
