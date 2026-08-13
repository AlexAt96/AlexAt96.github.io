(function (global) {
  const sample = [
    { id: "task-frame", key: "WORK-01", title: "Define the intended outcome", phase: "Discovery", priority: "Critical", status: "Done", owner: "Product", estimate: 2, dependencies: [], acceptance: "The user, outcome and delivery boundary are explicit.", summary: "Agree what this piece of work must achieve." },
    { id: "task-scope", key: "WORK-02", title: "Approve the delivery boundary", phase: "Discovery", priority: "High", status: "Done", owner: "Programme lead", estimate: 1, dependencies: ["task-frame"], acceptance: "The team shares one definition of done.", summary: "Confirm value, ownership and constraints." },
    { id: "task-data", key: "WORK-03", title: "Prepare representative inputs", phase: "Delivery", priority: "High", status: "In progress", owner: "Data team", estimate: 3, dependencies: ["task-scope"], acceptance: "Primary and recovery paths have representative records.", summary: "Create safe sample records for the workflow." },
    { id: "task-api", key: "WORK-04", title: "Configure the service contract", phase: "Delivery", priority: "High", status: "In progress", owner: "Platform team", estimate: 4, dependencies: ["task-scope"], acceptance: "The interface can load and update representative records.", summary: "Provide the smallest stable contract needed by the screen." },
    { id: "task-ui", key: "WORK-05", title: "Assemble the user journey", phase: "Delivery", priority: "Critical", status: "Not started", owner: "Experience team", estimate: 4, dependencies: ["task-data", "task-api"], acceptance: "A user can complete the core journey without explanation.", summary: "Connect screen states to the service contract." },
    { id: "task-rehearse", key: "WORK-06", title: "Run the acceptance route", phase: "Assurance", priority: "Critical", status: "Blocked", owner: "Assurance team", estimate: 2, dependencies: ["task-ui"], acceptance: "The primary and recovery routes are recorded.", summary: "Run agreed scenarios and capture evidence." }
  ];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const tone = (status) => /done/i.test(status) ? "success" : /blocked/i.test(status) ? "danger" : /progress/i.test(status) ? "info" : /review/i.test(status) ? "warning" : "neutral";

  function mount(root, initialItems = sample, options = {}) {
    let items = initialItems.map((item) => ({ ...item, dependencies: [...(item.dependencies || [])] }));
    let selectedId = items[0]?.id || "";
    let filters = { query: "", status: "", owner: "" };
    root.innerHTML = `<section class="backlog"><header><p class="poc-eyebrow">Delivery planning</p><h1>${escapeHtml(options.title || "Delivery backlog")}</h1><p class="poc-muted">${escapeHtml(options.description || "Prioritise work, keep dependencies visible and inspect task detail without losing your place.")}</p></header><section class="poc-panel backlog-tools"><label class="poc-field">Search<input data-filter="query" type="search" placeholder="Search by key, task or owner…"></label><label class="poc-field">Status<select data-filter="status"></select></label><label class="poc-field">Owner<select data-filter="owner"></select></label><button class="poc-button" data-reset>Clear filters</button></section><section class="backlog-layout"><div class="backlog-list" data-list></div><aside class="poc-panel backlog-detail" data-detail aria-live="polite"></aside></section></section>`;
    const fillSelect = (name, values, label) => root.querySelector(`[data-filter="${name}"]`).innerHTML = `<option value="">${label}</option>${[...new Set(values)].sort().map((value) => `<option>${escapeHtml(value)}</option>`).join("")}`;
    fillSelect("status", items.map((item) => item.status), "All statuses");
    fillSelect("owner", items.map((item) => item.owner), "All owners");

    function visibleItems() {
      const query = filters.query.trim().toLowerCase();
      return items.filter((item) => (!filters.status || item.status === filters.status) && (!filters.owner || item.owner === filters.owner) && (!query || `${item.key} ${item.title} ${item.owner} ${item.summary}`.toLowerCase().includes(query)));
    }

    function move(id, direction) {
      const index = items.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= items.length || items[index].phase !== items[target].phase) return;
      [items[index], items[target]] = [items[target], items[index]];
      options.onChange?.(items.map((item) => ({ ...item })));
      render();
      root.querySelector(`[data-select="${id}"]`)?.focus();
    }

    function render() {
      const visible = visibleItems();
      if (!visible.some((item) => item.id === selectedId)) selectedId = visible[0]?.id || "";
      const phases = [...new Set(visible.map((item) => item.phase))];
      root.querySelector("[data-list]").innerHTML = phases.map((phase) => {
        const rows = visible.filter((item) => item.phase === phase);
        const points = rows.reduce((sum, item) => sum + Number(item.estimate || 0), 0);
        return `<section class="backlog-phase"><header><strong>${escapeHtml(phase)}</strong><span>${rows.length} tasks · ${points} points</span></header>${rows.map((item) => `<article class="backlog-item" aria-current="${item.id === selectedId}"><div class="backlog-handle" aria-label="Reorder ${escapeHtml(item.title)}"><button data-move="-1" data-id="${item.id}" title="Move up">↑</button><button data-move="1" data-id="${item.id}" title="Move down">↓</button></div><span class="backlog-key">${escapeHtml(item.key)}</span><button class="backlog-main" data-select="${item.id}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.summary)}</small></button><span class="poc-pill poc-pill--${tone(item.status)}">${escapeHtml(item.status)}</span><span>${escapeHtml(item.owner)}</span><strong>${Number(item.estimate) || 0} pts</strong></article>`).join("")}</section>`;
      }).join("") || `<div class="poc-panel poc-muted">No tasks match these filters.</div>`;
      renderDetail();
    }

    function renderDetail() {
      const item = items.find((candidate) => candidate.id === selectedId);
      const detail = root.querySelector("[data-detail]");
      if (!item) { detail.innerHTML = `<p class="poc-muted">Select a visible task.</p>`; return; }
      detail.innerHTML = `<section><div class="poc-cluster"><span class="poc-pill">${escapeHtml(item.key)}</span><span class="poc-pill poc-pill--${tone(item.status)}">${escapeHtml(item.status)}</span><span class="poc-pill poc-pill--primary">${escapeHtml(item.priority)}</span></div><h2 style="margin-top:.7rem">${escapeHtml(item.title)}</h2><p class="poc-muted">${escapeHtml(item.summary)}</p></section><section><p><strong>Phase:</strong> ${escapeHtml(item.phase)}</p><p><strong>Owner:</strong> ${escapeHtml(item.owner)}</p><p><strong>Estimate:</strong> ${Number(item.estimate) || 0} points</p></section><section><h3>Dependencies</h3><ul>${item.dependencies.length ? item.dependencies.map((id) => `<li>${escapeHtml(items.find((candidate) => candidate.id === id)?.title || id)}</li>`).join("") : "<li>None</li>"}</ul></section><section><h3>Acceptance</h3><p>${escapeHtml(item.acceptance)}</p><button class="poc-button poc-button--primary" style="margin-top:1rem" data-open>Open task</button></section>`;
    }

    root.addEventListener("input", (event) => {
      const control = event.target.closest("[data-filter]");
      if (!control) return;
      filters[control.dataset.filter] = control.value;
      render();
    });
    root.addEventListener("click", (event) => {
      const select = event.target.closest("[data-select]");
      const moveButton = event.target.closest("[data-move]");
      if (select) { selectedId = select.dataset.select; render(); }
      if (moveButton) move(moveButton.dataset.id, Number(moveButton.dataset.move));
      if (event.target.closest("[data-reset]")) {
        filters = { query: "", status: "", owner: "" };
        root.querySelectorAll("[data-filter]").forEach((control) => control.value = "");
        render();
      }
      if (event.target.closest("[data-open]")) options.onOpen?.(items.find((item) => item.id === selectedId));
    });
    render();
    return { setItems(next) { items = next.map((item) => ({ ...item, dependencies: [...(item.dependencies || [])] })); render(); }, select(id) { selectedId = id; render(); }, getItems() { return items.map((item) => ({ ...item })); }, destroy() { root.innerHTML = ""; } };
  }

  global.PlanningBacklog = { mount, sample };
})(window);
