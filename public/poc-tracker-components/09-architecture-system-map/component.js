(function (global) {
  const sample = {
    name: "Current-state architecture landscape",
    description: "Trace user journeys, services, data and external dependencies across one connected view.",
    lanes: [
      { id: "experience", label: "Channels & experience", shortLabel: "Experience" },
      { id: "access", label: "Access & integration", shortLabel: "Access" },
      { id: "services", label: "Domain services", shortLabel: "Services" },
      { id: "data", label: "Data & events", shortLabel: "Data" },
      { id: "external", label: "External platforms", shortLabel: "External" }
    ],
    nodes: [
      { id: "operations-portal", layer: "experience", type: "Web application", title: "Operations portal", owner: "Operations product", status: "Live", environment: "Production", technology: "Web UI", criticality: "High", data: "Operational records", description: "Primary workspace for internal users to search, review and update records.", evidence: ["Accessibility review", "Service runbook", "Journey map"], tags: ["internal", "interactive"] },
      { id: "partner-portal", layer: "experience", type: "Web application", title: "Partner portal", owner: "Partner experience", status: "Live", environment: "Production", technology: "Web UI", criticality: "Medium", data: "Partner submissions", description: "External entry point for partners to submit and track work.", evidence: ["Threat model", "Support guide"], tags: ["external-user", "self-service"] },
      { id: "mobile-client", layer: "experience", type: "Mobile client", title: "Mobile client", owner: "Field experience", status: "Pilot", environment: "Pre-production", technology: "Native app", criticality: "Medium", data: "Task summaries", description: "Focused mobile experience for field updates and approvals.", evidence: ["Pilot findings", "Device matrix"], tags: ["mobile", "offline"] },
      { id: "api-gateway", layer: "access", type: "Gateway", title: "API gateway", owner: "Platform engineering", status: "Live", environment: "Production", technology: "Managed gateway", criticality: "Critical", data: "API requests", description: "Applies routing, throttling, observability and policy to service traffic.", evidence: ["API inventory", "Policy baseline", "SLO report"], tags: ["routing", "policy"] },
      { id: "identity", layer: "access", type: "Identity", title: "Identity service", owner: "Identity platform", status: "Live", environment: "All", technology: "OIDC / OAuth 2", criticality: "Critical", data: "Identity claims", description: "Authenticates users and supplies role and organisation claims.", evidence: ["Access model", "Key rotation record"], tags: ["authentication", "authorisation"] },
      { id: "event-ingress", layer: "access", type: "Integration", title: "Event ingress", owner: "Integration platform", status: "Live", environment: "Production", technology: "Event adapter", criticality: "High", data: "Partner events", description: "Validates inbound events and converts them to the internal event contract.", evidence: ["Schema catalogue", "Replay procedure"], tags: ["asynchronous", "validation"] },
      { id: "work-service", layer: "services", type: "Domain service", title: "Work service", owner: "Core delivery", status: "Live", environment: "Production", technology: "Service API", criticality: "Critical", data: "Work records", description: "Owns the work-item lifecycle, validation rules and primary commands.", evidence: ["Service contract", "Runbook", "Recovery test"], tags: ["system-of-record", "transactional"] },
      { id: "rules-service", layer: "services", type: "Domain service", title: "Rules service", owner: "Decisioning", status: "Change planned", environment: "Production", technology: "Rules engine", criticality: "High", data: "Decision inputs", description: "Evaluates configurable eligibility and routing rules for a work item.", evidence: ["Rule catalogue", "Decision log"], tags: ["decisioning", "configurable"] },
      { id: "notification-service", layer: "services", type: "Domain service", title: "Notification service", owner: "Communications", status: "Live", environment: "Production", technology: "Worker service", criticality: "Medium", data: "Notification requests", description: "Coordinates message templates, preferences, delivery and retry state.", evidence: ["Template inventory", "Delivery report"], tags: ["asynchronous", "outbound"] },
      { id: "work-store", layer: "data", type: "Operational data", title: "Work record store", owner: "Core delivery", status: "Live", environment: "Production", technology: "Relational database", criticality: "Critical", data: "Restricted operational data", description: "Authoritative persistence for work records, history and optimistic locks.", evidence: ["Data model", "Backup test", "Retention policy"], tags: ["encrypted", "system-of-record"] },
      { id: "event-stream", layer: "data", type: "Event platform", title: "Domain event stream", owner: "Integration platform", status: "Live", environment: "Production", technology: "Event broker", criticality: "High", data: "Domain events", description: "Publishes versioned lifecycle events to downstream consumers.", evidence: ["Topic catalogue", "Consumer map", "Replay test"], tags: ["event-driven", "retained"] },
      { id: "analytics-store", layer: "data", type: "Analytical data", title: "Analytics store", owner: "Data products", status: "Live", environment: "Production", technology: "Cloud warehouse", criticality: "Medium", data: "Pseudonymised reporting data", description: "Supports governed reporting and trend analysis outside the transactional path.", evidence: ["Lineage map", "Quality checks", "Access review"], tags: ["analytics", "pseudonymised"] },
      { id: "customer-platform", layer: "external", type: "External SaaS", title: "Customer platform", owner: "Customer operations", status: "Live", environment: "Production", technology: "SaaS API", criticality: "High", data: "Customer reference data", description: "Supplies the customer reference and receives selected lifecycle updates.", evidence: ["Supplier assessment", "Interface agreement"], tags: ["external", "master-data"] },
      { id: "document-platform", layer: "external", type: "External SaaS", title: "Document platform", owner: "Information management", status: "Live", environment: "Production", technology: "Document API", criticality: "High", data: "Documents and metadata", description: "Stores evidence documents and controlled metadata outside the core record store.", evidence: ["Retention schedule", "Integration contract"], tags: ["documents", "retention"] },
      { id: "message-provider", layer: "external", type: "External provider", title: "Message provider", owner: "Communications", status: "Live", environment: "Production", technology: "Email / SMS API", criticality: "Medium", data: "Recipient and message data", description: "Delivers outbound notifications and returns delivery status events.", evidence: ["Supplier assessment", "Data-processing record"], tags: ["external", "outbound"] }
    ],
    edges: [
      { from: "operations-portal", to: "api-gateway", label: "uses", protocol: "HTTPS / JSON", data: "Commands and queries", frequency: "Interactive", criticality: "Critical" },
      { from: "partner-portal", to: "api-gateway", label: "uses", protocol: "HTTPS / JSON", data: "Submissions and status", frequency: "Interactive", criticality: "High" },
      { from: "mobile-client", to: "api-gateway", label: "synchronises", protocol: "HTTPS / JSON", data: "Task summaries", frequency: "On demand", criticality: "Medium" },
      { from: "operations-portal", to: "identity", label: "authenticates", protocol: "OIDC", data: "Claims", frequency: "Per session", criticality: "Critical" },
      { from: "partner-portal", to: "identity", label: "authenticates", protocol: "OIDC", data: "Claims", frequency: "Per session", criticality: "Critical" },
      { from: "api-gateway", to: "work-service", label: "routes", protocol: "HTTPS / JSON", data: "Work API", frequency: "Interactive", criticality: "Critical" },
      { from: "api-gateway", to: "rules-service", label: "routes", protocol: "HTTPS / JSON", data: "Decision requests", frequency: "Interactive", criticality: "High" },
      { from: "event-ingress", to: "work-service", label: "submits", protocol: "Async event", data: "Partner updates", frequency: "Near real time", criticality: "High" },
      { from: "work-service", to: "work-store", label: "reads / writes", protocol: "SQL", data: "Work records", frequency: "Per transaction", criticality: "Critical" },
      { from: "work-service", to: "event-stream", label: "publishes", protocol: "Async event", data: "Lifecycle events", frequency: "Per change", criticality: "High" },
      { from: "rules-service", to: "work-store", label: "reads", protocol: "SQL", data: "Rule context", frequency: "Per decision", criticality: "High" },
      { from: "event-stream", to: "analytics-store", label: "loads", protocol: "Streaming", data: "Reporting events", frequency: "Near real time", criticality: "Medium" },
      { from: "event-stream", to: "notification-service", label: "triggers", protocol: "Async event", data: "Notification events", frequency: "Per change", criticality: "Medium" },
      { from: "work-service", to: "customer-platform", label: "looks up", protocol: "HTTPS / JSON", data: "Customer reference", frequency: "On demand", criticality: "High" },
      { from: "work-service", to: "document-platform", label: "stores evidence", protocol: "HTTPS / multipart", data: "Documents", frequency: "On demand", criticality: "High" },
      { from: "notification-service", to: "message-provider", label: "delivers", protocol: "HTTPS / JSON", data: "Messages", frequency: "Near real time", criticality: "Medium" }
    ]
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const statusTone = (status) => /live|verified/i.test(status) ? "success" : /planned|pilot|partial/i.test(status) ? "warning" : "neutral";
  const humaniseTag = (tag) => String(tag).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  function mount(root, initialModel = sample, options = {}) {
    let model = initialModel;
    let selectedId = model.nodes[0]?.id || "";
    let filters = { query: "", type: "", environment: "", status: "" };
    const markerId = `map-arrow-${Math.random().toString(36).slice(2)}`;
    root.innerHTML = `<section class="map"><header><p class="poc-eyebrow">Architecture landscape</p><h1 data-title></h1><p class="poc-muted" data-description></p></header><section class="poc-metrics map-metrics" data-metrics></section><div class="poc-panel map-tools"><label class="poc-field">Search systems<input data-filter="query" type="search" placeholder="Search by system, owner or technology…"></label><label class="poc-field">Type<select data-filter="type"></select></label><label class="poc-field">Environment<select data-filter="environment"></select></label><label class="poc-field">Status<select data-filter="status"></select></label><button class="poc-button" type="button" data-reset>Clear filters</button></div><section class="map-layout"><div class="poc-panel map-canvas"><div class="map-board" data-board></div></div><aside class="poc-panel map-detail" data-detail aria-live="polite"></aside></section></section>`;
    const board = root.querySelector("[data-board]");
    const resizeListener = () => requestAnimationFrame(drawLines);

    function fillSelect(name, values, label) {
      root.querySelector(`[data-filter="${name}"]`).innerHTML = `<option value="">${label}</option>${[...new Set(values)].filter(Boolean).sort().map((value) => `<option>${escapeHtml(value)}</option>`).join("")}`;
    }
    function initialiseFilters() {
      fillSelect("type", model.nodes.map((node) => node.type), "All types");
      fillSelect("environment", model.nodes.map((node) => node.environment), "All environments");
      fillSelect("status", model.nodes.map((node) => node.status), "All statuses");
    }
    function visibleNodes() {
      const query = filters.query.trim().toLowerCase();
      return model.nodes.filter((node) => {
        const searchable = `${node.title} ${node.owner} ${node.type} ${node.technology} ${(node.tags || []).join(" ")} ${node.data}`.toLowerCase();
        return (!filters.type || node.type === filters.type) && (!filters.environment || node.environment === filters.environment || node.environment === "All") && (!filters.status || node.status === filters.status) && (!query || searchable.includes(query));
      });
    }
    function renderMetrics() {
      root.querySelector("[data-metrics]").innerHTML = `<article class="poc-metric"><span>Systems</span><strong>${model.nodes.length}</strong><small class="poc-muted">Across ${model.lanes.length} architecture layers</small></article><article class="poc-metric"><span>Interfaces</span><strong>${model.edges.length}</strong><small class="poc-muted">Directional connections</small></article><article class="poc-metric"><span>Critical systems</span><strong>${model.nodes.filter((node) => node.criticality === "Critical").length}</strong><small class="poc-muted">Need explicit recovery plans</small></article><article class="poc-metric"><span>Production systems</span><strong>${model.nodes.filter((node) => node.environment === "Production" || node.environment === "All").length}</strong><small class="poc-muted">In the current landscape</small></article>`;
    }
    function render() {
      const nodes = visibleNodes();
      if (!nodes.some((node) => node.id === selectedId)) selectedId = nodes[0]?.id || "";
      root.querySelector("[data-title]").textContent = model.name || "Architecture landscape";
      root.querySelector("[data-description]").textContent = model.description || "";
      board.style.setProperty("--lane-count", model.lanes.length);
      board.innerHTML = `<svg class="map-lines" data-lines aria-hidden="true"><defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z"/></marker></defs></svg>${model.lanes.map((lane, laneIndex) => { const laneNodes = nodes.filter((node) => node.layer === lane.id); return `<section class="map-group" data-lane="${escapeHtml(lane.id)}"><header><span>${String(laneIndex + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(lane.label)}</strong><small>${laneNodes.length} visible</small></div></header><div>${laneNodes.map((node) => { const connected = model.edges.some((edge) => (edge.from === selectedId && edge.to === node.id) || (edge.to === selectedId && edge.from === node.id)); return `<button class="map-node" type="button" data-id="${escapeHtml(node.id)}" aria-current="${node.id === selectedId}" data-connected="${connected}"><span class="map-node-type">${escapeHtml(node.type)}</span><strong>${escapeHtml(node.title)}</strong><small>${escapeHtml(node.technology)}</small><span class="map-node-meta"><i class="poc-pill poc-pill--${statusTone(node.status)}">${escapeHtml(node.status)}</i><em>${escapeHtml(node.criticality)}</em></span></button>`; }).join("") || `<p class="map-empty">No matching systems</p>`}</div></section>`; }).join("")}`;
      renderDetail();
      requestAnimationFrame(drawLines);
    }
    function drawLines() {
      if (matchMedia("(max-width: 760px)").matches) return;
      const svg = board.querySelector("[data-lines]");
      if (!svg) return;
      const bounds = board.getBoundingClientRect();
      const byId = new Map([...board.querySelectorAll("[data-id]")].map((element) => [element.dataset.id, element]));
      const visibleEdges = model.edges.filter((edge) => byId.has(edge.from) && byId.has(edge.to));
      const lineMarkup = visibleEdges.map((edge) => {
        const source = byId.get(edge.from).getBoundingClientRect();
        const target = byId.get(edge.to).getBoundingClientRect();
        const forward = target.left >= source.right;
        const x1 = (forward ? source.right : source.left) - bounds.left;
        const y1 = source.top + source.height / 2 - bounds.top;
        const x2 = (forward ? target.left : target.right) - bounds.left;
        const y2 = target.top + target.height / 2 - bounds.top;
        const bend = Math.max(38, Math.abs(x2 - x1) * .36) * (forward ? 1 : -1);
        const active = edge.from === selectedId || edge.to === selectedId;
        const critical = edge.criticality === "Critical";
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 6;
        return `<path class="map-line" data-active="${active}" data-critical="${critical}" marker-end="url(#${markerId})" d="M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}"/><text class="map-line-label" data-active="${active}" x="${midX}" y="${midY}" text-anchor="middle">${escapeHtml(edge.label)}</text>`;
      }).join("");
      svg.innerHTML = `<defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8Z"/></marker></defs>${lineMarkup}`;
    }
    function renderDetail() {
      const detail = root.querySelector("[data-detail]");
      const node = model.nodes.find((candidate) => candidate.id === selectedId);
      if (!node) { detail.innerHTML = `<p class="poc-muted">No systems match these filters. Clear one or more filters to broaden the view.</p>`; return; }
      const inbound = model.edges.filter((edge) => edge.to === node.id);
      const outbound = model.edges.filter((edge) => edge.from === node.id);
      const relationship = (edge, direction) => { const otherId = direction === "in" ? edge.from : edge.to; const other = model.nodes.find((candidate) => candidate.id === otherId); return `<li><button type="button" data-related="${escapeHtml(otherId)}"><strong>${direction === "in" ? "From" : "To"}: ${escapeHtml(other?.title || otherId)}</strong><span>${escapeHtml(edge.label)} · ${escapeHtml(edge.protocol)}</span><small>${escapeHtml(edge.data)} · ${escapeHtml(edge.frequency)} · ${escapeHtml(edge.criticality)}</small></button></li>`; };
      detail.innerHTML = `<section><div class="poc-cluster"><span class="poc-pill poc-pill--info">${escapeHtml(node.type)}</span><span class="poc-pill poc-pill--${statusTone(node.status)}">${escapeHtml(node.status)}</span><span class="poc-pill">${escapeHtml(node.criticality)}</span></div><h2>${escapeHtml(node.title)}</h2><p class="poc-muted">${escapeHtml(node.description)}</p></section><section class="map-facts"><p><span>Owner</span><strong>${escapeHtml(node.owner)}</strong></p><p><span>Environment</span><strong>${escapeHtml(node.environment)}</strong></p><p><span>Technology</span><strong>${escapeHtml(node.technology)}</strong></p><p><span>Data</span><strong>${escapeHtml(node.data)}</strong></p></section><section><h3>Interfaces</h3><ul class="map-relationships">${[...inbound.map((edge) => relationship(edge, "in")), ...outbound.map((edge) => relationship(edge, "out"))].join("") || "<li>No visible interfaces</li>"}</ul></section><section><h3>Evidence</h3><ul>${(node.evidence || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>No evidence supplied</li>"}</ul></section><section><h3>Tags</h3><div class="poc-cluster">${(node.tags || []).map((tag) => `<span class="poc-pill">${escapeHtml(humaniseTag(tag))}</span>`).join("")}</div></section>`;
    }

    root.addEventListener("input", (event) => {
      const control = event.target.closest("[data-filter]");
      if (!control) return;
      filters[control.dataset.filter] = control.value;
      render();
    });
    root.addEventListener("click", (event) => {
      const node = event.target.closest("[data-id]");
      const related = event.target.closest("[data-related]");
      if (node) { selectedId = node.dataset.id; options.onSelect?.(model.nodes.find((item) => item.id === selectedId)); render(); }
      if (related) { selectedId = related.dataset.related; options.onSelect?.(model.nodes.find((item) => item.id === selectedId)); render(); board.querySelector(`[data-id="${CSS.escape(selectedId)}"]`)?.focus(); }
      if (event.target.closest("[data-reset]")) {
        filters = { query: "", type: "", environment: "", status: "" };
        root.querySelectorAll("[data-filter]").forEach((control) => { control.value = ""; });
        render();
      }
    });
    window.addEventListener("resize", resizeListener);
    initialiseFilters();
    renderMetrics();
    render();
    return {
      setData(next) { model = next; selectedId = next.nodes[0]?.id || ""; filters = { query: "", type: "", environment: "", status: "" }; initialiseFilters(); renderMetrics(); render(); },
      select(id) { if (model.nodes.some((node) => node.id === id)) { selectedId = id; render(); } },
      getData() { return model; },
      destroy() { window.removeEventListener("resize", resizeListener); root.innerHTML = ""; }
    };
  }

  global.SystemMap = { mount, sample };
})(window);
