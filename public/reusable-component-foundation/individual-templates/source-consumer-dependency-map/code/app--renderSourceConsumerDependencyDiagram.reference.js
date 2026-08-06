/* Reference extract: renderSourceConsumerDependencyDiagram(...) from app/src/app.js:15235-15255. */

function renderSourceConsumerDependencyDiagram(rows = [], bu = getSelectedBu()) {
  return `
    <section class="source-consumer-diagram-panel" aria-label="Interactive source and consumer dependency diagram">
      <div class="source-consumer-diagram-heading">
        <div>
          <p class="eyebrow">Interactive diagram</p>
          <h4>Environment dependencies</h4>
        </div>
        <div class="source-consumer-diagram-actions">
          <button class="icon-button ghost source-consumer-diagram-reset" type="button">
            <svg><use href="#icon-x"></use></svg>
            <span>Clear focus</span>
          </button>
        </div>
      </div>
      <div class="source-consumer-diagram" id="sourceConsumerDiagram" data-business-unit-id="${escapeHtml(bu?.id || "")}">
        ${renderSourceConsumerDependencyDiagramContent(rows, bu)}
      </div>
    </section>
  `;
}
