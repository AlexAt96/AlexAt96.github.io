/* Reference extract: getSelectedAdfPipelineFlow(...) from app/src/app.js:12081-12084. */

function getSelectedAdfPipelineFlow(flows = []) {
  const selectedKey = normaliseImportHeader(queryParam("adfPipeline"));
  return flows.find((flow) => normaliseImportHeader(flow.pipelineName) === selectedKey) || flows[0];
}
