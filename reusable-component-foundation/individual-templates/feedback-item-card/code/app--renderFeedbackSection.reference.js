/* Reference extract: renderFeedbackSection(...) from app/src/app.js:4262-4278. */

function renderFeedbackSection(items = []) {
  if (!items.length) return "";
  return `
    <section class="panel feedback-section" id="phase-feedback">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Feedback</p>
          <h3>Open review feedback</h3>
        </div>
        <span class="pill">${items.length} item${items.length === 1 ? "" : "s"}</span>
      </div>
      <div class="feedback-list">
        ${items.map(renderFeedbackItem).join("")}
      </div>
    </section>
  `;
}
