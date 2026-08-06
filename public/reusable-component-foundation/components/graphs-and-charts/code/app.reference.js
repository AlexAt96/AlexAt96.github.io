/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

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

function renderReportPieVisual({ eyebrow = "Visual summary", title = "Distribution", rows = [], totalLabel = "Total", emptyMessage = "No data captured yet.", variant = "" } = {}) {
  const chartRows = rows.filter((row) => Number(row.value || 0) > 0);
  const total = chartRows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  if (!chartRows.length || total <= 0) {
    return `<section class="dbu-chart-panel report-chart-panel"><div class="empty-state compact"><strong>${escapeHtml(emptyMessage)}</strong></div></section>`;
  }
  let running = 0;
  const slices = chartRows.map((row, index) => {
    const start = running;
    const end = running + (Number(row.value || 0) / total) * 100;
    running = end;
    return renderReportPieSlice({ ...row, color: row.color || getReportChartColor(index) }, start, end, total);
  }).join("");
  return `
    <section class="dbu-chart-panel report-chart-panel report-pie-panel ${variant ? `report-pie-${escapeHtml(variant)}` : ""}">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="dbu-pie-layout report-pie-layout">
        <svg class="dbu-pie-chart" viewBox="0 0 220 220" role="img" aria-label="${escapeHtml(title)}">
          <circle cx="110" cy="110" r="82" class="dbu-pie-track"></circle>
          ${slices}
          <circle cx="110" cy="110" r="48" class="dbu-pie-core"></circle>
          <text x="110" y="104" class="dbu-pie-core-label">${escapeHtml(totalLabel)}</text>
          <text x="110" y="126" class="dbu-pie-core-value">${escapeHtml(formatNumber(total))}</text>
        </svg>
        <div class="dbu-pie-legend report-chart-legend">
          ${chartRows.map((row, index) => {
            const color = row.color || getReportChartColor(index);
            const pct = total > 0 ? roundPercent((Number(row.value || 0) / total) * 100) : 0;
            return `
              <div class="dbu-legend-row report-legend-row"${row.buId ? ` data-dbu-bu="${escapeHtml(row.buId)}"` : ""}>
                <span class="dbu-legend-swatch" style="--dbu-color: ${escapeHtml(color)}"></span>
                <span>${escapeHtml(row.label)}</span>
                <strong>${formatNumber(row.value)} (${pct}%)</strong>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderReportPieSlice(row, startPct, endPct, total) {
  const start = polarToCartesian(110, 110, 82, percentageToAngle(startPct));
  const end = polarToCartesian(110, 110, 82, percentageToAngle(endPct));
  const largeArc = endPct - startPct > 50 ? 1 : 0;
  const path = `M 110 110 L ${start.x} ${start.y} A 82 82 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  const pct = total > 0 ? roundPercent((Number(row.value || 0) / total) * 100) : 0;
  return `<path class="dbu-pie-slice" d="${path}" fill="${escapeHtml(row.color)}"${row.buId ? ` data-dbu-bu="${escapeHtml(row.buId)}"` : ""} tabindex="0" role="img" aria-label="${escapeHtml(`${row.label}: ${formatNumber(row.value)} (${pct}%)`)}"></path>`;
}

function renderReportBarVisual({ eyebrow = "Visual summary", title = "Distribution", rows = [], valueSuffix = "", emptyMessage = "No data captured yet.", maxRows = 8 } = {}) {
  const chartRows = rows.filter((row) => Number(row.value || 0) > 0).slice(0, maxRows);
  const maxValue = Math.max(1, ...chartRows.map((row) => Number(row.value || 0)));
  if (!chartRows.length) {
    return `<section class="dbu-chart-panel report-chart-panel"><div class="empty-state compact"><strong>${escapeHtml(emptyMessage)}</strong></div></section>`;
  }
  return `
    <section class="dbu-chart-panel report-chart-panel report-bar-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="report-bar-list">
        ${chartRows.map((row, index) => {
          const value = Number(row.value || 0);
          const width = Math.max(4, Math.round((value / maxValue) * 100));
          const color = row.color || getReportChartColor(index);
          return `
            <div class="report-bar-row"${row.buId ? ` data-dbu-bu="${escapeHtml(row.buId)}"` : ""}>
              <span class="report-bar-label">
                <strong>${escapeHtml(row.label)}</strong>
                ${row.detail ? `<small>${escapeHtml(row.detail)}</small>` : ""}
              </span>
              <span class="report-bar-track" aria-label="${escapeHtml(`${row.label}: ${formatNumber(value)}${valueSuffix}`)}">
                <i style="width: ${width}%; --report-bar-color: ${escapeHtml(color)}"></i>
              </span>
              <strong>${formatNumber(value)}${escapeHtml(valueSuffix)}</strong>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderMetadataBarChart(title = "Metadata distribution", rows = []) {
  const cleanRows = rows.filter((row) => Number(row.value || 0) > 0);
  const max = Math.max(...cleanRows.map((row) => Number(row.value || 0)), 1);
  return `
    <div class="metadata-chart-panel">
      <div class="metadata-chart-heading">
        <p class="eyebrow">Graph</p>
        <h4>${escapeHtml(title)}</h4>
      </div>
      <div class="bar-list metadata-bar-chart">
        ${cleanRows.length ? cleanRows.map((row) => {
          const value = Number(row.value || 0);
          const width = Math.max(4, Math.round((value / max) * 100));
          return `
            <div class="bar-row metadata-bar-row">
              <span>${escapeHtml(row.label)}</span>
              <span class="bar-track"><span class="bar-fill" style="width:${width}%"></span></span>
              <strong>${escapeHtml(`${formatNumber(value)}${row.suffix || ""}`)}</strong>
            </div>
          `;
        }).join("") : `<p class="small-note">No rows available for this chart yet.</p>`}
      </div>
    </div>
  `;
}

function renderAdvancedDiscoveryPieChart({ eyebrow, title, rows = [], centreLabel = "Total" }) {
  const chartRows = getAdvancedDiscoveryChartRows(rows);
  if (!chartRows.length) return renderAdvancedDiscoveryEmptyChart(title);
  let running = 0;
  const slices = chartRows.map((row) => {
    const start = running;
    const end = running + row.percent;
    running = end;
    return renderAdvancedDiscoveryPieSlice(row, start, end);
  }).join("");
  const total = chartRows.reduce((sum, row) => sum + row.value, 0);
  const suffix = chartRows.find((row) => row.suffix)?.suffix || "";
  return `
    <section class="dbu-chart-panel advanced-discovery-chart-panel advanced-discovery-pie-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="dbu-pie-layout advanced-discovery-pie-layout">
        <svg class="dbu-pie-chart" viewBox="0 0 220 220" role="img" aria-label="${escapeHtml(title)}">
          <circle cx="110" cy="110" r="82" class="dbu-pie-track"></circle>
          ${slices}
          <circle cx="110" cy="110" r="48" class="dbu-pie-core"></circle>
          <text x="110" y="104" class="dbu-pie-core-label">${escapeHtml(centreLabel)}</text>
          <text x="110" y="126" class="dbu-pie-core-value">${escapeHtml(`${formatNumber(total)}${suffix}`)}</text>
        </svg>
        <div class="dbu-pie-legend advanced-discovery-legend">
          ${chartRows.map((row) => `
            <div class="dbu-legend-row advanced-discovery-legend-row">
              <span class="dbu-legend-swatch" style="--dbu-color: ${escapeHtml(row.color)}"></span>
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(formatAdvancedDiscoveryChartValue(row))}</strong>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderAdvancedDiscoveryDistributionChart({ eyebrow, title, rows = [] }) {
  const chartRows = getAdvancedDiscoveryChartRows(rows);
  if (!chartRows.length) return renderAdvancedDiscoveryEmptyChart(title);
  return `
    <section class="dbu-chart-panel advanced-discovery-chart-panel advanced-discovery-distribution-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="dbu-split-list advanced-discovery-split-list">
        ${chartRows.map((row) => `
          <div class="dbu-split-row advanced-discovery-split-row">
            <span class="dbu-split-label">
              <strong>${escapeHtml(row.label)}</strong>
              <small>${escapeHtml(`${formatAdvancedDiscoveryChartPercent(row.percent)}% of visible rows`)}</small>
            </span>
            <span class="dbu-stacked-bar" aria-label="${escapeHtml(`${row.label}: ${formatAdvancedDiscoveryChartValue(row)}`)}">
              <span class="advanced-discovery-stacked-segment" style="width: ${Math.max(3, row.percent)}%; background: ${escapeHtml(row.color)}"></span>
            </span>
            <span class="dbu-split-values advanced-discovery-split-values">
              <span>${escapeHtml(formatAdvancedDiscoveryChartValue(row))}</span>
            </span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCostBuComparisonChart(model) {
  return `
    <section class="dbu-chart-panel cost-chart-panel cost-bu-comparison-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${model.crossBu ? "Cross-BU comparison" : "BU value profile"}</p>
          <h3>${model.crossBu ? "Five-year savings, migration cost and net five-year savings" : `${escapeHtml(model.rows[0]?.bu.name || "BU")} cost position`}</h3>
        </div>
      </div>
      <div class="cost-bu-comparison-list">
        ${model.rows.map((row) => renderCostBuComparisonRow(row, model.maxComparisonValue)).join("")}
      </div>
      <div class="cost-chart-legend">
        <span><i class="saving"></i>Five-year savings</span>
        <span><i class="migration"></i>Migration cost</span>
        <span><i class="net"></i>Net five-year savings</span>
      </div>
    </section>
  `;
}

function renderCostBridgeChart(model) {
  return `
    <section class="dbu-chart-panel cost-chart-panel cost-bridge-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Five-year bridge</p>
          <h3>${model.crossBu ? "Programme value bridge" : "BU value bridge"}</h3>
        </div>
      </div>
      <div class="cost-bridge-list">
        ${model.bridgeRows.map((row) => renderCostBridgeRow(row, model.maxBridgeValue)).join("")}
      </div>
      <div class="cost-bridge-summary">
        <span><small>Five-year savings</small><strong>${formatCurrency(model.totals.fiveYearSavings)}</strong></span>
        <span><small>Net five-year savings</small><strong>${formatCurrency(model.totals.netSavings)}</strong></span>
      </div>
    </section>
  `;
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
