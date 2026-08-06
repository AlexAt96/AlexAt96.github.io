/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderDecisionPage() {
  const models = getDecisionBuModels();
  const scenario = getDecisionScenarioSummary(models);
  return `
    ${renderBreadcrumbs([
      ["Dashboard", "index.html"],
      ["Decision", "decision.html"],
    ])}
    <section class="dashboard-title decision-page-title">
      <div>
        <p class="eyebrow">Executive decision</p>
        <h2>Databricks migration decision cockpit</h2>
      </div>
      <div class="phase-jump">
        <span class="pill warm">Sponsor playback</span>
      </div>
    </section>
    <section class="decision-executive-shell" data-decision-scenario>
      <div class="decision-main-stack">
        ${renderDecisionCgiRecommendationPanel(models, scenario)}
        ${renderDecisionExecutiveSummary(models, scenario)}
        ${renderDecisionAccountingOverview(models, scenario)}
        ${renderDecisionRiceSequencingPanel(models, scenario)}
        <section class="panel">${renderDecisionSavingsSummaryTable(models, scenario)}</section>
      </div>
      ${renderDecisionScenarioConfigurator(models)}
    </section>
    <section class="panel">${renderDecisionTableSection(models, scenario)}</section>
    ${renderDecisionArtifactHub(models)}
    <section class="panel">${renderSponsorApproval()}</section>
  `;
}

