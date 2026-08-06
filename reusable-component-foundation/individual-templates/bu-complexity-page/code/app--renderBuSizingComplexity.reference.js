/* Reference extract: renderBuSizingComplexity(...) from app/src/app.js:10840-10939. */

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
