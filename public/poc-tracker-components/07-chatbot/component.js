(function (global) {
  const sample = {
    title: "Guided workspace assistant",
    description: "Explore work in context while keeping sources, recommendations and proposed changes clear.",
    contextTitle: "Suggested questions",
    assistantName: "Delivery assistant",
    assistantDescription: "Ask about delivery records, current status, supporting evidence or the next useful action.",
    prompts: ["Summarise the current position", "Which items need attention?", "Draft a stakeholder update"],
    response: {
      body: "Two work items need attention. One is waiting for an owner response and the other is missing a current evidence source.",
      proposal: {
        tone: "warning", label: "Draft change", recordId: "ITEM-104", title: "Update the selected record",
        description: "Set the next review to today and add a note explaining which owner response is still required.",
        sources: ["ITEM-104", "DECISION-12", "Latest status update"]
      }
    }
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));

  function mount(root, initialData = sample, options = {}) {
    let data = { ...sample, ...initialData, prompts: [...(initialData.prompts || sample.prompts)], response: { ...sample.response, ...(initialData.response || {}), proposal: { ...sample.response.proposal, ...(initialData.response?.proposal || {}) } } };
    root.innerHTML = `<section class="ai-demo"><div class="ai-context"><header><p class="poc-eyebrow">Assisted workflow</p><h1 data-title></h1><p class="poc-muted" data-description></p></header><section class="poc-panel"><div class="poc-panel__header"><div><h2 data-context-title></h2><p>Choose a useful starting point or ask your own question.</p></div></div><div class="ai-prompts" data-prompts></div></section><section class="poc-notice"><strong>You stay in control</strong><span>Every suggestion remains a draft until you review its sources and approve the change.</span></section></div><aside class="poc-panel ai-panel"><header class="ai-head"><div><p class="poc-eyebrow">Source-aware support</p><h2 data-assistant-name></h2></div><span class="poc-pill poc-pill--success">Ready</span></header><div class="ai-thread" data-thread aria-live="polite"></div><form class="ai-compose"><label class="poc-field"><span class="poc-sr-only">Message</span><textarea rows="2" data-input placeholder="Ask about this workspace…"></textarea></label><button class="poc-button poc-button--primary">Send</button></form></aside></section>`;
    const thread = root.querySelector("[data-thread]");
    const input = root.querySelector("[data-input]");

    function renderShell() {
      root.querySelector("[data-title]").textContent = data.title;
      root.querySelector("[data-description]").textContent = data.description;
      root.querySelector("[data-context-title]").textContent = data.contextTitle;
      root.querySelector("[data-assistant-name]").textContent = data.assistantName;
      root.querySelector("[data-prompts]").innerHTML = data.prompts.map((prompt) => `<button class="poc-button" type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("");
      thread.innerHTML = `<div class="ai-message"><strong>How can I help?</strong><p>${escapeHtml(data.assistantDescription)}</p></div>`;
    }
    function proposalMarkup(proposal) {
      if (!proposal) return "";
      return `<div class="ai-proposal"><div><span class="poc-pill poc-pill--${escapeHtml(proposal.tone || "warning")}">${escapeHtml(proposal.label || "Draft change")}</span><h3>${escapeHtml(proposal.title)}</h3><small>${escapeHtml(proposal.recordId)}</small></div><p data-proposal-copy>${escapeHtml(proposal.description)}</p><div class="poc-cluster"><button class="poc-button poc-button--primary" data-approve type="button">Approve</button><button class="poc-button" data-edit type="button">Edit</button><button class="poc-button" data-reject type="button">Reject</button></div><div class="ai-source"><strong>Sources</strong>${(proposal.sources || []).map((source, index) => `<button type="button" data-source="${index}">${escapeHtml(source)}</button>`).join("")}</div></div>`;
    }
    function addAssistantResponse(response) {
      thread.querySelector("[data-thinking]")?.remove();
      thread.insertAdjacentHTML("beforeend", `<div class="ai-message"><p>${escapeHtml(response.body)}</p>${proposalMarkup(response.proposal)}</div>`);
      thread.scrollTop = thread.scrollHeight;
    }
    async function ask(text) {
      if (!text.trim()) return;
      thread.insertAdjacentHTML("beforeend", `<div class="ai-message user">${escapeHtml(text)}</div><div class="ai-message thinking" data-thinking><span>Preparing a sourced response…</span></div>`);
      thread.scrollTop = thread.scrollHeight;
      input.value = "";
      try {
        const supplied = options.onSubmit ? await options.onSubmit(text, data) : null;
        addAssistantResponse(supplied || data.response);
      } catch (error) {
        thread.querySelector("[data-thinking]")?.remove();
        thread.insertAdjacentHTML("beforeend", `<div class="ai-message error"><strong>Response unavailable</strong><p>${escapeHtml(error?.message || "Please try again in a moment.")}</p></div>`);
      }
    }
    root.querySelector("form").addEventListener("submit", (event) => { event.preventDefault(); ask(input.value); });
    root.addEventListener("click", (event) => {
      const prompt = event.target.closest("[data-prompt]");
      const proposal = event.target.closest(".ai-proposal");
      if (prompt) ask(prompt.dataset.prompt);
      if (event.target.closest("[data-approve]") && proposal) { options.onApprove?.(data.response.proposal); proposal.innerHTML = `<span class="poc-pill poc-pill--success">Change approved</span><p>The proposal has been approved for the selected record.</p>`; }
      if (event.target.closest("[data-reject]") && proposal) { options.onReject?.(data.response.proposal); proposal.innerHTML = `<span class="poc-pill">Proposal rejected</span>`; }
      if (event.target.closest("[data-edit]") && proposal) {
        const copy = proposal.querySelector("[data-proposal-copy]");
        copy.outerHTML = `<label class="poc-field">Edit proposed change<textarea rows="4" data-edit-copy>${escapeHtml(copy.textContent)}</textarea></label><button class="poc-button" type="button" data-save-edit>Save draft</button>`;
      }
      if (event.target.closest("[data-save-edit]") && proposal) {
        const next = proposal.querySelector("[data-edit-copy]").value;
        data.response.proposal.description = next;
        options.onEdit?.({ ...data.response.proposal });
        proposal.querySelector("label").outerHTML = `<p data-proposal-copy>${escapeHtml(next)}</p>`;
        event.target.closest("[data-save-edit]").remove();
      }
      const source = event.target.closest("[data-source]");
      if (source) options.onOpenSource?.(data.response.proposal.sources[Number(source.dataset.source)]);
    });
    renderShell();
    return {
      addMessage(message) { thread.insertAdjacentHTML("beforeend", `<div class="ai-message ${escapeHtml(message.role || "")}"><p>${escapeHtml(message.text)}</p></div>`); },
      setData(next) { data = { ...sample, ...next, prompts: [...(next.prompts || sample.prompts)], response: { ...sample.response, ...(next.response || {}), proposal: { ...sample.response.proposal, ...(next.response?.proposal || {}) } } }; renderShell(); },
      getData() { return data; },
      destroy() { root.innerHTML = ""; }
    };
  }

  global.AssistantReview = { mount, sample };
})(window);
