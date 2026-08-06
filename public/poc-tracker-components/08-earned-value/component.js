(function (global) {
  const sample = {
    title: "Delivery performance forecast",
    reference: "Transformation portfolio",
    baselineLabel: "Approved baseline · Version 1",
    reportingLabel: "Reporting period 7 of 12",
    unit: "budget units",
    bac: 240,
    plannedPercent: 68,
    earnedPercent: 59,
    actualCost: 158,
    period: 7,
    totalPeriods: 12,
    assumption: "The forecast uses the current CPI for the remaining work, in line with the agreed reporting method.",
    workPackages: [
      { label: "Discovery", budget: 40, planned: 40, earned: 40, actual: 38, status: "Complete" },
      { label: "Data", budget: 65, planned: 52, earned: 45, actual: 54, status: "In progress" },
      { label: "Services", budget: 75, planned: 48, earned: 38, actual: 46, status: "In progress" },
      { label: "Experience", budget: 60, planned: 24, earned: 19, actual: 20, status: "Not started" }
    ]
  };
  const presets = {
    "On plan": { plannedPercent: 65, earnedPercent: 66, actualCost: 154, period: 7 },
    "Schedule pressure": { plannedPercent: 72, earnedPercent: 58, actualCost: 148, period: 7 },
    "Cost pressure": { plannedPercent: 68, earnedPercent: 62, actualCost: 176, period: 7 }
  };
  const round = (value, digits = 1) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));

  function calculate(input) {
    const bac = Number(input.bac) || 0;
    const pv = bac * (Number(input.plannedPercent) || 0) / 100;
    const ev = bac * (Number(input.earnedPercent) || 0) / 100;
    const ac = Number(input.actualCost) || 0;
    const sv = ev - pv;
    const cv = ev - ac;
    const spi = pv ? ev / pv : 0;
    const cpi = ac ? ev / ac : 0;
    const eac = cpi ? bac / cpi : 0;
    return { bac, pv, ev, ac, sv, cv, spi, cpi, eac, etc: eac - ac, vac: bac - eac };
  }

  function mount(root, initialInput = sample, options = {}) {
    let input = { ...sample, ...initialInput, workPackages: [...(initialInput.workPackages || sample.workPackages)].map((item) => ({ ...item })) };
    root.innerHTML = `<section class="evm"><header class="evm-heading"><div><p class="poc-eyebrow">Cost and schedule control</p><h1 data-title></h1><p class="poc-muted"><span data-reference></span> · <span data-baseline></span></p></div><div class="evm-presets"><span>Explore scenarios</span>${Object.keys(presets).map((name) => `<button class="poc-button" type="button" data-preset="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}</div></header><p class="poc-sr-only" data-status aria-live="polite"></p><section class="evm-layout"><form class="poc-panel evm-inputs" data-form><div class="poc-panel__header"><div><h2>Planning inputs</h2><p>Adjust the approved baseline and current reporting values.</p></div></div><label class="poc-field">View title<input name="title" type="text"></label><label class="poc-field">Portfolio or project<input name="reference" type="text"></label><label class="poc-field">Baseline label<input name="baselineLabel" type="text"></label><label class="poc-field">Reporting label<input name="reportingLabel" type="text"></label><label class="poc-field">Unit<select name="unit"><option>budget units</option><option>hours</option><option>cost units</option><option>story points</option></select></label><label class="poc-field">Budget at completion<input name="bac" type="number" min="1"></label><label class="poc-field">Planned complete (%)<input name="plannedPercent" type="number" min="0" max="100"></label><label class="poc-field">Earned complete (%)<input name="earnedPercent" type="number" min="0" max="100"></label><label class="poc-field">Actual cost or effort<input name="actualCost" type="number" min="0"></label><div class="evm-periods"><label class="poc-field">Current period<input name="period" type="number" min="1"></label><label class="poc-field">Total periods<input name="totalPeriods" type="number" min="1"></label></div><label class="poc-field">Forecast assumption<textarea name="assumption" rows="4"></textarea></label><div class="evm-input-actions"><button class="poc-button" type="button" data-reset>Reset values</button><button class="poc-button" type="button" data-export>Download scenario</button></div></form><div class="poc-stack"><section class="evm-kpis" data-kpis></section><article class="poc-panel evm-chart"><div class="poc-panel__header"><div><h2>Performance curve</h2><p data-chart-summary></p></div></div><svg class="evm-svg" data-chart viewBox="0 0 720 270" role="img"></svg><div class="evm-legend"><span><i style="background:var(--info)"></i>Planned value</span><span><i style="background:var(--success)"></i>Earned value</span><span><i style="background:var(--warning)"></i>Actual cost or effort</span></div></article><aside class="poc-panel evm-explain" data-explain></aside><article class="poc-panel evm-breakdown"><div class="poc-panel__header"><div><h2>Work package detail</h2><p>Planned, earned and actual values for each area of delivery.</p></div></div><div class="evm-table-wrap"><table><thead><tr><th>Work package</th><th>Budget</th><th>Planned</th><th>Earned</th><th>Actual</th><th>Status</th></tr></thead><tbody data-packages></tbody></table></div></article></div></section></section>`;
    const form = root.querySelector("[data-form]");

    function valueLabel(value) { return `${round(value)} ${input.unit}`; }
    function indexTone(value) { return value >= 1 ? "good" : value >= 0.9 ? "warn" : "bad"; }
    function setFormValues() {
      ["title", "reference", "baselineLabel", "reportingLabel", "unit", "bac", "plannedPercent", "earnedPercent", "actualCost", "period", "totalPeriods", "assumption"].forEach((name) => { if (form.elements[name]) form.elements[name].value = input[name] ?? ""; });
    }
    function render() {
      const result = calculate(input);
      setFormValues();
      root.querySelector("[data-title]").textContent = input.title;
      root.querySelector("[data-reference]").textContent = input.reference;
      root.querySelector("[data-baseline]").textContent = input.baselineLabel;
      root.querySelector("[data-kpis]").innerHTML = [
        ["Planned value (PV)", valueLabel(result.pv), `${input.plannedPercent}% of baseline`, "good"],
        ["Earned value (EV)", valueLabel(result.ev), `${input.earnedPercent}% evidenced complete`, indexTone(result.spi)],
        ["Actual (AC)", valueLabel(result.ac), "Recorded to date", indexTone(result.cpi)],
        ["Schedule variance (SV)", valueLabel(result.sv), result.sv >= 0 ? "At/ahead of plan" : "Behind plan", indexTone(result.spi)],
        ["Schedule index (SPI)", round(result.spi, 2), "EV ÷ PV", indexTone(result.spi)],
        ["Cost variance (CV)", valueLabel(result.cv), result.cv >= 0 ? "Favourable" : "Unfavourable", indexTone(result.cpi)],
        ["Cost index (CPI)", round(result.cpi, 2), "EV ÷ AC", indexTone(result.cpi)],
        ["Forecast (EAC)", valueLabel(result.eac), `Variance at completion ${valueLabel(result.vac)}`, indexTone(result.cpi)]
      ].map(([label, value, note, tone]) => `<article class="evm-kpi" data-tone="${tone}"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
      const width = 680, height = 220, startX = 20, bottom = 245;
      const period = Math.max(1, Math.min(Number(input.totalPeriods), Number(input.period)));
      const total = Math.max(period, Number(input.totalPeriods) || 1);
      const maxValue = Math.max(result.bac, result.eac, result.ac, 1) * 1.1;
      const point = (p, value) => `${startX + p / total * width},${bottom - value / maxValue * height}`;
      const plannedAt = (p) => p <= period ? result.pv * p / period : result.pv + (result.bac - result.pv) * (p - period) / Math.max(1, total - period);
      const plannedPoints = Array.from({ length: total + 1 }, (_, p) => point(p, plannedAt(p)));
      const earnedPoints = Array.from({ length: period + 1 }, (_, p) => point(p, result.ev * p / period));
      const actualPoints = Array.from({ length: period + 1 }, (_, p) => point(p, result.ac * p / period));
      root.querySelector("[data-chart]").innerHTML = `<g>${[25,80,135,190,245].map((y) => `<line class="evm-gridline" x1="20" x2="700" y1="${y}" y2="${y}"/>`).join("")}</g><polyline class="evm-planned" points="${plannedPoints.join(" ")}"/><polyline class="evm-earned" points="${earnedPoints.join(" ")}"/><polyline class="evm-actual" points="${actualPoints.join(" ")}"/><circle class="evm-dot" stroke="var(--info)" cx="${plannedPoints[period].split(",")[0]}" cy="${plannedPoints[period].split(",")[1]}" r="6"/><circle class="evm-dot" stroke="var(--success)" cx="${earnedPoints[period].split(",")[0]}" cy="${earnedPoints[period].split(",")[1]}" r="6"/><circle class="evm-dot" stroke="var(--warning)" cx="${actualPoints[period].split(",")[0]}" cy="${actualPoints[period].split(",")[1]}" r="6"/>`;
      root.querySelector("[data-chart]").setAttribute("aria-label", `At period ${period}, planned value is ${valueLabel(result.pv)}, earned value is ${valueLabel(result.ev)}, and actual is ${valueLabel(result.ac)}.`);
      root.querySelector("[data-chart-summary]").textContent = `${input.reportingLabel} · ${input.unit}`;
      const scheduleText = result.spi >= 1 ? "Delivery is at or ahead of the baseline position." : `Delivery has earned ${valueLabel(Math.abs(result.sv))} less value than planned.`;
      const costText = result.cpi >= 1 ? "The earned position is efficient against actual input." : `Actual input exceeds earned value by ${valueLabel(Math.abs(result.cv))}.`;
      root.querySelector("[data-explain]").innerHTML = `<p class="poc-eyebrow">Plain-language reading</p><h2>${result.spi >= 1 && result.cpi >= 1 ? "Position is healthy" : "Position needs attention"}</h2><p>${scheduleText}</p><p>${costText}</p><p><strong>Forecast:</strong> ${valueLabel(result.eac)} at completion; ${valueLabel(result.etc)} remains.</p><p><strong>Assumption:</strong> ${escapeHtml(input.assumption)}</p>`;
      root.querySelector("[data-packages]").innerHTML = input.workPackages.map((item) => `<tr><th>${escapeHtml(item.label)}</th><td>${escapeHtml(item.budget)}</td><td>${escapeHtml(item.planned)}</td><td>${escapeHtml(item.earned)}</td><td>${escapeHtml(item.actual)}</td><td><span class="poc-pill">${escapeHtml(item.status)}</span></td></tr>`).join("");
      options.onChange?.({ input: { ...input, workPackages: input.workPackages.map((item) => ({ ...item })) }, ...result });
    }

    form.addEventListener("input", () => {
      const values = Object.fromEntries(new FormData(form));
      input = { ...input, ...values, bac: Number(values.bac), plannedPercent: Number(values.plannedPercent), earnedPercent: Number(values.earnedPercent), actualCost: Number(values.actualCost), period: Number(values.period), totalPeriods: Number(values.totalPeriods) };
      render();
    });
    root.addEventListener("click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { input = { ...input, ...presets[preset.dataset.preset] }; root.querySelector("[data-status]").textContent = `${preset.dataset.preset} scenario applied.`; render(); }
      if (event.target.closest("[data-reset]")) { input = { ...sample, workPackages: sample.workPackages.map((item) => ({ ...item })) }; root.querySelector("[data-status]").textContent = "Planning values reset."; render(); }
      if (event.target.closest("[data-export]")) {
        if (options.onExport) options.onExport({ ...input });
        else {
          const blob = new Blob([JSON.stringify(input, null, 2)], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob); link.download = "earned-value-scenario.json"; link.click(); URL.revokeObjectURL(link.href);
        }
        root.querySelector("[data-status]").textContent = "Scenario downloaded.";
      }
    });
    render();
    return {
      setInput(next) { input = { ...input, ...next, workPackages: next.workPackages ? next.workPackages.map((item) => ({ ...item })) : input.workPackages }; render(); },
      setData(next) { input = { ...sample, ...next, workPackages: [...(next.workPackages || sample.workPackages)].map((item) => ({ ...item })) }; render(); },
      getData() { return { ...input, workPackages: input.workPackages.map((item) => ({ ...item })) }; },
      calculate: () => calculate(input),
      destroy() { root.innerHTML = ""; }
    };
  }

  global.EarnedValue = { mount, calculate, sample, presets };
})(window);
