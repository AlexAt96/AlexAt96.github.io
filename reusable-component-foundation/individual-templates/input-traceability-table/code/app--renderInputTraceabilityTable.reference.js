/* Reference extract: renderInputTraceabilityTable(...) from app/src/app.js:5319-5348. */

function renderInputTraceabilityTable(entries) {
  if (!entries.length) {
    return `<div class="empty-state"><strong>No matching source records.</strong><span>Adjust the filters or add an offline source from the form.</span></div>`;
  }
  return `
    <div class="data-table-wrap">
      <table class="data-table input-table">
        <caption>Source and evidence traceability register. Attached file links ${SERVER_MODE ? "download the stored local upload version" : "download the embedded localStorage data URL"}.</caption>
        <thead>
          <tr>
            <th>Business Unit</th>
            <th>Source record</th>
            <th>Category</th>
            <th>Source / method</th>
            <th>Owner/contact</th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Downstream output</th>
            <th>Used for</th>
            <th>Gaps / notes</th>
            <th>Supporting files</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(renderInputTraceabilityRow).join("")}
        </tbody>
      </table>
    </div>
  `;
}
