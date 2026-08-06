(function (global) {
  const sample = {
    title: "Programme delivery overview",
    description: "Switch perspectives to understand progress, capacity, evidence and quality in one place.",
    defaultLens: "Delivery",
    lenses: {
      Delivery: {
        question: "Are we delivering the planned outcomes at the expected pace?",
        chartTitle: "Outcome progress",
        chartSummary: "Seven reporting periods · percentage complete",
        unit: "%",
        kpis: [
          { label: "Overall progress", value: "64%", note: "+6 points this period", tone: "info" },
          { label: "Milestones", value: "7 / 10", note: "Two due next period", tone: "success" },
          { label: "Blocked items", value: "2", note: "One needs escalation", tone: "warning" },
          { label: "Forecast finish", value: "Period 11", note: "One period beyond baseline", tone: "warning" }
        ],
        trend: [
          { label: "P1", value: 28, note: "Initial baseline" }, { label: "P2", value: 34, note: "Scope agreed" },
          { label: "P3", value: 41, note: "First outcome complete" }, { label: "P4", value: 47, note: "Integration started" },
          { label: "P5", value: 51, note: "One item re-planned" }, { label: "P6", value: 58, note: "Acceptance underway" },
          { label: "P7", value: 64, note: "Current reporting position" }
        ],
        allocationTitle: "Progress by workstream",
        allocation: [
          { label: "Discovery", value: 100, display: "100%" }, { label: "Data", value: 72, display: "72%" },
          { label: "Services", value: 61, display: "61%" }, { label: "Experience", value: 48, display: "48%" }
        ],
        matrixTitle: "Milestone health",
        matrix: [
          { label: "Scope", value: "Done", tone: "good", note: "Approved baseline" },
          { label: "Data", value: "Watch", tone: "warn", note: "One quality check open" },
          { label: "Build", value: "On track", tone: "good", note: "Core path available" },
          { label: "Assure", value: "Watch", tone: "warn", note: "Evidence is incomplete" },
          { label: "Launch", value: "Planned", tone: "neutral", note: "Entry gate not yet due" },
          { label: "Adopt", value: "Planned", tone: "neutral", note: "Measures agreed" }
        ],
        insight: { value: "64%", title: "Current position", body: "Progress is improving, with one dependency likely to affect the baseline finish." }
      },
      Effort: {
        question: "Is capacity being used where the plan needs it most?",
        chartTitle: "Capacity used",
        chartSummary: "Seven reporting periods · hours recorded",
        unit: "h",
        kpis: [
          { label: "Recorded effort", value: "326h", note: "42h this period", tone: "info" },
          { label: "Remaining forecast", value: "174h", note: "35% of baseline", tone: "neutral" },
          { label: "Available capacity", value: "88%", note: "Within planning range", tone: "success" },
          { label: "Unplanned work", value: "21h", note: "6% of recorded effort", tone: "warning" }
        ],
        trend: [
          { label: "P1", value: 32, note: "Team mobilisation" }, { label: "P2", value: 74, note: "Discovery peak" },
          { label: "P3", value: 119, note: "Data work started" }, { label: "P4", value: 166, note: "Build capacity added" },
          { label: "P5", value: 218, note: "Integration peak" }, { label: "P6", value: 284, note: "Assurance added" },
          { label: "P7", value: 326, note: "Current recorded effort" }
        ],
        allocationTitle: "Effort by discipline",
        allocation: [
          { label: "Product", value: 54, display: "54h" }, { label: "Data", value: 88, display: "88h" },
          { label: "Engineering", value: 126, display: "126h" }, { label: "Assurance", value: 58, display: "58h" }
        ],
        matrixTitle: "Capacity signals",
        matrix: [
          { label: "Product", value: "Stable", tone: "good", note: "No allocation gap" },
          { label: "Data", value: "High", tone: "warn", note: "Near agreed limit" },
          { label: "Platform", value: "Stable", tone: "good", note: "Capacity confirmed" },
          { label: "UX", value: "Stable", tone: "good", note: "Capacity confirmed" },
          { label: "Test", value: "Gap", tone: "bad", note: "Two sessions uncovered" },
          { label: "Change", value: "Planned", tone: "neutral", note: "Starts next period" }
        ],
        insight: { value: "88%", title: "Capacity position", body: "Overall capacity is healthy; test coverage is the only material allocation gap." }
      },
      Evidence: {
        question: "Do we have enough traceable evidence to support the next decision?",
        chartTitle: "Evidence coverage",
        chartSummary: "Seven reporting periods · approved artefacts",
        unit: "%",
        kpis: [
          { label: "Coverage", value: "78%", note: "+12 points this period", tone: "info" },
          { label: "Approved artefacts", value: "18", note: "Of 23 required", tone: "success" },
          { label: "Evidence gaps", value: "5", note: "Two block a decision", tone: "warning" },
          { label: "Stale sources", value: "1", note: "Owner notified", tone: "warning" }
        ],
        trend: [
          { label: "P1", value: 12, note: "Evidence plan created" }, { label: "P2", value: 20, note: "Research uploaded" },
          { label: "P3", value: 31, note: "Scope decision recorded" }, { label: "P4", value: 43, note: "Data checks added" },
          { label: "P5", value: 54, note: "Integration logs added" }, { label: "P6", value: 66, note: "Acceptance started" },
          { label: "P7", value: 78, note: "Current evidence coverage" }
        ],
        allocationTitle: "Evidence by source",
        allocation: [
          { label: "Decisions", value: 100, display: "6 / 6" }, { label: "Research", value: 86, display: "6 / 7" },
          { label: "Test", value: 67, display: "4 / 6" }, { label: "Operations", value: 50, display: "2 / 4" }
        ],
        matrixTitle: "Evidence quality",
        matrix: [
          { label: "Traceable", value: "91%", tone: "good", note: "Linked to source records" },
          { label: "Current", value: "83%", tone: "good", note: "Within review window" },
          { label: "Approved", value: "78%", tone: "warn", note: "Five await approval" },
          { label: "Complete", value: "74%", tone: "warn", note: "Required fields present" },
          { label: "Accessible", value: "100%", tone: "good", note: "Available to reviewers" },
          { label: "Retained", value: "100%", tone: "good", note: "Retention applied" }
        ],
        insight: { value: "5 gaps", title: "Evidence position", body: "Coverage is increasing, but acceptance and operational-readiness evidence remain incomplete." }
      },
      Quality: {
        question: "Is the delivered experience stable enough for the next stage?",
        chartTitle: "Checks passing",
        chartSummary: "Seven reporting periods · verified checks",
        unit: "%",
        kpis: [
          { label: "Pass rate", value: "92%", note: "+4 points this period", tone: "success" },
          { label: "Open defects", value: "7", note: "None are critical", tone: "info" },
          { label: "Accessibility", value: "18 / 20", note: "Two checks in progress", tone: "warning" },
          { label: "Recovery routes", value: "4 / 5", note: "One retest due", tone: "warning" }
        ],
        trend: [
          { label: "P1", value: 44, note: "First checks recorded" }, { label: "P2", value: 56, note: "Core flow available" },
          { label: "P3", value: 63, note: "Service tests added" }, { label: "P4", value: 71, note: "Error states covered" },
          { label: "P5", value: 79, note: "Accessibility pass" }, { label: "P6", value: 88, note: "Regression complete" },
          { label: "P7", value: 92, note: "Current pass rate" }
        ],
        allocationTitle: "Pass rate by test family",
        allocation: [
          { label: "Functional", value: 96, display: "96%" }, { label: "Accessibility", value: 90, display: "90%" },
          { label: "Performance", value: 88, display: "88%" }, { label: "Recovery", value: 80, display: "80%" }
        ],
        matrixTitle: "Quality gates",
        matrix: [
          { label: "Critical path", value: "Pass", tone: "good", note: "All priority checks pass" },
          { label: "A11y", value: "Watch", tone: "warn", note: "Two checks open" },
          { label: "Security", value: "Pass", tone: "good", note: "No material findings" },
          { label: "Recovery", value: "Retest", tone: "warn", note: "Timeout path due" },
          { label: "Browser", value: "Pass", tone: "good", note: "Supported set verified" },
          { label: "Data", value: "Pass", tone: "good", note: "Quality rules met" }
        ],
        insight: { value: "92%", title: "Quality position", body: "The core experience is stable; two accessibility checks and one recovery retest remain." }
      }
    }
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));

  function mount(root, initialModel = sample, options = {}) {
    let model = initialModel;
    let lensName = model.defaultLens && model.lenses[model.defaultLens] ? model.defaultLens : Object.keys(model.lenses)[0];
    root.innerHTML = `<section class="dash"><header><p class="poc-eyebrow">Programme insight</p><h1 data-title></h1><p class="poc-muted" data-description></p></header><nav class="dash-lenses" data-lenses aria-label="Dashboard perspectives"></nav><p class="dash-question" data-question></p><section class="poc-metrics" data-kpis></section><section class="dash-grid"><article class="poc-panel dash-wide dash-chart"><div class="poc-panel__header"><div><h2 data-chart-title></h2><p data-chart-summary></p></div><span class="poc-pill poc-pill--info" data-lens-label></span></div><svg class="dash-svg" data-chart viewBox="0 0 700 230" role="img"></svg></article><aside class="poc-panel dash-inspector" data-inspector aria-live="polite"></aside><article class="poc-panel dash-wide"><h2 data-allocation-title></h2><div class="dash-bars" data-allocation></div></article><article class="poc-panel"><h2 data-matrix-title></h2><div class="dash-matrix" data-matrix></div></article></section></section>`;

    function activeLens() { return model.lenses[lensName]; }
    function inspector(content) {
      root.querySelector("[data-inspector]").innerHTML = `<p class="poc-eyebrow">${escapeHtml(content.title)}</p><strong>${escapeHtml(content.value)}</strong><p class="poc-muted">${escapeHtml(content.body)}</p>${content.action ? `<button class="poc-button" data-open-source>${escapeHtml(content.action)}</button>` : ""}`;
    }
    function renderChart(lens) {
      const values = lens.trend.map((point) => Number(point.value) || 0);
      const max = Math.max(...values, 1);
      const min = Math.min(...values, 0);
      const range = Math.max(1, max - min);
      const x = (index) => 28 + index * (642 / Math.max(1, values.length - 1));
      const y = (value) => 190 - ((value - min) / range) * 150;
      const points = lens.trend.map((point, index) => `${x(index)},${y(Number(point.value) || 0)}`);
      const chart = root.querySelector("[data-chart]");
      chart.innerHTML = `<g>${[40,90,140,190].map((lineY) => `<line class="dash-gridline" x1="28" x2="670" y1="${lineY}" y2="${lineY}"/>`).join("")}</g><path class="dash-area" d="M28,190 L${points.join(" L")} L670,190 Z"/><polyline class="dash-line" points="${points.join(" ")}"/>${lens.trend.map((point, index) => `<g class="dash-point"><circle class="dash-dot" tabindex="0" role="button" data-point="${index}" cx="${x(index)}" cy="${y(Number(point.value) || 0)}" r="7"><title>${escapeHtml(point.label)}: ${escapeHtml(point.value)}${escapeHtml(lens.unit || "")}</title></circle><text x="${x(index)}" y="218" text-anchor="middle">${escapeHtml(point.label)}</text></g>`).join("")}`;
      chart.setAttribute("aria-label", `${lens.chartTitle}. ${lens.trend.map((point) => `${point.label}: ${point.value}${lens.unit || ""}`).join(", ")}.`);
    }
    function render() {
      const lens = activeLens();
      root.querySelector("[data-title]").textContent = model.title || "Programme dashboard";
      root.querySelector("[data-description]").textContent = model.description || "";
      root.querySelector("[data-lenses]").innerHTML = Object.keys(model.lenses).map((name) => `<button class="poc-button" data-lens="${escapeHtml(name)}" aria-pressed="${name === lensName}">${escapeHtml(name)}</button>`).join("");
      root.querySelector("[data-question]").innerHTML = `<strong>Key question</strong><span>${escapeHtml(lens.question)}</span>`;
      root.querySelector("[data-kpis]").innerHTML = lens.kpis.map((kpi) => `<article class="poc-metric dash-kpi" data-tone="${escapeHtml(kpi.tone || "neutral")}"><span>${escapeHtml(kpi.label)}</span><strong>${escapeHtml(kpi.value)}</strong><small class="poc-muted">${escapeHtml(kpi.note)}</small></article>`).join("");
      root.querySelector("[data-chart-title]").textContent = lens.chartTitle;
      root.querySelector("[data-chart-summary]").textContent = lens.chartSummary;
      root.querySelector("[data-lens-label]").textContent = lensName;
      renderChart(lens);
      root.querySelector("[data-allocation-title]").textContent = lens.allocationTitle;
      const allocationMax = Math.max(...lens.allocation.map((item) => Number(item.value) || 0), 1);
      root.querySelector("[data-allocation]").innerHTML = lens.allocation.map((item) => `<div class="dash-bar"><span>${escapeHtml(item.label)}</span><div><i style="width:${Math.max(2, (Number(item.value) || 0) / allocationMax * 100)}%"></i></div><strong>${escapeHtml(item.display ?? item.value)}</strong></div>`).join("");
      root.querySelector("[data-matrix-title]").textContent = lens.matrixTitle;
      root.querySelector("[data-matrix]").innerHTML = lens.matrix.map((item, index) => `<button class="dash-cell" type="button" data-matrix-index="${index}" data-tone="${escapeHtml(item.tone || "neutral")}">${escapeHtml(item.label)}<span>${escapeHtml(item.value)}</span></button>`).join("");
      inspector({ ...lens.insight, action: "Open source records" });
    }

    root.addEventListener("click", (event) => {
      const lensButton = event.target.closest("[data-lens]");
      const point = event.target.closest("[data-point]");
      const matrix = event.target.closest("[data-matrix-index]");
      if (lensButton) { lensName = lensButton.dataset.lens; options.onLensChange?.(lensName); render(); }
      if (point) {
        const item = activeLens().trend[Number(point.dataset.point)];
        inspector({ title: `${lensName} · ${item.label}`, value: `${item.value}${activeLens().unit || ""}`, body: item.note, action: "Open reporting detail" });
      }
      if (matrix) {
        const item = activeLens().matrix[Number(matrix.dataset.matrixIndex)];
        inspector({ title: `${lensName} · ${item.label}`, value: item.value, body: item.note, action: "Open supporting record" });
      }
      if (event.target.closest("[data-open-source]")) options.onOpenSource?.({ lens: lensName });
    });
    root.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-point]")) { event.preventDefault(); event.target.click(); }
    });
    render();
    return {
      selectLens(name) { if (model.lenses[name]) { lensName = name; render(); } },
      setData(next) { model = next; lensName = next.defaultLens && next.lenses[next.defaultLens] ? next.defaultLens : Object.keys(next.lenses)[0]; render(); },
      getData() { return model; },
      destroy() { root.innerHTML = ""; }
    };
  }

  global.DashboardCharts = { mount, sample };
})(window);
