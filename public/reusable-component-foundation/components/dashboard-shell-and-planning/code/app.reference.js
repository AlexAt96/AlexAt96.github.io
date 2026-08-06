/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderDashboard() {
  const activeTab = queryParam("tab") === "plan" ? "plan" : "statistics";
  const dashboardModel = getDiscoveryDashboardModel();
  return `
    <section class="dashboard-title">
      <div>
        <p class="eyebrow">Azure Databricks to AWS</p>
        <h2>Discovery dashboard</h2>
      </div>
      <div class="phase-jump">
        <a class="icon-button ghost" href="input-centre.html">
          <svg><use href="#icon-file"></use></svg>
          <span>Source register</span>
        </a>
        <a class="icon-button primary" href="${phaseUrl(dashboardModel.nextPhaseKey, dashboardModel.nextBuId)}">
          <svg><use href="#icon-arrow"></use></svg>
          <span>Open next action</span>
        </a>
      </div>
    </section>
    ${renderDashboardTabs(activeTab)}
    ${activeTab === "plan" ? renderDashboardPlanTab() : renderDashboardStatisticsTab(dashboardModel)}
  `;
}

function renderDashboardTabs(activeTab) {
  const tabs = [
    { key: "statistics", label: "Statistics", href: "index.html?tab=statistics", icon: "icon-dashboard" },
    { key: "plan", label: "Plan", href: "index.html?tab=plan", icon: "icon-calendar" },
  ];
  return `
    <nav class="dashboard-tabs" aria-label="Dashboard views">
      ${tabs.map((tab) => `
        <a class="dashboard-tab ${activeTab === tab.key ? "active" : ""}" href="${tab.href}" aria-current="${activeTab === tab.key ? "page" : "false"}">
          <svg><use href="#${tab.icon}"></use></svg>
          <span>${escapeHtml(tab.label)}</span>
        </a>
      `).join("")}
    </nav>
  `;
}

function renderDashboardStatisticsTab(dashboardModel) {
  return `
    ${renderDiscoveryCommandDeck(dashboardModel)}
    <section class="dashboard-control-grid">
      ${renderDiscoveryProgressPanel(dashboardModel)}
      ${renderDiscoveryDocumentPanel(dashboardModel)}
    </section>
    <section class="dashboard-control-grid wide-left">
      ${renderDiscoveryRoleMatrix(dashboardModel)}
      ${renderDiscoveryForecastPanel(dashboardModel)}
    </section>
    <section class="panel dashboard-scope-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Programme scope</p>
          <h3>Business units</h3>
        </div>
        <span class="pill">${businessUnits.length} in scope</span>
      </div>
      <div class="bu-card-grid">${businessUnits.map(renderBuCard).join("")}</div>
    </section>
  `;
}

