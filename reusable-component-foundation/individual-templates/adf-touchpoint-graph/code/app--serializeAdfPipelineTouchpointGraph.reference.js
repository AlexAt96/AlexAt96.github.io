/* Reference extract: serializeAdfPipelineTouchpointGraph(...) from app/src/app.js:12603-12622. */

function serializeAdfPipelineTouchpointGraph(graph = {}) {
  return {
    nodes: [...(graph.nodes || new Map()).values()].map((node) => ({
      key: node.key,
      label: node.label,
      sublabel: node.sublabel || "",
      kind: node.kind,
      role: node.role || node.kind,
      environmentId: node.environmentId || "",
      workspaceId: node.workspaceId || "",
      pipelines: [...(node.pipelines || new Set())],
      order: Number(node.order || 0),
    })),
    edges: graph.edges || [],
    groups: graph.groups || [],
    pipelineCount: graph.pipelineCount || 0,
    touchpointCount: graph.touchpointCount || 0,
    sharedCount: graph.sharedCount || 0,
  };
}
