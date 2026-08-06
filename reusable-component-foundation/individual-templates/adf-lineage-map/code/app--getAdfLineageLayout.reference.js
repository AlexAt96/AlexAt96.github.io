/* Reference extract: getAdfLineageLayout(...) from app/src/app.js:12739-12757. */

function getAdfLineageLayout(nodes = []) {
  const laneGroups = new Map(ADF_LINEAGE_LANES.map((lane) => [lane.key, []]));
  nodes.forEach((node) => {
    const laneKey = laneGroups.has(node.lane) ? node.lane : "activity";
    laneGroups.get(laneKey).push(node);
  });
  const points = new Map();
  let height = 320;
  ADF_LINEAGE_LANES.forEach((lane) => {
    const laneNodes = laneGroups.get(lane.key) || [];
    const gap = 78;
    laneNodes.forEach((node, index) => {
      const y = 92 + (index * gap);
      points.set(node.key, { x: lane.x, y });
      height = Math.max(height, y + 72);
    });
  });
  return { points, height };
}
