/* Reference extract: renderBuNumericComplexityControl(...) from app/src/app.js:11046-11057. */

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
