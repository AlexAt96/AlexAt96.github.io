/* Reference extracts from app/src/app.js. See the full source snapshot for surrounding context. */

function renderBuSizingComplexity(phase, item, bu = getSelectedBu()) {
  const assessment = getBuSizingAssessmentModel(bu);
  const saveButton = `
    <button class="icon-button primary" type="submit">
      <svg><use href="#icon-save"></use></svg>
      <span>Save BU sizing</span>
    </button>
  `;
  return `
    ${detailHeader("BU sizing and complexity scoring", "The team member assesses data size, migration complexity, and the resulting effort score for the selected BU.")}
    <form id="buSizingAssessmentForm" class="bu-sizing-form" data-business-unit-id="${escapeHtml(bu.id)}">
      <section class="panel bu-sizing-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">1 / Data size</p>
            <h3>${escapeHtml(bu.name)} data footprint</h3>
          </div>
          <div class="bu-sizing-result" data-size-readout>
            <span class="status-pill ${statusClassForSizeBand(assessment.sizeBand)}" data-size-band>${escapeHtml(assessment.sizeBand)}</span>
            <strong data-size-score>${assessment.sizeScore}</strong>
            <small>Size score</small>
            <button class="icon-button ghost bu-sizing-update-size" type="button">
              <svg><use href="#icon-reset"></use></svg>
              <span>Update</span>
            </button>
          </div>
        </div>
        <div class="bu-sizing-input-grid">
          <label>
            <span>Total data size (TB)</span>
            <input name="dataSizeTb" type="number" min="0" step="0.01" value="${escapeHtml(assessment.dataSizeTb)}" />
          </label>
          <label>
            <span>Table count</span>
            <input name="tableCount" type="number" min="0" step="1" value="${escapeHtml(assessment.tableCount)}" />
          </label>
          <div class="bu-sizing-readout">
            <span>Rule</span>
            <strong data-size-rule>${escapeHtml(assessment.sizeDefinition)}</strong>
          </div>
        </div>
        ${renderBandDefinitionTable("Size definitions", BU_SIZE_BANDS)}
      </section>

      <section class="panel bu-sizing-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">2 / Migration complexity</p>
            <h3>Complexity assessment</h3>
          </div>
          <div class="bu-sizing-result" data-complexity-readout>
            <span class="status-pill ${statusClassForComplexityBand(assessment.complexityBand)}" data-complexity-band>${escapeHtml(assessment.complexityBand)}</span>
            <span class="bu-sizing-score-line">
              <strong data-complexity-score>${assessment.complexityScore}</strong>
              <span class="pill"><span data-complexity-raw-points>${assessment.complexityPointTotal}</span> points</span>
            </span>
            <small>Complexity score</small>
            <button class="icon-button ghost bu-sizing-update-complexity" type="button">
              <svg><use href="#icon-reset"></use></svg>
              <span>Update</span>
            </button>
          </div>
        </div>
        <div class="bu-complexity-factor-grid">
          ${BU_COMPLEXITY_FACTORS.map((factor) => renderBuComplexityFactorControl(factor, assessment)).join("")}
          ${renderBuNumericComplexityControl("inScopeWorkspaces", "In-scope workspaces", "buInScopeWorkspaces", assessment.inScopeWorkspaces, assessment.inScopeWorkspacesScore, "Score: <6 = 0, >6 = 1, >20 = 2, >40 = 3")}
          ${renderBuCalculatedComplexityControl("sourceSinkCount", "Data sources and data sinks", "buSourceSinkCount", assessment.sourceSinkCount, assessment.sourceSinkScore, "Calculated from the BU source/consumer tracker. Source / Consumer rows count as 2.")}
          <section class="bu-complexity-factor-card">
            <div>
              <span class="field-label">ADF sizing</span>
              <strong>${escapeHtml(assessment.adfBand)}</strong>
              <small>Based on ADF complexity analysis</small>
            </div>
            <span class="pill">${assessment.adfScore} pts</span>
          </section>
        </div>
        ${renderBandDefinitionTable("Complexity definitions", BU_COMPLEXITY_BANDS)}
      </section>

      <section class="panel bu-sizing-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">3 / Effort output</p>
            <h3>Calculated migration effort</h3>
          </div>
          ${saveButton}
        </div>
        <div class="bu-sizing-output-grid">
          <div><span>Size</span><strong data-size-output-band>${escapeHtml(assessment.sizeBand)}</strong><small><span data-size-output-score>${assessment.sizeScore}</span> pts</small></div>
          <div><span>Complexity</span><strong data-complexity-output-band>${escapeHtml(assessment.complexityBand)}</strong><small><span data-complexity-output-score>${assessment.complexityScore}</span> pts from ${assessment.complexityPointTotal} raw points</small></div>
          <div><span>Effort</span><strong data-effort-score>${assessment.effortScore}</strong><small>Size score x complexity score</small></div>
        </div>
        <div class="form-actions">
          <p class="small-note" id="buSizingAssessmentStatus">Saving updates the BU sizing, complexity, and effort values used by RICE and outputs.</p>
          ${saveButton}
        </div>
      </section>
    </form>
  `;
}

