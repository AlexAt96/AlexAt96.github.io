/* Reference extract: renderBuComplexityFactorControl(...) from app/src/app.js:11030-11044. */

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
