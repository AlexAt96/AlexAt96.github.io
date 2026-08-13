(function (global) {
  const sample = [
    { id: "task-1", key: "WORK-01", title: "Define the outcome", phase: "Discover", owner: "Product", status: "done", progress: 100, startWeek: 1, durationWeeks: 1, dependencies: [] },
    { id: "task-2", key: "WORK-02", title: "Agree the delivery boundary", phase: "Discover", owner: "Sponsor", status: "done", progress: 100, startWeek: 2, durationWeeks: 1, dependencies: ["task-1"] },
    { id: "task-3", key: "WORK-03", title: "Prepare representative inputs", phase: "Deliver", owner: "Data", status: "in-progress", progress: 70, startWeek: 3, durationWeeks: 2, dependencies: ["task-2"] },
    { id: "task-4", key: "WORK-04", title: "Configure the service layer", phase: "Deliver", owner: "Platform", status: "in-progress", progress: 55, startWeek: 3, durationWeeks: 3, dependencies: ["task-2"] },
    { id: "task-5", key: "WORK-05", title: "Assemble the user journey", phase: "Deliver", owner: "Experience", status: "not-started", progress: 10, startWeek: 5, durationWeeks: 3, dependencies: ["task-3", "task-4"] },
    { id: "task-6", key: "WORK-06", title: "Complete assurance checks", phase: "Assure", owner: "Assurance", status: "blocked", progress: 20, startWeek: 7, durationWeeks: 2, dependencies: ["task-5"] },
    { id: "task-7", key: "WORK-07", title: "Confirm readiness", phase: "Release", owner: "Delivery lead", status: "not-started", progress: 0, startWeek: 9, durationWeeks: 2, dependencies: ["task-6"] }
  ];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const cloneTasks = (tasks) => tasks.map((task) => ({ ...task, dependencies: [...(task.dependencies || [])] }));
  const statusLabel = (status) => ({ "not-started": "Not started", "in-progress": "In progress", blocked: "Blocked", done: "Complete" }[status] || status);

  function mount(root, initialTasks = sample, options = {}) {
    const weeks = Math.max(4, Number(options.weeks) || 10);
    const initial = cloneTasks(initialTasks);
    let tasks = cloneTasks(initialTasks);
    let selectedId = tasks[0]?.id || "";
    let view = "tasks";
    let pointerState = null;
    let reorderId = "";
    let undoSnapshot = null;
    const collapsed = new Set();

    root.innerHTML = `<section class="gantt"><header class="gantt-head"><div><p class="poc-eyebrow">Timeline planning</p><h1>Integrated delivery plan</h1><p class="poc-muted">Move work across the timeline, resize durations and switch to a clear phase-level view.</p></div><div class="gantt-controls"><button class="poc-button" data-view="tasks" aria-pressed="true">Work items</button><button class="poc-button" data-view="phases" aria-pressed="false">Phases</button><button class="poc-button" data-undo disabled>Undo</button><button class="poc-button" data-reset>Reset plan</button><button class="poc-button" data-full>Expand view</button></div></header><p class="gantt-status poc-sr-only" data-status aria-live="polite"></p><section class="poc-metrics" data-metrics></section><section class="poc-panel gantt-panel"><div class="gantt-board" data-board></div><aside class="gantt-detail" data-detail aria-live="polite"></aside></section></section>`;
    const board = root.querySelector("[data-board]");

    function announce(message) { root.querySelector("[data-status]").textContent = message; }
    function selectedTask() { return tasks.find((task) => task.id === selectedId); }
    function remember() { undoSnapshot = cloneTasks(tasks); root.querySelector("[data-undo]").disabled = false; }
    function commit(kind, task) {
      options.onChange?.(cloneTasks(tasks), { type: kind, task: task ? { ...task } : null });
      if (task) announce(`${task.title} updated. Starts in week ${task.startWeek} and lasts ${task.durationWeeks} week${task.durationWeeks === 1 ? "" : "s"}.`);
      render();
    }
    function clampTask(task) {
      task.durationWeeks = Math.max(1, Math.min(weeks, Number(task.durationWeeks) || 1));
      task.startWeek = Math.max(1, Math.min(weeks - task.durationWeeks + 1, Number(task.startWeek) || 1));
      task.progress = Math.max(0, Math.min(100, Number(task.progress) || 0));
    }
    function phaseSummary(phase) {
      const rows = tasks.filter((task) => task.phase === phase);
      const startWeek = Math.min(...rows.map((task) => task.startWeek));
      const endWeek = Math.max(...rows.map((task) => task.startWeek + task.durationWeeks - 1));
      return {
        startWeek,
        durationWeeks: endWeek - startWeek + 1,
        progress: Math.round(rows.reduce((sum, task) => sum + task.progress, 0) / rows.length),
        blocked: rows.some((task) => task.status === "blocked")
      };
    }
    function cells() { return Array.from({ length: weeks }, (_, index) => `<span class="gantt-cell" aria-hidden="true" data-week="${index + 1}"></span>`).join(""); }
    function taskRows(phase) {
      if (collapsed.has(phase)) return "";
      return tasks.filter((task) => task.phase === phase).map((task) => `<div class="gantt-row" data-task-row="${escapeHtml(task.id)}" aria-current="${task.id === selectedId}"><div class="gantt-label" draggable="true" data-reorder-drag="${escapeHtml(task.id)}"><div><span class="gantt-grip" aria-hidden="true">⋮⋮</span><button class="gantt-title" type="button" data-select="${escapeHtml(task.id)}"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.key)} · ${escapeHtml(task.owner)} · ${task.progress}%</small></button></div><div class="gantt-row-actions" aria-label="Move ${escapeHtml(task.title)}"><button type="button" data-reorder="-1" data-id="${escapeHtml(task.id)}" title="Move row up">↑</button><button type="button" data-reorder="1" data-id="${escapeHtml(task.id)}" title="Move row down">↓</button><button type="button" data-shift="-1" data-id="${escapeHtml(task.id)}" title="Move one week earlier">←</button><button type="button" data-shift="1" data-id="${escapeHtml(task.id)}" title="Move one week later">→</button></div></div>${cells()}<button class="gantt-bar" type="button" data-bar="${escapeHtml(task.id)}" data-status="${escapeHtml(task.status)}" style="grid-column:${task.startWeek + 1}/span ${task.durationWeeks};grid-row:1" aria-label="${escapeHtml(task.title)}, week ${task.startWeek}, ${task.durationWeeks} weeks, ${task.progress}% complete"><span class="gantt-bar-progress" style="width:${task.progress}%"></span><b>${escapeHtml(task.title)}</b><i class="gantt-resize" data-resize title="Drag to resize" aria-hidden="true"></i></button></div>`).join("");
    }
    function phaseRow(phase) {
      const summary = phaseSummary(phase);
      return `<div class="gantt-row gantt-phase-row"><div class="gantt-label"><strong>${escapeHtml(phase)}</strong><small>${summary.progress}% roll-up progress</small></div>${cells()}<span class="gantt-bar" data-status="${summary.blocked ? "blocked" : "in-progress"}" style="grid-column:${summary.startWeek + 1}/span ${summary.durationWeeks};grid-row:1"><span class="gantt-bar-progress" style="width:${summary.progress}%"></span><b>${escapeHtml(phase)} · ${summary.progress}%</b></span></div>`;
    }
    function renderDetail() {
      const task = selectedTask();
      const detail = root.querySelector("[data-detail]");
      if (!task || view !== "tasks") { detail.innerHTML = `<p class="poc-muted">${view === "phases" ? "Phase view shows the rolled-up schedule. Switch to Tasks to edit individual work." : "Select a task to edit its schedule."}</p>`; return; }
      const dependencyNames = task.dependencies.map((id) => tasks.find((candidate) => candidate.id === id)?.title || id);
      detail.innerHTML = `<div class="gantt-detail-copy"><p class="poc-eyebrow">Selected task</p><h2>${escapeHtml(task.title)}</h2><p class="poc-muted">${escapeHtml(task.key)} · ${escapeHtml(task.owner)}</p><p><strong>Depends on:</strong> ${dependencyNames.length ? dependencyNames.map(escapeHtml).join(", ") : "None"}</p></div><form data-task-form><label class="poc-field">Start week<input name="startWeek" type="number" min="1" max="${weeks}" value="${task.startWeek}"></label><label class="poc-field">Duration<input name="durationWeeks" type="number" min="1" max="${weeks}" value="${task.durationWeeks}"></label><label class="poc-field">Progress (%)<input name="progress" type="number" min="0" max="100" value="${task.progress}"></label><label class="poc-field">Status<select name="status">${["not-started", "in-progress", "blocked", "done"].map((status) => `<option value="${status}" ${status === task.status ? "selected" : ""}>${statusLabel(status)}</option>`).join("")}</select></label></form>`;
    }
    function renderMetrics() {
      const progress = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0;
      root.querySelector("[data-metrics]").innerHTML = `<article class="poc-metric"><span>Overall progress</span><strong>${progress}%</strong></article><article class="poc-metric"><span>Tasks</span><strong>${tasks.length}</strong></article><article class="poc-metric"><span>Blocked</span><strong>${tasks.filter((task) => task.status === "blocked").length}</strong></article><article class="poc-metric"><span>Planning horizon</span><strong>${weeks} weeks</strong></article>`;
    }
    function render() {
      tasks.forEach(clampTask);
      if (!tasks.some((task) => task.id === selectedId)) selectedId = tasks[0]?.id || "";
      const phases = [...new Set(tasks.map((task) => task.phase))];
      board.style.setProperty("--gantt-weeks", weeks);
      board.innerHTML = `<div class="gantt-scale"><span>${view === "tasks" ? "Work item" : "Phase"}</span>${Array.from({ length: weeks }, (_, index) => `<span>W${index + 1}</span>`).join("")}</div>${phases.map((phase) => view === "phases" ? phaseRow(phase) : `<section class="gantt-phase"><button type="button" data-phase="${escapeHtml(phase)}" aria-expanded="${!collapsed.has(phase)}"><span>${collapsed.has(phase) ? "▸" : "▾"} ${escapeHtml(phase)}</span><span>${tasks.filter((task) => task.phase === phase).length} tasks</span></button></section>${taskRows(phase)}`).join("") || `<div class="gantt-empty">No work items are available for this plan.</div>`}`;
      root.querySelectorAll("[data-view]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.view === view)));
      renderMetrics();
      renderDetail();
    }
    function mutateTask(id, mutation, kind) {
      const task = tasks.find((candidate) => candidate.id === id);
      if (!task) return;
      remember();
      mutation(task);
      clampTask(task);
      selectedId = task.id;
      commit(kind, task);
    }
    function reorder(id, direction) {
      const index = tasks.findIndex((task) => task.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= tasks.length) return;
      const targetPhase = tasks[targetIndex].phase;
      remember();
      const [task] = tasks.splice(index, 1);
      tasks.splice(targetIndex, 0, task);
      task.phase = targetPhase;
      selectedId = id;
      commit("reorder", task);
    }

    root.addEventListener("click", (event) => {
      const phase = event.target.closest("[data-phase]");
      const viewButton = event.target.closest("[data-view]");
      const select = event.target.closest("[data-select]");
      const shift = event.target.closest("[data-shift]");
      const reorderButton = event.target.closest("[data-reorder]");
      if (phase) {
        if (collapsed.has(phase.dataset.phase)) collapsed.delete(phase.dataset.phase);
        else collapsed.add(phase.dataset.phase);
        render();
      }
      if (viewButton) { view = viewButton.dataset.view; render(); }
      if (select) { selectedId = select.dataset.select; render(); }
      if (shift) mutateTask(shift.dataset.id, (task) => { task.startWeek += Number(shift.dataset.shift); }, "move");
      if (reorderButton) reorder(reorderButton.dataset.id, Number(reorderButton.dataset.reorder));
      if (event.target.closest("[data-full]")) {
        root.classList.toggle("gantt-full");
        event.target.textContent = root.classList.contains("gantt-full") ? "Restore view" : "Expand view";
      }
      if (event.target.closest("[data-reset]")) { remember(); tasks = cloneTasks(initial); selectedId = tasks[0]?.id || ""; commit("reset"); announce("The delivery plan has been reset."); }
      if (event.target.closest("[data-undo]") && undoSnapshot) {
        const current = cloneTasks(tasks); tasks = undoSnapshot; undoSnapshot = current; options.onChange?.(cloneTasks(tasks), { type: "undo", task: null }); announce("The previous schedule change was undone."); render();
      }
    });
    root.addEventListener("input", (event) => {
      const form = event.target.closest("[data-task-form]");
      const task = selectedTask();
      if (!form || !task) return;
      if (!form.dataset.editing) { remember(); form.dataset.editing = "true"; }
      task.startWeek = Number(form.elements.startWeek.value);
      task.durationWeeks = Number(form.elements.durationWeeks.value);
      task.progress = Number(form.elements.progress.value);
      task.status = form.elements.status.value;
      clampTask(task);
      options.onChange?.(cloneTasks(tasks), { type: "edit", task: { ...task } });
      renderMetrics();
      const row = board.querySelector(`[data-task-row="${CSS.escape(task.id)}"]`);
      const bar = row?.querySelector("[data-bar]");
      if (bar) { bar.style.gridColumn = `${task.startWeek + 1}/span ${task.durationWeeks}`; bar.querySelector(".gantt-bar-progress").style.width = `${task.progress}%`; bar.dataset.status = task.status; }
    });

    root.addEventListener("pointerdown", (event) => {
      const bar = event.target.closest("[data-bar]");
      if (!bar || view !== "tasks") return;
      const task = tasks.find((candidate) => candidate.id === bar.dataset.bar);
      const row = bar.closest(".gantt-row");
      const label = row.querySelector(".gantt-label");
      if (!task || !row || !label) return;
      event.preventDefault();
      selectedId = task.id;
      pointerState = { id: task.id, mode: event.target.closest("[data-resize]") ? "resize" : "move", startX: event.clientX, startWeek: task.startWeek, durationWeeks: task.durationWeeks, weekWidth: (row.getBoundingClientRect().width - label.getBoundingClientRect().width) / weeks, bar };
      bar.setPointerCapture?.(event.pointerId);
      bar.classList.add("is-dragging");
    });
    root.addEventListener("pointermove", (event) => {
      if (!pointerState) return;
      const delta = Math.round((event.clientX - pointerState.startX) / pointerState.weekWidth);
      pointerState.bar.style.setProperty("--drag-x", `${delta * pointerState.weekWidth}px`);
    });
    function finishPointer(event) {
      if (!pointerState) return;
      const state = pointerState;
      const clientX = Number.isFinite(event.clientX) ? event.clientX : state.startX;
      const delta = Math.round((clientX - state.startX) / state.weekWidth);
      state.bar.classList.remove("is-dragging");
      state.bar.style.removeProperty("--drag-x");
      pointerState = null;
      if (!delta) { selectedId = state.id; render(); return; }
      mutateTask(state.id, (task) => {
        if (state.mode === "resize") task.durationWeeks = state.durationWeeks + delta;
        else task.startWeek = state.startWeek + delta;
      }, state.mode);
    }
    root.addEventListener("pointerup", finishPointer);
    root.addEventListener("pointercancel", finishPointer);
    root.addEventListener("keydown", (event) => {
      const bar = event.target.closest("[data-bar]");
      if (!bar || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") reorder(bar.dataset.bar, direction);
      else mutateTask(bar.dataset.bar, (task) => { if (event.shiftKey) task.durationWeeks += direction; else task.startWeek += direction; }, event.shiftKey ? "resize" : "move");
    });
    root.addEventListener("dragstart", (event) => {
      const handle = event.target.closest("[data-reorder-drag]");
      if (!handle) return;
      reorderId = handle.dataset.reorderDrag;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", reorderId);
      handle.closest(".gantt-row")?.classList.add("is-reordering");
    });
    root.addEventListener("dragover", (event) => {
      const row = event.target.closest("[data-task-row]");
      if (!row || !reorderId || row.dataset.taskRow === reorderId) return;
      event.preventDefault();
      root.querySelectorAll(".is-drop-target").forEach((item) => item.classList.remove("is-drop-target"));
      row.classList.add("is-drop-target");
    });
    root.addEventListener("drop", (event) => {
      const row = event.target.closest("[data-task-row]");
      if (!row || !reorderId || row.dataset.taskRow === reorderId) return;
      event.preventDefault();
      const from = tasks.findIndex((task) => task.id === reorderId);
      const target = tasks.findIndex((task) => task.id === row.dataset.taskRow);
      if (from < 0 || target < 0) return;
      remember();
      const [task] = tasks.splice(from, 1);
      const adjustedTarget = tasks.findIndex((candidate) => candidate.id === row.dataset.taskRow);
      task.phase = tasks[adjustedTarget]?.phase || task.phase;
      tasks.splice(adjustedTarget, 0, task);
      selectedId = task.id;
      reorderId = "";
      commit("reorder", task);
    });
    root.addEventListener("dragend", () => { reorderId = ""; root.querySelectorAll(".is-reordering,.is-drop-target").forEach((item) => item.classList.remove("is-reordering", "is-drop-target")); });

    render();
    return {
      setTasks(next) { tasks = cloneTasks(next); selectedId = tasks[0]?.id || ""; undoSnapshot = null; render(); },
      getTasks() { return cloneTasks(tasks); },
      select(id) { if (tasks.some((task) => task.id === id)) { selectedId = id; render(); } },
      destroy() { root.innerHTML = ""; }
    };
  }

  global.PlanningGantt = { mount, sample };
})(window);