function renderBuComplexityFactorControl(factor, assessment) {
  const value = assessment.factorSelections[factor.key];
  const score = getComplexityFactorScore(factor, value);
  return `
    <label class="bu-complexity-factor-card">
      <span>
        <span class="field-label">${escapeHtml(factor.label)}</span>
        <select name="${escapeHtml(factor.field)}" data-complexity-factor="${escapeHtml(factor.key)}">
          ${factor.options.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === value ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
        </select>
      </span>
      <span class="pill" data-complexity-factor-score="${escapeHtml(factor.key)}">${score} pts</span>
    </label>
  `;
}

function renderBuNumericComplexityControl(key, label, fieldName, value, score, note) {
  return `
    <label class="bu-complexity-factor-card">
      <span>
        <span class="field-label">${escapeHtml(label)}</span>
        <input name="${escapeHtml(fieldName)}" data-complexity-factor="${escapeHtml(key)}" type="number" min="0" step="1" value="${escapeHtml(value)}" />
        <small>${escapeHtml(note)}</small>
      </span>
      <span class="pill" data-complexity-factor-score="${escapeHtml(key)}">${score} pts</span>
    </label>
  `;
}

function renderBuCalculatedComplexityControl(key, label, fieldName, value, score, note) {
  return `
    <section class="bu-complexity-factor-card">
      <div>
        <span class="field-label">${escapeHtml(label)}</span>
        <strong data-complexity-calculated-value="${escapeHtml(key)}">${escapeHtml(value)}</strong>
        <input name="${escapeHtml(fieldName)}" data-complexity-factor="${escapeHtml(key)}" type="hidden" value="${escapeHtml(value)}" />
        <small>${escapeHtml(note)}</small>
      </div>
      <span class="pill" data-complexity-factor-score="${escapeHtml(key)}">${score} pts</span>
    </section>
  `;
}

function calculateBuSizeBand(dataSizeTb, tableCount) {
  if (dataSizeTb > 15 || tableCount > 2500) return BU_SIZE_BANDS[4];
  if (dataSizeTb > 10 || tableCount > 2000) return BU_SIZE_BANDS[3];
  if (dataSizeTb > 0.5 || tableCount > 500) return BU_SIZE_BANDS[2];
  if (dataSizeTb > 0.25 || tableCount > 100) return BU_SIZE_BANDS[1];
  return BU_SIZE_BANDS[0];
}

function calculateBuComplexityBand(score) {
  return BU_COMPLEXITY_BANDS.find((band) => score >= band.min && score <= band.max) || BU_COMPLEXITY_BANDS[BU_COMPLEXITY_BANDS.length - 1];
}

function getComplexityFactorScore(factor, value) {
  return Number(factor.options.find((option) => option.value === value)?.score || 0);
}

function getBuSizingAdfBand(score) {
  if (score <= 0) return "Very Low";
  if (score < 1000) return "Low";
  if (score < 10000) return "Medium";
  if (score < 20000) return "Large";
  return "Extra Large";
}

function getBuSizingAdfScore(band) {
  return {
    "Very Low": 1,
    Low: 2,
    Medium: 3,
    Large: 4,
    "Extra Large": 5,
  }[band] || 1;
}

function renderBandDefinitionTable(title, rows) {
  return `
    <div class="data-table-wrap bu-sizing-definition-wrap">
      <table class="data-table bu-sizing-definition-table">
        <caption>${escapeHtml(title)}</caption>
        <thead><tr><th>Band</th>${rows.some((row) => row.score) ? "<th>Score</th>" : ""}<th>Definition</th></tr></thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td class="bu-sizing-band-cell ${escapeHtml(row.className)}">${escapeHtml(row.band)}</td>
              ${rows.some((item) => item.score) ? `<td>${escapeHtml(row.score)}</td>` : ""}
              <td>${escapeHtml(row.definition)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function getRiceScoreLineageTooltip(bu, rice = getRiceScoringModel(bu)) {
  const sizing = getBuSizingAssessmentModel(bu);
  const sourceCount = formatNumber(sizing.sourceSinkCount || 0);
  return [
    getRiceScoreFormulaText(),
    `Current inputs: Reach ${formatNumber(rice.reachScore)}, Impact ${formatNumber(rice.impactScore)}, Confidence ${formatNumber(rice.confidenceScore)}, Effort ${formatNumber(rice.effortScore)}.`,
    "Reach and Impact source: Team Analysis RICE scoring, using the agreed Tool Metadata Setup definitions.",
    "Confidence source: Team Analysis RICE scoring, informed by UCD RICE confidence and migration posture inputs.",
    `Effort source: BU sizing and complexity scoring; Effort ${formatNumber(rice.effortScore)} = Size score ${formatNumber(sizing.sizeScore)} x Complexity score ${formatNumber(sizing.complexityScore)}.`,
    "Size lineage: production data size and table count from BU sizing.",
    `Complexity lineage: governance, criticality, tooling, in-scope workspace count, ${sourceCount} source/sink rows, and ADF complexity.`,
    "Dependency lineage: source/consumer tracker feeds the source/sink count and dependency context.",
  ].join(" ");
}
