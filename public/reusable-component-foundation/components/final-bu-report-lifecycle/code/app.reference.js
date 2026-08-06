/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderBuTechReportInput(phase, item, bu = getSelectedBu()) {
  const model = getBuTechReportModel(bu);
  return `
    ${detailHeader("Review & Finalise BU Report", `Engagement Lead working screen for the ${bu.name} technical report.`)}
    <form id="buTechReportForm" class="bu-tech-report-form" data-business-unit-id="${escapeHtml(bu.id)}">
      <section class="panel bu-tech-report-intro">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Analysis task</p>
            <h3>Review & Finalise ${escapeHtml(bu.name)} BU Report</h3>
          </div>
          <button class="icon-button primary" type="submit">
            <svg><use href="#icon-save"></use></svg>
            <span>Save report draft</span>
          </button>
        </div>
        <p class="small-note" id="buTechReportStatus">Each section is pre-populated from the report template and discovery data where available. Review, edit, and finalise the narrative before saving.</p>
        <div class="bu-tech-report-kpis">
          ${model.kpis.map((kpi) => `<div><span>${escapeHtml(kpi.label)}</span><strong>${dataText(kpi.value, kpi.tooltip || kpi.note, kpi.href || "")}</strong><small>${escapeHtml(kpi.note)}</small></div>`).join("")}
        </div>
      </section>
      <section class="bu-tech-report-sections">
        ${model.sections.map((section, index) => renderBuTechReportInputSection(section, index)).join("")}
      </section>
    </form>
  `;
}

function getBuTechReportModel(bu) {
  const saved = getBuTechReportSavedSections(bu.id);
  const controls = getBuTechReportSavedControls(bu.id);
  const sizing = getBuSizingAssessmentModel(bu);
  const adf = getAdfComplexityModel(bu);
  const rice = getRiceScoringModel(bu);
  const allScopeRows = getScopeRecordsForBu(bu);
  const scopeRows = allScopeRows.filter((row) => row.inScope !== false);
  const sourceConsumerRows = getSourceConsumerTrackerRowsForBu(bu);
  const techRows = getTechnologyScopeRowsForBu(bu);
  const openDecisionRows = getOpenDecisionRowsForBu(bu);
  const rationalisation = getEnvironmentRationalisationModel(bu);
  const architecture = getArchitectureProposalScopingModel(bu);
  const maturity = getMaturityAssessmentModel(bu);
  const externalRows = getExternalLocationRows(bu);
  const metadataReview = getMetadataReviewModel(bu);
  const cost = calculateCost(bu);
  const waf = getWafBaselineForBu(bu);
  const ucd = getUcdReportModel(bu);
  const sections = getBuTechReportSectionDefaults(bu, { sizing, adf, rice, scopeRows, allScopeRows, sourceConsumerRows, techRows, openDecisionRows, controls, rationalisation, architecture, maturity, externalRows, metadataReview, cost, waf, ucd })
    .map((section) => {
      const body = section.key === "environment-rationalisation" && rationalisation.hasSaved
        ? rationalisation.reportText
        : saved[section.key]?.body ?? getLegacyBuTechReportSectionBody(saved, section.key) ?? section.body;
      const notes = section.key === "environment-rationalisation" && rationalisation.hasSaved
        ? rationalisation.teamNotes
        : saved[section.key]?.notes ?? getLegacyBuTechReportSectionNotes(saved, section.key) ?? section.notes ?? "";
      return {
        ...section,
        task: section.task || BU_TECH_REPORT_REVIEW_TASKS[section.key] || { sectionKey: "bu-tech-report-input", label: "Report draft" },
        body,
        notes,
        supplement: section.key === "executive-summary"
          ? renderBuTechReportSummaryTable(bu, { sizing, rice, openDecisionRows, body })
          : section.supplement,
      };
    });
  return {
    kpis: [
      { label: "Migration complexity", value: `${sizing.complexityBand} (${sizing.complexityScore})`, note: "From BU sizing", href: documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id) },
      { label: "Migration volume", value: `${sizing.sizeBand} (${sizing.sizeScore})`, note: "From BU sizing", href: documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id) },
      { label: "ADF complexity", value: `${adf.totalBand} (${formatNumber(adf.totalComplexity)})`, note: "From ADF analysis", href: documentUrl("team-analysis", "adf-complexity-analysis", bu.id) },
      { label: "RICE", value: formatNumber(rice.riceScore), note: "From RICE scoring", href: documentUrl("team-analysis", "rice-scoring", bu.id) },
      { label: "WAF baseline", value: waf?.assessment ? `${waf.assessment.baseline_score ?? 0}/100` : "Not captured", note: "From WAF output", href: documentUrl("outputs", "waf-baseline-report", bu.id) },
    ],
    sections,
  };
}