function renderDiscoveryKpiCard({ label, value, detail, tooltip = "", href = "", tone = "", icon = "icon-dashboard" }) {
  return `
    <article class="dashboard-kpi ${escapeHtml(tone)}">
      <span class="dashboard-kpi-icon"><svg><use href="#${escapeHtml(icon)}"></use></svg></span>
      <span>${escapeHtml(label)}</span>
      <strong>${tooltip || href ? dataText(value, tooltip || `Source: ${label}`, href) : escapeHtml(String(value))}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function renderDiscoveryLineChart(rows) {
  const chartWidth = 660;
  const chartHeight = 220;
  const left = 8;
  const right = 8;
  const top = 18;
  const bottom = 18;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const points = rows.map((row, index) => {
    const x = left + (rows.length <= 1 ? 0 : (plotWidth * index) / (rows.length - 1));
    const y = top + plotHeight - (Math.max(0, Math.min(100, row.progress)) / 100) * plotHeight;
    return { ...row, x, y };
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaString = `${left},${top + plotHeight} ${pointString} ${left + plotWidth},${top + plotHeight}`;
  return `
    <div class="dashboard-line-chart" aria-label="Phase percentage complete line chart">
      <div class="dashboard-chart-plot">
        <div class="dashboard-chart-y-axis" aria-hidden="true">
          ${[100, 75, 50, 25, 0].map((tick) => `<span>${tick}%</span>`).join("")}
        </div>
        <div class="dashboard-chart-main">
          <svg viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Percentage complete by phase">
            <defs>
              <linearGradient id="dashboardProgressArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#2fb6ff" stop-opacity="0.28" />
                <stop offset="100%" stop-color="#2fb6ff" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            ${[0, 25, 50, 75, 100].map((tick) => {
              const y = top + plotHeight - (tick / 100) * plotHeight;
              return `<line class="dashboard-chart-gridline" x1="${left}" y1="${y}" x2="${left + plotWidth}" y2="${y}"></line>`;
            }).join("")}
            <polygon class="dashboard-chart-area" points="${areaString}"></polygon>
            <polyline class="dashboard-chart-line" points="${pointString}"></polyline>
            ${points.map((point) => `
              <a href="${phaseUrl(point.phase.key, point.buId)}">
                <circle class="dashboard-chart-point ${escapeHtml(point.statusClass)}" cx="${point.x}" cy="${point.y}" r="6">
                  <title>${escapeHtml(point.tooltip)}</title>
                </circle>
              </a>
            `).join("")}
          </svg>
          <div class="dashboard-chart-x-axis" aria-hidden="true" style="--phase-count:${Math.max(points.length, 1)};">
            ${points.map((point) => `<span>${escapeHtml(point.phase.shortTitle || point.phase.title)}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDashboardPlanTab() {
  const model = getDashboardPlanModel();
  const hasDraftChanges = hasDashboardPlanDraftChanges();
  const statusLegend = [
    ["in-progress", "In progress"],
    ["in-review", "In review"],
    ["done", "Done"],
    ["blocked", "Blocked"],
    ["not-started", "Not started"],
  ].map(([status, label]) => `<span class="plan-legend-item ${status}"><i></i>${escapeHtml(label)}</span>`).join("");
  return `
    <section class="panel dashboard-plan-panel">
      <div class="panel-heading dashboard-plan-heading">
        <div>
          <p class="eyebrow">Engagement Lead plan</p>
          <h3>Weekly discovery plan</h3>
        </div>
        <div class="dashboard-plan-meta">
          <span class="pill">Current week ${model.currentWeek}</span>
          <button class="icon-button primary" id="saveDashboardPlanChanges" type="button"${hasDraftChanges ? "" : " disabled"} title="${hasDraftChanges ? "Save plan changes" : "No plan changes to save"}">
            <svg><use href="#icon-check"></use></svg>
            <span>Save changes</span>
          </button>
          <button class="icon-button ghost" id="undoDashboardPlanAction" type="button"${hasDashboardPlanUndo() ? "" : " disabled"} title="Undo the last plan edit">
            <svg><use href="#icon-reset"></use></svg>
            <span>Undo</span>
          </button>
          <a class="icon-button ghost" href="${documentUrl("initiation", "project-plan-setup")}">
            <svg><use href="#icon-arrow"></use></svg>
            <span>Edit project plan</span>
          </a>
        </div>
      </div>
      <div class="dashboard-plan-summary">
        ${factCard("Timeline", `${model.weekCount} weeks`, `Starts ${model.weekLabel}`)}
        ${factCard("Today", model.todayLabel, `Week ${model.currentWeek} marker`)}
        ${factCard("Projected finish", model.projectedFinishLabel, `Week ${model.projectedFinishWeek} final plan week`)}
      </div>
      <section class="plan-gantt-shell">
        <div class="plan-gantt-toolbar">
          <div class="plan-gantt-title">
            <span>Timeline board</span>
            <strong>${model.rows.length} lanes across ${model.weekCount} weeks</strong>
          </div>
          <div class="plan-status-legend" aria-label="Plan status colours">
            ${statusLegend}
          </div>
        </div>
        <div class="gantt-scroll" aria-label="Weekly Gantt plan">
          <div class="gantt-grid ${model.fitToFrame ? "fit-to-frame" : "scroll-timeline"}" style="--plan-weeks: ${model.weekCount}; --today-offset: ${model.todayOffset}px; --today-progress: ${model.todayProgress}; --plan-width: ${model.planWidth}px;">
            <svg class="gantt-dependency-lines" aria-hidden="true"></svg>
            <div class="gantt-dependency-actions" aria-label="Dependency actions"></div>
            <div class="gantt-corner">Swim lane</div>
            ${model.weeks.map((week) => `
              <div class="gantt-week-head">
                <strong>Week ${week.number}</strong>
                <span>W/C ${escapeHtml(week.label)}</span>
              </div>
            `).join("")}
            <div class="gantt-today-marker" aria-hidden="true"><span>Today</span></div>
            ${model.rows.map((row, index) => renderDashboardPlanRow(row, index + 2)).join("")}
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderDashboardPlanRow(row, rowNumber) {
  const rowStyle = `--plan-row: ${rowNumber}; --lane-height: ${row.laneHeight}px;`;
  const rowTypeClass = getPlanCssToken(row.type || "business-unit");
  return `
    <div class="gantt-lane-cell plan-row-${rowTypeClass} ${row.type === "decision" ? "decision" : ""}" style="${rowStyle}">
      <strong>${escapeHtml(row.title)}</strong>
      <span>${escapeHtml(row.subtitle)}</span>
    </div>
    <div class="gantt-row-track plan-row-${rowTypeClass}" style="${rowStyle}"></div>
    ${row.bars.map((bar) => renderDashboardPlanBar(bar, rowNumber)).join("")}
  `;
}

function renderDashboardPlanBar(bar, rowNumber) {
  const delayPercent = bar.delaySpan ? Math.round((bar.delaySpan / (bar.totalSpan || bar.span)) * 100) : 0;
  const compact = (bar.totalSpan || bar.span) <= 2;
  const phaseClass = getPlanCssToken(bar.phaseKey || "task");
  const ragStatus = normaliseProjectPlanRagStatus(bar.ragStatus);
  const ragLabel = getProjectPlanRagStatusLabel(ragStatus);
  const ragShortLabel = PROJECT_PLAN_RAG_STATUSES.find((option) => option.key === ragStatus)?.shortLabel || "";
  const stripLabel = ragStatus === "not-set" ? "" : ragShortLabel;
  const stripAriaLabel = ragStatus === "not-set" && isDoneStatus(bar.status) ? "No RAG status; done" : `RAG status: ${ragLabel}`;
  return `
    <a class="gantt-bar plan-phase-${phaseClass} ${statusClass(bar.status)} rag-${ragStatus} ${bar.delaySpan ? "delayed" : ""} ${compact ? "compact" : ""}" href="${bar.href}" draggable="false" data-plan-row-id="${escapeHtml(bar.rowId)}" data-plan-start="${escapeHtml(bar.start)}" data-plan-span="${escapeHtml(bar.span)}" data-plan-delay="${escapeHtml(bar.delaySpan)}" data-plan-rag-status="${escapeHtml(ragStatus)}" style="--plan-row: ${rowNumber}; --bar-lane: ${bar.stackIndex || 0}; --bar-progress: ${bar.progress}%; --delay-percent: ${delayPercent}%; grid-column: ${bar.start + 1} / span ${bar.totalSpan || bar.span};" title="${escapeHtml(bar.title)} - ${bar.progress}% complete. RAG status: ${escapeHtml(ragLabel)}. Double-click to open.${bar.delaySpan ? ` Delayed ${bar.delaySpan} week${bar.delaySpan === 1 ? "" : "s"}.` : ""}">
      <span class="gantt-bar-resize left" data-resize-edge="left" aria-hidden="true"></span>
      <span class="gantt-dependency-handle left" data-dependency-edge="start" title="Drag to link from task start"></span>
      <span class="gantt-rag-strip" aria-label="${escapeHtml(stripAriaLabel)}" title="${escapeHtml(stripAriaLabel)}">${escapeHtml(stripLabel)}</span>
      <span class="gantt-bar-label">${escapeHtml(compact ? getCompactPlanBarLabel(bar.label) : bar.label)}</span>
      <span class="gantt-bar-progress">${bar.progress}%</span>
      ${bar.delaySpan ? `<span class="gantt-delay-extension">+${escapeHtml(bar.delaySpan)}w</span>` : ""}
      <span class="gantt-dependency-handle right" data-dependency-edge="finish" title="Drag to link from task finish"></span>
      <span class="gantt-bar-resize right" data-resize-edge="right" aria-hidden="true"></span>
    </a>
  `;
}

function getDashboardPlanModel() {
  const laneWidth = 180;
  const weekWidth = 88;
  const plan = getDashboardPlanSettings();
  const weekCount = clampNumber(plan.weekCount, DASHBOARD_PLAN_MIN_WEEK_COUNT, DASHBOARD_PLAN_MAX_WEEK_COUNT, DEFAULT_DASHBOARD_PLAN.weekCount);
  const resolvedPlanRows = resolveProjectPlanSchedule(plan.rows, weekCount);
  const startDate = dateFromPlanInput(plan.startDate);
  const today = new Date();
  const weeks = Array.from({ length: weekCount }, (_, index) => {
    const weekStart = addDays(startDate, index * 7);
    return {
      number: index + 1,
      label: formatPlanDate(weekStart),
      date: weekStart,
    };
  });
  const elapsedDays = Math.max(0, Math.min(weekCount * 7, Math.floor((startOfDay(today) - startDate) / 86400000)));
  const currentWeek = Math.min(weekCount, Math.max(1, Math.floor(elapsedDays / 7) + 1));
  const todayOffset = Math.round((elapsedDays / 7) * weekWidth);
  const todayProgress = Number((elapsedDays / Math.max(1, weekCount * 7)).toFixed(4));
  const fitToFrame = weekCount <= 15;
  const initiationRow = resolvedPlanRows.find((row) => row.phaseKey === "initiation") || createDefaultProjectPlanRows(weekCount)[0];
  const decisionRow = resolvedPlanRows.find((row) => row.phaseKey === "decision") || createDefaultProjectPlanRows(weekCount).at(-1);
  const buRows = businessUnits.map((bu) => {
    const scheduleRows = resolvedPlanRows.filter((row) => row.businessUnitId === bu.id);
    const bars = stackPlanBars(scheduleRows.map((row) => createPlanBarFromScheduleRow(row, weekCount)));
    const firstStartWeek = scheduleRows.length ? Math.min(...scheduleRows.map((row) => row.startWeek)) : 1;
    return {
      type: "business-unit",
      title: bu.name,
      subtitle: bu.lead || "BU lead",
      startLabel: weeks[Math.max(0, Math.min(firstStartWeek, weekCount) - 1)]?.label || weeks[0].label,
      laneCount: Math.max(1, ...bars.map((bar) => (bar.stackIndex || 0) + 1)),
      laneHeight: 28 + (Math.max(1, ...bars.map((bar) => (bar.stackIndex || 0) + 1)) * 36),
      bars,
    };
  });
  const initiationBars = stackPlanBars([createPlanBarFromScheduleRow(initiationRow, weekCount)]);
  const decisionBars = stackPlanBars([createPlanBarFromScheduleRow(decisionRow, weekCount)]);
  const rows = [
    {
      type: "programme",
      title: "Project initiation",
      subtitle: "Programme-wide setup",
      startLabel: weeks[initiationRow.startWeek - 1]?.label || weeks[0].label,
      laneCount: 1,
      laneHeight: 58,
      bars: initiationBars,
    },
    ...buRows,
    {
      type: "decision",
      title: "Decision",
      subtitle: "Across all business units",
      startLabel: weeks[decisionRow.startWeek - 1]?.label || weeks[0].label,
      laneCount: 1,
      laneHeight: 58,
      bars: decisionBars,
    },
  ];
  return {
    weekCount,
    fitToFrame,
    planWidth: laneWidth + (weekWidth * weekCount),
    weekLabel: weeks[0].label,
    projectedFinishWeek: weekCount,
    projectedFinishLabel: weeks[weekCount - 1]?.label || weeks.at(-1)?.label || weeks[0].label,
    todayLabel: formatPlanDate(today),
    currentWeek,
    todayOffset,
    todayProgress,
    weeks,
    rows,
    dependencies: getProjectPlanDependencies(resolvedPlanRows),
  };
}

async function persistDashboardPlanSettings(settings) {
  const normalisedSettings = materialiseDashboardPlanScheduleForSave(settings);
  const saved = saveDashboardPlanSettings(normalisedSettings);
  if (!saved) return false;
  if (!SERVER_MODE) {
    clearDashboardPlanDraftSettings();
    return true;
  }
  try {
    const result = await apiRequest("/api/programme/project-plan", {
      method: "PUT",
      body: JSON.stringify(dashboardPlanSettingsToServerPayload(normalisedSettings)),
    });
    if (result?.projectPlan) {
      serverWorkspace ||= {};
      serverWorkspace.project_plan = result.projectPlan.rows || [];
      serverWorkspace.metadata = {
        ...(serverWorkspace.metadata || {}),
        project_plan_start_date: result.projectPlan.startDate || normalisedSettings.startDate,
        project_plan_week_count: result.projectPlan.weekCount || normalisedSettings.weekCount,
      };
    }
    clearDashboardPlanDraftSettings();
    return true;
  } catch (error) {
    showAppToast("Plan not saved to local database", { detail: formatApiError(error), tone: "neutral", timeout: 5200 });
    return false;
  }
}
