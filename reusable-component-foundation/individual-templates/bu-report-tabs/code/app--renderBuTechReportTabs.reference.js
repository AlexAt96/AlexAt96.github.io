/* Reference extract: renderBuTechReportTabs(...) from app/src/app.js:24780-24795. */

function renderBuTechReportTabs(bu, activeTab) {
  const tabs = [
    { key: "document", label: "Document", detail: "Report preview" },
    { key: "slides", label: "Slides", detail: "Slide preview" },
  ];
  return `
    <nav class="bu-tech-report-view-tabs" aria-label="BU technical report views">
      ${tabs.map((tab) => `
        <a class="bu-tech-report-view-tab ${tab.key === activeTab ? "active" : ""}" href="${escapeHtml(getBuTechReportTabHref(bu, tab.key))}" aria-current="${tab.key === activeTab ? "page" : "false"}">
          <span>${escapeHtml(tab.label)}</span>
          <small>${escapeHtml(tab.detail)}</small>
        </a>
      `).join("")}
    </nav>
  `;
}