function renderBuTechReportInputSection(section, index) {
  const bodyId = `buTechReportSectionBody-${section.key}`;
  const task = section.task || BU_TECH_REPORT_REVIEW_TASKS[section.key] || {};
  const bu = getSelectedBu();
  const taskSectionKey = task.sectionKey || "bu-tech-report-input";
  const taskStatus = getBuScreenStatus(bu.id, taskSectionKey);
  const openFeedback = getOpenTaskFeedback(bu.id, taskSectionKey);
  const taskUrl = getBuTechReportTaskUrl(taskSectionKey, bu.id);
  return `
    <details class="panel bu-tech-report-section" ${section.openByDefault ? "open" : ""}>
      <summary>
        <span class="disclosure-icon contributor-disclosure-icon"><svg><use href="#icon-arrow"></use></svg></span>
        <span>
          <span class="eyebrow">Section ${index + 1}</span>
          <strong>${escapeHtml(section.title)}</strong>
        </span>
        <span class="bu-tech-report-review-tools" onclick="event.stopPropagation();">
          ${renderWorkflowStatusSelect({
            currentStatus: taskStatus,
            sectionKey: taskSectionKey,
            businessUnitId: bu.id,
            title: `Update ${task.label || section.title} task status for ${bu.name}.`,
          })}
          ${taskUrl ? `<a class="icon-button ghost compact bu-tech-report-open-details" href="${escapeHtml(taskUrl)}" title="Open details for ${escapeHtml(task.label || section.title)}">
            <svg><use href="#icon-arrow"></use></svg>
            <span>Open details</span>
          </a>` : ""}
          <button class="icon-button ghost bu-tech-report-feedback-action" type="button" data-business-unit-id="${escapeHtml(bu.id)}" data-section-key="${escapeHtml(taskSectionKey)}" data-report-section-key="${escapeHtml(section.key)}" data-report-section-title="${escapeHtml(section.title)}">
            <svg><use href="#icon-edit"></use></svg>
            <span>Feedback</span>
          </button>
        </span>
      </summary>
      <div class="bu-tech-report-section-body">
        ${openFeedback ? `<div class="report-review-feedback-inline"><strong>Open feedback:</strong> ${escapeHtml(openFeedback.comment)}</div>` : ""}
        ${renderBuTechReportSectionEditableContent(section, bodyId)}
      </div>
    </details>
  `;
}

