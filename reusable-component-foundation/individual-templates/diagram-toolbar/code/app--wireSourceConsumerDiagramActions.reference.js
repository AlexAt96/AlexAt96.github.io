/* Reference extract: wireSourceConsumerDiagramActions(...) from app/src/app.js:15901-16072. */

function wireSourceConsumerDiagramActions(diagram) {
  if (!diagram || diagram.dataset.wired === "true") return;
  diagram.dataset.wired = "true";
  const panel = diagram.closest(".source-consumer-diagram-panel") || diagram;
  const detailPanel = diagram.querySelector("[data-source-consumer-detail-panel]");
  const setDetailPanel = (node, edges) => {
    if (!detailPanel || !node) return;
    const labels = edges
      .map((edge) => edge.dataset.edgeLabel || edge.dataset.connectionType || "")
      .filter(Boolean);
    const typeCount = new Set(edges.map((edge) => edge.dataset.connectionType || "").filter(Boolean)).size;
    detailPanel.innerHTML = `
      <strong>${escapeHtml(node.dataset.nodeLabel || node.getAttribute("aria-label") || "Selected bubble")}</strong>
      <span>${escapeHtml(node.dataset.nodeKind || "Node")} / ${escapeHtml(node.dataset.nodeSublabel || "")}</span>
      <div class="diagram-node-detail-metrics">
        <span>${edges.length} linked line${edges.length === 1 ? "" : "s"}</span>
        <span>${typeCount} connection type${typeCount === 1 ? "" : "s"}</span>
      </div>
      ${labels.length ? `<small>${escapeHtml([...new Set(labels)].slice(0, 4).join(" / "))}</small>` : ""}
    `;
  };
  const clearFocus = () => {
    panel?.querySelectorAll(".source-consumer-node, .source-consumer-edge, .source-consumer-template-node, .source-consumer-template-edge, .source-consumer-template-edge-count").forEach((item) => {
      item.classList.remove("is-focused", "is-dimmed");
    });
    if (detailPanel) {
      detailPanel.innerHTML = "<strong>Select a bubble</strong><span>Connected systems, datasets, and directions will appear here.</span>";
    }
  };
  const viewport = diagram.querySelector(".source-consumer-template-pan-viewport");
  const stage = diagram.querySelector(".source-consumer-template-pan-stage");
  let exploreEnabled = false;
  const enableExplore = () => {
    exploreEnabled = true;
    diagram.querySelector("[data-diagram-explore-overlay]")?.setAttribute("hidden", "");
    viewport?.classList.add("is-exploring");
  };
  const panState = {
    x: Number(viewport?.dataset.panX || 0),
    y: Number(viewport?.dataset.panY || 0),
    scale: Number(viewport?.dataset.scale || 1),
  };
  const applyPanTransform = () => {
    if (!viewport || !stage) return;
    viewport.dataset.panX = String(Math.round(panState.x));
    viewport.dataset.panY = String(Math.round(panState.y));
    viewport.dataset.scale = String(Math.round(panState.scale * 100) / 100);
    stage.style.transform = `translate(${panState.x}px, ${panState.y}px) scale(${panState.scale})`;
  };
  const setZoom = (nextScale, origin = null) => {
    if (!viewport) return;
    const clamped = Math.max(0.55, Math.min(2.4, nextScale));
    if (Math.abs(clamped - panState.scale) < 0.01) return;
    if (origin) {
      const rect = viewport.getBoundingClientRect();
      const localX = origin.clientX - rect.left;
      const localY = origin.clientY - rect.top;
      const ratio = clamped / panState.scale;
      panState.x = localX - (localX - panState.x) * ratio;
      panState.y = localY - (localY - panState.y) * ratio;
    }
    panState.scale = clamped;
    applyPanTransform();
  };
  const resetPanZoom = () => {
    panState.x = 0;
    panState.y = 0;
    panState.scale = 1;
    applyPanTransform();
  };
  applyPanTransform();
  diagram.querySelector(".source-consumer-explore")?.addEventListener("click", enableExplore);
  diagram.querySelector(".source-consumer-zoom-in")?.addEventListener("click", () => setZoom(panState.scale + 0.18));
  diagram.querySelector(".source-consumer-zoom-out")?.addEventListener("click", () => setZoom(panState.scale - 0.18));
  diagram.querySelector(".source-consumer-zoom-reset")?.addEventListener("click", resetPanZoom);
  viewport?.addEventListener("wheel", (event) => {
    if (!exploreEnabled) return;
    event.preventDefault();
    setZoom(panState.scale + (event.deltaY < 0 ? 0.12 : -0.12), event);
  }, { passive: false });
  let dragState = null;
  viewport?.addEventListener("pointerdown", (event) => {
    if (!exploreEnabled) return;
    if (event.target.closest(".source-consumer-template-node, button")) return;
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: panState.x,
      originY: panState.y,
    };
    viewport.setPointerCapture?.(event.pointerId);
    viewport.classList.add("is-panning");
  });
  viewport?.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    panState.x = dragState.originX + event.clientX - dragState.startX;
    panState.y = dragState.originY + event.clientY - dragState.startY;
    applyPanTransform();
  });
  const endPan = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    viewport.releasePointerCapture?.(event.pointerId);
    viewport.classList.remove("is-panning");
    dragState = null;
  };
  viewport?.addEventListener("pointerup", endPan);
  viewport?.addEventListener("pointercancel", endPan);
  panel?.querySelector(".source-consumer-diagram-reset")?.addEventListener("click", () => {
    clearFocus();
    panel.querySelectorAll(".source-consumer-type-pill").forEach((button) => button.classList.remove("is-active"));
    panel.querySelectorAll(".source-consumer-diagram-group").forEach((group) => group.hidden = false);
    panel.querySelectorAll(".source-consumer-template-edge, .source-consumer-template-edge-count").forEach((edge) => edge.classList.remove("hidden-edge"));
  });
  diagram.addEventListener("click", (event) => {
    const resetButton = event.target.closest(".source-consumer-diagram-reset");
    if (resetButton) {
      clearFocus();
      panel?.querySelectorAll(".source-consumer-type-pill").forEach((button) => button.classList.remove("is-active"));
      panel?.querySelectorAll(".source-consumer-diagram-group").forEach((group) => group.hidden = false);
      panel?.querySelectorAll(".source-consumer-template-edge, .source-consumer-template-edge-count").forEach((edge) => edge.classList.remove("hidden-edge"));
      return;
    }
    const typeButton = event.target.closest(".source-consumer-type-pill");
    if (typeButton) {
      const type = typeButton.dataset.connectionType || "";
      const active = typeButton.classList.toggle("is-active");
      diagram.querySelectorAll(".source-consumer-type-pill").forEach((button) => {
        if (button !== typeButton) button.classList.remove("is-active");
      });
      diagram.querySelectorAll(".source-consumer-diagram-group").forEach((group) => {
        group.hidden = active && group.dataset.connectionType !== type;
      });
      diagram.querySelectorAll(".source-consumer-template-edge, .source-consumer-template-edge-count").forEach((edge) => {
        edge.classList.toggle("hidden-edge", active && edge.dataset.connectionType !== type);
      });
      clearFocus();
      return;
    }
    const node = event.target.closest(".source-consumer-node, .source-consumer-template-node");
    if (!node) return;
    const key = node.dataset.nodeKey || "";
    const alreadyFocused = node.classList.contains("is-focused");
    clearFocus();
    if (alreadyFocused) return;
    const connectedEdges = Array.from(panel?.querySelectorAll(".source-consumer-edge, .source-consumer-template-edge") || []).filter((edge) =>
      edge.dataset.nodeA === key || edge.dataset.nodeB === key
    );
    panel?.querySelectorAll(".source-consumer-node, .source-consumer-template-node").forEach((candidate) => {
      const candidateKey = candidate.dataset.nodeKey || "";
      const connected = Array.from(panel.querySelectorAll(".source-consumer-edge, .source-consumer-template-edge")).some((edge) =>
        edge.dataset.nodeA === key && edge.dataset.nodeB === candidateKey ||
        edge.dataset.nodeB === key && edge.dataset.nodeA === candidateKey
      );
      candidate.classList.toggle("is-focused", candidateKey === key || connected);
      candidate.classList.toggle("is-dimmed", candidateKey !== key && !connected);
    });
    panel?.querySelectorAll(".source-consumer-edge, .source-consumer-template-edge, .source-consumer-template-edge-count").forEach((edge) => {
      const connected = edge.dataset.nodeA === key || edge.dataset.nodeB === key;
      edge.classList.toggle("is-focused", connected);
      edge.classList.toggle("is-dimmed", !connected);
    });
    setDetailPanel(node, connectedEdges);
  });
  diagram.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const node = event.target.closest(".source-consumer-node, .source-consumer-template-node");
    if (!node) return;
    event.preventDefault();
    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}
