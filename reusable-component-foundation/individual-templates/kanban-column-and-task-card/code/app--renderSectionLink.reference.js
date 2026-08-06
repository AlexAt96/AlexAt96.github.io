/* Reference extract: renderSectionLink(...) from app/src/app.js:28281-28371. */

function renderSectionLink(phase, item, buId = "", options = {}) {
  const linkBuId = getSectionLinkBusinessUnitId(phase, item, buId);
  const href = documentUrl(phase.key, item.key, linkBuId);
  const blankLabel = item.blank ? "Blank until specified" : formatStatus(item.status);
  const bu = getBusinessUnit(linkBuId);
  const statusMeta = getSectionStatusMeta(item);
  const ownerPill = options.ownerLabel ? `<span class="contributor-card-pill">${escapeHtml(options.ownerLabel)}</span>` : "";
  const statusPill = `<span class="status-pill ${item.blank ? "not-started" : statusClass(item.status)}">${escapeHtml(blankLabel)}</span>`;
  const cardMeta = ownerPill ? `<span class="contributor-card-meta">${statusPill}${ownerPill}</span>` : statusPill;
  const contextLabel = `${phase.title}${bu ? ` / ${bu.name}` : ""}`;
  if (options.kanban) {
    const statusControl = renderPhaseTaskStatusControl(phase, item, linkBuId, ownerPill, "kanban");
    if (phase.key === "ucd" && buId) {
      return `
        <article class="doc-row kanban-task-card ${item.blank ? "is-blank" : ""}">
          <button class="kanban-task-link ucd-task-open" type="button" data-section-key="${escapeHtml(item.key)}" data-business-unit-id="${escapeHtml(buId)}">
            <span class="section-status-icon ${statusMeta.className}" title="${escapeHtml(statusMeta.label)}"><svg><use href="${statusMeta.icon}"></use></svg></span>
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <small>${item.blank ? "Task to be specified later." : escapeHtml(contextLabel)}</small>
            </div>
          </button>
          ${statusControl}
        </article>
      `;
    }
    return `
      <article class="doc-row kanban-task-card ${item.blank ? "is-blank" : ""}" data-card-href="${escapeHtml(href)}" data-section-key="${escapeHtml(item.key)}">
        <a class="kanban-task-link" href="${href}">
          <span class="section-status-icon ${statusMeta.className}" title="${escapeHtml(statusMeta.label)}"><svg><use href="${statusMeta.icon}"></use></svg></span>
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <small>${item.blank ? "Screen exists; content not specified yet." : escapeHtml(contextLabel)}</small>
          </div>
        </a>
        ${statusControl}
      </article>
    `;
  }
  if (options.listStatus) {
    const statusControl = renderPhaseTaskStatusControl(phase, item, linkBuId, "", "list");
    if (phase.key === "ucd" && buId) {
      return `
        <article class="doc-row list-task-card ${item.blank ? "is-blank" : ""}">
          <button class="list-task-link ucd-task-open" type="button" data-section-key="${escapeHtml(item.key)}" data-business-unit-id="${escapeHtml(buId)}">
            <span class="section-status-icon ${statusMeta.className}" title="${escapeHtml(statusMeta.label)}"><svg><use href="${statusMeta.icon}"></use></svg></span>
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <small>${item.blank ? "Task to be specified later." : escapeHtml(contextLabel)}</small>
            </div>
          </button>
          ${statusControl}
        </article>
      `;
    }
    return `
      <article class="doc-row list-task-card ${item.blank ? "is-blank" : ""}">
        <a class="list-task-link" href="${href}">
          <span class="section-status-icon ${statusMeta.className}" title="${escapeHtml(statusMeta.label)}"><svg><use href="${statusMeta.icon}"></use></svg></span>
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <small>${item.blank ? "Screen exists; content not specified yet." : escapeHtml(contextLabel)}</small>
          </div>
        </a>
        ${statusControl}
      </article>
    `;
  }
  if (phase.key === "ucd" && buId) {
    return `
      <button class="doc-row ucd-task-open ${item.blank ? "is-blank" : ""}" type="button" data-section-key="${escapeHtml(item.key)}" data-business-unit-id="${escapeHtml(buId)}">
        <span class="section-status-icon ${statusMeta.className}" title="${escapeHtml(statusMeta.label)}"><svg><use href="${statusMeta.icon}"></use></svg></span>
        <div>
          <h4>${escapeHtml(item.title)}</h4>
          <small>${item.blank ? "Task to be specified later." : escapeHtml(contextLabel)}</small>
        </div>
        ${cardMeta}
      </button>
    `;
  }
  return `
    <a class="doc-row ${item.blank ? "is-blank" : ""}" href="${href}">
      <span class="section-status-icon ${statusMeta.className}" title="${escapeHtml(statusMeta.label)}"><svg><use href="${statusMeta.icon}"></use></svg></span>
      <div>
        <h4>${escapeHtml(item.title)}</h4>
        <small>${item.blank ? "Screen exists; content not specified yet." : escapeHtml(contextLabel)}</small>
      </div>
      ${cardMeta}
    </a>
  `;
}