function renderBuTechReportSummaryTable(bu, { sizing, rice, openDecisionRows, body = "" }) {
  const fields = getBuTechReportExecutiveSummaryFields(body);
  const riceLineage = getRiceScoreLineageTooltip(bu, rice);
  return `
    <div class="data-table-wrap">
      <table class="data-table bu-tech-report-summary-table">
        <caption>Pre-populated report summary.</caption>
        <thead><tr><th>Area</th><th>Summary</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>Executive summary</strong></td>
            <td><textarea id="buTechReportExecutiveSummaryText" name="executiveSummaryText">${escapeHtml(fields.summary)}</textarea></td>
          </tr>
          <tr>
            <td><strong>Migration view</strong></td>
            <td><textarea id="buTechReportMigrationViewText" name="migrationViewText">${escapeHtml(fields.migrationView || bu.migrationPosition || "To be assessed")}</textarea></td>
          </tr>
          <tr>
            <td><strong>Key messages</strong></td>
            <td><textarea id="buTechReportKeyMessagesText" name="keyMessagesText">${escapeHtml(fields.keyMessages)}</textarea></td>
          </tr>
          <tr>
            <td>Migration complexity</td>
            <td>${calcText(`${sizing.complexityBand} (${sizing.complexityScore})`, "Source: BU sizing and complexity scoring.", documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id))}</td>
          </tr>
          <tr>
            <td>Migration volume</td>
            <td>${calcText(`${sizing.sizeBand} (${sizing.sizeScore})`, "Source: BU sizing data size and table count.", documentUrl("team-analysis", "bu-sizing-complexity-scoring", bu.id))}</td>
          </tr>
          <tr>
            <td>RICE</td>
            <td>${calcText(formatNumber(rice.riceScore), riceLineage, documentUrl("team-analysis", "rice-scoring", bu.id))}</td>
          </tr>
          <tr>
            <td>Open decisions</td>
            <td><a class="report-inline-link" href="${escapeHtml(withReturnToCurrentPage(documentUrl("outputs", "outstanding-decisions-log", bu.id)))}">${openDecisionRows.length} open decision row${openDecisionRows.length === 1 ? "" : "s"}</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderBuTechReportEvidenceLinks(bu) {
  return `
    <div class="report-link-grid">
      ${[
        ["Evidence review", "team-analysis", "evidence-review"],
        ["BU follow-up notes", "team-analysis", "bu-follow-up-notes"],
        ["UCD Report", "ucd", "ucd-themes-by-bu"],
        ["Questionnaire", "bu-data-collection", "questionnaire-response"],
      ].map(([label, phaseKey, sectionKey]) => `<a class="section-link-card" href="${documentUrl(phaseKey, sectionKey, bu.id)}"><svg><use href="#icon-arrow"></use></svg><strong>${escapeHtml(label)}</strong><span>Open source page</span></a>`).join("")}
    </div>
  `;
}

function renderBuTechReport() {
  const bu = getBusinessUnit(queryParam("bu")) || businessUnits[0];
  const model = getBuTechReportModel(bu);
  const reportData = getBuTechMarkdownReportData(bu, model);
  const activeTab = getBuTechReportActiveTab();
  const printHref = appendDocumentViewParams(documentUrl("outputs", "bu-tech-report", bu.id), {
    readonly: "true",
    fullReport: queryParam("fullReport") || "true",
    returnBu: queryParam("returnBu") || bu.id,
    returnTo: queryParam("returnTo") || documentUrl("outputs", "per-bu-outputs", bu.id),
    print: "true",
  });
  return `
    ${detailHeader(`${bu.name} technical discovery report`, "Client-ready discovery output report with all generated tables, diagrams and analysis sections.")}
    ${renderBuTechReportTabs(bu, activeTab)}
    <div class="client-report-actions markdown-report-actions">
      ${activeTab === "slides" ? `
        <button class="icon-button primary download-powerpoint-report" type="button" data-business-unit-id="${escapeHtml(bu.id)}">
          <svg><use href="#icon-download"></use></svg>
          <span>Export slides</span>
        </button>
      ` : `
        <a class="icon-button primary report-export-action" href="${escapeHtml(printHref)}" target="_blank" rel="noopener">
          <svg><use href="#icon-download"></use></svg>
          <span>Export full report</span>
        </a>
        <button class="icon-button ghost download-markdown-report" type="button" data-business-unit-id="${escapeHtml(bu.id)}">
          <svg><use href="#icon-file"></use></svg>
          <span>Download Markdown</span>
        </button>
      `}
    </div>
    ${activeTab === "slides" ? renderBuTechPowerPointPreview(bu, reportData) : renderBuTechMarkdownReport(bu, reportData)}
  `;
}

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

function renderBuTechReportClientReport(bu, model) {
  return `
    <section class="client-report-shell bu-tech-client-report" aria-label="${escapeHtml(bu.name)} technical discovery report">
      <header class="client-report-cover">
        <div>
          <p class="eyebrow">Databricks migration discovery</p>
          <h1>${escapeHtml(bu.name)} Technical Discovery Report</h1>
          <p>Client-facing summary of the discovery findings, migration proposal, technical analysis outputs, architecture evidence, dependencies and proposed rationalisation approach.</p>
        </div>
        <dl class="client-report-meta">
          <div><dt>Business unit</dt><dd>${escapeHtml(bu.name)}</dd></div>
          <div><dt>BU lead</dt><dd>${escapeHtml(bu.lead || "Not recorded")}</dd></div>
          <div><dt>Recommendation</dt><dd>${escapeHtml(bu.recommendation || "Assess")}</dd></div>
          <div><dt>Generated</dt><dd>${escapeHtml(new Date().toLocaleDateString("en-GB"))}</dd></div>
        </dl>
      </header>
      <section class="client-report-kpis" aria-label="Report key metrics">
        ${model.kpis.map((kpi) => `
          <div>
            <span>${escapeHtml(kpi.label)}</span>
            <strong>${escapeHtml(stripHtml(kpi.value))}</strong>
            <small>${escapeHtml(kpi.note || "")}</small>
          </div>
        `).join("")}
      </section>
      <nav class="client-report-toc" aria-label="Report sections">
        <h2>Report Sections</h2>
        <ol>
          ${model.sections.map((section, index) => `
            <li><a href="#report-section-${escapeHtml(section.key)}"><span>${index + 1}</span>${escapeHtml(section.title)}</a></li>
          `).join("")}
        </ol>
      </nav>
      <section class="client-report-sections">
        ${model.sections.map((section, index) => renderBuTechReportClientSection(section, index)).join("")}
      </section>
    </section>
  `;
}

function renderBuTechReportClientSection(section, index) {
  return `
    <article class="client-report-section" id="report-section-${escapeHtml(section.key)}">
      <header>
        <p class="eyebrow">Section ${index + 1}</p>
        <h2>${escapeHtml(section.title)}</h2>
      </header>
      ${renderClientReportBody(section.body)}
      ${section.supplement ? `<div class="client-report-supplement">${section.supplement}</div>` : ""}
    </article>
  `;
}

function renderBuOutputDocumentFeedbackBanner(phase, item, bu, options = {}) {
  const definition = getBuOutputDocumentDefinitionForPage(phase.key, item.key);
  if (!definition || !bu?.id) return "";
  const review = getBuOutputDocumentReviewState(bu.id, definition.key);
  if (!["Feedback requested", "Feedback implemented"].includes(review.status) || !review.feedback) return "";
  const showMarkDone = options.showMarkDone && review.status === "Feedback requested";
  return `
    <section class="panel bu-output-feedback-banner" aria-label="BU output document feedback">
      <div>
        <p class="eyebrow">${escapeHtml(review.status)}</p>
        <h3>${escapeHtml(definition.title)}</h3>
        <p>${escapeHtml(review.feedback)}</p>
        ${review.implementationNote ? `<div class="bu-output-implementation-note"><strong>What was done:</strong> ${escapeHtml(review.implementationNote)}</div>` : ""}
        ${review.updatedAt ? `<small>Updated ${escapeHtml(formatDateTime(review.updatedAt))}</small>` : ""}
      </div>
      <div class="bu-output-feedback-actions">
        ${showMarkDone ? `
          <button class="icon-button primary bu-output-feedback-done" type="button" data-business-unit-id="${escapeHtml(bu.id)}" data-document-key="${escapeHtml(definition.key)}">
            <svg><use href="#icon-check"></use></svg>
            <span>What has been done</span>
          </button>
        ` : ""}
        <a class="icon-button ghost" href="${documentUrl("outputs", "per-bu-outputs", bu.id)}">
          <svg><use href="#icon-arrow-left"></use></svg>
          <span>Back to BU outputs</span>
        </a>
      </div>
    </section>
  `;
}

function wireBuTechReportActions() {
  const form = document.querySelector("#buTechReportForm");
  if (!form) return;
  const status = form.querySelector("#buTechReportStatus");
  wireBuTechReportExecutiveSummaryEditor(form);
  wireBuTechReportProductFilters(form);
  form.querySelectorAll(".bu-tech-report-feedback-action").forEach((button) => {
    button.addEventListener("click", async () => {
      const comment = window.prompt(`Feedback for ${button.dataset.reportSectionTitle || "this section"}`, "");
      if (comment === null) return;
      const trimmed = comment.trim();
      if (!trimmed) {
        if (status) status.textContent = "Feedback was not sent because no comment was entered.";
        return;
      }
      await sendBuTechReportSectionFeedback(button, trimmed, status);
    });
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!SERVER_MODE) {
      if (status) status.textContent = "Run the local server to save the BU Tech Report draft.";
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    if (status) status.textContent = "Saving BU Tech Report draft...";
    const sections = {};
    Array.from(form.elements).forEach((element) => {
      const match = element.name?.match(/^section:([^:]+):(body|notes)$/);
      if (!match) return;
      sections[match[1]] ||= {};
      sections[match[1]][match[2]] = element.value || "";
    });
    const executiveSummaryBody = getBuTechReportExecutiveSummaryBodyFromForm(form);
    if (executiveSummaryBody !== null) {
      sections["executive-summary"] ||= {};
      sections["executive-summary"].body = executiveSummaryBody;
    }
    const controls = {
      targetArchitectureStatus: form.elements.targetArchitectureStatus?.value || "Proposed",
      technologyRows: {},
    };
    Array.from(form.elements).forEach((element) => {
      const match = element.name?.match(/^tech:([^:]+):(technology|awsEquivalent|scopeDecision)$/);
      if (!match) return;
      controls.technologyRows[match[1]] ||= {};
      controls.technologyRows[match[1]][match[2]] = element.value || "";
    });
    try {
      const result = await apiRequest(`/api/business-units/${encodeURIComponent(form.dataset.businessUnitId)}/bu-tech-report`, {
        method: "PUT",
        body: JSON.stringify({ sections, controls }),
      });
      if (result.screen) {
        const screens = serverWorkspace.screen_instances || [];
        const index = screens.findIndex((screen) => screen.screen_instance_id === result.screen.screen_instance_id);
        if (index >= 0) screens[index] = result.screen;
        else screens.push(result.screen);
        serverWorkspace.screen_instances = screens;
      }
      if (status) status.textContent = "BU Tech Report draft saved.";
      reloadAppAfterStatusUpdate(result.screen?.status || "In progress", button);
    } catch (error) {
      if (status) status.textContent = `The BU Tech Report could not be saved: ${error.message || error}`;
    } finally {
      if (button) button.disabled = false;
    }
  });
}

async function sendBuTechReportSectionFeedback(button, comment, statusElement) {
  if (!SERVER_MODE) {
    if (statusElement) statusElement.textContent = "Run the local server to send task feedback.";
    return;
  }
  const businessUnitId = button.dataset.businessUnitId || "";
  const sectionKey = button.dataset.sectionKey || "";
  if (!businessUnitId || !sectionKey) return;
  button.disabled = true;
  if (statusElement) statusElement.textContent = "Sending feedback and moving the task back to In progress...";
  try {
    const result = await apiRequest(`/api/business-units/${encodeURIComponent(businessUnitId)}/screens/${encodeURIComponent(sectionKey)}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status: "In progress",
        feedback: {
          comment,
          sourceSectionKey: button.dataset.reportSectionKey || "",
          sourceSectionTitle: button.dataset.reportSectionTitle || "",
        },
      }),
    });
    if (result.screen) {
      const screens = serverWorkspace.screen_instances || [];
      const index = screens.findIndex((screen) => screen.screen_instance_id === result.screen.screen_instance_id);
      if (index >= 0) screens[index] = result.screen;
      else screens.push(result.screen);
      serverWorkspace.screen_instances = screens;
    }
    if (statusElement) statusElement.textContent = "Feedback sent. Refreshing section status...";
    reloadAppAfterStatusUpdate(result.screen?.status || "In progress", button);
  } catch (error) {
    if (statusElement) statusElement.textContent = `Feedback could not be sent: ${formatApiError(error)}`;
  } finally {
    button.disabled = false;
  }
}
