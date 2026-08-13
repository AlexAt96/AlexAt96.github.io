/* Reference extract: renderProgramTopologyDiagram(...) from app/src/app.js:17583-17597. */

function renderProgramTopologyDiagram(model, activeTab) {
  const diagram = activeTab === "environment-consolidation"
    ? `<div class="environment-migration-flow-diagram program-topology-diagram">${renderEnvironmentMigrationFlowDiagram(model.rationalisationRows, model.topology.environments)}</div>`
    : activeTab === "cicd-pipeline-topology"
      ? `<div class="proposed-topology-flow-diagram program-topology-diagram">${renderProposedTopologyFlowDiagram(model.topology.environments)}</div>`
      : `<div class="proposed-topology-structure-diagram program-topology-diagram">${renderProposedTopologyStructureDiagram(model.topology)}</div>`;
  return `
    <section class="panel program-topology-diagram-panel">
      <div class="program-topology-chart-context">
        ${renderProgramTopologyKey(activeTab)}
      </div>
      ${diagram}
    </section>
  `;
}