function renderDecisionCgiRecommendationPanel(models, scenario) {
  const migrateCount = Object.values(scenario.buContributions || {}).filter((item) => item.currentAction === "Migrate").length;
  const discussCount = Object.values(scenario.buContributions || {}).filter((item) => item.currentAction === "Assess further").length;
  return `
    <section class="panel decision-recommendation-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">CGI migration recommendation</p>
          <h3>Recommended migration order and current scenario</h3>
        </div>
        <div class="decision-recommendation-summary">
          <span><strong data-decision-recommend-migrate-count>${formatNumber(migrateCount)}</strong> migrate</span>
          <span><strong data-decision-recommend-discuss-count>${formatNumber(discussCount)}</strong> discuss</span>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table decision-recommendation-table">
          <caption>CGI recommendation by business unit and current configured migration scenario.</caption>
          <thead><tr><th>Order</th><th>Business Unit</th><th>CGI recommendation</th><th>Current scenario</th><th>RICE</th><th>Net five-year</th><th>Confidence / appetite</th><th>Why</th></tr></thead>
          <tbody data-decision-recommendation-body>
            ${renderDecisionCgiRecommendationRows(models, scenario)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDecisionExecutiveSummary(models, scenario) {
  const exactSummary = `Migrating ${scenario.selectedProducts} of ${scenario.totalProducts} Databricks product${scenario.totalProducts === 1 ? "" : "s"} across ${scenario.selectedBuCount} of ${scenario.totalBuCount} business unit${scenario.totalBuCount === 1 ? "" : "s"} projects ${formatCurrency(scenario.netSavings)} net five-year savings after ${formatCurrency(scenario.migrationCost)} migration cost. Payback is ${scenario.breakEvenLabel}.`;
  return `
    <section class="decision-hero-grid">
      <article class="panel decision-hero-panel">
        <p class="eyebrow">Executive financial headline</p>
        ${renderDecisionScenarioNotice(scenario)}
        <div class="decision-headline-grid">
          <div class="decision-headline-card">
            <span>Total saving</span>
            <strong data-decision-gross-saving>${formatCurrency(scenario.fiveYearSavings)}</strong>
            <small>Five-year gross benefit</small>
          </div>
          <div class="decision-headline-card cost">
            <span>Migration cost</span>
            <strong data-decision-migration-cost>${formatCurrency(scenario.migrationCost)}</strong>
            <small>Initial investment</small>
          </div>
          <div class="decision-headline-card net">
            <span>Five-year net saving</span>
            <strong data-decision-net>${formatCurrency(scenario.netSavings)}</strong>
            <small>After migration cost</small>
          </div>
          <div class="decision-headline-card payback">
            <span>Savings realised by</span>
            <strong data-decision-break-even>${escapeHtml(scenario.breakEvenLabel)}</strong>
            <small>Cumulative payback point</small>
          </div>
        </div>
        <p data-decision-exact-summary>${escapeHtml(exactSummary)}</p>
        <div class="decision-hero-actions">
          <button class="icon-button primary" type="button" data-decision-export-ppt>
            <svg><use href="#icon-download"></use></svg>
            <span>Export slide deck</span>
          </button>
          <button class="icon-button ghost" type="button" data-decision-save-scenario>
            <svg><use href="#icon-save"></use></svg>
            <span>Save configuration</span>
          </button>
          <a class="icon-button ghost" href="#decision-artifacts">
            <svg><use href="#icon-file"></use></svg>
            <span>Business unit artifacts</span>
          </a>
        </div>
        <small class="decision-save-status" data-decision-save-status></small>
      </article>
      <article class="panel decision-chart-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Payback curve</p>
            <h3 data-decision-chart-title>Net savings progression over five years</h3>
          </div>
          <div class="decision-chart-controls">
            <div class="decision-chart-toolbar" role="radiogroup" aria-label="Chart type">
              <label><input type="radio" name="decisionChartType" value="progression" data-decision-chart-type checked /><span>Progression</span></label>
              <label><input type="radio" name="decisionChartType" value="waterfall" data-decision-chart-type /><span>Waterfall</span></label>
            </div>
            <div class="decision-chart-toolbar" role="radiogroup" aria-label="Chart view">
              <label><input type="radio" name="decisionChartMode" value="programme" data-decision-chart-mode checked /><span>Programme</span></label>
              <label><input type="radio" name="decisionChartMode" value="bu" data-decision-chart-mode /><span>By BU</span></label>
            </div>
            <select class="decision-chart-bu-select" data-decision-waterfall-bu-select aria-label="Business unit waterfall view">
              ${renderDecisionWaterfallBuOptions(scenario)}
            </select>
          </div>
        </div>
        <div data-decision-chart>${renderDecisionPrimaryChart(scenario, "progression", "programme")}</div>
        <div class="decision-chart-legend-block" data-decision-chart-legend>${renderDecisionPrimaryChartLegend(scenario, "progression", "programme")}</div>
      </article>
    </section>
    <section class="decision-kpi-grid">
      <div class="fact-card"><span>Migration cost</span><strong data-decision-migration-cost>${formatCurrency(scenario.migrationCost)}</strong><small class="muted">Initial investment before benefits</small></div>
      <div class="fact-card"><span>Five-year gross saving</span><strong data-decision-gross-saving>${formatCurrency(scenario.fiveYearSavings)}</strong><small class="muted">Before migration cost</small></div>
      <div class="fact-card"><span>Products in scope</span><strong data-decision-product-count>${scenario.selectedProducts}/${scenario.totalProducts}</strong><small class="muted">Databricks products marked Migrate</small></div>
      <div class="fact-card"><span>Average RICE</span><strong data-decision-rice>${formatNumber(scenario.avgRice)}</strong><small class="muted">Weighted by selected products</small></div>
    </section>
  `;
}

function renderDecisionScenarioConfigurator(models) {
  return `
    <details class="panel decision-config-panel" id="decision-scenario-config" open data-page-state-disabled="true">
      <summary class="decision-config-summary">
        <div>
          <p class="eyebrow">Scenario configurator</p>
          <h3>Migration scenario</h3>
        </div>
        <svg><use href="#icon-arrow"></use></svg>
      </summary>
      <div class="decision-config-list">
        ${models.map(renderDecisionScenarioBu).join("")}
      </div>
    </details>
  `;
}

function getDecisionScenarioSummary(models = getDecisionBuModels()) {
  const summary = {
    totalBuCount: models.length,
    selectedBuIds: new Set(),
    buContributions: {},
    totalProducts: 0,
    selectedProducts: 0,
    migrationCost: 0,
    fiveYearSavings: 0,
    netSavings: 0,
    yearOneTwoSavings: 0,
    yearThreeFiveSavings: 0,
    weightedRiceTotal: 0,
    weightedRiceCount: 0,
    configurationRows: [],
  };
  models.forEach((model) => {
    const productRows = model.products.length ? model.products : [{ id: `${model.bu.id}-estate` }];
    const weight = productRows.length ? 1 / productRows.length : 1;
    summary.totalProducts += productRows.length;
    summary.buContributions[model.bu.id] = {
      buId: model.bu.id,
      buName: model.bu.name,
      selectedProducts: 0,
      totalProducts: productRows.length,
      migrationCost: 0,
      fiveYearSavings: 0,
      yearOneTwoSavings: 0,
      yearThreeFiveSavings: 0,
      netSavings: 0,
      reachScore: model.rice.reachScore,
      impactScore: model.rice.impactScore,
      confidenceScore: model.rice.confidenceScore,
      effortScore: model.rice.effortScore,
      riceScore: 0,
      weight: 0,
      cgiRecommendation: model.cgiRecommendation,
      currentAction: model.defaultAction,
      currentScenarioLabel: getDecisionScenarioActionLabel(model.defaultAction),
    };
    productRows.forEach((product) => {
      const productContribution = {
        buId: model.bu.id,
        buName: model.bu.name,
        productId: product.id || `${model.bu.id}-estate`,
        productName: product.name || `${model.bu.name} Databricks estate`,
        action: model.defaultAction,
        counted: model.defaultAction === "Migrate",
        netSavings: (model.cost.fiveYearSavings - model.bu.migrationCost) * weight,
        migrationCost: model.bu.migrationCost * weight,
        fiveYearSavings: model.cost.fiveYearSavings * weight,
        riceScore: Number(model.rice.riceScore || 0) * weight,
        cgiRecommendation: model.cgiRecommendation,
      };
      summary.configurationRows.push(productContribution);
      if (model.defaultAction !== "Migrate") return;
      const contribution = summary.buContributions[model.bu.id];
      summary.selectedProducts += 1;
      summary.selectedBuIds.add(model.bu.id);
      summary.migrationCost += model.bu.migrationCost * weight;
      summary.fiveYearSavings += model.cost.fiveYearSavings * weight;
      summary.yearOneTwoSavings += model.cost.yearOneTwoSavings * weight;
      summary.yearThreeFiveSavings += model.cost.yearThreeFiveSavings * weight;
      summary.weightedRiceTotal += Number(model.rice.riceScore || 0) * weight;
      summary.weightedRiceCount += weight;
      contribution.selectedProducts += 1;
      contribution.migrationCost += model.bu.migrationCost * weight;
      contribution.fiveYearSavings += model.cost.fiveYearSavings * weight;
      contribution.yearOneTwoSavings += model.cost.yearOneTwoSavings * weight;
      contribution.yearThreeFiveSavings += model.cost.yearThreeFiveSavings * weight;
      contribution.riceScore += Number(model.rice.riceScore || 0) * weight;
      contribution.weight += weight;
    });
  });
  setDecisionCurrentScenarioLabels(summary);
  Object.values(summary.buContributions).forEach((contribution) => {
    contribution.netSavings = contribution.fiveYearSavings - contribution.migrationCost;
    contribution.avgRice = contribution.weight ? contribution.riceScore / contribution.weight : 0;
    contribution.points = getDecisionCumulativePoints(contribution);
    contribution.breakEvenLabel = getDecisionBreakEvenLabel(contribution.points);
  });
  summary.selectedBuCount = summary.selectedBuIds.size;
  summary.netSavings = summary.fiveYearSavings - summary.migrationCost;
  summary.avgRice = summary.weightedRiceCount ? summary.weightedRiceTotal / summary.weightedRiceCount : 0;
  summary.points = getDecisionCumulativePoints(summary);
  summary.buSeries = Object.values(summary.buContributions).filter((contribution) => contribution.selectedProducts > 0);
  summary.breakEvenLabel = getDecisionBreakEvenLabel(summary.points);
  return summary;
}

function renderDecisionPrimaryChart(scenario, chartType = "progression", chartMode = "programme", buId = "") {
  if (chartType === "waterfall") {
    if (chartMode === "bu") {
      const selectedBu = getDecisionSelectedWaterfallBu(scenario, buId);
      if (!selectedBu) return `<div class="empty-state compact"><strong>No BU waterfall available.</strong><span>Mark at least one product as Migrate.</span></div>`;
      return renderDecisionWaterfallChart(selectedBu, { stacked: false });
    }
    return renderDecisionWaterfallChart(scenario, { stacked: true });
  }
  return renderDecisionSavingsChartSvg(scenario.points, scenario.buSeries, chartMode);
}

function renderDecisionSavingsChartSvg(points = [], buSeries = [], mode = "programme") {
  if (!points.length) return `<div class="empty-state compact"><strong>No savings selected.</strong><span>Mark at least one business unit or product as Migrate.</span></div>`;
  const width = 760;
  const height = 390;
  const left = 82;
  const right = 34;
  const top = 38;
  const bottom = 62;
  const series = mode === "bu" && buSeries.length
    ? buSeries.map((item, index) => ({
      label: item.buName,
      points: item.points || [],
      color: getDecisionSeriesColor(index),
    }))
    : [{ label: "Programme", points, color: "#247348" }];
  const values = series.flatMap((item) => item.points.map((point) => Number(point.value || 0)));
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const span = maxValue - minValue || 1;
  const yTicks = getDecisionChartTicks(minValue, maxValue);
  const xLabels = points.length ? points : [{ label: "Start" }, ...[1, 2, 3, 4, 5].map((year) => ({ label: `Year ${year}` }))];
  const xFor = (index) => left + ((width - left - right) * index) / Math.max(1, xLabels.length - 1);
  const yFor = (value) => top + ((maxValue - value) / span) * (height - top - bottom);
  const zeroY = yFor(0);
  const formatAxis = (value) => {
    const abs = Math.abs(value);
    const prefix = value < 0 ? "-" : "";
    if (abs >= 1000000) return `${prefix}GBP ${formatNumber(Math.round(abs / 100000) / 10)}m`;
    if (abs >= 1000) return `${prefix}GBP ${formatNumber(Math.round(abs / 1000))}k`;
    return `${prefix}${formatCurrency(abs)}`;
  };
  return `
    <svg class="decision-savings-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Net savings progression over five years">
      ${yTicks.map((tick) => {
        const y = yFor(tick);
        return `
          <g class="decision-chart-gridline">
            <line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#d7dce4" stroke-width="1"></line>
            <text x="${left - 12}" y="${y + 4}" text-anchor="end" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(formatAxis(tick))}</text>
          </g>
        `;
      }).join("")}
      <line class="decision-chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#a5acb0" stroke-width="1.2"></line>
      <line class="decision-chart-axis" x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#a5acb0" stroke-width="1.2"></line>
      <line class="decision-chart-zero" x1="${left}" y1="${zeroY}" x2="${width - right}" y2="${zeroY}" stroke="#1f2933" stroke-width="1.4" stroke-dasharray="6 5" opacity="0.48"></line>
      ${series.map((item) => {
        const path = item.points.map((point, index) => `${xFor(index)},${yFor(point.value)}`).join(" ");
        return `<polyline class="decision-chart-line" style="--series-color: ${escapeHtml(item.color)}" points="${path}" fill="none" stroke="${escapeHtml(item.color)}" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.4"></polyline>`;
      }).join("")}
      ${series.map((item) => item.points.map((point, index) => {
        const x = xFor(index);
        const y = yFor(point.value);
        return `
          <g class="decision-chart-point" style="--series-color: ${escapeHtml(item.color)}">
            <circle cx="${x}" cy="${y}" r="4.8" fill="#ffffff" stroke="${escapeHtml(item.color)}" stroke-width="2.6"></circle>
          </g>
        `;
      }).join("")).join("")}
      ${xLabels.map((point, index) => `
        <text class="decision-chart-x-label" x="${xFor(index)}" y="${height - 20}" text-anchor="middle" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(point.label.replace("Year ", "Y"))}</text>
      `).join("")}
      ${mode === "bu" && series.length ? `
        <g class="decision-chart-legend">
          ${series.map((item, index) => `
            <g transform="translate(${left + index * 142}, ${top - 12})">
              <circle cx="0" cy="0" r="4" style="fill: ${escapeHtml(item.color)}"></circle>
              <text x="9" y="4" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(item.label)}</text>
            </g>
          `).join("")}
        </g>
      ` : ""}
    </svg>
  `;
}

function renderDecisionWaterfallChart(scenario, options = {}) {
  const steps = getDecisionWaterfallSteps(scenario);
  const width = 760;
  const height = 390;
  const left = 82;
  const right = 34;
  const top = 38;
  const bottom = 66;
  const stacked = Boolean(options.stacked);
  const stackedContributions = stacked
    ? Object.values(scenario.buContributions || {}).filter((item) => item.selectedProducts > 0)
    : [];
  let running = 0;
  const bars = steps.map((step, index) => {
    const start = step.kind === "net" ? 0 : running;
    const end = step.kind === "net" ? step.value : running + step.value;
    if (step.kind !== "net") running = end;
    return { ...step, index, start, end };
  });
  const values = [
    ...bars.flatMap((bar) => [bar.start, bar.end, 0]),
    ...getDecisionWaterfallStackedScaleValues(bars, stackedContributions),
  ];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = maxValue - minValue || 1;
  const yTicks = getDecisionChartTicks(minValue, maxValue);
  const xStep = (width - left - right) / bars.length;
  const barWidth = Math.min(64, xStep * 0.62);
  const yFor = (value) => top + ((maxValue - value) / span) * (height - top - bottom);
  const zeroY = yFor(0);
  const formatAxis = (value) => {
    const abs = Math.abs(value);
    const prefix = value < 0 ? "-" : "";
    if (abs >= 1000000) return `${prefix}GBP ${formatNumber(Math.round(abs / 100000) / 10)}m`;
    if (abs >= 1000) return `${prefix}GBP ${formatNumber(Math.round(abs / 1000))}k`;
    return `${prefix}${formatCurrency(abs)}`;
  };
  return `
    <svg class="decision-savings-chart decision-waterfall-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Five-year migration payback waterfall">
      ${yTicks.map((tick) => {
        const y = yFor(tick);
        return `
          <g class="decision-chart-gridline">
            <line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#d7dce4" stroke-width="1"></line>
            <text x="${left - 12}" y="${y + 4}" text-anchor="end" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(formatAxis(tick))}</text>
          </g>
        `;
      }).join("")}
      <line class="decision-chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#a5acb0" stroke-width="1.2"></line>
      <line class="decision-chart-axis" x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#a5acb0" stroke-width="1.2"></line>
      <line class="decision-chart-zero" x1="${left}" y1="${zeroY}" x2="${width - right}" y2="${zeroY}" stroke="#1f2933" stroke-width="1.4" stroke-dasharray="6 5" opacity="0.48"></line>
      ${bars.map((bar) => {
        const x = left + bar.index * xStep + (xStep - barWidth) / 2;
        const y = Math.min(yFor(bar.start), yFor(bar.end));
        const h = Math.max(3, Math.abs(yFor(bar.start) - yFor(bar.end)));
        const tone = bar.kind === "cost" || bar.value < 0 ? "cost" : bar.kind === "net" ? "net" : "saving";
        const fill = tone === "cost" ? "#e31937" : tone === "net" ? "#285d9e" : "#247348";
        const stackedSegments = stackedContributions.length > 1 && bar.kind === "saving"
          ? renderDecisionWaterfallStackedSegments(bar, stackedContributions, x, barWidth, yFor)
          : "";
        return `
          <g class="decision-waterfall-bar ${tone}">
            ${stackedSegments || `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6" fill="${fill}"></rect>`}
            <text x="${x + barWidth / 2}" y="${height - 25}" text-anchor="middle" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(bar.label.replace("Year ", "Y"))}</text>
            <text x="${x + barWidth / 2}" y="${Math.max(16, y - 8)}" text-anchor="middle" fill="#5f6872" font-size="10" font-family="Arial, Helvetica, sans-serif" font-weight="400">${escapeHtml(formatAxis(bar.value))}</text>
          </g>
        `;
      }).join("")}
    </svg>
  `;
}

function renderDecisionRiceSequencingPanel(models, scenario) {
  return `
    <section class="panel decision-rice-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">RICE sequencing</p>
          <h3>Migration priority by selected scenario</h3>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table decision-rice-table">
          <caption>Scenario-driven RICE migration sequencing.</caption>
          <thead><tr><th>Sequence</th><th>Business Unit</th><th>RICE</th><th>Reach</th><th>Impact</th><th>Confidence</th><th>Effort</th><th>Why this position</th></tr></thead>
          <tbody data-decision-rice-body>
            ${renderDecisionRiceRows(models, scenario)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDecisionAccountingOverview(models, scenario) {
  const maxNetSaving = Math.max(...models.map((item) => Math.abs(item.cost.netSavings)), 1);
  return `
    <section class="decision-accounting-grid">
      <article class="panel decision-accounting-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Accounting view</p>
            <h3>Cost, saving and payback summary</h3>
          </div>
        </div>
        <div class="decision-accounting-bars" data-decision-accounting-bars>
          ${renderDecisionAccountingBars(scenario)}
        </div>
      </article>
      <article class="panel decision-accounting-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">BU economics</p>
            <h3>Net saving by business unit</h3>
          </div>
        </div>
        <div class="decision-bu-economics" data-decision-bu-economics>
          ${models.map((model) => renderDecisionBuEconomicRow(model, maxNetSaving)).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderDecisionSavingsSummaryTable(models, scenario) {
  return `
    ${detailHeader("Savings summary", "Finance-facing summary of selected migration economics with links to the cost analysis detail.")}
    <div class="data-table-wrap">
      <table class="data-table decision-savings-summary-table">
        <caption>Savings summary by business unit.</caption>
        <thead><tr><th>Business Unit</th><th>Products migrating</th><th>Migration cost</th><th>Five-year gross</th><th>Net five-year</th><th>Payback</th><th>Detail</th></tr></thead>
        <tbody data-decision-savings-body>
          ${renderDecisionSavingsSummaryRows(models, scenario)}
        </tbody>
      </table>
    </div>
  `;
}

function renderDecisionTableSection(models = getDecisionBuModels(), scenario = getDecisionScenarioSummary(models)) {
  return `
    ${detailHeader("Configured decision options by BU", "A concise executive table showing what the scenario configurator currently has in scope.")}
    ${renderDecisionTable(models, scenario)}
  `;
}

function renderDecisionArtifactHub(models = getDecisionBuModels()) {
  const crossBuActions = [
    ["Cross BU report", "decision.html"],
    ["RICE sequencing", documentUrl("outputs", "rice-score-report")],
    ["Cost analysis", documentUrl("outputs", "indicative-cost-analysis-report")],
    ["DBU distribution", documentUrl("outputs", "databricks-resource-distribution-report")],
  ];
  return `
    <section class="panel decision-artifact-hub" id="decision-artifacts">
      ${detailHeader("Business unit artifacts", "Executive entry points first, with the full supporting artifact table underneath.")}
      <nav class="decision-artifact-tabs" aria-label="Artifact groups">
        <a href="#decision-artifact-slides">Report slides</a>
        <a href="#decision-artifact-written">Written reports</a>
        <a href="#decision-artifact-cross-bu">Cross BU outputs</a>
        <a href="#decision-artifact-detail">Detail table</a>
      </nav>
      <div class="decision-artifact-tab-grid">
        <article id="decision-artifact-slides" class="decision-artifact-tab-panel">
          <div>
            <p class="eyebrow">Slides</p>
            <h4>Report slides</h4>
          </div>
          <div class="decision-artifact-button-grid">
            ${models.map(({ bu }) => `<a class="icon-button ghost" href="${documentUrl("outputs", "bu-tech-report", bu.id)}#ppt-slide-cover"><svg><use href="#icon-file"></use></svg><span>${escapeHtml(bu.name)}</span></a>`).join("")}
          </div>
        </article>
        <article id="decision-artifact-written" class="decision-artifact-tab-panel">
          <div>
            <p class="eyebrow">Documents</p>
            <h4>Written report documents</h4>
          </div>
          <div class="decision-artifact-button-grid">
            ${models.map(({ bu }) => `<a class="icon-button ghost" href="${documentUrl("outputs", "bu-tech-report", bu.id)}#report-section-executive-summary"><svg><use href="#icon-file"></use></svg><span>${escapeHtml(bu.name)}</span></a>`).join("")}
          </div>
        </article>
        <article id="decision-artifact-cross-bu" class="decision-artifact-tab-panel">
          <div>
            <p class="eyebrow">Programme</p>
            <h4>Cross BU outputs</h4>
          </div>
          <div class="decision-artifact-button-grid">
            ${crossBuActions.map(([label, href]) => `<a class="icon-button primary" href="${href}"><svg><use href="#icon-arrow"></use></svg><span>${escapeHtml(label)}</span></a>`).join("")}
          </div>
        </article>
      </div>
      <div id="decision-artifact-detail">
        ${renderDecisionArtifactsTable(models)}
      </div>
    </section>
  `;
}
