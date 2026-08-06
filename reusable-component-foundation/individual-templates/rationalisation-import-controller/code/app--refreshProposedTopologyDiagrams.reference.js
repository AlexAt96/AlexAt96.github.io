/* Reference extract: refreshProposedTopologyDiagrams(...) from app/src/app.js:36905-36910. */

function refreshProposedTopologyDiagrams(form) {
  refreshProposedTopologyFlowDiagram(form);
  refreshProposedTopologyStructureDiagram(form);
  refreshEnvironmentMigrationFlowDiagram(form);
  wireInteractiveTopologyCanvases(form);
}
