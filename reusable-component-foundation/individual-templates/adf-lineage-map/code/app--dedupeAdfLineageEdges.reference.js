/* Reference extract: dedupeAdfLineageEdges(...) from app/src/app.js:12784-12792. */

function dedupeAdfLineageEdges(edges = []) {
  const grouped = new Map();
  edges.forEach((edge) => {
    const key = [edge.from, edge.to, edge.label, edge.kind].join("|");
    if (!grouped.has(key)) grouped.set(key, { ...edge });
    else grouped.get(key).weight += Number(edge.weight || 1);
  });
  return [...grouped.values()].sort((a, b) => b.weight - a.weight || `${a.from}${a.to}`.localeCompare(`${b.from}${b.to}`));
}
