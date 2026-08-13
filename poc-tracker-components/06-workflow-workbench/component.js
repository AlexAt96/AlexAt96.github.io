(function (global) {
  const sample = {
    title: "Workflow decision workbench",
    description: "Guide each record through clear stages, outcome measures, supporting information and a focused next action.",
    stages: ["Brief", "Shape", "Work", "Review", "Decide"],
    labels: { selector: "Work items", summary: "Primary statement", measures: "Measures", evidence: "Supporting information", outcome: "Current position", nextAction: "Next action", action: "Record decision" },
    items: [
      {
        id: "ITEM-01", title: "Customer onboarding workflow", owner: "Product team", status: "In progress", stage: "Work",
        summary: "Create a guided onboarding route that collects only the information needed for the next decision.",
        metrics: [
          { label: "Completion", target: "85%", value: "78%", status: "watch" },
          { label: "Median time", target: "8 min", value: "6.4 min", status: "good" },
          { label: "Correction rate", target: "< 5%", value: "4%", status: "good" }
        ],
        sections: [
          { title: "Approach", body: "Use a short guided route with progressive disclosure and a saved draft." },
          { title: "Definition of done", body: "A user can complete, pause and recover the route with representative data." },
          { title: "Guardrails", body: "Keep manual review, explicit consent and accessible alternatives available." }
        ],
        evidence: ["Journey map reviewed", "Five moderated sessions complete", "Keyboard path verified"],
        outcome: "The route is usable and faster than the current baseline; completion remains below target.",
        nextAction: "Complete the remaining sessions and review the two largest drop-off points.",
        confidence: "Medium", tags: ["Guided journey", "User research"]
      },
      {
        id: "ITEM-02", title: "Service readiness review", owner: "Platform team", status: "In review", stage: "Review",
        summary: "Confirm that a service has enough operational evidence to move into a controlled release.",
        metrics: [
          { label: "Checks complete", target: "100%", value: "92%", status: "watch" },
          { label: "Critical findings", target: "0", value: "0", status: "good" },
          { label: "Recovery test", target: "Pass", value: "Pass", status: "good" }
        ],
        sections: [
          { title: "Approach", body: "Review the service contract, observability, support model and recovery evidence." },
          { title: "Definition of done", body: "All mandatory checks have an owner, outcome and current source." },
          { title: "Guardrails", body: "A reviewer remains accountable for the final readiness decision." }
        ],
        evidence: ["Runbook approved", "Recovery exercise recorded", "Two non-critical checks remain"],
        outcome: "No critical blockers are open. Two ownership checks need confirmation.",
        nextAction: "Confirm support ownership and record the release decision.",
        confidence: "High", tags: ["Operational readiness", "Governed decision"]
      }
    ]
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const cloneData = (data) => ({ ...data, stages: [...data.stages], labels: { ...data.labels }, items: data.items.map((item) => ({ ...item, metrics: (item.metrics || []).map((metric) => ({ ...metric })), sections: (item.sections || []).map((section) => ({ ...section })), evidence: [...(item.evidence || [])], tags: [...(item.tags || [])] })) });

  function mount(root, initialData = sample, options = {}) {
    let data = cloneData(initialData);
    let selectedId = data.items[0]?.id || "";
    root.innerHTML = `<section class="exp"><header><p class="poc-eyebrow">Governed workflow</p><h1 data-title></h1><p class="poc-muted" data-description></p></header><nav class="exp-selector" data-selector></nav><section class="exp-stages" data-stages aria-label="Workflow stages"></section><section class="exp-layout"><div class="exp-main" data-main></div><aside class="poc-panel exp-side" data-side aria-live="polite"></aside></section></section>`;

    function current() { return data.items.find((item) => item.id === selectedId) || data.items[0]; }
    function metricTone(metric) { return metric.status === "good" ? "success" : metric.status === "bad" ? "danger" : "warning"; }
    function metricLabel(metric) { return metric.status === "good" ? "On track" : metric.status === "bad" ? "Needs action" : "Watch"; }
    function render() {
      const item = current();
      root.querySelector("[data-title]").textContent = data.title;
      root.querySelector("[data-description]").textContent = data.description;
      root.querySelector("[data-selector]").setAttribute("aria-label", data.labels.selector || "Items");
      if (!item) {
        root.querySelector("[data-selector]").innerHTML = "";
        root.querySelector("[data-stages]").innerHTML = "";
        root.querySelector("[data-main]").innerHTML = `<div class="poc-panel poc-muted">No work items are available.</div>`;
        root.querySelector("[data-side]").innerHTML = `<p class="poc-muted">Select a record.</p>`;
        return;
      }
      const currentIndex = data.stages.indexOf(item.stage);
      root.querySelector("[data-selector]").innerHTML = data.items.map((candidate) => `<button class="poc-button" data-item="${escapeHtml(candidate.id)}" aria-pressed="${candidate.id === item.id}"><span><span class="poc-eyebrow">${escapeHtml(candidate.id)}</span><strong>${escapeHtml(candidate.title)}</strong><small>${escapeHtml(candidate.owner)}</small></span></button>`).join("");
      root.querySelector("[data-stages]").style.setProperty("--stage-count", data.stages.length);
      root.querySelector("[data-stages]").innerHTML = data.stages.map((stage, index) => `<button class="exp-stage" type="button" data-stage="${escapeHtml(stage)}" data-complete="${index < currentIndex}" aria-current="${index === currentIndex ? "step" : "false"}"><strong>${index + 1}. ${escapeHtml(stage)}</strong><small>${index < currentIndex ? "Complete" : index === currentIndex ? escapeHtml(item.status) : "Not started"}</small></button>`).join("");
      root.querySelector("[data-main]").innerHTML = `<article class="poc-panel exp-summary"><p class="poc-eyebrow">${escapeHtml(data.labels.summary)}</p><blockquote>${escapeHtml(item.summary)}</blockquote></article><article class="poc-panel"><div class="poc-panel__header"><div><h2>${escapeHtml(data.labels.measures)}</h2><p>Targets remain visible beside current values.</p></div></div><div class="exp-metrics">${item.metrics.map((metric) => `<section class="exp-metric"><span class="poc-pill poc-pill--${metricTone(metric)}">${metricLabel(metric)}</span><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong><small class="poc-muted">Target: ${escapeHtml(metric.target)}</small></section>`).join("")}</div></article><div class="exp-sections">${item.sections.map((section) => `<article class="poc-panel"><h2>${escapeHtml(section.title)}</h2><p class="poc-muted">${escapeHtml(section.body)}</p></article>`).join("")}</div>`;
      root.querySelector("[data-side]").innerHTML = `<section><div class="poc-cluster"><span class="poc-pill poc-pill--primary">${escapeHtml(item.id)}</span><span class="poc-pill poc-pill--info">${escapeHtml(item.status)}</span></div><h2>${escapeHtml(item.title)}</h2><p class="poc-muted">Owner: ${escapeHtml(item.owner)}</p><div class="poc-cluster exp-tags">${item.tags.map((tag) => `<span class="poc-pill">${escapeHtml(tag)}</span>`).join("")}</div></section><section><h3>${escapeHtml(data.labels.evidence)}</h3><ul>${item.evidence.map((evidence) => `<li>${escapeHtml(evidence)}</li>`).join("") || "<li>No supporting information supplied</li>"}</ul></section><section><h3>${escapeHtml(data.labels.outcome)}</h3><p>${escapeHtml(item.outcome)}</p><p><strong>Confidence:</strong> ${escapeHtml(item.confidence)}</p></section><section><h3>${escapeHtml(data.labels.nextAction)}</h3><p>${escapeHtml(item.nextAction)}</p><button class="poc-button poc-button--primary" type="button" data-action>${escapeHtml(data.labels.action)}</button></section>`;
    }

    root.addEventListener("click", (event) => {
      const itemButton = event.target.closest("[data-item]");
      const stageButton = event.target.closest("[data-stage]");
      if (itemButton) { selectedId = itemButton.dataset.item; options.onSelect?.(current()); render(); }
      if (stageButton && current()) { current().stage = stageButton.dataset.stage; current().status = `${stageButton.dataset.stage} in progress`; options.onChange?.(cloneData(data), { type: "stage", item: { ...current() } }); render(); }
      if (event.target.closest("[data-action]")) options.onAction?.(current());
    });
    render();
    return {
      select(id) { if (data.items.some((item) => item.id === id)) { selectedId = id; render(); } },
      setData(next) { data = cloneData(next); selectedId = data.items[0]?.id || ""; render(); },
      getData() { return cloneData(data); },
      destroy() { root.innerHTML = ""; }
    };
  }

  global.WorkflowWorkbench = { mount, sample };
  global.ExperimentHub = global.WorkflowWorkbench;
})(window);
