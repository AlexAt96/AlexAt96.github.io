/* Reference extract: renderSourceConsumerDependencyDiagramContent(...) from app/src/app.js:15302-15313. */

function renderSourceConsumerDependencyDiagramContent(rows = [], bu = getSelectedBu()) {
  const graph = buildSourceConsumerDependencyGraph(rows, bu);
  if (!graph.edges.length) {
    return `
      <div class="empty-state compact">
        <strong>No dependencies to draw yet.</strong>
        <span>Add source or consumer rows in the tracker table to populate the diagram.</span>
      </div>
    `;
  }
  return renderSourceConsumerDependencyVisualiser(graph, bu);
}
